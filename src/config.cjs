'use strict';
const fs=require('node:fs'),path=require('node:path');
function readConfig(root){
  const load=name=>{const file=path.join(root,name);return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};};
  const defaults={contentDir:'content',basePath:'/qa/',title:'My atlas',tagline:'A learning process, left open.',intro:'Working notes. Questions, attempts, and revisions.',comments:{enabled:false},github:{branch:'main'},deployment:{mode:'actions'}};
  const local=load('config.local.json');
  if(local.vault)throw Error('Legacy vault config detected. Move the path to atlas-import.local.json; build and publish only read contentDir.');
  const config={...defaults,...load('site.config.json'),...local};
  if(process.env.QA_BASE_PATH)config.basePath=process.env.QA_BASE_PATH;
  if(process.env.QA_CONTENT)config.contentDir=process.env.QA_CONTENT;
  if(process.env.QA_REPOSITORY){config.github={...config.github,repository:process.env.QA_REPOSITORY};if(config.comments?.repository!==process.env.QA_REPOSITORY)config.comments={enabled:false};}
  return config;
}
module.exports={readConfig};
