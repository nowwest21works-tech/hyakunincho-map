// Wrap a fresh, authorized Notion MCP query result. Never makes API/token requests.
import { readFile,writeFile,rename,unlink } from 'node:fs/promises';
import { createHash,randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { COLLECTION } from '../../public/hyakunincho-map/model.js';
import { buildSnapshot,databaseUrl,viewUrl } from './import.mjs';
function unwrap(result){
  if(result.isError)throw Error('Notion query failed');
  if(result.structuredContent)return result.structuredContent;
  if(result.content){const item=result.content.find(c=>c.type==='text');return JSON.parse(item.text);}
  return result;
}
export async function capture(rowsFile,schemaFile,retrievedAt,output){
  // Time must be the actual query completion time supplied by the operator,
  // never the wrapping time of a possibly old file.
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/.test(retrievedAt)||!Number.isFinite(Date.parse(retrievedAt))||Date.parse(retrievedAt)>Date.now()+60000)throw Error('Actual query completion time required');
  const raw=await readFile(rowsFile,'utf8'),rows=unwrap(JSON.parse(raw));
  const schema=unwrap(JSON.parse(await readFile(schemaFile,'utf8')));
  if(!schema.text?.includes(`<data-source url="{{${COLLECTION}}}`)&&!schema.text?.includes(`<data-source url="${COLLECTION}"`))throw Error('Wrong schema source');
  const state=JSON.parse(schema.text.match(/<data-source-state>\s*([\s\S]*?)\s*<\/data-source-state>/)?.[1]||'null');
  if(state?.url!==COLLECTION||!state.schema)throw Error('Schema not found');
  const envelope={formatVersion:1,inputVersion:'notion-mcp-'+retrievedAt.replace(/[^0-9TZ]/g,'')+'-'+createHash('sha256').update(raw).digest('hex').slice(0,12),retrievedAt,databaseUrl,dataSourceUrl:COLLECTION,viewUrl,schemaProperties:Object.keys(state.schema),results:rows.results,has_more:rows.has_more,...(rows.next_cursor?{next_cursor:rows.next_cursor}:{})};
  buildSnapshot(envelope);
  const temporary=output+'.'+randomUUID()+'.tmp';
  try {await writeFile(temporary,JSON.stringify(envelope,null,2)+'\n',{mode:0o600,flag:'wx'});await rename(temporary,output);}finally{await unlink(temporary).catch(e=>{if(e.code!=='ENOENT')throw e;});}
  return {count:envelope.results.length,inputVersion:envelope.inputVersion,retrievedAt};
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){
  const [rows,schema,time,output]=process.argv.slice(2);
  if(!output){console.error('Usage: node scripts/hyakunincho-map/capture-export.mjs MCP_ROWS.json MCP_SCHEMA.json ACTUAL_QUERY_COMPLETED_AT_UTC EXPORT.json');process.exitCode=1;}
  else try{console.log(JSON.stringify(await capture(rows,schema,time,output)));}catch{console.error('Capture failed: existing export retained. Check canonical schema, complete rows and actual retrieval time.');process.exitCode=1;}
}
