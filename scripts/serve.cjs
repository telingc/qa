'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const root=path.resolve(__dirname,'..'),dist=path.join(root,'dist'),port=Number(process.env.PORT||5190);
const {readConfig}=require('../src/config.cjs'),config=readConfig(root),base=config.basePath;
if(!fs.existsSync(path.join(dist,'index.html'))){console.error('Run npm run build first.');process.exit(1);}
if(!Number.isInteger(port)||port<1||port>65535){console.error('PORT must be an integer between 1 and 65535.');process.exit(1);}
const address=`http://127.0.0.1:${port}${base}`;
// Reuse only this checkout and base path, never an unrelated service on the port.
const previewId=crypto.createHash('sha256').update(fs.realpathSync(root)).update('\0').update(base).digest('hex');
function ready(){
  console.log(`Local: ${address}`);
  if(!process.argv.includes('--open'))return;
  const command=process.platform==='win32'?'rundll32.exe':process.platform==='darwin'?'open':'xdg-open';
  const args=process.platform==='win32'?['url.dll,FileProtocolHandler',address]:[address];
  const browser=spawn(command,args,{detached:true,stdio:'ignore',windowsHide:true});
  browser.on('error',()=>console.error(`Could not open the browser. Open ${address} manually.`));
  browser.unref();
}
function isSamePreview(){
  return new Promise(resolve=>{
    const probe=http.request({hostname:'127.0.0.1',port,path:base,method:'HEAD'},res=>{
      res.resume();resolve(res.statusCode===200&&res.headers['x-qa-preview']===previewId);
    });
    probe.setTimeout(1500,()=>probe.destroy());
    probe.on('error',()=>resolve(false));probe.end();
  });
}
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{
  res.setHeader('X-QA-Preview',previewId);
  const url=new URL(req.url,'http://localhost');if(url.pathname==='/'){res.writeHead(302,{Location:base});res.end();return;}
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
  let name;try{name=decodeURIComponent(url.pathname);}catch{res.writeHead(400);res.end();return;}
  if(!name.startsWith(base)){res.writeHead(404);res.end('Not found');return;}
  let file=path.resolve(dist,name.slice(base.length));if(file!==dist&&!file.startsWith(dist+path.sep)){res.writeHead(403);res.end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
  res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
});
server.once('error',async error=>{
  if(error.code==='EADDRINUSE'){
    if(await isSamePreview()){
      console.log('QA preview is already running; reusing this checkout.');ready();return;
    }
    console.error(`Port ${port} is already in use by another server. Close that server or set a different PORT, then try again.`);
  }else console.error(`Could not start QA preview: ${error.message}`);
  process.exitCode=1;
});
server.listen(port,'127.0.0.1',ready);
