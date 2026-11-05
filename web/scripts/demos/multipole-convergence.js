import {element, panel, heatmap, circle, sourceMark, rangeControl, mount, mountDemo} from './_plot.js';

// y = 0 sections of three-dimensional potentials, in fixed length units.
export function exactPotential(x, z) {
  return 2 / Math.hypot(x, z - 1) - 1 / Math.hypot(x, z + 1);
}

export function multipolePotential(x, z, order) {
  const r = Math.hypot(x, z);
  if (r <= 1) return NaN;
  const cos = z / r;
  let previous = 0, current = 1, inversePower = 1 / r, sum = 0;
  for (let n = 0; n <= order; n++) {
    sum += (n % 2 ? 3 : 1) * current * inversePower;
    const next = ((2*n+1)*cos*current - n*previous)/(n+1);
    previous = current;
    current = next;
    inversePower /= r;
  }
  return sum;
}

function approximation(host) {
  const {label, input, result} = rangeControl('Expansion order', {min: 0, max: 8, step: 1, value: 2});
  const extent = 3;
  const exact = panel('Exact Coulomb potential', 'Two point charges and their exact potential', extent, 'a');
  const approx = panel('Truncated expansion', 'Approximate potential outside the source circle', extent, 'a');
  const errors = element('p', '', 'qa-demo-readout');
  mount(host, label, [exact, approx], errors,
    'Shared nonlinear color scale. Solid circle: r = a. Dashed circle: r = 2a. Hatched region: the exterior series is not evaluated at r ≤ a.');
  const guides = plot => {
    circle(plot, 1, false); circle(plot, 2, true);
    sourceMark(plot, 1, '+'); sourceMark(plot, -1, '−');
  };
  heatmap(exact, exactPotential); guides(exact);

  function update() {
    const order = Number(input.value);
    result.value = `ℓ ≤ ${order}`;
    heatmap(approx, (x, z) => multipolePotential(x, z, order));
    guides(approx);
    const sum = [0, 0], count = [0, 0];
    for (let i = -59; i <= 59; i++) {
      for (let j = -59; j <= 59; j++) {
        const x = i/20, z = j/20, r = Math.hypot(x, z);
        if (r <= 1 || r > 3) continue;
        const region = r < 2 ? 0 : 1;
        sum[region] += (multipolePotential(x, z, order) - exactPotential(x, z))**2;
        count[region]++;
      }
    }
    const rms = sum.map((value, i) => Math.sqrt(value/count[i]).toPrecision(3));
    errors.textContent = `Sampled RMS error (V / V₀) · 1 < r/a < 2: ${rms[0]} · 2 ≤ r/a ≤ 3: ${rms[1]}`;
  }
  input.addEventListener('input', update);
  update();
}

mountDemo('multipole-convergence', approximation);
