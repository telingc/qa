'use strict';
const fs=require('node:fs'),path=require('node:path');
const {build}=require('../src/export.cjs');
const {readConfig}=require('../src/config.cjs');
const root=path.resolve(__dirname,'..');
function run(){
  const config=readConfig(root),contentDir=path.resolve(root,config.contentDir),dist=path.join(root,'dist'),temp=path.join(root,'.dist-'+Date.now()),backup=path.join(root,'.dist-previous');
  const report=build({...config,contentDir,outDir:temp});
  // Replace generated output only after every page, formula and asset was built successfully.
  // Remove only the explicitly named generated backup, within this checkout.
  if(fs.existsSync(backup))fs.rmSync(backup,{recursive:true});
  if(fs.existsSync(dist))fs.renameSync(dist,backup);
  try{fs.renameSync(temp,dist);}catch(e){if(fs.existsSync(backup))fs.renameSync(backup,dist);throw e;}
  fs.writeFileSync(path.join(root,'publish-review.json'),JSON.stringify(report,null,2));
  console.log(`Built ${report.articles.length} articles, ${report.examples.length} examples, ${report.images} images and ${report.sources.length} source file${report.sources.length===1?'':'s'}.`);
  console.log(`Comments: ${!report.comments.enabled?'disabled':report.comments.ready?'configured (live access still needs verification)':'pending setup: '+report.comments.missing.join(', ')}.`);
  if(report.skippedSources.length)console.log('Excluded source entries (see publish-review.json): '+report.skippedSources.map(f=>f.source).join(', '));
  if(report.warnings.length)console.log('Review warnings:\n'+report.warnings.map(w=>' - '+w).join('\n'));
  return report;
}
if(require.main===module){try{run();}catch(e){console.error('Build stopped; previous dist is preserved. '+e.message);process.exitCode=1;}}
module.exports={run};
