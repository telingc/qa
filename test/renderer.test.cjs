'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {build}=require('../src/export.cjs');
function fixture(){const root=fs.mkdtempSync(path.join(os.tmpdir(),'qa-content-test-')),content=path.join(root,'content');fs.mkdirSync(content);const file=(name,text)=>{const target=path.join(content,name);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text);return target;};return {root,content,file,out:()=>path.join(root,'out-'+Math.random())};}
const node=(id,body='',extra='')=>'---\nid: '+id+'\nsubject: Custom subject\n'+extra+'---\n'+body;
const html=(out,entry)=>fs.readFileSync(path.join(out,entry.url.slice('/custom/'.length),'index.html'),'utf8');
test('Markdown builds one coherent graph; graph and resource URLs have content versions',()=>{
  const f=fixture();f.file('nodes/First.md',node('first'));f.file('nodes/Second.md',node('second','[First](First.md)'));f.file('examples/Case.md',node('case','An example.','parent: second\n'));f.file('graph.json',JSON.stringify({version:1,prerequisites:{second:['first']}}));
  const options={contentDir:f.content,basePath:'/custom/',title:'Independent atlas',blog:{label:'My blog',url:'https://example.org/'},comments:{enabled:false}},out=f.out(),report=build({...options,outDir:out}),graph=JSON.parse(fs.readFileSync(path.join(out,'atlas/graph.json'))),page=fs.readFileSync(path.join(out,'atlas/index.html'),'utf8');
  assert.equal(report.articles.length,2);assert.equal(report.examples.length,1);assert.equal(graph.nodes.length,3);assert.equal(graph.edges.length,2);assert.match(page,new RegExp('graph\\.'+report.graphVersion+'\\.json'));assert.match(page,/Independent atlas|My blog/);assert.doesNotMatch(page,/telingc/);assert.match(page,/assets\/app\.[a-f0-9]+\.js/);
  assert.ok(fs.existsSync(path.join(out,'atlas/graph.'+report.graphVersion+'.json')));assert.match(html(out,report.articles[1]),/href="\/custom\/articles\//);
  f.file('examples/New case.md',node('case2','Another.','parent: second\n'));assert.notEqual(build({...options,outDir:f.out()}).graphVersion,report.graphVersion);
});
test('Rendering preserves math/code, scrollable tables and local images while removing active HTML',()=>{
  const f=fixture();f.file('images/plot.png',Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jH1kAAAAASUVORK5CYII=','base64'));
  f.file('nodes/Math.md',node('math','$$x < 2$$\n\n```python\nif x < 2:\n    print("original")\n```\n\n![plot](../images/plot.png)\n\n<script>alert(1)</script>\n<img src="javascript:alert(1)" onerror="alert(1)">\n\n| A | B |\n|---|---|\n| 1 | 2 |'));
  const out=f.out(),r=build({contentDir:f.content,outDir:out,basePath:'/custom/'}),text=html(out,r.articles[0]);assert.match(text,/katex/);assert.match(text,/&lt;/);assert.match(text,/table-scroll/);assert.match(text,/assets\/images/);assert.doesNotMatch(text,/alert\(1\)|onerror=|javascript:/);
});
test('Source bytes and Unicode links survive renaming; node/example comment identities stay separate',()=>{
  const f=fixture(),bytes=Buffer.from('print("unchanged")\r\n'),filename='Space 测试#case.py';f.file('scripts/Nodes/'+filename,bytes);const original=f.file('nodes/One.md',node('same','[Source](../scripts/Nodes/'+encodeURIComponent(filename)+'#L2)'));f.file('examples/Case.md',node('same','case','parent: same\n'));f.file('scripts/.env','DO NOT PUBLISH');f.file('scripts/secret.key','DO NOT PUBLISH');
  const comments={enabled:true,repository:'someone/atlas',repoId:'R_TEST',category:'Announcements',categoryId:'DIC_TEST'},options={contentDir:f.content,basePath:'/custom/',github:{repository:'someone/atlas',branch:'main'},comments},out=f.out(),r=build({...options,outDir:out});
  assert.equal(r.sources.length,1);assert.equal(r.skippedSources.length,2);assert.deepEqual(fs.readFileSync(path.join(out,'code/Nodes/'+filename)),bytes);assert.ok(html(out,r.articles[0]).includes('github.com/someone/atlas/blob/main/content/scripts/Nodes/'+encodeURIComponent(filename)+'#L2'));assert.match(html(out,r.articles[0]),/qa:node:same/);assert.match(html(out,r.examples[0]),/qa:example:same/);assert.doesNotMatch(html(out,r.articles[0]),/comments-heading|Questions and corrections|Open the discussion/);
  fs.renameSync(original,path.join(path.dirname(original),'Renamed.md'));assert.equal(build({...options,outDir:f.out()}).articles[0].url,r.articles[0].url);const offline=f.out();build({...options,comments:{enabled:false},outDir:offline});assert.doesNotMatch(fs.readFileSync(path.join(offline,'index.html'),'utf8'),/giscus|comments.js/);assert.ok(!fs.readFileSync(path.join(out,'code/manifest.json'),'utf8').includes(f.root));
});
test('Empty content and missing graph work; duplicate IDs, broken parents and unsafe output are rejected',()=>{
  const f=fixture();assert.equal(build({contentDir:f.content,outDir:f.out()}).articles.length,0);f.file('nodes/One.md',node('same'));assert.equal(build({contentDir:f.content,outDir:f.out()}).articles.length,1);assert.throws(()=>build({contentDir:f.content,outDir:path.join(f.content,'dist')}),/separate/);f.file('nodes/Two.md',node('same'));assert.throws(()=>build({contentDir:f.content,outDir:f.out()}),/Duplicate/);fs.unlinkSync(path.join(f.content,'nodes/Two.md'));f.file('examples/Orphan.md',node('case','','parent: absent\n'));assert.throws(()=>build({contentDir:f.content,outDir:f.out()}),/parent/);
});
test('Four example leaves stay separate; a fifth is rejected',()=>{
  const f=fixture();f.file('nodes/One.md',node('one'));for(let i=0;i<4;i++)f.file('examples/Case '+i+'.md',node('e'+i,'','parent: one\n'));const out=f.out();build({contentDir:f.content,outDir:out});const leaves=JSON.parse(fs.readFileSync(path.join(out,'atlas/graph.json'))).nodes.filter(n=>n.kind==='example');for(let i=0;i<leaves.length;i++)for(let j=i+1;j<leaves.length;j++)assert.ok(Math.abs(leaves[i].x-leaves[j].x)>=148||Math.abs(leaves[i].y-leaves[j].y)>=54);f.file('examples/Fifth.md',node('fifth','','parent: one\n'));assert.throws(()=>build({contentDir:f.content,outDir:f.out()}),/four examples/);
});

test('Display math protects equals lines and adjacent prose without consuming code examples',()=>{
  const f=fixture(),body=String.raw`For $r>0$,
$$
I(r)
=
\begin{cases}2/r,& r<1,\\2,&r>1.\end{cases}
$$
The value at $r=0$ is understood by continuity.
Therefore,$$
\begin{aligned}V(r)&=r^2.\end{aligned}
$$Substituting $r=1$ gives
$$V(1)=1.$$

Inline code: \`$$not math$$\`.

\`\`\`text
$$also not math$$
\`\`\`

Escaped delimiters: \$\$literal\$\$.
`.replaceAll('\\`','`');
  f.file('nodes/Mixed math.md',node('mixed',body));const out=f.out(),r=build({contentDir:f.content,outDir:out,basePath:'/custom/'}),text=html(out,r.articles[0]);
  assert.deepEqual(r.warnings,[]);assert.doesNotMatch(text,/math-fallback/);assert.match(text,/The value at/);assert.match(text,/Substituting/);assert.match(text,/<code>\$\$not math\$\$<\/code>/);assert.match(text,/\$\$also not math\$\$/);assert.match(text,/\$\$literal\$\$/);assert.equal((text.match(/class="katex"/g)||[]).length,6);
});
