import {element, rangeControl} from './_plot.js';

export const colors={field:'#91bce6',moment:'#e4c28a',force:'#b6d5b3',negative:'#8db7d8',positive:'#eea083',text:'#d7dce2'};
const NS='http://www.w3.org/2000/svg';
export function node(tag,attrs={},text) {
  const result=document.createElementNS(NS,tag);
  for(const [key,value] of Object.entries(attrs)) result.setAttribute(key,value);
  if(text!==undefined)result.textContent=text;
  return result;
}
export function label(x,y,text,color=colors.text,size=19,anchor='middle') {
  return node('text',{x,y,fill:color,'font-size':size,'text-anchor':anchor},text);
}
export function arrow(x,y,dx,dy,color=colors.field,width=2) {
  const length=Math.hypot(dx,dy);
  if(length<1e-8)return node('path',{d:''});
  const ux=dx/length,uy=dy/length,h=Math.min(8,length*.36),ex=x+dx,ey=y+dy;
  return node('path',{d:`M ${x} ${y} L ${ex} ${ey} M ${ex-h*ux-h*.45*uy} ${ey-h*uy+h*.45*ux} L ${ex} ${ey} L ${ex-h*ux+h*.45*uy} ${ey-h*uy-h*.45*ux}`,fill:'none',stroke:color,'stroke-width':width,'stroke-linecap':'round','stroke-linejoin':'round'});
}
export function vector(group,x,y,v,scale,name,color) {
  const path=arrow(x,y,scale*v[0],-scale*v[1],color);
  path.setAttribute('data-vector',name);group.append(path);
  if(Math.hypot(...v)>1e-6)group.append(label(x+scale*v[0]+12,y-scale*v[1]-8,name,color));
}
export function control(title,min,max,step,value) {
  const result=rangeControl(title,{min,max,step,value});
  result.value=()=>Number(result.input.value);
  return result;
}
export function frame(host,controls,caption,height=370) {
  host.classList.add('qa-polar-demo');
  const style=element('style',`
    .qa-polar-demo .qa-demo-controls{max-width:680px;margin:0 auto;align-items:center}
    .qa-polar-demo .qa-polar-scene{max-width:680px;margin:12px auto 0}
    .qa-polar-demo svg{display:block;width:100%;height:auto;font-family:inherit}
    .qa-polar-demo .qa-polar-values{text-align:center;font-size:15px;font-variant-numeric:tabular-nums;margin:10px 0;display:flex;gap:8px 22px;justify-content:center;flex-wrap:wrap}
    .qa-polar-demo figcaption{text-align:center;font-size:13px;color:var(--muted)}
    .qa-polar-demo .qa-polar-buttons{display:flex;gap:8px}
    .qa-polar-demo button{min-height:34px}
  `);
  const row=element('div','','qa-demo-controls');row.append(...controls.map(c=>c.label));
  const svg=node('svg',{viewBox:`0 0 620 ${height}`,role:'img'});
  const picture=element('div','','qa-polar-scene');picture.append(svg);
  const readout=element('div','','qa-polar-values');
  host.replaceChildren(style,row,picture,readout,element('figcaption',caption));
  return {svg,row,readout};
}
export function buttons(row,onStep,onReset) {
  const box=element('div','','qa-polar-buttons'),play=element('button','Play'),reset=element('button','Reset');
  play.type=reset.type='button';play.setAttribute('aria-pressed','false');box.append(play,reset);row.append(box);
  let running=false,raf=null,previous=null;
  function stop() {running=false;cancelAnimationFrame(raf);raf=null;previous=null;play.textContent='Play';play.setAttribute('aria-pressed','false');}
  function tick(now) {
    if(!row.isConnected){stop();return;}
    if(previous!==null)onStep(Math.min((now-previous)/1000,.05));
    previous=now;
    if(running)raf=requestAnimationFrame(tick);
  }
  play.addEventListener('click',()=>{
    if(running){stop();return;}
    running=true;play.textContent='Pause';play.setAttribute('aria-pressed','true');raf=requestAnimationFrame(tick);
  });
  reset.addEventListener('click',()=>{stop();onReset();});
  return {stop};
}
export function values(readout,items) {
  readout.replaceChildren(...items.map(text=>element('span',text)));
}
