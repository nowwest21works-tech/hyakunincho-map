// v05 copy: same scenarios as artwork-local-supplement.cjs; writes evidence to output/playwright-v05.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/nowwe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs');const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true});const results=[];
 try{for(const width of (process.env.WIDTHS||'320,390,1440').split(',').map(Number)){
  const page=await browser.newPage({viewport:{width,height:width===1440?1000:844}});
  await page.goto('http://127.0.0.1:8795/hyakunincho-map/');await page.waitForSelector('.spot',{state:'attached'});
  if(width!==1440)await page.click('#show-list');
  for(const [id,slug] of [['407e3a043cef8119b898d9a369d142fa','kenchuji'],['407e3a043cef811f9dbde5cb2fe79ea4','ceramics'],['407e3a043cef8125bdb2c9ac406232af','shumokukan'],['407e3a043cef8157869cceda5fc2cff1','futabakan']]){
   await page.locator('.spot[data-spot-id="'+id+'"]').click();
   const image=page.locator('.detail-artwork img').last();await image.evaluate(i=>i.decode());
   await image.evaluate(i=>{const d=document.querySelector('#detail');d.scrollTop+=i.getBoundingClientRect().top-d.getBoundingClientRect().top-95;});
   assert.ok(await image.evaluate(i=>{const r=i.getBoundingClientRect(),d=document.querySelector('#detail').getBoundingClientRect();return r.top>=d.top&&r.bottom<=d.bottom&&i.naturalWidth===1600&&i.naturalHeight===1195;}));
   await page.screenshot({path:(process.env.OUT_DIR||'output/playwright-v05')+'/'+slug+'-full-'+width+'.png'});
   await page.click('#close-detail');assert.equal(await page.locator('#detail').evaluate(d=>d.open),false);
   results.push({width,spot:id,imageFullyVisible:true,close:true});
  }
  await page.route('**/futabakan-exterior.webp',r=>r.fulfill({status:404,body:''}));
  await page.locator('.spot[data-spot-id="407e3a043cef8157869cceda5fc2cff1"]').click();
  await page.waitForFunction(()=>document.querySelectorAll('.detail-artwork figcaption')[1]?.textContent.includes('読み込めません'));
  assert.ok(await page.locator('.detail-artwork img').first().evaluate(i=>i.decode().then(()=>i.naturalWidth>0)));
  assert.equal(await page.locator('.detail-artwork img').last().isHidden(),true);await page.click('#close-detail');
  results.push({width,exteriorFailurePreservesStairsAndClose:true});await page.close();
 }}finally{await browser.close();}
 fs.writeFileSync((process.env.OUT_DIR||'output/playwright-v05')+'/supplement-results-'+(process.env.WIDTHS||'all').replace(/,/g,'-')+'.json',JSON.stringify({results,checks:results.length},null,2));console.log('PASS',results.length,'supplemental scenarios');
})().catch(e=>{console.error(e);process.exitCode=1;});
