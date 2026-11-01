# 写真を使うか、使うならどう作るか

## 判断の根拠

- NN/g の視線計測では、装飾のための大きな写真や、一般的な人物のストックフォトはほとんど見られない。見られるのは、情報を持つ写真（その会社で実際に働く人、実物の製品）。https://www.nngroup.com/articles/photos-as-web-content/
- 例：製品ページでは、製品の写真が詳しく見られる（同じ記事）
- 反例：大きすぎる写真は、作業の邪魔になり、内容を下に押し下げる（同じ記事）

## 決め方

1. その写真がないと伝わらない情報があるか（実物の大きさ、使っている場面、実在の人）。なければ入れない
2. 製品の画面で伝わるなら、画面の再現を優先する（コードの値どおりに組む）
3. 入れるなら、ページの絵柄（このスキルなら、名画の色の置き方）に合わせる。写真だけ浮くなら、色の処理（色温度・明るさ）を揃える
4. 実在しない人や場面を、実在するように見せない。生成した画像には「イメージ」と書く

## 写真を入れるときは、生成用のプロンプトも渡す

画像は自分で生成できない場合がある。そのときは、ユーザーが画像生成ツールに貼れるプロンプトを、日本語と英語の両方で渡す。プロンプトには次の 6 つを必ず入れる。

| 要素 | 書くこと |
|---|---|
| 被写体 | 何が、どこに、何をしているか（人の顔は写さない／後ろ姿など） |
| 構図 | 視点の高さ、画角、余白の位置（見出しを置く側を空ける） |
| 光 | 時刻、光の向き、色温度（絵の型に合わせる） |
| 色 | 主な色 2〜3 色を、測った値に近い言葉で（例：灰みの空色、黄みの白、くすんだ緑） |
| 質感 | 写真か、絵画風か。絵画風なら筆致の方向 |
| 除外 | 文字、ロゴ、実在のブランド、顔、透かし |

### 例：StudyReel の作例に「使っている場面」の写真を足すとしたら

（作例では入れていない。製品の画面の再現と、キャラクターで足りると判断した）

日本語：

> 夕方の自分の部屋。木の机にスマートフォンが小さなスタンドで立てかけてあり、机に向かって勉強している学生を撮っている。学生は後ろ姿か、手元だけが見える。顔は写さない。ノートと鉛筆、マグカップ。窓から入る夕方の光は黄み、部屋の影は青紫。くすんだ空色と、黄みの白、少しだけ深い緑。視点は机の高さ。画面の左 4 割は壁と窓だけにして、文字を置く余白にする。写真だが、色はモネの「日傘をさす女」のように柔らかく、明るさの差は小さめ。文字、ロゴ、ブランド名、透かしは入れない。横長 16:9。

English:

> A student's room in the late afternoon. A smartphone stands on a small stand on a wooden desk, filming a student studying. Show the student from behind or only their hands; no face. Notebook, pencil, a mug. Warm yellowish window light, cool blue-violet shadows. Muted sky blue, yellowish white, a touch of deep green. Camera at desk height. Keep the left 40% of the frame as plain wall and window for headline space. Photographic, but with soft colours and low contrast like Monet's "Woman with a Parasol". No text, logos, brand names or watermarks. 16:9.
