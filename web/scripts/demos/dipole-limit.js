import {element, panel, heatmap, sourceMark, rangeControl, mount, mountDemo} from './_plot.js';

function dipoleGeometry(x, z, separation) {
  const top = z - separation / 2, bottom = z + separation / 2;
  const positive = Math.hypot(x, top), negative = Math.hypot(x, bottom);
  return {top, bottom, positive, negative};
}

export function dipolePotential(x, z, separation) {
  const {positive, negative} = dipoleGeometry(x, z, separation);
  // Rationalized difference of Coulomb terms with q = p/d. Valid at d = 0 too.
  return 2*z / (positive * negative * (positive + negative));
}

export function dipoleField(x, z, separation) {
  const {top, bottom, positive: a, negative: b} = dipoleGeometry(x, z, separation);
  const factor = 1 / (a*b*(a+b)), potential = 2*z*factor;
  return [
    potential*x*(1/(a*a) + 1/(b*b) + 1/(a*b)),
    potential*(top/(a*a) + bottom/(b*b) + (top/a+bottom/b)/(a+b)) - 2*factor,
  ];
}

function trace(seed, sign, separation, extent) {
  let x = seed, z = 0;
  const points = [];
  const direction = (x, z) => {
    const [ex, ez] = dipoleField(x, z, separation), length = Math.hypot(ex, ez);
    return [sign*ex/length, sign*ez/length];
  };
  for (let i = 0; i < 700; i++) {
    const {positive, negative} = dipoleGeometry(x, z, separation);
    const distance = Math.min(positive, negative);
    if (distance < 0.024 || Math.max(Math.abs(x), Math.abs(z)) > extent) break;
    points.push([x, z]);
    const step = Math.min(0.03, distance*0.22);
    const [dx, dz] = direction(x, z);
    const [mx, mz] = direction(x+dx*step/2, z+dz*step/2);
    if (!Number.isFinite(mx+mz)) break;
    x += step*mx; z += step*mz;
  }
  return points;
}

function drawDipole(plot, separation, extent) {
  heatmap(plot, (x, z) => dipolePotential(x, z, separation));
  const {ctx, x, z} = plot;
  for (const side of [-1, 1]) {
    for (const distance of [0.21, 0.36, 0.58, 0.9, 1.35, 1.95, 2.42]) {
      const seed = side*distance;
      const points = [...trace(seed, -1, separation, extent).reverse(), ...trace(seed, 1, separation, extent)];
      ctx.beginPath();
      points.forEach(([px, pz], i) => i ? ctx.lineTo(x(px), z(pz)) : ctx.moveTo(x(px), z(pz)));
      ctx.lineWidth = 2.8; ctx.strokeStyle = '#111924'; ctx.stroke();
      ctx.lineWidth = 1.05; ctx.strokeStyle = '#f6f6ed'; ctx.stroke();
      // E points along −z at every nonzero equatorial seed.
      ctx.beginPath();
      ctx.moveTo(x(seed)-3, z(0)-3); ctx.lineTo(x(seed), z(0)+3); ctx.lineTo(x(seed)+3, z(0)-3);
      ctx.stroke();
    }
  }
  if (separation > 0.19) {
    sourceMark(plot, separation/2, '+');
    sourceMark(plot, -separation/2, '−');
  } else {
    sourceMark(plot, 0, separation ? '±' : 'p');
  }
}

function convergence(host) {
  const extent = 2.5;
  const {label, input, result} = rangeControl('Charge separation (d / L)', {min: 0, max: 1.6, step: 0.02, value: 1});
  const controls = element('div', '', 'qa-demo-controls');
  const play = element('button', 'Play convergence');
  play.type = 'button';
  controls.append(label, play);
  const finite = panel('Moving charge pair', 'Potential and electric field lines as the charge separation changes', extent, 'L');
  const ideal = panel('Ideal dipole · fixed reference', 'Potential and electric field lines of an ideal point dipole', extent, 'L');
  const probe = element('p', '', 'qa-demo-readout');
  mount(host, controls, [finite, ideal], probe,
    'Same dipole moment, length scale, and nonlinear colors in both panels. Arrows give the field direction. Line spacing does not measure field strength. Point sources are singular.');
  drawDipole(ideal, 0, extent);
  let frame = null, previous = -1;

  function update() {
    const separation = Number(input.value);
    if (separation === previous) return;
    previous = separation;
    result.value = separation ? separation.toFixed(2) : '0 · ideal limit';
    drawDipole(finite, separation, extent);
    const sample = dipolePotential(0, 2, separation), limit = dipolePotential(0, 2, 0);
    probe.textContent = `At (x/L, z/L) = (0, 2): V/V₀ = ${sample.toFixed(5)} · ideal = ${limit.toFixed(5)}`
      + (separation ? ` · charge magnitude q/(p/L) = ${(1/separation).toFixed(2)}` : ' · point-dipole limit');
  }

  function pause() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    play.textContent = 'Play convergence';
  }
  input.addEventListener('input', () => {pause(); update();});
  play.addEventListener('click', () => {
    if (frame !== null) {pause(); return;}
    const start = Number(input.value) || 1;
    const started = performance.now();
    play.textContent = 'Pause';
    function tick(now) {
      const remaining = Math.max(0, 1-(now-started)/5500);
      input.value = String(Math.round(start*remaining*50)/50);
      update();
      if (remaining > 0) frame = requestAnimationFrame(tick);
      else pause();
    }
    frame = requestAnimationFrame(tick);
  });
  update();
}

mountDemo('dipole-limit', convergence);
