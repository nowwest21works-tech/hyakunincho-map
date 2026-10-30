// Browser re-test for the researched pins (2026-10-29). Run with the local server on 127.0.0.1:8795.
// PLAYWRIGHT_MODULE may point to any Playwright-compatible module (this run used a Chromium 138 shim).
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs/promises');const path=require('node:path');const {pathToFileURL}=require('node:url');
const root='http://127.0.0.1:8795/hyakunincho-map/';const ownerId='407e3a043cef81b5b765ed86e8b9b6e3';
const outDir=process.env.OUT_DIR||'output/playwright-v05';
let current='';
const mod=f=>import(pathToFileURL(path.resolve('public/hyakunincho-map',f)).href);
(async()=>{
 const {RESEARCH_POINTS,RESEARCH_PENDING,RESEARCH_CHECKED_ON}=await mod('coordinate-research-data.js');const {ARTWORKS}=await mod('artworks.js');
 const raw=JSON.parse(await fs.readFile('public/hyakunincho-map/spots.json','utf8'));const byId=new Map(raw.spots.map(s=>[s.id,s]));
 const pinIds=[ownerId,...Object.keys(RESEARCH_POINTS)];const areaIds=raw.spots.filter(s=>s.coordinateStatus==='area').map(s=>s.id);
 assert.equal(pinIds.length,20);assert.equal(Object.keys(RESEARCH_PENDING).length,8);assert.equal(areaIds.length,2);
 await fs.mkdir(outDir,{recursive:true});
 const browser=await chromium.launch({headless:true});const results=[];
 const check=(name,ok)=>{assert.ok(ok,name);results.push({name,pass:true});};
 try{for(const width of (process.env.WIDTHS||'320,390,1440').split(',').map(Number)){
  const mobile=width<761;const page=await browser.newPage({viewport:{width,height:mobile?844:1000}}),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
  await page.addInitScript(()=>{window.geoCalls=0;Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition(ok,fail){window.geoCalls++;fail({code:1});}}});});
  await page.goto(root);await page.waitForFunction(()=>document.querySelectorAll('.spot').length===30);
  check(`${width}: 30 cards and 20 pins (owner 1 + researched 19)`,await page.locator('.spot').count()===30&&await page.locator('.spot-pin').count()===20);
  check(`${width}: data note counts`,(await page.locator('#data-note').innerText()).includes('地図に表示できる地点 20 件（調べて確かめた施設の代表位置 19 件・本人確認済み住所参考点 1 件）／座標未確定 8 件・区域 2 件'));
  // Pin label on each marker == badge on the matching card; pins exist only for the expected ids.
  const pinMap=await page.$$eval('.spot-pin',els=>els.map(e=>[e.dataset.spotId,e.textContent.trim()]));
  const badgeMap=await page.$$eval('.spot',els=>els.filter(e=>e.querySelector('.pin-badge')).map(e=>[e.dataset.spotId,e.querySelector('.pin-badge').textContent.trim()]));
  check(`${width}: pin ids exactly the confirmed set`,JSON.stringify(pinMap.map(p=>p[0]).sort())===JSON.stringify([...pinIds].sort()));
  check(`${width}: every pin label equals its card badge`,JSON.stringify(Object.fromEntries(pinMap))===JSON.stringify(Object.fromEntries(pinMap.map(([id])=>[id,Object.fromEntries(badgeMap)[id]])))&&badgeMap.length===20);
  check(`${width}: official symbols used as labels`,Object.fromEntries(pinMap)['407e3a043cef8157869cceda5fc2cff1']==='4'&&Object.fromEntries(pinMap)['407e3a043cef8125bdb2c9ac406232af']==='3'&&Object.fromEntries(pinMap)['407e3a043cef81078526d95c5803e78a']==='H'&&Object.fromEntries(pinMap)[ownerId]==='長'&&Object.fromEntries(pinMap)['407e3a043cef81afa589ebddc8b95fdb']==='周');
  check(`${width}: zoomed-out pins are compact`,await page.locator('.spot-pin').first().evaluate(e=>Math.round(e.getBoundingClientRect().width))===28||!(await page.locator('.spot-pin').first().isVisible()));
  // Card -> map -> pin -> same card, for all 20 pinned spots, with real pointer clicks.
  for(const id of pinIds){
   if(mobile)await page.click('#show-list');
   current=`${width} card ${id}`;await page.locator(`.spot[data-spot-id="${id}"]`).click();await page.waitForFunction(n=>document.querySelector('#detail-title')?.textContent===n,byId.get(id).name);
   const text=await page.locator('#detail-content').innerText();
   if(id===ownerId)check(`${width}: ${id} owner reference intact`,text.includes('百人町100')&&text.includes('入口の実測・公道からの動線は未確認'));
   else check(`${width}: ${id} shows address, basis, not-entrance and checked date`,text.includes('所在地：')&&text.includes('座標の根拠：OpenStreetMap')&&text.includes('入口の位置ではありません')&&text.includes('確認日 '+RESEARCH_CHECKED_ON)&&text.includes('施設の代表位置'));
   await page.click('.detail-map');await page.waitForFunction(id=>{const d=document.querySelector('#detail'),m=document.querySelector('#map').getBoundingClientRect(),e=document.querySelector(`.spot-pin[data-spot-id="${id}"]`);if(d.open||!e||document.querySelector('#map').dataset.zoom!=='near')return false;const r=e.getBoundingClientRect(),x=r.left+r.width/2-m.left,y=r.bottom-m.top,ok=Math.abs(x-m.width/2)<6&&Math.abs(y-m.height/2)<10,k=x+','+y;const prev=window.__pinStable;window.__pinStable=k;return ok&&prev===k;},id,{polling:120});
   check(`${width}: ${id} map view at zoom 18 with full-size selected pin`,await page.locator(`.spot-pin.selected[data-spot-id="${id}"]`).count()===1&&await page.locator(`.spot-pin[data-spot-id="${id}"]`).evaluate(e=>Math.round(e.getBoundingClientRect().width))===44);
   current=`${width} pin ${id}`;await page.locator(`.spot-pin[data-spot-id="${id}"]`).click({timeout:8000});await page.waitForFunction(()=>document.querySelector('#detail').open);
   check(`${width}: ${id} pin reopens the same card and list is selected`,await page.locator('#detail-title').innerText()===byId.get(id).name&&await page.locator(`.spot[data-spot-id="${id}"][aria-current=true]`).count()===1);
   await page.keyboard.press('Escape');
  }
  if(mobile)await page.click('#show-list');
  for(const [id,p] of Object.entries(RESEARCH_PENDING)){
   const card=page.locator(`.spot[data-spot-id="${id}"]`);
   check(`${width}: ${id} pending stays in list without pin/badge`,await card.count()===1&&await card.locator('.pin-badge').count()===0&&await page.locator(`.spot-pin[data-spot-id="${id}"]`).count()===0&&(await card.innerText()).includes(p.state==='candidate'?'候補あり・確認待ち':'場所を確認中'));
   await card.click();const t=await page.locator('#detail-content').innerText();
   check(`${width}: ${id} pending detail shows reason/date and no map button`,t.includes('座標の確認状況：')&&t.includes('確認日 '+RESEARCH_CHECKED_ON)&&await page.locator('.detail-map').count()===0);await page.keyboard.press('Escape');
  }
  for(const id of areaIds)check(`${width}: area ${id} has no pin/badge`,await page.locator(`.spot-pin[data-spot-id="${id}"]`).count()===0&&(await page.locator(`.spot[data-spot-id="${id}"]`).innerText()).includes('区域・表示方法未確定'));
  // Name <-> illustration correspondence is unchanged for all 13 illustrated cards.
  for(const [id,a] of Object.entries(ARTWORKS)){
   await page.locator(`.spot[data-spot-id="${id}"]`).click();await page.waitForFunction(()=>document.querySelector('.detail-artwork img')?.naturalWidth>0);
   const imgs=await page.$$eval('.detail-artwork img',els=>els.map(i=>({src:i.getAttribute('src'),alt:i.alt,w:i.naturalWidth})));const caps=await page.$$eval('.detail-artwork figcaption',els=>els.map(e=>e.textContent));
   const expected=[a,...(a.additional??[])];
   check(`${width}: ${byId.get(id).name} image(s) and captions unchanged`,await page.locator('#detail-title').innerText()===byId.get(id).name&&imgs.length===expected.length&&expected.every((e,i)=>imgs[i].src===e.src&&imgs[i].alt===e.alt&&caps[i]===e.caption));
   await page.keyboard.press('Escape');
  }
  // Filters keep list and pins in step.
  for(const theme of ['歴史・建築','町並み・路地','寺社・信仰','文化・美術','飲食・喫茶','公園・自然','百人町活動']){
   await page.selectOption('#theme',theme);
   const visible=await page.$$eval('.spot',els=>els.map(e=>e.dataset.spotId));const pins=await page.$$eval('.spot-pin',els=>els.map(e=>e.dataset.spotId));
   const exp=raw.spots.filter(s=>s.theme===theme);
   check(`${width}: theme ${theme} cards ${exp.length}, pins match visible confirmed`,visible.length===exp.length&&pins.length===exp.filter(s=>pinIds.includes(s.id)).length&&pins.every(p=>visible.includes(p))&&(await page.locator('#counts').innerText()).includes(`ピン ${pins.length} 件`));
  }
  await page.selectOption('#theme','');await page.fill('#search','寺');
  { const visible=await page.$$eval('.spot',els=>els.map(e=>e.dataset.spotId));const pins=await page.$$eval('.spot-pin',els=>els.map(e=>e.dataset.spotId));
    check(`${width}: search 寺 filters pins with list`,visible.length>0&&pins.length>0&&pins.every(p=>visible.includes(p))&&pins.length===visible.filter(v=>pinIds.includes(v)).length); }
  await page.click('#reset');check(`${width}: reset restores 30/20`,await page.locator('.spot').count()===30&&await page.locator('.spot-pin').count()===20);
  if(mobile){await page.click('#show-map');check(`${width}: map view shows map, hides list`,await page.locator('#map').isVisible()&&!(await page.locator('#list-panel').isVisible()));}
  await page.click('#fit');await page.waitForTimeout(400);
  check(`${width}: fit shows all 20 pins inside the map`,await page.$$eval('.spot-pin',(els)=>{const m=document.querySelector('#map').getBoundingClientRect();return els.every(e=>{const r=e.getBoundingClientRect();return r.left>=m.left-1&&r.right<=m.right+1&&r.top>=m.top-1&&r.bottom<=m.bottom+1;});}));
  await page.screenshot({path:`${outDir}/map-fit-${width}.png`});
  if(mobile)await page.click('#show-list');
  await page.locator('.spot[data-spot-id="407e3a043cef81078526d95c5803e78a"]').click();await page.screenshot({path:`${outDir}/detail-haruta-${width}.png`});
  check(`${width}: no horizontal overflow (page and dialog)`,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)&&await page.locator('#detail').evaluate(d=>d.scrollWidth<=d.clientWidth));await page.keyboard.press('Escape');
  await page.screenshot({path:`${outDir}/list-${width}.png`});
  const ct=await page.evaluate(async()=>(await fetch('./artworks/kenchuji.PNG',{method:'HEAD'})).headers.get('content-type'));
  check(`${width}: uppercase .PNG served as image/png`,ct==='image/png');
  check(`${width}: no location request or external connection`,await page.evaluate(()=>window.geoCalls===0)&&requests.every(u=>u.startsWith('http://127.0.0.1:8795/')));
  check(`${width}: no JS errors`,errors.length===0);await page.close();
 }
 await fs.writeFile(outDir+'/coords-browser-results.json',JSON.stringify({testedAt:new Date().toISOString(),checks:results.length,viewports:[320,390,1440],pins:20,researched:19,pending:8,areas:2,results},null,2)+'\n');console.log('PASS',results.length,'coordinate browser checks');
 }finally{await browser.close();}
})().catch(e=>{console.error('FAIL at',current,'|',e.message.slice(0,1500));process.exit(1);});
