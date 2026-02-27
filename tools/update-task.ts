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
      filePath: z.string().optional().describe('Path to screenshot file — auto-read and base64-encoded'),
      passed: z.boolean().optional().describe('For test results: did the test pass?'),
      output: z.string().optional().describe('Command/test output text'),
      url: z.string().optional().describe('URL for preview proof'),
    })).optional().describe('Evidence of task completion'),
  },
  async execute({ planId, taskId, status, proof }): Promise<string> {
    const resolved: Record<string, unknown>[] = []
    for (const p of proof ?? []) {
      if (p.filePath && !p.data) {
        const file = Bun.file(p.filePath)
        if (await file.exists()) {
          const buf = await file.arrayBuffer()
          const base64 = Buffer.from(buf).toString('base64')
          const mime = p.filePath.endsWith('.jpeg') || p.filePath.endsWith('.jpg') ? 'image/jpeg' : 'image/png'
          resolved.push({ ...p, data: `data:${mime};base64,${base64}`, filePath: undefined })
        } else {
          resolved.push({ ...p, output: `Screenshot file not found: ${p.filePath}`, filePath: undefined })
        }
      } else {
        resolved.push(p)
      }
    }

    const res = await fetch(`${process.env.LAST_API_URL}/api/plans/${planId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.LAST_API_KEY!,
      },
      body: JSON.stringify({ status, proof: resolved }),
    })
    if (!res.ok) return `Failed to update task: ${res.status}`
    return `Task ${taskId} → ${status}`
  },
})
