'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { loadFunctions } = require('./harness');
function makeApply() {
  const state = { kbWrites: 0, vbWrites: 0, moscWrites: 0, cfgWrites: 0, replies: [], window: {} };
  const sb = loadFunctions(['eitiApplyAnalysis'], {
    window: state.window, Date, Math,
    eitiKBLoad: () => [], eitiKBSave: () => { state.kbWrites++; },
    _vbSaveToIDB: () => { state.vbWrites++; },
    eitiDb: { transaction: () => ({ objectStore: () => ({ put: () => { state.moscWrites++; } }) }) },
    localStorage: { setItem: () => { state.cfgWrites++; }, getItem: () => null },
    eitiReceiveReply: (m) => state.replies.push(m),
  });
  state.apply = (analysis) => { state.window._eitiPendingAnalysis = analysis; return sb.eitiApplyAnalysis(); };
  return state;
}
test('no pending analysis performs no mutation', () => {
  const s = makeApply(); assert.strictEqual(s.apply(null), null);
  assert.strictEqual(s.kbWrites + s.vbWrites + s.moscWrites + s.cfgWrites, 0);
});
test('model analysis becomes a LearningProposal only', () => {
  const s = makeApply();
  const input = { kb:[{triggers:['tea'],answer:'likes tea'}], vb:[{intent:'greet',pattern:'hello'}], mosc:[{word:'tea',concept:'drink',weight:0.9}], fl:{threshold:0.9} };
  const proposal = s.apply(input);
  assert.strictEqual(proposal.proposal_type, 'LearningProposal');
  assert.strictEqual(proposal.authority, 'ModelProposed');
  assert.strictEqual(proposal.status, 'PENDING_ADMISSION');
  assert.deepStrictEqual(JSON.parse(JSON.stringify(proposal.payload)), input);
  assert.strictEqual(s.kbWrites, 0); assert.strictEqual(s.vbWrites, 0); assert.strictEqual(s.moscWrites, 0); assert.strictEqual(s.cfgWrites, 0);
  assert.strictEqual(s.window._eitiPendingAnalysis, null); assert.strictEqual(s.window._eitiLearningProposal, proposal);
  assert.match(s.replies.at(-1), /НЕ изменены/);
});
test('proposal payload is detached from subsequent input mutation', () => {
  const s = makeApply(); const input = { kb:[{triggers:['x'],answer:'original'}] };
  const proposal = s.apply(input); input.kb[0].answer = 'tampered';
  assert.strictEqual(proposal.payload.kb[0].answer, 'original');
});
