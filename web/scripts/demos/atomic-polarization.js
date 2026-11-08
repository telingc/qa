import {element, rangeControl, mountDemo} from './_plot.js';

// q > 0; cloud charge is -q; d points from its center to the positive core.
export function restoringMagnitude(u) {
  if (!Number.isFinite(u) || u < 0) throw new RangeError('Use a finite displacement u >= 0.');
  return u <= 1 ? u : 1/(u*u);
}

export function enclosedChargeFraction(u) {
  if (!Number.isFinite(u) || u < 0) throw new RangeError('Use a finite radius u >= 0.');
  return u === 0 ? 0 : -Math.min(u**3, 1);
}

export function equilibriumDisplacement(eta) {
  if (!Number.isFinite(eta) || eta < 0) throw new RangeError('Use a finite field eta >= 0.');
  return eta < 1 ? eta : null;
}

export function fieldVectors(u, eta) {
  if (!Number.isFinite(eta) || eta < 0) throw new RangeError('Use a finite field eta >= 0.');
  const magnitude=restoringMagnitude(u);
  return {external:eta, cloud:magnitude===0?0:-magnitude};
}

export function separationStep(u, eta, dt) {
  if (!Number.isFinite(dt) || dt < 0) throw new RangeError('Use a finite time step dt >= 0.');
  restoringMagnitude(u); equilibriumDisplacement(eta);
  // Illustrative relaxation, not a prediction of atomic dynamics or ionization time.
  const speed = value => eta - restoringMagnitude(Math.max(0, value));
  const a = speed(u), b = speed(u+dt*a/2), c = speed(u+dt*b/2), d = speed(u+dt*c);
  return Math.max(0, u + dt*(a+2*b+2*c+d)/6);
}

const ID='atomic-polarization', SVG='http://www.w3.org/2000/svg', LIMIT=2.8;
const A=1e-10, Q=1.602176634e-19, EPSILON0=8.8541878128e-12;
const EC=Q/(4*Math.PI*EPSILON0*A*A);
const STYLE=`
[data-qa-demo="${ID}"] .qa-atom-scene{max-width:680px;margin:8px auto 0}
[data-qa-demo="${ID}"] .qa-demo-controls{max-width:680px;margin:0 auto}
[data-qa-demo="${ID}"] svg{display:block;width:100%;height:auto;font-family:inherit}
[data-qa-demo="${ID}"] .qa-atom-buttons{display:flex;gap:8px}
[data-qa-demo="${ID}"] .qa-atom-status{font-size:14px;color:var(--muted,#aaa);margin:8px 0 0;text-align:center}
[data-qa-demo="${ID}"] .qa-atom-values{display:flex;justify-content:center;gap:8px 24px;flex-wrap:wrap;font-variant-numeric:tabular-nums;color:var(--heading,#eee);margin:8px 0}
[data-qa-demo="${ID}"] .qa-atom-values span{white-space:nowrap}
[data-qa-demo="${ID}"] figcaption{text-align:center}
`;

function svgNode(tag, attrs={}, text) {
  const node=document.createElementNS(SVG,tag);
  for (const [key,value] of Object.entries(attrs)) node.setAttribute(key,value);
  if (text!==undefined) node.textContent=text;
  return node;
}

function arrow(x1,y1,x2,y2,color) {
  const length=Math.hypot(x2-x1,y2-y1);
  if(length===0)return svgNode('path',{d:''});
  const angle=Math.atan2(y2-y1,x2-x1), size=Math.min(7,length*0.4);
  const bx=x2-size*Math.cos(angle), by=y2-size*Math.sin(angle);
  return svgNode('path',{d:`M ${x1} ${y1} L ${x2} ${y2} M ${bx+size*.45*Math.sin(angle)} ${by-size*.45*Math.cos(angle)} L ${x2} ${y2} L ${bx-size*.45*Math.sin(angle)} ${by+size*.45*Math.cos(angle)}`,stroke:color,'stroke-width':1.8,fill:'none','stroke-linecap':'round','stroke-linejoin':'round'});
}

function textLabel(x,y,text,color='#d7dce2',anchor='middle') {
  return svgNode('text',{x,y,fill:color,'text-anchor':anchor,'font-size':25},text);
}

function scene() {
  const svg=svgNode('svg',{viewBox:'0 0 560 390',role:'img'});
  const cx=0, cy=177, a=86, fieldScale=90;
  const external=svgNode('g');
  const atom=svgNode('g',{'data-atom':'geometry'});
  const cloud=svgNode('circle',{cx,cy,r:a,fill:'#589dda','fill-opacity':0.15,stroke:'#8db7d8','stroke-width':1.4});
  cloud.setAttribute('data-atom','cloud');
  atom.append(cloud,
    svgNode('ellipse',{cx,cy,rx:36,ry:a,fill:'none',stroke:'#8db7d8','stroke-opacity':0.22}),
    svgNode('ellipse',{cx,cy,rx:a,ry:23,fill:'none',stroke:'#8db7d8','stroke-opacity':0.22}),
    svgNode('line',{x1:cx,y1:cy,x2:cx,y2:cy-a,stroke:'#9aa7b4','stroke-dasharray':'3 5'}),
    textLabel(cx-17,cy-a/2,'a'),textLabel(cx-68,cy+70,'−q','#a9c8e4'),textLabel(cx-14,cy+22,'x₀','#aab1ba'));
  const gaussian=svgNode('circle',{cx,cy,r:0,fill:'#91bce6','fill-opacity':0.08,stroke:'#d0d6dc','stroke-width':1.4,'stroke-dasharray':'5 5'});
  gaussian.setAttribute('data-atom','gaussian');
  const surfaceLabel=textLabel(cx,cy,'','#c5cbd3');
  surfaceLabel.append(svgNode('tspan',{},'∂B'),svgNode('tspan',{'baseline-shift':'sub','font-size':17},'d'));
  const core=svgNode('g');
  core.append(svgNode('circle',{cx:0,cy,r:10,fill:'#e8b575',stroke:'#ffe0ab','stroke-width':1}),textLabel(0,cy-21,'+q','#efc88f'));
  const restoring=svgNode('g'),displacement=svgNode('g'),dipole=svgNode('g');
  atom.append(gaussian,surfaceLabel,core,restoring,displacement,dipole);
  svg.append(external,textLabel(280,27,'E','#b6d4ee'),atom);
  return {svg,update(u,eta) {
    const x=cx+a*u, radius=a*u;
    const fields=fieldVectors(u,eta), externalLength=fieldScale*fields.external;
    const applied=arrow(280-externalLength/2,43,280+externalLength/2,43,'#91bce6');
    applied.setAttribute('data-vector','E');external.replaceChildren(applied);
    core.setAttribute('transform',`translate(${x},0)`);
    // Ee contains only the cloud field; the core lies on this Gaussian surface.
    gaussian.setAttribute('r',radius);
    const showSphere=u>0.12&&u<=1;
    gaussian.setAttribute('display',showSphere?'inline':'none');
    surfaceLabel.setAttribute('display',showSphere?'inline':'none');
    surfaceLabel.setAttribute('x',cx-radius-30);surfaceLabel.setAttribute('y',cy-radius*.55);
    restoring.replaceChildren();displacement.replaceChildren();dipole.replaceChildren();
    const fieldArrow=arrow(x,cy+40,x+fieldScale*fields.cloud,cy+40,'#b5cbdc');
    fieldArrow.setAttribute('data-vector','Ee');restoring.append(fieldArrow);
    if(u>0)restoring.append(textLabel(x+fieldScale*fields.cloud/2,cy+73,'Eₑ','#b5cbdc'));
    if (u>0.02) {
      displacement.append(svgNode('path',{d:`M ${cx} 283 V 299 M ${cx} 291 H ${x} M ${x} 283 V 299`,stroke:'#bac2cd','stroke-width':1.2,fill:'none'}),textLabel((cx+x)/2,323,'d'));
      const moment=arrow(cx,350,x,350,'#e4c28a');moment.setAttribute('data-vector','p');
      dipole.append(moment,textLabel((cx+x)/2,376,'p','#e4c28a'));
    }
    // Translation centers the visible configuration without changing any length scale.
    const bounds=atom.getBBox();
    atom.setAttribute('transform',`translate(${280-bounds.x-bounds.width/2},0)`);
    svg.setAttribute('aria-label',`Sphere section with fixed radius a and charge minus q. Gaussian radius d. Core charge plus q. d/a ${u.toFixed(3)}, Qenc/q ${enclosedChargeFraction(u).toFixed(3)}. Field arrow lengths use one common scale. Applied E points right, cloud field Ee left, dipole p right. ${eta>=1?'No stable bound equilibrium.':''}`);
  }};
}

export function render(host) {
  // Integer slider positions avoid floating-point step loss at a large SI field value.
  const {label:control,input,result}=rangeControl('E (V/m)',{min:0,max:160,step:1,value:0});
  const controls=element('div','','qa-demo-controls'),buttons=element('div','','qa-atom-buttons');
  const play=element('button','Play'),reset=element('button','Reset');play.type=reset.type='button';
  buttons.append(play,reset);controls.append(control,buttons);
  const status=element('p','','qa-atom-status');status.setAttribute('aria-live','polite');
  const drawing=scene(),picture=element('div','','qa-atom-scene');picture.append(drawing.svg);
  const values=element('p','','qa-atom-values');
  const offset=element('span'),charge=element('span'),moment=element('span');values.append(offset,charge,moment);
  const note=element('figcaption','Sphere section · shared field scale · a = 1 Å · q = e.');
  host.replaceChildren(element('style',STYLE),controls,status,picture,values,note);
  let u=0,frame=null,previousTime=0,startTime=0,initialField=0,heldField=false;
  const readField=()=>Number(input.value)/100;
  function update() {
    const eta=readField();result.value=eta===0?'0':(eta*EC).toExponential(2);drawing.update(u,eta);
    input.setAttribute('aria-valuetext',`${result.value} volts per meter`);
    offset.textContent=`d/a = ${u.toFixed(3)}`;
    charge.textContent=`Qenc/q = ${enclosedChargeFraction(u).toFixed(3)}`;
    moment.textContent=`|p|/(qa) = ${u.toFixed(3)}`;
    const text=eta===0?'Unpolarized':eta<1?'Polarized':eta===1?'Threshold':u>=LIMIT?'Separated · model':frame===null?'No bound equilibrium · press Play':'Separating · model';
    if(status.textContent!==text)status.textContent=text;
    host.dataset.field=String(eta);host.dataset.displacement=String(u);host.dataset.bound=String(eta<1);
  }
  function pause() {
    if(frame!==null)cancelAnimationFrame(frame);
    frame=null;play.textContent='Play';play.setAttribute('aria-pressed','false');
  }
  input.addEventListener('input',()=>{pause();const stable=equilibriumDisplacement(readField());u=stable===null?1:stable;update();});
  reset.addEventListener('click',()=>{pause();input.value='0';u=0;update();});
  play.addEventListener('click',()=>{
    if(frame!==null){pause();update();return;}
    if(u>=LIMIT){input.value='0';u=0;}
    initialField=readField();heldField=initialField>1;startTime=previousTime=performance.now();
    play.textContent='Pause';play.setAttribute('aria-pressed','true');
    function tick(now) {
      if(!host.isConnected){pause();return;}
      const dt=Math.min(0.04,Math.max(0,(now-previousTime)/1000));previousTime=now;
      if(!heldField)input.value=String(Math.round(100*Math.min(1.4,initialField+(1.4-initialField)*(now-startTime)/8000)));
      const eta=readField();u=eta<1?eta:Math.min(LIMIT,separationStep(u,eta,dt*4));update();
      if(u>=LIMIT)pause();else frame=requestAnimationFrame(tick);
    }
    frame=requestAnimationFrame(tick);update();
  });
  play.setAttribute('aria-pressed','false');update();
}

mountDemo(ID,render);
