import {element, rangeControl, mountDemo} from './_plot.js';

const ID = 'bound-charge-crossing';
const SVG = 'http://www.w3.org/2000/svg';
const WIDTH = 3;
const AREA = WIDTH ** 2; // In units of ℓ². Number density is 1/ℓ³.
const MAX_SHIFT = 2.5;
const INITIAL_SHIFT = 1.25;
let sceneCount = 0;

export function crossingQuantities(shift) {
  const volume = AREA * shift;
  return {volume, pairs: volume, charge: volume, moment: shift, normalPolarization: shift};
}

const STYLE = `
[data-qa-demo="${ID}"] .crossing-scene{max-width:660px;margin:8px auto 0}
[data-qa-demo="${ID}"] svg{display:block;width:100%;height:auto;font-family:inherit}
[data-qa-demo="${ID}"] .qa-demo-controls{max-width:660px;margin:0 auto}
[data-qa-demo="${ID}"] .crossing-buttons{display:flex;gap:8px}
[data-qa-demo="${ID}"] .crossing-legend,[data-qa-demo="${ID}"] .crossing-values{
  display:flex;justify-content:center;flex-wrap:wrap;gap:4px 18px;margin:8px 0;
  font-size:14px;font-variant-numeric:tabular-nums
}
[data-qa-demo="${ID}"] .crossing-legend .crossing-positive{color:#ffc995}
[data-qa-demo="${ID}"] .crossing-legend .crossing-negative{color:#afcee8}
[data-qa-demo="${ID}"] .crossing-values span{white-space:nowrap}
[data-qa-demo="${ID}"] figcaption{text-align:center}
`;

function svg(tag, attributes = {}, text) {
  const node = document.createElementNS(SVG, tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

// Fixed oblique projection of a rectangular solid. Larger y is farther away.
function project([x, y, z]) {
  return [306 + 66 * x + 28 * y, 237 - 23 * y - 41 * z];
}

function polygon(points, attributes) {
  return svg('polygon', {...attributes, points: points.map(point => project(point).join(',')).join(' ')});
}

function pathLine(x1, y1, x2, y2) {
  return `M ${x1} ${y1} L ${x2} ${y2}`;
}

function label(x, y, text, attributes = {}) {
  return svg('text', {x, y, fill: '#e9edf3', 'font-size': 23, 'text-anchor': 'middle', ...attributes}, text);
}

function section(x, attributes) {
  return polygon([[x, 0, 0], [x, WIDTH, 0], [x, WIDTH, WIDTH], [x, 0, WIDTH]], attributes);
}

function cuboid(left, right, colors) {
  const w = WIDTH;
  return [
    section(left, {fill: colors.far, stroke: colors.edge}),
    polygon([[left,w,0],[right,w,0],[right,w,w],[left,w,w]], {fill: colors.far, stroke: colors.edge}),
    polygon([[left,0,0],[right,0,0],[right,w,0],[left,w,0]], {fill: colors.floor, stroke: colors.edge}),
    polygon([[left,0,w],[right,0,w],[right,w,w],[left,w,w]], {fill: colors.top, stroke: colors.edge}),
    polygon([[left,0,0],[right,0,0],[right,0,w],[left,0,w]], {fill: colors.front, stroke: colors.edge}),
    section(right, {fill: 'none', stroke: colors.edge}),
  ];
}

function sampleCharges(group, shift) {
  // Offset + and − glyphs on screen so that coincident signs remain visible.
  for (const depth of [2.5, 1.5, 0.5]) {
    const nearness = (WIDTH - depth) / WIDTH;
    const opacity = 0.44 + 0.52 * nearness;
    const radius = 4.8 + 1.2 * nearness;
    for (const height of [0.65, 2.1]) {
      for (const origin of [-2.75, -1.65, -0.55, 0.8]) {
        const [from, center] = project([origin, depth, height]);
        const [to] = project([origin + shift, depth, height]);
        const crosses = origin < 0 && origin + shift > 0;
        const y = center - 5;
        if (crosses) group.append(svg('path', {
          d: pathLine(from, y, to, y), stroke: '#e4af75',
          'stroke-dasharray': '3 4', 'stroke-opacity': opacity * 0.8,
        }));
        group.append(
          svg('path', {
            d: pathLine(from - 4, center + 5, from + 4, center + 5),
            stroke: '#b5d6f1', 'stroke-width': 2, 'stroke-opacity': opacity,
          }),
          svg('circle', {
            cx: to, cy: y, r: radius, stroke: '#f4bf8b', 'stroke-width': 1.4,
            fill: crosses ? '#f4bf8b' : '#2f3039', opacity,
          }),
          svg('path', {
            d: pathLine(to - 2.7, y, to + 2.7, y) + ' ' + pathLine(to, y - 2.7, to, y + 2.7),
            stroke: crosses ? '#25242b' : '#ffd4ae', 'stroke-width': 1.2, opacity,
          }),
        );
      }
    }
  }
}

function depthGradient(id, nearY, farY, near, far) {
  const gradient = svg('linearGradient', {id, gradientUnits: 'userSpaceOnUse', x1: 0, x2: 0, y1: nearY, y2: farY});
  gradient.append(svg('stop', {offset: '0%', 'stop-color': near, 'stop-opacity': 0.27}),
    svg('stop', {offset: '100%', 'stop-color': far, 'stop-opacity': 0.08}));
  return gradient;
}

function draw(scene, shift, gradientId) {
  const material = {far:'#c0d6ee0a', floor:'#42708b1a', top:'#8fbbdd13', front:'#8fbbdd0a', edge:'#91aac266'};
  const startingLayer = {far:'#ffe9c61e', floor:`url(#${gradientId}-floor)`, top:`url(#${gradientId}-top)`,
    front:'#e2a66853', edge:'#e6b77b82'};
  const defs = svg('defs');
  defs.append(depthGradient(gradientId + '-top', 114, 45, '#e9ac72', '#fff1d6'),
    depthGradient(gradientId + '-floor', 237, 168, '#e9ac72', '#fff1d6'));
  scene.replaceChildren(defs, ...cuboid(-3.55, 3.55, material));
  if (shift > 0) scene.append(...cuboid(-shift, 0, startingLayer));

  scene.append(section(0, {fill:'#8bbfef24', stroke:'#a9d1fa40'}));
  const samples = svg('g');
  sampleCharges(samples, shift);
  scene.append(samples, section(0, {fill:'none', stroke:'#b8dbf4', 'stroke-width':1.6, 'stroke-dasharray':'5 4'}));

  const [cutX, cutY] = project([0, 1.5, WIDTH]);
  scene.append(label(cutX, cutY - 11, 'Fixed cut · A'));

  const [left] = project([-shift, 0, 0]);
  const [right] = project([0, 0, 0]);
  if (shift > 0) {
    scene.append(svg('path', {
      d: `M ${left} 246 v 8 H ${right} v -8`, fill: 'none', stroke: '#e7b47d',
      'stroke-width': 1.4,
    }));
  }
  scene.append(
    label((left + right) / 2, 278, 'd', {fill:'#f4c899'}),
    svg('path', {
      d: 'M 451 254 H 515 m -8 -5 l 8 5 -8 5',
      fill: 'none', stroke: '#b8dbf4', 'stroke-width': 1.6,
    }),
    label(483, 278, 'n̂', {fill:'#b8dbf4'}),
  );
  scene.setAttribute('aria-label', `Dielectric block with fixed area A and rightward normal n. Positive charges shift by ${shift.toFixed(2)} lattice lengths while negative charges are fixed. The tinted layer marks possible starting points of crossings.`);
}

export function render(host) {
  const {label: slider, input, result} = rangeControl('Displacement d / ℓ', {
    min: 0, max: 100, step: 1, value: INITIAL_SHIFT * 40,
  });
  const play = element('button', 'Play');
  const reset = element('button', 'Reset');
  play.type = reset.type = 'button';
  play.setAttribute('aria-pressed', 'false');

  const controls = element('div', '', 'qa-demo-controls');
  const buttons = element('div', '', 'crossing-buttons');
  buttons.append(play, reset);
  controls.append(slider, buttons);

  const picture = element('div', '', 'crossing-scene');
  const scene = svg('svg', {viewBox:'40 -4 620 292', role:'img'});
  const gradientId = `${ID}-${++sceneCount}`;
  picture.append(scene);
  const legend = element('div', '', 'crossing-legend');
  legend.append(element('span', '−q  Fixed', 'crossing-negative'),
    element('span', '＋q  Moving · filled after crossing', 'crossing-positive'));

  const readout = element('div', '', 'crossing-values');
  const geometry = element('span');
  const crossing = element('span');
  const moments = element('span');
  readout.append(geometry, crossing, moments);
  const note = element('figcaption', 'A = 9 ℓ² · n = 1/ℓ³. Markers show sample pairs. Readouts use the continuous model.');
  host.replaceChildren(element('style', STYLE), picture, legend, readout, controls, note);

  let frame = null;
  function update() {
    const shift = Number(input.value) / 40;
    const values = crossingQuantities(shift);
    const format = number => number.toFixed(2);
    result.value = format(shift);
    input.setAttribute('aria-valuetext', format(shift) + ' times the length unit');
    geometry.textContent = `Ad / ℓ³ = ${format(values.volume)}`;
    crossing.textContent = `nAd = Qcross / q = ${format(values.charge)}`;
    moments.textContent = `p / (qℓ) = (P · n̂) / (q/ℓ²) = ${format(values.normalPolarization)}`;
    host.dataset.displacement = String(shift);
    draw(scene, shift, gradientId);
  }

  function pause() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    play.textContent = 'Play';
    play.setAttribute('aria-pressed', 'false');
  }

  input.addEventListener('input', () => { pause(); update(); });
  reset.addEventListener('click', () => { pause(); input.value = '0'; update(); });
  play.addEventListener('click', () => {
    if (frame !== null) { pause(); return; }
    if (Number(input.value) === MAX_SHIFT * 40) input.value = '0';
    const from = Number(input.value);
    const start = performance.now();
    play.textContent = 'Pause';
    play.setAttribute('aria-pressed', 'true');

    function tick(now) {
      if (!host.isConnected) { pause(); return; }
      const position = Math.min(MAX_SHIFT * 40, Math.round(from + (now - start) / 45));
      if (position !== Number(input.value)) {
        input.value = String(position);
        update();
      }
      if (position < MAX_SHIFT * 40) frame = requestAnimationFrame(tick);
      else pause();
    }

    frame = requestAnimationFrame(tick);
    update();
  });
  update();
}

mountDemo(ID, render);

