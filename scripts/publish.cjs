'use strict';
const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const {run}=require('./build.cjs');
const {sourceDiff,assertPublishable}=require('../src/publish-review.cjs');
const root=path.resolve(__dirname,'..');
const git=(...args)=>cp.execFileSync('git',['-c','safe.directory='+root,'-C',root,...args],{encoding:'utf8'}).trim();
function snapshotHash(dir){
  const hash=require('node:crypto').createHash('sha256');
  const walk=(folder,prefix='')=>{for(const entry of fs.readdirSync(folder,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){const relative=prefix+entry.name;if(entry.isDirectory())walk(path.join(folder,entry.name),relative+'/');else{hash.update(relative+'\0');hash.update(fs.readFileSync(path.join(folder,entry.name)));}}};
  walk(dir);return hash.digest('hex');
}
try{
  const reviewFile=path.join(root,'publish-review.json'),confirmed=process.argv.includes('--confirm');
  const approved=confirmed&&fs.existsSync(reviewFile)?JSON.parse(fs.readFileSync(reviewFile,'utf8')).snapshotHash:null;
  const report=run();
  const stateFile=path.join(root,'.publish-state.json'),state=fs.existsSync(stateFile)?JSON.parse(fs.readFileSync(stateFile,'utf8')):null;
  const sameTarget=JSON.stringify(state?.target)===JSON.stringify(report.sourceTarget);
  report.sourceChanges=sourceDiff(sameTarget?state.sources:[],report.sources);
  report.sourceComparison=sameTarget?'Last successful publish from this checkout':'No previous local source publication record; all files shown as added';
  const saveState=()=>fs.writeFileSync(stateFile,JSON.stringify({version:1,target:report.sourceTarget,sources:report.sources},null,2)+'\n');
  report.snapshotHash=snapshotHash(path.join(root,'dist'));fs.writeFileSync(reviewFile,JSON.stringify(report,null,2));
  console.log('Prepared public snapshot. Review publish-review.json and npm start before publishing.');
  if(!confirmed){console.log('No remote changes. To publish the reviewed snapshot: npm run publish -- --confirm');process.exit(0);}
  if(!approved||approved!==report.snapshotHash)throw Error('Snapshot changed or was not prepared. Review the new snapshot and run publish again before confirming.');
  assertPublishable(report);
  let remote;try{remote=git('remote','get-url','origin');}catch{throw Error('Configure origin for your independent qa repository first.');}
  if(!/(?:[:/])qa(?:\.git)?$/.test(remote.replaceAll('\\','/')))throw Error('Publish target must be the independent qa repository, never the blog repository.');
  const githubRepo=remote.match(/(?:https:\/\/github\.com\/|git@github\.com:)([^/]+\/[^/]+?)(?:\.git)?$/)?.[1];
  if(githubRepo&&githubRepo.toLowerCase()!==report.sourceTarget.repository.toLowerCase())throw Error('GitHub source links and the origin repository must match.');
  const temp=fs.mkdtempSync(path.join(require('node:os').tmpdir(),'qa-public-'));
  const at=(...args)=>cp.execFileSync('git',['-C',temp,...args],{stdio:'inherit'});
  at('init','-b','gh-pages');at('remote','add','origin',remote);
  const exists=cp.spawnSync('git',['ls-remote','--exit-code',remote,'refs/heads/gh-pages'],{encoding:'utf8'});
  if(exists.status===0){
    at('fetch','--depth=1','origin','gh-pages');at('checkout','-B','gh-pages','FETCH_HEAD');
    if(!path.basename(temp).startsWith('qa-public-')||path.dirname(temp)!==require('node:os').tmpdir())throw Error('Unexpected publication work directory');
    for(const entry of fs.readdirSync(temp))if(entry!=='.git')fs.rmSync(path.join(temp,entry),{recursive:true});
  }else if(exists.status!==2)throw Error('Cannot check the remote publication branch; nothing was pushed.');
  fs.cpSync(path.join(root,'dist'),temp,{recursive:true});
  at('add','-A');
  const changed=cp.spawnSync('git',['-C',temp,'diff','--cached','--quiet']);
  if(changed.status===1)at('commit','-m','Publish Quiet Atlas snapshot');
  else {saveState();console.log('Public snapshot is unchanged.');process.exit(0);}
  // Explicitly publishes generated files only, never the vault or ignored local configuration.
  at('push','origin','HEAD:gh-pages');
  saveState();
  console.log('Snapshot pushed to gh-pages. GitHub Pages must be configured for this branch.');
}catch(e){console.error(e.message);process.exitCode=1;}
