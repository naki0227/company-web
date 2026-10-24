---
title: Useful Map の経路計算を全部書く ── MapKit の ETA から区間を組み立て、Google マップへ時刻ごと渡す
date: 2026-10-19
description: MapKit の公共交通は出発・到着・所要時間しか返しません。そこから乗降地点を推定して区間に割り、時刻を連鎖させ、遅くなる分割を捨てるしくみと、Google マップの非公開 data= URL の生成と毎日の契約監視、タグ 1 つで App Store まで流す CI を、ソースを引用して書きます。
tags: [UsefulMap, Swift, iOS, MapKit, SwiftUI, 設計]
type: tech
---

> これは技術編です。何をつくって、どこでつまずいたかを読みやすくまとめた読みもの版は「[歩くか、電車か、車か。経路を比べて決める地図アプリ Useful Map](/blog/useful-map)」にあります。

Useful Map は、徒歩・公共交通・車の所要時間を比べて「どれで行くか」を決めるための iOS アプリです（iPhone / iPad、iOS 17 以上）。経路は Apple の MapKit で取り、運賃や乗換の詳細は Google マップへ URL で渡します。Google の API は使っていません。

経路を区間に組み立てる部分を中心に、URL の受け渡し、テスト、リリースまでを書きます。数字と定数はリポジトリのソースの値です。

## 全体の構成

コードは SwiftPM のパッケージ `UsefulMapKit` に 4 つのモジュールとして置き、アプリ本体（`App/`）は組み立てだけを行います。

```text
App/                      composition root（実装の組み立てはここだけ）
Packages/UsefulMapKit/
  Sources/Domain/         モデル・ポリシー・ポート（Foundation のみ）
  Sources/Data/           → Domain          永続化 / Google Maps URL 契約
  Sources/Infrastructure/ → Domain, Data    MapKit・Core Location・UIApplication
  Sources/Presentation/   → Domain          SwiftUI 画面と ViewModel
contract-watch/           Playwright による外部 URL 仕様の契約監視
```

| 層 | 依存できる先 | 触ってよい SDK |
| --- | --- | --- |
| Domain | なし | Foundation |
| Data | Domain | Foundation, Combine |
| Infrastructure | Domain, Data | MapKit, CoreLocation, UIKit（+ Contacts） |
| Presentation | Domain | SwiftUI, MapKit, Combine |

依存方向は **モジュール境界でコンパイル時に** 守らせています。許可していない import はそもそもビルドが通りません。その上で `ArchitectureTests` がソースの import 文を静的に読み、`Package.swift` の依存宣言がうっかり増えていないか、各層が許可外のフレームワークを使っていないかを検査します。

Domain は MapKit を知りません。`MKRoute` の代わりに描画用の座標列 `geometry: [Coordinate]` を持ち、2 点間の距離もハバーサイン式（地球半径 6,371,008.8 m）で自前で計算します。

Google マップの内部 URL 形式は Data 層の Google 系ファイルの外に出しません。これは SwiftLint のカスタムルールでも縛っています。

```yaml
# .swiftlint.yml
no_google_url_outside_builder:
  regex: '(!8j|!7e2|/maps/dir/)'
  # GoogleMapsURLBuilder 系・テスト以外の文字列リテラルに出てきたら error
```

## MapKit から取れるもの、取れないもの

設計の出発点は、MapKit が何を返すかです。

| 手段 | API | 取れるもの |
| --- | --- | --- |
| 徒歩・車 | `MKDirections.calculate()` | 所要時間、距離、経路の線（`MKRoute.polyline`） |
| 公共交通 | `MKDirections.calculateETA()` | 所要時間、出発時刻、到着時刻、距離 |
| 停留所 | `MKLocalPointsOfInterestRequest` | `.publicTransport` の POI（駅とバス停の区別なし） |

公共交通は `calculate()` が経路を返さないので `calculateETA()` を使います。返るのは合計だけで、**乗車駅・降車駅・乗換・運賃は分かりません**。また POI のカテゴリは `.publicTransport` の 1 種類しかなく、駅とバス停も区別できません。

1 区間の取得はこうなっています。

```swift
// Packages/UsefulMapKit/Sources/Infrastructure/MapKitRouteService.swift
let directions = MKDirections(request: request)
do {
    try Task.checkCancellation()
    if mode.providesRouteGeometry {
        let response = try await withTaskCancellationHandler {
            try await directions.calculate()
        } onCancel: {
            directions.cancel()
        }
        guard let route = response.routes.first else { throw RouteError.noRoutesFound }
        return RouteLeg(expectedTravelTime: route.expectedTravelTime,
                        distance: route.distance,
                        geometry: route.coordinates)
    }

    let eta = try await withTaskCancellationHandler {
        try await directions.calculateETA()
    } onCancel: {
        directions.cancel()
    }
    return RouteLeg(expectedTravelTime: eta.expectedTravelTime,
                    departureDate: eta.expectedDepartureDate,
                    arrivalDate: eta.expectedArrivalDate,
                    distance: eta.distance > 0 ? eta.distance : nil)
}
```

時刻条件は `request.departureDate` / `arrivalDate` に入れます。公共交通で `.directionsNotFound` / `.placemarkNotFound` が返ったら `unsupportedInRegion`（この地域では公共交通の経路を取得できません）として扱い、徒歩・車の比較は続けます。

## 1 候補 = 1 経路から、ノードと区間の連なりへ

最初の版（MVP）は、仕様書どおり `RouteOption`（1 候補 = 1 経路）を並べる作りでした。徒歩・車は代替経路を最大 3 本、公共交通は ETA を 1 本、`RouteComparator` で所要時間の短い順に並べ、「最適」タブで全モードを横断して比べる形です。

これに「29 分とだけ出ても判断材料にならない」という指摘があり、経路を `RoutePlan`（ノード列 `nodes`、区間ごとの手段 `modes`、取得結果 `legs`、ロックと固定した便）として持ち直しました。`modes` と `legs` は常に `nodes.count - 1` 個です。

`現在地 →徒歩→ 最寄駅 →公共交通→ 到着駅 →徒歩→ 目的地` のように、区間ごとに手段を持てます。`RouteNode` には `isInferred`（自動推定した駅か）と `isCurrentLocation` を持たせ、推定駅を手で選び直したら `isInferred` を落とします。`RouteOption` は消さずに、Google へ 1 区間を渡すときの境界の型として残しました。

![現在地、御茶ノ水駅（推定）、東京駅の 3 つのノードと、そのあいだの徒歩と公共交通の 2 区間を表示した経路の画面](/img/gallery/usefulmap-3-600.webp "RoutePlan をそのまま描いた画面。推定した駅には「推定」と出る")

## 乗降地点の推定

公共交通のプランは、まず出発地と目的地の 2 点だけで作り、両端に最寄りの停留所を差し込みます（`RoutePlanBuilder.insertingStations`）。

| 定数 | 値 | 意味 |
| --- | --- | --- |
| `stationProximityMeters` | 150 m | これ以内なら地点そのものを駅とみなし、徒歩区間を挟まない |
| `stationSearchRadiusMeters` | 5,000 m | 停留所を探す半径。広めに取り、長くなった徒歩は後で割る |
| 候補数 `limit` | 10 | 近い順に最大 10 件 |
| `preferTrainOverMeters` | 3,000 m | 2 点間がこれより遠ければ鉄道を優先 |
| `trainDetourAllowanceMeters` | 400 m | 最寄りより 400 m 遠い程度までなら駅を選ぶ |

駅かバス停かは、POI の名前から推定します。

```swift
// Packages/UsefulMapKit/Sources/Domain/TransitStop.swift
private static let trainMarkers = [
    "駅", "station", "역", "站",
    "新幹線", "地下鉄", "メトロ", "metro", "subway", "rail", "線のりば"
]
private static let busMarkers = [
    "バス停", "停留所", "停留場", "電停", "バスターミナル", "bus stop", "bus terminal",
    "정류장", "公交", "巴士"
]
```

バス → 鉄道の順に手がかりを見て、どちらも無ければバス停に倒します。日本の駅名にはほぼ必ず「駅」が付くからです。この推定は **アイコンと「長距離なら駅を優先」の判断にだけ使い、経路計算には影響させていません**。外れても、最寄りを選ぶ規則に戻るだけです。

## 時刻を連鎖させる

区間を埋めるのが `RoutePlanner.computeLegs` です。ここで一度、大きく間違えていました。

実機で私鉄の区間を調べたところ、指定していない途中駅が 2 つ挟まり、直通 26 分の経路が 29 分と表示されていました。原因の 1 つ目は、**全区間を「今から出発」で検索していた** ことです。徒歩 7 分で駅に着く前提なのに、その 7 分を無視して「今出る電車」を探していました。

いまは、前の区間に着いた時刻をカーソルとして持ち、次の区間をその時刻からの出発で問い合わせます。

```swift
// Packages/UsefulMapKit/Sources/Domain/RoutePlanner.swift
var cursor: Date? = plan.timePreference == .arriveBy
    ? nil
    : (plan.requestedDate ?? now())

for (index, segment) in plan.segments.enumerated() {
    guard segment.leg == nil else {
        cursor = advanced(cursor, by: segment.leg)
        continue
    }
    try Task.checkCancellation()
    var condition = timeCondition(for: plan, at: index)
    if plan.pinnedSegmentIndex == nil, index > 0, let cursor {
        condition = (.departAt, cursor)
    }
    var leg = try? await routing.leg(from: segment.from.place,
                                     to: segment.to.place,
                                     mode: segment.mode,
                                     timePreference: condition.preference,
                                     requestedDate: condition.date)
    // … 便を固定している区間の処理
}
```

公共交通なら ETA の到着時刻、徒歩・車なら所要時間を足した時刻へ進めます。`try?` にしているので、1 区間の取得に失敗してもその区間が空になるだけで、他の区間は残ります。次の区間の条件が前の区間の結果で決まるので、区間の取得は **順番に** 行います。

## 再帰分割

区間が埋まったら、`refine(_:depth:)` で割れるところを割ります。方針は `RouteRefinementPolicy` にまとめています。

| 定数 | 既定値 | 意味 |
| --- | --- | --- |
| `walkingSplitThreshold` | 15 分 | 徒歩がこれを超えたら公共交通で置き換えを試す |
| `minimumImprovement` | 3 分 | 置き換えでこれ以上短くならなければ採用しない |
| `stopSearchRadius` | 5,000 m | 乗降地点を探す半径 |
| `maxDepth` | 2 | 再帰の深さの上限 |
| `preferTrainOverMeters` | 3,000 m | これより長い区間は鉄道を優先 |
| `transitSplitThreshold` | 10 分 | 公共交通がこれを超えたら中継地点を探す |
| `maxProbesPerSegment` | 3 | 1 区間あたりに試す中継地点の数 |
| `maxDepartureProbes` | 4 | 便を選び直すときに出発時刻をずらして試す回数 |
| `departureProbeStep` | 10 分 | ずらす幅 |

```swift
public func refine(_ plan: RoutePlan, depth: Int) async throws -> RoutePlan {
    guard depth > 0 else { return plan }

    if let split = try await refiningWalking(plan) {
        return try await refine(split, depth: depth - 1)
    }
    if let split = try await refiningTransit(plan) {
        return try await refine(split, depth: depth - 1)
    }
    return plan
}
```

### 長い徒歩を割る

15 分を超える徒歩区間について、両端の近くの停留所を探し、`徒歩 → 公共交通 → 徒歩` の 3 本を実際に取得します。合計が元の徒歩より **3 分以上** 短くなったときだけ差し込みます。「最寄りの駅が遠いなら、近くのバス停まで歩いてバスに乗る」に相当する処理です。区間の端そのものに当たる停留所（150 m 以内）は、挟んでも区間が分かれないので候補から外します。

### 公共交通の中を割る

公共交通の区間が 10 分を超えたら、両端の中点の近くから中継地点の候補を最大 3 つ取り、`A → M` と `M → B` を実際に検索します。最初の実装は「`ETA(A→M) + ETA(M→B)` が `ETA(A→B)` とほぼ等しければ経路上とみなす」もので、許容は「15% 以内の悪化」でした。これが先ほどの 26 分 → 29 分を通していた 2 つ目の原因です。

いまは、2 本目を **1 本目に着いた時刻から** 検索し、待ち時間込みの実際の所要時間で比べます。

```swift
// Packages/UsefulMapKit/Sources/Domain/RoutePlanner+Splitting.swift
let connection = first.arrivalDate
guard let second = try? await routing.leg(from: candidate, to: segment.to.place,
                                          mode: .transit,
                                          timePreference: connection == nil ? .now : .departAt,
                                          requestedDate: connection) else { continue }

let combined = actualDuration(first: first, second: second, departure: departure)
// 少しでも遅くなるなら割らない。
guard combined <= budget else { continue }
```

```swift
private func actualDuration(first: RouteLeg, second: RouteLeg, departure: Date?) -> TimeInterval {
    if let start = departure ?? first.departureDate, let end = second.arrivalDate {
        return end.timeIntervalSince(start)
    }
    return first.expectedTravelTime + second.expectedTravelTime
}
```

所要時間の和ではなく **着時刻の差** で測るので、乗り継ぎの待ちがそのまま数字に出ます。直通列車に乗ったままの区間は、途中駅で区切ると次の便を待つ扱いになって必ず遅くなるため、この規則で自然に直通のまま残ります。

## 時刻表は、時刻を持つ区間から前後へ伸ばす

MapKit は徒歩に時刻を返さないので、最初の区間が徒歩だと全体の出発時刻が nil になり、時刻付きの URL を作れない不具合がありました。`RoutePlan.schedule()` は、時刻を持つ最初の区間（便を固定していればその区間）を起点に、前は所要時間を引き、後は足して時刻を埋めます。画面の区間の時刻と全体の発着時刻は、すべてこの表から出しています。

## ユーザーの指定を自動推定から守る

区間を自動で割り直す仕組みがあると、ユーザーが手で直した内容を上書きしかねません。そこで、ユーザーが決めたこと（手段・選んだ便の時刻・そのときの区間と所要時間）を `SegmentLock` として持ちます。


キーは配列の添字ではなく **区間の両端の地点の ID** です。添字はノードの挿入や削除でずれるので、別の場所を編集してもロックが生き残るようにしました。`Place.id` は `"名前@緯度,経度"`（小数 7 桁）です。

- 区間の手段を手で変えると、その区間がロックされる
- `RoutePlan.applyPreset` は、手段がロックされた区間を変えない（画面のプリセットボタンは `rebuild(preset:)` で両端から組み直す）
- 出発地と目的地を入れ替えると、キーを `reversed` にしてロックを引き継ぐ
- 自動推定した駅を外すと「ここは通らない」という意思表示とみなし、統合後の区間をロックする。自分で足した経由地を外した場合はロックしない
- ロックされた区間は `refiningWalking` / `refiningTransit` の対象から外れる

## 所要時間を「指紋」にして便を選び直す

区間の便を固定すると、その時刻を基準に、前の区間は「到着時刻指定」、後の区間は「出発時刻指定」で取り直します（`timeCondition(for:at:)`）。

難しいのは、再取得したときに **同じ便を取り戻せるか** です。MapKit は路線名を返さないので、「同じ経路か」を直接比べられません。そこで、選んだときの所要時間を指紋として記録しておき、所要時間が近い便を探します。

```swift
public struct DurationTolerance: Hashable, Sendable {
    public var relative: Double
    public var absolute: TimeInterval

    public init(relative: Double = 0.10, absolute: TimeInterval = 120) { … }

    public func matches(expected: TimeInterval, actual: TimeInterval) -> Bool {
        let allowed = max(expected * relative, absolute)
        return abs(actual - expected) <= allowed
    }
}
```

許容差は「10% か 120 秒の緩い方」です。22 分の区間なら 132 秒、10 分の区間なら 120 秒になります。

`matchingLeg` は、まず普通に取った結果が一致するかを見て、だめなら出発時刻を 10 分ずつ、最大 4 回ずらして問い合わせ、一致したものを返します。一致しなければ、最も近かったものを返します。

それでも一致しないときに、**勝手に置き換えない** のがこの部分の要点です。画面には選んだ内容をそのまま残し、最新の結果は `PendingSegmentUpdate` として「この区間が変わっています（たとえば「選択中 22分 → 最新 25分」）」と出して、「このまま」か「更新する」かを選んでもらいます。差が 1 秒以内なら提案は出しません。

なお、ここまでの便の固定と取り直しは、Domain と ViewModel（`pinTime(_:at:)`）にあり、テストもあります。ただ、画面から使う入り口はありません。区間の時刻を押すと `pickingDepartureAt` は立ちますが、それを受けて便の一覧を出す View がないので、今のアプリではこの処理は呼ばれません。

## 徒歩ペース

MapKit には歩く速さを指定する API がないので、徒歩区間の所要時間にだけ係数を掛けます。ゆっくり 1.25、ふつう 1.0、はやい 0.8 です。ボタンは「ふつう → はやい → ゆっくり → ふつう」の順に回ります。

## 比べる単位：合計の所要時間

いまの画面で比べているのは、プラン全体の合計所要時間（`totalTravelTime`）です。1 区間でも欠けていれば合計を出しません。欠けたまま足すと、実際より短く見えるからです。距離（`totalDistance`）は合算していますが画面には出しておらず、運賃と乗換回数は **取得も推定もしない** と決めています。MVP の `RouteComparator` は Domain に残っていますが、現行の画面からは使っていません。

## 並行処理とキャンセル

### どこを並行にしているか

両端の停留所探しは独立しているので `async let` で並行にしています。区間の取得は、前述のとおり時刻を連鎖させるので順番に行います。

### 問い合わせの数

MapKit には問い合わせの制限があり、分割の候補数（`maxProbesPerSegment = 3`）はそのために絞っています。処理ごとの問い合わせ数は次のとおりです。

| 処理 | MapKit への問い合わせ |
| --- | --- |
| 公共交通プランの両端の停留所 | POI 検索 2 回（並行） |
| 区間の取得 | 未取得の区間の数だけ `MKDirections`（順番に） |
| 長い徒歩区間の分割 1 回 | POI 検索 2 回 + `MKDirections` 3 回 |
| 公共交通区間の分割の試行 1 回 | POI 検索 1 回 + ETA 最大 6 回（3 候補 × 2 本） |
| 固定した便の選び直し | ETA 最大 4 回 |

結果をキャッシュする層はありません。代わりに、取得済みの `leg` を持つ区間は `computeLegs` で問い合わせを飛ばします。編集操作は、影響する区間の `leg` だけを nil に戻す（`invalidateLegs(around:)` など）ので、取り直すのはその区間だけです。

### キャンセルと世代番号

MapKit の呼び出しは、すべて `withTaskCancellationHandler` で包み、Swift のタスクが取り消されたら `MKDirections.cancel()` / `MKLocalSearch.cancel()` を呼びます。分割のループの中でも `Task.checkCancellation()` を挟み、`CancellationError` は握りつぶさずに投げ直します。

ViewModel は `@MainActor` で、編集のたびに前のタスクを `cancel()` して世代番号 `generation` を進め、結果を反映する直前に `currentGeneration == generation` を確かめます。取り消しが間に合わずに古い結果が遅れて返ってきても、世代が違えば画面を上書きしません。検索欄も同じ作りで、入力から 250 ms のデバウンスを挟んでいます（UI テストでは 0）。

## 位置情報

`CoreLocationService` は When In Use の権限だけを要求し、精度は `kCLLocationAccuracyHundredMeters` です。経路の出発地に使うだけなので、100 m 程度で足ります。

`CLLocationManager.location` に直近の位置があればそれを返し、なければ `requestLocation()` で 1 点だけ取ります。待っている continuation は配列で持ち、デリゲートで成功・失敗・権限拒否のどれが来ても全部まとめて resume します。

「現在地」のノードは、プランを作るたびに実際の座標へ解決し直します。権限が拒否されていても、出発地を検索して指定すればすべての機能が使えます。位置情報はアプリの外へ送りません。

## Google マップへの受け渡し

### 区間ごとに、2 地点だけ渡す

Google マップは、**公共交通で経由地を含む経路を扱えません**。経由地を含めると「乗換案内を計算できませんでした」になります。そこで詳細は区間ごとに開きます。区間は必ず 2 地点なので、この制約に構造的に当たりません。Builder 側でも、公共交通なら出発地と目的地だけを渡すようにしています。

区間の時刻は `schedule()` の値を使い、`.departAt` の条件として渡します。「この電車の詳細」がそのまま開きます。

### Primary：時刻付きの内部 data= 形式

公開されている Maps URLs には出発・到着時刻のパラメータがありません。そこで、Google マップの Web UI が生成する `data=` の形式を再現しています。テストに固定しているスナップショットがこれです。

```text
https://www.google.com/maps/dir/{出発地名}/{目的地名}/data=
  !4m14!4m13
  !1m3!2m2!1d139.7649000!2d35.6993000      ← 地点（経度 → 緯度）
  !1m3!2m2!1d139.7671248!2d35.6812362
  !2m3!6e0!7e2!8j1786703520                ← 時刻ブロック
  !3e3                                     ← 移動手段
```

トークンは `!{group}{kind}{value}` の並びで、`m` は「後続 n トークンを束ねるブロック」です。先頭の `!4m14!4m13` は本体のトークン数から計算し、生成した列は `GoogleMapsDataParam.isStructurallyConsistent` でブロック長の整合を検査してから URL にします。

| トークン | 値 |
| --- | --- |
| `!6e` | `0` 出発指定 / `1` 到着指定 |
| `!8j` | 時刻（後述） |
| `!3e` | `0` 車 / `2` 徒歩 / `3` 公共交通 |

座標は小数 7 桁に固定し、地点名は空白を `+` に、それ以外をパーセントエンコードしてパスに載せます。

### 地点に Place ID を入れてはいけない

最初は、地点ブロックを `!1m5!1m1!1s0x0:0x0!2m2!…` としていました。Place ID を要求しない形にするつもりで「中立値」を入れたのですが、実機の Safari で開くと「札幌駅が見つかりませんでした」。Google がこの偽 ID を解決しに行って失敗し、座標を無視していました。

```text
正: !1m3!2m2!1d{longitude}!2d{latitude}
誤: !1m5!1m1!1s0x0:0x0!2m2!1d{longitude}!2d{latitude}
```

### `!8j` は「壁時計を UTC として epoch 化した値」

実測すると、`!8j` は「ローカルで表示したい年月日時分を、そのまま UTC の壁時計として epoch 化した値」でした。`timeIntervalSince1970` をそのまま入れると、日本では 9 時間ずれます。

```swift
// Packages/UsefulMapKit/Sources/Data/GoogleTimestamp.swift
var localCalendar = Calendar(identifier: .gregorian)
localCalendar.timeZone = timeZone
let wallClock = localCalendar.dateComponents([.year, .month, .day, .hour, .minute], from: date)

var utcCalendar = Calendar(identifier: .gregorian)
utcCalendar.timeZone = utc
// wallClock の年月日時分を、秒 0 で UTC の日時として組み直す
```

変換はこの型だけに隔離し、固定値でテストしています。JST 2026-08-14 10:32 は `1_786_703_520`、10:54 は `1_786_704_840` です。素の epoch とちょうど 9 × 3,600 秒ずれていること、23:59 の日付境界でもずれないことも確かめています。

### Fallback：公式 Directions URL

Primary が作れない（時刻が取れない、座標が不正）か、OS が開けなかったときは、公式の `api=1` の形式へ切り替えます。

```text
https://www.google.com/maps/dir/?api=1&origin={lat},{lng}&destination={lat},{lng}&travelmode=transit
```

時刻は引き継げませんが、地点と移動手段は渡せます。結果は `openedPrimary` / `openedFallback` / `failed` の 3 つで、画面に「時刻付きリンクで開きました」などと出します。ただし、開いた先の Google マップが条件を解釈したかどうかは、アプリからは分かりません。それを確かめるのが次の契約監視です。

## 契約監視：毎朝、本物の Google マップを開く

`.github/workflows/google-maps-url-watch.yml` が、毎日 UTC 21:00（日本時間 6:00）に動きます。

fixture は 5 件（出発指定、到着指定、別の地域、駅以外の地点、座標だけの地点）で、Playwright の Chromium で生成側の自己検査と実際の遷移を 1 回ずつ行います（計 10 件）。地点・公共交通モード・出発/到着指定・日付時刻が画面に反映されていれば PASS です。

FAIL したときの流れはこうです。

```text
FAIL → 診断 Artifact（screenshot / trace / HTML report / 最終 URL）
     → Google マップの UI を操作して、同条件の正解 URL を取る
     → data= をトークン単位で構造 diff（文字列 diff ではない）
     → delta debugging で最小の変更集合へ縮める
     → format.json へ当てて全 fixture を再実行
     → 全件 PASS したときだけ修正 PR / それ以外は Issue のみ
```

形式そのもの（トークンの並びと定数）は `contract-watch/format.json` を唯一の正として、`generate-swift.mjs` が `GoogleMapsURLFormat+Generated.swift` を生成します。Swift 側の Builder が持つのは「ブロックを並べて数える」手続きだけで、自動修復の PR には `format.json` と生成された Swift の両方の差分が載り、CI の `generate-swift.mjs --check` が生成物のずれを弾きます。

形式が変わると `GoogleMapsURLBuilderTests` のスナップショットが意図的に落ちます。そこが **形式の変更を人間が承認する場所** です。

## 保存

保存地点と履歴は `UserDefaults` に JSON で保存します。データ量が小さいので SwiftData は入れていません。履歴は検索・経路とも 20 件まで、同じ ID は先頭へ寄せて重複させません。時刻付きの Google URL は保存しません。App Privacy は「Data Not Collected」です。

## iPad

`TARGETED_DEVICE_FAMILY` は `"1,2"` で、iPhone と iPad の両方に出しています。iPhone は縦向きだけ、iPad は 4 方向すべてを許可しています。

画面は全画面の `Map` に上下のシートを `ZStack` で重ねる作りで、サイズクラスで分岐するコードはありません。iPad でも同じ構造のまま、地図が広く見えます。

手を入れたのはテストの側です。iPadOS 26 ではタブバーがフローティングになり、タブの要素が TabBar / Button の下に来ないので、E2E とスクリーンショットではアクセシビリティ識別子で引いています。

## テスト

| 種類 | 件数 | 内容 |
| --- | --- | --- |
| Swift Testing（単体・アーキテクチャ・ローカライズ） | 262 | モデル、分割、時刻、URL 生成、保存、ViewModel の状態遷移とキャンセル |
| 契約監視の単体（node:test） | 22 | data= の分解、URL 生成、構造 diff と最小化 |
| E2E（XCUITest） | 11 | 検索 → 区間分割、手段の切り替え、インライン編集、徒歩ペース、時刻付き遷移、fallback、0 件、保存、経由地追加 など |
| 契約（Playwright） | 10 | 実際の Google マップで条件が保たれるか |

`RoutePlannerTests` だけで 35 件あり、「割ると遅くなる場合は直通のまま残す」「待ち時間で遅くなるなら割らない」「徒歩のあとの電車は、駅に着く時刻から検索する」「一致する便が無ければ、勝手に置き換えず差分として提示する」のように、過去の不具合がそのままテスト名になっています。

E2E は起動引数 `-UITestMode` で、MapKit・Core Location・外部遷移をスタブへ差し替えます。現在時刻は 2026-08-14 10:00（JST）に固定し、`-UITestScenario` で「通常」「経路 0 件」「Primary URL が壊れている」を切り替えます。ネットワークにも実機の位置にも依存せず、`#if DEBUG` の中にあるので Release には入りません。

## CI とリリース

### CI

`ci.yml` は push と PR で動き、`swift test --parallel`（最も速く落ちるので最初）、`swiftlint lint --strict`、jscpd（重複検出）、契約監視の単体テストと生成物の一致チェックを並行で回し、単体テストが通ったら XCUITest の E2E と Periphery（未使用コード検出）に進みます。

正直に書くと、CI は最初のコミットからしばらく赤でした。SwiftLint は `--strict` なのに、警告に下げて逃がしたつもりの 105 件で落ちていました。300 行を超えた 2 つの型は上限を緩めずに、`RoutePlanner+Splitting` などへ責務で切り出しています。

また、ランナーイメージの更新で `/Applications/Xcode.app` が古い Xcode を指し、iPhone 17 のシミュレータが見つからずに落ちたことがあります。いまは composite action `select-toolchain` が一番新しい Xcode を選び、シミュレータを「iPhone 17 → 16 → 15」の順で探します。

### リリース

`release.yml` は `v*` のタグを push したときだけ動き、App Store Connect まで流します。

```text
タグ v1.2.3 → MARKETING_VERSION=1.2.3、ビルド番号 = run_number
  → 一時キーチェーンへ配布用証明書（.p12）を入れる
  → 配布用プロファイルを App Store Connect API から取る
  → xcodebuild archive → -exportArchive
  → make screenshots（5 言語 × iPhone 6.9" / iPad 13"）
  → altool でアップロード
  → 説明文・キーワード・審査メモ・スクリーンショットを API で反映
  → 処理済みのビルドをバージョンへ紐付け
```

`workflow_dispatch` には `dry_run` があり、既定では `altool --validate-app` で止まります。

署名では、自動署名がクラウド署名へ倒れて CI で権限エラーになったため、秘密鍵を手元で作って（Apple へ送るのは CSR だけ）手動署名にしました。署名設定は `project.yml` のアプリターゲットの Release にだけ書きます。コマンドラインで渡すと SwiftPM の各ターゲットにも掛かって落ちるからです。

最初の提出は Guideline 2.1（Information Needed）で差し戻されました。審査用の連絡先が空だったのに、API はこれを弾かなかったのです。いまは連絡先の環境変数が未設定なら提出の処理を止めます。

## 残っていること

1 つは、上で書いた便の固定に、画面からの入り口がないことです。もう 1 つは、MapKit の公共交通が使えない地域での扱いです。後者はアプリ側ではどうにもならないので、徒歩・車の比較を続けられる形を保っています。
