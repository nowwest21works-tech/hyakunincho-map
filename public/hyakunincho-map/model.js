// Shared boundary: only these display fields may enter the browser snapshot.
export const THEMES = ['歴史・建築','町並み・路地','寺社・信仰','文化・美術','飲食・喫茶','公園・自然','百人町活動'];
export const STATUSES = {verified:'座標確認済み',unconfirmed:'座標未確定',area:'区域・表示方法未確定'};
// These two canonical page bodies explicitly describe areas, not point locations.
export const AREA_IDS = new Set(['407e3a043cef8178b6c6fc6de1193c6b','407e3a043cef81908bfbec8cb6bf1a75']);
export const COLLECTION = 'collection://16c7c12b-396e-4de5-b55a-36fe7c44c07b';
export function safeUrl(value) {
  try { const u = new URL(value); return u.protocol === 'https:' && !u.username && !u.password && !u.search && !u.hash ? u.href : null; } catch { return null; }
}
const fields = ['id','name','theme','area','description','section','symbol','visitStatus','coordinateStatus','coordinates','sourceUrl','missing'];
function fail(message) { throw new Error(message); }
function string(value, max=1500) { return typeof value === 'string' && value.length <= max; }
export function validateSnapshot(data) {
  if (!data || data.formatVersion !== 1 || !string(data.inputVersion,120) || !/^[a-zA-Z0-9_.:TZ-]+$/.test(data.inputVersion) || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(data.retrievedAt) || !Number.isFinite(Date.parse(data.retrievedAt)) || Date.parse(data.retrievedAt)>Date.now()+60000 || data.sourceDataSource !== COLLECTION || data.expectedCount !== 30 || !Array.isArray(data.spots) || data.spots.length !== data.expectedCount) fail('データの版・出典・件数を確認できません。');
  if(Object.keys(data).some(key=>!['formatVersion','inputVersion','retrievedAt','sourceDataSource','expectedCount','spots'].includes(key))) fail('表示用データに余分な項目があります。');
  const ids = new Set();
  for (const spot of data.spots) {
    if (!spot || Object.keys(spot).some(key=>!fields.includes(key)) || !/^[a-f0-9]{32}$/.test(spot.id) || ids.has(spot.id) || !string(spot.name,200) || !spot.name || !THEMES.includes(spot.theme) || !string(spot.area,80) || !string(spot.description) || !string(spot.section,80) || !string(spot.symbol,80) || !string(spot.visitStatus,40) || !Object.hasOwn(STATUSES,spot.coordinateStatus) || !Array.isArray(spot.missing) || spot.missing.some(v=>!string(v,120))) fail('スポットの項目またはIDを確認できません。');
    ids.add(spot.id);
    if (spot.sourceUrl !== null && (safeUrl(spot.sourceUrl) !== spot.sourceUrl || !['www.city.nagoya.jp','www.nagoyajo.city.nagoya.jp'].includes(new URL(spot.sourceUrl).hostname))) fail('出典リンクを確認できません。');
    const c=spot.coordinates;
    if (spot.coordinateStatus === 'verified') {
      if (!c || Object.keys(c).sort().join(',') !== 'lat,lng' || typeof c.lat !== 'number' || typeof c.lng !== 'number' || !Number.isFinite(c.lat) || !Number.isFinite(c.lng) || Math.abs(c.lat)>90 || Math.abs(c.lng)>180 || (spot.section==='公式町並み'||AREA_IDS.has(spot.id))) fail('確認済み座標を確認できません。');
    } else if (c !== null) fail('未確定の座標は表示できません。');
  }
  return data;
}
export function selectSpots(spots,theme='',query='') {
  const q=query.trim().toLocaleLowerCase('ja');
  return spots.filter(s=>(!theme || s.theme===theme) && (!q || [s.name,s.area,s.description].join(' ').toLocaleLowerCase('ja').includes(q)));
}
