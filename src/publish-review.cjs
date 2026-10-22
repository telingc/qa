'use strict';
function sourceDiff(previous=[],next=[]){
  const before=new Map(previous.map(f=>[f.path,f.sha256])),after=new Map(next.map(f=>[f.path,f.sha256]));
  return {added:next.filter(f=>!before.has(f.path)).map(f=>f.path),modified:next.filter(f=>before.has(f.path)&&before.get(f.path)!==f.sha256).map(f=>f.path),removed:previous.filter(f=>!after.has(f.path)).map(f=>f.path)};
}
function assertPublishable(report){
  if(report.warnings.length)throw Error('Resolve export warnings before publishing.');
  if(report.comments.enabled&&!report.comments.ready)throw Error('Comments are not configured. Set comments.repoId, comments.category and comments.categoryId in config.local.json before publishing. No remote changes.');
  if(report.sourceTarget.branch!=='gh-pages')throw Error('Source links must target gh-pages, the publication branch.');
}
module.exports={sourceDiff,assertPublishable};
