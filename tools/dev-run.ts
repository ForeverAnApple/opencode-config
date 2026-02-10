import { tool } from '@opencode-ai/plugin'
import { $ } from 'bun'

interface LastConfig {
  name: string
  scripts: {
    dev: string | string[]
    lint?: string
  }
}

async function getLastConfig(): Promise<LastConfig> {
  const cfg = await Bun.file('last.json').json().catch(() => null)
  if (!cfg?.name) throw new Error('Missing "name" in last.json')
  if (!cfg?.scripts?.dev) throw new Error('Missing "scripts.dev" in last.json')
  return cfg as LastConfig
}

async function isPm2Online(name: string): Promise<boolean> {
  const { exitCode, stdout } = await $`pm2 jlist`.nothrow().quiet()
  if (exitCode !== 0) return false
  try {
    const list = JSON.parse(stdout.toString())
    return list.some((p: any) => p?.name === name && p?.pm2_env?.status === 'online')
  } catch {
    return false
  }
}

export default tool({
  description: 'Start dev server and run lint.',
  args: {},
  async execute(): Promise<string> {
    const cfg = await getLastConfig()
    const output: string[] = []

    // Run lint
    if (cfg.scripts.lint) {
      const result = await $`${{ raw: cfg.scripts.lint }}`.nothrow().quiet()
      if (result.exitCode !== 0) {
        output.push('LINT FAILED:')
        output.push(result.stdout.toString())
        output.push(result.stderr.toString())
        return output.join('\n')
      }
      output.push('✓ Lint passed')
    }

    // Start dev server(s) via PM2
    const commands = Array.isArray(cfg.scripts.dev) ? cfg.scripts.dev : [cfg.scripts.dev]
    for (let i = 0; i < commands.length; i++) {
      const name = commands.length > 1 ? `${cfg.name}:${i + 1}` : cfg.name
      if (await isPm2Online(name)) {
        // Flush stale logs before restart so dev-logs only shows fresh output
        await $`pm2 flush ${name}`.nothrow().quiet()
        await $`pm2 restart ${name}`.nothrow().quiet()
        output.push(`✓ ${name} restarted (logs flushed)`)
      } else {
        const result = await $`pm2 start ${commands[i]} --name ${name}`.nothrow().quiet()
        if (result.exitCode !== 0) {
          output.push(`✗ Failed to start ${name}:`)
          output.push(result.stderr.toString())
        } else {
          output.push(`✓ Started ${name}`)
        }
      }
    }

    return output.join('\n')
  },
})
