---
title: AI に同じ変更を 54 回させて、設計ごとの差を測る ── 3 構成・6 課題・隠しテスト・Runner と Evaluator の分離
date: 2026-10-20
description: 同じ TypeScript / Fastify の API を monolithic・layered・feature-based の 3 構成で書き、gpt-5.6-terra に 6 つの変更課題を 3 回ずつ解かせた ai-readable-code-lab の中身です。構成ごとのファイル、実行順の固定、隠しテストの隔離、評価 JSON、54 回分の結果を生データから集計し直し、失敗の内訳と、評価の側にあった穴まで書きます。
tags: [AI, 設計, TypeScript, Fastify, Vitest, コーディングエージェント]
type: tech
---

> これは技術編です。何を確かめたくて、結果をどう受け止めたかを読みやすくまとめた読みもの版は「[人間に読みやすい設計は、AI にも変更しやすいのか ── 3 つの構成で 54 回試した](/blog/ai-readable-code)」にあります。

ai-readable-code-lab は、**人間に読みやすい設計が、AI にとっても変更しやすいのか** を同じ条件で比べるための実験リポジトリです。この記事では、Phase 1（設計構造の比較）を、リポジトリの `main`（HEAD は 342e50c）と、各実験ブランチに保存した評価の生データから順に追います。

表の数字は、54 回分の `metadata.json` と `evaluation.json` を自分で読み直して集計したものです。リポジトリの集計（`results/summaries/main-experiment-summary.json`）とは一致しましたが、生データとドキュメントのあいだにはいくつか食い違いがあったので、最後にまとめて書きます。

## 問いと、実験前に置いた仮説

計画書 `docs/PROJECT_PLAN.md` で置いた問いは 1 つです。

> 同じ機能を持つコードでも、ファイル構成や責務の分け方によって、AI のコード変更精度は変化するのか。

仮説は実験前に 5 つ書いていました。

| 仮説 | 内容 |
| --- | --- |
| A | 局所的で単純な変更では、1 ファイル構成が有利 |
| B | 複数の責務を横断する変更では、レイヤー分割が有利 |
| C | レイヤーを細かく分けすぎると、関連ファイルの見落としで実装漏れが増える |
| D | 機能単位構成が、総合的に最も安定する |
| E | 大事なのはファイル数ではなく、必要な情報を低コストで見つけられること |

計画書には「これらは実験前の仮説であり、結果に合わせて変更してはならない」とも書いています。先に答えを言うと、54 回のデータでは **どの仮説も支持も棄却もできませんでした**。理由は、この記事の後半に書きます。

## 題材：タスク管理 API

3 構成とも、Node 22・TypeScript・Fastify・Vitest で、データはメモリ上の `Map` です。外部 DB・認証・ネットワークは使いません。公開している API は `docs/COMMON_SPEC.md` で決めています。

| Method | Path | 成功 | 失敗 |
| --- | --- | --- | --- |
| POST | `/tasks` | 201 | 空タイトルは 400 |
| GET | `/tasks` | 200（ARCHIVED を除外） | - |
| GET | `/tasks/:id` | 200 | 未存在は 404 |
| PATCH | `/tasks/:id` | 200 | 空タイトル 400、未存在 404、存在しない担当者 404 |
| POST | `/tasks/:id/complete` | 200 | 二重完了 409、未存在 404 |
| DELETE | `/tasks/:id` | 204 | 未存在 404 |

担当者は `user-1` と `user-2` だけが存在します。期限が過去なら、レスポンスの `warnings` に `'due date is in the past'` が入ります（保存は拒否しません）。

3 構成が同じ動きをすることは、`phase1-architecture/contracts/task-api-contract.ts` の **共有契約テスト** で確かめています。1 つのテスト関数を、3 構成の `buildApp` にそれぞれ渡して実行する作りです。

## 3 つの構成

課題 02〜06 の出発点にした Baseline `v1.0.1`（4ae1304）のファイルと行数です。

### monolithic

```text
phase1-architecture/monolithic/
├── src/app.ts          84 行（型・保存・判定・ルートをすべて）
└── tests/app.test.ts   21 行
```

`buildApp()` の中に、`Map`、連番、時刻、判定、ルートが全部入っています。期限切れの判定とレスポンスの組み立ても、ここに並んでいます。

```ts
// phase1-architecture/monolithic/src/app.ts（v1.0.1）
const isOverdue = (task: Task) => Boolean(task.dueDate && task.dueDate < now().slice(0, 10));
const response = (task: Task) => ({
  ...task,
  isOverdue: isOverdue(task),
  warnings: task.dueDate && task.dueDate < now().slice(0, 10) ? ['due date is in the past'] : [],
});
```

### layered

```text
phase1-architecture/layered/
├── src/
│   ├── domain.ts       15 行（Task 型と isOverdue）
│   ├── repository.ts   21 行（Map と連番）
│   ├── service.ts      73 行（業務ルール。失敗は Error を throw）
│   └── app.ts          61 行（HTTP。Error を status に変換）
└── tests/app.test.ts   14 行
```

計画書では `presentation/controllers` や `application/usecases` まで分けた深い構成を描いていましたが、実際に作ったのは 4 ファイルの平らな分割です。

この構成の特徴は、service が投げた `Error` を、app 側で **メッセージの文字列** を見て HTTP のステータスに振り分けていることです。

```ts
// phase1-architecture/layered/src/app.ts（v1.0.1）
} catch (e) {
  const message = (e as Error).message;
  return reply.code(message === 'title is required' ? 400 : 404).send({ error: message });
}
```

新しい失敗を足すときは、service の `throw` と app の振り分けを、同じ文字列で揃える必要があります。課題 02 では、layered の 3 回とも `service.ts` と `app.ts` の両方を直していました。

### feature-based

```text
phase1-architecture/feature-based/
├── src/
│   ├── app.ts                 7 行（registerTaskRoutes を呼ぶだけ）
│   └── tasks/
│       ├── task.ts           20 行（Task 型と asResponse）
│       ├── repository.ts     19 行
│       └── routes.ts         72 行（全ルートと業務ルール）
└── tests/app.test.ts          14 行
```

業務ルールは `routes.ts` の各ハンドラーに直接書いてあります。計画書の `tasks/create/`、`tasks/update/` のような操作ごとのフォルダまでは分けていません。

3 構成とも、**とても小さい** ことは先に強調しておきます。いちばん大きい monolithic でも本体は 84 行です。

## 6 つの課題

課題文は `tasks/phase1/task-0X-*/prompt.md` に、仕様と期待動作は `specification.md` と `expected-behavior.md` にあります。

| 課題 | 内容 | Baseline |
| --- | --- | --- |
| 01 | `category` を作成・更新・取得で扱う | v1.0.0 |
| 02 | 完了済みタスクの担当者変更を 409 で拒否する | v1.0.1 |
| 03 | 操作履歴を記録し `GET /tasks/:id/history` を足す | v1.0.1 |
| 04 | 完了済みタスクが期限切れになるバグを直す | v1.0.1 |
| 05 | DELETE を、200 と `ARCHIVED` を返すアーカイブに変える | v1.0.1 |
| 06 | `POST /tasks/:id/duplicate` で複製する（指示は少なめ） | v1.0.1 |

課題 01 だけは、履歴とアーカイブの実装が入った v1.0.0 から始めています。課題 02〜06 のために、それらを取り除いた v1.0.1 を別に固定しました。

課題文には、構成ごとの特別な指示を入れていません。たとえば課題 02 はこうです。

```text
完了済みタスクは担当者を変更できないようにしてください。

既存コードと公開テストを確認し、既存の設計と命名規則を維持してください。必要な範囲だけを変更し、テストを追加して、lint・型検査・テストを実行してください。
```

## ハーネス

### 実行順はシードで固定する

54 回の順番は、`scripts/generate-main-run-order.mjs` がシード `20260716` の線形合同法と Fisher–Yates で混ぜています。

```js
// scripts/generate-main-run-order.mjs
const seed = 20260716;
let state = seed;
const random = () => {
  state = (state * 1664525 + 1013904223) >>> 0;
  return state / 2 ** 32;
};
for (let index = conditions.length - 1; index > 0; index -= 1) {
  const swapIndex = Math.floor(random() * (index + 1));
  [conditions[index], conditions[swapIndex]] = [conditions[swapIndex], conditions[index]];
}
```

結果は `experiments/phase1-main-run-order.json` に書き出しています。評価の時刻を並べると、計画の順番から入れ替わったのは 16〜18 番目と 44〜47 番目の 2 か所だけでした。

### Runner と Evaluator を分ける

手順は `docs/MAIN_EXPERIMENT_EXECUTION.md` に書いています。

1. **Runner**：固定タグから専用の clone を作り、新しいセッションで、対象の構成・課題文・公開テストだけを渡す。`hidden-tests/`、`results/`、ほかの構成、Dry Run のブランチは渡さない
2. Runner が実装・テスト・`npm run validate`・コミットまでを行う。人間や親のエージェントはコードを直さない
3. **Evaluator**：別の clone・別のセッションで Runner のコミットを checkout し、隠しテストを入れて検証する
4. Evaluator は Runner のソースを直さない。直した場合は `humanCodeCorrections: true` を記録し、通常の集計から外す

作業報告書によると、Runner も Evaluator も Codex CLI のセッションです。`metadata.json` には 54 回すべて `"model": "gpt-5.6-terra"`、`"reasoningLevel": "medium"` と記録されています。評価の時刻は 2026-07-17 11:31 から 2026-07-20 00:07 です。

### 隠しテストは Git に入れない

隠しテストは `hidden-tests/` に置き、`.gitignore` で除外しています。通常の Vitest からも外します。

```ts
// vitest.config.ts
export default defineConfig({
  test: {
    exclude: ['hidden-tests/**', '**/node_modules/**', '**/dist/**'],
  },
});
```

Evaluator だけが `scripts/run-hidden-tests` を使います。課題と構成は許可リストで縛り、任意のパスは受け取りません。

```sh
# scripts/run-hidden-tests（抜粋）
case "$target" in
  monolithic|layered|feature-based) ;;
  *)
    echo "unsupported target: $target" >&2
    exit 64
    ;;
esac

test_file="hidden-tests/phase1/${task_id}.test.ts"
HIDDEN_TEST_TARGET="$target" npx vitest run --config hidden-tests/vitest.config.ts "$test_file" > "$result_file" 2>&1
```

保存された結果を見ると、隠しテストは **課題ごとに 1 つのテストケース** です（`hiddenTests.total` は 54 回すべて 1）。1 つのケースの中で複数のことを確かめていますが、通過か失敗かの 2 値になります。テスト本体はまだ公開していません。

### 変更量は git diff から取る

```sh
# scripts/collect-git-metrics
git diff --name-only "$baseline"...HEAD > "$output/changed-files.txt"
git diff --stat "$baseline"...HEAD > "$output/git-stat.txt"
git diff --binary "$baseline"...HEAD > "$output/changes.patch"
```

### 1 回ごとに残すもの

各実験ブランチ `experiment/p1/<構成>/<課題>/r0N` の `results/raw/<実験 ID>/` に、`metadata.json`、`evaluation.json`、`changes.patch`、`git-stat.txt`、`changed-files.txt`、公開テストと隠しテストの出力を残しています。評価 JSON はこういう形です。

```json
{
  "experimentId": "P1-FEATURE-BASED-T06-R01",
  "automatedChecks": {
    "build": null,
    "typecheck": false,
    "format": null,
    "lint": null,
    "publicTests": { "passed": 5, "total": 9 },
    "hiddenTests": { "passed": 0, "total": 1 }
  },
  "failureClassification": ["typecheck failure", "functional failure"]
}
```

`npm run validate` は `typecheck → format:check → lint → test → build` の順に `&&` でつないでいるので、途中で落ちると後ろは実行されず `null` になります。

## 指標

| 指標 | 定義 |
| --- | --- |
| 完全検証通過 | build・typecheck・format・lint がすべて `true`、公開テストと隠しテストが全件通過 |
| 隠しテスト通過 | 隠しテスト 1/1 |
| 公開テスト全通過 | `publicTests.passed === total` |
| 変更ファイル数・追加行・削除行 | Evaluator が記録した `metrics` の値 |

評価基準 `docs/EVALUATION_RULES.md` には 100 点満点の採点表（要件 25、隠しテスト 20、既存テスト維持 15、責務配置 10 など）がありますが、**54 回すべて `scores` は `null`** です。読んだファイル数、コマンド数、修正ループ数、トークン数も、54 回すべて `null` でした。計画にあった「探索コスト」は、今回は測れていません。

## 結果

### 構成別

| 構成 | 完全検証 | 隠しテスト | 公開テスト全通過 | 平均変更ファイル | 平均追加行 | 平均削除行 |
| --- | --- | --- | --- | --- | --- | --- |
| monolithic | 15/18（83.3%） | 18/18 | 15/18 | 2.28 | 62.8 | 2.61 |
| feature-based | 13/18（72.2%） | 16/18 | 14/18 | 3.11 | 61.7 | 2.11 |
| layered | 12/18（66.7%） | 18/18 | 12/18 | 4.06 | 68.0 | 2.78 |
| 全体 | 40/54（74.1%） | 52/54 | 41/54 | 3.15 | 64.2 | 2.50 |

課題 05 を除いた 45 回では、こうなります。

| 構成 | 完全検証 | 隠しテスト | 平均変更ファイル |
| --- | --- | --- | --- |
| monolithic | 15/15（100%） | 15/15 | 2.33 |
| feature-based | 13/15（86.7%） | 14/15 | 2.93 |
| layered | 12/15（80.0%） | 15/15 | 4.00 |

この差がどれくらい確かなのかを見るために、Fisher の正確確率検定（両側）と、Wilson の 95% 信頼区間を計算しました。

| 比較 | p 値 |
| --- | --- |
| monolithic 15/18 と layered 12/18 | 0.44 |
| monolithic 15/18 と feature-based 13/18 | 0.69 |
| 課題 05 を除く monolithic 15/15 と layered 12/15 | 0.22 |
| 隠しテスト feature-based 16/18 と他構成 18/18 | 0.49 |

| 構成 | 完全検証（54 回） | 95% 信頼区間 |
| --- | --- | --- |
| monolithic | 15/18 | 61〜94% |
| feature-based | 13/18 | 49〜88% |
| layered | 12/18 | 44〜84% |

区間はほとんど重なっていて、**構成のあいだに差があるとは言えません**。並び順は記録として残しますが、順位として読むのは無理があります。

### 課題別

| 課題 | 完全検証 | 隠しテスト | 公開テスト全通過 | 平均変更ファイル | 平均追加行 |
| --- | --- | --- | --- | --- | --- |
| 01 category | 8/9 | 9/9 | 8/9 | 3.00 | 41.0 |
| 02 担当者 | 9/9 | 9/9 | 9/9 | 2.78 | 61.1 |
| 03 履歴 | 9/9 | 9/9 | 9/9 | 3.67 | 80.8 |
| 04 期限切れ | 8/9 | 9/9 | 8/9 | 2.44 | 47.3 |
| 05 アーカイブ | 0/9 | 8/9 | 1/9 | 3.44 | 46.6 |
| 06 複製 | 6/9 | 8/9 | 6/9 | 3.56 | 108.2 |

仮説 B で「レイヤー分割が有利」と予想していた横断的な課題 03（履歴）は、3 構成とも 3/3 でした。差が出る難しさになっていなかった、というのが正直な読みです。

### 構成 × 課題

完全検証の通過数と、変更ファイル数（3 回分）です。

| 課題 | monolithic | layered | feature-based |
| --- | --- | --- | --- |
| 01 | 3/3 [2, 2, 2] | 2/3 [4, 4, 4] | 3/3 [3, 3, 3] |
| 02 | 3/3 [4, 2, 2] | 3/3 [3, 3, 5] | 3/3 [2, 2, 2] |
| 03 | 3/3 [2, 2, 2] | 3/3 [5, 5, 5] | 3/3 [4, 4, 4] |
| 04 | 3/3 [2, 2, 2] | 2/3 [3, 3, 3] | 3/3 [3, 2, 2] |
| 05 | 0/3 [2, 2, 2] | 0/3 [5, 4, 4] | 0/3 [5, 3, 4] |
| 06 | 3/3 [2, 5, 2] | 2/3 [4, 5, 4] | 1/3 [4, 3, 3] |

### 変更ファイル数の中身

`changes.patch` を `git apply --numstat` で数え直し、`src/`・`tests/`・`docs/` に分けました。

| 構成 | 本体ファイル | テストファイル | 本体の追加行 | テストの追加行 | docs を触った回 |
| --- | --- | --- | --- | --- | --- |
| monolithic | 1.00 | 1.06 | 12.9 | 42.1 | 2 |
| layered | 2.83 | 1.11 | 20.6 | 43.7 | 1 |
| feature-based | 1.94 | 1.06 | 14.7 | 45.6 | 2 |

わかったことは 2 つあります。

1 つ目は、**平均変更ファイル数には `docs/TODO.md` や作業報告書が混ざっている** ことです。54 回中 5 回で、Runner がリポジトリの運用ルールに従って docs まで書いていました。本体とテストだけで数えると monolithic 2.06、feature-based 3.00、layered 3.94 です。順番は変わりません。

2 つ目は、**追加行の大半がテスト** だということです。本体の追加は平均 13〜21 行で、テストは 42〜46 行でした。「課題 06 は平均 108 行が必要だった」のではなく、108 行の多くはテストと docs です。

## 失敗の分析

完全検証を通らなかった 14 回を、評価 JSON の記録から並べます。

| 実験 ID | 落ちた段階 | 隠しテスト | 記録された分類 |
| --- | --- | --- | --- |
| LAYERED-T01-R01 | format | 1/1 | formatting |
| LAYERED-T04-R02 | format | 1/1 | formatting failure |
| LAYERED-T06-R02 | format | 1/1 | formatting failure |
| FEATURE-BASED-T06-R03 | format | 1/1 | formatting |
| FEATURE-BASED-T06-R01 | typecheck | 0/1 | typecheck failure, functional failure |
| MONOLITHIC-T05-R01 | 公開テスト | 1/1 | implementation omission |
| MONOLITHIC-T05-R02 | 公開テスト | 1/1 | shared contract mismatch |
| MONOLITHIC-T05-R03 | 公開テスト | 1/1 | shared contract mismatch |
| LAYERED-T05-R01 | 公開テスト | 1/1 | shared contract mismatch |
| LAYERED-T05-R02 | 公開テスト | 1/1 | implementation omission |
| LAYERED-T05-R03 | 公開テスト | 1/1 | shared contract mismatch |
| FEATURE-BASED-T05-R02 | 公開テスト | 1/1 | shared contract mismatch |
| FEATURE-BASED-T05-R03 | 公開テスト | 1/1 | shared contract mismatch |
| FEATURE-BASED-T05-R01 | 隠しテスト | 0/1 | implementation omission |

### 整形だけで落ちた 4 回

4 回とも、隠しテストは通っていて、Prettier の `--check` だけで落ちています。うち 3 回が layered で、整形されていなかったのは `layered/tests/app.test.ts` や `layered/src/domain.ts` でした。Runner の課題文には「lint・型検査・テストを実行してください」とあり、整形は名指ししていません。`npm run validate` を最後まで流していれば止まったはずの失敗です。

### 課題 05：評価の側の矛盾

共有契約テストは、Baseline のまま DELETE に 204 を期待しています。

```ts
// phase1-architecture/contracts/task-api-contract.ts（v1.0.1）
expect((await app.inject({ method: 'DELETE', url: `/tasks/${task.id}` })).statusCode).toBe(
  204,
);
```

一方、課題 05 の仕様は「レスポンスは 200 で `status: ARCHIVED` を返す」です。課題に従えば公開テストで落ち、公開テストに合わせれば隠しテストで落ちます。**どちらを選んでも完全検証を通れない** 課題でした。54 回の中で `contracts/` を変更した Run は 1 つもありません。

9 回のうち 8 回は課題に従って 200 を返し、公開テストの 1 件だけで落ちています。残る 1 回（FEATURE-BASED-T05-R01）は、状態を `ARCHIVED` にしながら 204 のまま返していて、公開テストは通り、隠しテストで落ちました。

```ts
// FEATURE-BASED-T05-R01: phase1-architecture/feature-based/src/tasks/routes.ts
-    repository.remove(task.id);
+    task.status = 'ARCHIVED';
+    task.updatedAt = now();
     return reply.code(204).send();
```

Dry Run でこの矛盾に気づけなかった理由も、履歴に残っていました。課題 05 の Dry Run では、実装した側が共有契約を `expect([200, 204]).toContain(...)` に緩めていたのです。本番の Baseline には、その変更が入っていませんでした。

### FEATURE-BASED-T06-R01：同じルートを 2 回書いた

54 回の中で、要件まで壊れたのはこの 1 回だけです（課題 05 を除く）。Runner は 1 回の変更の中で、`category` を 2 回足し、複製ルートも 2 回登録していました。

```ts
// FEATURE-BASED-T06-R01: phase1-architecture/feature-based/src/tasks/routes.ts
       dueDate: r.body.dueDate,
+      category: r.body.category,
+      category: r.body.category,
...
+  app.post<{ Params: { id: string } }>('/tasks/:id/duplicate', async (r, reply) => {
+    const source = repository.find(r.params.id);
+    if (!source) return reply.code(404).send({ error: 'task not found' });
+    return reply.code(201).send(asResponse(repository.duplicate(source, now())));
+  });
```

Evaluator が保存したエラーはこうです。

```text
error TS2300: Duplicate identifier 'category'.
FastifyError: Method 'POST' already declared for route '/tasks/:id/duplicate'
```

v1.0.1 の Baseline には、`category` も複製ルートもありません。どちらも、この Run の中で自分で 2 回書いたものです。1 つ目のルートは `repository.duplicate()` を呼び、2 つ目はハンドラーの中で直接 `repository.create()` を呼んでいて、途中で方針を変えたあとに前の版を消し忘れたように見えます（Runner のログは残していないので、ここは推測です）。

## 隠しテストを通っても、仕様どおりとは限らない

記事を書くために差分を読み直して、隠しテストにない 2 つのケースを、課題 02 と課題 04 の 18 回分のコミットに対して手元で流しました。リポジトリの評価には含まれていない、後からの確認です。

**課題 04。** 仕様には「warning の既存仕様は変更しない」とあります。過去期限で完了したタスクの `warnings` を見ると、9 回中 **7 回** で警告が消えていました。

```ts
// MONOLITHIC-T04-R01: phase1-architecture/monolithic/src/app.ts
+  const isOverdue = (task: Task) =>
+    task.status !== 'COMPLETED' && Boolean(task.dueDate && task.dueDate < now().slice(0, 10));
...
+      warnings: overdue ? ['due date is in the past'] : [],
```

期限切れの判定を直すついでに、警告も同じ判定に寄せています。重複を減らすリファクタリングとしては自然ですが、仕様には反します。警告を残したのは LAYERED-T04-R02 と FEATURE-BASED-T04-R03 の 2 回だけで、構成による偏りは見えませんでした。

**課題 02。** 仕様には「タイトルなど、担当者以外の更新を禁止しない」とあります。MONOLITHIC-T02-R02 は、担当者がいる完了済みタスクにタイトルだけを PATCH すると 409 を返しました。

```ts
// MONOLITHIC-T02-R02: phase1-architecture/monolithic/src/app.ts
+    if (task.status === 'COMPLETED' && request.body.assigneeId !== task.assigneeId)
+      return reply.code(409).send({ error: 'cannot change assignee of a completed task' });
```

body に `assigneeId` がないと `undefined !== 'user-1'` になって拒否されます。担当者のいないタスクでは 200 になるので、隠しテストはこの経路を通っていなかったのだと思います。

ついでに、完了済みタスクに **同じ担当者** を入れ直したときの動きも見ると、9 回中 5 回が 409、4 回が 200 でした。仕様がこのケースを決めていないので、どちらも間違いではありません。曖昧なところは、回ごとに解釈が割れます。

隠しテストの通過率 52/54 は「隠しテストに書いた範囲では要件を満たした」という意味で、それ以上ではありません。

## ドキュメントと生データの食い違い

集計し直していて見つけたものです。どれも、結論の向きを変えるものではありません。

1. **LAYERED-T05-R01 には `humanCodeCorrections: true` が付いている。** 評価のメモは「Runner のソースは、結果コミットの前に親による整形の修正が必要だった」です。手順では通常の集計から外すはずの Run ですが、54 回に含まれています。完全検証は通っていないので通過数は変わりませんが、外すと layered は 12/17 になります。また、この修正がなければ、layered の整形失敗はもう 1 回増えていた可能性があります。
2. **課題 05 の「実装漏れ」3 回のうち 2 回は、記録の根拠が契約の不一致そのもの。** MONOLITHIC-T05-R01 と LAYERED-T05-R02 は隠しテストを通っていて、根拠欄には「公開契約が 204 を期待している」とあります。本当に実装が足りなかったのは FEATURE-BASED-T05-R01 の 1 回だけです。下書きの「6 回が契約と衝突し、残る 3 回は実装漏れ」は、8 回と 1 回と読むのが正確です。
3. **下書きの「課題 05 以外の失敗内訳」の表は、実際には 54 回分。** feature-based の隠しテスト失敗 2 件のうち 1 件は課題 05 です。課題 05 を除けば 1 件です。
4. **FEATURE-BASED-T06-R01 の説明。** 下書きは「既存の複製ルートと `category` 定義を確認しないまま再追加した」としていますが、Baseline にはどちらもなく、同じ Run の中で 2 回書いたものです。
5. **FEATURE-BASED-T03-R03 の `metrics`。** 評価 JSON は 4 ファイル・追加 29 行ですが、`git-stat.txt` は 6 ファイル・追加 136 行・削除 1 行です。集計の平均はこの評価 JSON の値を使っています。
6. **整形で落ちた Run の公開テスト件数。** LAYERED-T04-R02 は記録上 12/13 ですが、根拠欄には「テストを別に流すと 13/13」とあります。LAYERED-T06-R02 も 9/10 と 10/10 です。公開テスト全通過率には、整形の失敗が混ざっています。
7. **探索とトークンの記録。** 下書きは「全 Run で同じ粒度に揃っていない」と書いていますが、評価 JSON では 54 回すべて `null` です。

Qiita 向けの下書き `docs/articles/phase1-qiita-draft.md` は、冒頭に「下書き。公開前に著者情報、図の説明、代表差分へのリンクを確認する」とあり、公開先の URL はまだありません。この記事は、下書きではなく上の生データに合わせています。

## 妥当性への脅威

- **回数。** 1 条件 3 回、1 構成 18 回です。上の検定のとおり、構成差は偶然の範囲に収まっています。
- **規模。** 本体は 84〜170 行です。ファイルを探す、依存をたどる、という難しさがほとんど生まれない大きさで、仮説 C や E を試せる条件になっていません。
- **モデル。** gpt-5.6-terra・`medium`・Codex CLI の 1 条件だけです。
- **作り手が 1 人。** 構成、課題、隠しテスト、評価を、すべて私が作りました。課題 05 の矛盾や、隠しテストの薄さはその表れです。
- **隠しテストの粒度。** 課題ごとに 1 ケースで、課題 04 の警告や課題 02 のタイトル更新のような約束は確かめていません。
- **課題の偏り。** 課題 02・03 は 9/9 で、天井に当たっています。課題 05 は評価の矛盾で 0/9 です。6 課題のうち、構成差を見られる課題は実質 4 つでした。
- **評価者も AI。** Evaluator は別の clone・別のセッションですが、Codex CLI のセッションです。設計の質を人が見る採点はしていません。
- **Runner のログがない。** 何を読み、何を実行したかは残っていないので、失敗の原因は差分からの推測になります。
- **リポジトリの運用ルールの影響。** 5 回の Run が `docs/TODO.md` や作業報告書を書いていました。課題とは別の指示が、Runner の作業量に入り込んでいます。

## 再現方法

集計は、実験ブランチを取得してから 1 コマンドで作り直せます。

```sh
git clone https://github.com/naki0227/ai-readable-code-lab
cd ai-readable-code-lab
git fetch origin 'refs/heads/experiment/p1/*:refs/remotes/origin/experiment/p1/*'
npm ci
npm run summarize:main-experiment
```

`results/summaries/main-experiment-summary.json` と `main-experiment-runs.csv` が、54 回分の評価 JSON から作り直されます。1 回分の生データを見るときは、ブランチから直接取り出せます。

```sh
git show origin/experiment/p1/feature-based/task-06/r01:results/raw/P1-FEATURE-BASED-T06-R01/evaluation.json
```

新しく Run を足すときは、Baseline のタグから分岐して、Runner には対象の構成と課題文と公開テストだけを渡します。

```sh
scripts/create-experiment-branch p1 layered task-02 r04 p1-layered-v1.0.1
```

隠しテストの本体はまだ公開していないので、Evaluator の手順はいまのところ手元でしか回せません。

## わかったこと、わからなかったこと

わかったことは、**この大きさのコードでは、どの構成でも AI は要件をほぼ実装できた** ということです。52/54 が隠しテストを通り、失敗の多くは整形と、私が作った評価の矛盾でした。

わからなかったのは、最初の問いそのものです。構成の差は偶然の範囲に収まっていて、コードが小さすぎて探索の難しさも生まれていません。

それでも、次に何を直せばいいかははっきりしました。

1. 課題を流す前に、課題の仕様と共有契約テストの食い違いを機械で見つける
2. 隠しテストのケースを増やし、「変えてはいけないもの」も確かめる
3. Runner の操作ログとトークン数を残す
4. 本体が数千行ある Baseline を用意し、探索が必要になる大きさで測り直す
5. 設計の質を、条件を伏せて人が採点する

構成を固定して言語を変える第 2 弾（Python・TypeScript・Go・Rust）は、計画書にはありますが、まだ始めていません。その前に、Phase 1 の測り方を直すところからやります。
