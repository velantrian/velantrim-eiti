from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

old = """    eitiKBSave(facts);
    if (typeof window.eitiLogEvent === 'function') {
        try { await window.eitiLogEvent('memory_layer_promoted', { fact_id: factId, memory_layer: 'L3', epistemic_state: beforeState }); } catch(e) {}
    }
    return { promoted: true, memory_layer: 'L3', epistemic_state: beforeState };
};"""
new = """    eitiKBSave(facts);
    // Keep the SQLite retrieval index consistent, but change durability only.
    // Epistemic state/authority/evidence are deliberately untouched.
    if (window._db && window.eitiSQLReady) {
        try {
            window._db.run(\"UPDATE kb_idx SET memory_layer='L3' WHERE id=?\", [String(factId)]);
            if (typeof _persistSQLDebounced === 'function') _persistSQLDebounced();
        } catch(e) {}
    }
    if (typeof window.eitiLogEvent === 'function') {
        try { await window.eitiLogEvent(factId, 'memory_layer_promoted', { memory_layer: 'L3', epistemic_state: beforeState }); } catch(e2) {}
    }
    return { promoted: true, factId: String(factId), memory_layer: 'L3', epistemic_state: beforeState };
};"""
if old not in s:
    raise SystemExit('promotion block changed')
s = s.replace(old, new, 1)

old_log = """try { window.eitiLogEvent('learning_proposal_staged', { proposal_id: proposal.proposal_id, source: proposal.source, authority: proposal.authority }); } catch(e2) {}"""
new_log = """try { window.eitiLogEvent(proposal.proposal_id, 'learning_proposal_staged', { source: proposal.source, authority: proposal.authority }); } catch(e2) {}"""
if old_log not in s:
    raise SystemExit('proposal log block changed')
s = s.replace(old_log, new_log, 1)

s = s.replace("// Manual / programmatic promotion: takes a Pending/Supported fact and tries\n// to push it into L3 canon. Runs the gate against the single fact and only\n// promotes on pass. Audit log captures every attempted promotion.\n", "// Durability promotion only: moves an existing fact to L3 storage.\n// This operation MUST NOT promote epistemic state, authority, or evidence.\n", 1)
p.write_text(s, encoding='utf-8')

# Static regression: pin the SQL update to memory_layer only and prohibit the
# historical epistemic promotion in this function.
Path('velantrim_core/tests_js/l3_durability_boundary.test.js').write_text("""'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { extractFunction, INDEX_HTML } = require('./harness');
const fs = require('fs');

test('L3 promotion is durability-only in both KB and SQLite paths', () => {
  const html = fs.readFileSync(INDEX_HTML, 'utf8');
  const start = html.indexOf('window.eitiPromoteToL3 = async function');
  const end = html.indexOf('// Convenience for the Pending UI', start);
  assert.ok(start >= 0 && end > start);
  const src = html.slice(start, end);
  assert.match(src, /SET memory_layer='L3' WHERE id=\?/);
  assert.doesNotMatch(src, /SET[^\\n]*epistemic_state/);
  assert.doesNotMatch(src, /epistemic_state\s*=\s*'Validated'/);
  assert.match(src, /memory_layer_promoted/);
});
""", encoding='utf-8')
