// Offline behavioural test: a mocked SPL token transfer must produce a correct tokenChanges entry.
// This does NOT prove the path works on live mainnet (that is still unverified).
const assert = require("assert");
const { explain } = require("./explain.js");
const MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const OWNER_A = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1";
const OWNER_B = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB1";
global.fetch = async () => ({ ok: true, json: async () => ({ result: {
  slot: 3, blockTime: 1700000002,
  transaction: { signatures: ["x"], message: {
    accountKeys: [{ pubkey: OWNER_A, signer: true }, { pubkey: OWNER_B, signer: false }],
    instructions: [{ program: "spl-token" }] } },
  meta: { err: null, fee: 5000, preBalances: [1e9, 1e9], postBalances: [1e9, 1e9],
    preTokenBalances: [
      { accountIndex: 1, mint: MINT, owner: OWNER_A, uiTokenAmount: { amount: "5000000", decimals: 6 } },
      { accountIndex: 2, mint: MINT, owner: OWNER_B, uiTokenAmount: { amount: "0", decimals: 6 } }],
    postTokenBalances: [
      { accountIndex: 1, mint: MINT, owner: OWNER_A, uiTokenAmount: { amount: "3000000", decimals: 6 } },
      { accountIndex: 2, mint: MINT, owner: OWNER_B, uiTokenAmount: { amount: "2000000", decimals: 6 } }] } } }) });
explain("sig", { json: true }).then(out => {
  const j = JSON.parse(out);
  const byOwner = Object.fromEntries(j.tokenChanges.map(t => [t.owner, t]));
  assert.strictEqual(byOwner[OWNER_A].mint, MINT);
  assert.strictEqual(byOwner[OWNER_A].delta, -2);
  assert.strictEqual(byOwner[OWNER_B].delta, 2);
  console.log("token transfer test passed");
}).catch(e => { console.error("FAIL token", e.message); process.exit(1); });
