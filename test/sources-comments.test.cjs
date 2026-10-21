'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {build}=require('../src/export.cjs'),{sourceDiff,assertPublishable}=require('../src/publish-review.cjs');
const YAML=require('yaml');
function fixture(){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'qa-code-check-')),vault=path.join(root,'vault');
  const file=(name,bytes)=>{const target=path.join(vault,'Knowledge Atlas',name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);return target;};
  const note=(name,matter,body)=>file(name,'---\n'+YAML.stringify(matter)+'---\n'+body);
  const node=note('Nodes/Public.md',{atlas_id:'same-id',atlas_status:2},'A public draft.');
  note('Nodes/Private.md',{atlas_id:'not-published',atlas_status:0},'UNPUBLISHED NOTE MUST STAY LOCAL');
  const example=note('Examples/Case.md',{atlas_example_id:'same-id',atlas_node_id:'same-id'},'An example.');
  file('graph.json',JSON.stringify({version:1,prerequisites:{'same-id':[],'not-published':[]}}));
  return {root,vault,file,note,node,example,out:()=>path.join(root,'out-'+Math.random().toString(36).slice(2))};
}
const comments={repoId:'R_TEST_ONLY',category:'Atlas comments',categoryId:'DIC_TEST_ONLY'};
const htmlFor=(out,entry)=>fs.readFileSync(path.join(out,entry.url.replace('/qa/',''),'index.html'),'utf8');

test('Every script is copied independently of stages, with distinct folders, exact bytes, encoded links and textual dependencies',()=>{
  const f=fixture(),bytes=Buffer.from('print("unlinked source from a stage-zero topic")\r\n');
  f.file('Nodes/scripts/shared.py',bytes);f.file('Examples/scripts/shared.py','example code');
  f.file('Nodes/scripts/nested/helper.customlang','custom source language');
  const special='Space 测试#case.py';f.file('Nodes/scripts/'+special,'x = 3\n');
  f.note('Nodes/Public.md',{atlas_id:'same-id',atlas_status:2},`[[scripts/shared.py|View source]]\n\n[Specific line](./scripts/${encodeURIComponent(special)}#L2)`);
  f.file('Nodes/scripts/__pycache__/cached.pyc','compiled');f.file('Nodes/scripts/.env','TEST ONLY SECRET');
  f.file('Nodes/scripts/secret.key','TEST ONLY SECRET');f.file('Nodes/scripts/plot.bin',Buffer.from([0,255,13]));
  const out=f.out(),r=build({vault:f.vault,outDir:out,comments});
  assert.equal(r.sources.length,4);assert.equal(r.skippedSources.length,4);assert.equal(r.warnings.length,0);
  assert.deepEqual(fs.readFileSync(path.join(out,'code/Nodes/shared.py')),bytes);
  assert.equal(fs.readFileSync(path.join(out,'code/Examples/shared.py'),'utf8'),'example code');
  const html=htmlFor(out,r.articles[0]);assert.match(html,/github\.com\/telingc\/qa\/blob\/gh-pages\/code\/Nodes\/shared.py/);
  assert.ok(html.includes(encodeURIComponent(special)+'#L2'));assert.doesNotMatch(html,/UNPUBLISHED NOTE MUST STAY LOCAL|TEST ONLY SECRET|[A-Z]:\\/);
  assert.ok(!r.articles.some(n=>n.id==='not-published'));
  assert.ok(!JSON.stringify(JSON.parse(fs.readFileSync(path.join(out,'code/manifest.json'),'utf8'))).includes(f.root));
  assert.equal(fs.readFileSync(path.join(f.vault,'Knowledge Atlas/Nodes/scripts/shared.py'),'utf8'),bytes.toString());
});

test('Source updates/deletions replace the next snapshot; stage withdrawal leaves all remaining source public',()=>{
  const f=fixture();const first=f.file('Nodes/scripts/one.py','v1');const removed=f.file('Examples/scripts/old.py','old');
  const a=build({vault:f.vault,outDir:f.out(),comments});fs.writeFileSync(first,'v2');fs.unlinkSync(removed);f.file('Nodes/scripts/new.py','new');
  f.note('Nodes/Public.md',{atlas_id:'same-id',atlas_status:0},'UNPUBLISHED NOTE MUST STAY LOCAL');
  const out=f.out(),b=build({vault:f.vault,outDir:out,comments});
  assert.equal(b.articles.length,0);assert.equal(b.examples.length,0);assert.equal(b.sources.length,2);
  assert.equal(fs.readFileSync(path.join(out,'code/Nodes/one.py'),'utf8'),'v2');assert.equal(fs.existsSync(path.join(out,'code/Examples/old.py')),false);
  assert.deepEqual(sourceDiff(a.sources,b.sources),{added:['code/Nodes/new.py'],modified:['code/Nodes/one.py'],removed:['code/Examples/old.py']});
});

test('Node and example comments have separate stable identities, survive title changes and never reach the index or atlas',()=>{
  const f=fixture(),out=f.out(),a=build({vault:f.vault,outDir:out,comments});
  const nodeHTML=htmlFor(out,a.articles[0]),exampleHTML=htmlFor(out,a.examples[0]);
  assert.match(nodeHTML,/qa:node:same-id/);assert.match(exampleHTML,/qa:example:same-id/);assert.match(nodeHTML,/&quot;strict&quot;:&quot;1&quot;/);
  assert.match(nodeHTML,/assets\/comments.js/);assert.doesNotMatch(fs.readFileSync(path.join(out,'index.html'),'utf8'),/class="comments"|assets\/comments.js/);
  assert.doesNotMatch(fs.readFileSync(path.join(out,'atlas/index.html'),'utf8'),/class="comments"|assets\/comments.js/);
  fs.renameSync(f.node,path.join(path.dirname(f.node),'Renamed.md'));fs.renameSync(f.example,path.join(path.dirname(f.example),'Renamed case.md'));
  const other=f.out(),b=build({vault:f.vault,outDir:other,comments});assert.equal(b.articles[0].url,a.articles[0].url);assert.equal(b.examples[0].url,a.examples[0].url);
  assert.match(htmlFor(other,b.articles[0]),/qa:node:same-id/);assert.match(htmlFor(other,b.examples[0]),/qa:example:same-id/);
});

test('Pending configuration keeps a GitHub fallback but prevents a misleading live publish; explicit disable works offline',()=>{
  const f=fixture(),out=f.out(),r=build({vault:f.vault,outDir:out});assert.equal(r.comments.ready,false);
  assert.match(htmlFor(out,r.articles[0]),/Open the discussion on GitHub/);assert.doesNotMatch(htmlFor(out,r.articles[0]),/data-comment-options|assets\/comments.js/);
  assert.throws(()=>assertPublishable(r),/not configured/);
  const off=f.out(),disabled=build({vault:f.vault,outDir:off,comments:{enabled:false}});assert.doesNotMatch(htmlFor(off,disabled.articles[0]),/class="comments"/);assert.doesNotThrow(()=>assertPublishable(disabled));
  const missing=f.out();f.note('Nodes/Public.md',{atlas_id:'same-id',atlas_status:2},'[Missing](scripts/never.py)');const broken=build({vault:f.vault,outDir:missing,comments});assert.match(broken.warnings[0],/Source link unavailable/);assert.throws(()=>assertPublishable(broken),/warnings/);
});

test('Linked script directories cannot escape the vault',t=>{
  const f=fixture(),outside=fs.mkdtempSync(path.join(os.tmpdir(),'qa-code-outside-'));fs.writeFileSync(path.join(outside,'outside.py'),'DO NOT COPY');
  const link=path.join(f.vault,'Knowledge Atlas/Nodes/scripts');
  try {fs.symlinkSync(outside,link,process.platform==='win32'?'junction':'dir');}
  catch(error){if(['EPERM','EACCES'].includes(error.code)){t.skip('OS does not permit this link test');return;}throw error;}
  assert.throws(()=>build({vault:f.vault,outDir:f.out(),comments}),/without linked folders/);
});
