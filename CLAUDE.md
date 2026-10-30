# CLAUDE.md — Mahoroba 勝手に百人町Map

## このプロジェクトは何か
名古屋市東区・百人町周辺の散策マップ。百人町に来た人に渡して帰り道に歩いてもらう／MAHOROBA（株式会社まほろばのWebのまち）から公開して百人町へ来てもらう。**使うのは主にスマホ**。地図アプリとして使える体験を最優先にする。
オーナー：今西浩二（株式会社まほろば）。返答・コミット説明・PR本文は**すべて日本語**で書く。

## 構成
- `public/hyakunincho-map/` … アプリ本体（素のHTML/CSS/JS、Leaflet 1.9.4 は `public/mahobura-map/vendor/` に同梱）
  - `spots.json` … Notion正本の書き出し（30スポット）。**手で編集しない**（`scripts/hyakunincho-map/import.mjs` で再生成する物）
  - `model.js` … 書き出しの検証
  - `owner-address-points.js` … 長屋（みんなのまほろ場）の本人確認済み住所点
  - `coordinate-research.js` / `coordinate-research-data.js` … 調査で確定した座標（spots.json に座標が無い行だけに重ねる）
  - `artworks.js` + `artworks/` … 提供イラスト（水彩）とカードの対応
  - `spot-guides.js` … カードの案内文・開館情報・公式リンク・出典（公式資料から自分の言葉で要約。案内文は 2026-10-30 に Notion の「紹介文」へ反映済み）
- `review/coordinate-research-20261029/` … 座標の出典と照合記録（`research.json`、生成スクリプト `build_research.py`、`README.md`、`NEXT-STEPS-20261030.md`）
- `review/hyakunincho-map/notion-export.json` … データ試験が使うNotion書き出し
- `tests/hyakunincho-map/` … 試験（下記）

## 守ること
1. **場所や名称を推測で確定しない。** 座標・住所・名称は公式資料（名古屋市・愛知県・各施設）と地図データの照合で決め、`research.json` に出典と確認日を残す。分からない物は今西さんに地図リンク付きで質問する。
2. **Notion（勝手に百人町マップスポットDB）への書き込みは、今西さんの許可のもとで行ってよい**（2026-10-30 許可）。書き込む前に、どの行のどの欄を変えるかを今西さんに伝える。公開判断・訪問状況・掲載区分は、今西さんの指示がない限り変えない。書いた内容はPR本文に「Notionに反映済み」として、まだの物は「Notion反映待ち」として列挙する。
3. 画面の文言は**来訪者向け**。制作側の事情（「訪問記録ではない」「公開判断待ち」「入口ではない」等の言い訳）は画面に出さず、README や research.json に置く。マナー（個人宅・学校は道路から見る、等）だけは短く伝える。
4. 個人宅・学校・寺社は「外から眺める」前提の案内にする。
5. 地図の帰属表示（OpenStreetMap／使う背景地図の出典）を必ず表示する。
6. 大きな変更は1つのPRに1テーマ。PR本文に「変えたこと／確かめたこと（試験の結果）／今西さんに見てほしい所」を書く。

## 試験
```
node --test tests/hyakunincho-map/*.test.mjs
node scripts/hyakunincho-map/serve.mjs 8795 &      # 別プロセスで起動
PLAYWRIGHT_MODULE=playwright node tests/hyakunincho-map/coords-browser.cjs
PLAYWRIGHT_MODULE=playwright node tests/hyakunincho-map/artwork-local-v05.cjs
PLAYWRIGHT_MODULE=playwright node tests/hyakunincho-map/artwork-local-supplement-v05.cjs
```
- ブラウザ試験は Playwright が必要（`npm i -D playwright` → `npx playwright install chromium`）。ブラウザのダウンロードが遮断されたら、その旨を報告する（今西さんが環境のネットワーク設定で許可する）。
- 試験は**今の仕様（背景地図は最初から表示・スマホは地図が先・ピン28本など）**に合わせて書かれている。座標の試験（coords-browser）は地図タイルを空画像に差し替えて動く。仕様を変えたら試験も新仕様に更新し、何を変えたかPRに書く。
- 幅 320 / 390 / 1440 で確認する。スマホ幅（390）を主に見る。

## 現在地（2026-10-30）
- ピン28本（調査で確定19＋今西さん確認8＋長屋1）、未確定0、区域2（保存地区は形、百人町は町名ラベル。2026-10-30 更新）。詳細は `review/coordinate-research-20261029/README.md`。
- 10/30に今西さんが未確定8件すべてに回答済み・区域の方針も決定 → `review/coordinate-research-20261029/NEXT-STEPS-20261030.md` を必ず読む。
- 2026-10-30 Notion に反映済み：拡大図Jの名称「旧櫻明荘門」、今西さん確認の8地点の緯度・経度・確認日・確認メモ、30行の紹介文。リポジトリの `spots.json` はまだ 10/29 の書き出しのまま（次に `import.mjs` で書き出し直すと、8地点の座標とJの名称が入る。そのときは試験「canonical export untouched: all coordinates null」などを新しい書き出しに合わせて直す）。

## やることリスト（上から順に。1PR=1項目）
1. **GitHub Pages で公開できるようにする**：`public/` を配信する GitHub Actions ワークフローを追加。公開URLは `https://<ユーザー名>.github.io/<リポジトリ名>/hyakunincho-map/`。`index.html` の `noindex` とCSP（背景地図のタイル配信元）を公開用に見直す。トップ（`public/index.html`）から地図へ飛べるようにする。
2. ~~**未確定8件の確定と画像2枚**~~（2026-10-30 済み）：NEXT-STEPS の回答どおり8地点に座標を付ける（`build_research.py` を更新して再生成）。拡大図Jの表示名は「旧櫻明荘門」。`incoming-images/` の2枚を伊藤家住宅・旧櫻明荘門のカードに紐づける。
3. ~~**区域の表示**~~（2026-10-30 済み。区域はピンに数えない）：白壁・主税・橦木町並み保存地区は OSM way/653386294 の形で塗る（市の指定図・面積14.3haと照合済み）。百人町・黒門町・城番町筋は点。
4. **スマホ優先の作り直し**（背景地図の最初からの表示・同意ボタン廃止・スマホで地図を先に出す、は 2026-10-30 に済み）：背景地図を最初から表示（同意ボタンは廃止）。地図を主役に、一覧は下（またはボトムシート）。ピン↔カード連動は維持。現在地ボタンで現在地へ移動、近い順に並べ替え。
5. ~~**カードの中身を充実**~~（2026-10-30 済み。堀美術館の公式サイトは接続できず、二葉館の紹介ページにリンク）：説明文を公式資料（二葉館「周辺散策」・名古屋市の建築物紹介・名古屋コンシェルジュ）から自分の言葉で要約し、出典を残す。開館時間・休館日・料金（公開施設のみ）、**公式サイトへのリンク**、**Googleマップで道順**（徒歩）リンクを付ける。公式サイトの候補一覧は NEXT-STEPS にある（リンク切れは必ず確認）。
6. ~~**文言の全面見直し**~~（2026-10-30 済み。一覧は長屋から近い順）：上の「守ること3」に沿って、画面の言い訳文言を削り、来訪者が歩きたくなる短い言葉にする。
7. **画像の軽量化**：原画は 1枚7〜8MB のPNG。スマホ用に幅1600px程度のWebP/JPEG（目安300KB以下）を作って表示に使う。原画は `artworks/original/` に残すか、別途保管するか今西さんに確認。
