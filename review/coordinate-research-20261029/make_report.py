import json,sys
r=json.load(open(sys.argv[1],encoding='utf-8')); S=r['spots']
gm=lambda la,ln:f'https://www.google.com/maps/search/?api=1&query={la},{ln}'
om=lambda la,ln:f'https://www.openstreetmap.org/?mlat={la}&mlon={ln}#map=19/{la}/{ln}'
L=['# 座標調査の記録（勝手に百人町Map）','',f'確認日：{r["checkedOn"]}　／　正本：{r["canonical"]}','','## 判定ルール','',r['rule'],'',
 '## 集計','',f'- 確定（ピンあり・施設の代表位置）：{sum(s["status"]=="confirmed" for s in S)} 件',f'- 候補あり・今西確認待ち（ピンなし）：{sum(s["status"]=="candidate" for s in S)} 件',f'- 場所不明（ピンなし）：{sum(s["status"]=="unresolved" for s in S)} 件',f'- 区域（点のピンは付けない）：{sum(s["status"]=="area" for s in S)} 件','- 入口を確認できた地点：0 件','- 既存の長屋（本人確認済み住所参考点）1 件は変更なし','',
 '## 確定 19 件（ピン座標＝OSM）','','| スポット | ピン座標 | Googleとの差 | 所在地（出典） | 注意 |','|---|---|---|---|---|']
for s in [x for x in S if x['status']=='confirmed']:
    p=s['pin'];L.append(f"| {s['name']} | [{p['lat']}, {p['lng']}]({om(p['lat'],p['lng'])}) | {s['independentAgreementMeters']}m | {s['official']['address']} | {s['note'] or '—'} |")
L+=['','各地点の全照合値（GSI・Aichi Nowを含む距離）は research.json の agreement に記録。','']
Q=['# 今西さんへの確認事項（座標）','',f'確認日：{r["checkedOn"]}。いずれもNotion正本は書き換えていません。答えをもらえた地点から、ローカル版にピンを追加します。','','## A. 候補はあるが、根拠が1系統だけの地点（7件）','']
i=0
for s in [x for x in S if x['status']=='candidate']:
    i+=1;c=s['sources'][0]
    Q+=[f'{i}. **{s["name"]}** — {s["question"]}',f'   - 候補：{c["label"]}　→ [Googleマップで見る]({gm(c["lat"],c["lng"])}) ／ [OSMで見る]({om(c["lat"],c["lng"])})',f'   - 所在地の手がかり：{s["official"]["address"]}',f'   - 補足：{s["note"]}','']
Q+=['## B. 場所が分からない地点（1件）','']
for s in [x for x in S if x['status']=='unresolved']:
    i+=1;Q+=[f'{i}. **{s["name"]}** — {s["question"]}',f'   - 手がかり：{s["official"]["address"]}']+[f'   - 近くの関連地物：{c["label"]} → [地図]({om(c["lat"],c["lng"])})' for c in s['sources']]+[f'   - 補足：{s["note"]}','']
Q+=['## C. 区域スポットの見せ方（2件）','']
for s in [x for x in S if x['status']=='area']:
    i+=1;Q+=[f'{i}. **{s["name"]}** — {s["question"]}','']
Q+=['## D. 広い施設の代表位置（任意）','',f'{i+1}. **名古屋城・徳川園** — 今は区域の中心付近に置いています。百人町から歩く人向けに、入口（名古屋城の東門、徳川園の黒門口など）へピンを移しますか。入口にする場合は、どの入口かを決めてもらえれば公式案内で照合します。','']
open(sys.argv[2],'w',encoding='utf-8').write('\n'.join(L)+'\n');open(sys.argv[3],'w',encoding='utf-8').write('\n'.join(Q)+'\n')
