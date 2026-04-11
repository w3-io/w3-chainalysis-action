---
title: Chainalysis
category: integrations
actions: [screen]
complexity: beginner
---

# Chainalysis

[Chainalysis](https://www.chainalysis.com) is the blockchain analytics
company behind KYT (Know Your Transaction) and the industry-standard
sanctions screening oracle. Their free screening API checks any
blockchain address against the OFAC SDN (Specially Designated Nationals)
list maintained by the U.S. Treasury, returning sanctions designations
in real time. Use this action to gate on-chain transfers, enforce
compliance policy, and block sanctioned addresses before funds move.

## Quick start

```yaml
- name: Screen recipient
  id: screen
  uses: w3-io/w3-chainalysis-action@v1
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

### screen

Check whether a blockchain address appears on the OFAC SDN sanctions
list. The API accepts any chain's address format (Ethereum, Bitcoin,
Solana, etc.) and returns matches within milliseconds.

| Input     | Required | Description                 |
| --------- | -------- | --------------------------- |
| `address` | yes      | Blockchain address to check |
| `api-key` | yes      | Chainalysis API key         |

**Output (`result`):**

```json
{
  "identifications": [
    {
      "category": "sanctions",
      "name": "OFAC SDN",
      "description": "Office of Foreign Assets Control - Specially Designated Nationals",
      "url": "https://sanctionssearch.ofac.treas.gov/"
    }
  ]
}
```

**Additional outputs:**

| Output            | Type   | Description                                              |
| ----------------- | ------ | -------------------------------------------------------- |
| `is-sanctioned`   | string | `true` if address is on a sanctions list, `false` if not |
| `identifications` | string | JSON array of sanctions designations (empty if clean)    |
| `result`          | string | Full JSON response from the Chainalysis API              |

When `is-sanctioned` is `false`, the `identifications` array is empty:

```json
{
  "identifications": []
}
```

## Authentication

This action uses the [Chainalysis free sanctions screening API](https://www.chainalysis.com/free-cryptocurrency-sanctions-screening-tools/).

1. Sign up at https://go.chainalysis.com/crypto-sanctions-screening.html
2. Copy your API key from the dashboard
3. Store it as a secret (e.g. `CHAINALYSIS_KEY`)

```yaml
with:
  api-key: ${{ secrets.CHAINALYSIS_KEY }}
```

**Rate limit:** 5,000 requests per 5 minutes. The free tier covers
sanctions screening only. For KYT, Reactor, and enterprise analytics,
contact Chainalysis sales.

## Compliance gate workflow example

Screen a recipient before executing an on-chain transfer. If the
address is sanctioned, the workflow halts and logs the designation.

```yaml
- name: Screen sender
  id: screen-sender
  uses: w3-io/w3-chainalysis-action@v1
  with:
    command: screen
    address: ${{ inputs.sender }}
    api-key: ${{ secrets.CHAINALYSIS_KEY }}

- name: Screen recipient
  id: screen-recipient
  uses: w3-io/w3-chainalysis-action@v1
  with:
    command: screen
    address: ${{ inputs.recipient }}
    api-key: ${{ secrets.CHAINALYSIS_KEY }}

- name: Block if either party is sanctioned
  if: >-
    steps.screen-sender.outputs.is-sanctioned == 'true' ||
    steps.screen-recipient.outputs.is-sanctioned == 'true'
  run: |
    echo "Transaction blocked: sanctioned address detected"
    echo "Sender: ${{ steps.screen-sender.outputs.is-sanctioned }}"
    echo "Recipient: ${{ steps.screen-recipient.outputs.is-sanctioned }}"
    exit 1

- name: Execute transfer
  uses: w3-io/w3-erc20-action@v1
  with:
    command: transfer
    token: ${{ inputs.token }}
    to: ${{ inputs.recipient }}
    amount: ${{ inputs.amount }}
```

## Error handling

The action fails with a descriptive message on:

- Missing or invalid API key
- Missing address input
- Chainalysis API errors (rate limit, server error)
- Network connectivity issues
