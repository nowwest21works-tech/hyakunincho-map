// Visitor-facing guide text for each card (2026-10-30). Written in our own words from the official pages in `source`.
// Hours, closed days and fees are copied from those pages on GUIDES_CHECKED_ON; the card always points to the official site for the latest.
// spots.json (the Notion export) is not changed here. The lead texts were copied to Notion「紹介文」on 2026-10-30.
// kind: visit = 中を見学できる施設 / outside = 外から眺める（個人宅・学校・門） / worship = 寺社・教会 / dining = 料亭 / area = 町並み / base = 長屋
export const GUIDES_CHECKED_ON='2026-10-30';
const FUTABAKAN='https://www.futabakan.jp/goforastroll/';
const COURSE={url:'https://www.city.nagoya.jp/higashi/miryoku/1019790/1019791/1019793.html',label:'名古屋市東区「武家屋敷散策コース」'};
const BLDG='https://www.city.nagoya.jp/kankou/kankouinfo/1013766/1013962/';
const fb=(page,name)=>({url:FUTABAKAN+page,label:`文化のみち二葉館「周辺散策」${name}`});
const city=(path,name)=>({url:BLDG+path,label:`名古屋市「${name}」`});
export const KINDS=Object.freeze({visit:'見学できる',outside:'外から眺める',worship:'お参り',dining:'料亭',area:'町並み',base:'出発点'});
export const MANNERS=Object.freeze({
  outside:'お住まいや学校など、ふだんの暮らしの場所です。道路から静かに眺めてください。',
  worship:'お参りの場所です。境内や建物の中は、それぞれの案内に従ってください。',
  dining:'営業中の料亭です。門や塀など外観を眺めて楽しんでください。'
});
export const GUIDES=Object.freeze(Object.fromEntries(Object.entries({
  // みんなのまほろ場（百人町の長屋）
  '407e3a043cef81b5b765ed86e8b9b6e3':{kind:'base',
    lead:'百人町の長屋を手入れしながら、「DIO（みんなでやってみよう）」の活動を育てている場所。この地図の出発点です。せっかく百人町まで来たら、帰り道にもうひと歩き。武家屋敷の町並みや古いお寺が、歩いて行ける距離に待っています。'},
  // 1 名古屋市市政資料館
  '407e3a043cef81c994bcc245bf043007':{kind:'visit',
    lead:'赤いレンガに白い花崗岩、緑の銅板屋根。大正11年（1922）に裁判所として建てられたネオ・バロック様式の建物で、国の重要文化財です。映画『謝罪の王様』やドラマ『坂の上の雲』のロケ地にもなりました。',
    hours:'9:00〜17:00',closed:'月曜（祝日の場合は翌日）、第3木曜（祝日の場合は第4木曜）、12月29日〜1月3日',fee:'無料',
    official:{url:'https://www.city.nagoya.jp/kankou/rekishi/1004614/1004627/index.html',label:'市政資料館のご案内（名古屋市）'},source:fb('f006.html','名古屋市市政資料館')},
  // 2 白壁・主税・橦木町並み保存地区
  '407e3a043cef81908bfbec8cb6bf1a75':{kind:'area',
    lead:'江戸時代、中級武士の屋敷が並んでいた一画です。通りの両側に門と塀が続き、塀ごしに木々の緑がのぞく、名古屋でも指折りの屋敷町。明治から昭和の初めには陶磁器の貿易商や財界人が移り住み、和洋の邸宅がいまも残ります。白壁町筋・主税町筋・橦木町筋を、のんびり歩いてみてください。',
    official:{url:'https://www.city.nagoya.jp/kankou/rekishi/1017254/1017258.html',label:'白壁・主税・橦木町並み保存地区（名古屋市）'},source:{url:'https://www.city.nagoya.jp/kankou/rekishi/1017254/1017258.html',label:'名古屋市「白壁・主税・橦木町並み保存地区」'}},
  // 3 文化のみち橦木館
  '407e3a043cef8125bdb2c9ac406232af':{kind:'visit',
    lead:'輸出陶磁器商・井元為三郎が大正の終わりから昭和の初めに建てた邸宅。庭を囲むように洋館・和館・茶室・2棟の蔵が残り、洋館にはステンドグラスがぜいたくに使われています。海外のバイヤーを招いて商談をした館で、当時の暮らしと商いの空気を感じられます。',
    closed:'月曜（祝日の場合は直後の平日）、12月29日〜1月3日',fee:'大人200円（中学生以下無料）',
    official:{url:'https://shumokukan.jp/',label:'文化のみち橦木館 公式サイト'},source:fb('f024.html','文化のみち橦木館')},
  // 4 文化のみち二葉館
  '407e3a043cef8157869cceda5fc2cff1':{kind:'visit',
    lead:'「日本の女優第1号」川上貞奴と「電力王」福沢桃介が暮らした「二葉御殿」を移築・復元した館。オレンジ色の洋風屋根、ステンドグラスの光がこぼれる大広間、落ち着いた和室と、大正ロマンがぎゅっと詰まっています。「文化のみち」散策の拠点です。',
    hours:'10:00〜17:00',closed:'月曜（祝日の場合は直後の平日）、12月29日〜1月3日',fee:'大人300円（中学生以下無料）',extra:'ボランティアガイド：火・木・土曜 10:40／13:10',
    official:{url:'https://www.futabakan.jp/',label:'文化のみち二葉館 公式サイト'},source:fb('f016.html','文化のみち二葉館')},
  // 5 主税町長屋門
  '407e3a043cef81b48097e3f426f6cc40':{kind:'outside',
    lead:'江戸時代の武家屋敷の門が、当時の場所のまま残っています。門の脇の出格子（武者窓）は、武家屋敷だけに許された造り。明治には陸軍第三師団長の宿舎になり、のちの総理大臣・桂太郎も住みました。',
    source:fb('f015.html','主税町長屋門')},
  // 6 名古屋陶磁器会館
  '407e3a043cef811f9dbde5cb2fe79ea4':{kind:'visit',
    lead:'昭和7年（1932）、陶磁器の貿易商たちの組合事務所として建てられました。スクラッチタイルの外壁に、アールデコ調の館内。このあたりは明治から昭和にかけて、輸出用の陶磁器に絵付けをする産業で栄えた土地です。1階の展示室には、海を渡った器がずらりと並びます。',
    hours:'10:00〜17:00（最終入館16:30）',closed:'土曜・日曜・祝日、夏季、年末年始（臨時休館あり）',fee:'無料',
    official:{url:'https://nagoya-toujikikaikan.org/',label:'名古屋陶磁器会館 公式サイト'},source:fb('f007.html','名古屋陶磁器会館')},
  // 7 徳源寺
  '407e3a043cef81238d6fc0de8382e883':{kind:'worship',
    lead:'織田信長の次男・信雄が開いた寺に始まる、臨済宗妙心寺派の禅寺。尾張藩最後の藩主・徳川慶勝が修行道場を整えました。涅槃像を伝えています。毎週土曜18時からの坐禅会は予約不要で、だれでも参加できます（茶礼金300円）。',
    official:{url:'https://www.tokugen.com/',label:'徳源寺 公式サイト'},source:COURSE},
  // 8 覚音寺
  '407e3a043cef81d0aefbe8c3648653ed':{kind:'worship',
    lead:'真宗大谷派のお寺。明治の仏教界で「今親鸞」と呼ばれた思想家・清沢満之が、この寺で得度し、学びました。',
    source:COURSE},
  // 百人町・黒門町・城番町筋の町並み
  '407e3a043cef8178b6c6fc6de1193c6b':{kind:'area',
    lead:'江戸時代、百人組同心など下級武士の屋敷が連なっていたまち。いまも町名や路地のところどころに、藩政時代の面影が残っています。私たちの長屋があるのも、この百人町です。',
    source:COURSE},
  // 9 情妙寺
  '407e3a043cef816e8b2ded15bf356162':{kind:'worship',
    lead:'徳川家康の位牌所として、豪商・茶屋長意が慶安年間（1648〜1652）に開いた日蓮宗の寺。御朱印船貿易のようすを描いた「茶屋新六交趾渡航図巻」（県指定文化財）を伝え、境内には芭蕉に学んだ日陽和尚の水鶏塚があります。',
    source:COURSE},
  // 10 自然院
  '407e3a043cef817f99eecc86af783a9e':{kind:'worship',
    lead:'承応元年（1652）に創建され、元禄8年（1695）に筒井町へ移ってきた浄土宗の寺。長屋からも近く、筒井町のお寺めぐりの途中に立ち寄れます。',
    source:COURSE},
  // 11 物部神社
  '407e3a043cef81b8b176fbdbf48ec336':{kind:'worship',
    lead:'「石神堂」とも呼ばれる神社。物部氏の祖・宇摩志麻遅命を祀り、神武天皇がこの地を平定したときに国を鎮めたと伝わる大石をご神体としています。',
    source:COURSE},
  // 建中寺
  '407e3a043cef8119b898d9a369d142fa':{kind:'worship',
    lead:'尾張藩2代藩主・光友が、父である藩祖・義直のために慶安4年（1651）に建てた浄土宗の名刹で、尾張徳川家の菩提寺。江戸時代にはおよそ5万坪の境内がありました。2025年には本堂と徳川家御霊屋が国の重要文化財に指定されています。',
    official:{url:'http://www.kenchuji.com/',label:'建中寺 公式サイト'},source:fb('f018.html','建中寺')},
  // 徳川園
  '407e3a043cef81139f9df6aaf1d15993':{kind:'visit',
    lead:'尾張藩2代藩主・光友が元禄8年（1695）に造った隠居所「大曽根屋敷」に始まる日本庭園。高低差のある地形や大きな岩組みが、歩くたびに景色を変えていきます。正面入口の黒門は明治33年（1900）の尾張徳川家の邸宅の遺構で、空襲を免れた貴重な建物です。',
    hours:'9:30〜17:30（入園は17:00まで）',closed:'月曜（祝日の場合は翌日）、年末年始',fee:'大人300円（中学生以下無料）',
    official:{url:'https://www.tokugawaen.aichi.jp/',label:'徳川園 公式サイト'},source:fb('f023.html','徳川園')},
  // 名古屋城
  '407e3a043cef81afa589ebddc8b95fdb':{kind:'visit',
    lead:'慶長15年（1610）、徳川家康の命で築かれた尾張徳川家の居城。城の東には武家屋敷のまちが広がり、白壁・主税・橦木や百人町の歴史もここから始まりました。2018年に復元された本丸御殿は、障壁画に彩られた「建物まるごと美術館」です。',
    hours:'9:00〜16:30（本丸御殿は16:00まで）',closed:'12月29日〜31日、1月1日',fee:'大人500円（中学生以下無料）',extra:'天守閣の中には入れません（2026年10月時点）',
    official:{url:'https://www.nagoyajo.city.nagoya.jp/',label:'名古屋城 公式サイト'},source:fb('f008.html','名古屋城')},
  // F 料亭か茂免
  '407e3a043cef8139b06ac86f7a4d4637':{kind:'dining',
    lead:'白壁町筋に門を構える料亭。門と塀、塀ごしの木々がつくる通りの景色も、この町並みの大切な一部です。',
    source:{url:'https://www.city.nagoya.jp/_res/projects/default_project/_page_/001/019/793/01_bukeyashiki.pdf',label:'名古屋市東区「武家屋敷散策コース」地図（拡大図F）'}},
  // G 料亭・香楽
  '407e3a043cef8193ac3ce7a2e05a23c4':{kind:'dining',
    lead:'町並み保存地区の西寄りにある料亭。落ち着いた屋敷町の通りに溶け込む門構えを眺めながら歩いてみてください。',
    source:{url:'https://www.city.nagoya.jp/_res/projects/default_project/_page_/001/019/793/01_bukeyashiki.pdf',label:'名古屋市東区「武家屋敷散策コース」地図（拡大図G）'}},
  // D 文化のみち百花百草
  '407e3a043cef8142849cee124a2ccebb':{kind:'visit',
    lead:'大正9年（1920）の書院・茶室・土蔵を生かした施設と庭園。徳川美術館が所蔵する「百花百草図屏風」にちなんだ庭は、四季それぞれに楽しめます。ホールでは、庭を眺めながらお茶をいただけます。',
    hours:'10:00〜16:00',closed:'日曜・月曜・火曜、年末年始',fee:'大人500円、小・中学生200円（小学生未満無料）',
    official:{url:'https://bunkanomichi-hyakkahyakuso.jp/',label:'文化のみち百花百草 公式サイト'},source:fb('f025.html','文化のみち百花百草')},
  // A 旧豊田家門・塀
  '407e3a043cef8153a959eb460a672be8':{kind:'outside',
    lead:'大正7年（1918）ごろの門と塀。古い形式の薬医門に、御影石の切石の基礎といった新しい工夫も取り入れています。覗き窓のある黒い塀が、城下町の武家屋敷の面影を伝えます。',
    source:city('1034450/1013976.html','旧豊田家門・塀')},
  // I 旧豊田佐助邸
  '407e3a043cef8154a9c5e5776fb9e2ed':{kind:'visit',
    lead:'発明王・豊田佐吉の弟で、兄を支えた実業家・佐助の旧邸。白いタイル張りの洋館と広い和館からなります。蓮のつぼみ形の照明や、鶴亀と「とよだ」の文字をあしらった換気口など、細かなところまで見て楽しい家です。',
    hours:'10:00〜15:30',closed:'月曜（祝日の場合は翌平日）、12月29日〜1月3日',fee:'無料',
    official:{url:'https://www.city.nagoya.jp/kankou/bunka/1034457/1016040/1016042/1017357/1017360.html',label:'旧豊田佐助邸（名古屋市）'},source:fb('f012.html','旧豊田佐助邸')},
  // H 旧春田鉄次郎邸
  '407e3a043cef81078526d95c5803e78a':{kind:'visit',
    lead:'陶磁器の輸出で成功した貿易商・春田鉄次郎の住宅（大正13年・1924）。設計は武田五一といわれ、アール・ヌーボーの余韻をただよわせる洋館と和館が並びます。一部はフランス料理店として使われています。',
    hours:'10:00〜15:30',closed:'月曜（祝日の場合は翌平日）、12月29日〜1月3日',fee:'無料',extra:'見学は、隣の旧豊田佐助邸の係員に声をかけてから（見学できるのは建物の一部）',
    official:{url:'https://www.city.nagoya.jp/kankou/bunka/1034457/1016040/1016042/1017357/1017359.html',label:'旧春田鉄次郎邸（名古屋市）'},source:fb('f011.html','旧春田鉄次郎邸')},
  // L カトリック主税町教会
  '407e3a043cef81d59e19fe01b74ad602':{kind:'worship',
    lead:'名古屋・岐阜地方で初めてカトリックの教えを広めた人々がつくった教会。明治37年（1904）の礼拝堂は、正面の3連アーチが優美です。鐘楼の鐘はフランス製です。',
    source:fb('f013.html','カトリック主税町教会')},
  // K 文化のみち堀美術館
  '407e3a043cef819ab9abea55c1605d38':{kind:'visit',
    lead:'佐伯祐三、藤田嗣治、梅原龍三郎ら、昭和の初めにパリで学んだ画家たちの作品を中心に展示する美術館。三岸節子の大作や、菱田春草・東山魁夷・平山郁夫の日本画にも出会えます。',
    hours:'13:00〜17:00（入館は16:30まで）',closed:'月曜〜木曜、資料整理日、夏季、年末年始（開館は金・土・日・祝）',fee:'一般1,000円、学生500円',
    official:{url:FUTABAKAN+'f026.html',label:'文化のみち堀美術館（二葉館「周辺散策」）'},source:fb('f026.html','文化のみち堀美術館')},
  // E 櫻井家住宅
  '407e3a043cef81b88076e7648b805034':{kind:'outside',
    lead:'明治38年（1905）に建てられた洋館で、設計は櫻井善吉。黒い桟瓦の寄棟屋根と白い壁のモダンな姿は道路からも眺められ、和風の塀が続く白壁町筋に軽やかさを添えています。',
    source:{url:'https://www.city.nagoya.jp/kankobunkakoryu/page/0000038828.html',label:'名古屋市「櫻井家住宅」'}},
  // M 伊藤家住宅
  '407e3a043cef812e9f90ece7c12e8d83':{kind:'outside',
    lead:'橦木町筋の西の端に建つ、大正初期の住宅。玄関は通りから入った路地側にあり、通りには駒寄せのある塀が面しています。橦木町筋の町並みをかたちづくる一軒です。',
    source:city('1034452/1013994.html','伊藤家住宅')},
  // B 金城学院高等学校榮光館
  '407e3a043cef810091d7cee0bd906bb8':{kind:'outside',
    lead:'昭和11年（1936）建築の金城学院の校舎。白い壁に深いアーチ窓が連なり、洋瓦の屋根をのせた教会のような姿は、白壁のまちのシンボル的な存在です。登録有形文化財です。',
    source:city('1034452/1013996.html','金城学院榮光館')},
  // 東海学園講堂
  '407e3a043cef819688cdef274924e959':{kind:'outside',
    lead:'昭和6年（1931）の講堂。半円アーチの正面、5本の付柱、スクラッチタイルの外装。華やかさと骨太な落ち着きをあわせ持つ、時代の流行を映した建物です。登録有形文化財です。',
    source:city('1034451/1013990.html','東海学園講堂')},
  // C 旧料亭・樟
  '407e3a043cef816da2d8f40fbbc4b8bf':{kind:'outside',
    lead:'白壁町筋の西の端。黒く塗られた和風の門と板塀が目を引く旧料亭です。塀ごしの緑と足もとの駒寄せが、通りに落ち着いた表情をつくっています。門と塀は大正初期のもの。',
    source:city('1034452/1013995.html','旧料亭 樟')},
  // J 旧櫻明荘門
  '407e3a043cef8155acf0f17e950a4f89':{kind:'outside',
    lead:'白壁町筋と主税町筋のあいだに残る門。格子窓のある長屋門の奥に、庭の緑がのぞきます。',
    source:{url:'https://www.city.nagoya.jp/_res/projects/default_project/_page_/001/019/793/01_bukeyashiki.pdf',label:'名古屋市東区「武家屋敷散策コース」地図（拡大図J）'}}
}).map(([id,g])=>[id,Object.freeze(g)])));
