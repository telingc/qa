'use strict';
const fs=require('node:fs'),path=require('node:path');
const {build}=require('../src/export.cjs');
const root=path.resolve(__dirname,'..');
function run(){
  const configPath=path.join(root,'config.local.json'),config=fs.existsSync(configPath)?JSON.parse(fs.readFileSync(configPath,'utf8')):JSON.parse(fs.readFileSync(path.join(root,'config.example.json'),'utf8'));
  const vault=path.resolve(root,process.env.QA_VAULT||config.vault),dist=path.join(root,'dist'),temp=path.join(root,'.dist-'+Date.now()),backup=path.join(root,'.dist-previous');
  const report=build({...config,vault,outDir:temp});
  // Replace generated output only after every page, formula and asset was built successfully.
  // Remove only the explicitly named generated backup, within this checkout.
  if(fs.existsSync(backup))fs.rmSync(backup,{recursive:true});
  if(fs.existsSync(dist))fs.renameSync(dist,backup);
  try{fs.renameSync(temp,dist);}catch(e){if(fs.existsSync(backup))fs.renameSync(backup,dist);throw e;}
  fs.writeFileSync(path.join(root,'publish-review.json'),JSON.stringify(report,null,2));
  console.log(`Built ${report.articles.length} articles, ${report.examples.length} examples, ${report.images} images.`);
  if(report.warnings.length)console.log('Review warnings:\n'+report.warnings.map(w=>' - '+w).join('\n'));
  return report;
}
if(require.main===module){try{run();}catch(e){console.error('Build stopped; previous dist is preserved. '+e.message);process.exitCode=1;}}
module.exports={run};
