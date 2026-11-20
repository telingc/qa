'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');

test('a polarized slab has opposite end normals and conserves total bound charge', async () => {
  const {polarizationProfile} = await import('../web/scripts/demos/bound-charge-slices.js');
  const uniform = polarizationProfile(0);
  assert.deepEqual([uniform.surfaceLeft, uniform.surfaceRight, uniform.volumeCharge], [-1, 1, 0]);
  for (const [gradient,left,right] of [[1,-0.5,1.5],[-1,-1.5,0.5]]) {
    const profile = polarizationProfile(gradient);
    assert.equal(profile.surfaceLeft,left);
    assert.equal(profile.surfaceRight,right);
    assert.equal(profile.volumeCharge,-gradient);
    assert.equal(profile.volumeCharge + left + right,0);
    // Integral flux per unit volume for a box spanning the inner half of the slab.
    assert.equal((profile.at(0.75) - profile.at(0.25)) / 0.5,profile.divergence);
  }
});

test('fixed cross section relates the swept charge to the normal polarization', async () => {
  const {crossingQuantities} = await import('../web/scripts/demos/bound-charge-crossing.js');
  for (const shift of [0, 0.5, 2.5]) {
    const {volume, pairs, charge, moment, normalPolarization} = crossingQuantities(shift);
    const area = 3 * 3;
    assert.equal(volume, area * shift);
    assert.equal(pairs, volume);
    assert.equal(charge, pairs);
    assert.equal(moment, shift);
    assert.equal(charge / area, normalPolarization);
  }
});

test('planar rotor statistics approach the Boltzmann angular average and weaken as temperature rises',async()=>{
  const {rotorStep}=await import('../web/scripts/demos/dielectric-dipoles.js');
  let seed=2137;
  const random=()=>{seed=(1664525*seed+1013904223)>>>0;return (seed+.5)/4294967296;};
  const normal=()=>Math.sqrt(-2*Math.log(random()))*Math.cos(2*Math.PI*random());
  const means=[];
  for(const temperature of [.5,2]) {
    const angles=Array.from({length:160},()=>2*Math.PI*random());
    let sum=0,count=0;
    for(let step=0;step<7200;step++)for(let i=0;i<angles.length;i++) {
      angles[i]=rotorStep(angles[i],1,temperature,1/240,normal());
      if(step>2400&&step%24===0){sum+=Math.cos(angles[i]);count++;}
    }
    // Independent quadrature of exp(E cos(theta)/T), not the time-step formula.
    let weight=0,moment=0;
    for(let i=0;i<2048;i++) {
      const theta=2*Math.PI*(i+.5)/2048,w=Math.exp(Math.cos(theta)/temperature);
      weight+=w;moment+=Math.cos(theta)*w;
    }
    const measured=sum/count,expected=moment/weight;
    assert.ok(Math.abs(measured-expected)<.035,`${temperature}: ${measured} versus ${expected}`);
    means.push(measured);
  }
  assert.ok(means[0]>means[1]+.35);
});

test('CO2 tensor response is anisotropic and its effective cloud has the same dipole', async()=>{
  const {inducedMoment,cloudDisplacement}=await import('../web/scripts/demos/co2-polarization.js');
  const p=inducedMoment(1e9,1e9);
  assert.ok(Math.abs(p[0]/p[1]-2.25)<1e-14);
  assert.deepEqual(inducedMoment(0,0),[0,0]);
  for(const e of [[1e9,0],[0,-1e9],[-.4e9,.8e9]]) {
    const moment=inducedMoment(...e),delta=cloudDisplacement(moment);
    moment.forEach((value,i)=>assert.ok(Math.abs((-22*1.602176634e-19*delta[i]-value)/Math.max(1e-40,Math.abs(value)))<1e-14));
  }
});

test('water force and center torque agree with two charges in a source-free electrostatic gradient',async()=>{
  const {appliedField,dipoleResponse,rotationStep}=await import('../web/scripts/demos/water-dipole.js');
  const theta=.7,e=1.3,g=-.4,d=.02,q=1/d;
  const actual=dipoleResponse(theta,e,g),p=[Math.cos(theta),Math.sin(theta)];
  const ends=[-1,1].map(sign=>({q:sign*q,r:p.map(v=>sign*d*v/2)}));
  const forces=ends.map(s=>appliedField(...s.r,e,g).map(v=>s.q*v));
  for(let i=0;i<2;i++)assert.ok(Math.abs(actual.force[i]-forces[0][i]-forces[1][i])<1e-13);
  const torqueY=ends.reduce((sum,s,i)=>sum+s.r[1]*forces[i][0]-s.r[0]*forces[i][1],0);
  assert.ok(Math.abs(torqueY-actual.torqueY)<1e-14);
  assert.deepEqual(dipoleResponse(theta,e,0).force,[0,-0]);
  assert.equal(dipoleResponse(0,e,g).torqueY,0);
  // div E = g-g = 0, curl E = 0; compare E with -grad Phi independently.
  const phi=(x,z)=>-e*x-g*(x*x-z*z)/2,h=1e-5,x=.8,z=-.3,field=appliedField(x,z,e,g);
  assert.ok(Math.abs(field[0]+(phi(x+h,z)-phi(x-h,z))/(2*h))<1e-10);
  assert.ok(Math.abs(field[1]+(phi(x,z+h)-phi(x,z-h))/(2*h))<1e-10);
  // tan(theta(t)/2) = tan(theta(0)/2) exp(-e*t).
  const dt=.01,next=rotationStep(theta,e,dt),exact=2*Math.atan(Math.tan(theta/2)*Math.exp(-e*dt));
  assert.ok(Math.abs(next-exact)<1e-11);
});

test('thermal planar rotors preserve dipole magnitude and have the expected drift and noise',async()=>{
  const {rotorStep,meanMoment,chargePairs,totalField}=await import('../web/scripts/demos/dielectric-dipoles.js');
  assert.deepEqual(meanMoment([0,0]),[1,0]);
  assert.ok(Math.hypot(...meanMoment([0,Math.PI]))<1e-15);
  const theta=.4,e=1.2,t=.7,dt=.001;
  const plus=rotorStep(theta,e,t,dt,1),minus=rotorStep(theta,e,t,dt,-1);
  assert.ok(Math.abs((plus+minus)/2-theta+e*Math.sin(theta)*dt)<1e-14);
  assert.ok(Math.abs((plus-minus)/2-Math.sqrt(2*t*dt))<1e-14);
  assert.equal(rotorStep(theta,0,0,.1,10),theta);
  assert.ok(rotorStep(theta,e,0,.1,0)<theta);
  assert.ok(Math.abs(Math.hypot(Math.cos(plus),Math.sin(plus))-1)<1e-15);
  const pairs=chargePairs([0,0,0,0,0,0]);
  assert.equal(pairs.reduce((sum,s)=>sum+s.q,0),0);
  assert.ok(Math.abs(pairs.reduce((sum,s)=>sum+s.q*s.x,0)-6*.24)<1e-14);
  assert.equal(totalField(pairs[0].x,pairs[0].z,1,pairs),null);
  const actual=totalField(2,0,1,[{q:2,x:0,z:0}]);
  assert.deepEqual(actual,[1+.014*2/4,0]);
  assert.throws(()=>rotorStep(0,1,-1,.01,0),RangeError);
});

test('multipole demo respects the exterior domain and reproduces the first three truncations', async () => {
  const {exactPotential, multipolePotential} = await import('../web/scripts/demos/multipole-convergence.js');
  for (const [x, z] of [[0.8, 1.2], [2, -1.3], [0, 3]]) {
    const r = Math.hypot(x, z);
    const terms = [1/r, 3*z/r**3, (3*z*z-r*r)/(2*r**5)];
    for (let order = 0; order < terms.length; order++) {
      assert.ok(Math.abs(multipolePotential(x, z, order) - terms.slice(0, order+1).reduce((a, b) => a+b)) < 1e-13);
    }
  }
  assert.ok(Number.isNaN(multipolePotential(0, 1, 8)));
  assert.ok(Number.isNaN(multipolePotential(0, 0, 8)));
  assert.ok(Math.abs(multipolePotential(0, 3, 8) - exactPotential(0, 3)) < 0.0001);
});

test('fixed-moment dipole potential and field agree with Coulomb and the ideal limit', async () => {
  const {dipolePotential, dipoleField} = await import('../web/scripts/demos/dipole-limit.js');
  const x = 0.8, z = 1.2, d = 1;
  const a = Math.hypot(x, z-d/2), b = Math.hypot(x, z+d/2), r = Math.hypot(x, z);
  assert.ok(Math.abs(dipolePotential(x, z, d) - (1/a-1/b)/d) < 1e-13);
  const actual = dipoleField(x, z, d), coulomb = [(x/a**3-x/b**3)/d, ((z-d/2)/a**3-(z+d/2)/b**3)/d];
  const ideal = [3*x*z/r**5, (3*z*z-r*r)/r**5];
  for (const [i, component] of actual.entries()) {
    assert.ok(Math.abs(component - coulomb[i]) < 1e-13);
    assert.ok(Math.abs(dipoleField(x, z, 0)[i] - ideal[i]) < 1e-13);
    assert.ok(Math.abs(dipoleField(x, z, 1e-7)[i] - ideal[i]) < 1e-12);
  }
  assert.ok(Math.abs(dipolePotential(x, z, 1e-7) - z/r**3) < 1e-12);
  assert.equal(dipolePotential(0, 2, 0), 0.25);
});

test('uniform-cloud restoring field agrees with Gauss law inside and outside the sphere', async () => {
  const {restoringMagnitude, equilibriumDisplacement} = await import('../web/scripts/demos/atomic-polarization.js');
  const q=1.7, epsilon=2.3, a=1.2, ec=q/(4*Math.PI*epsilon*a*a);
  for (const u of [0,0.2,0.7,1,1.8,2.8]) {
    const r=u*a, enclosed=q*Math.min(u**3,1);
    const field=r===0?0:enclosed/(4*Math.PI*epsilon*r*r);
    assert.ok(Math.abs(restoringMagnitude(u)-field/ec)<1e-14);
  }
  for (const eta of [0,0.2,0.7,0.99]) {
    const u=equilibriumDisplacement(eta), dipole=q*a*u;
    const alpha=4*Math.PI*epsilon*a**3, field=eta*ec;
    assert.ok(Math.abs(dipole-alpha*field)<1e-14);
  }
  assert.equal(equilibriumDisplacement(1),null);
  assert.equal(equilibriumDisplacement(1.2),null);
  assert.equal(restoringMagnitude(1),1);
  for (let i=0;i<=400;i++) assert.ok(restoringMagnitude(i/100)<=1);
  assert.throws(()=>restoringMagnitude(-1),RangeError);
  assert.throws(()=>equilibriumDisplacement(Infinity),RangeError);
});

test('illustrative separation preserves equilibrium and follows the linear restoring solution', async () => {
  const {separationStep} = await import('../web/scripts/demos/atomic-polarization.js');
  assert.equal(separationStep(0,0,0.1),0);
  assert.equal(separationStep(1,1,0.1),1);
  const dt=0.001, u=separationStep(0.2,0.6,dt);
  assert.ok(Math.abs(u-(0.6+(0.2-0.6)*Math.exp(-dt)))<1e-14);
  let escaped=1;
  for (let i=0;i<40;i++) {
    const next=separationStep(escaped,1.2,0.1);
    assert.ok(next>escaped);
    escaped=next;
  }
  assert.ok(escaped>2);
});

test('Gaussian sphere encloses negative cloud charge with a cubic volume fraction', async () => {
  const {enclosedChargeFraction,restoringMagnitude}=await import('../web/scripts/demos/atomic-polarization.js');
  assert.equal(enclosedChargeFraction(0),0);
  assert.equal(enclosedChargeFraction(0.5),-1/8);
  assert.equal(enclosedChargeFraction(1),-1);
  assert.equal(enclosedChargeFraction(2),-1);
  for (const u of [0.1,0.4,0.9,1.2]) {
    assert.ok(Math.abs(-enclosedChargeFraction(u)/(u*u)-restoringMagnitude(u))<1e-14);
  }
});

test('applied and cloud field vectors balance in equilibrium and diverge during separation', async () => {
  const {fieldVectors}=await import('../web/scripts/demos/atomic-polarization.js');
  assert.deepEqual(fieldVectors(0,0),{external:0,cloud:0});
  for (const u of [0.01,0.25,0.64,0.99]) {
    const fields=fieldVectors(u,u);
    assert.equal(fields.external,-fields.cloud);
    assert.ok(fields.external>0&&fields.cloud<0);
  }
  assert.deepEqual(fieldVectors(2,1.2),{external:1.2,cloud:-0.25});
  assert.ok(Math.abs(fieldVectors(3,1.2).cloud)<Math.abs(fieldVectors(2,1.2).cloud));
});
