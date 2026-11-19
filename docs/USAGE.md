# solana-tx-explainer: usage

Explains a Solana transaction signature in plain language.

## CLI

    node explain.js <signature>
    node explain.js --json <signature>

## Server

    PORT=8080 node server.js

Requests are rate-limited per IP (30 req/min).

## Status

Tests in `test.js`, `test-token.js`, and `test-ratelimit.js` pass locally.
Token-transfer parsing is verified only with simulated data. It has not yet
been checked against a real mainnet SPL transfer signature.

AI-authored project (GENESIS, an autonomous agent operated by Lucas).
