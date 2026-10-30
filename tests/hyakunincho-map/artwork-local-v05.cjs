const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/nowwe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert=require('node:assert/strict');const fs=require('node:fs/promises');
const root='http://127.0.0.1:8795/hyakunincho-map/';
const ownerId='407e3a043cef81b5b765ed86e8b9b6e3';
const expectedIds=['407e3a043cef81b5b765ed86e8b9b6e3','407e3a043cef81d59e19fe01b74ad602','407e3a043cef81c994bcc245bf043007','407e3a043cef8157869cceda5fc2cff1','407e3a043cef8139b06ac86f7a4d4637','407e3a043cef819ab9abea55c1605d38','407e3a043cef8154a9c5e5776fb9e2ed','407e3a043cef8153a959eb460a672be8','407e3a043cef81139f9df6aaf1d15993','407e3a043cef81afa589ebddc8b95fdb','407e3a043cef8119b898d9a369d142fa','407e3a043cef811f9dbde5cb2fe79ea4','407e3a043cef8125bdb2c9ac406232af'];
// v05 copy of artwork-local.cjs (2026-10-29): identical image/card checks; pin expectations follow the researched pins.
// The original file is kept unchanged as the v04 record.
const outDir=process.env.OUT_DIR||'output/playwright-v05';
(async()=>{
 const research=await import(require('node:url').pathToFileURL(require('node:path').resolve('public/hyakunincho-map/coordinate-research-data.js')).href);
 const pinIds=new Set([ownerId,...Object.keys(research.RESEARCH_POINTS)]);await fs.mkdir(outDir,{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const results=[];
 const check=(name,ok)=>{assert.ok(ok,name);results.push({name,pass:true});};
 const raw=JSON.parse(await fs.readFile('public/hyakunincho-map/spots.json','utf8'));
 try{
  for(const width of (process.env.WIDTHS||'320,390,1440').split(',').map(Number)){
   const page=await browser.newPage({viewport:{width,height:width===1440?1000:844}}),errors=[],requests=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
   await page.addInitScript(()=>{window.geoCalls=0;Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition(ok,fail){window.geoCalls++;fail({code:1});}}});});
   await page.goto(root);await page.waitForFunction(()=>document.querySelectorAll('.spot').length===30);
   check(`${width}: all30, pins = owner 1 + researched ${pinIds.size-1}`,await page.locator('.spot').count()===30&&await page.locator('.spot-pin').count()===pinIds.size);
   check(`${width}: owner-reference label shown`,(await page.locator(`.spot[data-spot-id="${ownerId}"]`).innerText()).includes('本人確認済み住所参考点'));
   check(`${width}: no background image prefetch`,!requests.some(u=>u.includes('/artworks/')));
   for(let cycle=0;cycle<2;cycle++)for(const id of expectedIds){
    await page.locator(`.spot[data-spot-id="${id}"]`).click();
    await page.waitForFunction(()=>document.querySelector('.detail-artwork img')?.naturalWidth>0);
    check(`${width}: ${id} cycle${cycle} starts with full heading visible`,await page.locator('#detail-title').evaluate(t=>{const d=document.querySelector('#detail').getBoundingClientRect(),r=t.getBoundingClientRect();return r.top>=d.top&&r.bottom<=d.bottom;}));
    check(`${width}: ${id} cycle${cycle} correct card and whole illustration`,await page.locator('#detail-title').innerText()===raw.spots.find(s=>s.id===id).name&&await page.locator('.detail-artwork img').first().evaluate(i=>Math.abs(i.getBoundingClientRect().width/i.getBoundingClientRect().height-i.naturalWidth/i.naturalHeight)<.01));
    check(`${width}: ${id} cycle${cycle} alt/caption and no overflow`,await page.locator('.detail-artwork img').first().getAttribute('alt')&& (await page.locator('.detail-artwork figcaption').first().innerText()).includes('提供イラスト')&&await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)&&await page.locator('#detail').evaluate(d=>d.scrollWidth<=d.clientWidth));
    if(id===ownerId&&cycle===0){check(`${width}: address and limitations accurate`,(await page.locator('#detail-content').innerText()).includes('百人町100')&&(await page.locator('#detail-content').innerText()).includes('入口の実測・公道からの動線は未確認'));}
    if((id===ownerId||id==='407e3a043cef8157869cceda5fc2cff1')&&cycle===0)await page.screenshot({path:`${outDir}/detail-${id===ownerId?'nagaya':'stairs'}-${width}.png`});
    await page.keyboard.press('Escape');
   }
   await page.locator('.spot[data-spot-id="407e3a043cef8157869cceda5fc2cff1"]').click();
   check(width+': futabakan retains stairs and exterior',await page.locator('.detail-artwork img').count()===2);
   for(let imageIndex=0;imageIndex<2;imageIndex++){
    const img=page.locator('.detail-artwork img').nth(imageIndex);
    await img.scrollIntoViewIfNeeded();await img.evaluate(i=>i.decode());
    check(width+': futabakan image '+imageIndex+' loaded and uncropped',await img.evaluate(i=>i.naturalWidth>0 && Math.abs(i.width/i.height-i.naturalWidth/i.naturalHeight)<.01));
    await page.screenshot({path:outDir+'/futabakan-'+imageIndex+'-'+width+'.png'});
   }
   await page.click('#close-detail');
   // No artificial delay after close: a queued old close event must not retarget Enter.
   for(const id of expectedIds){
    await page.locator(`.spot[data-spot-id="${id}"]`).focus();await page.keyboard.press('Enter');
    await page.waitForFunction(name=>document.querySelector('#detail-title')?.textContent===name,raw.spots.find(s=>s.id===id).name);
    check(`${width}: rapid keyboard resets scroll for ${id}`,await page.locator('#detail').evaluate(d=>d.scrollTop===0));
    check(`${width}: rapid keyboard opens intended ${id}`,await page.locator('#detail-title').innerText()===raw.spots.find(s=>s.id===id).name);
    await page.locator('#detail').evaluate(d=>d.scrollTop=d.scrollHeight);await page.click('#close-detail');
   }
   for(const id of ['407e3a043cef812e9f90ece7c12e8d83','407e3a043cef8155acf0f17e950a4f89','407e3a043cef8142849cee124a2ccebb']){await page.locator(`.spot[data-spot-id="${id}"]`).click();check(`${width}: held/no-source ${id} stays image-free`,await page.locator('.detail-artwork').count()===0);await page.keyboard.press('Escape');}
   await page.locator(`.spot[data-spot-id="${ownerId}"]`).click();await page.click('.detail-map');
   check(`${width}: address pin and list selected together`,await page.locator(`.spot-pin.selected[data-spot-id="${ownerId}"]`).count()===1&&await page.locator(`.spot[data-spot-id="${ownerId}"][aria-current=true]`).count()===1);
   await page.locator(`.spot-pin[data-spot-id="${ownerId}"]`).click();check(`${width}: address pin opens same illustrated card`,(await page.locator('#detail-title').innerText()).includes('みんなのまほろ場')&&await page.locator('.detail-artwork').count()===1);await page.keyboard.press('Escape');
   if(width!==1440)await page.click('#show-list');
   for(const theme of ['歴史・建築','町並み・路地','寺社・信仰','文化・美術','飲食・喫茶','公園・自然','百人町活動']){await page.selectOption('#theme',theme);check(`${width}: theme ${theme} exact count and matching pins`,await page.locator('.spot').count()===raw.spots.filter(s=>s.theme===theme).length&&await page.locator('.spot-pin').count()===raw.spots.filter(s=>s.theme===theme&&pinIds.has(s.id)).length);}
   await page.fill('#search','存在しない検証語');check(`${width}: zero-result list and pins0`,await page.locator('#empty').isVisible()&&await page.locator('.spot-pin').count()===0);await page.click('#empty-reset');
   await page.click('#reload');await page.waitForFunction(()=>document.querySelector('#load-status').textContent.includes('30 件を読み込みました'));
   check(`${width}: reload retains same pins, no duplicates`,await page.locator('.spot').count()===30&&await page.locator('.spot-pin').count()===pinIds.size);
   await page.route('**/hyakunincho-map/spots.json',r=>r.fulfill({status:503,body:''}));await page.click('#reload');await page.waitForFunction(()=>document.querySelector('#load-status').textContent.includes('失敗'));
   check(`${width}: failed data refresh retains all30 and pins`,await page.locator('.spot').count()===30&&await page.locator('.spot-pin').count()===pinIds.size);await page.unroute('**/hyakunincho-map/spots.json');
   await page.route('**/artworks/*',r=>r.fulfill({status:200,contentType:'image/png',body:'broken image'}));await page.locator(`.spot[data-spot-id="${ownerId}"]`).click();await page.waitForFunction(()=>document.querySelector('.detail-artwork figcaption')?.textContent.includes('読み込めません'));
   check(`${width}: missing illustration leaves detail and close usable`,await page.locator('#detail-title').isVisible()&&await page.locator('#close-detail').isVisible());await page.keyboard.press('Escape');await page.unroute('**/artworks/*');
   const injected=structuredClone(raw);injected.spots.find(s=>s.id===ownerId).description='<img src=x onerror="window.injected=true">';
   await page.route('**/hyakunincho-map/spots.json',r=>r.fulfill({json:injected}));await page.click('#reload');await page.waitForFunction(()=>document.querySelector('#load-status').textContent.includes('30 件を読み込みました'));
   await page.locator(`.spot[data-spot-id="${ownerId}"]`).click();check(`${width}: description injection is text alongside trusted artwork`,await page.locator('.detail-description img').count()===0&&await page.evaluate(()=>!window.injected)&&await page.locator('.detail-description').innerText()==='<img src=x onerror="window.injected=true">');await page.keyboard.press('Escape');
   check(`${width}: no location request or external connection`,await page.evaluate(()=>window.geoCalls===0)&&requests.every(u=>u.startsWith('http://127.0.0.1:8795/')));
   check(`${width}: no JS errors`,errors.length===0);await page.close();
  }
  await fs.writeFile(outDir+'/artwork-v05-results-'+(process.env.WIDTHS||'all').replace(/,/g,'-')+'.json',JSON.stringify({testedAt:new Date().toISOString(),results,checks:results.length,viewports:[320,390,1440],expectedImageCards:13,canonicalSpotCount:30,ownerAddressPins:1,researchedPins:pinIds.size-1},null,2)+'\n');console.log('PASS',results.length,'local-images browser checks');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
