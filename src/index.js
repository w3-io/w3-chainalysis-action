import { createCommandRouter, setJsonOutput, handleError } from '@w3-io/action-core'
import * as core from '@actions/core'

const SANCTIONS_API = 'https://public.chainalysis.com/api/v1/address'

async function screen(address, apiKey) {
  const url = `${SANCTIONS_API}/${encodeURIComponent(address)}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-API-Key': apiKey,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(
      `Chainalysis API returned ${response.status}: ${body}`,
    )
  }

  const data = await response.json()
  const identifications = data.identifications || []
  const isSanctioned = identifications.length > 0

  return { isSanctioned, identifications }
}

const router = createCommandRouter({
  screen: async () => {
    const address = core.getInput('address', { required: true })
    const apiKey = core.getInput('api-key', { required: true })

    const result = await screen(address, apiKey)

    if (result.isSanctioned) {
      core.warning(
        `Address ${address} is SANCTIONED (${result.identifications.length} designation(s))`,
      )
    } else {
      core.info(`Address ${address} is clean`)
    }

    setJsonOutput('result', result)
  },
})

router()
