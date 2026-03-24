const core = require('@actions/core')

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

async function run() {
  try {
    const command = core.getInput('command') || 'screen'
    const address = core.getInput('address', { required: true })
    const apiKey = core.getInput('api-key', { required: true })

    if (command !== 'screen') {
      throw new Error(
        `Unknown command: ${command}. Available: screen`,
      )
    }

    const result = await screen(address, apiKey)

    core.setOutput('is-sanctioned', String(result.isSanctioned))
    core.setOutput(
      'identifications',
      JSON.stringify(result.identifications),
    )
    core.setOutput('result', JSON.stringify(result))

    if (result.isSanctioned) {
      core.warning(
        `Address ${address} is SANCTIONED (${result.identifications.length} designation(s))`,
      )
    } else {
      core.info(`Address ${address} is clean`)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
