#!/usr/bin/env node
// solana-tx-explainer: turns a raw Solana transaction signature into a plain-language summary.
// Uses the public Solana JSON-RPC. Read-only: never needs a private key.
const RPC = process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com";

async function rpc(method, params) {
  const r = await fetch(RPC, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error.message);
  return j.result;
}

async function explain(sig, opts = {}) {
  const tx = await rpc("getTransaction", [sig, { encoding: "jsonParsed", maxSupportedTransactionVersion: 1 }]);
  if (!tx) throw new Error("transaction not found");
  const m = tx.meta || {};
  const status = m.err ? `FAILED (${JSON.stringify(m.err)})` : "SUCCESS";
  const when = tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : "unknown";
  const fee = (m.fee ?? 0) / 1e9;
  const keys = tx.transaction.message.accountKeys.map(k => (typeof k === "string" ? k : k.pubkey));
  const programs = [...new Set(tx.transaction.message.instructions.map(i => i.program || i.programId))];
  const lines = [];
  lines.push(`Signature : ${sig}`);
  lines.push(`Status    : ${status}`);
  lines.push(`Time (UTC): ${when}`);
  lines.push(`Slot      : ${tx.slot}`);
  lines.push(`Fee       : ${fee.toFixed(9)} SOL`);
  lines.push(`Signers   : ${keys.filter((_, i) => tx.transaction.message.accountKeys[i].signer).join(", ") || "n/a"}`);
  lines.push(`Programs  : ${programs.join(", ") || "n/a"}`);
  lines.push(`Instructions: ${tx.transaction.message.instructions.length}`);
  // Token and SOL balance changes
  const solDeltas = keys.map((k, i) => ({ k, d: ((m.postBalances?.[i] ?? 0) - (m.preBalances?.[i] ?? 0)) / 1e9 })).filter(x => Math.abs(x.d) > 0);
  for (const x of solDeltas) lines.push(`SOL change: ${x.k.slice(0, 8)}… ${x.d >= 0 ? "+" : ""}${x.d.toFixed(9)}`);
  const pre = m.preTokenBalances || [], post = m.postTokenBalances || [];
  const tokenChanges = [];
  const idx = new Set([...pre, ...post].map(b => b.accountIndex));
  for (const i of idx) {
    const a = pre.find(b => b.accountIndex === i), b = post.find(x => x.accountIndex === i);
    const before = Number(a?.uiTokenAmount?.uiAmount ?? 0), after = Number(b?.uiTokenAmount?.uiAmount ?? 0);
    if (before !== after) tokenChanges.push({ mint: (b || a).mint, owner: (b || a).owner, delta: after - before });
    if (before !== after) lines.push(`Token change: mint ${(b || a).mint.slice(0, 8)}… owner ${(b || a).owner?.slice(0, 8)}… ${after - before >= 0 ? "+" : ""}${(after - before).toFixed(6)}`);
  }
  if (opts.json) return JSON.stringify({ signature: sig, status: m.err ? "failed" : "success", error: m.err || null, time: when, slot: tx.slot, feeSol: fee, signers: keys.filter((_, i) => tx.transaction.message.accountKeys[i].signer), programs, instructionCount: tx.transaction.message.instructions.length, solChanges: solDeltas.map(x => ({ account: x.k, deltaSol: x.d })), tokenChanges }, null, 2);
  return lines.join("\n");
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const json = args.includes("--json");
  const sig = args.find(a => !a.startsWith("--"));
  if (!sig) { console.error("usage: explain.js [--json] <signature>"); process.exit(1); }
  explain(sig, { json }).then(out => console.log(out)).catch(e => { console.error("error:", e.message); process.exit(1); });
}
module.exports = { explain };
