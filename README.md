# W3 Chainalysis Action

Sanctions screening for blockchain addresses via the Chainalysis free screening API.

## Quick Start

```yaml
- uses: w3-io/w3-chainalysis-action@v1
  id: screen
  with:
    command: screen
    address: ${{ inputs.recipient }}
    api-key: ${{ secrets.CHAINALYSIS_KEY }}

- if: steps.screen.outputs.is-sanctioned == 'true'
  run: |
    echo "BLOCKED: recipient is sanctioned"
    exit 1
```

## Commands

| Command  | Description                                                |
| -------- | ---------------------------------------------------------- |
| `screen` | Check if an address appears on the OFAC SDN sanctions list |

## Inputs

| Name      | Required | Default  | Description                 |
| --------- | -------- | -------- | --------------------------- |
| `command` | Yes      | `screen` | Operation to perform        |
| `address` | Yes      |          | Blockchain address to check |
| `api-key` | Yes      |          | Chainalysis API key         |

## Outputs

| Name              | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| `is-sanctioned`   | `true` if address is on a sanctions list                    |
| `identifications` | JSON array of sanctions designations (empty array if clean) |
| `result`          | Full JSON response from Chainalysis API                     |

## Authentication

Uses the [Chainalysis free sanctions screening API](https://www.chainalysis.com/free-cryptocurrency-sanctions-screening-tools/). Sign up at https://go.chainalysis.com/crypto-sanctions-screening.html. Rate limit: 5,000 requests per 5 minutes.
