import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile,writeFile,mkdtemp,rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSnapshot,refresh } from '../../scripts/hyakunincho-map/import.mjs';
import { validateSnapshot,selectSpots,safeUrl } from '../../public/hyakunincho-map/model.js';
const source=JSON.parse(await readFile(new URL('../../review/hyakunincho-map/notion-export.json',import.meta.url),'utf8'));
const clone=()=>structuredClone(source);
const data=buildSnapshot(source);
test('canonical 30 stable IDs, no confirmed coordinates, 2 areas, private columns stripped',async()=>{
  assert.equal(data.spots.length,30);assert.equal(new Set(data.spots.map(s=>s.id)).size,30);
  assert.equal(data.spots.filter(s=>s.coordinates).length,0);assert.equal(data.spots.filter(s=>s.coordinateStatus==='area').length,2);
  const text=JSON.stringify(data);for(const key of ['確認メモ','写真','所在地','公開判断','Googleマップ','まほろばの一言'])assert.ok(!text.includes('"'+key+'"'));
  assert.ok(data.spots.find(s=>s.name.includes('名称要照合')).missing.includes('正式名称'));
  assert.deepEqual(data,JSON.parse(await readFile(new URL('../../public/hyakunincho-map/spots.json',import.meta.url),'utf8')));
});
test('no inferred confirmation from numeric coordinates, visit/date or memo',()=>{
  const input=clone();Object.assign(input.results[0],{'緯度':35.18,'経度':136.92,'訪問状況':'訪問済','確認メモ':'座標確認済み'});
  assert.equal(buildSnapshot(input).spots.filter(s=>s.coordinates).length,0);
});
test('future explicit source contract gates pins; areas remain unpinned',()=>{
  const input=clone();input.schemaProperties.push('座標確認状態','地点種別','座標出典','座標確認日');
  for(const row of [input.results[0],input.results.find(r=>r['掲載区分']==='公式町並み')])Object.assign(row,{'緯度':35.18,'経度':136.92,'座標確認状態':'確認済','地点種別':'地点','座標出典':'https://www.city.nagoya.jp/','座標確認日':'2026-10-29'});
  const result=buildSnapshot(input);assert.equal(result.spots.filter(s=>s.coordinates).length,1);
  input.results[0]['緯度']=91;assert.throws(()=>buildSnapshot(input));
});
test('wrong source/count/duplicates/incomplete terminal/schema/invalid ID rejected',()=>{
  for(const modify of [i=>i.results.pop(),i=>i.results.push(i.results[0]),i=>i.results[1]=i.results[0],i=>i.has_more=true,i=>delete i.has_more,i=>i.next_cursor='more',i=>i.dataSourceUrl='wrong',i=>i.viewUrl='wrong',i=>i.schemaProperties=[],i=>i.retrievedAt='2099-01-01T00:00:00Z',i=>i.results[0].url='https://evil.example/p/123']){const i=clone();modify(i);assert.throws(()=>buildSnapshot(i));}
});
test('display validation rejects unsafe coordinates, unknown columns, malformed statuses/URLs',()=>{
  for(const modify of [s=>s.retrievedAt='2099-01-01T00:00:00Z',s=>s.retrievedAt='2026-10-29T12:00:00',s=>s.spots[0].coordinates={lat:35,lng:136},s=>s.spots[0].token='secret',s=>s.spots[0].coordinateStatus='__proto__',s=>s.spots[0].sourceUrl='javascript:alert(1)',s=>s.spots[0].sourceUrl='https://evil.example/',s=>s.spots[0].sourceUrl='https://www.city.nagoya.jp/?token=bad',s=>s.spots[0].name=null]){const d=structuredClone(data);modify(d);assert.throws(()=>validateSnapshot(d));}
  for(const url of ['javascript:alert(1)','https://a:b@example.com','https://example.com/?key=x','not a url'])assert.equal(safeUrl(url),null);
});
test('theme and keyword filters include pending spots and zero results',()=>{
  assert.equal(selectSpots(data.spots).length,30);assert.ok(selectSpots(data.spots,'町並み・路地').length===2);
  assert.equal(selectSpots(data.spots,'','存在しない検証語').length,0);assert.equal(selectSpots(data.spots,'',' 徳川園 ').length,1);
});
test('atomic refresh replaces valid data; failed/older/missing-ID updates preserve prior bytes',async()=>{
  const dir=await mkdtemp(join(tmpdir(),'hyakunincho-refresh-'));const input=join(dir,'input.json'),output=join(dir,'spots.json');
  try{
    await writeFile(input,JSON.stringify(source));await refresh(input,output);const previous=await readFile(output,'utf8');
    for(const mutate of [i=>i.results.pop(),i=>i.has_more=true,i=>i.retrievedAt='2020-01-01T00:00:00Z',i=>i.results[0].url='https://app.notion.com/p/11111111111111111111111111111111']){const i=clone();mutate(i);await writeFile(input,JSON.stringify(i));await assert.rejects(refresh(input,output));assert.equal(await readFile(output,'utf8'),previous);}
    await writeFile(input,'{broken');await assert.rejects(refresh(input,output));assert.equal(await readFile(output,'utf8'),previous);
    const next=clone();next.inputVersion+='-updated';next.results[0]['紹介文']='更新の検証';await writeFile(input,JSON.stringify(next));await refresh(input,output);assert.ok((await readFile(output,'utf8')).includes('更新の検証'));
  }finally{await rm(dir,{recursive:true,force:true});}
});
test('capture wraps an authorized MCP result, rejects nonterminal/incorrect schema without replacing export',async()=>{
  const {capture}=await import('../../scripts/hyakunincho-map/capture-export.mjs');
  const dir=await mkdtemp(join(tmpdir(),'hyakunincho-capture-'));
  const rowsFile=join(dir,'rows.json'),output=join(dir,'export.json');
  const schema=new URL('../../review/hyakunincho-map/notion-schema.json',import.meta.url);
  try{
    await writeFile(rowsFile,JSON.stringify({content:[{type:'text',text:JSON.stringify({results:source.results,has_more:false})}]}));
    const result=await capture(rowsFile,schema,source.retrievedAt,output);assert.equal(result.count,30);
    const previous=await readFile(output,'utf8');
    await writeFile(rowsFile,JSON.stringify({results:source.results,has_more:true}));await assert.rejects(capture(rowsFile,schema,source.retrievedAt,output));assert.equal(await readFile(output,'utf8'),previous);
    await assert.rejects(capture(rowsFile,schema,'2099-01-01T00:00:00Z',output));assert.equal(await readFile(output,'utf8'),previous);
  }finally{await rm(dir,{recursive:true,force:true});}
});
