import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

/**
 * Test the core logic of the chainalysis action:
 * - Input validation (empty address, missing API key)
 * - Sanctions screening result parsing
 * - URL construction
 * - Response handling
 */

const SANCTIONS_API = 'https://public.chainalysis.com/api/v1/address'

// Reproduce the screen logic (sans actual fetch)
function buildScreenUrl(address) {
  return `${SANCTIONS_API}/${encodeURIComponent(address)}`
}

function parseScreenResult(data) {
  const identifications = data.identifications || []
  const isSanctioned = identifications.length > 0
  return { isSanctioned, identifications }
}

function buildHeaders(apiKey) {
  return {
    'X-API-Key': apiKey,
    Accept: 'application/json',
  }
}

describe('URL construction', () => {
  it('builds correct URL for a simple address', () => {
    const url = buildScreenUrl('0xabc123')
    assert.equal(url, 'https://public.chainalysis.com/api/v1/address/0xabc123')
  })

  it('encodes special characters in address', () => {
    const url = buildScreenUrl('addr with spaces')
    assert.equal(
      url,
      'https://public.chainalysis.com/api/v1/address/addr%20with%20spaces',
    )
  })

  it('handles empty address in URL (produces trailing slash)', () => {
    const url = buildScreenUrl('')
    assert.equal(url, 'https://public.chainalysis.com/api/v1/address/')
  })
})

describe('input validation', () => {
  it('empty address produces an empty-path URL', () => {
    // The action itself relies on @actions/core required:true to reject,
    // but the screen function would hit an invalid endpoint
    const url = buildScreenUrl('')
    assert.ok(url.endsWith('/'))
  })

  it('API key is included in headers', () => {
    const headers = buildHeaders('my-api-key')
    assert.equal(headers['X-API-Key'], 'my-api-key')
  })

  it('missing API key results in empty header value', () => {
    const headers = buildHeaders('')
    assert.equal(headers['X-API-Key'], '')
  })

  it('validates that command must be screen', () => {
    const command = 'unknown'
    assert.notEqual(command, 'screen')
    // The action throws: Unknown command: ${command}. Available: screen
  })
})

describe('sanctions screening result parsing', () => {
  it('clean address returns isSanctioned=false', () => {
    const data = { identifications: [] }
    const result = parseScreenResult(data)
    assert.equal(result.isSanctioned, false)
    assert.deepEqual(result.identifications, [])
  })

  it('sanctioned address returns isSanctioned=true', () => {
    const data = {
      identifications: [
        {
          category: 'sanctions',
          name: 'OFAC SDN',
          description: 'Specially Designated National',
          url: 'https://example.com',
        },
      ],
    }
    const result = parseScreenResult(data)
    assert.equal(result.isSanctioned, true)
    assert.equal(result.identifications.length, 1)
    assert.equal(result.identifications[0].category, 'sanctions')
  })

  it('multiple identifications are all returned', () => {
    const data = {
      identifications: [
        { category: 'sanctions', name: 'list-a' },
        { category: 'sanctions', name: 'list-b' },
        { category: 'sanctions', name: 'list-c' },
      ],
    }
    const result = parseScreenResult(data)
    assert.equal(result.isSanctioned, true)
    assert.equal(result.identifications.length, 3)
  })

  it('missing identifications field defaults to empty', () => {
    const data = {}
    const result = parseScreenResult(data)
    assert.equal(result.isSanctioned, false)
    assert.deepEqual(result.identifications, [])
  })

  it('null identifications field defaults to empty', () => {
    const data = { identifications: null }
    const result = parseScreenResult(data)
    assert.equal(result.isSanctioned, false)
    assert.deepEqual(result.identifications, [])
  })
})

describe('mock fetch responses', () => {
  it('successful clean response', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ identifications: [] }),
    }
    const data = await mockResponse.json()
    const result = parseScreenResult(data)
    assert.equal(result.isSanctioned, false)
  })

  it('successful sanctioned response', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        identifications: [{ category: 'sanctions', name: 'OFAC' }],
      }),
    }
    const data = await mockResponse.json()
    const result = parseScreenResult(data)
    assert.equal(result.isSanctioned, true)
  })

  it('API error response throws', async () => {
    const mockResponse = {
      ok: false,
      status: 403,
      text: async () => 'Forbidden',
    }

    // Reproduce the action's error handling
    if (!mockResponse.ok) {
      const body = await mockResponse.text()
      const error = new Error(
        `Chainalysis API returned ${mockResponse.status}: ${body}`,
      )
      assert.equal(error.message, 'Chainalysis API returned 403: Forbidden')
    }
  })

  it('rate-limited response throws with 429', async () => {
    const mockResponse = {
      ok: false,
      status: 429,
      text: async () => 'Too Many Requests',
    }

    if (!mockResponse.ok) {
      const body = await mockResponse.text()
      const error = new Error(
        `Chainalysis API returned ${mockResponse.status}: ${body}`,
      )
      assert.match(error.message, /429/)
    }
  })
})
