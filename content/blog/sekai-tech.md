---
title: sekai の中身を全部書く ── 世界の最前線・法則・保留と収束、Rust ランタイムの実際
date: 2026-10-20
description: 実験的な言語 sekai の意味の定義、構文、パーサ、イベント駆動のランタイム、法則と修復ポリシー、見通し、候補の保留と収束、JSON レポート、CLI、ビューア、テスト、比較評価を、ソースを引用して書きます。文書と実装の差や、手元で試して見つかった穴も含めます。
tags: [sekai, Rust, 言語設計, 意味論, シミュレーション, 研究]
type: tech
---

> これは技術編です。何を考えて作り、役に立つのかどうかを読みやすくまとめた読みもの版は「[「世界」を書くプログラミング言語 sekai を作った。役に立つかは、まだわからない](/blog/sekai)」にあります。

sekai は、手順の代わりに **空間・時間・制約** で「実行できる世界」を書く、実験的な言語です。この記事では、リポジトリの現在の `main`（HEAD は `5cc77df`、「Merge pull request #6 … relational-fact-resolution」）を、ソースを引用しながら順に追います。数字と定数はソースの値か、手元で実行した結果です。

先に結論を書くと、sekai は **小さな世界なら書いたとおりに動き、なぜそうなったかを報告できる** ところまで来ています。一方で、文書の意味と実装の間には差があり、手元で試して見つかった穴もあります。それも書きます。

## 全体像

名前は 3 つあります。言語が `sekai`、ランタイムの中心が `orbis`、考え方が World-Oriented Programming（世界指向プログラミング）、ファイルの拡張子は `.sk` です（`docs/decisions/0001-project-identity.md`）。

```text
orbis/src/parser.rs  1041 行   行単位のパーサ
orbis/src/world.rs   6742 行   ランタイム本体（4736 行目以降はテスト）
cli/src/main.rs        55 行   sekai コマンド
viewer/app.js        2234 行   ビューア（ライブラリなし）
examples/             .sk が 42 本
benchmarks/           比較用の Python
docs/research-log/    研究ノート 98 本
```

Rust は edition 2024 で、`Cargo.lock` に載っているのは `orbis` と `sekai-cli` の 2 つだけです。**外部クレートは 0**。JSON も `escape_json` を使って手で組み立てています。

研究ノートは 2026-03-24 に始まり、コミットは 03-25〜28 に 110、04-22 に PR #2〜#6 の 10、合わせて 120 です。論文は Zenodo に置いています（DOI: [10.5281/zenodo.19235961](https://doi.org/10.5281/zenodo.19235961)）。査読を経たものではありません。

## 言語モデル：世界の最前線

意味の定義は `docs/semantics-core.md` にまとまっています。ある時刻 `t` の世界を、次の組で表します。

```text
W_t = (E, G, L_h, L_s, tau, sigma, A, t)
```

`E` が物の集合、`G` が幾何（床や箱）、`L_h` が **守らなければならない法則**、`L_s` が **好み**（点数を動かすだけで、正しさは決めない）、`tau` が物ごとの進み具合、`sigma` が物ごとの状態、`A` が出来事の履歴、`t` が「ここまでは確定した」という時刻で、これを **世界の最前線（frontier）** と呼んでいます。

実行は、手順の列ではなく、次の流れとして定義しています。

```text
world frontier -> next event -> local synchronization -> event firing -> law enforcement -> observation or contradiction
```

それぞれに名前が付いています。

- `Next(W_t)`：次の出来事を選ぶ。最も早いもの、同時なら意味上の優先度、それでも同じなら決まった順。
- `Sync(ev, W_t)`：解釈に必要な最小限の物だけを同じ時刻にそろえる。これが **大域的には非同期、局所的に同期** の意味です。
- `Fire` で出来事を起こし、`Enforce` で法則を当てる。結果は、通る・直す（repair）・矛盾のどれか。
- `Obs(W, t_obs)`：観測。それより前の出来事が片付いてからでないと観測できない。

矛盾は例外ではなく、**世界の結果の 1 つ** として扱います。

```text
W_t^X = (W_t, law, participants, failed_predicate, frontier)
```

決まっていない世界は `W_t^? = (W_t, C)` と書き、`C` は候補の続きの有限集合です。収束 `Conv(W_t^?)` は、法則で候補を落とし、直せるものは直し、好みで並べ、1 つに決めるか、決めずに残すか、全部だめなら矛盾にします。決めずに観測した場合の状態として、`stable / representative / unresolved / contradiction` を定義しています。

同じ文書には、証明すべきこととして「出来事の順序の決定性」「スナップショットの決定性」「有限の候補での収束の停止」「修復後に法則を満たすこと」の 4 つを挙げています。**どれもまだ証明はしていません**。文書自身も「定理レベルの意味論とは言わない」と書いています。

## 構文

構文は `docs/syntax.md` に v0.1 として書いてあります。トップレベルにあるのは、物の宣言、性質の代入、そして 3 つのブロックだけです。関数もループも分岐もありません。

```text
sphere A
plane floor
region zone

position(A) = (0, 0, 0)
velocity(A) = (1, 0, 0)
radius(A) = 1
min(zone) = (2, -1, -1)
max(zone) = (4, 1, 1)

constraint:
    not inside(A, zone)

observe:
    snapshot at 1
    snapshot at 3
```

これは `examples/forbidden_region.sk` です。物は `sphere`・`plane`・`region` の 3 種類だけで、`region` は `min` と `max` で決まる軸平行の箱です。

`constraint:` の中で使える法則は 5 つです。

| 書き方 | 内部の種類 | 分類 | 修復ポリシー | 出来事を生むか |
| --- | --- | --- | --- | --- |
| `reflect_on_collision(A, floor)` | `ReflectOnCollision` | boundary | なし | 床との接触時刻 |
| `speed(A) <= 4` | `VelocityLimit` | invariant | reject（既定）/ clamp | 生まない（検査だけ） |
| `not inside(A, zone)` | `NotInside` | boundary | reject（既定）/ clamp / reflect | 箱に入る時刻 |
| `visible(A, B)` | `Visible` | interaction | なし | 生まない（検査だけ） |
| `elastic collision(A, B)` | `ElasticCollision` | interaction | なし | 球どうしの接触時刻 |

修復ポリシーは前置きで書きます。`clamp not inside(A, zone)` や `reflect not inside(A, zone)` です。対応していない組み合わせ（`reflect speed(A) <= 4` など）は、実行前の世界の組み立ての段階でエラーになります。

`action:` ブロックには、行動の候補と、その扱い方の指示を書きます。

```text
action:
    candidate_velocity(A, fast) = (6, 0, 0) score 5
    candidate_velocity(A, safe) = (3, 0, 0) score 2
```

指示は、保留（`defer_on_ambiguous_top`）、決める時刻（`resolve_deferred_at`）、好み（`prefer_candidate_at`、`prefer_candidate_if_visible`、`prefer_candidate_if_occluded`）、点数の加算（`rescore_candidate_at`）、上限の変更（`update_speed_limit_at`）の 7 種類です。ほかに「事実」の候補 `candidate_fact` / `candidate_relation` と、その保留・好みの指示があります。

`observe:` には `snapshot at <時刻>` を並べます。観測する時刻は、ソースの一部です。

## パーサ

パーサ（`orbis/src/parser.rs`）は、行ごとに読み、どのブロックにいるかを `Mode` で切り替えるだけの素朴なものです。結果の `Program` では、法則は `Vec<String>` のまま渡ります。`not inside(A, zone)` は `["not_inside", "A", "zone"]` に、`speed(A) <= 4` は `["velocity_limit", "A", "4"]` に書き換えられ、意味の解釈は `world.rs` の `Constraint::from_parts` で行います。エラーには行番号が付きますが、ランタイム側のエラー（法則の矛盾など）にはソースの位置がありません。これは `semantics-core.md` の「既知の穴」にも挙がっています。

## ランタイム：時間の進め方

入口の `simulate_program` は、観測時刻を並べ替えて、1 つずつそこまで世界を進めるだけです。

```rust
// orbis/src/world.rs
for time in observation_times {
    world.advance_to(time)?;
    world.resolve_deferred_candidates_at(time)?;
    world.resolve_deferred_facts_at(time)?;
    // ... 観測状態とスナップショットを記録
}
```

`advance_to` が時間を進める本体です。

```rust
pub fn advance_to(&mut self, target_time: f64) -> Result<(), SimulationError> {
    loop {
        let current_time = /* 全球の last_update_time の最大 */;
        if target_time <= current_time + EPSILON { break; }

        let max_dt = target_time - current_time;
        match self.next_event(max_dt) {
            Some(event) => {
                self.advance_all_by(event.dt);
                self.handle_event(event)?;
            }
            None => {
                self.advance_all_by(max_dt);
                self.enforce_all_constraints()?;
                break;
            }
        }
    }
    Ok(())
}
```

固定の時間刻みはありません。法則ごとに「次に何秒後に何が起きるか」を解析的に求め、いちばん早いものまで一気に進めます。床との接触は平面までの符号付き距離と接近速度から、球どうしは相対位置と相対速度の 2 次方程式から、箱への進入は軸ごとの slab 法で求めます。比較の許容誤差は `const EPSILON: f64 = 1e-9;` の 1 つだけです。

出来事を起こしたら、必ずすべての法則を当て直します（`handle_event` → `enforce_all_constraints`）。法則が直したら `repaired`、だめなら `contradicted` を履歴に積み、最初の矛盾で止まります。床での反射は `v - n * 2(v·n)`、球どうしの衝突は法線方向の成分を入れ替える等質量の弾性衝突です（質量という性質はありません）。

`examples/bounce.sk` では、`t=3` でちょうど床（半径 1 なので `y=1`）に当たり、速度が `(1, -3, 0)` から `(1, 3, 0)` に変わります。

### 「局所的に同期」は、実装ではまだ全体同期

各球は `last_update_time` を持っていますが、進めるのは常に全員いっしょです。

```rust
fn advance_all_by(&mut self, dt: f64) {
    if dt <= EPSILON { return; }
    for sphere in &mut self.spheres {
        sphere.position = sphere.position + sphere.velocity * dt;
        sphere.last_update_time += dt;
    }
}
```

なので `last_update_time` は全球で常に同じ値です。文書にある「観測されるか、関わるときだけ進める（lazy advancement）」や `Sync(ev)` による最小限のそろえは、**意味の定義としては書いてあるが、実装には入っていません**。等速直線運動しかないので、全員を進めても結果は同じになる、という段階です。

### 同時に起きる出来事

`semantics-core.md` では、同じ時刻の出来事は「意味上の優先度 → 決まった順」で選ぶとしており、`docs/phase-g-time-semantics.md` には `Key(ev) = (time, priority, law_key, participant_key, index)` という順序付けまで書いてあります。実装はもっと単純です。

```rust
fn choose_earlier(current: Option<Event>, candidate: Event) -> Option<Event> {
    if candidate.dt < 0.0 { return current; }
    match current {
        Some(existing) if existing.dt <= candidate.dt => Some(existing),
        _ => Some(candidate),
    }
}
```

`dt` が同じなら、先に宣言された法則が勝つだけです。優先度はありません。

手元で、2 つの球がまったく同じ時刻に床へ当たる世界を書いて試しました。

```text
position(A) = (0, 4, 0)    velocity(A) = (0, -1, 0)   radius 1
position(B) = (5, 4, 0)    velocity(B) = (0, -1, 0)   radius 1
constraint:
    reflect_on_collision(A, floor)
    reflect_on_collision(B, floor)
observe:
    snapshot at 5
```

結果は、A は跳ね返って `y=3`、**B は床をすり抜けて `y=-1`** でした。A の反射のあと、B は床にちょうど接した状態になり、`time_to_plane_collision` が `signed_distance <= EPSILON` で「もう当たらない」と判断するためです。B の開始位置を 0.5 ずらすと正しく跳ね返ります。文書が「同時の出来事はまだ定め切れていない」と書いているとおりの穴です。

## 法則と修復

修復は `Constraint::enforce` にあります。速さの `clamp` は向きを保って大きさを上限にそろえます。箱の `clamp` と `reflect` は、中心からいちばん近い面の外側 `EPSILON` に戻し、その軸の速度を 0 にするか、外向きに反転します。

`clamped_region.sk` では `t=3` に `x=2`・速度 0 で止まり、`reflected_region.sk` では `x=1`・速度 `-1` で戻っています。

注意点として、箱との判定は **球の中心が箱に入ったか** で行っています（`point_inside_box(sphere.position, …)`）。半径は見ていないので、半径 1 の球は、中心が境界に着く前から 1 だけ箱にめり込んでいます。

`reject` のときは、`SimulationError` から構造化した矛盾を作ります。

```json
"contradiction": {
  "law_kind": "not_inside",
  "law_category": "boundary",
  "participants": ["A", "zone"],
  "policy": "reject",
  "frontier": 2.000000,
  "failed_predicate": "not_inside(A, zone)",
  "message": "sphere `A` entered forbidden region `zone` at t=2.000"
}
```

`examples/forbidden_region.sk` の `simulate-report` の出力です。`semantics-core.md` の `W_t^X` の形が、そのまま JSON になっています。

## 見通し

`visible(A, B)` は、A と B の **中心を結ぶ線分** が、宣言されたどれかの箱と交わるかで判定します（`line_segment_intersects_box`、slab 法で `t ∈ [0, 1]`）。ここでも半径は見ていません。

大事なのは、`visible` が **出来事を生まない** ことです（`candidate_event` が `None` を返す）。検査は、別の出来事のあとか観測時刻にしか行われません。

手元で、止まっている A の前を、B が上から下へ壁の裏を通り過ぎる世界を作りました。観測を `0` と `6` だけにすると、**矛盾は報告されず正常終了** します。`3` を足すと `` `A` cannot see `B` through region `wall` at t=3.000 `` で止まります。

旗艦シナリオの矛盾版（`examples/visibility_coordination_flagship_contradiction.sk`）でも同じことが起きています。報告される矛盾の時刻は `frontier: 1.000000` ですが、座標から計算すると、S から C への線分が下の壁にかかり始めるのは `t=0.6` です。報告されるのは「見えなくなった時刻」ではなく「見えなくなったことに気づいた観測時刻」です。

また、`region` はすべて見通しをさえぎりますが、動きはさえぎりません（`not inside` の対象は最初に宣言した 1 つだけ）。旗艦シナリオの `t=2` の A は `(1, 1.5, 0)` で、上の壁 `(1..5, 1..3)` の中にいます。

## 決まらない世界：候補・保留・収束

ここが sekai でいちばん作り込んだところです。`resolve_candidates_for_entity` は、まず候補を点数の高い順、同点なら好みの付いたもの、それでも同じならラベルの辞書順です。そして上から 1 つずつ、**世界をまるごと複製して** その速度を入れ、全法則を当ててみます。

```rust
for candidate in candidates {
    let mut probe = self.clone();
    probe.activity_log.clear();
    probe.spheres[sphere_index].velocity = candidate.velocity;
    match probe.enforce_all_constraints() {
        Ok(_) => { /* 採用して break */ }
        Err(_) => { /* rejected_by_hard_law を記録して次へ */ }
    }
}
```

最初に通ったものが選ばれます。全部だめなら矛盾です。`examples/candidate_velocity.sk` では、点数 5 の `fast = (6,0,0)` が `speed(A) <= 4` に落とされ、点数 2 の `safe = (3,0,0)` が選ばれます。このときの収束の型は `fallback` です。

型は全部で 10 あります：`direct`、`fallback`、`repaired`、`tie_broken`、`equivalent_tie`、`deferred`、`resolved_after_defer`、`resolved_after_preference`、`resolved_after_rescore`、`resolved_after_law_update`。

最高点が複数あるときは、法則を当てたあとの全球の位置と速度を小数 6 桁で文字列にした `world_signature` を比べます。一致すれば `equivalent_tie`（観測の状態は `representative`）、一致せず `defer_on_ambiguous_top` があれば `deferred`（状態は `ambiguous`）です。この判定は **その時刻の状態だけ** を見ていて、将来の軌道は比べていません。

保留した候補を決めるのは `resolve_deferred_candidates_at` で、**観測時刻にしか呼ばれません**。`resolve_deferred_at(A, 1)` は「1 秒以降の最初の観測で決める」という意味になります。このとき、`prefer_candidate_at` の好み、`rescore_candidate_at` の点数の加算、`update_speed_limit_at` による速さの上限の書き換え、そして見通しによる好み（`visibility_conditioned_preference`。その時点で `entity_can_see` を評価し、当てはまる条件のうち宣言順で最初のもの）が効きます。

### 旗艦シナリオ

`examples/visibility_coordination_flagship.sk` は、追跡者 A と D、動く目標 B と C、上下 2 枚の壁でできた世界です。A と D はそれぞれ「待つ・B へ・C へ」の 3 候補を同点で持ち、A は 1 秒、D は 2 秒で決めます。どちらも「見えている目標の方へ」という好みを持っています。

実行すると、観測ごとの状態はこう変わります。

```text
t=0  unresolved   ambiguous_entities=2
t=1  unresolved   ambiguous_entities=1   A -> pursue_b (selected_after_preference)
t=2  determinate  ambiguous_entities=0   D -> support_c (selected_after_preference)
```

`t=1` では A から B が見えて C は下の壁に隠れ、`t=2` では D から B が隠れて C が見える、という幾何で決まります。この並びはテスト `flagship_visibility_coordination_preserves_staggered_observation_story` で固定してあります。

### 観測が結果を変える

ここで、意味の定義としてまずいことが起きます。旗艦シナリオから `snapshot at 1` の 1 行だけを消して実行すると、A は 1 秒では決まらず、次の観測である 2 秒で決まります。2 秒の時点では A から B は下の壁に隠れて C が見えるので、**A は `pursue_c` を選び**、`t=2` の A の位置は `(1, 1.5, 0)` から `(0, 0.5, 0)` に変わります。

`Obs` は世界を「見る」だけのはずですが、実装では観測時刻が収束の時刻を兼ねているため、何を観測するかで世界が変わります。直すなら、`resolve_deferred_at` を出来事として `next_event` に入れ、観測と切り離す必要があります。

### 不確かな事実

PR #5 と #6 で、行動ではない「事実」の候補が入りました。

```text
    candidate_relation(observer, visibility, target, visible) = score 5
    candidate_relation(observer, visibility, target, occluded) = score 5
```

仕組みは行動の候補と同じで、点数で並べ、同点なら保留し、指定の時刻の観測で決めます。ただし `resolve_facts_for_slot` は法則を当てません。事実の値は **ただのラベル** で、幾何とも動きともつながっていません。上の例で `visibility` に `visible` を選ばせても、実際の見通し（このとき observer と target の間には壁があります）との食い違いは検出されません。報告に「決まっていない事実」を載せる器ができた、という段階です。

## 決定性

乱数はなく、候補は点数とラベル、索引は `BTreeMap`、法則は宣言順、観測時刻は `total_cmp` で並びます。`HashMap` の `properties` は引くだけで回しません。同じ入力からは同じ報告が出るはずですが、それを確かめるテストはなく、`f64` なので別の環境での一致までは言えません。出来事の順序の決定性も、今は宣言順に依存したものです。

## CLI

`cli/src/main.rs` は 55 行で、サブコマンドは 4 つです。

```text
usage: sekai <simulate|simulate-json|simulate-report|analyze> <file.sk>
```

`simulate` は人が読む形で、矛盾したら終了コード 1。`simulate-json` は成功時の報告。`simulate-report` は成功でも失敗でも `status: ok | error` の封筒を返し、失敗時は矛盾の構造とそこまでの部分的な報告も入ります（ビューアはこれを読みます）。`analyze` は実行せずに法則・候補・指示の一覧を出します。報告には、法則ごとの `idle / fired / repaired / contradicted` の回数、分類ごとの合計、収束の型ごとの数、観測の時系列、出来事の履歴、スナップショットが入ります。

## ビューア

ビューアは素の HTML・CSS・JavaScript で、3D も Canvas 2D に自前の投影で描いています。`simulate-report` の JSON を読み、3D・xy・xz、時刻のスライダー、再生、法則、矛盾、収束、観測の時系列を出します。`viewer/samples/` に 46 個の報告があります。

再生は、観測と観測の間を線形補間しています。補間した時刻には `(interpolated display)` と表示し、**意味のある観測は `observe:` の時刻だけ** という区別を画面でも残しています。補間は出来事を知らないので、観測の間に跳ね返りがあると、表示上の動きは実際とずれます。たとえば `reflected_region` は 1 秒と 3 秒でどちらも `x=1` にいるので、再生するとその間ずっと止まっているように見えます（実際は 2 秒で箱に当たって戻っています）。

もう 1 つの機能が下書きエディタです。xy 表示で画面をクリックして球を置き、床や禁止領域を付けると、`generateDraftDSL` が `.sk` を組み立て、置き方から法則の候補（床での反射、衝突、速さの上限、禁止領域、見通しの追跡）を提案します。`Run Draft` を押すと `scripts/viewer_server.py` の `POST /api/simulate` に送られ、一時ファイルに書いて `cargo run --quiet -p sekai-cli -- simulate-report` を呼び、結果をビューアに返します。図から法則、実行、表示までが 1 周つながる、というのが論文の主張の 1 つです。

## テスト

テストは `world.rs` の末尾に 51 本あり、`cargo test` で全部通ります（手元で 0.01 秒）。基本の法則とポリシー、見通し、JSON の形、`analyze` のほかは、ほとんどが候補の収束（fallback、同点、保留、あとからの好み・点数・法則の更新、時間差の決定、見通しによる役割分担、旗艦シナリオなど）を 1 シナリオ 1 本で固定するものです。

ないテストもはっきりしています。同時の出来事、同じ入力での再現性、観測時刻を変えたときの不変性、パーサの異常系、CLI です。上で見つけた穴は、どれもこの「ない」側にあります。

## 比較評価

`scripts/spec_metrics.py --markdown` は、同じ場面を sekai と Python の 3 通り（手でループを書く `imperative`、イベントで書く `event_driven`、世界を作る小さな API を仮定した `library_style`）で書いたものを、行数・トークン数・分岐や繰り返しのキーワード数などで比べます。

| 場面 | sekai | imperative | event_driven | library_style |
| --- | ---: | ---: | ---: | ---: |
| bounce | 15 | 32 | 45 | 16 |
| two_body_collision | 15 | 35 | 43 | 14 |
| candidate_velocity | 12 | 29 | 29 | 13 |
| visibility_corridor_world_occluded | 28 | 62 | 54 | 19 |
| visibility_coordination_flagship | 47 | ー | ー | 34 |

（論理行数。旗艦シナリオは library_style との比較だけ）

手書きのループやイベントより 2〜3 倍短い一方、**ライブラリ版とはほぼ同じか、ライブラリ版のほうが短い** です。トークン数は sekai が少ない（旗艦で 377 対 596）ものの、呼び出しの書き方の差がほとんどです。

指標の作りにも注意が要ります。「世界の内容の密度」は sekai が全場面で `1.000` ですが、これは sekai の行を全部「世界の内容」に分類しているからで、ほぼ定義から出てくる値です。また `benchmarks/library_style/worldlib.py`（61 行）は呼び出しを辞書に記録するだけで、実際には何も実行しません。比べているのは **書き方の表面** で、動く実装どうしの比較ではありません。リポジトリの文書（`docs/flagship-comparison.md`）も、「短いから勝ち」とは言えず、残る違いは法則が文法であることと、ソースから報告・ビューア・図までが 1 本でつながることだ、と書いています。

## 役に立つのか（技術的に）

ここまでをまとめて、技術的にどこまで言えるかを書きます。

### 今の規模と性能

対象は、球と、平面 1 枚と、軸平行の箱だけです。運動は等速直線で、重力も回転も質量もありません。手元で、`examples/` の 42 本すべてを release ビルドの `simulate-report` で順に実行して、プロセスの起動込みで合計 0.08 秒でした。ただし、どの例も物は数個です。大きな世界での計測はしていません。

計算量は実装から読めます。出来事 1 つごとに、全法則を走査して次の出来事を探し（法則の数に比例）、出来事のあとに全法則を当て直します。球どうしの衝突は組ごとに宣言するので、n 個の球を全部ぶつけ合うには n(n−1)/2 本の法則が要ります。候補の評価は 1 候補ごとに `World` をまるごと `clone` します。小さな世界の意味を確かめるための作りで、規模に耐える作りではありません。

### すでにあるものとの関係

- **物理エンジン・ゲームエンジン**：衝突の検出と応答は、sekai のものよりはるかに一般的です。sekai に固有なのは「どの法則がいつ発火し、直し、矛盾したか」の報告ですが、これもエンジンの上に記録を足せば近いものは作れると考えています。
- **ECS**：物と性質と仕組みを分ける作り方は、sekai の内部（球の配列と法則の列）と近いです。違いは、sekai では法則がソースの文法で、仕組みのコードを利用者が書かないことだけです。
- **Modelica**：方程式で書いた模型を、解く順番を指定せずに動かせる点で、最も近い先行例です。sekai には方程式はなく、代わりに「矛盾」「保留」「収束」があります。
- **制約ソルバー**：sekai の候補選びは、有限個の候補を点数で並べて上から試すだけで、探索も最適化もしません。「制約」という言葉は使っていますが、解く道具ではありません。

### 実験が示していること、示していないこと

示しているのは、**小さな世界の運動、法則の修復と矛盾、候補の保留と収束を、手順なしに 1 つの意味の言葉で書いて実行し、報告とビューアまでつなげられる** ことです。テストと例で裏付けがあります。示していないのは、それがふつうの言語と良いライブラリより、読みやすい・間違えにくいことです。人を対象にした実験はしておらず、文書もそこは仮説として扱っています。

### 意味を持つための条件

sekai が道具として意味を持つには、少なくとも次が要ると考えています。

1. 観測と収束を切り離し、観測を副作用のないものにする。
2. 同時の出来事と、出来事を生む見通しを実装し、文書の意味と実装を一致させる。
3. 局所的な同期を本当に実装し、大きな世界で効くことを測る。
4. 「保留」「矛盾」を世界の状態として扱うことが、ライブラリより明らかに素直に書ける場面を、実際の問題で 1 つ見つける。ロードマップは、あいまいなセンサー情報からの安全な行動選択を長期の目標に置いていますが、そこにはまだ何もつながっていません。

4 が見つからなければ、1〜3 を直しても、良くできた小さなシミュレータで終わります。

## まとめ

sekai のいまの実体は、**外部依存のない Rust のランタイムとパーサ（合わせて約 5,800 行、テスト約 2,000 行）と、JSON の報告、素の JavaScript のビューア** です。世界の最前線、法則、矛盾、保留、収束を、文書・コード・報告・画面で同じ名前のまま扱えている点は、作ってよかったと思っています。

同時に、文書のほうが実装より先に進んでいます。局所的な同期は全体同期で、同時の出来事は宣言順で、見通しは観測時にしか確かめず、観測が収束を兼ねています。次にやるのは機能を足すことではなく、この差を埋めることです。そのうえで、sekai でしか素直に書けない場面が見つかるかどうか。役に立つかどうかは、そこで決まると考えています。
