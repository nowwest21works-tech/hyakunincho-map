# Builds research.json (all 29 non-nagaya spots) and the browser overlay from recorded observations.
# Observations were read on 2026-10-29 (JST) from the sources named in each entry. No value is inferred.
import json, math, sys, os
CHECKED='2026-10-29'
def d(a,b):
    R=6371008.8; p1,p2=math.radians(a[0]),math.radians(b[0]); dp=p2-p1; dl=math.radians(b[1]-a[1])
    h=math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2; return round(2*R*math.asin(math.sqrt(h)))
CITY_BLDG='https://www.city.nagoya.jp/kankou/kankouinfo/1013766/1013962/'
COURSE='https://www.city.nagoya.jp/higashi/miryoku/1019790/1019791/1019793.html'
PDF='https://www.city.nagoya.jp/_res/projects/default_project/_page_/001/019/793/01_bukeyashiki.pdf'
PREF_REL='https://www.pref.aichi.jp/uploaded/attachment/607301.pdf'
def osm(kind,oid,name,lat,lng): return {'lineage':'OpenStreetMap','label':f'OSM {kind}/{oid}「{name}」','url':f'https://www.openstreetmap.org/{kind}/{oid}','lat':lat,'lng':lng}
def g(name,lat,lng,addr): return {'lineage':'Google','label':f'Googleマップの施設ピン「{name}」（住所表示：{addr}）','url':None,'lat':lat,'lng':lng}
def an(i,lat,lng): return {'lineage':'Google','label':f'Aichi Now（愛知県公式観光サイト）spot {i} の登録点（Google地図系の値のため独立源に数えない）','url':f'https://www.aichinow.pref.aichi.jp/spots/detail/{i}/','lat':lat,'lng':lng}
def gsi(title,lat,lng,level): return {'lineage':'GSI','label':f'国土地理院 住所検索「{title}」（{level}）','url':None,'lat':lat,'lng':lng}
S={}
def add(id,name,status,official,sources,note='',question=None):
    S[id]={'id':id,'name':name,'status':status,'precision':'representative' if status=='confirmed' else None,'official':official,'sources':sources,'note':note,'question':question,'checkedOn':CHECKED}
# ---------- confirmed (OSM + independent lineage agree; official address/listing matches) ----------
add('407e3a043cef81c994bcc245bf043007','名古屋市市政資料館','confirmed',
 {'address':'名古屋市東区白壁一丁目3','sources':['https://www.city.nagoya.jp/kankou/rekishi/1004614/1004627/1016058.html','https://www.nagoya-info.jp/spot/detail/154/']},
 [osm('relation',17971356,'旧名古屋控訴院地方裁判所区裁判所庁舎',35.181267,136.9102918),g('名古屋市市政資料館',35.1811442,136.9103135,'白壁1丁目3'),an(190,35.181385,136.910322),gsi('白壁一丁目3番地',35.182091,136.910156,'街区代表点')])
add('407e3a043cef8125bdb2c9ac406232af','文化のみち橦木館','confirmed',
 {'address':'名古屋市東区橦木町2-18','sources':['https://www.aichinow.pref.aichi.jp/spots/detail/957/']},
 [osm('node',4916203647,'撞木館',35.1803884,136.915742),g('文化のみち橦木館（旧井元為三郎邸）',35.1802642,136.9158387,'橦木町2丁目18'),an(957,35.180259,136.915818),gsi('橦木町二丁目18番地',35.180172,136.915329,'丁目代表点のみ')],
 note='OSM側はカフェ扱いの点で表記は「撞木館」。位置はGoogleの「文化のみち橦木館」と一致。')
add('407e3a043cef8157869cceda5fc2cff1','文化のみち二葉館（旧川上貞奴邸）','confirmed',
 {'address':'名古屋市東区橦木町3-23','sources':['https://www.aichinow.pref.aichi.jp/spots/detail/955/']},
 [osm('way',1252865091,'文化のみち二葉館',35.1804255,136.9187346),g('文化のみち二葉館（旧川上貞奴邸）',35.180416,136.918672,'橦木町3丁目23'),an(955,35.180389,136.918662),gsi('橦木町三丁目23番地',35.180389,136.919037,'番地')],
 note='公式案内のとおり2005年に現在地へ移築・復元。旧所在地（東二葉町）ではなく現在地。')
add('407e3a043cef811f9dbde5cb2fe79ea4','名古屋陶磁器会館','confirmed',
 {'address':'名古屋市東区徳川1-10-3','sources':['https://www.nagoya-info.jp/spot/detail/158/']},
 [osm('way',1197598883,'名古屋陶磁器会館',35.1816761,136.9235513),g('名古屋陶磁器会館',35.1816974,136.9235411,'徳川1丁目10-3'),gsi('徳川一丁目10番3号',35.181778,136.923477,'住居番号')])
add('407e3a043cef81238d6fc0de8382e883','徳源寺','confirmed',
 {'address':'名古屋市東区新出来1-1-19','sources':[PREF_REL]},
 [osm('way',672796538,'徳源寺',35.1819209,136.930126),g('蓬莱山 徳源寺',35.1820248,136.9300134,'新出来1丁目1-19'),gsi('新出来一丁目1番19号',35.182091,136.930893,'住居番号')],note='境内が広いため代表位置。')
add('407e3a043cef81d0aefbe8c3648653ed','覚音寺','confirmed',
 {'address':'名古屋市東区新出来1-5-16（宗教法人名簿の表記は「覺音寺」）','sources':[PREF_REL]},
 [osm('node',2078061689,'覺音寺',35.1817119,136.9310909),g('覚音寺',35.181703,136.931157,'新出来1丁目5-16'),gsi('新出来一丁目5番16号',35.181602,136.931412,'住居番号')])
add('407e3a043cef816e8b2ded15bf356162','情妙寺','confirmed',
 {'address':'名古屋市東区筒井町4-39','sources':[PREF_REL]},
 [osm('way',965354343,'情妙寺',35.1767895,136.9309854),g('源頂山 情妙寺',35.176798,136.9309997,'筒井町4丁目39'),gsi('筒井町四丁目39番地',35.176811,136.930969,'丁目代表点のみ')])
add('407e3a043cef81b8b176fbdbf48ec336','物部神社','confirmed',
 {'address':'名古屋市東区筒井3-31-21','sources':[PREF_REL]},
 [osm('way',682820500,'物部神社',35.1734537,136.9315875),g('物部神社（石神堂）',35.1734112,136.9315216,'筒井3丁目31-21'),gsi('筒井三丁目31番21号',35.173351,136.931427,'住居番号')])
add('407e3a043cef81078526d95c5803e78a','旧春田鉄次郎邸','confirmed',
 {'address':'名古屋市東区主税町3丁目6-2','sources':['https://www.aichinow.pref.aichi.jp/spots/detail/2418/','https://www.nagoya-info.jp/spot/detail/60/']},
 [osm('way',1120554593,'旧春田鉄次郎邸',35.181343,136.915807),g('旧春田鉄次郎邸',35.181374,136.9157621,'主税町3丁目6-2'),an(2418,35.18133,136.91577),gsi('主税町三丁目6番地',35.181335,136.915222,'丁目代表点のみ')])
add('407e3a043cef8154a9c5e5776fb9e2ed','旧豊田佐助邸','confirmed',
 {'address':'名古屋市東区主税町三丁目8','sources':['https://www.aichinow.pref.aichi.jp/spots/detail/2419/','https://www.nagoya-info.jp/spot/detail/74/']},
 [osm('way',1120554592,'旧豊田佐吉邸',35.181379,136.916035),g('旧豊田佐助邸',35.1814132,136.9159706,'主税町3丁目8'),an(2419,35.18152,136.91607),gsi('主税町三丁目8番地',35.181335,136.915222,'丁目代表点のみ')],
 note='要注意：OSMではこの建物が「旧豊田佐吉邸」と登録されている。公式拡大図の配置（H春田邸の東隣がI佐助邸）とGoogle・県公式観光サイトの「旧豊田佐助邸」が同じ建物を指すため、OSMの名称は採らず位置のみ使用。')
add('407e3a043cef8153a959eb460a672be8','旧豊田家門・塀','confirmed',
 {'address':'名古屋市東区白壁四丁目20番地','sources':[CITY_BLDG+'1034450/1013976.html']},
 [osm('node',10248417378,'旧豊田家の門',35.182273,136.915427),g('旧豊田家の門 塀',35.1822962,136.9154316,'白壁4丁目20')],note='原則として道路から外観を見る場所。')
add('407e3a043cef8193ac3ce7a2e05a23c4','料亭・香楽','confirmed',
 {'address':'公式拡大図G（番地は公式資料に記載なし）','sources':[PDF]},
 [osm('node',10248417380,'料亭　香楽',35.181231,136.914699),g('香楽',35.181294,136.914669,'主税町3丁目3')],note='営業施設。営業状況は未確認。')
add('407e3a043cef8139b06ac86f7a4d4637','料亭か茂免','confirmed',
 {'address':'公式拡大図F（番地は公式資料に記載なし）','sources':[PDF]},
 [osm('node',10248417383,'かもめ',35.182077,136.916196),g('か茂免',35.182051,136.916291,'—')],note='OSM側の表記はひらがな「かもめ」。営業施設。')
add('407e3a043cef8142849cee124a2ccebb','文化のみち百花百草','confirmed',
 {'address':'名古屋市東区白壁4-91','sources':['https://www.aichinow.pref.aichi.jp/spots/detail/956/','https://www.nagoya-info.jp/spot/detail/38/']},
 [osm('node',7628055986,'百花百草',35.181873,136.914872),g('文化のみち 百花百草',35.1819522,136.9145749,'—'),an(956,35.181952,136.914574)])
add('407e3a043cef819ab9abea55c1605d38','文化のみち堀美術館（堀美術館）','confirmed',
 {'address':'名古屋市東区主税町4-4-2','sources':['https://www.nagoya-info.jp/spot/detail/72/']},
 [osm('way',666884059,'堀美術館',35.181374,136.917127),g('文化のみち 堀美術館',35.18145,136.917124,'主税町4丁目4-2'),gsi('主税町四丁目4番地',35.181499,136.917664,'番地')])
add('407e3a043cef81d59e19fe01b74ad602','カトリック主税町教会','confirmed',
 {'address':'名古屋市東区主税町3丁目33番地','sources':[CITY_BLDG+'1034451/1013981.html','https://www.nagoya-info.jp/spot/detail/73/']},
 [osm('node',10248417385,'主税町教会',35.18054,136.9141621),g('カトリック主税町教会',35.1807411,136.914322,'主税町3-33'),gsi('主税町三丁目33番地',35.180752,136.915329,'丁目代表点のみ')],note='礼拝・見学のルールは施設の案内に従う。')
add('407e3a043cef8119b898d9a369d142fa','建中寺','confirmed',
 {'address':'名古屋市東区筒井1-7-57','sources':[PREF_REL,'https://www.aichinow.pref.aichi.jp/spots/detail/1679/']},
 [osm('node',2040575122,'建中寺',35.1792303,136.9269256),g('徳興山 崇仁院 建中寺',35.179223,136.926949,'—'),an(1679,35.179267,136.92691),gsi('筒井一丁目7番57号',35.178524,136.926773,'住居番号')],note='境内が広く、総門・御成門・霊廟は別の位置。ピンは寺の代表位置。')
add('407e3a043cef81139f9df6aaf1d15993','徳川園','confirmed',
 {'address':'名古屋市東区徳川町1001','sources':['https://www.city.nagoya.jp/kurashi/douro/1014853/1014854/1014865.html','https://www.aichinow.pref.aichi.jp/spots/detail/9/']},
 [osm('way',48179151,'徳川園',35.1847742,136.9329354),g('徳川園',35.1842918,136.9321824,'徳川町1001'),an(9,35.184448,136.93301),gsi('徳川町1001番地',35.183765,136.933029,'番地')],
 note='庭園の区域の中央付近（OSMの区域形状の中心）。入口（黒門口など）ではない。広い施設のため2系統の差が大きい。')
add('407e3a043cef81afa589ebddc8b95fdb','名古屋城','confirmed',
 {'address':'名古屋市中区本丸1-1','sources':['https://www.nagoyajo.city.nagoya.jp/access/']},
 [osm('relation',19100633,'名古屋城',35.184396,136.9000992),g('名古屋城',35.1847501,136.8996883,'中区本丸1-1'),gsi('本丸1番',35.18449,136.897583,'番地')],
 note='城域の中心付近（OSMの区域形状の中心）。天守・正門・東門のいずれでもない代表位置。百人町側からの入口は未確定。')
# ---------- candidate: only one positional lineage; asks Imanishi ----------
add('407e3a043cef81b48097e3f426f6cc40','主税町長屋門','candidate',
 {'address':'番地は公式資料に記載なし（公式拡大図では主税町筋の東端、二葉館の北側）','sources':[COURSE,PDF]},
 [g('主税町長屋門',35.181253,136.919145,'主税町4丁目68')],
 note='OSMに門そのものの登録がない（近くの案内板「御畳奉行 朝日文左衛門重章 屋敷跡」は約55m離れた別物）。',question='Googleの「主税町長屋門」ピンの位置で合っていますか。')
add('407e3a043cef81b88076e7648b805034','櫻井家住宅','candidate',
 {'address':'公式拡大図E（白壁町筋の南側、百花百草とか茂免の間）','sources':[PDF]},
 [g('櫻井家住宅',35.1820081,136.9152503,'白壁4丁目89')],
 note='OSMに登録なし。個人宅のため、位置が合っていてもピン表示の可否は別判断。',question='位置はこの候補で合っていますか。個人宅としてピンを出してよいですか。')
add('407e3a043cef812e9f90ece7c12e8d83','伊藤家住宅（東区・文化のみち）','candidate',
 {'address':'名古屋市東区橦木町2丁目9番地','sources':[CITY_BLDG+'1034452/1013994.html']},
 [g('伊藤家住宅（白壁・主税・橦木の町並み）',35.1801123,136.9145301,'橦木町2丁目9')],
 note='西区那古野の同名「伊藤家住宅」ではないことを市の所在地（東区橦木町）で確認済み。OSMに登録なし。個人宅。',question='位置はこの候補で合っていますか。個人宅としてピンを出してよいですか。')
add('407e3a043cef810091d7cee0bd906bb8','金城学院高等学校榮光館','candidate',
 {'address':'名古屋市東区白壁四丁目64番地','sources':[CITY_BLDG+'1034452/1013996.html']},
 [g('榮光館',35.1829944,136.9184552,'白壁4丁目64-64'),osm('way',197599057,'私立金城学院高等学校（敷地全体）',35.183019,136.918794)],
 note='OSMは学校敷地のみで、榮光館の建物は未登録。学校敷地内のため立入・撮影は学校の条件次第。',question='榮光館の位置はこの候補で合っていますか。学校敷地内の建物にピンを出してよいですか（校門を目印にする案もあります）。')
add('407e3a043cef819688cdef274924e959','東海学園講堂','candidate',
 {'address':'名古屋市東区筒井一丁目202番地の4','sources':[CITY_BLDG+'1034451/1013990.html']},
 [g('東海学園大講堂',35.1799418,136.9294316,'筒井1丁目2-35')],
 note='OSMは東海中学校・東海高等学校の校舎のみで、講堂は名前付きで未登録。学校敷地内。',question='講堂の位置はこの候補で合っていますか。学校敷地内の建物にピンを出してよいですか。')
add('407e3a043cef817f99eecc86af783a9e','自然院','candidate',
 {'address':'名古屋市東区筒井町4-13','sources':[PREF_REL]},
 [g('寳池山 黒谷自然院',35.1771401,136.9303067,'筒井町4丁目13'),gsi('筒井町四丁目13番地',35.176811,136.930969,'丁目代表点のみ')],
 note='OSMに名前付きの登録がない。国土地理院の住所検索はこの地区では丁目までしか絞れない。',question='Googleの「黒谷自然院」ピンの位置で合っていますか。')
add('407e3a043cef816da2d8f40fbbc4b8bf','旧料亭・樟','candidate',
 {'address':'名古屋市東区白壁四丁目92番地（白壁町筋の西端）','sources':[CITY_BLDG+'1034452/1013995.html']},
 [osm('node',10248417381,'旧料亭　樟',35.1821,136.91431)],
 note='Googleマップでは名前で見つからず、独立した2系統目がない。',question='OSMの「旧料亭 樟」の点で合っていますか。')
# ---------- unresolved ----------
add('407e3a043cef8155acf0f17e950a4f89','拡大図J｜名称要照合','unresolved',
 {'address':'公式拡大図J。凡例は「旧櫻明荘門」と読める（公式画像800px版の読み取り。正式表記は未確認）。長屋筋の東、白壁町筋と主税町筋の間','sources':[PDF,'https://www.city.nagoya.jp/_res/projects/default_project/_page_/001/019/793/tizu_bukeyashiki800x613px.jpg']},
 [g('白壁櫻明荘',35.1822863,136.9173414,'—'),osm('way',666884054,'グランドメゾン白壁櫻明荘（集合住宅）',35.181708,136.91728)],
 note='近くに「櫻明荘」を名に持つ建物があるが、門そのものの位置・現存は確認できていない。',question='Jは「旧櫻明荘門」で合っていますか。門がどの通りに面しているか、今も残っているかをご存じですか。')
# ---------- areas ----------
for aid,nm,q in [('407e3a043cef81908bfbec8cb6bf1a75','白壁・主税・橦木町並み保存地区','範囲（形）で示しますか、代表点1つで示しますか。'),('407e3a043cef8178b6c6fc6de1193c6b','百人町・黒門町・城番町筋の町並み','区域として示す場合、範囲は町名の区域でよいですか（長屋の詳細位置は出しません）。')]:
    add(aid,nm,'area',{'address':'区域（地点ではない）','sources':[COURSE]},[],note='区域型スポット。点のピンは付けない（現行の設計どおり）。',question=q)
# ---------- compute ----------
LARGE={'407e3a043cef81139f9df6aaf1d15993','407e3a043cef81afa589ebddc8b95fdb'}  # 徳川園・名古屋城：区域が広い施設（許容差100m）
for s in S.values():
    src=s['sources']; osms=[x for x in src if x['lineage']=='OpenStreetMap']
    if s['status']=='confirmed':
        o=osms[0]; s['pin']={'lat':o['lat'],'lng':o['lng'],'from':o['label'],'url':o['url']}
        others=[x for x in src if x['lineage']!='OpenStreetMap']
        s['agreement']=[{'with':x['label'],'meters':d((o['lat'],o['lng']),(x['lat'],x['lng']))} for x in others]
        s['independentAgreementMeters']=min(a['meters'] for a,x in zip(s['agreement'],others) if x['label'].startswith('Googleマップ'))
        s['siteScale']='large' if s['id'] in LARGE else 'building'
        assert s['independentAgreementMeters']<=(100 if s['siteScale']=='large' else 50),(s['name'],s['independentAgreementMeters'])
    else:
        s['pin']=None
        if len(src)>1: s['candidateSpreadMeters']=d((src[0]['lat'],src[0]['lng']),(src[1]['lat'],src[1]['lng']))
spots=json.load(open(sys.argv[1],encoding='utf-8'))['spots']; ids={x['id']:x['name'] for x in spots}
assert set(S)<=set(ids) and len(S)==29, (len(S), set(S)-set(ids))
for k,v in S.items(): assert ids[k]==v['name'], (k,ids[k],v['name'])
out={'formatVersion':1,'checkedOn':CHECKED,'canonical':'Notion 勝手に百人町マップスポットDB（collection://16c7c12b-396e-4de5-b55a-36fe7c44c07b）。この調査ではNotionを書き換えていない。',
 'rule':'ピンを出す条件：(1)公式・公的資料で施設を同定、(2)OpenStreetMapの名前付き地物と、独立した別系統（Googleの施設ピン）の位置が一致（建物は50m以内、徳川園・名古屋城のような広い施設は100m以内）、(3)公式拡大図の配置と矛盾しない。ピン座標はOSMの値を使う（Google・Aichi Now・国土地理院は照合のみ）。Aichi NowはGoogleと同系統として数える。国土地理院の住所検索は白壁・主税町・橦木町・筒井町では丁目代表点しか返さないため位置照合の根拠にしない。入口を確認できた地点は0件で、ピンはすべて施設の代表位置。',
 'spots':[S[k] for k in sorted(S)]}
json.dump(out,open(sys.argv[2],'w',encoding='utf-8'),ensure_ascii=False,indent=1)
conf=[s for s in out['spots'] if s['status']=='confirmed']
L=['// Generated by review/coordinate-research-20261029/build_research.py from research.json. Local derived display only.','// Notion canonical rows are not changed. Pin coordinates: (c) OpenStreetMap contributors, ODbL. Checked '+CHECKED+'.',"export const RESEARCH_CHECKED_ON='"+CHECKED+"';",'export const RESEARCH_POINTS=Object.freeze({']
for s in conf:
    basis=('OpenStreetMapの区域とGoogleマップの施設ピンが同じ敷地内（差 約%dm）' if s['siteScale']=='large' else 'OpenStreetMapの地物とGoogleマップの施設ピンが約%dmで一致')%s['independentAgreementMeters']
    L.append(f"  '{s['id']}':Object.freeze({{coordinates:Object.freeze({{lat:{s['pin']['lat']},lng:{s['pin']['lng']}}}),precision:'representative',label:'施設の代表位置',address:{json.dumps(s['official']['address'],ensure_ascii=False)},basis:{json.dumps(basis,ensure_ascii=False)},note:{json.dumps(s['note'],ensure_ascii=False)},officialUrl:{json.dumps(s['official']['sources'][0])},checkedOn:'{CHECKED}'}}),")
L.append('});')
L.append('export const RESEARCH_PENDING=Object.freeze({')
for s in out['spots']:
    if s['status'] in ('candidate','unresolved'):
        L.append(f"  '{s['id']}':Object.freeze({{state:'{s['status']}',note:{json.dumps(s['note'],ensure_ascii=False)},checkedOn:'{CHECKED}'}}),")
L.append('});')
open(sys.argv[3],'w',encoding='utf-8').write('\n'.join(L)+'\n')
print('confirmed',len(conf),'candidate',sum(s['status']=='candidate' for s in out['spots']),'unresolved',sum(s['status']=='unresolved' for s in out['spots']),'area',sum(s['status']=='area' for s in out['spots']))
for s in conf: print(f"{s['independentAgreementMeters']:>4}m  {s['name']}  "+' / '.join(f"{a['meters']}m" for a in s['agreement']))
for s in out['spots']:
    if 'candidateSpreadMeters' in s: print('cand spread',s['name'],s['candidateSpreadMeters'])
