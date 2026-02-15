import { tool } from "@opencode-ai/plugin";

export default tool({
  description:
    "List all plans for the current project. Returns plan IDs, titles, and statuses.",
  args: {},
  async execute(): Promise<string> {
    const res = await fetch(
      `${process.env.LAST_API_URL}/api/plans?projectId=${process.env.LAST_PROJECT_ID}`,
      { headers: { "x-api-key": process.env.LAST_API_KEY! } },
    );
    if (!res.ok) return `Failed to list plans: ${res.status}`;
    const data = await res.json();
    const plans = data.plans;
    if (!plans?.length) return "No plans found for this project.";
    return plans
      .map(
        (p: { status: string; title: string; id: string }, i: number) =>
          `${i + 1}. [${p.status}] ${p.title} (id: ${p.id})`,
      )
      .join("\n");
  },
});
