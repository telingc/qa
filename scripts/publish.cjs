'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {run}=require('./build.cjs'),{readConfig}=require('../src/config.cjs');
const {sourceDiff,assertPublishable}=require('../src/publish-review.cjs'),{hash}=require('../src/content.cjs');
const root=path.resolve(__dirname,'..');
const git=(...args)=>cp.execFileSync('git',['-c','safe.directory='+root,'-C',root,...args],{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
function snapshotHash(dir){const records=[];const walk=(folder,prefix='')=>{for(const entry of fs.readdirSync(folder,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const name=prefix+entry.name;if(entry.isDirectory())walk(path.join(folder,entry.name),name+'/');else records.push(name+'\0'+hash(fs.readFileSync(path.join(folder,entry.name))));}};walk(dir);return hash(records.join('\n'));}
function sourceChanges(){
  const names=new Set([...git('ls-files','--modified','--deleted','--others','--exclude-standard','-z').split('\0'),...git('diff','--cached','--name-only','-z').split('\0')].filter(Boolean));
  const publicFile=name=>/^(?:content\/|src\/|web\/|scripts\/|test\/|templates\/|\.github\/)/.test(name)||['site.config.json','config.example.json','package.json','package-lock.json','.gitignore','.gitattributes','.atlas-import.json','README.md','VERIFICATION.md'].includes(name)||/^[^/]+\.cmd$/.test(name);
  for(const name of names)if(!publicFile(name))throw Error('Unreviewed file outside the public site scope: '+name+'. Commit or move it separately.');
  const files=[...names].sort().map(name=>({path:name,sha256:fs.existsSync(path.join(root,name))?hash(fs.readFileSync(path.join(root,name))):null}));
  let head;try{head=git('rev-parse','HEAD');}catch{head='unborn';}
  return {files,hash:hash(JSON.stringify({head,files}))};
}
function publishBranch(remote){
  const temp=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'qa-public-'));
  const at=(...args)=>cp.execFileSync('git',['-C',temp,...args],{stdio:'inherit'});
  at('init','-b','gh-pages');at('remote','add','origin',remote);
  const exists=cp.spawnSync('git',['ls-remote','--exit-code',remote,'refs/heads/gh-pages'],{encoding:'utf8'});
  if(exists.status===0){at('fetch','--depth=1','origin','gh-pages');at('checkout','-B','gh-pages','FETCH_HEAD');
    if(path.dirname(temp)!==require('node:os').tmpdir()||!path.basename(temp).startsWith('qa-public-'))throw Error('Unexpected publication directory');
    for(const entry of fs.readdirSync(temp))if(entry!=='.git')fs.rmSync(path.join(temp,entry),{recursive:true});
  }else if(exists.status!==2)throw Error('Cannot inspect the remote publication branch.');
  fs.cpSync(path.join(root,'dist'),temp,{recursive:true});at('add','-A');
  if(cp.spawnSync('git',['-C',temp,'diff','--cached','--quiet']).status===1){at('commit','-m','Publish atlas snapshot');at('push','origin','HEAD:gh-pages');}
  console.log('Snapshot pushed to gh-pages (branch migration/rollback mode).');
}
try{
  const config=readConfig(root),reviewFile=path.join(root,'publish-review.json'),confirmed=process.argv.includes('--confirm');
  const approved=confirmed&&fs.existsSync(reviewFile)?JSON.parse(fs.readFileSync(reviewFile,'utf8')):null;
  const report=run(),stateFile=path.join(root,'.publish-state.json'),state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile,'utf8')):null;
  const sameTarget=JSON.stringify(state?.target)===JSON.stringify(report.sourceTarget);
  report.sourceChanges=sourceDiff(sameTarget?state.sources:[],report.sources);report.sourceComparison=sameTarget?'Last successful publish from this checkout':'No previous local source publication record; all files shown as added';
  const review=sourceChanges();report.repositoryChanges=review.files;report.repositoryHash=review.hash;report.snapshotHash=snapshotHash(path.join(root,'dist'));
  fs.writeFileSync(reviewFile,JSON.stringify(report,null,2)+'\n');
  console.log(`Prepared public snapshot and ${review.files.length} repository changes. Review publish-review.json and the local preview.`);
  if(!confirmed){console.log('No remote changes. Repeat with --confirm to commit and push this reviewed site.');process.exit(0);}
  if(!approved||approved.snapshotHash!==report.snapshotHash||approved.repositoryHash!==report.repositoryHash)throw Error('Snapshot changed or was not prepared. Review the new snapshot before confirming.');
  assertPublishable(report);
  const branch=git('branch','--show-current'),expected=config.github?.branch||'main';
  if(branch!==expected)throw Error('Publish from the configured source branch: '+expected);
  const remote=git('remote','get-url','origin'),repository=remote.match(/(?:https:\/\/github\.com\/|git@github\.com:)([^/]+\/[^/]+?)(?:\.git)?$/)?.[1];
  if(repository&&repository.toLowerCase()!==report.sourceTarget.repository.toLowerCase())throw Error('Configure github.repository to match origin before publishing.');
  const mode=config.deployment?.mode||'actions';if(!['actions','branch'].includes(mode))throw Error('Unknown deployment mode');
  for(let i=0;i<review.files.length;i+=100)git('--literal-pathspecs','add','--',...review.files.slice(i,i+100).map(f=>f.path));
  if(cp.spawnSync('git',['-c','safe.directory='+root,'-C',root,'diff','--cached','--quiet']).status===1)git('commit','-m','Update atlas content and site');
  git('push','origin','HEAD:'+expected);
  if(mode==='branch')publishBranch(remote);else console.log('Source pushed. GitHub Actions builds and deploys Pages; check its run for deployment completion.');
  fs.writeFileSync(stateFile,JSON.stringify({version:1,target:report.sourceTarget,sources:report.sources},null,2)+'\n');
}catch(error){console.error(error.message);process.exitCode=1;}
