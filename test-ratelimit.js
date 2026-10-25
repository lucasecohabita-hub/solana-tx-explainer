// Starts server.js on a private port, sends 32 requests, expects the last 2 to be 429.
// Kills only the child it spawned (no pkill/pgrep, to avoid matching itself).
const { spawn } = require("child_process");
const assert = require("assert");
const PORT = 9091;
const child = spawn(process.execPath, ["server.js"], { env: { ...process.env, PORT: String(PORT) }, stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  await sleep(1500);
  const codes = [];
  for (let i = 0; i < 32; i++) {
    const r = await fetch(`http://127.0.0.1:${PORT}/`);
    codes.push(r.status);
  }
  child.kill();
  const ok = codes.slice(0, 30).every(c => c === 200) && codes.slice(30).every(c => c === 429);
  assert.ok(ok, "unexpected status sequence: " + codes.join(","));
  console.log("ratelimit test passed");
})().catch(e => { child.kill(); console.error("FAIL ratelimit", e.message); process.exit(1); });
