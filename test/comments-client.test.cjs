'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../web/comments.js'),'utf8');
test('Comment client waits until visible, has one mount, recovers from network failure and ignores unrelated window messages',()=>{
  const scripts=[],status={textContent:''},fallback={hidden:true},events={},retry={hidden:true,addEventListener:(name,fn)=>events[name]=fn},frameWindow={};let observe;
  const container={dataset:{commentOptions:JSON.stringify({repo:'telingc/qa',term:'qa:node:fixed',mapping:'specific',strict:'1'})},replaceChildren(){},append(script){scripts.push(script);},querySelector:()=>({contentWindow:frameWindow})};
  const section={querySelector:selector=>selector==='[data-comment-options]'?container:selector==='.comments-status'?status:selector==='.comments-fallback'?fallback:retry};
  const window={IntersectionObserver:true,addEventListener:(name,fn)=>events[name]=fn};
  const document={querySelectorAll:()=>[section],createElement:()=>({attrs:{},callbacks:{},setAttribute(key,value){this.attrs[key]=value;},addEventListener(name,fn){this.callbacks[name]=fn;}})};
  vm.runInNewContext(code,{window,document,IntersectionObserver:class{constructor(callback){observe=callback;}observe(){}disconnect(){}}});
  assert.equal(scripts.length,0);observe([{isIntersecting:true}]);observe([{isIntersecting:true}]);assert.equal(scripts.length,1);
  assert.equal(scripts[0].src,'https://giscus.app/client.js');assert.equal(scripts[0].attrs['data-term'],'qa:node:fixed');
  scripts[0].callbacks.error();assert.equal(retry.hidden,false);assert.match(status.textContent,/unavailable/);assert.equal(fallback.hidden,false);
  events.click();assert.equal(scripts.length,2);assert.equal(retry.hidden,true);assert.equal(status.textContent,'');assert.equal(fallback.hidden,true);
  events.message({origin:'https://unrelated.invalid',source:frameWindow,data:{giscus:{error:'no'}}});assert.equal(retry.hidden,true);
  events.message({origin:'https://giscus.app',source:{},data:{giscus:{error:'no'}}});assert.equal(retry.hidden,true);
  events.message({origin:'https://giscus.app',source:frameWindow,data:{giscus:{error:'Discussion not found'}}});assert.equal(retry.hidden,true,'An article without comments is a normal first-visit state');
  events.message({origin:'https://giscus.app',source:frameWindow,data:{giscus:{error:'blocked'}}});assert.equal(retry.hidden,false);
});
