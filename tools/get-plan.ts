import { tool } from '@opencode-ai/plugin'
import { z } from 'zod'

export default tool({
  description: 'Read a plan and all its task statuses.',
  args: {
    planId: z.string().describe('Plan ID to read'),
  },
  async execute({ planId }): Promise<string> {
    const res = await fetch(`${process.env.LAST_API_URL}/api/plans/${planId}`, {
      headers: { 'Authorization': `Bearer ${process.env.LAST_API_KEY}` },
    })
    if (!res.ok) return `Failed to read plan: ${res.status}`
    const plan = await res.json()
    const tasks = plan.tasks?.map((t: { sortOrder: number; title: string; status: string }) =>
      `${t.sortOrder + 1}. [${t.status}] ${t.title}`
    ).join('\n') ?? 'No tasks'
    return `# ${plan.title}\n\n${plan.content}\n\n## Tasks\n${tasks}`
  },
})
