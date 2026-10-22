'use strict';
const host=document.getElementById('map-host');
if(!host){
  const back=document.getElementById('back-link');
  if(back&&new URLSearchParams(location.search).get('from')==='atlas'){
    const base=new URL(document.body.dataset.base,location.origin),node=new URLSearchParams(location.search).get('node');
    const url=new URL('atlas/',base);if(node)url.searchParams.set('node',node);back.href=url;
  }
}else{
  const svg=document.getElementById('atlas-map'),ns='http://www.w3.org/2000/svg';
  const shape=(tag,attrs={})=>{const el=document.createElementNS(ns,tag);for(const [key,val]of Object.entries(attrs))el.setAttribute(key,val);return el;};
  const camera={x:0,y:0,scale:1},pointers=new Map();let storageKey,scene,graph,drag=null,pinch=null,selected=null;
  const apply=()=>{scene.setAttribute('transform',`translate(${camera.x} ${camera.y}) scale(${camera.scale})`);};
  const save=()=>{try{sessionStorage.setItem(storageKey,JSON.stringify(camera));}catch{}};
  const select=id=>{
    selected=graph.nodes.find(n=>n.id===id);if(!selected)return;
    scene.querySelectorAll('.graph-node').forEach(g=>{g.classList.toggle('is-selected',g.dataset.id===id);g.setAttribute('aria-pressed',String(g.dataset.id===id));});
    document.getElementById('selection-label').textContent=(selected.kind==='example'?'Example · ':'')+selected.title;
    const details=document.getElementById('details-link'),url=new URL(selected.href,location.origin);url.searchParams.set('from','atlas');url.searchParams.set('node',id);details.href=url.pathname+url.search;details.removeAttribute('aria-disabled');
    const current=new URL(location.href);current.searchParams.set('node',id);history.replaceState(null,'',current);
  };
  const fit=()=>{const w=host.clientWidth,h=host.clientHeight;camera.scale=Math.min(1.15,(w-36)/graph.width,(h-40)/graph.height);camera.x=(w-graph.width*camera.scale)/2;camera.y=(h-graph.height*camera.scale)/2;apply();};
  function labelLines(title,max=22){const words=title.split(/\s+/),lines=[''];for(const word of words){const last=lines.length-1;if((lines[last]+' '+word).trim().length<=max||!lines[last])lines[last]=(lines[last]+' '+word).trim();else lines.push(word);}return lines.slice(0,2).map((line,i)=>i===1&&lines.length>2?line.slice(0,max-1)+'…':line);}
  fetch(document.body.dataset.graph||'graph.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw Error('Could not load the map.');return r.json();}).then(data=>{
    graph=data;storageKey='qa-atlas-camera:'+location.pathname+':'+(graph.dataVersion||'legacy');scene=shape('g');svg.append(scene);const defs=shape('defs'),marker=shape('marker',{id:'arrow',viewBox:'0 0 10 10',refX:9,refY:5,markerWidth:6,markerHeight:6,orient:'auto-start-reverse'});marker.append(shape('path',{d:'M 0 1 L 9 5 L 0 9',fill:'none',stroke:'#697482','stroke-width':1.2}));defs.append(marker);svg.prepend(defs);
    for(const edge of graph.edges){const p=shape('path',{d:edge.path,class:'graph-edge '+edge.kind});if(edge.kind==='prerequisite')p.setAttribute('marker-end','url(#arrow)');scene.append(p);}
    for(const node of graph.nodes){const group=shape('g',{class:'graph-node '+node.kind,transform:`translate(${node.x} ${node.y})`,tabindex:0,role:'button','aria-label':node.title+(node.kind==='example'?', example':''),'aria-pressed':'false'});group.dataset.id=node.id;
      group.append(shape('rect',{x:-node.w/2,y:-node.h/2,width:node.w,height:node.h,rx:node.kind==='example'?14:5}));
      const title=shape('title');title.textContent=node.title;group.append(title);
      const lines=labelLines(node.title,node.kind==='example'?20:24);
      if(node.domain){const domain=shape('text',{x:-100,y:-23,class:'node-domain'});domain.textContent=node.domain;group.append(domain);}
      lines.forEach((line,i)=>{const text=shape('text',{x:node.kind==='example'?0:-100,y:node.kind==='example'?(i-(lines.length-1)/2)*17+5:4+i*23,'text-anchor':node.kind==='example'?'middle':'start'});text.textContent=line;group.append(text);});
      group.onclick=()=>{if(!drag?.moved)select(node.id);};group.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(node.id);}};group.onfocus=()=>{const px=camera.x+node.x*camera.scale,py=camera.y+node.y*camera.scale;if(px<0||px>host.clientWidth||py<0||py>host.clientHeight){camera.x=host.clientWidth/2-node.x*camera.scale;camera.y=host.clientHeight/2-node.y*camera.scale;apply();}};scene.append(group);
    }
    if(!graph.nodes.length){const text=shape('text',{x:35,y:70,class:'empty-map'});text.textContent='No published notes yet.';scene.append(text);}
    fit();try{const old=JSON.parse(sessionStorage.getItem(storageKey));if(old&&[old.x,old.y,old.scale].every(Number.isFinite)&&old.scale>=.15&&old.scale<=3){Object.assign(camera,old);apply();}}catch{}
    select(new URLSearchParams(location.search).get('node')||graph.nodes[0]?.id);
    let previousWidth=host.clientWidth,previousHeight=host.clientHeight;
    new ResizeObserver(()=>{if(graph&&(previousWidth!==host.clientWidth||previousHeight!==host.clientHeight)){camera.x+=(host.clientWidth-previousWidth)/2;camera.y+=(host.clientHeight-previousHeight)/2;previousWidth=host.clientWidth;previousHeight=host.clientHeight;apply();save();}}).observe(host);
  }).catch(e=>{document.getElementById('selection-label').textContent=e.message;});
  svg.addEventListener('wheel',e=>{if(!scene)return;e.preventDefault();const box=svg.getBoundingClientRect(),x=e.clientX-box.left,y=e.clientY-box.top,scale=Math.max(.15,Math.min(3,camera.scale*Math.exp(-e.deltaY*.0015))),ratio=scale/camera.scale;camera.x=x-(x-camera.x)*ratio;camera.y=y-(y-camera.y)*ratio;camera.scale=scale;apply();save();},{passive:false});
  svg.addEventListener('pointerdown',e=>{if(e.button!==0||!scene)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pointers.size===2){const [a,b]=[...pointers.values()],box=svg.getBoundingClientRect(),x=(a.x+b.x)/2-box.left,y=(a.y+b.y)/2-box.top;pinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),scale:camera.scale,worldX:(x-camera.x)/camera.scale,worldY:(y-camera.y)/camera.scale};drag=null;for(const id of pointers.keys())svg.setPointerCapture(id);}
    else if(pointers.size===1)drag={id:e.pointerId,x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y,moved:false};
  });
  svg.addEventListener('pointermove',e=>{if(pointers.has(e.pointerId))pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&pointers.size===2){const [a,b]=[...pointers.values()],box=svg.getBoundingClientRect();camera.scale=Math.max(.15,Math.min(3,pinch.scale*Math.hypot(a.x-b.x,a.y-b.y)/pinch.distance));camera.x=(a.x+b.x)/2-box.left-pinch.worldX*camera.scale;camera.y=(a.y+b.y)/2-box.top-pinch.worldY*camera.scale;apply();save();return;}
    if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>4&&!drag.moved){drag.moved=true;svg.setPointerCapture(e.pointerId);}if(drag.moved){camera.x=drag.cx+dx;camera.y=drag.cy+dy;svg.classList.add('is-panning');apply();}
  });
  const end=e=>{pointers.delete(e.pointerId);if(pinch){pinch=null;drag=null;save();return;}if(!drag)return;if(drag.moved){e.preventDefault();save();}svg.classList.remove('is-panning');setTimeout(()=>{drag=null;},0);};svg.addEventListener('pointerup',end);svg.addEventListener('pointercancel',end);
}
