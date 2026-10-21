'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const extensions=new Set('.py .pyi .ipynb .js .mjs .cjs .jsx .ts .tsx .html .htm .css .scss .sass .less .vue .svelte .json .jsonc .yaml .yml .toml .ini .cfg .md .txt .rst .r .jl .m .nb .wl .c .cc .cpp .cxx .h .hh .hpp .rs .go .java .kt .swift .cs .fs .f90 .f .sql .sh .bash .zsh .ps1 .bat .cmd .tex .bib .typ .svg .lock'.split(' '));
const excludedDirs=new Set(['node_modules','__pycache__','venv','env','dist','build']);
function githubTarget({repository='telingc/qa',branch='gh-pages'}={}){
  if(!/^[\w.-]+\/[\w.-]+$/.test(repository)||!branch||/[\s?#\\]/.test(branch))throw Error('Invalid GitHub source repository or branch.');
  return {repository,branch};
}
function collectSources(vault,options){
  const {repository,branch}=githubTarget(options),files=[],skipped=[];
  for(const folder of ['Nodes','Examples']){
    const root=path.join(vault,'Knowledge Atlas',folder,'scripts');if(!fs.existsSync(root))continue;
    if(fs.lstatSync(root).isSymbolicLink()||fs.realpathSync(root)!==root)throw Error('Script directories must stay inside the vault without linked folders.');
    const walk=(dir,prefix='')=>{
      for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
        const relative=prefix+entry.name,file=path.join(dir,entry.name),source=`${folder}/scripts/${relative}`;
        const skip=reason=>skipped.push({source,reason});
        if(entry.isSymbolicLink())throw Error('Linked script entries are not published: '+source);
        if(entry.name.startsWith('.')||excludedDirs.has(entry.name.toLowerCase())){skip('Hidden, cache or environment entry');continue;}
        if(entry.isDirectory()){walk(file,relative+'/');continue;}
        if(!entry.isFile()){skip('Not a regular source file');continue;}
        const extension=path.extname(entry.name).toLowerCase();
        if(/^(?:credentials?|secrets?|id_rsa)(?:\.|$)/i.test(entry.name)||/\.(?:pem|key|pfx|p12|pyc|pyo|log|exe|dll|obj|o|zip|7z|gz)$/i.test(entry.name)){skip('Credential, compiled or generated entry');continue;}
        const bytes=fs.readFileSync(file);
        if(!extensions.has(extension)){
          try {if(bytes.includes(0))throw Error('binary');new TextDecoder('utf-8',{fatal:true}).decode(bytes);}
          catch {skip('Binary output, not source');continue;}
        }
        const output=`code/${folder}/${relative}`;
        const url=`https://github.com/${repository}/blob/${encodeURIComponent(branch)}/${output.split('/').map(encodeURIComponent).join('/')}`;
        files.push({file,bytes,source,path:output,url,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),size:bytes.length});
      }
    };walk(root);
  }
  return {files,skipped,repository,branch};
}
const publicSources=sources=>sources.files.map(({file,bytes,...record})=>record);
module.exports={collectSources,githubTarget,publicSources};
