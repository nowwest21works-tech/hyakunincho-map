// Local-only static verification server. No API, request logging, or external bind.
import { createServer } from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
const root=fileURLToPath(new URL('../../public/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
const port=Number(process.argv[2]||8791);
const server=createServer(async(req,res)=>{
  const host=req.headers.host;
  if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(host)||!['GET','HEAD'].includes(req.method)){res.writeHead(403).end();return;}
  try{
    let path=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);if(path.endsWith('/'))path+='index.html';
    const file=await realpath(resolve(root,'.'+path));
    if(!file.startsWith(root.endsWith(sep)?root:root+sep)||(await stat(file)).isDirectory())throw Error('outside');
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'geolocation=(self)'});
    res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404).end('Not found');}
});
server.listen(port,'127.0.0.1',()=>console.log(`Local only: http://127.0.0.1:${port}/hyakunincho-map/`));
