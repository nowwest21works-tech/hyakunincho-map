// 現在地ボタン（2026-10-30）：近くにいれば現在地へ移動して一覧を近い順に、遠ければ地図を動かさない。消すと長屋から近い順に戻る。
// Run with the local server on 127.0.0.1:8795. Geolocation is faked; map tiles are served blank so no network is needed.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const root='http://127.0.0.1:8795/hyakunincho-map/';
const NAGAYA='407e3a043cef81b5b765ed86e8b9b6e3',FUTABAKAN='407e3a043cef8157869cceda5fc2cff1';
const TILE=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=','base64');
(async()=>{
 const browser=await chromium.launch();let checks=0;const check=(name,ok)=>{assert.ok(ok,name);checks++;};
 try{for(const width of (process.env.WIDTHS||'320,390,1440').split(',').map(Number)){
  const page=await browser.newPage({viewport:{width,height:width===1440?1000:844}});
  await page.addInitScript(()=>{window.fakeAt={lat:35.18045,lng:136.91870};Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition(ok){ok({coords:{latitude:window.fakeAt.lat,longitude:window.fakeAt.lng,accuracy:20}});}}});});
  await page.route('https://tile.openstreetmap.org/**',r=>r.fulfill({contentType:'image/png',body:TILE}));
  await page.goto(root);await page.waitForFunction(()=>document.querySelectorAll('.spot').length===30);
  check(`${width}: before sharing, the nagaya comes first`,(await page.locator('.spot').first().getAttribute('data-spot-id'))===NAGAYA);
  // Near 二葉館: move there and sort by distance from the visitor.
  await page.click('#locate');await page.waitForFunction(()=>document.querySelector('#location-status').textContent.includes('移動しました'));await page.waitForTimeout(800);
  check(`${width}: map moved to the visitor (blue dot at the map centre)`,await page.locator('path.leaflet-interactive[fill="#286fc0"]').first().evaluate(e=>{const r=e.getBoundingClientRect(),m=document.querySelector('#map').getBoundingClientRect();return Math.abs(r.left+r.width/2-(m.left+m.width/2))<8&&Math.abs(r.top+r.height/2-(m.top+m.height/2))<8;}));
  // The district card may come just before its first building (here: you are inside it).
  check(`${width}: nearest place is listed first`,(await page.locator('.spot:has(.distance)').first().getAttribute('data-spot-id'))===FUTABAKAN&&(await page.locator('.spot').nth(1).getAttribute('data-spot-id'))===FUTABAKAN);
  check(`${width}: distances are now from the visitor`,(await page.locator('.spot:has(.distance)').first().innerText()).includes('現在地から直線 約')&&!(await page.locator('#spots').innerText()).includes('長屋から直線'));
  // Clearing goes back to the nagaya order.
  await page.click('#clear-location');
  check(`${width}: clearing restores the nagaya order`,(await page.locator('.spot').first().getAttribute('data-spot-id'))===NAGAYA&&(await page.locator('#spots').innerText()).includes('長屋から直線'));
  // Far away (Tokyo): the map stays and the list keeps the nagaya order.
  await page.evaluate(()=>{window.fakeAt={lat:35.681,lng:139.767};});
  await page.click('#locate');await page.waitForFunction(()=>document.querySelector('#location-status').textContent.includes('離れている'));
  check(`${width}: far away does not reorder`,(await page.locator('.spot').first().getAttribute('data-spot-id'))===NAGAYA);
  await page.close();
 }}finally{await browser.close();}
 console.log('PASS',checks,'location checks');
})().catch(e=>{console.error(e);process.exitCode=1;});
