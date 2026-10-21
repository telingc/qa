'use strict';
const {githubTarget}=require('./sources.cjs');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function commentConfig(options={},repository='telingc/qa'){
  const {repository:repo}=githubTarget({repository:options.repository||repository});
  if(options.enabled===false)return {enabled:false,ready:false,repository:repo,missing:[]};
  const missing=['repoId','category','categoryId'].filter(key=>typeof options[key]!=='string'||!options[key].trim());
  return {enabled:true,ready:!missing.length,repository:repo,repoId:options.repoId||'',category:options.category||'',categoryId:options.categoryId||'',missing};
}
function commentTerm(kind,id){return `qa:${kind}:${id}`;}
function commentsHTML(note,kind,config){
  if(!config.enabled)return '';
  const term=commentTerm(kind,note.id),link=`https://github.com/${config.repository}/discussions?discussions_q=${encodeURIComponent('"'+term+'"')}`;
  const options={repo:config.repository,'repo-id':config.repoId,category:config.category,'category-id':config.categoryId,mapping:'specific',term,strict:'1','reactions-enabled':'0','emit-metadata':'0','input-position':'bottom',theme:'dark_dimmed',lang:'en',loading:'lazy'};
  return `<section class="comments" aria-labelledby="comments-heading"><h2 id="comments-heading">Comments</h2><p class="comments-intro">Questions and corrections are welcome. <a href="${esc(link)}">Open the discussion on GitHub</a>.</p>${config.ready?`<div class="giscus" data-comment-options="${esc(JSON.stringify(options))}"></div><p class="comments-status" role="status" aria-live="polite"></p><button class="comments-retry" type="button" hidden>Retry comments</button>`:''}</section>`;
}
module.exports={commentConfig,commentTerm,commentsHTML};
