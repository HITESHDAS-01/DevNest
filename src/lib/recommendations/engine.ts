import { db } from '@/lib/db';
import { projects, tasks, blockers, milestones } from '@/lib/db/schema';
import { eq, and, lte, gte } from 'drizzle-orm';

export interface Recommendation {
  id: string;
  type: 'task' | 'milestone' | 'maintenance' | 'project_action';
  taskId?: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  projectStage: string;
  title: string;
  reason: string;
  priority: number;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  score: number;
}

export async function getRecommendations(orgId: string): Promise<Recommendation[]> {
  const recommendations: Recommendation[] = [];

  // Get active projects
  const activeProjects = await db.query.projects.findMany({
    where: and(
      eq(projects.orgId, orgId),
      eq(projects.status, 'active')
    ),
  });

  for (const project of activeProjects) {
    // Get open blockers
    const projectBlockers = await db.query.blockers.findMany({
      where: and(
        eq(blockers.projectId, project.id),
        eq(blockers.status, 'open')
      ),
    });

    // Get pending tasks sorted by priority
    const projectTasks = await db.query.tasks.findMany({
      where: and(
        eq(tasks.projectId, project.id),
        eq(tasks.status, 'todo')
      ),
    });

    // Get overdue milestones
    const overdueMilestones = await db.query.milestones.findMany({
      where: and(
        eq(milestones.projectId, project.id),
        eq(milestones.status, 'pending'),
        lte(milestones.targetDate, new Date().toISOString().split('T')[0])
      ),
    });

    // Add blocker-related recommendations
    for (const blocker of projectBlockers) {
      const score = calculateBlockerScore(blocker, project);
      recommendations.push({
        id: `blocker-${blocker.id}`,
        type: 'project_action',
        projectId: project.id,
        projectName: project.name,
        projectColor: project.color || '#6366f1',
        projectStage: project.stage || 'development',
        title: `Resolve blocker: ${blocker.title}`,
        reason: getBlockerReason(blocker, project),
        priority: 1,
        urgency: getBlockerUrgency(blocker),
        score,
      });
    }

    // Add task recommendations
    for (const task of projectTasks) {
      const score = calculateTaskScore(task, project);
      recommendations.push({
        id: `task-${task.id}`,
        type: 'task',
        taskId: task.id,
        projectId: project.id,
        projectName: project.name,
        projectColor: project.color || '#6366f1',
        projectStage: project.stage || 'development',
        title: task.title,
        reason: getTaskReason(task, project),
        priority: task.priority || 3,
        urgency: getTaskUrgency(task, project),
        score,
      });
    }

    // Add overdue milestone recommendations
    for (const milestone of overdueMilestones) {
      recommendations.push({
        id: `milestone-${milestone.id}`,
        type: 'milestone',
        projectId: project.id,
        projectName: project.name,
        projectColor: project.color || '#6366f1',
        projectStage: project.stage || 'development',
        title: `Complete milestone: ${milestone.name}`,
        reason: 'Milestone is overdue',
        priority: 1,
        urgency: 'critical',
        score: 150,
      });
    }
  }

  // Sort by score descending
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations.slice(0, 10);
}

function calculateBlockerScore(blocker: any, project: any): number {
  let score = 100;

  // Severity bonus
  if (blocker.severity === 'critical') score += 50;
  else if (blocker.severity === 'high') score += 30;
  else if (blocker.severity === 'medium') score += 10;

  // Project health bonus
  if (project.health === 'stuck') score += 50;
  else if (project.health === 'red') score += 30;

  // Priority bonus
  if (project.priority && project.priority >= 4) {
    score += project.priority * 5;
  }

  return score;
}

function calculateTaskScore(task: any, project: any): number {
  let score = 0;

  // Priority scoring (1 = highest)
  score += (6 - (task.priority || 3)) * 10;

  // Project health bonus
  if (project.health === 'stuck') score += 50;
  else if (project.health === 'red') score += 30;

  // Project priority bonus
  if (project.priority && project.priority >= 4) {
    score += project.priority * 5;
  }

  // Early stage bonus (momentum)
  if (project.progress !== null && project.progress < 30) {
    score += 20;
  }

  // Due date bonus
  if (task.dueDate) {
    const dueDate = new Date(task.dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue < 0) {
      // Overdue
      score += Math.min(50, Math.abs(daysUntilDue) * 5);
    } else if (daysUntilDue <= 3) {
      // Due soon
      score += 20;
    }
  }

  return score;
}

function getBlockerReason(blocker: any, project: any): string {
  if (project.health === 'stuck') return 'Project is stuck, needs immediate attention';
  if (project.health === 'red') return 'Project at risk, this blocker is critical';
  return `Blocking progress on ${project.name}`;
}

function getBlockerUrgency(blocker: any): 'critical' | 'high' | 'medium' | 'low' {
  if (blocker.severity === 'critical') return 'critical';
  if (blocker.severity === 'high') return 'high';
  if (blocker.severity === 'medium') return 'medium';
  return 'low';
}

function getTaskReason(task: any, project: any): string {
  if (project.health === 'stuck') return 'Project is stuck, needs focus';
  if (project.health === 'red') return 'Project at risk, needs attention';
  if (task.priority === 1) return 'Highest priority task';
  if (project.progress !== null && project.progress < 30) return 'Early stage, build momentum';
  return 'Regular priority task';
}

function getTaskUrgency(task: any, project: any): 'critical' | 'high' | 'medium' | 'low' {
  if (project.health === 'stuck') return 'critical';
  if (project.health === 'red') return 'high';
  if (task.priority === 1) return 'high';
  if (task.priority === 2) return 'medium';
  return 'low';
}
