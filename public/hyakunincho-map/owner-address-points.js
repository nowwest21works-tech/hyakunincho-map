// Local derived display only. The canonical Notion export stays unchanged.
// Owner identified the nagaya/address and permitted map labeling on 2026-10-29.
// A separate resolver read this selected address pin; the URL viewport center is NOT used.
export const OWNER_ADDRESS_POINTS = Object.freeze({
  '407e3a043cef81b5b765ed86e8b9b6e3': Object.freeze({
    coordinates: Object.freeze({lat:35.1791705,lng:136.9326514}),
    address:'愛知県名古屋市東区百人町100',
    label:'本人確認済み住所参考点',
    note:'本人が長屋として確認した住所の参考点です。入口の実測・公道からの動線は未確認です。',
    sourceUrl:'https://maps.app.goo.gl/5ver9GWnwjQr63GaA'
  })
});
export function applyOwnerAddressPoints(data){
  return {...data,spots:data.spots.map(spot=>{
    const point=Object.hasOwn(OWNER_ADDRESS_POINTS,spot.id)?OWNER_ADDRESS_POINTS[spot.id]:null;
    if(!point || spot.coordinates!==null)return spot;
    return {...spot,coordinateStatus:'verified',coordinates:{...point.coordinates},missing:[...spot.missing.filter(s=>s!=='座標と確認根拠'),'入口・公道からの動線の現地確認']};
  })};
}
export function ownerAddressPointFor(spot){
  const point=Object.hasOwn(OWNER_ADDRESS_POINTS,spot.id)?OWNER_ADDRESS_POINTS[spot.id]:null;
  return point && spot.coordinateStatus==='verified' && spot.coordinates?.lat===point.coordinates.lat && spot.coordinates?.lng===point.coordinates.lng ? point : null;
}
