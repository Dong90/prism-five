/**
 * @prism-five/orchestrator — 调度引擎
 * Pipeline 状态管理、门禁检查、Agent 路由。
 */

export { Pipeline } from './pipeline';
export type { PipelineState, FeatureState, AgentRole, GateState } from './schema';
export { checkHumanGate, checkAutoGate } from './gate';
export { readPipeline, writePipeline } from './state';
