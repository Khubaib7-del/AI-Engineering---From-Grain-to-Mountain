import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.png':'image/png','.ttf':'font/ttf','.ico':'image/x-icon'};
http.createServer((req,res)=>{
  let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  let target=path.resolve(root,`.${pathname}`);
  if(!target.startsWith(root+path.sep)&&target!==root){res.writeHead(403).end();return;}
  if(!fs.existsSync(target)||fs.statSync(target).isDirectory())target=path.join(root,'index.html');
  const stream=fs.createReadStream(target);
  stream.on('error',()=>{if(!res.headersSent)res.writeHead(503,{'Retry-After':'2'});res.end('Preview is rebuilding. Refresh shortly.');});
  stream.on('open',()=>{res.writeHead(200,{'Content-Type':types[path.extname(target)]??'application/octet-stream'});stream.pipe(res);});
}).listen(8090,'127.0.0.1',()=>console.log('Production preview: http://127.0.0.1:8090'));
