---
title: Nue のパイプラインを全部書く ── 編集指示書・Gemini・FFmpeg・Go/Python/Rust から Rust + Next.js へ
date: 2026-10-19
description: 動画を Gemini に見せて編集指示書 JSON を作り、Rust から FFmpeg を呼んで縦型動画に焼く Nue の中身を、ソースを引用して書きます。3 言語・3 サービスの構成を Rust CLI と Next.js API route にまとめ直した理由と、移行途中で残っている穴も含めます。
tags: [Nue, Rust, Next.js, FFmpeg, Gemini, 設計]
type: tech
draft: true
---

> これは技術編です。何をつくって、なぜ構成をまとめ直したかを読みやすくまとめた読みもの版は「[動画編集を AI に任せるために、3 つに分けたサービスを 1 つに戻した](/blog/nue)」にあります。

Nue は、動画をアップロードすると Gemini が中身を見て **編集指示書（edit plan）** という JSON を作り、Rust から FFmpeg を呼んで 1080×1920 の縦型動画とサムネイルを書き出すパイプラインです。開発中で、構成を移行している途中です。

この記事では、リポジトリの現在の `main`（最新コミットは「Migrate CLI to Rust, add Next.js API routes, and retire Go/Python as legacy」）を、ソースを引用しながら順に追います。数字と定数はすべてソースの値です。

## 全体の流れ

### 移行前（Go / Python / Rust の 3 サービス）

```text
Browser (Next.js)
  → POST http://localhost:8080/upload        Gateway (Go / Gin)
  → data/raw/<uuid>.mp4 (+ _metadata.json)
       ↓ watchdog (PollingObserver)
  Brain (Python) → Gemini Files API → edit plan
  → data/json/<uuid>.mp4.json
       ↓ notify (Create event)
  Muscle (Rust) → ffmpeg × N
  → data/output/<uuid>_edited.mp4, <uuid>.mp4_thumb.jpg

Trend Watcher (Python) → yt-dlp → Gemini → data/trends.db (SQLite) → Brain が参照
```

### 移行後（Rust + Next.js）

```text
Browser
  → POST /api/upload                          Next.js route handler
  → data/raw/<uuid>.mp4.part → rename → data/raw/<uuid>.mp4
       ↓ notify (Create / Modify / Any)
  muscle worker (Rust)
    analyze: Gemini (inline or Files API) → data/json/<uuid>.mp4.json
    render:  ffmpeg × (cuts + 1) → data/output/<uuid>_edited.mp4
  → data/jobs/<uuid>.json を段階ごとに更新
  ← GET /api/jobs/<uuid>（2 秒ごとにポーリング）
  ← GET /api/output/<file>
```

サービス間は今も昔も **共有ボリューム `data/` のファイルだけ** でつながっています。

## 経緯

git の記録はこうなっています。

| 日付 | コミット | 内容 |
| --- | --- | --- |
| 2025-12-19 | 74529b4 | Gateway（Go）・Brain（Python + Google Gen AI）・Muscle（FFmpeg）の基本パイプライン |
| 2025-12-19 | 1363a0a | 縦型（Smart Crop）とサムネイル自動生成、Trend Watcher、CI |
| 2025-12-19 | 537fb9f | 字幕のスタイル指定 |
| 2025-12-19 | a43f681 | Next.js の Web UI |
| 2025-12-30 | 760043e | 効果音が鳴らない不具合の修正。レンダラーをセグメント方式に書き直し |
| 2026-04-13 | de4435a | Rust CLI（analyze / render / run / worker）、Next.js API route、Go/Python を legacy に |

最後のコミットで、方針メモ `docs/language-strategy.md`・`migration-plan.md`・`roi.md` も入りました。

## 移行前の構成と、何がつらかったか

### 3 サービスの分担

`docker-compose.yml` のリソース制限を見ると、分けた意図がよくわかります。

| サービス | 言語 / ベースイメージ | memory 上限 | 役割 |
| --- | --- | --- | --- |
| gateway | Go 1.23 / `golang:1.23-alpine` → `alpine` | 128M | アップロード受付（job status と `/output` 配信は最後のコミットで追加） |
| brain | Python 3.11 / `python:3.11-slim` | 1024M | Gemini 解析、手動指示のマージ、BGM 選択 |
| muscle | Rust / `rust:1.75-slim-bookworm` → `debian:bookworm-slim` + `ffmpeg` + `fonts-noto-cjk` | 3072M、cpus 2.0 | FFmpeg レンダリング |
| trend_watcher | Python 3.11 / `python:3.11-slim` + `ffmpeg` | なし | 参考動画のスタイルを SQLite に蓄積 |
| web | Node 20 / `node:20-alpine` | なし | UI |

muscle の上限は 760043e で 1024M → 3072M、cpus 1.0 → 2.0 に上げています。どのサービスも `logging` は `json-file`、`max-size: "10m"`、`max-file: "3"` です。

### 同じ処理が 4 言語に散った

いちばん象徴的なのはジョブの状態管理です。移行前の Web UI は、アップロードが 202 を返したら **5 秒後に完了表示にするだけ** でした。

```tsx
// web/app/page.tsx（760043e 時点）
xhr.onload = () => {
  if (xhr.status === 202) {
    setStatus("processing");
    setTimeout(() => setStatus("done"), 5000);
  }
  // …
};
```

これを本物の進捗にするために `data/jobs/<job_id>.json` を導入したところ、同じ「状態ファイルを書く」関数が 4 つの言語に生まれました。

| 実装 | 場所 | `updated_at` の形式 |
| --- | --- | --- |
| Go | `gateway/main.go` `writeJobStatus` | `time.RFC3339`（UTC） |
| Python | `brain/analyze.py` `update_job_status` | `"%Y-%m-%dT%H:%M:%SZ"` |
| TypeScript | `web/app/api/_lib/data.ts` `writeJobStatus` | `new Date().toISOString()`（ミリ秒付き） |
| Rust | `muscle/src/main.rs` `update_job_status` | UNIX 秒の **数値** |

TypeScript 側の型は `updated_at?: string` なので、Rust が書いたファイルを読むと型と中身が食い違います。いまは UI が `updated_at` を使っていないので表に出ていませんが、言語ごとに流儀が分かれると、こういうずれが静かに入ります。

ほかにも次のようなものが積み上がっていました。

- ログ：Go は zap、Python は python-json-logger、Rust は自前の `log_json`（`severity` / `message` / `event` / `path`）、Next.js は特になし
- FFmpeg を入れているイメージが 2 つ（muscle と trend_watcher）
- CI のワークフローは `paths: 'nue/brain/**'`、`'nue/muscle/**'` を見ているが、リポジトリの直下は `brain/`、`muscle/` なので、今の構成ではこの条件に一致しない

## 移行後の Rust crate

### 構成

crate は `muscle` 1 つ、ソースは `muscle/src/main.rs` の 1 ファイル（1,446 行）です。モジュール分割はまだしていません。

| 依存 | バージョン | 用途 |
| --- | --- | --- |
| `serde` / `serde_json` | 1.0 | 編集指示書・ジョブ状態の読み書き |
| `notify` | 6.1 | `data/raw`・`data/json` の監視 |
| `anyhow` | 1.0 | エラーの伝播と `context` |
| `reqwest` | 0.13.2（`blocking`, `json`, `rustls`） | Gemini REST API |
| `base64` | 0.22.1 | inline 入力のエンコード |
| `rand` | 0.8 | 現在のソースでは未使用 |

Gemini は SDK ではなく、`reqwest::blocking` で REST を直接叩いています。async ランタイムは入っていません。

### サブコマンド

引数の解釈は `main()` の中で `args[1]` を見るだけの素朴なものです。

| コマンド | 処理 |
| --- | --- |
| `muscle` | `data/json` を監視し、置かれた指示書をレンダリング（移行前の動き） |
| `muscle analyze <video> [--out <plan>]` | 指示書 JSON を作る |
| `muscle render <plan>` | 指示書 1 枚をレンダリング |
| `muscle run <video> [--out <video>]` | analyze → render を続けて実行 |
| `muscle worker` | `data/raw` を監視して analyze → render（compose の既定） |

データの置き場所は `NUE_DATA_DIR` → `/app/data`（`DEFAULT_DATA_DIR`）→ カレントの `data` の順に探します。Next.js 側の `dataDir()` も `NUE_DATA_DIR` → `DATA_DIR` → `/app/data` → 開発時は `../data` と、ほぼ同じ順で探します。2 つのプロセスが同じディレクトリを見ることが、このシステムの唯一の契約です。

## 編集指示書のスキーマ

### Rust 側の型

レンダラーが読むのは次の型です。

```rust
// muscle/src/main.rs
#[derive(Debug, Deserialize)]
struct Cut {
    start_time: String,
    end_time: String,
    caption: Option<String>,
    caption_style: Option<CaptionStyle>,
    focus_point: Option<f64>,
}

#[derive(Debug, Deserialize)]
struct Analysis {
    cuts: Vec<Cut>,
    original_filename: String,
    job_id: Option<String>,
    bgm_path: Option<String>,
    se_events: Option<Vec<SeEvent>>,
    visual_effects: Option<Vec<VisualEffect>>,
    thumbnail: Option<Thumbnail>,
}
```

`CaptionStyle` は `font` / `color` / `position` と、JSON の `box` を `#[serde(rename = "box")]` で受ける `start_box` を持ちます。`SeEvent` は `timestamp` と `type`、`VisualEffect` は `start` と `type`、`Thumbnail` は `timestamp` / `text` / `color` です。

`#[serde(deny_unknown_fields)]` は付けていないので、知らないフィールドは黙って捨てられます。

### プロンプトが求める形と、実際に使われるもの

`edit_plan_prompt()` は Gemini にもう少し多くのフィールドを求めています。

| フィールド | プロンプト | Rust が読む | 使われ方 |
| --- | --- | --- | --- |
| `cuts[].start_time` / `end_time` | `HH:MM:SS` | ○ | 切り出し区間 |
| `cuts[].focus_point` | 0.0〜1.0 | ○ | 縦型クロップの横位置 |
| `cuts[].caption` / `caption_style` | ○ | ○ | `drawtext` |
| `cuts[].caption_style.background_asset` | ○ | × | 未使用 |
| `cuts[].description` / `filter` / `transition_type` | ○ | × | 未使用（色フィルタはコメントアウト、トランジションは後述） |
| `editing_style.tempo` / `mood` | ○ | × | 未使用（Python では BGM 選択に使っていた） |
| `se_events[].timestamp` / `type` | ○ | ○ | 効果音の位置と種類 |
| `se_events[].tag` | ○ | × | 未使用 |
| `visual_effects[].start` / `type` | ○ | ○ | ズーム |
| `visual_effects[].end` / `speed` | ○ | × | 未使用 |
| `thumbnail` | ○ | ○ | サムネイル |
| `bgm_path` | なし | ○ | 未指定なら `data/bgm/default_bgm.mp3` |

「プロンプトに書いてあるが使っていない」フィールドがかなりあります。逆に、Web 画面がアップロード時に `<file>_metadata.json` として保存する台本（`script`）、手動指示（`manual_instructions`）、オプション（`options`）は、Python の Brain は `merge_instructions` で指示書に反映していましたが、Rust 側はまだ読んでいません。スキーマを Rust 側で管理するという方針（`docs/migration-plan.md` Step 2）の、まだ途中の状態です。

時刻は文字列です。`parse_time` は 3 つ目のフィールドが 59 を超えたら `MM:SS:mmm` とみなす推測を入れて、LLM の書き方の揺れを吸収しています。

## 解析（analyze）

### 入力の渡し方：18MB で分岐

`generate_edit_plan_with_gemini` は、ファイルサイズで渡し方を変えます。

| 条件 | 方式 | 処理 |
| --- | --- | --- |
| `<= 18 * 1024 * 1024` バイト | inline | ファイル全体を読み、base64 で `inline_data` に入れる |
| それより大きい | Files API | resumable upload → `state` が `ACTIVE` になるまで待つ → `file_data.file_uri` で参照 |

Files API は 2 段階です。`X-Goog-Upload-Command: start` で開始し、返ってきた `x-goog-upload-url` に `upload, finalize` で本体を送ります。そのあと `state` をポーリングし、`ACTIVE` で抜け、`FAILED` や想定外の値なら `bail!` します。間隔は 2 秒、上限は 30 回なので、待つのは最大でおよそ 1 分です。Python の Brain は `while state == "PROCESSING"` で上限なしに待っていたので、ここは Rust 版で上限が付きました。

どちらの方式でも、ファイルは `fs::read` で一度に全部メモリに読みます。inline の場合はさらに base64 で約 4/3 倍になります。

### 生成と JSON の取り出し

リクエストには `response_mime_type: "application/json"` を付け、`candidates[0].content.parts[0].text` を取り出します。コードフェンス付きで返る場合に備えて `strip_json_fence` ではがしてから `serde_json::from_str` にかけます。モデルは `GEMINI_MODEL`、未設定なら `gemini-2.5-flash` です。

結果の `original_filename` と `job_id` は Rust 側で上書きします。

### 失敗したら「全部そのまま」の指示書

API キーがない、HTTP エラー、JSON として壊れている。どの失敗でも、`analyze_video` は `match` で `Err` を受けて `WARN`（`analyze_fallback`）を出し、`fallback_edit_plan` の指示書を書きます。

fallback は、`00:00:00` から動画の長さまでの 1 カットだけ、字幕なし、効果音なし、サムネイルなしの指示書です。長さは `ffprobe -show_entries format=duration` で取り、取れなければ 60 秒とみなします。AI が答えなくても、縦型に整えた動画は必ず出てくる、という割り切りです。

### 進捗の値

`data/jobs/<job_id>.json` は、`uploaded`（10、Next.js が書く）→ `analyzing`（30）→ `rendering`（60、70）→ `completed`（100）と進み、連結に失敗したときだけ `failed`（100）になります。

## レンダリング（render）

### 1 本の filter_complex から、セグメント方式へ

1363a0a 時点の Muscle は、すべてを 1 回の `ffmpeg` と 1 本の `-filter_complex` で処理していました。カットごとに `trim` / `atrim` し、`xfade` と `acrossfade` で 0.5 秒のトランジションをかけてつなぎ、BGM は `aloop` でループさせて `sidechaincompress` で話し声に合わせて下げる、という構成です（`threshold=0.05:ratio=4:attack=100:release=300`）。トランジションで出力の時間軸がずれるので、効果音のために「元動画の時刻 → 出力の時刻」の対応表（`time_map`）まで持っていました。

760043e で、これを「カットごとに別ファイルへエンコードし、concat demuxer でつなぎ、最後に音だけ混ぜる」方式に書き直しています。コード上のコメントは `Process video using segment-based approach to avoid filter_complex limitations` です。その代わり、`xfade` / `acrossfade` / `sidechaincompress` / `time_map` はこの時点で消えています。

### 1 カット = 1 回の ffmpeg

`process_single_segment` が組み立てるコマンドは次のとおりです。たとえば `00:00:03`〜`00:00:08`、`focus_point: 0.5`、`zoom_in`、字幕「WOW!」黄色・下・箱ありのカットなら、こうなります。

```bash
ffmpeg -y -ss 3.000 -i data/raw/<uuid>.mp4 -t 5.000 \
  -vf "scale=-2:1920,crop=1080:1920:(iw-1080)*0.5:0,\
crop=iw/1.25:ih/1.25:(iw-out_w)/2:(ih-out_h)/2,scale=1080:1920,\
drawtext=fontfile=/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc:text='WOW!':\
fontcolor=yellow:fontsize=80:x=(w-text_w)/2:y=h*0.85:box=1:boxcolor=black@0.5:boxborderw=5:\
enable='between(t,0,5)'" \
  -c:v libx264 -preset fast -crf 23 -pix_fmt yuv420p -c:a aac -b:a 128k \
  data/temp/seg_0000.mp4
```

実際はシェルを通さず `Command::new("ffmpeg").arg(...)` で 1 引数ずつ渡しています。フィルタの順序は次の 3 段です。

1. **縦型クロップ**：高さを 1920 に合わせ、幅 1080 を `(iw-1080)*focus_point` を左端にして切り出す。
2. **ズーム**：カットの区間内に開始時刻がある最初の `visual_effects` を 1 つだけ採用し、`zoom_in` は 1/1.25、`zoom_out` は 1/1.1 の中央クロップをして 1080×1920 に戻す。区間全体に固定倍率でかかるので、時間とともに動く Ken Burns ではありません。
3. **字幕**：`drawtext` をカットの全区間に出す。`'` は消し、`:` は `\:` にエスケープ。

字幕の設定は `get_drawtext_config` が決めます。`font: serif` なら `NotoSerifCJK-Bold.ttc`、`position` は `top` が `h*0.1`、`center` が `(h-text_h)/2`、それ以外は縦型の UI を避けた `h*0.85` です。

`-ss` は `-i` の前に置いています（コメントは `CRITICAL: -ss BEFORE -i for accurate seeking`）。

### 連結と音の filter graph

セグメントのパスを `data/temp/concat_list.txt` に `file '<path>'` の形で書き、concat demuxer で読みます。映像は `-c:v copy` で再エンコードしません。セグメントを同じ設定でエンコードしているので、そのままつなげます。

音は `-filter_complex` で混ぜます。BGM があり、効果音が `00:00:05` と `00:00:12`、カットの合計が 30 秒なら、生成される filter graph は次のとおりです。

```text
[0:a]volume=1.3[v_in];
[1:a]volume=0.08[bgm];
[2:a]adelay=5000|5000,volume=0.8[se2];
[3:a]adelay=12000|12000,volume=0.8[se3];
[v_in][bgm][se2][se3]amix=inputs=4:duration=first,afade=t=out:st=28.000:d=2[aout]
```

| 入力 | 音量 | 備考 |
| --- | --- | --- |
| `[0:a]` 連結した本編 | 1.3 | コメントは `Standardized to 1.3 - safe boost` |
| BGM | 0.08 | ループなし。`duration=first` なので本編の長さで切れる |
| 効果音 | 0.8 | `adelay` で位置合わせ。元は 0.2 で、760043e で 0.8 に |

最後は `-map 0:v -map [aout] -c:v copy -c:a aac -t <合計秒数>` で `data/output/<stem>_edited.mp4` に書きます。`-t` でカットの合計に長さを固定し、`afade` で最後の 2 秒をフェードアウトさせます。

### 効果音の選び方

`get_se_file` は、`type` に `funny` か `whoosh` を含めば `SYNTH_WHOOSH.wav`、それ以外はすべて `SYNTH_DON.wav` を返します。コメントによると、どちらもノイズを含まないように合成した音（ピンクノイズのスウッシュとサイン波の「ドン」）です。また、このパスは存在確認をしません。コメントは `FFmpeg will error if file is missing, which is better than silence.` で、「鳴らないまま気づかない」より「FFmpeg が落ちて気づく」方を選んでいます。

### サムネイル

元動画の `thumbnail.timestamp` の 1 フレームを `-vframes 1` で取り出し、`eq=saturation=1.5:contrast=1.2` と `fontsize=120`・`borderw=5` の `drawtext` をかけた JPEG にします。色は `yellow` / `red` / `cyan`、それ以外は `white`。縦型クロップはかけず、元の画角のままです。ファイル名は `original_filename` に `_thumb.jpg` を付けるので、拡張子が 2 つ並んだ名前になります。

### ソースを読んでわかる、時間軸のずれ

効果音の `adelay` には、指示書の `timestamp`（**元動画の時刻**）をそのまま使っています。一方で、`adelay` がかかるのは **カットをつないだあとの音** です。カットの間を飛ばしていると、そのぶん効果音が後ろにずれます。旧版の `time_map` が担っていた変換が、書き直しで抜けたままになっています。

もう 1 つ、旧版は `check_audio_stream` で音声トラックの有無を調べ、なければ `anullsrc` で無音を作っていました。今の版にはこの分岐がないので、音声トラックのない素材では `[0:a]` が見つからず連結が失敗するはずです。リポジトリには `data/sample_no_audio.mp4` があるので、テストを書くときの最初の題材になります。

## 並行性

README には「concurrent architecture in Rust」とありますが、今のコードは **完全に逐次** です。

- `notify` の受信ループの中で `process_raw_job` を同期的に呼ぶので、1 本処理している間、次のイベントは待たされる
- カットも `for` で 1 本ずつ `ffmpeg` を起動する
- async ランタイムもスレッドプールもない

監視まわりの定数は、`Config::default().with_poll_interval(Duration::from_secs(2))` と、検出後の `std::thread::sleep(Duration::from_secs(1))` です。1 秒待つのは、書き込み途中のファイルを読まないための保険です。

並列化を入れる前に直す必要があるのが、一時ファイルの名前です。セグメントは `data/temp/seg_{:04}.mp4`、連結リストは `data/temp/concat_list.txt` で、**ジョブ ID を含んでいません**。worker が逐次処理しているうちは問題になりませんが、2 本を同時に処理したり、worker が動いているところで CLI の `muscle run` を叩いたりすると、同じファイルを上書きし合います。

## エラー処理と再実行

### 二重処理の防止

worker は起動時に `data/raw` を一度走査し、そのあと Create / Modify / Any のイベントを拾います。同じファイルに何度もイベントが来るので、`job_already_completed_or_rendering` で状態ファイルを読み、`analyzing` / `rendering` / `completed` なら弾いています。`failed` と `uploaded` は弾かないので、失敗したジョブは次にファイルが触られたときに再実行されます。起動時の走査があるので、コンテナが再起動しても `uploaded` のまま残っているジョブは拾い直されます。

### 失敗したときに、状態がどうなるか

エラーは `anyhow` の `?` と `.context(...)` で上に返し、最上位の `process_raw_job` がログに出します。状態ファイルとの関係を整理するとこうなります。

| 失敗する場所 | 状態ファイル | 結果 |
| --- | --- | --- |
| Gemini 呼び出し | `analyzing` → `rendering` | fallback の指示書で続行 |
| 指示書の JSON パース（`render` / worker） | 直前の状態のまま | エラーを返す |
| セグメントのエンコード | `rendering`（70）のまま | エラーを返す。**`failed` にならない** |
| 連結 | `failed`（stderr を message に） | エラーを返す |
| サムネイルの ffmpeg | `completed` + `thumbnail_url` | 終了コードが失敗でもログだけ出して `Ok` |

セグメントで落ちると状態が `rendering` のまま止まり、しかも `job_already_completed_or_rendering` に弾かれるので、自動では再実行されません。Web 画面は 2 秒ごとにポーリングを続けます。サムネイルは逆に、失敗しても `thumbnail_url` が書かれます。どちらも、状態を書く場所が段階ごとに散っていることから来る穴です。

## 一時ファイルと後片付け

| ファイル | 作る場所 | 消すタイミング |
| --- | --- | --- |
| `data/raw/<uuid>.mp4.part` | Next.js | 状態ファイルを書いたあと `rename` |
| `data/raw/<uuid>.mp4_metadata.json` | Next.js | 消さない |
| `data/raw/<name>` のコピー | Rust `analyze_video`（入力が `data/raw` の外のとき） | 消さない |
| `data/temp/seg_0000.mp4` … | Rust | 成功時のみ削除 |
| `data/temp/concat_list.txt` | Rust | 成功時のみ削除 |
| Gemini Files API 上のファイル | Rust | 消さない |

アップロードは `.part` に書いてから `rename` します。`is_video_file` が `.part` で終わる名前を除外しているので、書き込み途中のファイルを worker が拾うことはありません。状態ファイル（`uploaded`）を書いてから `rename` しているので、worker が気づいた時点で状態ファイルは必ずあります。

Python の Brain は、解析が終わると `client.files.delete` で Gemini 側のファイルを消していました。Rust 版にはまだこの処理がありません。CLI の `analyze` で `data/raw` の外の動画を渡すと、`data/raw` にコピーが残る点も、CLI として使うなら整理が要ります。

## Next.js の API route

Go の Gateway がしていたことを、3 つの route handler に移しています。どれも `export const runtime = "nodejs"` です。

| ルート | 処理 | 主なステータス |
| --- | --- | --- |
| `POST /api/upload` | `formData` の `file` を `<uuid><ext>` で `data/raw` に保存、`metadata` があれば `job_id` と `original_filename` を足して保存、状態ファイルを `uploaded` で作成 | 202 / 400 / 500 |
| `GET /api/jobs/[id]` | `data/jobs/<id>.json` を返す | 200 / 400 / 404 |
| `GET /api/output/[...path]` | `data/output` のファイルを返す。`Cache-Control: public, max-age=3600` | 200 / 404 |

パスの検査は 2 つの関数で行います。`safeJobId` は `/^[a-zA-Z0-9._-]+$/` に合わない ID と `..` を含む ID を拒否し、`safeName` は `path.basename(value) !== value` のものや、`..`・`/`・`\` を含むものを拒否します。`/api/output/[...path]` は catch-all ですが、`segments.join("/")` を `safeName` に通すので、実質的にサブディレクトリは使えません。

画面側は `NEXT_PUBLIC_API_URL` が設定されていれば旧 Gateway（`/upload`、`/jobs/:id`、`/output/...`）へ、なければ `/api/...` へ投げます。レスポンスの形（`job_id`、`filename`、`status: "processing_started"`、202）を Gateway と同じにしてあるので、切り替えは環境変数だけで済みます。

気になっている点も書いておきます。

- アップロードは `Buffer.from(await file.arrayBuffer())` で、ファイル全体をメモリに載せてから書いている
- 出力の配信も `readFile` で全体を読んで返しており、`Range` リクエストには対応していない
- Web の Dockerfile は `USER nextjs` で動かす作りだが、共有ボリュームに書き込むために compose 側で `user: "0:0"` を指定している

大きい動画や外に出す運用を考えるなら、どれも先に直す必要があります。

## 運用とコストの考え方

コンテナの数でいうと、こう変わりました。

| | 移行前 | 現在（`docker compose up`） |
| --- | --- | --- |
| 起動するサービス | gateway, brain, muscle, trend_watcher, web | muscle, trend_watcher, web |
| Gemini キーを渡すサービス | brain, trend_watcher | muscle, trend_watcher（brain は legacy） |
| Dockerfile | 5 | 5（legacy を含む） |
| CI ワークフロー | 2（Brain の pylint、Muscle の build/test） | 2 |

Go と Python は `profiles: [legacy]` に退避しただけなので、ファイルとしてはまだ残っています。`docs/migration-plan.md` の Step 6（「`docker compose up` でWebとRust rendererだけが起動する」）は未完了です。Trend Watcher は `profiles` が付いておらず、`restart: "no"` で起動します。

サービスが 1 つ増えるごとに、Dockerfile、ベースイメージ、ロックファイル、CI、ログ形式、環境変数の受け渡しが 1 セットずつ増えます。ひとりで保守していると、これがそのまま開発の速度に効きます。

一方で、インフラを先回りして足すこともしないと決めています。`docs/roi.md` には「今は入れないもの」として、DB ベースのジョブキュー、Redis や分散ワーカー、認証・課金・マルチテナント、S3/GCS が並び、入れる条件も「同時レンダリングで取りこぼしが出たら、ジョブキューを入れる」のように、1 つずつ書いてあります。

同じメモには、10 分尺の動画で人間のレビュー時間 20 分以下、といった成功指標も「仮置き」として書いてあります。実績はまだ取れていません。

言語を戻す条件も決めてあります。Python は Whisper や OpenCV が明確に必要になったときに特定の解析タスクだけ、Go は認証や署名 URL、レート制限を Gateway に集めたくなったときです。

## テスト

正直に書くと、自動テストはまだありません。`muscle/src/main.rs` に `#[test]` は 1 つもなく、Web 側にもテストはありません。CI の Muscle ワークフローは `cargo build` と `cargo test` を走らせる作りですが、上に書いたとおり `paths` がリポジトリの構成と合っていません。

ソースを読んで、最初に足すべきだと考えているのは次の順です。

1. `parse_time` と `seconds_to_hhmmss` の単体テスト（`HH:MM:SS` と `MM:SS:mmm` の境界）
2. `strip_json_fence` と `fallback_edit_plan` が `Analysis` としてデシリアライズできることの確認
3. フィルタ文字列の組み立て（`get_drawtext_config`、音の filter graph）のスナップショット
4. `data/sample_no_audio.mp4` を使った、FFmpeg を実際に呼ぶ結合テスト

3 のためには、フィルタ文字列の組み立てと `Command` の実行を分ける必要があり、`main.rs` のモジュール分割と一緒に進めるつもりです。

## まとめ

3 つのサービスに分けていたときも、まとめ直した今も、「AI が判断する」と「映像を焼く」の境目には同じ **編集指示書の JSON** があります。変えたのは、その境目をプロセスやコンテナの境目にするのをやめたことだけです。

解析とレンダリングは `analyze_video` と `process_instruction` という別の関数のまま 1 つのバイナリに入り、間に JSON を挟むので `analyze` だけ、`render` だけでも動かせます。HTTP は Next.js に寄せ、Rust はファイルだけを見ます。

残っている作業もはっきりしています。手動指示とメタデータのマージ、雰囲気に合わせた BGM 選択の移植、効果音の時間軸の補正、トランジションとダッキングの復活、状態遷移の穴埋め、ジョブごとの一時ディレクトリ、そしてテスト。どれも「サービスを増やす」ではなく「1 つのプログラムの中を整える」作業なので、前よりずっと手を付けやすくなっています。
