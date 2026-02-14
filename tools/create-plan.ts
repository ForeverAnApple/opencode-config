import { tool } from '@opencode-ai/plugin'
import { z } from 'zod'

export default tool({
  description: 'Create a development plan with tasks. Call this after discussing requirements with the user.',
  args: {
    title: z.string().describe('Short plan title (2-6 words)'),
    content: z.string().describe('Markdown body: overview, approach, tech decisions'),
    tasks: z.array(z.object({
      title: z.string().describe('Task title (one line)'),
      description: z.string().describe('What to implement and how'),
    })).describe('Ordered list of tasks to complete the plan'),
  },
  async execute({ title, content, tasks }): Promise<string> {
    const res = await fetch(`${process.env.LAST_API_URL}/api/plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LAST_API_KEY!,
      },
      body: JSON.stringify({
        projectId: process.env.LAST_PROJECT_ID,
        title,
        content,
        tasks,
      }),
    })
    if (!res.ok) return `Failed to create plan: ${res.status} ${await res.text()}`
    const plan = await res.json()
    return `Plan created: "${plan.title}" with ${plan.tasks?.length ?? 0} tasks. Plan ID: ${plan.id}`
  },
})
