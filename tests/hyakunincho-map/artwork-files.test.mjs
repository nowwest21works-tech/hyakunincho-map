// 画像の軽量化（2026-10-30）：カードは軽いWebPを使い、原画は artworks/original/ にそのまま保管する。
import test from 'node:test';import assert from 'node:assert/strict';import {readFile,stat,readdir} from 'node:fs/promises';
import {ARTWORKS} from '../../public/hyakunincho-map/artworks.js';
const dir=new URL('../../public/hyakunincho-map/',import.meta.url);
const items=Object.values(ARTWORKS).flatMap(a=>[a,...(a.additional??[])]);
function webpSize(b){ // VP8 / VP8L / VP8X headers
  const t=b.toString('ascii',12,16);
  if(t==='VP8 ')return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];
  if(t==='VP8L'){const v=b.readUInt32LE(21);return [(v&0x3fff)+1,((v>>14)&0x3fff)+1];}
  if(t==='VP8X')return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)];
  throw new Error('unknown webp');
}
test('every card image is a light WebP (≤1600px wide, ≤300KB) whose size matches artworks.js',async()=>{
  assert.equal(items.length,16);
  for(const a of items){
    assert.match(a.src,/^\.\/artworks\/[^/]+\.webp$/,a.src);
    const b=await readFile(new URL(a.src,dir));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.toString('ascii',8,12),'WEBP');
    assert.deepEqual(webpSize(b),[a.width,a.height],a.src);
    assert.ok(a.width<=1600&&b.length<=300*1024,`${a.src} ${a.width}px ${b.length}B`);
  }
});
test('originals are kept in artworks/original/, one per card image, and nothing else is left beside the WebPs',async()=>{
  for(const a of items){assert.match(a.original,/^\.\/artworks\/original\//);assert.ok((await stat(new URL(a.original,dir))).size>a.width);}
  assert.deepEqual((await readdir(new URL('artworks/original/',dir))).sort(),items.map(a=>a.original.split('/').pop()).sort());
  assert.ok((await readdir(new URL('artworks/',dir))).every(f=>f==='original'||f.endsWith('.webp')));
});
