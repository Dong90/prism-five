import { z } from 'zod';

// AgentRole
export const AgentRoleSchema = z.enum(['prototyper', 'builder', 'sweeper', 'grower', 'maintainer']);
export type AgentRole = z.infer<typeof AgentRoleSchema>;

// FeatureState
export const FeatureStateSchema = z.enum([
  'draft',
  'exploring',
  'prototype_done',
  'building',
  'build_done',
  'sweeping',
  'sweep_done',
  'growing',
  'grow_done',
  'releasing',
  'live',
  'incident',
  'deprecated',
  'sunset',
]);
export type FeatureState = z.infer<typeof FeatureStateSchema>;

// GateState
export const GateStateSchema = z.object({
  prototype_approved: z.boolean().default(false),
  build_reviewed: z.boolean().default(false),
  sweep_passed: z.boolean().default(false),
  release_approved: z.boolean().default(false),
});
export type GateState = z.infer<typeof GateStateSchema>;

// Feature
export const FeatureSchema = z.object({
  slug: z.string().min(1).max(64),
  status: FeatureStateSchema,
  currentRole: AgentRoleSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  stageHistory: z.array(
    z.object({
      role: AgentRoleSchema,
      enteredAt: z.string(),
      completedAt: z.string().optional(),
    }),
  ),
  gates: GateStateSchema,
  exemptions: z
    .array(
      z.object({
        stage: AgentRoleSchema,
        reason: z.string(),
        createdAt: z.string(),
        expiresAt: z.string().optional(),
        approver: z.string().optional(),
        autoTrigger: z.string().optional(),
      }),
    )
    .optional(),
});
export type Feature = z.infer<typeof FeatureSchema>;
export type Exemption = Feature['exemptions'] extends (infer E)[] | undefined ? E : never;

// ProductStage
export const ProductStageSchema = z.enum(['exploring', 'building', 'growing', 'mature']);
export type ProductStage = z.infer<typeof ProductStageSchema>;

// PipelineState
export const PipelineStateSchema = z.object({
  version: z.string().default('0.1.0'),
  productStage: ProductStageSchema,
  activeFeature: z.string().nullable(),
  features: z.record(z.string(), FeatureSchema),
  queue: z
    .array(
      z.union([
        z.string(),
        z.object({ slug: z.string(), priority: z.enum(['P0', 'P1', 'P2']), addedAt: z.string() }),
      ]),
    )
    .default([]),
  updated: z.string(),
});
export type PipelineState = z.infer<typeof PipelineStateSchema>;

// Role ordering
export const ROLE_ORDER: AgentRole[] = ['prototyper', 'builder', 'sweeper', 'grower', 'maintainer'];
export function nextRole(current: AgentRole): AgentRole | null {
  const i = ROLE_ORDER.indexOf(current);
  if (i >= 0 && i < ROLE_ORDER.length - 1) {
    const next = ROLE_ORDER[i + 1];
    return next ?? null;
  }
  return null;
}

// Agent definition
export const AgentDefinitionSchema = z.object({
  name: z.string(),
  role: AgentRoleSchema,
  paradigm: z.enum(['Explorer', 'Operator', 'Scout', 'Analyst', 'Guardian', 'Navigator']),
  skillPath: z.string(),
});
export type AgentDefinition = z.infer<typeof AgentDefinitionSchema>;

export const AGENT_MAP: Record<AgentRole, AgentDefinition> = {
  prototyper: {
    name: 'pentad-prototype',
    role: 'prototyper',
    paradigm: 'Explorer',
    skillPath: '.pentad/agents/prototyper.md',
  },
  builder: {
    name: 'pentad-build',
    role: 'builder',
    paradigm: 'Operator',
    skillPath: '.pentad/agents/builder.md',
  },
  sweeper: {
    name: 'pentad-sweep',
    role: 'sweeper',
    paradigm: 'Scout',
    skillPath: '.pentad/agents/sweeper.md',
  },
  grower: {
    name: 'pentad-grow',
    role: 'grower',
    paradigm: 'Analyst',
    skillPath: '.pentad/agents/grower.md',
  },
  maintainer: {
    name: 'pentad-maintain',
    role: 'maintainer',
    paradigm: 'Guardian',
    skillPath: '.pentad/agents/maintainer.md',
  },
};
