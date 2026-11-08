import {mountDemo} from './_plot.js';
import {node,label,arrow,colors,vector,control,frame,buttons,values} from './_polarization.js';

// Units: p0, E0, L0; F0=p0 E0/L0, N0=p0 E0. Here p0=1.85 D.
// Phi/E0L0 = -e*x - g*(x*x-z*z)/2: curl E=0 AND div E=0.
export function appliedField(x,z,e,g) {return [e+g*x,-g*z];}
export function dipoleResponse(theta,e,g) {
  const p=[Math.cos(theta),Math.sin(theta)];
  return {p,force:[g*p[0],-g*p[1]],torqueY:e*p[1]};
}
export function rotationStep(theta,e,dt) {
  // Overdamped, illustrative dimensionless time; center is held fixed.
  const f=t=>-e*Math.sin(t),a=f(theta),b=f(theta+dt*a/2),c=f(theta+dt*b/2),d=f(theta+dt*c);
  return theta+dt*(a+2*b+2*c+d)/6;
}

export function render(host) {
  const field=control('E / E₀',0,2,.01,1),gradient=control('G L₀ / E₀',-1,1,.01,0),angle=control('Angle (°)',-180,180,1,45);
  const {svg,row,readout}=frame(host,[field,gradient,angle],'Held center · point-dipole response · fixed |p| = 1.85 D · illustrative time',400);
  const background=node('g'),molecule=node('g'),vectors=node('g'),torque=node('g');svg.append(background,molecule,vectors,torque);
  let theta=Math.PI/4;
  function update() {
    const e=field.value(),g=gradient.value(),response=dipoleResponse(theta,e,g),{p,force}=response;
    background.replaceChildren();molecule.replaceChildren();vectors.replaceChildren();torque.replaceChildren();
    const cx=310,cy=192,scale=95;
    for(let x=-2.4;x<2.5;x+=.6)for(let z=-1.2;z<1.3;z+=.6) {
      const v=appliedField(x,z,e,g);
      background.append(arrow(cx+scale*x,cy-scale*z,16*v[0],-16*v[1],'#91bce649',1.2));
    }
    const rotate=(u,v)=>[cx+u*p[0]-v*p[1],cy-u*p[1]-v*p[0]];
    const oxygen=rotate(-20,0),beta=52.25*Math.PI/180;
    for(const sign of [-1,1]) {
      const h=rotate(-20+67*Math.cos(beta),sign*67*Math.sin(beta));
      molecule.append(node('line',{x1:oxygen[0],y1:oxygen[1],x2:h[0],y2:h[1],stroke:'#c4c7cd','stroke-width':4}),node('circle',{cx:h[0],cy:h[1],r:13,fill:'#d9dce2'}),label(h[0],h[1]+5,'H','#333',13));
    }
    molecule.append(node('circle',{cx:oxygen[0],cy:oxygen[1],r:21,fill:'#aa655a',stroke:'#d5a496'}),label(oxygen[0],oxygen[1]+6,'O','#fff',18));
    vectors.append(arrow(71,346,33,0,'#aab1ba',1),arrow(71,346,0,-33,'#aab1ba',1),label(113,351,'x','#aab1ba',15),label(71,303,'z','#aab1ba',15));
    vector(vectors,cx,cy,p,94,'p',colors.moment);
    vector(vectors,100,54,[e,0],58,'E',colors.field);
    vector(vectors,447,324,force,65,'F',colors.force);
    // A curved arrow uses the same fixed radius; angle, rather than its label alone,
    // grows with |N|. Clockwise rotation is positive physical y torque in x-z.
    if(Math.abs(response.torqueY)>1e-5) {
      const sign=response.torqueY>0?1:-1,r=106,start=-.3,end=start+sign*.85*Math.abs(response.torqueY);
      const a=[cx+r*Math.cos(start),cy+r*Math.sin(start)],b=[cx+r*Math.cos(end),cy+r*Math.sin(end)];
      torque.append(node('path',{d:`M ${a[0]} ${a[1]} A ${r} ${r} 0 0 ${sign>0?1:0} ${b[0]} ${b[1]}`,fill:'none',stroke:'#d7b8d9','stroke-width':2}),arrow(b[0]-sign*8*(-Math.sin(end)),b[1]-sign*8*Math.cos(end),sign*8*(-Math.sin(end)),sign*8*Math.cos(end),'#d7b8d9'),label(cx+135,cy+7,sign>0?'N ⊗':'N ⊙','#d7b8d9'));
    }
    field.result.textContent=e.toFixed(2);gradient.result.textContent=g.toFixed(2);
    angle.result.textContent=(theta*180/Math.PI).toFixed(0);angle.input.value=theta*180/Math.PI;
    values(readout,[`|F| / F₀ = ${Math.hypot(...force).toFixed(2)}`,`Nᵧ / N₀ = ${response.torqueY.toFixed(2)}`]);
    // Display plane is x-z, positive physical y points INTO the screen.
    svg.setAttribute('aria-label',`Water molecule in the x-z plane. Center held fixed. E at center ${e} E0. Gradient ${g}. Angle ${theta*180/Math.PI} degrees. Force components ${force.join(', ')} F0. Clockwise torque corresponds to positive y into the screen.`);
    host.dataset.angle=theta;host.dataset.force=JSON.stringify(force);host.dataset.torque=response.torqueY;
  }
  const playback=buttons(row,dt=>{theta=rotationStep(theta,field.value(),dt);update();},()=>{field.input.value=1;gradient.input.value=0;theta=Math.PI/4;update();});
  angle.input.addEventListener('input',()=>{playback.stop();theta=angle.value()*Math.PI/180;update();});
  for(const c of [field,gradient])c.input.addEventListener('input',update);
  update();
}
mountDemo('water-dipole',render);
