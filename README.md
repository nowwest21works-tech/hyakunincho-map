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
