'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http'),{spawn}=require('node:child_process');
function fixture(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'qa-preview-test-'));
  fs.mkdirSync(path.join(root,'scripts'));fs.mkdirSync(path.join(root,'src'));fs.mkdirSync(path.join(root,'dist'));
  fs.copyFileSync(path.join(__dirname,'../scripts/serve.cjs'),path.join(root,'scripts/serve.cjs'));
  fs.copyFileSync(path.join(__dirname,'../src/config.cjs'),path.join(root,'src/config.cjs'));
  fs.writeFileSync(path.join(root,'site.config.json'),JSON.stringify({basePath:'/reading/'}));
  fs.writeFileSync(path.join(root,'dist/index.html'),'First build');return root;
}
function launch(root,port){
  const child=spawn(process.execPath,['scripts/serve.cjs'],{cwd:root,env:{...process.env,PORT:String(port),QA_BASE_PATH:'/reading/'},stdio:['ignore','pipe','pipe'],windowsHide:true});
  let stdout='',stderr='';child.stdout.on('data',data=>stdout+=data);child.stderr.on('data',data=>stderr+=data);
  const done=new Promise((resolve,reject)=>{child.once('error',reject);child.once('close',code=>resolve({code,stdout,stderr}));});
  return {child,done,ready:()=>new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error(`Preview did not start: ${stdout} ${stderr}`)),5000);
    const inspect=()=>{if(stdout.includes('Local: ')){clearTimeout(timer);resolve(stdout);}};
    child.stdout.on('data',inspect);done.then(result=>{clearTimeout(timer);reject(Error(`Preview exited: ${JSON.stringify(result)}`));},reject);inspect();
  })};
}
async function listen(server){await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});return server.address().port;}
async function unusedPort(){const server=http.createServer();const port=await listen(server);await new Promise(resolve=>server.close(resolve));return port;}
function get(port,name='/reading/'){
  return new Promise((resolve,reject)=>http.get({hostname:'127.0.0.1',port,path:name},res=>{let body='';res.on('data',chunk=>body+=chunk);res.on('end',()=>resolve({status:res.statusCode,body,headers:res.headers}));}).on('error',reject));
}
async function stop(run){if(run.child.exitCode===null)run.child.kill();await run.done;}
test('Repeated preview reuses the same checkout and serves a later build without restarting', {timeout:15000},async t=>{
  const root=fixture(),other=fixture(),port=await unusedPort(),first=launch(root,port);
  t.after(async()=>{await stop(first);fs.rmSync(root,{recursive:true,force:true});fs.rmSync(other,{recursive:true,force:true});});
  assert.match(await first.ready(),new RegExp(`127\\.0\\.0\\.1:${port}/reading/`));
  assert.equal((await get(port)).body,'First build');
  const again=launch(root,port);t.after(()=>stop(again));const reused=await again.done;
  assert.equal(reused.code,0);assert.match(reused.stdout,/already running; reusing this checkout/);assert.equal(reused.stderr,'');
  fs.writeFileSync(path.join(root,'dist/index.html'),'Rebuilt content');fs.writeFileSync(path.join(root,'dist/new.html'),'New article');
  assert.equal((await get(port)).body,'Rebuilt content');assert.equal((await get(port,'/reading/new.html')).body,'New article');
  assert.equal((await get(port)).headers['cache-control'],'no-store');assert.equal(first.child.exitCode,null);
  const different=launch(other,port);t.after(()=>stop(different));const conflict=await different.done;
  assert.equal(conflict.code,1);assert.match(conflict.stderr,/already in use by another server/);assert.doesNotMatch(conflict.stdout,/reusing/);
  assert.equal((await get(port)).body,'Rebuilt content');
});
test('A port occupied by another service reports a useful error and leaves the service running', {timeout:10000},async t=>{
  const root=fixture(),other=http.createServer((req,res)=>res.end('Unrelated service')),port=await listen(other);
  t.after(async()=>{await new Promise(resolve=>other.close(resolve));fs.rmSync(root,{recursive:true,force:true});});
  const run=launch(root,port);t.after(()=>stop(run));const result=await run.done;
  assert.equal(result.code,1);assert.match(result.stderr,/set a different PORT/);assert.doesNotMatch(result.stderr,/Unhandled|node:events|at Server/);assert.doesNotMatch(result.stdout,/Local:|reusing/);
  assert.equal((await get(port)).body,'Unrelated service');
});
