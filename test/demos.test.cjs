'use strict';
const assert = require('node:assert/strict');
const test = require('node:test');

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
