import { applyOwnerAddressPoints, ownerAddressPointFor, OWNER_ADDRESS_POINTS } from './owner-address-points.js';
import { applyResearchPoints, researchPointFor } from './coordinate-research.js';
import { AREA_DISPLAY } from './coordinate-research-data.js';
import { ARTWORKS } from './artworks.js';
import { GUIDES, GUIDES_CHECKED_ON, KINDS, MANNERS } from './spot-guides.js';
import { THEMES, selectSpots, validateSnapshot } from './model.js';
const NAGAYA_ID='407e3a043cef81b5b765ed86e8b9b6e3',NEAR_METERS=5000;
const $=id=>document.getElementById(id);
const state={data:null,selected:null,map:null,markers:new Map(),areas:new Map(),here:null,tiles:null,view:'map',location:null,locationCircle:null,locationRequest:0,loading:false,tileFailed:false};
function node(tag,text,className) { const el=document.createElement(tag); if(text!==undefined)el.textContent=text; if(className)el.className=className; return el; }
// Stable pin label shared by the list card and the map pin: the official course number or enlarged-map letter.
function pinLabel(spot){
  if(ownerAddressPointFor(spot))return '長';
  const m=/^(\d{1,2}|[A-N])(?:\s*\/.*)?$/.exec(spot.symbol);
  return m?m[1]:'周';
}
// Straight-line distance from the nagaya (the map's starting point), shown so visitors can judge a detour.
function meters(a,c){
  const r=Math.PI/180,h=Math.sin((c.lat-a.lat)*r/2)**2+Math.cos(a.lat*r)*Math.cos(c.lat*r)*Math.sin((c.lng-a.lng)*r/2)**2;
  return 12742000*Math.asin(Math.sqrt(h));
}
// Distances are measured from the visitor's position once they share it, otherwise from the nagaya.
function origin(){return state.here??OWNER_ADDRESS_POINTS[NAGAYA_ID]?.coordinates;}
function spotPoint(spot){return spot.coordinates??(AREA_DISPLAY[spot.id]?.type==='point'?AREA_DISPLAY[spot.id].coordinates:null);}
function metersFromOrigin(spot){const o=origin(),c=spotPoint(spot);return o&&c?meters(o,c):null;}
function fromNagaya(spot){
  const m=metersFromOrigin(spot);if(m===null||(!state.here&&spot.id===NAGAYA_ID)||!spot.coordinates)return '';
  return (state.here?'現在地から直線 約':'長屋から直線 約')+(m<1000?`${Math.max(50,Math.round(m/50)*50)}m`:`${(m/1000).toFixed(1)}km`);
}
// List order for someone leaving the nagaya: the nagaya, its own 百人町 streets, then nearest first.
// After 現在地 is shared, simply nearest to the visitor first.
// The 白壁・主税・橦木 district (no single point) goes just before its first building.
const HYAKUNINCHO_AREA='407e3a043cef8178b6c6fc6de1193c6b',SHIRAKABE_AREA='407e3a043cef81908bfbec8cb6bf1a75';
function walkOrder(spots){
  const rank=s=>state.here?metersFromOrigin(s)??Infinity:s.id===NAGAYA_ID?-2:s.id===HYAKUNINCHO_AREA?-1:metersFromOrigin(s)??Infinity;
  const sorted=spots.filter(s=>s.id!==SHIRAKABE_AREA).sort((a,b)=>rank(a)-rank(b));
  const district=spots.find(s=>s.id===SHIRAKABE_AREA);
  if(district){const i=sorted.findIndex(s=>s.area===district.area);sorted.splice(i<0?sorted.length:i,0,district);}
  return sorted;
}
function addressFor(spot){
  const a=(ownerAddressPointFor(spot)??researchPointFor(spot))?.address??'';
  return /^(愛知県)?名古屋市/.test(a)?a:'';
}
function link(text,href,className){const a=node('a',text,className);a.href=href;a.target='_blank';a.rel='noopener noreferrer';return a;}
function visibleSpots(){return state.data?selectSpots(state.data.spots,$('theme').value,$('search').value):[];}
function view(mode,focus=false){
  state.view=mode; document.querySelector('.explorer').dataset.view=mode;
  $('show-list').setAttribute('aria-pressed',String(mode==='list')); $('show-map').setAttribute('aria-pressed',String(mode==='map'));
  if(mode==='map')requestAnimationFrame(()=>{state.map?.invalidateSize();if(focus)$('map').focus();});
}
function mapMessage(){
  if(!state.data||!state.map)return;
  if(state.tileFailed){$('map-status').textContent='背景地図を読み込めませんでした。ピンと一覧はそのまま使えます。';return;}
  const count=visibleSpots().filter(s=>s.coordinateStatus==='verified').length;
  $('map-status').textContent=count?`${count} か所を地図に表示しています。ピンをタップすると案内が開きます。`:'この条件の場所は地図にありません。一覧から読めます。';
}
function render(){
  const visible=visibleSpots(),all=state.data.spots;
  $('counts').textContent=visible.length===all.length?`${all.length} か所`:`${visible.length} か所（全 ${all.length} か所）`;
  const fragment=document.createDocumentFragment();
  for(const spot of walkOrder(visible)){
    const guide=GUIDES[spot.id];
    const button=node('button',undefined,'spot');button.type='button';button.dataset.spotId=spot.id;
    button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','detail');button.setAttribute('aria-current',String(spot.id===state.selected));
    const top=node('div',undefined,'spot-top');
    if(spot.coordinateStatus==='verified'){const badge=node('span',pinLabel(spot),'pin-badge');badge.title='地図のピン '+pinLabel(spot);badge.setAttribute('aria-label','地図のピン '+pinLabel(spot));top.append(badge);}
    top.append(node('span',spot.theme,'theme'),node('span',spot.area));
    const bottom=node('div',undefined,'spot-bottom'),meta=node('span',undefined,'spot-meta');
    if(guide)meta.append(node('span',KINDS[guide.kind],`kind kind-${guide.kind}`));
    const distance=fromNagaya(spot);if(distance)meta.append(node('span',distance,'distance'));
    bottom.append(meta,node('span','くわしく ›','more'));
    button.append(top,node('h3',spot.name),node('p',guide?.lead??spot.description,'spot-description'),bottom);
    button.addEventListener('click',()=>select(spot.id,'list'));
    fragment.append(button);
  }
  $('spots').replaceChildren(fragment);$('empty').hidden=visible.length!==0;
  if(state.selected&&!visible.some(s=>s.id===state.selected)){state.selected=null;$('detail').close();}
  renderMarkers(visible);mapMessage();
}
function markSelection(){
  document.querySelectorAll('.spot').forEach(el=>el.setAttribute('aria-current',String(el.dataset.spotId===state.selected)));
  state.markers.forEach((marker,id)=>marker.getElement()?.classList.toggle('selected',id===state.selected));
  state.areas.forEach((layer,id)=>layer.getElement()?.classList.toggle('selected',id===state.selected));
}
// Areas are not pins: the preservation district is drawn as its shape, 百人町 as a name label on the quarter point.
function renderAreas(spots){
  state.areas.forEach(layer=>layer.remove());state.areas.clear();
  for(const spot of spots){
    const area=Object.hasOwn(AREA_DISPLAY,spot.id)?AREA_DISPLAY[spot.id]:null;if(!area)continue;
    const layer=area.type==='polygon'
      ?L.polygon(area.ring,{className:'area-shape',color:'#914724',weight:2,dashArray:'6 5',fillColor:'#914724',fillOpacity:.1}).bindTooltip(spot.name,{sticky:true})
      :L.marker([area.coordinates.lat,area.coordinates.lng],{icon:L.divIcon({className:'area-pin',html:node('span',spot.name.split('・')[0]),iconSize:null}),title:spot.name,alt:spot.name,keyboard:true,zIndexOffset:-500});
    layer.addTo(state.map).on('click',()=>select(spot.id,'pin'));
    const el=layer.getElement();el.dataset.spotId=spot.id;el.setAttribute('aria-label',`${spot.name}の案内を開く`);
    state.areas.set(spot.id,layer);
  }
}
function showOnMap(spot){
  const area=Object.hasOwn(AREA_DISPLAY,spot.id)?AREA_DISPLAY[spot.id]:null;
  if(area?.type==='polygon')state.map.fitBounds(area.ring,{padding:[30,30],maxZoom:17,animate:false});
  else{const c=spot.coordinates??area.coordinates;state.map.setView([c.lat,c.lng],area?17:18,{animate:false});}
}
function select(id,origin){
  const spot=state.data?.spots.find(s=>s.id===id);if(!spot)return;
  state.selected=id;markSelection();
  const guide=GUIDES[spot.id];
  const title=node('h2',spot.name);title.id='detail-title';
  const tags=node('p',[spot.theme,spot.area,guide&&KINDS[guide.kind]].filter(Boolean).join(' · '),'detail-tags');
  const content=[title,tags];
  const artwork=Object.hasOwn(ARTWORKS,spot.id)?ARTWORKS[spot.id]:null;
  for(const item of artwork?[artwork,...(artwork.additional??[])]:[]){
    const figure=node('figure',undefined,'detail-artwork');
    const img=node('img');img.src=item.src;img.alt=item.alt;img.width=item.width;img.height=item.height;img.decoding='async';
    const caption=node('figcaption',item.caption);
    img.addEventListener('error',()=>{img.hidden=true;caption.textContent='イラストを読み込めませんでした。';},{once:true});
    figure.append(img,caption);content.push(figure);
  }
  content.push(node('p',guide?.lead??spot.description,'detail-description'));
  const facts=node('dl','','detail-facts'),fact=(k,v)=>{if(v)facts.append(node('dt',k),node('dd',v));};
  fact('住所',addressFor(spot));fact('開館時間',guide?.hours);fact('休館日',guide?.closed);fact('料金',guide?.fee);fact('ひとこと',guide?.extra);fact('距離',fromNagaya(spot));
  if(facts.children.length)content.push(facts);
  if(guide?.hours||guide?.closed||guide?.fee)content.push(node('p',`開館時間・料金は${GUIDES_CHECKED_ON.replace(/^(\d+)-0?(\d+)-0?(\d+)$/,'$1年$2月$3日')}に公式情報で確かめたものです。お出かけ前に公式サイトをご確認ください。`,'detail-note'));
  if(guide&&MANNERS[guide.kind])content.push(node('p',MANNERS[guide.kind],'detail-manners'));
  const actions=node('div',undefined,'detail-actions');
  if((spot.coordinateStatus==='verified'||Object.hasOwn(AREA_DISPLAY,spot.id))&&state.map){
    const show=node('button','地図で見る','detail-map');show.type='button';show.addEventListener('click',()=>{$('detail').close();view('map');
      // On phones the map panel was hidden (display:none) until now: size the map first, then jump without a pan animation,
      // otherwise a short pan between neighbouring pins is computed against a zero-size map and the pin lands off-centre.
      requestAnimationFrame(()=>{state.map.invalidateSize({pan:false});showOnMap(spot);$('map-panel').scrollIntoView({block:'start'});(state.markers.get(id)??state.areas.get(id))?.getElement()?.focus({preventScroll:true});});});actions.append(show);
  }
  if(spot.coordinates)actions.append(link('Googleマップで道順（徒歩） ↗',`https://www.google.com/maps/dir/?api=1&destination=${spot.coordinates.lat},${spot.coordinates.lng}&travelmode=walking`,'detail-route'));
  if(guide?.official)actions.append(link(`${guide.official.label} ↗`,guide.official.url,'detail-official'));
  if(actions.children.length)content.push(actions);
  if(guide?.source){const p=node('p','紹介文の参考：','detail-source');p.append(link(guide.source.label,guide.source.url));content.push(p);}
  $('detail-content').replaceChildren(...content);
  if(origin==='pin')document.querySelector(`[data-spot-id="${id}"]`)?.scrollIntoView({block:'nearest'});
  if(!$('detail').open)$('detail').showModal();
  $('detail').scrollTop=0;
  $('close-detail').focus({preventScroll:true});
}
function renderMarkers(spots){
  if(!state.map)return;
  renderAreas(spots);
  state.markers.forEach(marker=>marker.remove());state.markers.clear();
  for(const spot of spots.filter(s=>s.coordinateStatus==='verified')){
    const html=node('div',undefined,'pin-dot');html.append(node('span',pinLabel(spot)));
    const marker=L.marker([spot.coordinates.lat,spot.coordinates.lng],{icon:L.divIcon({className:'spot-pin',html,iconSize:[44,44],iconAnchor:[22,42]}),title:spot.name,alt:spot.name,keyboard:true}).addTo(state.map);
    marker.on('click',()=>select(spot.id,'pin'));marker.getElement().dataset.spotId=spot.id;marker.getElement().setAttribute('aria-label',`${pinLabel(spot)}：${spot.name}の詳細を開く`);marker.getElement().setAttribute('aria-haspopup','dialog');marker.getElement().setAttribute('aria-controls','detail');state.markers.set(spot.id,marker);
  }
  markSelection();
}
function initMap(){
  try {
    if(!window.L)throw new Error('Leaflet unavailable');
    // This is an overview viewport, never a representative point for a spot/area.
    state.map=L.map('map',{center:[35.183,136.926],zoom:14,scrollWheelZoom:false});
    $('map').tabIndex=0;
    // Pins shrink while zoomed out so neighbouring buildings (19m apart) stay distinguishable; the list is the full-size alternative.
    const zoomClass=()=>{$('map').dataset.zoom=state.map.getZoom()>=17?'near':'far';};state.map.on('zoomend',zoomClass);zoomClass();
    const zoom=document.querySelector('.leaflet-control-zoom');
    zoom.querySelector('.leaflet-control-zoom-in').setAttribute('aria-label','地図を拡大');zoom.querySelector('.leaflet-control-zoom-out').setAttribute('aria-label','地図を縮小');
    showTiles();
  }catch{
    $('map').replaceChildren(node('p','地図を表示できませんでした。一覧からすべての場所を読めます。'));
    $('locate').disabled=true;$('fit').disabled=true;
    $('map-status').textContent='地図を表示できません。一覧をご覧ください。';
  }
}
function showTiles(){
  state.tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
  state.tiles.on('tileerror',()=>{state.tileFailed=true;$('map-status').textContent='背景地図を読み込めませんでした。ピンと一覧はそのまま使えます。';});
  state.tiles.addTo(state.map);
}
// The first fit is instant: an animated zoom still running would override an early 現在地へ移動.
function fitPins(animate=true){
  if(!state.map)return;const points=visibleSpots().filter(s=>s.coordinates).map(s=>[s.coordinates.lat,s.coordinates.lng]);
  if(points.length)state.map.fitBounds(points,{padding:[40,40],maxZoom:16,animate});else state.map.setView([35.183,136.926],14,{animate});mapMessage();
}
$('fit').addEventListener('click',()=>fitPins());
function clearLocation(){
  state.locationRequest++;state.location?.remove();state.locationCircle?.remove();state.location=null;state.locationCircle=null;state.here=null;
  $('clear-location').hidden=true;$('locate').disabled=false;$('location-status').textContent='現在地を消しました。一覧は長屋から近い順に戻りました。';
  if(state.data)render();
}
$('clear-location').addEventListener('click',clearLocation);
$('locate').addEventListener('click',()=>{
  if(!state.map)return;
  if(!navigator.geolocation){$('location-status').textContent='このブラウザでは現在地を使えません。';return;}
  const request=++state.locationRequest;$('locate').disabled=true;$('clear-location').hidden=false;$('location-status').textContent='現在地を確認しています…';
  navigator.geolocation.getCurrentPosition(position=>{
    if(request!==state.locationRequest)return;
    $('locate').disabled=false;
    const {latitude:lat,longitude:lng,accuracy}=position.coords;
    if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180){$('location-status').textContent='現在地を取得できませんでした。';return;}
    state.location?.remove();state.locationCircle?.remove();
    state.location=L.circleMarker([lat,lng],{radius:8,color:'#fffefa',weight:3,fillColor:'#286fc0',fillOpacity:1}).addTo(state.map).bindTooltip('現在地');
    if(Number.isFinite(accuracy)&&accuracy>=0)state.locationCircle=L.circle([lat,lng],{radius:Math.min(accuracy,10000),color:'#286fc0',weight:1,fillOpacity:.08,interactive:false}).addTo(state.map);
    // Move to the visitor only when they are around the map's area; far away, keep the map and say so.
    const nagaya=OWNER_ADDRESS_POINTS[NAGAYA_ID].coordinates;
    if(meters(nagaya,{lat,lng})<=NEAR_METERS){
      state.here={lat,lng};state.map.invalidateSize({pan:false});state.map.setView([lat,lng],Math.max(state.map.getZoom(),16),{animate:false});
      if(state.data)render();
      $('location-status').textContent='現在地へ移動しました。一覧を現在地から近い順に並べ替えました。';
    }else $('location-status').textContent='現在地がこの地図の範囲から離れているため、地図は動かしていません。';
  },error=>{
    if(request!==state.locationRequest)return;
    $('locate').disabled=false;$('clear-location').hidden=!state.location;
    $('location-status').textContent=error.code===1?'現在地の利用が許可されませんでした。':'現在地を取得できませんでした。';
  },{enableHighAccuracy:false,timeout:10000,maximumAge:0});
});
async function reload(){
  if(state.loading)return;state.loading=true;$('reload').disabled=true;$('load-status').classList.remove('quiet');$('load-status').textContent='寄り道先を読み込んでいます。';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch('./spots.json',{cache:'no-store',signal:controller.signal,credentials:'omit'});
    if(!response.ok)throw new Error('Data unavailable');
    const data=applyResearchPoints(applyOwnerAddressPoints(validateSnapshot(await response.json())));
    if(state.data){
      if(Date.parse(data.retrievedAt)<Date.parse(state.data.retrievedAt))throw new Error('Stale data');
      const ids=new Set(data.spots.map(s=>s.id));if(state.data.spots.some(s=>!ids.has(s.id)))throw new Error('Missing IDs');
    }
    const keepDetail=$('detail').open&&state.selected,first=!state.data;
    state.data=data;render();
    if(first)fitPins(false);
    if(keepDetail&&state.selected)select(state.selected,'reload');
    // Success is announced to screen readers only; the retry button appears only after a failure.
    $('load-status').textContent=`${data.spots.length} か所を読み込みました。`;$('load-status').classList.add('quiet');$('reload').hidden=true;
  }catch{
    $('load-status').textContent=state.data?'読み込み直しに失敗しました。前の内容のまま表示しています。':'読み込めませんでした。電波のよい場所で「もう一度読み込む」を押してください。';$('reload').hidden=false;
  }finally{clearTimeout(timer);state.loading=false;$('reload').disabled=false;}
}
for(const theme of THEMES){const option=node('option',theme);option.value=theme;$('theme').append(option);}
$('theme').addEventListener('change',()=>state.data&&render());$('search').addEventListener('input',()=>state.data&&render());
function reset(){ $('theme').value='';$('search').value='';if(state.data)render(); }
$('reset').addEventListener('click',reset);$('empty-reset').addEventListener('click',reset);
$('reload').addEventListener('click',reload);$('show-list').addEventListener('click',()=>view('list'));$('show-map').addEventListener('click',()=>view('map'));
$('close-detail').addEventListener('click',()=>$('detail').close());
$('detail').addEventListener('click',event=>{if(event.target===$('detail')){const r=$('detail').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('detail').close();}});
$('detail').addEventListener('close',()=>{
  // A queued close event must not steal focus from the next chosen card/control.
  // Native dialog restoration handles a still-present invoker. Only recover focus
  // when that invoker was replaced by a refresh, leaving focus in the body/dialog.
  if($('detail').open)return;
  const active=document.activeElement;
  if(active && active!==document.body && active!==$('detail') && !$('detail').contains(active))return;
  const selected=state.selected;
  if(selected){const target=state.view==='map'?state.markers.get(selected)?.getElement():document.querySelector(`.spot[data-spot-id="${selected}"]`);target?.focus({preventScroll:true});}
});
initMap();reload();
