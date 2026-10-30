// Local derived display only: researched representative points for spots whose canonical Notion row has no coordinates.
// The canonical export (spots.json) is never modified; a coordinate already present in the export always wins.
import { RESEARCH_POINTS, RESEARCH_PENDING } from './coordinate-research-data.js';
import { AREA_IDS } from './model.js';
const HOSTS=new Set(['www.city.nagoya.jp','www.nagoyajo.city.nagoya.jp','www.pref.aichi.jp','www.aichinow.pref.aichi.jp','www.nagoya-info.jp']);
// Research area: Nagoya Castle (west) to Mononobe Shrine (south-east). Anything outside is rejected as a data error.
const BOUNDS={south:35.170,north:35.190,west:136.895,east:136.940};
function okPoint(p){
  const c=p?.coordinates;
  if(!c||!Number.isFinite(c.lat)||!Number.isFinite(c.lng)||c.lat<BOUNDS.south||c.lat>BOUNDS.north||c.lng<BOUNDS.west||c.lng>BOUNDS.east)return false;
  if(p.precision!=='representative'||!/^\d{4}-\d{2}-\d{2}$/.test(p.checkedOn))return false;
  try{const u=new URL(p.officialUrl);return u.protocol==='https:'&&HOSTS.has(u.hostname)&&!u.search&&!u.hash;}catch{return false;}
}
export function applyResearchPoints(data){
  return {...data,spots:data.spots.map(spot=>{
    const point=Object.hasOwn(RESEARCH_POINTS,spot.id)?RESEARCH_POINTS[spot.id]:null;
    if(!point||spot.coordinates!==null||spot.coordinateStatus!=='unconfirmed'||spot.section==='公式町並み'||AREA_IDS.has(spot.id)||!okPoint(point))return spot;
    return {...spot,...(point.displayName?{name:point.displayName}:{}),coordinateStatus:'verified',coordinates:{...point.coordinates},missing:[...spot.missing.filter(s=>s!=='座標と確認根拠'),'入口・公道からの動線の現地確認']};
  })};
}
export function researchPointFor(spot){
  const point=Object.hasOwn(RESEARCH_POINTS,spot.id)?RESEARCH_POINTS[spot.id]:null;
  return point&&spot.coordinateStatus==='verified'&&spot.coordinates?.lat===point.coordinates.lat&&spot.coordinates?.lng===point.coordinates.lng?point:null;
}
export function pendingResearchFor(spot){
  return spot.coordinateStatus==='unconfirmed'&&Object.hasOwn(RESEARCH_PENDING,spot.id)?RESEARCH_PENDING[spot.id]:null;
}
