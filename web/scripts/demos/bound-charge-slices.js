import {element, mountDemo, rangeControl} from './_plot.js';

const ID = 'bound-charge-slices';
const NS = 'http://www.w3.org/2000/svg';
const POSITIVE = '#ffc995';
const NEGATIVE = '#afcee8';
const NORMAL = '#aebac8';

// P points along +x, has mean P₀, and changes by gradient × P₀ across length L.
export function polarizationProfile(gradient) {
  const at = fraction => 1 + gradient * (fraction - 0.5);
  return {
    at,
    surfaceLeft: -at(0),
    surfaceRight: at(1),
    divergence: gradient,
    volumeCharge: gradient === 0 ? 0 : -gradient,
  };
}

const STYLE = `
[data-qa-demo="${ID}"] .bound-field-picture{max-width:680px;margin:5px auto 0}
[data-qa-demo="${ID}"] svg{width:100%;height:auto;display:block;font-family:inherit}
[data-qa-demo="${ID}"] .qa-demo-controls{max-width:680px;margin:0 auto}
[data-qa-demo="${ID}"] .bound-readouts{
  display:flex;flex-wrap:wrap;justify-content:center;gap:10px 32px;margin:5px 0 14px;
  text-align:center;font-size:14px;font-variant-numeric:tabular-nums
}
[data-qa-demo="${ID}"] .bound-readouts strong,[data-qa-demo="${ID}"] .bound-readouts span{display:block}
[data-qa-demo="${ID}"] .bound-readouts span{margin-top:4px}
[data-qa-demo="${ID}"] figcaption{text-align:center}
`;

function svg(tag, attrs, text) {
  const node = document.createElementNS(NS, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

function label(x, y, text, fill = '#e9edf3') {
  return svg('text', {x,y,fill,'font-size':25,'text-anchor':'middle'},text);
}

function arrow(x1, x2, y, stroke) {
  const head = (x2 > x1 ? -1 : 1) * 9;
  return svg('path', {
    d:`M ${x1} ${y} H ${x2} m ${head} -5 l ${-head} 5 ${head} 5`,
    fill:'none',stroke,'stroke-width':2.6,'stroke-linecap':'round','stroke-linejoin':'round',
  });
}

const LEFT = 89, RIGHT = 490, DEPTH = 50, RISE = 34, TOP = 81, BOTTOM = 169;
const WIDTH = RIGHT - LEFT;
const EDGES = '#92acc786';

function surface(x, charge) {
  const color = charge > 0 ? POSITIVE : NEGATIVE;
  const group = svg('g', {'data-surface-charge':charge});
  group.append(svg('path', {
    d:`M ${x} ${TOP} l ${DEPTH} ${-RISE} V ${BOTTOM-RISE} l ${-DEPTH} ${RISE} Z`,
    fill:color,'fill-opacity':0.12 + 0.13 * Math.abs(charge),
    stroke:color,'stroke-opacity':0.78,'stroke-width':1.4,
  }));
  for (const y of [100,134]) {
    group.append(label(x + DEPTH / 2, y, charge > 0 ? '+' : '−', color));
  }
  return group;
}

function bulkCharges(rho) {
  const group = svg('g', {'data-volume-charge':rho});
  if (rho === 0) {
    group.append(label((LEFT + RIGHT + DEPTH) / 2, 149, 'ρᵦ = 0', NORMAL));
    return group;
  }

  const color = rho > 0 ? POSITIVE : NEGATIVE;
  group.setAttribute('opacity', 0.38 + 0.36 * Math.abs(rho));
  // Distribute the signs at two depths within the translucent block.
  for (const depth of [0.84,0.26]) {
    for (let i = 0; i < 7; i++) {
      const x = LEFT + (i + 0.65) * WIDTH / 7 + depth * DEPTH;
      group.append(label(x, 161 - depth * RISE, rho > 0 ? '+' : '−', color));
    }
  }
  return group;
}

function draw(scene, profile) {
  const {at,surfaceLeft,surfaceRight,volumeCharge} = profile;
  const color = volumeCharge > 0 ? POSITIVE : NEGATIVE;
  const fillOpacity = 0.085 * Math.abs(volumeCharge);
  scene.replaceChildren(
    svg('path', {d:`M ${LEFT} ${TOP} l ${DEPTH} ${-RISE} h ${WIDTH} l ${-DEPTH} ${RISE} Z`,
      fill:'#8fbbdd24',stroke:EDGES}),
    svg('rect', {x:LEFT,y:TOP,width:WIDTH,height:BOTTOM-TOP,fill:'#8fbbdd10',stroke:EDGES}),
    svg('rect', {x:LEFT,y:TOP,width:WIDTH,height:BOTTOM-TOP,fill:color,'fill-opacity':fillOpacity}),
    bulkCharges(volumeCharge),
    surface(LEFT, surfaceLeft),
    surface(RIGHT, surfaceRight),
    label((LEFT + RIGHT + DEPTH) / 2, 35, 'Polarization P'),
    label(60, 86, 'σᵦ', NEGATIVE),
    label(566, 86, 'σᵦ', POSITIVE),
    arrow(LEFT + 12, LEFT - 36, 194, NORMAL),
    arrow(RIGHT + 13, RIGHT + 61, 194, NORMAL),
    label(LEFT - 12, 221, 'n̂', NORMAL),
    label(RIGHT + 37, 221, 'n̂', NORMAL),
  );
  for (let i = 0; i < 5; i++) {
    const fraction = (i + 0.5) / 5;
    const center = LEFT + WIDTH * fraction + DEPTH / 2;
    const halfLength = 20 * at(fraction);
    const vector = arrow(center - halfLength, center + halfLength, 95, '#e9edf3');
    vector.setAttribute('data-polarization', at(fraction));
    scene.append(vector);
  }
  scene.setAttribute('aria-label', 'Dielectric slab with polarization arrows toward the right and outward normals on its end faces. Warm plus signs show positive bound charge. Cool minus signs show negative bound charge.');
}

function formatSigned(number) {
  if (number === 0) return '0';
  return (number > 0 ? '+' : '−') + Math.abs(number).toFixed(2);
}

export function render(host) {
  const {label: slider,input,result} = rangeControl('Right minus left Pₓ / P₀', {
    min:-24,max:24,step:1,value:0,
  });
  const reset = element('button','Reset');
  reset.type = 'button';
  const controls = element('div','','qa-demo-controls');
  controls.append(slider,reset);

  const picture = element('div','','bound-field-picture');
  const scene = svg('svg',{viewBox:'22 12 574 217',role:'img'});
  picture.append(scene);
  const readouts = element('div','','bound-readouts');
  readouts.setAttribute('aria-live','polite');
  const surfaceValue = element('span');
  const bulkValue = element('span');
  const surfaceReadout = element('div');
  surfaceReadout.append(element('strong','Surface: σᵦ = P · n̂'),surfaceValue);
  const bulkReadout = element('div');
  bulkReadout.append(element('strong','Bulk: ρᵦ = −∇·P'),bulkValue);
  readouts.append(surfaceReadout,bulkReadout);
  const note = element('figcaption','Arrow length shows Pₓ. L is the slab length and P₀ is the mean polarization.');
  host.replaceChildren(element('style',STYLE),picture,readouts,controls,note);

  function update() {
    const gradient = Number(input.value) / 20;
    const profile = polarizationProfile(gradient);
    result.value = gradient === 0 ? '0 · Uniform' : formatSigned(gradient);
    input.setAttribute('aria-valuetext', result.value);
    surfaceValue.textContent = `Left ${formatSigned(profile.surfaceLeft)} · Right ${formatSigned(profile.surfaceRight)} (P₀)`;
    bulkValue.textContent = `∇·P ${formatSigned(profile.divergence)} · ρᵦ ${formatSigned(profile.volumeCharge)} (P₀/L)`;
    host.dataset.gradient = String(gradient);
    draw(scene,profile);
  }
  input.addEventListener('input',update);
  reset.addEventListener('click',() => {input.value = '0';update();});
  update();
}

mountDemo(ID,render);

