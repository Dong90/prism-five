import { z } from 'zod';

// ─── Profile ─────────────────────────────────────────────────

/** Supported profile names. Each maps to .prism/profiles/<name>/ with 5 agent files. */
export const ProfileNameSchema = z.enum([
  'develop',
  'observability',
  'security',
  'video',
  'collab',
  'experiment',
]);
export type ProfileName = z.infer<typeof ProfileNameSchema>;

/** Token budget per agent role (in tokens). */
export const TokenBudgetSchema = z.object({
  prototyper: z.number().int().min(1).default(30000),
  builder: z.number().int().min(1).default(80000),
  sweeper: z.number().int().min(1).default(20000),
  grower: z.number().int().min(1).default(30000),
  maintainer: z.number().int().min(1).default(20000),
  used: z.record(z.string(), z.number()).default({}),
});
export type TokenBudget = z.infer<typeof TokenBudgetSchema>;

/** Artifacts that must exist for each role to pass gate. */
export const ArtifactManifestSchema = z.record(
  z.string(),
  z.array(z.string()),
);
export type ArtifactManifest = z.infer<typeof ArtifactManifestSchema>;

/** Default artifact manifest — what each role must produce. */
export const DEFAULT_ARTIFACT_MANIFEST: ArtifactManifest = {
  prototyper: ['raw/RESEARCH.md', 'raw/PRD.md', 'raw/INITIATE.md'],
  builder: ['built/DESIGN.md', 'built/TASK.md'],
  sweeper: ['swept/REVIEW.md', 'swept/INSPECT.md'],
  grower: ['grown/ANALYZE.md'],
  maintainer: ['live/RELEASE_CHECK.md', 'live/CHANGELOG.md'],
};

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
  profile: ProfileNameSchema.default('develop'),
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
  artifacts: z.record(z.string(), z.array(z.string())).default({}),
  exemptions: z.array(z.object({
    stage: AgentRoleSchema,
    reason: z.string(),
    createdAt: z.string(),
    expiresAt: z.string().optional(),
    approver: z.string().optional(),
  })).optional(),
});
export type Feature = z.infer<typeof FeatureSchema>;

// ProductStage
export const ProductStageSchema = z.enum(['exploring', 'building', 'growing', 'mature']);
export type ProductStage = z.infer<typeof ProductStageSchema>;

// PipelineState
export const PipelineStateSchema = z.object({
  version: z.string().default('0.2.0'),
  productStage: ProductStageSchema,
  activeProfile: ProfileNameSchema.default('develop'),
  activeFeature: z.string().nullable(),
  features: z.record(z.string(), FeatureSchema),
  tokenBudget: TokenBudgetSchema.default({}),
  artifactManifest: ArtifactManifestSchema.default(DEFAULT_ARTIFACT_MANIFEST),
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
  prototyper: { name: 'prism-prototype', role: 'prototyper', paradigm: 'Explorer', skillPath: '.prism/agents/prototyper.md' },
  builder: { name: 'prism-build', role: 'builder', paradigm: 'Operator', skillPath: '.prism/agents/builder.md' },
  sweeper: { name: 'prism-sweep', role: 'sweeper', paradigm: 'Scout', skillPath: '.prism/agents/sweeper.md' },
  grower: { name: 'prism-grow', role: 'grower', paradigm: 'Analyst', skillPath: '.prism/agents/grower.md' },
  maintainer: { name: 'prism-maintain', role: 'maintainer', paradigm: 'Guardian', skillPath: '.prism/agents/maintainer.md' },
};
