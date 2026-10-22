'use strict';
const fs=require('node:fs'),path=require('node:path'),YAML=require('yaml');
const {slug}=require('./content.cjs');
function readNotes(vault,folder){
  const dir=path.join(vault,'Knowledge Atlas',folder);if(!fs.existsSync(dir))return [];if(fs.lstatSync(dir).isSymbolicLink())throw Error('Note directories must not be symbolic links');
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>e.isSymbolicLink()?[]:e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith('.md')?[path.join(d,e.name)]:[]);
  return walk(dir).map(file=>{const source=fs.readFileSync(file,'utf8'),match=source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);let matter={};
    if(match){matter=YAML.parse(match[1],{uniqueKeys:true,maxAliasCount:30});if(!matter||typeof matter!=='object'||Array.isArray(matter))throw Error('Invalid properties: '+file);}
    return {file,source,title:path.basename(file,'.md'),matter,body:match?source.slice(match[0].length):source};
  });
}
function atlasSnapshot(vault){
  vault=fs.realpathSync(vault);
  const allNodes=readNotes(vault,'Nodes').filter(n=>n.matter.atlas_id),allExamples=readNotes(vault,'Examples').filter(n=>n.matter.atlas_example_id);
  for(const [notes,key]of [[allNodes,'atlas_id'],[allExamples,'atlas_example_id']]){const seen=new Set();for(const note of notes){note.id=String(note.matter[key]);if(seen.has(note.id))throw Error('Duplicate ID: '+note.id);seen.add(note.id);}}
  for(const n of allNodes){n.stage=Number(n.matter.atlas_status??0);if(!Number.isInteger(n.stage)||n.stage<0||n.stage>3)throw Error('Invalid stage: '+n.title);}
  const graph=JSON.parse(fs.readFileSync(path.join(vault,'Knowledge Atlas/graph.json'),'utf8'));
  if(graph.version!==1||!graph.prerequisites||Array.isArray(graph.prerequisites))throw Error('Unsupported graph format');
  for(const list of Object.values(graph.prerequisites))if(!Array.isArray(list)||list.some(x=>typeof x!=='string'))throw Error('Invalid graph relationships');
  const nodes=allNodes.filter(n=>n.stage>=1).map(n=>({...n,domain:String(n.matter.atlas_domain||'other'),href:'articles/'+slug(n.id)+'/'}));
  const byId=new Map(nodes.map(n=>[n.id,n]));
  for(const n of nodes)n.prerequisites=[...new Set(graph.prerequisites[n.id]||[])].filter(id=>byId.has(id));
  const examples=allExamples.filter(e=>byId.get(String(e.matter.atlas_node_id))?.stage>=2).map(e=>({...e,parent:String(e.matter.atlas_node_id),href:'examples/'+slug(e.id)+'/'}));
  return {vault,nodes,examples,allNotes:[...allNodes,...allExamples]};
}

module.exports={atlasSnapshot};
