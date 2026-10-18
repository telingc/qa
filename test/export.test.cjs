const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {build,snapshot}=require('../src/export.cjs');
const YAML=require('yaml');
function fixture(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'qa-export-test-')),vault=path.join(root,'vault');
  const write=(name,metadata,body)=>{const p=path.join(vault,'Knowledge Atlas',name);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,'---\n'+YAML.stringify(metadata)+'---\n'+body);return p;};
  for(let stage=0;stage<4;stage++)write(`Nodes/Question ${stage}.md`,{atlas_id:'node'+stage,atlas_status:stage,atlas_domain:'electrostatics',atlas_stage_history:[{note:'PRIVATE HISTORY'}]},`# Draft ${stage}\nUnpolished original text.\n`);
  fs.writeFileSync(path.join(vault,'Knowledge Atlas/graph.json'),JSON.stringify({version:1,prerequisites:{node1:['node0'],node2:['node1'],node3:['node2']}}));
  for(let i=0;i<4;i++)write(`Examples/Example ${i}.md`,{atlas_example_id:'e'+i,atlas_node_id:'node'+i},'Actual example text.');
  const out=()=>path.join(root,'out-'+Math.random().toString(36).slice(2));
  return {root,vault,write,out};
}
function allFiles(root){return fs.readdirSync(root,{withFileTypes:true}).flatMap(e=>e.isDirectory()?allFiles(path.join(root,e.name)):[path.join(root,e.name)]);}
test('Stage gates, original direct edges, ordinary drafts, no private metadata or source mutation',()=>{
  const f=fixture(),before=Object.fromEntries(allFiles(f.vault).map(p=>[p,fs.readFileSync(p).toString('base64')])),out=f.out(),report=build({vault:f.vault,outDir:out});
  assert.deepEqual(report.articles.map(n=>n.id),['node1','node2','node3']);assert.deepEqual(report.examples.map(n=>n.id),['e2','e3']);
  const graph=JSON.parse(fs.readFileSync(path.join(out,'atlas/graph.json')));assert.ok(!JSON.stringify(graph).includes('node0'));assert.equal(graph.edges.filter(e=>e.kind==='prerequisite').length,2);
  const html=allFiles(out).filter(p=>p.endsWith('.html')).map(p=>fs.readFileSync(p,'utf8')).join('');assert.match(html,/Unpolished original text/);assert.doesNotMatch(html,/PRIVATE HISTORY|atlas_status|atlas_stage_history/);
  assert.deepEqual(Object.fromEntries(allFiles(f.vault).map(p=>[p,fs.readFileSync(p).toString('base64')])),before);
});
test('Local images and wiki links resolve; unpublished links do not create pages or disclose file URLs',()=>{
  const f=fixture();f.write('Nodes/Question 2.md',{atlas_id:'node2',atlas_status:2},'[[Question 1|Related]]\n\n[[Question 0|Not published]]\n\n![[plot.png]]\n\n![Plot](../Examples/Images/plot.png)');
  const dir=path.join(f.vault,'Knowledge Atlas/Examples/Images');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'plot.png'),Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jH1kAAAAASUVORK5CYII=','base64'));
  const out=f.out(),report=build({vault:f.vault,outDir:out});assert.equal(report.images,1);const html=fs.readFileSync(path.join(out,report.articles.find(n=>n.id==='node2').url.replace('/qa/',''),'index.html'),'utf8');
  assert.match(html,/href="\/qa\/articles\//);assert.match(html,/unpublished-link/);assert.equal((html.match(/assets\/images\//g)||[]).length,2);assert.doesNotMatch(html,/file:|[A-Z]:\\/);
});
test('Math and code retain angle brackets; active HTML is removed; tables have local scroll containers',()=>{
  const f=fixture();f.write('Nodes/Question 2.md',{atlas_id:'node2',atlas_status:2},'$$\nx < 2\n$$\n\n```python\nif x < 2:\n    print("original")\n```\n\n<script>alert(1)</script>\n<img src="javascript:alert(1)" onerror="alert(1)">\n\n| A | B |\n|---|---|\n| 1 | 2 |');
  const out=f.out(),r=build({vault:f.vault,outDir:out}),html=fs.readFileSync(path.join(out,r.articles.find(n=>n.id==='node2').url.slice(4),'index.html'),'utf8');
  assert.match(html,/class="katex/);assert.match(html,/&lt;/);assert.match(html,/    /);assert.match(html,/table-scroll/);assert.doesNotMatch(html,/alert\(1\)|onerror=|javascript:/);
});
test('Lowering a stage removes the matching published pages on the next build, with no example leakage',()=>{
  const f=fixture();f.write('Nodes/Question 2.md',{atlas_id:'node2',atlas_status:0},'PRIVATE LOWERED DRAFT');const out=f.out(),r=build({vault:f.vault,outDir:out});
  assert.ok(!r.articles.some(n=>n.id==='node2'));assert.ok(!r.examples.some(n=>n.id==='e2'));const text=allFiles(out).filter(p=>/\.html$|graph.json$/.test(p)).map(p=>fs.readFileSync(p,'utf8')).join('');assert.doesNotMatch(text,/PRIVATE LOWERED DRAFT|Example 2|node2/);
});
test('Duplicate IDs, invalid stages, output inside source, and broken graph are rejected',()=>{
  const f=fixture();f.write('Nodes/Duplicate.md',{atlas_id:'node1',atlas_status:1},'');assert.throws(()=>snapshot(f.vault),/Duplicate/);
  const g=fixture();g.write('Nodes/Question 1.md',{atlas_id:'node1',atlas_status:6},'');assert.throws(()=>snapshot(g.vault),/Invalid stage/);
  const h=fixture();assert.throws(()=>build({vault:h.vault,outDir:path.join(h.vault,'dist')}),/separate/);fs.writeFileSync(path.join(h.vault,'Knowledge Atlas/graph.json'),'{');assert.throws(()=>snapshot(h.vault));
});
test('Four examples per node remain visible without overlap; a fifth fails without changing source',()=>{
  const f=fixture();for(let i=0;i<3;i++)f.write('Examples/Extra '+i+'.md',{atlas_example_id:'extra'+i,atlas_node_id:'node2'},'');
  const out=f.out();build({vault:f.vault,outDir:out});const graph=JSON.parse(fs.readFileSync(path.join(out,'atlas/graph.json'))),leaves=graph.nodes.filter(n=>n.parent==='node2');assert.equal(leaves.length,4);
  for(let i=0;i<leaves.length;i++)for(let j=i+1;j<leaves.length;j++)assert.ok(Math.abs(leaves[i].x-leaves[j].x)>=148||Math.abs(leaves[i].y-leaves[j].y)>=54);
  f.write('Examples/Fifth.md',{atlas_example_id:'fifth',atlas_node_id:'node2'},'');assert.throws(()=>build({vault:f.vault,outDir:f.out()}),/four examples/);
});
