import { tool } from '@opencode-ai/plugin'

export default tool({
  description:
    'Read the current project context from the dashboard. Returns research findings, industry tags, problem statement, etc. Call this at the start of a conversation to check if research already exists.',
  args: {},
  async execute(): Promise<string> {
    const baseUrl = process.env.LAST_API_URL || process.env.APP_URL
    const apiKey = process.env.LAST_API_KEY
    const projectId = process.env.LAST_PROJECT_ID

    if (!baseUrl || !apiKey || !projectId) {
      return 'Missing LAST_API_URL, LAST_API_KEY, or LAST_PROJECT_ID env vars'
    }

    const res = await fetch(`${baseUrl}/api/projects/${projectId}/metadata`, {
      headers: { 'x-api-key': apiKey },
    })

    if (!res.ok) {
      return `Failed to read context: ${res.status} ${await res.text()}`
    }

    const metadata = await res.json()
    if (!metadata || Object.keys(metadata).length === 0) {
      return 'No project context found — research needed'
    }

    return JSON.stringify(metadata, null, 2)
  },
})
