// Offline tests: check formatting logic with a fixture, no network needed.
const assert = require("assert");
const { explain } = require("./explain.js");
const fake = { ok: true, json: async () => ({ result: {
  slot: 1, blockTime: 1700000000,
  transaction: { signatures: ["x"], message: { accountKeys: [{ pubkey: "AAAAAAAA1", signer: true }, { pubkey: "BBBBBBBB2", signer: false }],
    instructions: [{ program: "system" }] } },
  meta: { err: null, fee: 5000, preBalances: [1e9, 0], postBalances: [9e8, 1e8], preTokenBalances: [], postTokenBalances: [] } } }) };
global.fetch = async () => fake;
explain("sig").then(out => {
  assert.match(out, /Status    : SUCCESS/);
  assert.match(out, /SOL change: AAAAAAAA… -0\.100000000/);
  assert.match(out, /SOL change: BBBBBBBB… \+0\.100000000/);
  console.log("tests passed");
}).catch(e => { console.error("FAIL", e.message); process.exit(1); });
explain("sig", { json: true }).then(out => {
  const j = JSON.parse(out);
  assert.strictEqual(j.status, "success");
  assert.strictEqual(j.solChanges.length, 2);
  console.log("json tests passed");
}).catch(e => { console.error("FAIL json", e.message); process.exit(1); });
// Parser regression: versioned tx must request maxSupportedTransactionVersion 1 or higher.
const src = require("fs").readFileSync("explain.js", "utf8");
assert.match(src, /maxSupportedTransactionVersion: 1/);
console.log("version test passed");
// Failed-transaction path: status must be reported as failed with the error.
global.fetch = async () => ({ ok: true, json: async () => ({ result: {
  slot: 2, blockTime: 1700000001,
  transaction: { signatures: ["x"], message: { accountKeys: [{ pubkey: "CCCCCCCC3", signer: true }],
    instructions: [{ program: "system" }] } },
  meta: { err: { InstructionError: [0, { Custom: 1 }] }, fee: 5000, preBalances: [1e9], postBalances: [1e9], preTokenBalances: [], postTokenBalances: [] } } }) });
explain("sig", { json: true }).then(out => {
  const j = JSON.parse(out);
  assert.strictEqual(j.status, "failed");
  assert.ok(j.error);
  console.log("failed-tx test passed");
}).catch(e => { console.error("FAIL failed-tx", e.message); process.exit(1); });
