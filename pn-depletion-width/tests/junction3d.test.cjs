// Run with: node pn-depletion-width/tests/junction3d.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const elements = new Map();
function element(id) {
  if (!elements.has(id)) elements.set(id, {
    textContent: '', disabled: false, value: '', listeners: {},
    addEventListener(name, listener) { this.listeners[name] = listener; },
    setAttribute(name, value) { this[name] = value; },
    get valueAsNumber() { return Number(this.value); },
    getContext() { return null; }
  });
  return elements.get(id);
}
const alerts = [];
const context = vm.createContext({
  console: { log() {}, error() {} },
  document: { getElementById: element, forms: { data: {
    f1: { value: '' }, f2: { value: '' },
    x1: { value: '0' }, x2: { value: '10' }
  } } },
  window: { addEventListener() {} },
  requestAnimationFrame() { return 1; },
  alert(message) { alerts.push(message); },
  $: Object.assign(() => ({}), { plot() {} })
});
for (const name of ['constants', 'mathUtils', 'dopingProfile',
  'depletionCalculations', 'junction3d', 'plotting', 'main']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', name + '.js'), 'utf8'), context);
}
const run = code => vm.runInContext(code, context);
run("loadPreset('abrupt')");
assert.equal(alerts.length, 0);
assert.equal(element('junction-voltage-slider').disabled, false);
let low = run('junctionWidthsAtVoltage(junctionView.samples, junctionView.samples[0].voltage)');
let high = run('junctionWidthsAtVoltage(junctionView.samples, junctionView.samples.at(-1).voltage)');
assert.ok(high.left + high.right > low.left + low.right);
assert.ok(Math.abs(run('junctionDepletion().pWidth - junctionDepletion().nWidth')) < 0.1);
// A voltage half-way between computed samples interpolates both spatial widths.
run('var a = junctionView.samples[10], b = junctionView.samples[11]; var mid = junctionWidthsAtVoltage(junctionView.samples, (a.voltage + b.voltage) / 2)');
assert.ok(run('Math.abs(mid.left - (a.left + b.left) / 2) < 1e-12'));
assert.ok(run('Math.abs(mid.right - (a.right + b.right) / 2) < 1e-12'));
// Entering an out-of-range voltage clamps both controls to the calculated range.
element('junction-voltage-number').value = '1e100';
element('junction-voltage-number').listeners.input();
assert.equal(run('junctionView.voltage'), high.voltage);
assert.equal(Number(element('junction-voltage-slider').value), high.voltage);
// Asymmetric junctions must extend farther into the less heavily doped material,
// including when the p- and n-sides swap their spatial orientation.
for (const [donor, acceptor] of [
  ['1E22*H(x-5)', '1E20*(1-H(x-5))'],
  ['1E22*(1-H(x-5))', '1E20*H(x-5)']
]) {
  context.document.forms.data.f1.value = donor;
  context.document.forms.data.f2.value = acceptor;
  run('plot()');
  assert.ok(run('junctionDepletion().pWidth > junctionDepletion().nWidth'));
}
run("loadPreset('graded')");
assert.equal(alerts.length, 0);
assert.ok(run('junctionView.data.net.some(n => n < 0) && junctionView.data.net.some(n => n > 0)'));
assert.ok(run('junctionView.samples.length > 0'));
// A profile without a junction still shows doping, but cannot leave stale depletion.
context.document.forms.data.f1.value = '1E20';
context.document.forms.data.f2.value = '0';
run('plot()');
assert.equal(element('junction-voltage-slider').disabled, true);
assert.equal(run('junctionDepletion()'), null);
assert.equal(element('junction-total-width').textContent, '-');
assert.ok(run('junctionView.data !== null'));
// Nonfinite concentrations, expression errors and reversed intervals clear the view.
for (const donor of ['1/0', 'badFunction(x)', '-1']) {
  context.document.forms.data.f1.value = donor;
  run('plot()');
  assert.equal(run('junctionView.data'), null);
  assert.equal(element('junction-voltage-number').disabled, true);
}
context.document.forms.data.x2.value = '-1';
run('plot()');
assert.equal(run('junctionView.data'), null);
console.log('PN junction integration checks passed.');
