const SIZE = 300, COOL = [88, 157, 218], MID = [34, 44, 56], WARM = [238, 144, 103];
const COLOR_LIMIT = 4, COLOR_SCALE = 0.15;
const COLOR_NORM = Math.asinh(COLOR_LIMIT / COLOR_SCALE);

export function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

export function panel(title, description, extent, unitName) {
  const box = element('div', '', 'qa-demo-panel');
  const canvas = element('canvas');
  canvas.width = canvas.height = SIZE;
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', description);
  box.append(element('div', title, 'qa-demo-panel-title'), canvas,
    element('div', `x/${unitName} and z/${unitName} from −${extent} to ${extent}`, 'qa-demo-axis'));
  const ctx = canvas.getContext('2d');
  const unit = SIZE / (2*extent);
  return {box, ctx, unit, x: x => SIZE/2+x*unit, z: z => SIZE/2-z*unit};
}

export function heatmap(plot, potential) {
  const {ctx, unit} = plot, image = ctx.createImageData(SIZE, SIZE);
  for (let row = 0, i = 0; row < SIZE; row++) {
    const z = (SIZE/2 - row - 0.5) / unit;
    for (let col = 0; col < SIZE; col++, i += 4) {
      const x = (col + 0.5 - SIZE/2) / unit;
      const v = potential(x, z);
      const t = Number.isFinite(v) ? Math.min(1, Math.abs(Math.asinh(v / COLOR_SCALE)) / COLOR_NORM) : 0;
      const end = v < 0 ? COOL : WARM;
      for (let channel = 0; channel < 3; channel++) {
        image.data[i+channel] = Number.isNaN(v) ? (row+col)%9 < 2 ? 61 : 42 : MID[channel] + t*(end[channel]-MID[channel]);
      }
      image.data[i+3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  ctx.beginPath();
  ctx.moveTo(0, SIZE/2); ctx.lineTo(SIZE, SIZE/2);
  ctx.moveTo(SIZE/2, 0); ctx.lineTo(SIZE/2, SIZE);
  ctx.strokeStyle = '#ffffff42'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#f0f3f7'; ctx.font = '13px sans-serif';
  ctx.fillText('z', SIZE/2+7, 16);
  ctx.fillText('x', SIZE-17, SIZE/2-7);
}

export function circle(plot, radius, dashed) {
  const {ctx, unit} = plot;
  ctx.beginPath();
  ctx.setLineDash(dashed ? [5, 4] : []);
  ctx.arc(SIZE/2, SIZE/2, radius*unit, 0, 2*Math.PI);
  ctx.strokeStyle = '#eee8d0'; ctx.lineWidth = 1.3; ctx.stroke();
  ctx.setLineDash([]);
}

export function sourceMark(plot, z, mark) {
  const {ctx, x, z: screenZ} = plot;
  ctx.beginPath();
  ctx.arc(x(0), screenZ(z), 8, 0, 2*Math.PI);
  ctx.fillStyle = '#18222d'; ctx.fill();
  ctx.strokeStyle = '#f0e6d3'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(mark, x(0), screenZ(z));
  ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
}

export function rangeControl(title, {min, max, step, value}) {
  const label = element('label', '', 'qa-demo-range');
  const line = element('span', '', 'qa-demo-range-label');
  const result = element('output');
  const input = element('input');
  input.type = 'range';
  input.setAttribute('aria-label', title);
  Object.assign(input, {min, max, step, value});
  line.append(element('span', title), result);
  label.append(line, input);
  return {label, input, result};
}

export function mount(host, controls, panels, readout, note) {
  const figures = element('div', '', 'qa-demo-panels');
  figures.append(...panels.map(p => p.box));
  const scale = element('div', '', 'qa-demo-color');
  scale.append(element('span', '−4'), element('span', '', 'qa-demo-gradient'),
    element('span', '+4'), element('span', 'V / V₀'));
  readout.setAttribute('aria-live', 'polite');
  host.replaceChildren(controls, figures, scale, readout, element('figcaption', note));
}

export function mountDemo(id, render) {
  if (typeof document === 'undefined') return;
  for (const host of document.querySelectorAll(`[data-qa-demo="${id}"]`)) render(host);
}
