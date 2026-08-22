'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { loadFunctions } = require('./harness');
function gateFn() {
  const window = { EITI_ALLOWED_STATES: ['Validated','Supported','ImmutableCore'] };
  return loadFunctions(['_eitiFactPassesStrictAdmission'], { window })._eitiFactPassesStrictAdmission;
}
test('missing confidence fails closed', () => {
  assert.strictEqual(gateFn()({epistemic_state:'Validated',authority:'ExternallyVerified',evidence_status:'verified',provenance:'src:1'}), false);
});
test('manual Supported without provenance fails closed', () => {
  assert.strictEqual(gateFn()({epistemic_state:'Supported',confidence:0.9,authority:'UserAsserted',evidence_status:'supported'}), false);
});
test('Guardian PASS is not epistemic evidence', () => {
  assert.strictEqual(gateFn()({epistemic_state:'Supported',confidence:0.9,guardian_verified:1,authority:'UserAsserted'}), false);
});
test('L3 Hypothesized remains inadmissible', () => {
  assert.strictEqual(gateFn()({epistemic_state:'Hypothesized',memory_layer:'L3',confidence:0.99,authority:'ExternallyVerified',evidence_status:'verified',provenance:'src:2'}), false);
});
test('evidence-backed externally verified Validated fact passes', () => {
  assert.strictEqual(gateFn()({epistemic_state:'Validated',confidence:0.8,authority:'ExternallyVerified',evidence_status:'verified',provenance:'src:3'}), true);
});
