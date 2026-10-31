// まほブラの散策記録（2026-10-31）：表紙は軽いWebP、リンクは共有用の追跡パラメータを外した正規のURL。
import test from 'node:test';import assert from 'node:assert/strict';import {readFile,stat} from 'node:fs/promises';
import {STORIES,storiesFor} from '../../public/hyakunincho-map/stories.js';
const dir=new URL('../../public/hyakunincho-map/',import.meta.url);
const raw=JSON.parse(await readFile(new URL('spots.json',dir)));
test('four stories: 二葉館・橦木館 (journal + note), 文化のみち, 徳川園; links are clean',()=>{
  assert.deepEqual(STORIES.map(s=>s.id),['no07-futabakan','no09-shumokukan','bunka-no-michi','tokugawaen']);
  for(const s of STORIES){
    assert.match(s.instagram,/^https:\/\/www\.instagram\.com\/reel\/[A-Za-z0-9_-]+\/$/,s.id);
    if(s.note)assert.match(s.note,/^https:\/\/note\.com\/mahoroba_office\/n\/n[0-9a-f]+$/,s.id);
    if(s.spotId)assert.ok(raw.spots.some(x=>x.id===s.spotId),s.id);
  }
  assert.equal(storiesFor('407e3a043cef8157869cceda5fc2cff1')[0].note,'https://note.com/mahoroba_office/n/n1e256780b6b3');
  assert.equal(storiesFor('407e3a043cef8125bdb2c9ac406232af')[0].instagram,'https://www.instagram.com/reel/DVPT0jskxhZ/');
  assert.equal(storiesFor('407e3a043cef81139f9df6aaf1d15993')[0].instagram,'https://www.instagram.com/reel/DBcgCEctuwM/');
  assert.equal(STORIES.find(s=>s.id==='bunka-no-michi').instagram,'https://www.instagram.com/reel/DFG03MQzXhJ/');
});
test('journal covers are light WebPs with the original kept in journal/original/',async()=>{
  for(const s of STORIES.filter(x=>x.cover)){
    const b=await readFile(new URL(s.cover.src,dir));assert.equal(b.toString('ascii',8,12),'WEBP');assert.ok(b.length<=300*1024,s.id);
    assert.ok((await stat(new URL(s.cover.original,dir))).size>0);assert.ok(s.cover.alt.length>10);
  }
});
