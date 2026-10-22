'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),YAML=require('yaml');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const slug=id=>String(id).normalize('NFKD').replace(/[^a-zA-Z0-9-]+/g,'-').replace(/^-|-$/g,'').toLowerCase().slice(0,60)+'-'+hash(String(id)).slice(0,8);
function walkFiles(root){
  if(!fs.existsSync(root))return [];
  if(fs.lstatSync(root).isSymbolicLink())throw Error('Content directories must not be symbolic links');
  return fs.readdirSync(root,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>{
    if(e.isSymbolicLink())throw Error('Linked content is not supported: '+e.name);
    if(e.name.startsWith('.'))return [];
    const file=path.join(root,e.name);return e.isDirectory()?walkFiles(file):e.isFile()?[file]:[];
  });
}
function readNotes(root,folder){
  return walkFiles(path.join(root,folder)).filter(file=>file.endsWith('.md')).map(file=>{
    const source=fs.readFileSync(file,'utf8'),match=source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    const matter=match?YAML.parse(match[1],{uniqueKeys:true,maxAliasCount:30}):{};
    if(!matter||typeof matter!=='object'||Array.isArray(matter))throw Error('Invalid properties: '+file);
    const fallback=path.relative(path.join(root,folder),file).replaceAll('\\','/').slice(0,-3);
    return {file,source,matter,id:String(matter.id||fallback),title:String(matter.title||path.basename(file,'.md')),body:match?source.slice(match[0].length):source};
  });
}
function readGraph(file){
  if(!fs.existsSync(file))return {version:1,prerequisites:{}};
  const graph=JSON.parse(fs.readFileSync(file,'utf8'));
  if(graph.version!==1||!graph.prerequisites||typeof graph.prerequisites!=='object'||Array.isArray(graph.prerequisites))throw Error('Unsupported graph format');
  for(const list of Object.values(graph.prerequisites))if(!Array.isArray(list)||list.some(x=>typeof x!=='string'))throw Error('Invalid graph relationships');
  return graph;
}
function snapshot(contentDir){
  const root=path.resolve(contentDir);
  if(!fs.existsSync(root))throw Error('Content directory is missing: '+root);
  const allNodes=readNotes(root,'nodes'),allExamples=readNotes(root,'examples');
  for(const notes of [allNodes,allExamples]){const seen=new Set();for(const n of notes){if(seen.has(n.id))throw Error('Duplicate ID: '+n.id);seen.add(n.id);}}
  const nodes=allNodes.filter(n=>n.matter.draft!==true).map(n=>({...n,subject:String(n.matter.subject||'Other'),domain:String(n.matter.topic||n.matter.subject||'Other'),href:'articles/'+slug(n.id)+'/'}));
  const byId=new Map(nodes.map(n=>[n.id,n])),graph=readGraph(path.join(root,'graph.json'));
  for(const n of nodes){n.prerequisites=[...new Set(graph.prerequisites[n.id]||[])];for(const id of n.prerequisites)if(!byId.has(id))throw Error('Missing prerequisite '+id+' for '+n.id);}
  const examples=allExamples.filter(e=>e.matter.draft!==true).map(e=>({...e,parent:String(e.matter.parent||''),href:'examples/'+slug(e.id)+'/'}));
  for(const e of examples)if(!byId.has(e.parent))throw Error('Missing example parent: '+e.title);
  return {vault:root,nodes,examples,allNotes:[...allNodes,...allExamples]};
}
module.exports={snapshot,readNotes,readGraph,walkFiles,slug,hash};
