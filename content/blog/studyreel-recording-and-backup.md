---
title: StudyReel の録画パイプラインを全部書く ── 能動時間のタイムラプス・Vision・CIPixellate・CloudKit
date: 2026-10-19
description: AVCaptureVideoDataOutput から AVAssetWriter へ、勉強していた時間だけで間引くタイムラプス。Vision で 0.2 秒おきに顔を追い、確認画面のあとで CIPixellate を楕円マスクで合成する非破壊のモザイク。SwiftData の CloudKit 同期で起動時に落ちた件と、iCloud Drive へのファイルバックアップ。
tags: [StudyReel, Swift, iOS, AVFoundation, Vision, SwiftData]
type: tech
---

> これは技術編です。アプリの中で何をしているかを読みやすくまとめた読みもの版は「[StudyReel の「タイムラプス」と「バックアップ」の中身](/blog/studyreel-behind)」にあります。

StudyReel は、机にスマホを置いて勉強すると、その様子をタイムラプスで残せる iOS アプリです。この記事では、録画から書き出し、バックアップまでの中身を、ソースを引用しながら書きます。

## 全体の流れ

```text
AVCaptureSession（前面カメラ）
  → AVCaptureVideoDataOutput（32BGRA、videoQueue）
  → captureOutput(_:didOutput:from:)
       ├ FaceTracker.process()      … 0.2 秒おきに顔の位置だけ記録
       ├ 能動時間 activeSeconds を積算
       └ モードごとに AVAssetWriter へ append
            timelapse: N 秒（能動時間）ごとに 1 コマ → 10 fps
            full:      全フレーム → 能動時間を PTS に（5 Mbps）
  → finish() → 確認画面（顔の範囲を区間ごとに調整・無効化）
  → VideoExporter：文字・透かし・モザイクを合成して書き出し
```

ポイントは、**録画中は加工しない** ことです。生の映像と「顔の位置の時系列」を別々に持っておき、合成は確認画面のあとでやります。

## 1. 「勉強していた時間」で刻むタイムラプス

### 写真を撮って並べるのではない

一般的なタイムラプスは、一定間隔で静止画を撮って並べます。StudyReel は、ビデオ出力のフレームを受け取り続け、**必要なフレームだけ AVAssetWriter に書き込む** 方式です。

```swift
// StudyTimerAndVideo/Utilities/TimeLapseRecorder.swift
private static let timelapseFrameRate: Int32 = 10
private static let fullFrameDuration = 1.0 / 30.0

func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
    guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
    let pts = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
    guard isCapturing else { return }

    faceTracker.process(pixelBuffer, time: pts.seconds)

    // 一時停止していた時間は含めずに、勉強した時間だけを積み上げる
    if let lastFramePTS {
        activeSeconds += max(0, CMTimeSubtract(pts, lastFramePTS).seconds)
    }
    lastFramePTS = pts

    switch mode {
    case .timelapse:
        if let lastCaptureActiveSeconds, activeSeconds - lastCaptureActiveSeconds < interval { return }
        lastCaptureActiveSeconds = activeSeconds
        let time = CMTime(value: frameIndex, timescale: Self.timelapseFrameRate)
        if append(pixelBuffer, at: time) { frameIndex += 1 /* … */ }
    // …
    }
}
```

時刻の基準は壁時計ではなく、カメラが付ける **PTS（presentation timestamp）の差分の積算** です。そして一時停止と再開のたびに `lastFramePTS = nil` に戻します。

```swift
func pause() {
    videoQueue.async {
        self.isCapturing = false
        self.lastFramePTS = nil
    }
}
```

こうすると、再開直後の最初のフレームでは差分を足さないので、**止めていた間の時間は `activeSeconds` に一切入りません**。休憩を 10 分とっても、動画の中の時間の流れは乱れない。インターバル判定もこの能動時間で行うので、「5 秒ごと」は「勉強していた 5 秒ごと」になります。

出力側の時刻は `CMTime(value: frameIndex, timescale: 10)`、つまり 1 コマ = 0.1 秒の固定です。インターバルごとの圧縮率はこうなります。

| 間隔 | 勉強 1 時間あたりのコマ数 | 動画の長さ | 倍速 |
| --- | --- | --- | --- |
| 2 秒 | 1,800 | 180 秒 | 20 倍 |
| 5 秒（標準） | 720 | 72 秒 | 50 倍 |
| 10 秒 | 360 | 36 秒 | 100 倍 |
| 30 秒 | 120 | 12 秒 | 300 倍 |

### 全部録画（Pro）

全部録画は全フレームを書き込みますが、PTS をそのまま使うと一時停止の空白が動画に残ります。そこで **能動時間をそのまま PTS にし**、単調増加が崩れたときだけ 1/30 秒進めます。

```swift
case .full:
    var time = CMTime(seconds: activeSeconds, preferredTimescale: 600)
    if let lastAppendedTime, CMTimeCompare(time, lastAppendedTime) <= 0 {
        time = CMTimeAdd(lastAppendedTime, CMTime(seconds: Self.fullFrameDuration, preferredTimescale: 600))
        activeSeconds = time.seconds
    }
```

timescale 600 は 24/25/30/60fps のどれでも割り切れる、動画でよく使う値です。書き出しは H.264 で、全部録画のときだけ平均ビットレートを **5 Mbps** に固定しています。1 時間で 5,000,000 × 3,600 ÷ 8 ≈ **2.25 GB**。長時間になるので、ここは容量優先です。

```swift
var settings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: Int(canvasSize.width),   // 1920 or 1280（縦持ちなら縦横入れ替え）
    AVVideoHeightKey: Int(canvasSize.height)
]
if mode == .full {
    settings[AVVideoCompressionPropertiesKey] = [AVVideoAverageBitRateKey: 5_000_000]
}
```

### 落ちても書きかけを拾う

録画中は 30 秒おきに「書きかけの動画のパス、キャンバスサイズ、顔の位置の時系列」を控えとして保存しています。アプリが途中で落ちても、次の起動で書きかけの動画を拾えるようにするためです。

### 机に置いたままにするための周辺

- **画面を暗くして撮り続ける**：`UIScreen.brightness` を 0.02 に下げ、タップで元の明るさに戻す。元の値は `brightnessBeforeDim` に退避しておく
- **自動ロックを止める**：記録中だけ `isIdleTimerDisabled = true`
- **カメラが取られたら**：電話や画面分割で `AVCaptureSession.wasInterruptedNotification` が来たら状態を出し、`interruptionEndedNotification` で戻す
- **アプリを離れたら**：カメラは止まるが、タイマーは動き続ける。戻ってきたら再開のカードを出し、離れていた間の勉強時間は `elapsedOffset` で動画上の表示に反映する

正直に書くと、**発熱（`ProcessInfo.thermalState`）を見て撮影を変える処理はまだありません**。今は長時間録画なら充電しながら、と案内しているだけで、ここは課題です。

## 2. 顔のモザイク：端末内で追い、あとで合成する

### 追跡

```swift
// StudyTimerAndVideo/Utilities/FaceTracker.swift
private let detectionInterval = 0.2
private let holdDuration = 1.5
```

- **0.2 秒おき** に `VNDetectFaceRectanglesRequest`。毎フレームはやらない
- 複数見つかったら面積最大の顔を採用し、髪やあごまで隠れるよう **幅 1.5 倍・高さ 1.7 倍**、中心を顔の高さの 0.1 だけ上に寄せて広げる
- 前回位置と `lerp(..., 0.6)` で平滑化して、枠のガタつきを抑える
- 勉強中はうつむいて顔を見失いやすいので、見失っても **1.5 秒** は直前の位置を保持
- それでも見つからなければ `VNDetectHumanRectanglesRequest`（`upperBodyOnly = true`）で上半身を探し、その **上側 50%・幅 75%** を頭とみなす
- 上半身もだめなら、直前の顔の周りを広めに（幅 2 倍）。一度も検出できていなければ画面上部の `(0.15, 0, 0.7, 0.45)` を隠す。手元のノートまでは隠さないよう、下側は顔の少し下で止める

検出状態（顔・推定）が切り替わるたびに `segment` 番号を進めます。これが、確認画面で「この区間だけ枠をずらす」「この区間はモザイクを外す」といった操作の単位になります。

### 時系列の保存と補間

位置はフレームごとに保存するのではなく、サンプルとして持ちます。タイムラプスは書き込んだコマごと、全部録画は 0.2 秒おき。書き出し時は、同じ segment の隣り合うサンプルの間を **線形補間** します。

```swift
// StudyTimerAndVideo/Models/FaceTrack.swift
if b.segment == a.segment, b.time > a.time, time > a.time {
    let t = CGFloat(min(1, (time - a.time) / (b.time - a.time)))
    return (Self.lerp(a.rect, b.rect, t), a.segment)
}
```

segment が変わる境目では補間しません。顔から上半身推定に切り替わったときに、枠が画面を横切って飛んでいくのを防ぐためです。

### 合成：CIPixellate を楕円マスクで

```swift
// StudyTimerAndVideo/Utilities/VideoExporter.swift
let pixellated = image.clampedToExtent()
    .applyingFilter("CIPixellate", parameters: [
        kCIInputScaleKey: max(canvasSize.width, canvasSize.height) * 0.03,
        kCIInputCenterKey: CIVector(x: ciRect.midX, y: ciRect.midY)
    ])
    .cropped(to: ciRect)
```

- モザイクの粗さは **長辺の 3%**（1080p なら約 58px のブロック）。解像度が変わっても見た目の粗さが同じになる
- `CIPixellate` の中心を顔の中心に合わせ、ブロックの格子が顔の中央でそろうようにする
- `clampedToExtent()` してから掛けるのは、画面の端でブロックが透明な外側を拾って黒くにじむのを防ぐため
- `CIRadialGradient`（半径 0.94 → 1.0 で不透明 → 透明）で円を作り、顔の範囲の縦横比に合わせて **楕円** に伸ばしてマスクにする。四角いモザイクより人の頭の形に合い、縁もわずかにぼけてなじむ
- `CIBlendWithAlphaMask` で元の映像に重ねる

Vision の処理も合成も、すべて端末の中です。顔の位置の時系列は、確認画面と書き出し（と、落ちたときの復旧用の控え）のために端末内で持つだけで、外には送りません。モザイクは無料、スタンプで隠す方法は Pro の機能です。

## 3. SwiftData × CloudKit で、起動時に落ちた

記録は SwiftData（`StudySession`・`Tag`・`DailyGoal`・`StudyMaterial`）に保存しています。iCloud のエンタイトルメントがあると、**SwiftData は何も指定しなくても CloudKit との同期を始めようとします**。ところが CloudKit と同期するモデルには「全プロパティが省略可能か既定値を持つ」などの条件があり、今のモデルはそれを満たしていませんでした。結果、`ModelContainer` の生成で **起動直後にクラッシュ** しました。

対処は、同期を明示的に切ることです。

```swift
// StudyTimerAndVideo/StudyTimerAndVideoApp.swift
// iCloud の権限があると SwiftData は CloudKit 同期を自動で始めようとし、
// 今のモデルは CloudKit の条件（全項目が省略可能など）を満たさないので起動時に落ちる。
// バックアップは iCloud Drive にファイルで送っているので、CloudKit 同期は使わない
let configuration = ModelConfiguration(cloudKitDatabase: .none)
container = try ModelContainer(
    for: StudySession.self, Tag.self, DailyGoal.self, StudyMaterial.self,
    configurations: configuration
)
```

モデルを CloudKit の条件に合わせて書き換える道もありました。ただ、それは全項目を Optional にしてアプリ中の扱いを変える大きな変更になり、しかも欲しかったのは **端末間のリアルタイム同期ではなく「機種変更や再インストールで消えないこと」** でした。そこでバックアップを、CloudKit ではなく **iCloud Drive へのファイルコピー** として作り直しました。

## 4. iCloud Drive へのファイルバックアップ

- エンタイトルメントは `CloudDocuments` のみ。コンテナは `iCloud.com.ni.StudyTimerAndVideo`
- 記録を `backup.json` に書き出し、サムネイルと動画と一緒にコンテナへコピー
- 自動バックアップは **1 日 1 回まで**。アプリが裏に回ったときと、記録を保存したあとに判定
- 復元は **追加のみ**。今ある記録は消さず、バックアップにしかないものだけを足す。重複の判定は、記録は `id`、タグは名前、目標は日付
- `Info.plist` の `NSUbiquitousContainers` で、iCloud Drive に「StudyReel」フォルダを見せている。`StudyReel/Media` に動画とサムネイルが入るので、「ファイル」アプリから家族とフォルダごと共有できる

同期ほど賢くはありません。でも、**何がどこにあるかがユーザーにも見えて、壊れにくく、復元しても今のデータを消さない**。勉強の記録を預かるアプリとしては、この性質の方が大事だと判断しました。注意点として、全部録画の動画は大きいので、iCloud の空き容量が足りないとバックアップが失敗します。

## 5. そのほかの機能の中身

- **教材のバーコード登録**：`DataScannerViewController` で EAN-13（書籍の ISBN）を読み、openBD で書名を引き、見つからなければ国立国会図書館サーチへフォールバック
- **1 週間の Vlog**：今週・先週の記録を縦または横の 1 本にまとめる。BGM も付けられる
- **ウィジェット**：WidgetKit + AppIntent。ホーム画面から 25 分のポモドーロを開始・停止し、終了時刻（`pomodoro_timer_end_timestamp`）を App Group 経由でアプリと共有。Live Activity にも対応

## まだやっていないこと

- `thermalState` を見て、インターバルや画質を自動で落とす
- 長時間の全部録画で、iCloud の空き容量を事前に見積もる

録画は、カメラ・時間・顔・保存と、端末の制約が全部まとめて効いてくるところです。また何か直したら、その中身も書きます。
