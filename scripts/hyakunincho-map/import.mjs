import { readFile, writeFile, rename, unlink, mkdir } from 'node:fs/promises';
import { createHash, randomUUID } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AREA_IDS, COLLECTION, THEMES, safeUrl, validateSnapshot } from '../../public/hyakunincho-map/model.js';
export const databaseUrl='https://app.notion.com/p/d4b1e1f5718e42c0873da0b471ed818c';
export const viewUrl='view://3eadb80e-0b5f-4b2b-af5c-24e495400b21';
const publicHosts=new Set(['www.city.nagoya.jp','www.nagoyajo.city.nagoya.jp']);
const text=(row,key)=>typeof row[key]==='string'?row[key]:'';
export function buildSnapshot(input) {
  if (!input || input.formatVersion!==1 || input.databaseUrl!==databaseUrl || input.dataSourceUrl!==COLLECTION || input.viewUrl!==viewUrl || input.has_more!==false || input.next_cursor || !Array.isArray(input.schemaProperties) || !Array.isArray(input.results) || input.results.length!==30) throw new Error('Incomplete export, wrong source, or count differs from expected 30');
  const required=['スポット名','テーマ','エリア','紹介文','掲載区分','公式記号','訪問状況','緯度','経度'];
  if(required.some(key=>!input.schemaProperties.includes(key))) throw new Error('Source schema is incomplete');
  const spots=input.results.map(row=>{
    const match=/^https:\/\/app\.notion\.com\/p\/([a-f0-9]{32})$/.exec(row.url);
    if(!match || !THEMES.includes(row['テーマ'])) throw new Error('Invalid row identity or theme');
    // The current canonical schema has NO coordinate-confirmation property.
    // Optional future source contract must be approved/created in Notion first.
    // Never infer confirmation from numeric coordinates, visit state, dates, or memo text.
    const area=row['掲載区分']==='公式町並み'||AREA_IDS.has(match[1])||row['地点種別']==='区域';
    const explicit=['座標確認状態','地点種別','座標出典','座標確認日'].every(key=>input.schemaProperties.includes(key));
    const proof=safeUrl(row['座標出典']);
    const verified=!area && explicit && row['座標確認状態']==='確認済' && row['地点種別']==='地点' && proof && publicHosts.has(new URL(proof).hostname) && /^\d{4}-\d{2}-\d{2}$/.test(row['座標確認日']??'');
    const source=safeUrl(row['一次出典']);
    const missing=[];
    if(!verified) missing.push(area?'区域の表示方法・形状の確認':'座標と確認根拠');
    if(text(row,'スポット名').includes('名称要照合')) missing.push('正式名称');
    if(row['訪問状況']!=='訪問済') missing.push('実訪問の照合');
    if(row['公開判断']!=='掲載可') missing.push('外部公開の判断');
    return {id:match[1],name:text(row,'スポット名'),theme:row['テーマ'],area:text(row,'エリア'),description:text(row,'紹介文'),section:text(row,'掲載区分'),symbol:text(row,'公式記号'),visitStatus:text(row,'訪問状況')||'未照合',coordinateStatus:verified?'verified':area?'area':'unconfirmed',coordinates:verified?{lat:row['緯度'],lng:row['経度']}:null,sourceUrl:source&&publicHosts.has(new URL(source).hostname)?source:null,missing};
  }).sort((a,b)=>a.id.localeCompare(b.id));
  return validateSnapshot({formatVersion:1,inputVersion:input.inputVersion,retrievedAt:input.retrievedAt,sourceDataSource:COLLECTION,expectedCount:30,spots});
}
export async function refresh(inputPath,outputPath) {
  const raw=await readFile(inputPath,'utf8');
  const snapshot=buildSnapshot(JSON.parse(raw));
  let previous;
  try { previous=validateSnapshot(JSON.parse(await readFile(outputPath,'utf8'))); } catch(error) { if(error.code!=='ENOENT') throw error; }
  if(previous) {
    const ids=new Set(snapshot.spots.map(s=>s.id));
    if(previous.spots.some(s=>!ids.has(s.id))) throw new Error('Stable IDs disappeared; source reconciliation required');
    if(Date.parse(snapshot.retrievedAt)<Date.parse(previous.retrievedAt)) throw new Error('Refusing older export');
  }
  const body=JSON.stringify(snapshot,null,2)+'\n';
  if(/(?:secret_[A-Za-z0-9]{20,}|ntn_[A-Za-z0-9]{20,}|sk-proj-[A-Za-z0-9_-]{12,}|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[A-Z0-9]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/.test(body)) throw new Error('Credential-like material rejected');
  const temporary=outputPath+'.'+randomUUID()+'.tmp';
  await mkdir(dirname(outputPath),{recursive:true});
  try { await writeFile(temporary,body,{mode:0o600,flag:'wx'}); await rename(temporary,outputPath); }
  finally { await unlink(temporary).catch(e=>{if(e.code!=='ENOENT')throw e;}); }
  return {inputSHA256:createHash('sha256').update(raw).digest('hex'),outputSHA256:createHash('sha256').update(body).digest('hex'),count:snapshot.spots.length,pins:snapshot.spots.filter(s=>s.coordinateStatus==='verified').length,inputVersion:snapshot.inputVersion,retrievedAt:snapshot.retrievedAt};
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const [input,output]=process.argv.slice(2);
  if(!input || !output) { console.error('Usage: node scripts/hyakunincho-map/import.mjs EXPORT.json OUTPUT.json'); process.exitCode=1; }
  else try { console.log(JSON.stringify(await refresh(resolve(input),resolve(output)),null,2)); } catch { console.error('Refresh failed: previous snapshot retained. Validate export/schema/count/IDs/time before retrying.'); process.exitCode=1; }
}
