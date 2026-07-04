import { Command } from 'commander';
import { Pipeline, loadAgent, buildAgentPrompt } from '@prism-five/orchestrator';
import { AgentRuntime } from '@prism-five/orchestrator';

export const runCommand = new Command('run')
  .description('Dispatch the current Agent: produce execution plan and LLM prompt')
  .option('-p, --prompt', 'Output the full LLM prompt')
  .option('-s, --step <n>', 'Show detailed step N')
  .action((opts) => {
    const pipeline = new Pipeline();
    const state = pipeline.getState();
    const feature = pipeline.getActiveFeature();

    if (!feature) {
      console.log('✗ No active feature. Create one with: npx prism new <slug>');
      process.exit(1);
    }

    const runtime = new AgentRuntime(state);
    const plan = runtime.dispatch(feature);

    if (opts.step) {
      const stepNum = parseInt(opts.step, 10);
      const step = plan.steps.find(s => s.step === stepNum);
      if (!step) {
        console.log(`✗ Step ${stepNum} not found. Available: 1-${plan.steps.length}`);
        process.exit(1);
      }
      console.log(`=== Step ${step.step}: ${step.title} ===`);
      console.log(step.description);
      console.log(`\nOutput: ${step.output}`);
    } else if (opts.prompt) {
      const prompt = runtime.buildPrompt(feature);
      console.log('=== SYSTEM PROMPT ===');
      console.log(prompt.system);
      console.log('\n=== USER PROMPT ===');
      console.log(prompt.user);
    } else {
      console.log(runtime.formatPlan(plan));
    }
  });
