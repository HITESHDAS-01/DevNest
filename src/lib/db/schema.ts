import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const projectStageEnum = pgEnum('project_stage', [
  'idea',
  'planning',
  'development',
  'testing',
  'launch',
  'maintenance',
]);

export const projectStatusEnum = pgEnum('project_status', [
  'active',
  'paused',
  'archived',
]);

export const projectHealthEnum = pgEnum('project_health', [
  'green',
  'yellow',
  'red',
  'stuck',
]);

export const memberRoleEnum = pgEnum('member_role', [
  'owner',
  'admin',
  'member',
]);

export const taskStatusEnum = pgEnum('task_status', [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'done',
]);

export const blockerSeverityEnum = pgEnum('blocker_severity', [
  'low',
  'medium',
  'high',
  'critical',
]);

export const blockerStatusEnum = pgEnum('blocker_status', [
  'open',
  'resolved',
]);

export const phaseStatusEnum = pgEnum('phase_status', [
  'pending',
  'active',
  'completed',
]);

export const milestoneStatusEnum = pgEnum('milestone_status', [
  'pending',
  'active',
  'completed',
]);

export const maintenanceTypeEnum = pgEnum('maintenance_type', [
  'bug',
  'improvement',
  'debt',
  'docs',
  'update',
]);

export const maintenanceStatusEnum = pgEnum('maintenance_status', [
  'open',
  'in_progress',
  'resolved',
]);

export const ideaStatusEnum = pgEnum('idea_status', [
  'parked',
  'planned',
  'in_progress',
  'done',
]);

export const effortEnum = pgEnum('effort', ['small', 'medium', 'large']);

export const resourceTypeEnum = pgEnum('resource_type', [
  'link',
  'file',
  'doc',
]);

// Organizations (tenants)
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').unique().notNull(),
  logoUrl: text('logo_url'),
  plan: text('plan').default('free'),
  settings: jsonb('settings').default({}),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Members (org membership)
export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  role: memberRoleEnum('role').default('member'),
  joinedAt: timestamp('joined_at').defaultNow(),
});

// Projects
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  color: text('color').default('#6366f1'),
  icon: text('icon'),
  repoUrl: text('repo_url'),
  stage: projectStageEnum('stage').default('idea'),
  status: projectStatusEnum('status').default('active'),
  health: projectHealthEnum('health').default('green'),
  priority: integer('priority').default(3),
  progress: integer('progress').default(0),
  startedAt: timestamp('started_at'),
  targetLaunchAt: timestamp('target_launch_at'),
  launchedAt: timestamp('launched_at'),
  memoryPurpose: text('memory_purpose'),
  memoryProblem: text('memory_problem'),
  memoryDecisions: text('memory_decisions'),
  memoryKnownIssues: text('memory_known_issues'),
  memoryFuturePlans: text('memory_future_plans'),
  createdBy: uuid('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Phases
export const phases = pgTable('phases', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  stage: projectStageEnum('stage').notNull(),
  name: text('name').notNull(),
  status: phaseStatusEnum('status').default('pending'),
  order: integer('order').notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Milestones
export const milestones = pgTable('milestones', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  targetDate: date('target_date'),
  status: milestoneStatusEnum('status').default('pending'),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tasks
export const tasks = pgTable('tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  milestoneId: uuid('milestone_id').references(() => milestones.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  description: text('description'),
  status: taskStatusEnum('status').default('backlog'),
  priority: integer('priority').default(3),
  estimateMinutes: integer('estimate_minutes'),
  timeSpentMinutes: integer('time_spent_minutes').default(0),
  tags: text('tags').array().default([]),
  order: integer('order').notNull(),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Blockers
export const blockers = pgTable('blockers', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  taskId: uuid('task_id').references(() => tasks.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  description: text('description'),
  severity: blockerSeverityEnum('severity').default('medium'),
  status: blockerStatusEnum('status').default('open'),
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

// Notes
export const notes = pgTable('notes', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  content: text('content'),
  tags: text('tags').array().default([]),
  pinned: boolean('pinned').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Decisions
export const decisions = pgTable('decisions', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  context: text('context'),
  options: jsonb('options').default([]),
  chosen: text('chosen'),
  rationale: text('rationale'),
  decidedAt: timestamp('decided_at').defaultNow(),
});

// Ideas
export const ideas = pgTable('ideas', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  description: text('description'),
  priority: integer('priority').default(3),
  effort: effortEnum('effort'),
  status: ideaStatusEnum('status').default('parked'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Maintenance Items
export const maintenanceItems = pgTable('maintenance_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  type: maintenanceTypeEnum('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  priority: integer('priority').default(3),
  severity: blockerSeverityEnum('severity').default('medium'),
  status: maintenanceStatusEnum('status').default('open'),
  createdAt: timestamp('created_at').defaultNow(),
  resolvedAt: timestamp('resolved_at'),
});

// Resources
export const resources = pgTable('resources', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  type: resourceTypeEnum('type').default('link'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Activity Log
export const activityLog = pgTable('activity_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  entityType: text('entity_type').notNull(),
  entityId: uuid('entity_id'),
  action: text('action').notNull(),
  details: jsonb('details'),
  userId: uuid('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tags
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  color: text('color').default('#6b7280'),
});

// GitHub Integrations
export const githubIntegrations = pgTable('github_integrations', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  repoOwner: text('repo_owner').notNull(),
  repoName: text('repo_name').notNull(),
  webhookSecret: text('webhook_secret'),
  syncEnabled: boolean('sync_enabled').default(true),
  lastSyncedAt: timestamp('last_synced_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// API Keys
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id')
    .references(() => organizations.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  keyHash: text('key_hash').notNull(),
  keyPrefix: text('key_prefix').notNull(),
  lastUsedAt: timestamp('last_used_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relations
export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(members),
  projects: many(projects),
  tags: many(tags),
  apiKeys: many(apiKeys),
}));

export const usersRelations = relations(users, ({ many }) => ({
  members: many(members),
  projects: many(projects),
}));

export const membersRelations = relations(members, ({ one }) => ({
  organization: one(organizations, {
    fields: [members.orgId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [projects.orgId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [projects.createdBy],
    references: [users.id],
  }),
  phases: many(phases),
  milestones: many(milestones),
  tasks: many(tasks),
  blockers: many(blockers),
  notes: many(notes),
  decisions: many(decisions),
  ideas: many(ideas),
  maintenanceItems: many(maintenanceItems),
  resources: many(resources),
  activityLog: many(activityLog),
  githubIntegration: one(githubIntegrations),
}));

export const phasesRelations = relations(phases, ({ one }) => ({
  project: one(projects, {
    fields: [phases.projectId],
    references: [projects.id],
  }),
}));

export const milestonesRelations = relations(milestones, ({ one, many }) => ({
  project: one(projects, {
    fields: [milestones.projectId],
    references: [projects.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  milestone: one(milestones, {
    fields: [tasks.milestoneId],
    references: [milestones.id],
  }),
}));

export const blockersRelations = relations(blockers, ({ one }) => ({
  project: one(projects, {
    fields: [blockers.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [blockers.taskId],
    references: [tasks.id],
  }),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  project: one(projects, {
    fields: [notes.projectId],
    references: [projects.id],
  }),
}));

export const decisionsRelations = relations(decisions, ({ one }) => ({
  project: one(projects, {
    fields: [decisions.projectId],
    references: [projects.id],
  }),
}));

export const ideasRelations = relations(ideas, ({ one }) => ({
  project: one(projects, {
    fields: [ideas.projectId],
    references: [projects.id],
  }),
}));

export const maintenanceItemsRelations = relations(
  maintenanceItems,
  ({ one }) => ({
    project: one(projects, {
      fields: [maintenanceItems.projectId],
      references: [projects.id],
    }),
  })
);

export const resourcesRelations = relations(resources, ({ one }) => ({
  project: one(projects, {
    fields: [resources.projectId],
    references: [projects.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  project: one(projects, {
    fields: [activityLog.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one }) => ({
  organization: one(organizations, {
    fields: [tags.orgId],
    references: [organizations.id],
  }),
}));

export const githubIntegrationsRelations = relations(
  githubIntegrations,
  ({ one }) => ({
    project: one(projects, {
      fields: [githubIntegrations.projectId],
      references: [projects.id],
    }),
  })
);

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  organization: one(organizations, {
    fields: [apiKeys.orgId],
    references: [organizations.id],
  }),
}));
