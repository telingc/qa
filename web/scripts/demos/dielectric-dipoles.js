import {mountDemo} from './_plot.js';
import {node,label,arrow,colors,vector,control,frame,buttons,values} from './_polarization.js';

export const CENTERS=[[-1,-.6],[0,-.6],[1,-.6],[-1,.6],[0,.6],[1,.6]];
const HALF_SEPARATION=.12, COULOMB=.014;
export function meanMoment(angles) {
  if(!angles.length)throw new RangeError('At least one dipole is required.');
  return [angles.reduce((a,t)=>a+Math.cos(t),0)/angles.length,angles.reduce((a,t)=>a+Math.sin(t),0)/angles.length];
}
export function rotorStep(theta,e,temperature,dt,normalSample) {
  if(temperature<0||dt<0||!Number.isFinite(temperature+dt+theta+e+normalSample))throw new RangeError('Use finite inputs, T >= 0, dt >= 0.');
  // Euler-Maruyama: dθ = -e sinθ dt + sqrt(2T) dW.
  // Stationary planar density ∝ exp(e cosθ/T); rotations do not alter |p|.
  const next=theta-e*Math.sin(theta)*dt+Math.sqrt(2*temperature*dt)*normalSample;
  return Math.atan2(Math.sin(next),Math.cos(next));
}
export function chargePairs(angles) {
  return CENTERS.flatMap(([x,z],i)=>[-1,1].map(q=>({q,x:x+q*HALF_SEPARATION*Math.cos(angles[i]),z:z+q*HALF_SEPARATION*Math.sin(angles[i])})));
}
export function totalField(x,z,e,charges) {
  let ex=e,ez=0;
  for(const source of charges) {
    const dx=x-source.x,dz=z-source.z,r=Math.hypot(dx,dz);
    if(r<.025)return null; // Stop before a point-charge singularity; no softening.
    ex+=COULOMB*source.q*dx/r**3;ez+=COULOMB*source.q*dz/r**3;
  }
  return [ex,ez];
}
function gaussian(random) {
  return Math.sqrt(-2*Math.log(Math.max(Number.MIN_VALUE,random())))*Math.cos(2*Math.PI*random());
}
function seededRandom(seed=7301) {
  return ()=>{seed=(1664525*seed+1013904223)>>>0;return (seed+.5)/4294967296;};
}

export function render(host) {
  const field=control('E / E₀',0,3,.01,0),temperature=control('T / T₀',0,2,.01,.5);
  const {svg,row,readout}=frame(host,[field,temperature],'Planar rotors · fixed centers · no interactions · white: total field · gold: P',410);
  const lines=node('g',{'data-part':'field-lines'}),material=node('g'),dipoles=node('g'),vectors=node('g');
  svg.append(lines,material,dipoles,vectors);
  const cx=310,cy=203,scale=107;
  material.append(node('rect',{x:cx-1.55*scale,y:cy-.97*scale,width:3.1*scale,height:1.94*scale,rx:4,fill:'#91bce6','fill-opacity':.035,stroke:'#91bce66b','stroke-width':1.4}));
  let angles,random,accumulator=0,drawClock=0;
  function resetState() {
    random=seededRandom();
    // Opposite pairs give exactly zero initial net dipole, not a measured equilibrium.
    angles=[.4,1.2,2.4,.4+Math.PI,1.2+Math.PI,2.4+Math.PI];accumulator=0;drawClock=0;
  }
  const screen=(x,z)=>[cx+x*scale,cy-z*scale];
  function drawLines(charges,e) {
    lines.replaceChildren();
    const seeds=[];
    if(e>0)for(let z=-1.5;z<1.6;z+=.25)seeds.push([-2.7,z,1]);
    for(const s of charges.filter(s=>s.q>0))for(let j=0;j<6;j++) {
      const a=j*Math.PI/3;seeds.push([s.x+.04*Math.cos(a),s.z+.04*Math.sin(a),1]);
    }
    for(const [sx,sz,sign] of seeds) {
      let x=sx,z=sz,d='',head=null;
      for(let step=0;step<420;step++) {
        if(Math.abs(x)>2.8||Math.abs(z)>1.55)break;
        const v=totalField(x,z,e,charges);if(!v)break;
        const norm=Math.hypot(...v);if(norm<1e-7)break;
        // Midpoint direction integration, reduced step close to a charge.
        const nearest=Math.min(...charges.map(s=>Math.hypot(x-s.x,z-s.z)));
        const ds=Math.min(.035,nearest*.18)*sign;
        const mid=totalField(x+ds*v[0]/norm/2,z+ds*v[1]/norm/2,e,charges);if(!mid)break;
        const m=Math.hypot(...mid);if(m<1e-8)break;
        const [px,py]=screen(x,z);d+=`${step?'L':'M'} ${px.toFixed(1)} ${py.toFixed(1)} `;
        if(step===22)head=[px,py,mid[0]/m*8,-mid[1]/m*8];
        x+=ds*mid[0]/m;z+=ds*mid[1]/m;
      }
      if(d)lines.append(node('path',{d,fill:'none',stroke:'#fff','stroke-opacity':.32,'stroke-width':.9}));
      if(head)lines.append(arrow(...head,'#ffffff88',.9));
    }
  }
  function update() {
    const e=field.value(),t=temperature.value(),mean=meanMoment(angles),charges=chargePairs(angles);
    drawLines(charges,e);dipoles.replaceChildren();vectors.replaceChildren();
    for(const [i,center] of CENTERS.entries()) {
      const p=[Math.cos(angles[i]),Math.sin(angles[i])],negative=charges[2*i],positive=charges[2*i+1];
      const a=screen(negative.x,negative.z),b=screen(positive.x,positive.z);
      dipoles.append(arrow(a[0],a[1],b[0]-a[0],b[1]-a[1],colors.moment,2));
      for(const [s,point] of [[negative,a],[positive,b]])dipoles.append(node('circle',{cx:point[0],cy:point[1],r:4.2,fill:s.q>0?colors.positive:colors.negative}));
      const [x,y]=screen(...center);dipoles.append(node('circle',{cx:x,cy:y,r:1.8,fill:'#d7dce2'}));
    }
    vector(vectors,120,55,[e,0],52,'E',colors.field);
    vector(vectors,463,80,mean,46,'P',colors.moment);
    field.result.textContent=e.toFixed(2);temperature.result.textContent=t.toFixed(2);
    values(readout,[`Pₓ / P₀ = ${mean[0].toFixed(2)}`,`P_z / P₀ = ${mean[1].toFixed(2)}`]);
    host.dataset.mean=JSON.stringify(mean);host.dataset.angles=JSON.stringify(angles);host.dataset.field=e;host.dataset.temperature=t;
    svg.setAttribute('aria-label',`Six independent planar permanent dipoles at fixed centers in a rectangular dielectric sketch. E ${e}, relative temperature ${t}. Instantaneous normalized polarization ${mean.join(', ')}. White curves are total field lines, not calibrated field strength. Dipole interactions do not drive the rotors.`);
  }
  buttons(row,dt=>{
    accumulator+=dt;drawClock+=dt;
    const h=1/240;
    while(accumulator>=h) {angles=angles.map(a=>rotorStep(a,field.value(),temperature.value(),h,gaussian(random)));accumulator-=h;}
    if(drawClock>=1/15){update();drawClock=0;}
  },()=>{field.input.value=0;temperature.input.value=.5;resetState();update();});
  for(const c of [field,temperature])c.input.addEventListener('input',update);
  resetState();update();
}
mountDemo('dielectric-dipoles',render);
