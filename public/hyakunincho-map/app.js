import { applyOwnerAddressPoints, ownerAddressPointFor } from './owner-address-points.js';
import { applyResearchPoints, researchPointFor, pendingResearchFor } from './coordinate-research.js';
import { ARTWORKS } from './artworks.js';
import { THEMES, STATUSES, selectSpots, validateSnapshot } from './model.js';
const $=id=>document.getElementById(id);
const state={data:null,selected:null,map:null,markers:new Map(),tiles:null,view:'list',location:null,locationCircle:null,locationRequest:0,loading:false,tileFailed:false};
function node(tag,text,className) { const el=document.createElement(tag); if(text!==undefined)el.textContent=text; if(className)el.className=className; return el; }
// Stable pin label shared by the list card and the map pin: the official course number or enlarged-map letter.
function pinLabel(spot){
  if(ownerAddressPointFor(spot))return '長';
  const m=/^(\d{1,2}|[A-N])(?:\s*\/.*)?$/.exec(spot.symbol);
  return m?m[1]:'周';
}
function locationLabel(spot){
  const owner=ownerAddressPointFor(spot);if(owner)return owner.label;
  const research=researchPointFor(spot);if(research)return '座標確認済み（施設の代表位置）';
  const pending=pendingResearchFor(spot);if(pending)return pending.state==='candidate'?'座標未確定（候補あり・確認待ち）':'座標未確定（場所を確認中）';
  return STATUSES[spot.coordinateStatus];
}
function visibleSpots(){return state.data?selectSpots(state.data.spots,$('theme').value,$('search').value):[];}
function view(mode,focus=false){
  state.view=mode; document.querySelector('.explorer').dataset.view=mode;
  $('show-list').setAttribute('aria-pressed',String(mode==='list')); $('show-map').setAttribute('aria-pressed',String(mode==='map'));
  if(mode==='map')requestAnimationFrame(()=>{state.map?.invalidateSize();if(focus)$('map').focus();});
}
function mapMessage(){
  if(!state.data||!state.map)return;
  if(state.tileFailed){$('map-status').textContent='背景地図を読み込めませんでした。一覧・詳細カードは引き続き使えます。';return;}
  const visible=visibleSpots(),count=visible.filter(s=>s.coordinateStatus==='verified').length;
  $('map-status').textContent=count?`絞り込み中の地点・住所参考点 ${count} 件をピン表示しています。`:'この絞り込みに座標確認済みの地点はありません。未確定の場所は一覧から読めます。';
}
function render(){
  const visible=visibleSpots(),all=state.data.spots;
  $('counts').textContent=`表示 ${visible.length} / 全 ${all.length} 件 · ピン ${visible.filter(s=>s.coordinateStatus==='verified').length} 件`;
  const totalPins=all.filter(s=>s.coordinateStatus==='verified').length;
  const addressCount=all.filter(s=>ownerAddressPointFor(s)).length,researchCount=all.filter(s=>researchPointFor(s)).length,areaCount=all.filter(s=>s.coordinateStatus==='area').length;
  $('data-note').textContent=`地図に表示できる地点 ${totalPins} 件（調べて確かめた施設の代表位置 ${researchCount} 件・本人確認済み住所参考点 ${addressCount} 件）／座標未確定 ${all.length-totalPins-areaCount} 件・区域 ${areaCount} 件。未確定の地点も一覧に残しています。`;
  const fragment=document.createDocumentFragment();
  for(const spot of visible){
    const button=node('button',undefined,'spot');button.type='button';button.dataset.spotId=spot.id;
    button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','detail');button.setAttribute('aria-current',String(spot.id===state.selected));
    const top=node('div',undefined,'spot-top');
    if(spot.coordinateStatus==='verified'){const badge=node('span',pinLabel(spot),'pin-badge');badge.title='地図のピン '+pinLabel(spot);badge.setAttribute('aria-label','地図のピン '+pinLabel(spot));top.append(badge);}
    top.append(node('span',spot.theme,'theme'),node('span',spot.area));
    const bottom=node('div',undefined,'spot-bottom');bottom.append(node('span',locationLabel(spot),`status ${spot.coordinateStatus}`),node('span','物語を読む ↗'));
    button.append(top,node('h3',spot.name),node('p',spot.description,'spot-description'),bottom);
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
}
function select(id,origin){
  const spot=state.data?.spots.find(s=>s.id===id);if(!spot)return;
  state.selected=id;markSelection();
  const title=node('h2',spot.name);title.id='detail-title';
  const tags=node('p',`${spot.theme} · ${spot.area}`,'detail-tags');
  const facts=node('div',undefined,'detail-facts');
  const ownerPoint=ownerAddressPointFor(spot),researchPoint=researchPointFor(spot),pending=pendingResearchFor(spot);
  facts.append(node('p',`場所：${locationLabel(spot)}${spot.coordinateStatus==='verified'?`（地図のピン ${pinLabel(spot)}）`:''}`),node('p',`掲載区分：${spot.section}${spot.symbol?' · '+spot.symbol:''}`),node('p',`訪問状況：${spot.visitStatus}`));
  if(ownerPoint)facts.append(node('p',`住所：${ownerPoint.address}`),node('p',ownerPoint.note));
  if(researchPoint){
    facts.append(node('p',`所在地：${researchPoint.address}`),node('p',`座標の根拠：${researchPoint.basis}。入口の位置ではありません。（確認日 ${researchPoint.checkedOn}）`));
    if(researchPoint.note)facts.append(node('p',researchPoint.note));
  }
  if(pending)facts.append(node('p',`座標の確認状況：${pending.note}（確認日 ${pending.checkedOn}）`));
  if(spot.missing.length){facts.append(node('p','これから確かめること'));const ul=node('ul');spot.missing.forEach(s=>ul.append(node('li',s)));facts.append(ul);}
  const content=[title,tags];
  const artwork=Object.hasOwn(ARTWORKS,spot.id)?ARTWORKS[spot.id]:null;
  for(const item of artwork?[artwork,...(artwork.additional??[])]:[]){
    const figure=node('figure',undefined,'detail-artwork');
    const img=node('img');img.src=item.src;img.alt=item.alt;img.width=item.width;img.height=item.height;img.decoding='async';
    const caption=node('figcaption',item.caption);
    const note=node('p',item.note,'artwork-note');
    img.addEventListener('error',()=>{img.hidden=true;caption.textContent='イラストを読み込めませんでした。地点の説明は引き続き読めます。';},{once:true});
    figure.append(img,caption,note);content.push(figure);
  }
  content.push(node('p',spot.description,'detail-description'),facts);
  if(spot.sourceUrl){const a=node('a','紹介の一次出典を読む ↗','detail-source');a.href=spot.sourceUrl;a.target='_blank';a.rel='noopener noreferrer';content.push(a);}
  if(researchPoint&&researchPoint.officialUrl!==spot.sourceUrl){const a=node('a','所在地の出典を読む ↗','detail-source');a.href=researchPoint.officialUrl;a.target='_blank';a.rel='noopener noreferrer';content.push(a);}
  if(spot.coordinateStatus==='verified'&&state.map){
    const show=node('button',ownerPoint?'この住所参考点を地図で見る':'この地点を地図で見る','detail-map');show.type='button';show.addEventListener('click',()=>{$('detail').close();view('map');
      // On phones the map panel was hidden (display:none) until now: size the map first, then jump without a pan animation,
      // otherwise a short pan between neighbouring pins is computed against a zero-size map and the pin lands off-centre.
      requestAnimationFrame(()=>{state.map.invalidateSize({pan:false});state.map.setView([spot.coordinates.lat,spot.coordinates.lng],18,{animate:false});$('map-panel').scrollIntoView({block:'start'});state.markers.get(id)?.getElement()?.focus({preventScroll:true});});});content.push(show);
  }
  $('detail-content').replaceChildren(...content);
  if(origin==='pin')document.querySelector(`[data-spot-id="${id}"]`)?.scrollIntoView({block:'nearest'});
  if(!$('detail').open)$('detail').showModal();
  $('detail').scrollTop=0;
  $('close-detail').focus({preventScroll:true});
}
function renderMarkers(spots){
  if(!state.map)return;
  state.markers.forEach(marker=>marker.remove());state.markers.clear();
  for(const spot of spots.filter(s=>s.coordinateStatus==='verified')){
    const html=node('div',undefined,'pin-dot');html.append(node('span',pinLabel(spot)));
    const marker=L.marker([spot.coordinates.lat,spot.coordinates.lng],{icon:L.divIcon({className:'spot-pin',html,iconSize:[44,44],iconAnchor:[22,42]}),title:spot.name+(ownerAddressPointFor(spot)?'（本人確認済み住所参考点）':''),alt:spot.name,keyboard:true}).addTo(state.map);
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
  }catch{
    $('map').replaceChildren(node('p','地図を準備できませんでした。一覧からすべてのスポットを読めます。'));
    $('map-consent').hidden=true;$('enable-map').disabled=true;$('locate').disabled=true;$('fit').disabled=true;
    $('map-status').textContent='地図を利用できません。一覧をお使いください。';
  }
}
$('enable-map').addEventListener('click',()=>{
  if(!state.map||state.tiles)return;
  $('map-consent').hidden=true;
  state.tiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});
  state.tiles.on('tileerror',()=>{state.tileFailed=true;$('map-status').textContent='背景地図を読み込めませんでした。一覧・詳細カードは引き続き使えます。';});
  state.tiles.addTo(state.map);
});
$('fit').addEventListener('click',()=>{
  if(!state.map)return;const points=visibleSpots().filter(s=>s.coordinates).map(s=>[s.coordinates.lat,s.coordinates.lng]);
  if(points.length)state.map.fitBounds(points,{padding:[40,40],maxZoom:16});else state.map.setView([35.183,136.926],14);mapMessage();
});
function clearLocation(){
  state.locationRequest++;state.location?.remove();state.locationCircle?.remove();state.location=null;state.locationCircle=null;
  $('clear-location').hidden=true;$('locate').disabled=false;$('location-status').textContent='現在地を消しました。取得中の結果も表示しません。';
}
$('clear-location').addEventListener('click',clearLocation);
$('locate').addEventListener('click',()=>{
  if(!state.map)return;
  if(!navigator.geolocation){$('location-status').textContent='このブラウザでは現在地を取得できません。一覧と地図は使えます。';return;}
  const request=++state.locationRequest;$('locate').disabled=true;$('clear-location').hidden=false;$('location-status').textContent='現在地の許可を確認しています。取り消しても一覧と地図は使えます。';
  navigator.geolocation.getCurrentPosition(position=>{
    if(request!==state.locationRequest)return;
    $('locate').disabled=false;
    const {latitude:lat,longitude:lng,accuracy}=position.coords;
    if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180){$('location-status').textContent='現在地を確認できませんでした。通常の表示を続けます。';return;}
    state.location?.remove();state.locationCircle?.remove();
    state.location=L.circleMarker([lat,lng],{radius:8,color:'#fffefa',weight:3,fillColor:'#286fc0',fillOpacity:1}).addTo(state.map).bindTooltip('現在地');
    if(Number.isFinite(accuracy)&&accuracy>=0)state.locationCircle=L.circle([lat,lng],{radius:Math.min(accuracy,10000),color:'#286fc0',weight:1,fillOpacity:.08,interactive:false}).addTo(state.map);
    // Never center or zoom to the device position: tile requests must not encode it.
    $('location-status').textContent=state.map.getBounds().contains([lat,lng])?'現在地を青い丸で表示しました。精度は周囲の円が目安です。':'現在地は表示中の地図の範囲外です。現在地への自動移動はしません。';
  },error=>{
    if(request!==state.locationRequest)return;
    $('locate').disabled=false;$('clear-location').hidden=!state.location;
    $('location-status').textContent=error.code===1?'現在地の利用は許可されませんでした。一覧と地図はそのまま使えます。':'現在地を取得できませんでした。一覧と地図はそのまま使えます。';
  },{enableHighAccuracy:false,timeout:10000,maximumAge:0});
});
async function reload(){
  if(state.loading)return;state.loading=true;$('reload').disabled=true;$('load-status').textContent='スポットを読み込んでいます。';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
  try{
    const response=await fetch('./spots.json',{cache:'no-store',signal:controller.signal,credentials:'omit'});
    if(!response.ok)throw new Error('Data unavailable');
    const data=applyResearchPoints(applyOwnerAddressPoints(validateSnapshot(await response.json())));
    if(state.data){
      if(Date.parse(data.retrievedAt)<Date.parse(state.data.retrievedAt))throw new Error('Stale data');
      const ids=new Set(data.spots.map(s=>s.id));if(state.data.spots.some(s=>!ids.has(s.id)))throw new Error('Missing IDs');
    }
    const keepDetail=$('detail').open&&state.selected;
    state.data=data;render();
    if(keepDetail&&state.selected)select(state.selected,'reload');
    $('load-status').textContent=`${data.spots.length} 件を読み込みました。取得：${new Date(data.retrievedAt).toLocaleString('ja-JP',{timeZone:'Asia/Tokyo'})} JST · ${data.inputVersion}`;
  }catch{
    $('load-status').textContent=state.data?'読み直しに失敗しました。前回のデータを引き続き表示しています。':'データを読み込めませんでした。「データを読み直す」から再試行できます。';
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
