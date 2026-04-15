# E2E Test Results

Last verified: 2026-04-15

## Environment

- W3 local network (3-node localnet)
- Protocol: master (includes EIP-712, bridge-allow expansion, nonce manager)
- Runner image: w3io/w3-runner (Node 20/24)

## Prerequisites

- W3 local network running (make dev)
- W3_SECRET_CHAINALYSIS_API_KEY set to a Chainalysis API key

## Results

| Step | Command | Status | Notes |
|------|---------|--------|-------|
| 1 | screen (clean Ethereum address) | PASS | 0x0000...0001 |
| 2 | screen (sanctioned address) | PASS | Tornado Cash deposit address |
| 3 | screen (Bitcoin address) | PASS | 1A1zP1...DivfNa |

## Known Limitations

- None.
