# TODO

## Current state: 3/3 commands verified

The action currently wraps Chainalysis' address screening endpoint.
All three test cases (clean EVM address, sanctioned address, Bitcoin
genesis coinbase) pass against live Chainalysis.

## Potential additions

These are features of Chainalysis' broader API surface that could be
wrapped if there's workflow demand:

- [ ] `register-address` — add an address to a monitoring list.
      Chainalysis endpoints: `POST /api/risk/v2/entities`.
- [ ] `get-transfer-risk` — score a specific transaction hash rather
      than just an address. Useful for workflow-time screening of an
      incoming transfer before accepting it.
- [ ] KYT (Know Your Transaction) endpoints — `POST
/api/kyt/v2/users/{user_id}/transfers`. More invasive because
      it implies per-user transfer history tracking, not just
      address-level risk.

## Not in scope

- **Reactor** — Chainalysis' investigation tool isn't an API that
  makes sense to wrap as a workflow action.
