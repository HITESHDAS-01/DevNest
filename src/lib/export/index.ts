import { db } from '@/lib/db';
import {
  projects,
  tasks,
  milestones,
  blockers,
  notes,
  decisions,
  ideas,
  maintenanceItems,
  resources,
  activityLog,
  phases,
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export interface ProjectExport {
  project: any;
  phases: any[];
  milestones: any[];
  tasks: any[];
  blockers: any[];
  notes: any[];
  decisions: any[];
  ideas: any[];
  maintenanceItems: any[];
  resources: any[];
  activityLog: any[];
}

export async function exportProject(slugOrId: string): Promise<ProjectExport> {
  const resolvedId = await (await import('@/lib/db/helpers')).resolveProjectId(slugOrId);
  const projectId = resolvedId || slugOrId;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const [
    projectPhases,
    projectMilestones,
    projectTasks,
    projectBlockers,
    projectNotes,
    projectDecisions,
    projectIdeas,
    projectMaintenanceItems,
    projectResources,
    projectActivityLog,
  ] = await Promise.all([
    db.query.phases.findMany({ where: eq(phases.projectId, projectId) }),
    db.query.milestones.findMany({ where: eq(milestones.projectId, projectId) }),
    db.query.tasks.findMany({ where: eq(tasks.projectId, projectId) }),
    db.query.blockers.findMany({ where: eq(blockers.projectId, projectId) }),
    db.query.notes.findMany({ where: eq(notes.projectId, projectId) }),
    db.query.decisions.findMany({ where: eq(decisions.projectId, projectId) }),
    db.query.ideas.findMany({ where: eq(ideas.projectId, projectId) }),
    db.query.maintenanceItems.findMany({
      where: eq(maintenanceItems.projectId, projectId),
    }),
    db.query.resources.findMany({ where: eq(resources.projectId, projectId) }),
    db.query.activityLog.findMany({ where: eq(activityLog.projectId, projectId) }),
  ]);

  return {
    project,
    phases: projectPhases,
    milestones: projectMilestones,
    tasks: projectTasks,
    blockers: projectBlockers,
    notes: projectNotes,
    decisions: projectDecisions,
    ideas: projectIdeas,
    maintenanceItems: projectMaintenanceItems,
    resources: projectResources,
    activityLog: projectActivityLog,
  };
}

export function exportToJSON(data: ProjectExport): string {
  return JSON.stringify(data, null, 2);
}

export function exportToCSV(data: ProjectExport): string {
  const lines: string[] = [];

  // Tasks CSV
  lines.push('Type,Title,Status,Priority,Description');
  for (const task of data.tasks) {
    lines.push(
      `Task,"${escapeCSV(task.title)}",${task.status},${task.priority},"${escapeCSV(task.description || '')}"`
    );
  }

  // Blockers CSV
  for (const blocker of data.blockers) {
    lines.push(
      `Blocker,"${escapeCSV(blocker.title)}",${blocker.status},${blocker.severity},"${escapeCSV(blocker.description || '')}"`
    );
  }

  // Notes CSV
  for (const note of data.notes) {
    lines.push(
      `Note,"${escapeCSV(note.title)}",,,"${escapeCSV(note.content || '')}"`
    );
  }

  // Decisions CSV
  for (const decision of data.decisions) {
    lines.push(
      `Decision,"${escapeCSV(decision.title)}",,,"${escapeCSV(decision.rationale || '')}"`
    );
  }

  return lines.join('\n');
}

function escapeCSV(value: string): string {
  return value.replace(/"/g, '""');
}
