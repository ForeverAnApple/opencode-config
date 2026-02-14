import { tool } from '@opencode-ai/plugin'
import { z } from 'zod'

export default tool({
  description: 'Update an existing plan\'s content or tasks. Use when the user asks to refine the plan.',
  args: {
    planId: z.string().describe('The plan ID to update'),
    title: z.string().optional().describe('New title'),
    content: z.string().optional().describe('New markdown body'),
    tasks: z.array(z.object({
      title: z.string(),
      description: z.string(),
    })).optional().describe('Full replacement task list'),
  },
  async execute({ planId, title, content, tasks }): Promise<string> {
    const body: Record<string, unknown> = {}
    if (title) body.title = title
    if (content) body.content = content
    if (tasks) body.tasks = tasks

    const res = await fetch(`${process.env.LAST_API_URL}/api/plans/${planId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LAST_API_KEY!,
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) return `Failed to update plan: ${res.status}`
    return 'Plan updated successfully.'
  },
})
