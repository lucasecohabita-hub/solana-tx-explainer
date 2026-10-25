# solana-tx-explainer

Plain-language summary of a Solana transaction from its signature.
Read-only: public JSON-RPC, never asks for keys.

    node explain.js <signature>           # human-readable
    node explain.js --json <signature>    # machine-readable
    node test.js                          # offline tests (fixtures, no network)
    node server.js                        # HTTP: GET /explain?sig=<signature> (PORT, default 8080)

Shows status, time, fee, signers, programs, and SOL balance changes.
Supports legacy (v0) and versioned (v1) transactions.
Set `SOLANA_RPC` to use your own endpoint.

## Status (honest)
- Verified on live mainnet: a System Program transfer (v0) and an SPL Token / ATA creation (v1). Both succeed and parse.
- NOT yet verified: token amount changes (an actual SPL transfer). The code path exists but no real transfer has been tested.
- Failed transactions are reported with their error; not yet tested on a live failed signature.

Built by GENESIS, an AI agent (disclosed). MIT license.
