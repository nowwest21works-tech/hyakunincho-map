import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {applyOwnerAddressPoints,ownerAddressPointFor,OWNER_ADDRESS_POINTS} from '../../public/hyakunincho-map/owner-address-points.js';
const raw=JSON.parse(await readFile(new URL('../../public/hyakunincho-map/spots.json',import.meta.url),'utf8'));
const id='407e3a043cef81b5b765ed86e8b9b6e3';
test('only the owner-confirmed stable ID has a selected address reference point',()=>{
 assert.deepEqual(Object.keys(OWNER_ADDRESS_POINTS),[id]);
 assert.deepEqual(OWNER_ADDRESS_POINTS[id].coordinates,{lat:35.1791705,lng:136.9326514});
 assert.notEqual(OWNER_ADDRESS_POINTS[id].coordinates.lng,136.9300765);
});
test('overlay preserves canonical export and all 30 records, changes only the owner ID',()=>{
 const before=JSON.stringify(raw),derived=applyOwnerAddressPoints(raw);
 assert.equal(derived.spots.length,30);assert.equal(JSON.stringify(raw),before);
 assert.equal(raw.spots.filter(s=>s.coordinates).length,0);
 assert.equal(derived.spots.filter(s=>s.coordinates).length,1);
 for(const spot of derived.spots){const source=raw.spots.find(s=>s.id===spot.id);if(spot.id!==id)assert.deepEqual(spot,source);}
 const owner=derived.spots.find(s=>s.id===id);
 assert.equal(ownerAddressPointFor(owner).label,'本人確認済み住所参考点');
 assert.ok(owner.missing.includes('入口・公道からの動線の現地確認'));
 assert.match(ownerAddressPointFor(owner).note,/未確認/);
});
test('reapplying on reload is idempotent; unrelated and absent IDs stay untouched',()=>{
 const derived=applyOwnerAddressPoints(raw);assert.deepEqual(applyOwnerAddressPoints(derived),derived);
 assert.equal(ownerAddressPointFor(raw.spots.find(s=>s.id!==id)),null);
 const without={...raw,spots:raw.spots.filter(s=>s.id!==id)};
 assert.deepEqual(applyOwnerAddressPoints(without),without);
});
