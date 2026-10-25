'use strict';
const fs=require('node:fs'),path=require('node:path'),YAML=require('yaml');
const {atlasSnapshot}=require('./atlas-adapter.cjs');
const {makeRenderer,build}=require('./export.cjs');
const {scanSources}=require('./sources.cjs');
const {hash,readGraph,walkFiles}=require('./content.cjs');
const slash=s=>s.replaceAll('\\','/');
const safePath=(root,relative)=>{const file=path.resolve(root,relative);if(file===root||!file.startsWith(root+path.sep))throw Error('Unsafe import path: '+relative);return file;};
const encoded=s=>s.split('/').map(part=>encodeURIComponent(part)).join('/');
function convertBody(body,from,references){
  const links=references.get(from)||new Map();
  const rewrite=text=>text.replace(/(!?)\[\[([^\]\n]+)\]\]/g,(full,image,raw)=>{
    const [target,alias]=raw.split('|'),reference=links.get(target);if(!reference)return full;
    const label=(alias||target.split('#')[0]).replace(/[\[\]]/g,'');
    return reference.kind==='unpublished'?label:`${image?'!':''}[${label}](${reference.href})`;
  }).replace(/(!?)\[([^\]\n]*)\]\(\s*(<[^>]+>|[^\s)]+)([^)]*)\)/g,(full,image,label,raw,tail)=>{
    const target=raw.startsWith('<')?raw.slice(1,-1):raw,reference=links.get(target);if(!reference)return full;
    return reference.kind==='unpublished'?label:`${image}[${label}](${reference.href}${tail})`;
  }).replace(/\b(src|href)=(['"])(.*?)\2/g,(full,attribute,quote,target)=>{const ref=links.get(target);if(ref?.kind==='unpublished')return '';return ref?`${attribute}=${quote}${ref.href}${quote}`:full;});
  let fence=null;
  return body.split(/(?<=\n)/).map(line=>{
    const marker=line.match(/^ {0,3}(`{3,}|~{3,})/);
    if(marker){if(!fence)fence=marker[1];else if(marker[1][0]===fence[0]&&marker[1].length>=fence.length)fence=null;return line;}
    if(fence||/^(?: {4}|\t)/.test(line))return line;
    return line.split(/(`+[^`]*`+)/g).map((part,i)=>i%2?part:rewrite(part)).join('');
  }).join('');
}
function prepareImport({vault,contentDir,stateFile}){
  const data=atlasSnapshot(vault),content=path.resolve(contentDir),statePath=path.resolve(stateFile),files=new Map(),references=new Map(),assets=new Map(),warnings=[];
  const state=fs.existsSync(statePath)?JSON.parse(fs.readFileSync(statePath,'utf8')):{version:1,files:{},relationships:{}};
  if(state.version!==1||!state.files||!state.relationships)throw Error('Unsupported import state');
  for(const name of Object.keys(state.files))safePath(content,name);
  const sourceRoots=['Nodes','Examples'].map(folder=>({root:path.join(data.vault,'Knowledge Atlas',folder,'scripts'),sourcePrefix:folder+'/scripts/',outputPrefix:'code/'+folder+'/',urlPrefix:'code/'+folder+'/'}));
  const sources=scanSources(sourceRoots,{repository:''}),paths=new Map();
  for(const n of data.nodes)paths.set(n.file,'nodes/'+slash(path.relative(path.join(data.vault,'Knowledge Atlas/Nodes'),n.file)));
  for(const e of data.examples)paths.set(e.file,'examples/'+slash(path.relative(path.join(data.vault,'Knowledge Atlas/Examples'),e.file)));
  const render=makeRenderer(data,'/',assets,warnings,sources,reference=>{
    const from=reference.from,map=references.get(from)||new Map();references.set(from,map);
    let destination;
    if(reference.kind==='image')destination='images/'+reference.name;
    if(reference.kind==='code')destination='scripts/'+reference.path.slice('code/'.length);
    if(reference.kind==='note')destination=paths.get(reference.file);
    const fragment=reference.raw.includes('#')?'#'+encodeURIComponent(reference.raw.split('#').slice(1).join('#')):'';
    map.set(reference.raw,{kind:reference.kind,href:destination?encoded(slash(path.relative(path.dirname(paths.get(from)),destination)))+fragment:null});
  });
  for(const note of [...data.nodes,...data.examples])render(note);
  if(warnings.length)throw Error('Import references need attention:\n'+[...new Set(warnings)].join('\n'));
  const subjectsFile=path.join(data.vault,'Knowledge Atlas/subjects.json'),subjects=fs.existsSync(subjectsFile)?JSON.parse(fs.readFileSync(subjectsFile,'utf8')):null;
  const legacy={electrostatics:['Physics','Electrostatics'],physics:['Physics','Physics'],vector:['Mathematics','Vector calculus'],mathematics:['Mathematics','Mathematics'],computing:['Computer science','Computer science'],economics:['Economics','Economics']};
  const classification=note=>{
    const id=subjects?.nodeSubjects?.[note.id]||note.matter.atlas_subject||subjects?.legacy?.[note.domain]||note.domain;
    const item=subjects?.subjects?.find(s=>s.id===id),parent=subjects?.parents?.find(p=>p.id===item?.parent);
    return item?[parent?.name||'Other',item.name]:legacy[note.domain]||['Other',note.domain||'Other'];
  };
  for(const note of [...data.nodes,...data.examples]){
    const metadata={id:note.id};
    if(note.parent)metadata.parent=note.parent;else {const [subject,topic]=classification(note);Object.assign(metadata,{subject,topic});}
    files.set(paths.get(note.file),Buffer.from('---\n'+YAML.stringify(metadata)+'---\n'+convertBody(note.body,note.file,references)));
  }
  for(const [name,bytes]of assets)files.set('images/'+name,bytes);
  for(const file of sources.files)files.set('scripts/'+file.path.slice('code/'.length),file.bytes);
  const conflicts=[],changes={added:[],modified:[],removed:[]},existing=fs.existsSync(content)?walkFiles(content):[];
  for(const [name,bytes]of files){const target=safePath(content,name),current=fs.existsSync(target)?hash(fs.readFileSync(target)):null,next=hash(bytes),old=state.files[name];
    if(current!==null&&current!==next&&(!old||old!==current))conflicts.push(name+' has local edits or is not owned by this import');
    if(current!==next)changes[current===null?'added':'modified'].push(name);
  }
  for(const name of Object.keys(state.files))if(!files.has(name)){
    const target=safePath(content,name);if(fs.existsSync(target)){if(hash(fs.readFileSync(target))!==state.files[name])conflicts.push(name+' was edited locally; refusing removal');changes.removed.push(name);}
  }
  const graph=readGraph(path.join(content,'graph.json')),relationships=Object.fromEntries(data.nodes.map(n=>[n.id,n.prerequisites]));
  for(const id of new Set([...Object.keys(state.relationships),...Object.keys(relationships)])){
    const current=graph.prerequisites[id],old=state.relationships[id],next=relationships[id];
    if(current!==undefined&&JSON.stringify(current)!==JSON.stringify(next)&&JSON.stringify(current)!==JSON.stringify(old))conflicts.push('Relationship '+id+' has local edits');
    delete graph.prerequisites[id];if(next!==undefined)graph.prerequisites[id]=next;
  }
  graph.prerequisites=Object.fromEntries(Object.entries(graph.prerequisites).sort(([a],[b])=>a<b?-1:a>b?1:0));
  const graphBytes=Buffer.from(JSON.stringify(graph,null,2)+'\n'),graphPath=path.join(content,'graph.json');
  if(!fs.existsSync(graphPath)||!fs.readFileSync(graphPath).equals(graphBytes))changes[fs.existsSync(graphPath)?'modified':'added'].push('graph.json');
  const nextState={version:1,files:Object.fromEntries([...files].map(([name,bytes])=>[name,hash(bytes)])),relationships};
  const planHash=hash(JSON.stringify({files:nextState.files,graph,priorState:state,current:existing.map(file=>[slash(path.relative(content,file)),hash(fs.readFileSync(file))])}));
  const contentHash=hash(JSON.stringify(existing.map(file=>[slash(path.relative(content,file)),hash(fs.readFileSync(file))])));
  const report={schemaVersion:1,articles:data.nodes.length,examples:data.examples.length,sources:sources.files.length,images:assets.size,skippedSources:sources.skipped,changes,conflicts,planHash,contentHash};
  return {content,statePath,files,graphBytes,nextState,report,priorState:JSON.stringify(state)};
}
function applyImport(plan){
  if(plan.report.conflicts.length)throw Error('Import conflicts; original content is untouched:\n'+plan.report.conflicts.join('\n'));
  const parent=path.dirname(plan.content),suffix=Date.now()+'-'+Math.random().toString(36).slice(2),candidate=path.join(parent,'.content-import-'+suffix),check=path.join(parent,'.content-check-'+suffix),backup=path.join(parent,'.content-backup-'+suffix),stateTemp=path.join(path.dirname(plan.statePath),'.atlas-import.next-'+suffix);
  fs.mkdirSync(parent,{recursive:true});if(fs.existsSync(plan.content))fs.cpSync(plan.content,candidate,{recursive:true});else fs.mkdirSync(candidate);
  try{
    for(const name of plan.report.changes.removed)fs.unlinkSync(safePath(candidate,name));
    for(const [name,bytes]of plan.files){const file=safePath(candidate,name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);}
    fs.writeFileSync(path.join(candidate,'graph.json'),plan.graphBytes);
    const result=build({contentDir:candidate,outDir:check,comments:{enabled:false}});
    if(result.warnings.length)throw Error('Import output has unresolved references: '+result.warnings.join('\n'));
    const now=fs.existsSync(plan.content)?walkFiles(plan.content):[];
    if(hash(JSON.stringify(now.map(file=>[slash(path.relative(plan.content,file)),hash(fs.readFileSync(file))])))!==plan.report.contentHash)throw Error('Content changed during import; please review again.');
    const prior=fs.existsSync(plan.statePath)?JSON.stringify(JSON.parse(fs.readFileSync(plan.statePath,'utf8'))):JSON.stringify({version:1,files:{},relationships:{}});
    if(prior!==plan.priorState)throw Error('Import state changed; please review again.');
    if(!Object.values(plan.report.changes).some(list=>list.length)&&prior===JSON.stringify(plan.nextState))return plan.report;
    fs.writeFileSync(stateTemp,JSON.stringify(plan.nextState,null,2)+'\n');
    if(fs.existsSync(plan.content))fs.renameSync(plan.content,backup);
    try{fs.renameSync(candidate,plan.content);fs.renameSync(stateTemp,plan.statePath);}
    catch(error){if(fs.existsSync(plan.content))fs.renameSync(plan.content,candidate);if(fs.existsSync(backup))fs.renameSync(backup,plan.content);throw error;}
  }finally{
    if(fs.existsSync(stateTemp))fs.unlinkSync(stateTemp);
    for(const folder of [candidate,check]){if(path.dirname(folder)!==parent||!path.basename(folder).startsWith('.content-'))throw Error('Unexpected import work directory');if(fs.existsSync(folder))fs.rmSync(folder,{recursive:true});}
  }
  return plan.report;
}
module.exports={prepareImport,applyImport,convertBody};
