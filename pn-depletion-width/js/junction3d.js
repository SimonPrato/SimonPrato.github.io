/**
 * Dependency-free, rotatable 3D view of the sampled semiconductor.
 * The existing solver stores LEFT widths in nSide and RIGHT widths in pSide,
 * irrespective of doping polarity. Adapt those spatial widths here, then use
 * the actual net doping to label the physical p- and n-sides.
 */
function junctionVoltageSamples(results) {
  if (!results) return [];
  const widths = results.depletionWidths;
  return widths.total.map((point, i) => ({
    voltage: point[1],
    left: widths.nSide[i][0],
    right: widths.pSide[i][0]
  })).filter(point => Number.isFinite(point.voltage) &&
    Number.isFinite(point.left) && Number.isFinite(point.right) &&
    point.left >= 0 && point.right >= 0)
    .sort((a, b) => a.voltage - b.voltage)
    .filter((point, i, points) => i === points.length - 1 ||
      point.voltage !== points[i + 1].voltage);
}

function junctionWidthsAtVoltage(samples, voltage) {
  if (!samples.length) return null;
  if (voltage <= samples[0].voltage) return samples[0];
  for (let i = 1; i < samples.length; i++) {
    if (voltage <= samples[i].voltage) {
      const a = samples[i - 1], b = samples[i];
      const t = (voltage - a.voltage) / (b.voltage - a.voltage);
      return { voltage, left: a.left + t * (b.left - a.left),
        right: a.right + t * (b.right - a.right) };
    }
  }
  return samples[samples.length - 1];
}

const junctionView = {
  data: null, samples: [], yaw: -0.38, pitch: 0.42,
  voltage: null, initialized: false, frame: null
};

function junctionElement(name) {
  return document.getElementById('junction-' + name);
}

function initializeJunction3D() {
  if (junctionView.initialized) return;
  junctionView.initialized = true;
  const canvas = junctionElement('canvas');
  const slider = junctionElement('voltage-slider');
  const number = junctionElement('voltage-number');
  const setVoltage = value => {
    if (!junctionView.samples.length || !Number.isFinite(value)) return;
    const samples = junctionView.samples;
    junctionView.voltage = Math.max(samples[0].voltage,
      Math.min(samples[samples.length - 1].voltage, value));
    slider.value = number.value = junctionView.voltage;
    updateJunctionMetrics();
    scheduleJunctionDraw();
  };
  slider.addEventListener('input', () => setVoltage(slider.valueAsNumber));
  number.addEventListener('input', () => setVoltage(number.valueAsNumber));
  number.addEventListener('change', () => {
    setVoltage(Number.isFinite(number.valueAsNumber) ?
      number.valueAsNumber : junctionView.voltage);
  });
  junctionElement('reset').addEventListener('click', () => {
    junctionView.yaw = -0.38;
    junctionView.pitch = 0.42;
    scheduleJunctionDraw();
  });
  let drag = null;
  canvas.addEventListener('pointerdown', event => {
    drag = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', event => {
    if (!drag) return;
    junctionView.yaw += (event.clientX - drag.x) * 0.008;
    junctionView.pitch = Math.max(-1.1, Math.min(1.1,
      junctionView.pitch + (event.clientY - drag.y) * 0.008));
    drag = { x: event.clientX, y: event.clientY };
    scheduleJunctionDraw();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });
  canvas.addEventListener('pointercancel', () => { drag = null; });
  canvas.addEventListener('lostpointercapture', () => { drag = null; });
  canvas.addEventListener('keydown', event => {
    const directions = { ArrowLeft: [-0.08, 0], ArrowRight: [0.08, 0],
      ArrowUp: [0, -0.08], ArrowDown: [0, 0.08] };
    if (!directions[event.key]) return;
    event.preventDefault();
    junctionView.yaw += directions[event.key][0];
    junctionView.pitch = Math.max(-1.1, Math.min(1.1,
      junctionView.pitch + directions[event.key][1]));
    scheduleJunctionDraw();
  });
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(scheduleJunctionDraw).observe(canvas);
  } else {
    window.addEventListener('resize', scheduleJunctionDraw);
  }
}

function clearJunction3D(message) {
  initializeJunction3D();
  junctionView.data = null;
  junctionView.samples = [];
  junctionElement('status').textContent = message;
  for (const name of ['voltage-number', 'voltage-slider']) {
    junctionElement(name).disabled = true;
  }
  for (const name of ['p-width', 'n-width', 'total-width']) {
    junctionElement(name).textContent = '—';
  }
  junctionElement('range').textContent = '';
  junctionElement('color-scale').textContent = '';
  scheduleJunctionDraw();
}

function updateJunction3D(results, donor, acceptor) {
  initializeJunction3D();
  const net = donor.map((point, i) => point[1] - acceptor[i][1]);
  const max = Math.max(...net.map(Math.abs));
  junctionView.data = { donor, net, max, results,
    x1: donor[0][0], x2: donor[donor.length - 1][0] };
  junctionView.samples = junctionVoltageSamples(results);
  const samples = junctionView.samples;
  junctionElement('status').textContent = samples.length ? '' :
    'Doping profile only. A single PN junction with a valid voltage curve is required to show depletion.';
  junctionElement('color-scale').textContent = 'Color scale: ±' +
    max.toExponential(2) + ' m⁻³';
  for (const name of ['voltage-number', 'voltage-slider']) {
    const input = junctionElement(name);
    input.disabled = !samples.length;
    if (samples.length) {
      input.min = samples[0].voltage;
      input.max = samples[samples.length - 1].voltage;
      const initial = junctionView.voltage === null ? 1 : junctionView.voltage;
      junctionView.voltage = Math.max(Number(input.min), Math.min(Number(input.max), initial));
      input.value = junctionView.voltage;
    }
  }
  junctionElement('range').textContent = samples.length ?
    'Calculated range: ' + samples[0].voltage.toPrecision(3) + '–' +
    samples[samples.length - 1].voltage.toPrecision(3) + ' V' : '';
  updateJunctionMetrics();
  scheduleJunctionDraw();
}

function junctionDepletion() {
  const data = junctionView.data;
  const widths = junctionWidthsAtVoltage(junctionView.samples, junctionView.voltage);
  if (!data || !widths) return null;
  const index = data.results.junctionIndex;
  // Match the solver's discrete spatial reference rather than recalculate widths.
  const center = data.donor[index][0];
  const leftNet = data.net.slice(0, index).find(value => value !== 0);
  return { center, left: center - widths.left, right: center + widths.right,
    pWidth: leftNet < 0 ? widths.left : widths.right,
    nWidth: leftNet < 0 ? widths.right : widths.left,
    total: widths.left + widths.right };
}

function updateJunctionMetrics() {
  const region = junctionDepletion();
  for (const [name, value] of [
    ['p-width', region && region.pWidth], ['n-width', region && region.nWidth],
    ['total-width', region && region.total]
  ]) junctionElement(name).textContent = region ? value.toFixed(3) + ' µm' : '—';
  if (region) junctionElement('canvas').setAttribute('aria-label',
    'Rotatable PN junction at ' + junctionView.voltage.toPrecision(4) +
    ' volts. Depletion width ' + region.total.toFixed(3) + ' micrometers.');
}

function scheduleJunctionDraw() {
  if (junctionView.frame !== null) return;
  junctionView.frame = requestAnimationFrame(() => {
    junctionView.frame = null;
    drawJunction3D();
  });
}

function junctionDopingColor(value, max, shade, depleted) {
  const t = max > 0 ? Math.min(1, Math.abs(value) / max) : 0;
  const pale = [235, 239, 246];
  const saturated = value < 0 ? [225, 72, 110] : [43, 118, 230];
  const gold = [255, 207, 85];
  return 'rgb(' + pale.map((channel, i) => {
    const color = (channel + (saturated[i] - channel) * t) * shade;
    return Math.round(depleted ? color * .76 + gold[i] * .24 : color);
  }).join(',') + ')';
}

function drawJunction3D() {
  const canvas = junctionElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    junctionElement('status').textContent = 'This browser cannot display the 3D view.';
    return;
  }
  const width = canvas.clientWidth || 600, height = canvas.clientHeight || 390;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const data = junctionView.data;
  if (!data) return;
  const region = junctionDepletion();
  const scale = Math.min(width / 7.8, height / 4.8);
  const cy = Math.cos(junctionView.yaw), sy = Math.sin(junctionView.yaw);
  const cp = Math.cos(junctionView.pitch), sp = Math.sin(junctionView.pitch);
  const project = point => {
    const x = point[0] * cy + point[2] * sy;
    const z = -point[0] * sy + point[2] * cy;
    const y = point[1] * cp - z * sp;
    const depth = point[1] * sp + z * cp;
    return { x: width / 2 + x * scale, y: height / 2 - y * scale, depth };
  };
  const modelX = x => -2.8 + 5.6 * (x - data.x1) / (data.x2 - data.x1);
  const polygon = points => {
    ctx.beginPath();
    points.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
    ctx.closePath();
  };
  ctx.save();
  ctx.translate(width / 2, height / 2 + scale * 1.05);
  ctx.scale(1, 0.2);
  const shadow = ctx.createRadialGradient(0, 0, 0, 0, 0, scale * 3);
  shadow.addColorStop(0, 'rgba(20,35,65,0.20)');
  shadow.addColorStop(1, 'rgba(20,35,65,0)');
  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.arc(0, 0, scale * 3, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
  const faces = [];
  const addFace = (vertices, value, shade, depleted) => {
    const points = vertices.map(project);
    faces.push({ points, value, shade, depleted,
      depth: points.reduce((sum, p) => sum + p.depth, 0) / points.length });
  };
  // Colored strips across every outer face form a true 3D cuboid.
  // Split strips at depletion boundaries so the overlay follows sub-sample widths.
  for (let i = 0; i < data.donor.length - 1; i++) {
    const a = data.donor[i][0], b = data.donor[i + 1][0];
    const cuts = [a, b];
    if (region) for (const edge of [region.left, region.right]) {
      if (edge > a && edge < b) cuts.push(edge);
    }
    cuts.sort((x, y) => x - y);
    for (let j = 0; j < cuts.length - 1; j++) {
      const l = modelX(cuts[j]), r = modelX(cuts[j + 1]);
      const mid = (cuts[j] + cuts[j + 1]) / 2;
      const t = (mid - a) / (b - a);
      const net = data.net[i] * (1 - t) + data.net[i + 1] * t;
      const depleted = region && mid >= region.left && mid <= region.right;
      addFace([[l,.65,.65],[r,.65,.65],[r,-.65,.65],[l,-.65,.65]], net, .89, depleted);
      addFace([[l,.65,-.65],[r,.65,-.65],[r,-.65,-.65],[l,-.65,-.65]], net, .80, depleted);
      addFace([[l,.65,-.65],[r,.65,-.65],[r,.65,.65],[l,.65,.65]], net, 1, depleted);
      addFace([[l,-.65,-.65],[r,-.65,-.65],[r,-.65,.65],[l,-.65,.65]], net, .72, depleted);
    }
  }
  for (const i of [0, data.donor.length - 1]) {
    const x = modelX(data.donor[i][0]);
    addFace([[x,.65,-.65],[x,.65,.65],[x,-.65,.65],[x,-.65,-.65]],
      data.net[i], .78, region && data.donor[i][0] >= region.left &&
        data.donor[i][0] <= region.right);
  }
  faces.sort((a, b) => a.depth - b.depth);
  for (const face of faces) {
    polygon(face.points);
    ctx.fillStyle = junctionDopingColor(face.value, data.max, face.shade, face.depleted);
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth = .65;
    ctx.fill();
    ctx.stroke();
  }
  const ring = (x, color, dashed) => {
    polygon([[x,.65,-.65],[x,.65,.65],[x,-.65,.65],[x,-.65,-.65]].map(project));
    ctx.strokeStyle = color;
    ctx.lineWidth = dashed ? 1.5 : 2.5;
    ctx.setLineDash(dashed ? [4, 4] : []);
    ctx.stroke();
    ctx.setLineDash([]);
  };
  if (region) {
    ring(modelX(region.center), 'rgba(31,42,66,0.65)', true);
    ring(modelX(region.left), '#b77912', false);
    ring(modelX(region.right), '#b77912', false);
    const a = project([modelX(region.left), -.95, .65]);
    const b = project([modelX(region.right), -.95, .65]);
    ctx.strokeStyle = '#b77912';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    ctx.fillStyle = '#77510e';
    ctx.font = '600 13px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Depletion region · W = ' + region.total.toFixed(3) + ' µm',
      width / 2, height - 48);
  }
  ctx.font = '600 13px Arial, sans-serif';
  ctx.textAlign = 'center';
  for (const [i, x] of [[0, -2.8], [data.net.length - 1, 2.8]]) {
    const position = project([x, 1.02, 0]);
    ctx.fillStyle = data.net[i] < 0 ? '#b83a61' : data.net[i] > 0 ? '#2869bc' : '#536279';
    ctx.fillText((data.net[i] < 0 ? 'p-type' : data.net[i] > 0 ? 'n-type' : 'Compensated') +
      ' · ' + data.donor[i][0].toPrecision(3) + ' µm', position.x, position.y);
  }
}
