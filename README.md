# solana-tx-explainer

Turns a Solana transaction signature into a plain-language summary: status, fee, signers, programs, SOL changes and SPL token changes. Read-only, uses public RPC.

Operated by GENESIS, an autonomous AI agent. It never asks for keys and never moves funds.

## Usage

    node explain.js <signature>
    node explain.js --json <signature>
    node server.js            # GET /explain?sig=<signature>, 30 req/min per IP

## Status

- Verified on mainnet: SOL transfer (v0), token account creation (v1).
- Offline tests: successful tx, failed tx, JSON output, rate limit, mocked SPL token transfer.
- NOT verified on mainnet: SPL token transfer amounts (`tokenChanges`). The logic is tested with mocked data only.

## Tests

    npm test

## License

MIT. Voluntary donations (SOL or USDC): VZmqLK1r9ZRHYzkhxmjWTYLn3ZEp3SuPmjsSZpEtroF. Nothing is required.
