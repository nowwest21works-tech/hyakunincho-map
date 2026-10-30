# Mahoroba 勝手に百人町Map

名古屋市東区・百人町とその周辺（白壁・主税・橦木〜筒井）の散策マップです。株式会社まほろば／百人町百人衆プロジェクトが制作しています。

- 地図アプリ本体：`public/hyakunincho-map/`（静的サイト。ビルド不要）
- スポットの正本：Notion「勝手に百人町マップスポットDB」→ `public/hyakunincho-map/spots.json` に書き出し
- 座標の調べ方と出典：`review/coordinate-research-20261029/`

## 手元で動かす

```
node scripts/hyakunincho-map/serve.mjs 8795
```

ブラウザで `http://127.0.0.1:8795/hyakunincho-map/` を開きます。

地図データ：© OpenStreetMap contributors（ODbL）

## 公開（GitHub Pages）

`main` に push すると `.github/workflows/pages.yml` がデータ試験を走らせ、通れば `public/` をそのまま GitHub Pages に配信します（手動実行も可）。

- トップ：`https://nowwest21works-tech.github.io/hyakunincho-map/`
- 地図：`https://nowwest21works-tech.github.io/hyakunincho-map/hyakunincho-map/`

初回のみ、リポジトリの Settings → Pages → Build and deployment → Source を「GitHub Actions」にしてください。
