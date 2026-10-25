'use strict';
const fs=require('node:fs'),path=require('node:path');
const {readConfig}=require('../src/config.cjs'),{prepareImport,applyImport}=require('../src/import-atlas.cjs');
const root=path.resolve(__dirname,'..');
try{
  const args=process.argv.slice(2);
  if(args.includes('--help')){console.log('npm run import:atlas -- --from "PATH TO VAULT"\nReview import-review.json, then repeat with --confirm.\nOr save {"vault":"PATH TO VAULT"} in ignored atlas-import.local.json.\nThis command never publishes and never writes to the source vault.');process.exit(0);}
  const position=args.indexOf('--from'),local=path.join(root,'atlas-import.local.json');
  const source=position>=0?args[position+1]:fs.existsSync(local)?JSON.parse(fs.readFileSync(local,'utf8')).vault:null;
  if(!source)throw Error('Choose an import source with --from or atlas-import.local.json. Build/publish do not need this setting.');
  const config=readConfig(root),content=path.resolve(root,config.contentDir),relative=path.relative(root,content);
  if(!relative||relative.startsWith('..')||path.isAbsolute(relative))throw Error('Imported content must be inside this QA checkout.');
  const review=path.join(root,'import-review.json'),approved=args.includes('--confirm')&&fs.existsSync(review)?JSON.parse(fs.readFileSync(review,'utf8')).planHash:null;
  const plan=prepareImport({vault:path.resolve(root,source),contentDir:content,stateFile:path.join(root,'.atlas-import.json')});
  fs.writeFileSync(review,JSON.stringify(plan.report,null,2)+'\n');
  console.log(`Import preview: ${plan.report.articles} notes, ${plan.report.examples} examples, ${plan.report.sources} source files.\n${plan.report.changes.added.length} added, ${plan.report.changes.modified.length} modified, ${plan.report.changes.removed.length} removed.`);
  if(plan.report.conflicts.length)throw Error('Resolve import conflicts before applying:\n'+plan.report.conflicts.join('\n'));
  if(args.includes('--confirm')){if(approved!==plan.report.planHash)throw Error('Import changed or was not reviewed. Review the new import-review.json first.');applyImport(plan);console.log('Local content updated. No source-vault or remote changes.');}
  else console.log('No content changes. Review import-review.json and repeat with --confirm to apply locally.');
}catch(error){
  console.error('Import stopped: '+error.message+'\nFix the reported issue and run Import Atlas again. Preview QA only shows content from successful imports.');
  try{fs.appendFileSync(path.join(root,'import-error.log'),'['+new Date().toISOString()+'] '+(error.stack||error.message)+'\n\n','utf8');console.error('Details saved to import-error.log.');}
  catch(logError){console.error('Could not write import-error.log: '+logError.message);}
  process.exitCode=1;
}
