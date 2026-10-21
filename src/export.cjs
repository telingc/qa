'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const YAML=require('yaml'),MarkdownIt=require('markdown-it'),katex=require('katex'),hljs=require('highlight.js'),sanitize=require('sanitize-html');
const {graphLayout,graphEdgePath}=require('./layout.cjs');
const {collectSources,publicSources}=require('./sources.cjs');
const {commentConfig,commentsHTML}=require('./comments.cjs');
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=id=>String(id).normalize('NFKD').replace(/[^a-zA-Z0-9-]+/g,'-').replace(/^-|-$/g,'').toLowerCase().slice(0,60)+'-'+hash(String(id)).slice(0,8);
const domains={electrostatics:'Electrostatics',physics:'Physics',vector:'Vector calculus',mathematics:'Mathematics',computing:'Computer science',economics:'Economics'};
const subject=d=>['vector','mathematics'].includes(d)?'Mathematics':['electrostatics','physics'].includes(d)?'Physics':domains[d]||'Other';
function readNotes(vault,folder){
  const dir=path.join(vault,'Knowledge Atlas',folder);if(!fs.existsSync(dir))return [];if(fs.lstatSync(dir).isSymbolicLink())throw Error('Note directories must not be symbolic links');
  const walk=d=>fs.readdirSync(d,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>e.isSymbolicLink()?[]:e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith('.md')?[path.join(d,e.name)]:[]);
  return walk(dir).map(file=>{const source=fs.readFileSync(file,'utf8'),match=source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);let matter={};
    if(match){matter=YAML.parse(match[1],{uniqueKeys:true,maxAliasCount:30});if(!matter||typeof matter!=='object'||Array.isArray(matter))throw Error('Invalid properties: '+file);}
    return {file,source,title:path.basename(file,'.md'),matter,body:match?source.slice(match[0].length):source};
  });
}
function snapshot(vault){
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
function makeRenderer(data,base,assets,warnings,sources){
  const notesByFile=new Map(data.allNotes.map(n=>[path.resolve(n.file),n]));
  const published=new Map([...data.nodes,...data.examples].map(n=>[n.file,n]));
  const listFiles=dir=>fs.readdirSync(dir,{withFileTypes:true}).filter(e=>!e.name.startsWith('.')&&!e.isSymbolicLink()).flatMap(e=>e.isDirectory()?listFiles(path.join(dir,e.name)):[path.join(dir,e.name)]);
  const vaultFiles=listFiles(data.vault);
  const resolve=(raw,from)=>{
    let filePart;try{filePart=decodeURIComponent(raw.split('#')[0]);}catch{return null;}
    if(!filePart)return from;
    const candidates=[path.resolve(path.dirname(from),filePart),path.resolve(data.vault,filePart)];
    if(!path.extname(filePart))candidates.push(...candidates.map(p=>p+'.md'));
    for(const p of candidates)if(fs.existsSync(p)&&fs.statSync(p).isFile())return fs.realpathSync(p);
    const matches=data.allNotes.filter(n=>n.title===filePart||path.relative(data.vault,n.file).replaceAll('\\','/')===filePart);
    if(matches.length===1)return matches[0].file;
    const basename=path.basename(filePart),assetsByName=vaultFiles.filter(p=>path.basename(p)===basename||!path.extname(filePart)&&path.basename(p)===basename+'.md');
    if(assetsByName.length===1)return assetsByName[0];
    const imageDir=path.join(data.vault,'Knowledge Atlas/Examples/Images');
    if(!/[\\/]/.test(filePart)&&fs.existsSync(path.join(imageDir,filePart)))return fs.realpathSync(path.join(imageDir,filePart));
    return null;
  };
  const localImage=(raw,from)=>{
    if(/^https?:\/\//i.test(raw)){warnings.push('External image omitted in '+path.basename(from));return null;}
    const file=resolve(raw,from);if(!file||!file.startsWith(data.vault+path.sep)||! /\.(png|jpe?g|gif|webp|avif)$/i.test(file)){warnings.push('Image unavailable in '+path.basename(from)+': '+raw);return null;}
    const bytes=fs.readFileSync(file),name=hash(bytes).slice(0,24)+path.extname(file).toLowerCase();assets.set(name,bytes);return base+'assets/images/'+name;
  };
  const localLink=(raw,from)=>{
    if(/^(https?:|mailto:|#)/i.test(raw))return raw;
    const file=resolve(raw,from),note=published.get(file);
    const code=sources.files.find(source=>source.file===file);
    if(code)return code.url+(raw.includes('#')?'#'+encodeURIComponent(raw.split('#').slice(1).join('#')):'');
    if(note)return base+note.href+(raw.includes('#')?'#'+encodeURIComponent(raw.split('#').slice(1).join('#')):'');
    if(/(?:^|\/)scripts\//.test(raw))warnings.push('Source link unavailable in '+path.basename(from)+': '+raw);
    // Ordinary links to area notes or private nodes remain plain text. They do not create prerequisites.
    return null;
  };
  const md=new MarkdownIt({html:true,linkify:true,breaks:false,highlight:(code,lang)=>lang&&hljs.getLanguage(lang)?hljs.highlight(code,{language:lang,ignoreIllegals:true}).value:esc(code)});
  md.inline.ruler.before('escape','atlas_math',(state,silent)=>{
    const start=state.pos;if(state.src[start]!=='$')return false;const delimiter=state.src.startsWith('$$',start)?'$$':'$';
    let end=start+delimiter.length;while((end=state.src.indexOf(delimiter,end))>=0){let slashes=0;for(let p=end-1;p>=0&&state.src[p]==='\\';p--)slashes++;if(!(slashes%2))break;end+=delimiter.length;}
    if(end<0||end===start+delimiter.length)return false;
    if(!silent){const token=state.push('atlas_math','',0);token.content=state.src.slice(start+delimiter.length,end);token.block=delimiter==='$$';}
    state.pos=end+delimiter.length;return true;
  });
  md.block.ruler.before('fence','atlas_math_block',(state,start,end,silent)=>{
    const first=state.bMarks[start]+state.tShift[start],text=state.src.slice(first,state.eMarks[start]);if(!text.startsWith('$$'))return false;
    let close=state.src.indexOf('$$',first+2);if(close<0)return false;if(silent)return true;
    const token=state.push('atlas_math','',0);token.content=state.src.slice(first+2,close);token.block=true;
    let line=start;while(line<end&&state.eMarks[line]<close+2)line++;state.line=line+1;
    const tail=state.src.slice(close+2,state.eMarks[line]).trim();if(tail){const p=state.push('paragraph_open','p',1),t=state.push('inline','',0);t.content=tail;t.children=[];state.push('paragraph_close','p',-1);}
    return true;
  });
  md.renderer.rules.atlas_math=(tokens,index)=>{const t=tokens[index];let html;try{html=katex.renderToString(t.content,{displayMode:t.block,throwOnError:true,trust:false,strict:'ignore',maxExpand:1000});}catch{warnings.push('Formula retained as TeX');html='<code class="math-fallback">'+esc(t.content)+'</code>';}
    return t.block?'<div class="formula">'+html+'</div>':'<span class="inline-formula">'+html+'</span>';};
  md.inline.ruler.before('image','atlas_wiki',(state,silent)=>{
    const match=state.src.slice(state.pos).match(/^(!?)\[\[([^\]\n]+)\]\]/);if(!match)return false;
    if(!silent){const [target,alias]=match[2].split('|'),token=state.push('atlas_html','',0);const from=state.env.file;
      if(match[1]){const src=localImage(target,from);token.content=src?'<img src="'+esc(src)+'" alt="'+esc(alias||path.basename(target))+'" loading="lazy">':'<span class="unavailable">Image unavailable</span>';}
      else {const href=localLink(target,from),label=alias||target.split('#')[0];token.content=href?'<a href="'+esc(href)+'">'+esc(label)+'</a>':'<span class="unpublished-link">'+esc(label)+'</span>';}}
    state.pos+=match[0].length;return true;
  });
  md.renderer.rules.atlas_html=(tokens,i)=>tokens[i].content;
  md.renderer.rules.image=(tokens,i,options,env)=>{const t=tokens[i],src=localImage(t.attrGet('src'),env.file);return src?'<img src="'+esc(src)+'" alt="'+esc(t.content)+'" loading="lazy">':'<span class="unavailable">Image unavailable</span>';};
  md.core.ruler.after('inline','public_links',state=>{
    for(let i=0;i<state.tokens.length;i++){
      const block=state.tokens[i];if(block.type==='heading_open')block.attrSet('id',state.tokens[i+1]?.content||'');
      const stack=[];for(const t of block.children||[]){if(t.type==='link_open'){const href=localLink(t.attrGet('href')||'',state.env.file);stack.push(!!href);if(href)t.attrSet('href',href);else {t.tag='span';t.attrs=[['class','unpublished-link']];}}else if(t.type==='link_close'&&!stack.pop())t.tag='span';}
    }
  });
  const cleanHTML=(html,env)=>sanitize(html,{allowedTags:[...sanitize.defaults.allowedTags,'img'],allowedAttributes:{'*':['class','id'],a:['href','title'],img:['src','alt','title','width','height'],th:['colspan','rowspan','scope'],td:['colspan','rowspan']},allowedSchemes:['http','https','mailto'],transformTags:{img:(tag,attrs)=>{const src=localImage(attrs.src||'',env.file);return {tagName:'img',attribs:src?{src,alt:attrs.alt||''}:{alt:'Image unavailable'}};},a:(tag,attrs)=>({tagName:'a',attribs:{...attrs,href:localLink(attrs.href||'',env.file)||'#unpublished'}})}});
  for(const type of ['html_inline','html_block'])md.renderer.rules[type]=(tokens,i,opts,env)=>cleanHTML(tokens[i].content,env);
  return note=>{
    // Only raw author HTML is sanitized. Markdown text, code and TeX retain their original content.
    const output=md.render(note.body,{file:note.file});
    return output.replace(/<table\b[\s\S]*?<\/table>/g,table=>'<div class="table-scroll" tabindex="0" role="region" aria-label="Data table; scroll horizontally if needed">'+table+'</div>');
  };
}
function graphData(data,base){
  const counts=new Map();for(const e of data.examples)counts.set(e.parent,(counts.get(e.parent)||0)+1);
  const layout=graphLayout(data.nodes.map(n=>({...n,layoutHeight:counts.has(n.id)?350:110})));
  const nodes=data.nodes.map(n=>({id:n.id,title:n.title,kind:'knowledge',domain:domains[n.domain]||n.domain,href:base+n.href,...layout.positions.get(n.id),w:236,h:84}));
  const edges=layout.edges.map(e=>({source:e.source,target:e.target,kind:'prerequisite',path:graphEdgePath(e.points,false,e.points.length>2)}));
  for(const n of data.nodes){const parent=layout.positions.get(n.id),examples=data.examples.filter(e=>e.parent===n.id);
    if(examples.length>4)throw Error('More than four examples for '+n.title+'; source files preserved');
    examples.forEach((e,i)=>{const row=examples.length<=2?(i===0?-1:1):(i<2?-1:1),side=examples.length<=2||examples.length===3&&i===2?0:(i%2===0?-1:1),x=parent.x+side*80,y=parent.y+row*124;
      nodes.push({id:'example:'+e.id,title:e.title,kind:'example',parent:n.id,href:base+e.href,x,y,w:148,h:54});
      edges.push({source:n.id,target:'example:'+e.id,kind:'example',path:`M ${parent.x+side*38} ${parent.y+row*42} C ${parent.x+side*38} ${parent.y+row*88}, ${x} ${y-row*65}, ${x} ${y-row*27}`});
    });
  }
  return {version:1,nodes,edges,width:layout.width,height:layout.height};
}
function build({vault,basePath='/qa/',title='telingc atlas',outDir,sourceRoot=path.resolve(__dirname,'..'),github={},comments={}}){
  if(!/^\/[a-zA-Z0-9_\/-]*\/$/.test(basePath)&&basePath!=='/')throw Error('basePath must be an absolute URL path ending in /');
  const data=snapshot(vault),sources=collectSources(data.vault,github),commentSettings=commentConfig(comments,sources.repository);outDir=path.resolve(outDir);if(outDir===data.vault||outDir.startsWith(data.vault+path.sep)||data.vault.startsWith(outDir+path.sep))throw Error('Output must be separate from the vault');
  if(fs.existsSync(outDir)&&fs.readdirSync(outDir).length)throw Error('Build output must be empty; use the build command for transactional replacement');
  fs.mkdirSync(outDir,{recursive:true});const write=(file,text)=>{const target=path.join(outDir,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,text);};
  const base=basePath,assets=new Map(),warnings=[],render=makeRenderer(data,base,assets,warnings,sources);
  const shell=(heading,content,{atlas=false,article=false,back=base}={})=>{
    const head='<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(heading)+' · '+esc(title)+'</title><meta name="description" content="Working notes, questions, and concrete examples. A public window into an unfinished learning process."><link rel="icon" href="'+base+'assets/atlas-mark.svg" type="image/svg+xml"><link rel="stylesheet" href="'+base+'assets/main.css"><link rel="stylesheet" href="'+base+'assets/katex/katex.min.css"></head>';
    const header='<header class="site-header"><div class="wrap"><div class="site-brand"><img class="site-mark" src="'+base+'assets/atlas-mark.svg" width="40" height="40" alt=""><a class="site-title" href="'+base+'">'+esc(title)+'</a></div>'+(atlas?'':'<nav><a href="'+base+'atlas/">Atlas</a></nav>')+'</div></header>';
    const footer='<footer class="wrap"><div>A learning process, left open.</div><a class="blog-link" href="https://telingc.github.io/">telingc blog</a></footer>';
    return head+'<body data-base="'+base+'"'+(atlas?' class="atlas-page"':'')+'>'+header+'<main class="wrap '+(atlas?'map-wrap':'')+'">'+(article?'<div class="article-nav"><a id="back-link" href="'+esc(back)+'">Back</a></div>':'')+content+'</main>'+footer+'<script src="'+base+'assets/app.js" defer></script>'+(article&&commentSettings.ready?'<script src="'+base+'assets/comments.js" defer></script>':'')+'</body></html>';
  };
  const groups=[...new Set(data.nodes.map(n=>subject(n.domain)))];
  write('index.html',shell('Notes','<div class="home"><p class="intro">Working notes. Questions, attempts, and revisions.</p>'+(!data.nodes.length?'<p>No published notes yet.</p>':groups.map(group=>'<section><h2>'+esc(group)+'</h2><ul class="posts">'+data.nodes.filter(n=>subject(n.domain)===group).sort((a,b)=>a.title.localeCompare(b.title)).map(n=>'<li><a class="post-link" href="'+base+n.href+'">'+esc(n.title)+'</a><span class="post-domain">'+esc(domains[n.domain]||n.domain)+'</span></li>').join('')+'</ul></section>').join(''))+'</div>'));
  for(const n of data.nodes){const examples=data.examples.filter(e=>e.parent===n.id);const body='<article class="post-content"><header class="post-header"><p class="eyebrow">'+esc(domains[n.domain]||n.domain)+' · Working draft</p><h1>'+esc(n.title)+'</h1></header>'+render(n)+(examples.length?'<section class="article-examples"><h2>Examples</h2><ul>'+examples.map(e=>'<li><a href="'+base+e.href+'">'+esc(e.title)+'</a></li>').join('')+'</ul></section>':'')+'</article>';
    write(n.href+'index.html',shell(n.title,body+commentsHTML(n,'node',commentSettings),{article:true}));}
  for(const e of data.examples){const parent=data.nodes.find(n=>n.id===e.parent);write(e.href+'index.html',shell(e.title,'<article class="post-content"><header class="post-header"><p class="eyebrow">Example · <a href="'+base+parent.href+'">'+esc(parent.title)+'</a></p><h1>'+esc(e.title)+'</h1></header>'+render(e)+'</article>'+commentsHTML(e,'example',commentSettings),{article:true}));}
  const graph=graphData(data,base);write('atlas/graph.json',JSON.stringify(graph));
  write('atlas/index.html',shell('Atlas','<section class="atlas"><div class="atlas-heading"><div><p class="eyebrow">A map of the published notes</p><h1>Atlas</h1></div><div class="map-actions"><a id="details-link" aria-disabled="true">Details</a><a href="'+base+'">Back</a></div></div><p id="selection-label" class="selection-label">Select a question or an example.</p><div id="map-host"><svg id="atlas-map" aria-label="Knowledge questions and their examples"></svg></div><p class="map-hint">Scroll to zoom · drag to pan · select, then Details</p></section>',{atlas:true}));
  for(const name of ['main.css','app.js','comments.js','atlas-mark.svg'])write('assets/'+name,fs.readFileSync(path.join(sourceRoot,'web',name)));
  const katexDist=path.join(path.dirname(require.resolve('katex/package.json')),'dist');fs.cpSync(path.join(katexDist,'katex.min.css'),path.join(outDir,'assets/katex/katex.min.css'));fs.cpSync(path.join(katexDist,'fonts'),path.join(outDir,'assets/katex/fonts'),{recursive:true});
  write('assets/katex/LICENSE.txt',fs.readFileSync(path.join(path.dirname(katexDist),'LICENSE')));
  for(const [name,bytes]of assets)write('assets/images/'+name,bytes);
  for(const file of sources.files)write(file.path,file.bytes);
  write('code/manifest.json',JSON.stringify({version:1,repository:sources.repository,branch:sources.branch,files:publicSources(sources)},null,2)+'\n');
  // A public snapshot is a byte-for-byte artifact, including CRLF source files.
  write('.gitattributes','* -text\n');
  write('.nojekyll','');
  const report={schemaVersion:2,articles:data.nodes.map(n=>({id:n.id,title:n.title,url:base+n.href})),examples:data.examples.map(e=>({id:e.id,parent:e.parent,title:e.title,url:base+e.href})),images:assets.size,sources:publicSources(sources),skippedSources:sources.skipped,sourceTarget:{repository:sources.repository,branch:sources.branch},comments:commentSettings,warnings:[...new Set(warnings)]};
  return report;
}
module.exports={build,snapshot,graphData,slug};
