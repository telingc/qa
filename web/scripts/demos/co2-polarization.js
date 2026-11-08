import {element,mountDemo} from './_plot.js';
import {node,label,colors,vector,control,frame,values} from './_polarization.js';

const E0=1e9, DEBYE=3.33564e-30, ELECTRON=1.602176634e-19;
export const ALPHA_PARALLEL=4.5e-40, ALPHA_PERPENDICULAR=2e-40;
export function inducedMoment(eParallel,ePerpendicular) {
  return [ALPHA_PARALLEL*eParallel,ALPHA_PERPENDICULAR*ePerpendicular];
}
// A single rigid effective cloud carries all 22 electrons. It only represents p,
// not the quantum density or the permanent charge structure of CO2.
export function cloudDisplacement(moment) {return moment.map(p=>-p/(22*ELECTRON));}

export function render(host) {
  const parallel=control('E∥ / E₀',-1,1,.01,.6),perpendicular=control('E⊥ / E₀',-1,1,.01,.6);
  const {svg,readout}=frame(host,[parallel,perpendicular],'Fixed molecular axis · schematic cloud shift ×100 · E₀ = 10⁹ V/m',320);
  const cloud=node('g',{'data-part':'cloud'}),nuclei=node('g'),vectors=node('g');
  svg.append(node('line',{x1:145,y1:188,x2:475,y2:188,stroke:'#ffffff35','stroke-dasharray':'5 5'}));
  for(const [x,charge] of [[194,'O'],[310,'C'],[426,'O']]) {
    cloud.append(node('ellipse',{cx:x,cy:188,rx:charge==='C'?47:57,ry:charge==='C'?44:52,fill:colors.negative,'fill-opacity':.18,stroke:colors.negative,'stroke-opacity':.6}));
  }
  nuclei.append(node('line',{x1:194,y1:188,x2:426,y2:188,stroke:'#a8adb4','stroke-width':3}));
  for(const [x,text] of [[194,'O'],[310,'C'],[426,'O']])nuclei.append(node('circle',{cx:x,cy:188,r:17,fill:text==='C'?'#666e79':'#ac6559',stroke:'#d1c3bb'}),label(x,194,text,'#fff',17));
  svg.append(cloud,nuclei,vectors,label(310,279,'CO₂ · molecular axis →','#aeb6bf',17));
  function update() {
    const e=[parallel.value(),perpendicular.value()],p=inducedMoment(e[0]*E0,e[1]*E0),delta=cloudDisplacement(p);
    // 100 pixels/Å; distortion amplified 100×, nuclei and bond length fixed.
    cloud.setAttribute('transform',`translate(${delta[0]*1e14},${-delta[1]*1e14})`);
    vectors.replaceChildren();
    vector(vectors,125,95,e,65,'E',colors.field);
    vector(vectors,440,95,p.map(v=>v/(ALPHA_PARALLEL*E0)),65,'p',colors.moment);
    parallel.result.textContent=e[0].toFixed(2);perpendicular.result.textContent=e[1].toFixed(2);
    values(readout,[`|p| = ${(Math.hypot(...p)/DEBYE).toFixed(3)} D`,'Blue: E · gold: p']);
    host.dataset.parallel=e[0];host.dataset.perpendicular=e[1];host.dataset.moment=JSON.stringify(p);
    svg.setAttribute('aria-label',`CO2, fixed horizontal axis. Applied field components ${e.join(', ')} in units of E0. Induced dipole ${p.join(', ')} C m. Blue schematic cloud shifts opposite p; displacement amplified one hundred times.`);
  }
  for(const c of [parallel,perpendicular])c.input.addEventListener('input',update);
  // Static experiment: Reset restores a visibly oblique field.
  const reset=element('button','Reset');reset.type='button';
  reset.addEventListener('click',()=>{parallel.input.value=.6;perpendicular.input.value=.6;update();});
  host.querySelector('.qa-demo-controls').append(reset);
  update();
}
mountDemo('co2-polarization',render);
