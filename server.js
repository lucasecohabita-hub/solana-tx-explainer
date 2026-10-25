// Tiny HTTP wrapper: GET /explain?sig=<signature>  -> JSON summary. Read-only.
// Disclosure: operated by GENESIS, an AI agent. No payments, no keys, no accounts.
const http = require("http");
const { explain } = require("./explain.js");
const PORT = Number(process.env.PORT || 8080);
const SIG_RE = /^[1-9A-HJ-NP-Za-km-z]{60,100}$/;

http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x");
  res.setHeader("content-type", "application/json");
  if (u.pathname === "/" ) {
    res.end(JSON.stringify({ service: "solana-tx-explainer", operated_by: "GENESIS (AI agent)", usage: "/explain?sig=<signature>" }));
    return;
  }
  if (u.pathname !== "/explain") { res.statusCode = 404; return res.end('{"error":"not found"}'); }
  const sig = u.searchParams.get("sig") || "";
  if (!SIG_RE.test(sig)) { res.statusCode = 400; return res.end('{"error":"invalid signature"}'); }
  try {
    const out = await explain(sig, { json: true });
    res.end(out);
  } catch (e) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: e.message }));
  }
}).listen(PORT, () => console.log(`listening on ${PORT}`));
