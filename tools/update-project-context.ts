import { tool } from '@opencode-ai/plugin'

export default tool({
  description:
    'Update the project context displayed in the dashboard. Use this to populate research findings, industry tags, problem statements, etc. Fields are merge-updated (only provided fields are changed).',
  args: {
    description: tool.schema.string().optional().describe('Short project description shown on the catalog card (1-2 sentences)'),
    industry: tool.schema.string().optional().describe('Industry vertical (e.g. "Healthcare", "Fintech", "E-commerce")'),
    tags: tool.schema.array(tool.schema.string()).optional().describe('Research/topic tags (e.g. ["AI", "B2B", "SaaS"])'),
    problemStatement: tool.schema.string().optional().describe('The core problem this demo addresses'),
    targetAudience: tool.schema.string().optional().describe('Who this product is for'),
    competitors: tool.schema.array(tool.schema.string()).optional().describe('Notable competitors or alternatives'),
    keyFeatures: tool.schema.array(tool.schema.string()).optional().describe('Key features of the demo'),
    marketInsights: tool.schema.string().optional().describe('Free-form research notes about the market'),
    summary: tool.schema.string().optional().describe('One-line project summary'),
  },
  async execute(args): Promise<string> {
    const baseUrl = process.env.LAST_API_URL || process.env.APP_URL
    const apiKey = process.env.LAST_API_KEY
    const projectId = process.env.LAST_PROJECT_ID

    if (!baseUrl || !apiKey || !projectId) {
      return 'Missing LAST_API_URL, LAST_API_KEY, or LAST_PROJECT_ID env vars'
    }

    // Filter out undefined values
    const patch: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(args)) {
      if (value !== undefined) patch[key] = value
    }

    if (Object.keys(patch).length === 0) return 'No fields provided'

    const output: string[] = []

    // Update project-level fields via PUT /api/projects/:id
    const projectUpdate: Record<string, unknown> = {}
    if (patch.tags) projectUpdate.tags = patch.tags
    if (patch.description) projectUpdate.description = patch.description
    if (Object.keys(projectUpdate).length > 0) {
      const putRes = await fetch(`${baseUrl}/api/projects/${projectId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(projectUpdate),
      })
      if (putRes.ok) {
        output.push(`✓ Updated project: ${Object.keys(projectUpdate).join(', ')}`)
      }
    }

    // Update metadata via PATCH /api/projects/:id/metadata
    const res = await fetch(`${baseUrl}/api/projects/${projectId}/metadata`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(patch),
    })

    if (!res.ok) {
      return `Failed to update context: ${res.status} ${await res.text()}`
    }

    const updated = await res.json()
    output.push(`✓ Updated project context: ${Object.keys(patch).join(', ')}`)
    output.push(JSON.stringify(updated, null, 2))
    return output.join('\n')
  },
})
