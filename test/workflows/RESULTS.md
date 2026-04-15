# E2E Test Results

> Last verified: 2026-04-15

## Prerequisites

| Credential | Env var | Source |
|-----------|---------|--------|
| Chainalysis API key | `CHAINALYSIS_API_KEY` | Chainalysis dashboard |

## Results

| # | Step | Command | Status | Notes |
|---|------|---------|--------|-------|
| 1 | Screen a clean Ethereum address | `screen` | PASS | |
| 2 | Screen a sanctioned address | `screen` | PASS | Tornado Cash deposit address |
| 3 | Screen a Bitcoin address | `screen` | PASS | Genesis block coinbase |

## Skipped Commands

| Command | Reason |
|---------|--------|
| N/A | All commands tested |

## How to run

```bash
# Export credentials
export CHAINALYSIS_API_KEY="..."

# Run
w3 workflow test --execute test/workflows/e2e.yaml
```
