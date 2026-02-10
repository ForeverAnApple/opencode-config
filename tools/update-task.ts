import { tool } from '@opencode-ai/plugin'
import { z } from 'zod'

export default tool({
  description: 'Update a plan task\'s status and attach proof of completion. Call after completing each task in a plan execution.',
  args: {
    planId: z.string().describe('Plan ID'),
    taskId: z.string().describe('Task ID'),
    status: z.enum(['in_progress', 'completed', 'failed', 'skipped']),
    proof: z.array(z.object({
      type: z.enum(['screenshot', 'test_result', 'log', 'preview']),
      label: z.string().describe('Short description of this proof'),
      data: z.string().optional().describe('Base64 data URL for screenshots'),
      passed: z.boolean().optional().describe('For test results: did the test pass?'),
      output: z.string().optional().describe('Command/test output text'),
      url: z.string().optional().describe('URL for preview proof'),
    })).optional().describe('Evidence of task completion'),
  },
  async execute({ planId, taskId, status, proof }): Promise<string> {
    const res = await fetch(`${process.env.LAST_API_URL}/api/plans/${planId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.LAST_API_KEY}`,
      },
      body: JSON.stringify({ status, proof }),
    })
    if (!res.ok) return `Failed to update task: ${res.status}`
    return `Task ${taskId} → ${status}`
  },
})
