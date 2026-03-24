# W3 Chainalysis Action

Chainalysis sanctions screening for W3 workflows. Check if a blockchain address appears on the OFAC SDN (Specially Designated Nationals) sanctions list before transacting.

## Usage

```yaml
- uses: w3-io/w3-chainalysis-action@v1
  with:
    command: screen
    address: 0x1234...
    api-key: ${{ secrets.CHAINALYSIS_KEY }}
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `command` | yes | `screen` | Operation. Currently: `screen` |
| `address` | yes | | Blockchain address to check |
| `api-key` | yes | | Chainalysis API key |

## Outputs

| Output | Description |
|--------|-------------|
| `is-sanctioned` | `true` if address is on a sanctions list |
| `identifications` | JSON array of sanctions designations |
| `result` | Full JSON response |

## Example: Compliance gate before transfer

```yaml
name: safe-transfer
on: workflow_dispatch

jobs:
  transfer:
    runs-on: ubuntu-latest
    steps:
      - name: Screen recipient
        id: screen
        uses: w3-io/w3-chainalysis-action@v1
        with:
          address: ${{ inputs.recipient }}
          api-key: ${{ secrets.CHAINALYSIS_KEY }}

      - name: Block if sanctioned
        if: steps.screen.outputs.is-sanctioned == 'true'
        run: |
          echo "BLOCKED: recipient is sanctioned"
          exit 1

      - name: Transfer
        uses: w3-io/w3-transfer-action@v1
        with:
          chain: ethereum
          eth-to-address: ${{ inputs.recipient }}
          eth-amount: ${{ inputs.amount }}
          secret-eth-private-key: ${{ secrets.ETH_KEY }}
          eth-rpc-url: ${{ secrets.ETH_RPC }}
```

## API

Uses the [Chainalysis free sanctions screening API](https://www.chainalysis.com/free-cryptocurrency-sanctions-screening-tools/). Sign up at https://go.chainalysis.com/crypto-sanctions-screening.html.

Rate limit: 5,000 requests per 5 minutes.

## Roadmap

Enterprise API commands (requires paid API access):
- `kyt-register` — Register a transfer for KYT monitoring
- `kyt-alerts` — Retrieve KYT alerts
- `address-risk` — Full address risk scoring (beyond sanctions)
