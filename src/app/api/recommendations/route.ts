import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { projects, tasks, blockers, members } from '@/lib/db/schema';
import { eq, and, asc, desc } from 'drizzle-orm';

interface Recommendation {
  id: string;
  type: 'task' | 'project_action';
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

export async function GET() {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's organization
  const member = await db.query.members.findFirst({
    where: eq(members.userId, session.user.id),
  });

  if (!member) {
    return NextResponse.json({ recommendations: [] });
  }

  // Get active projects
  const activeProjects = await db.query.projects.findMany({
    where: and(
      eq(projects.orgId, member.orgId),
      eq(projects.status, 'active')
    ),
  });

  const recommendations: Recommendation[] = [];

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
      orderBy: (tasks, { asc }) => [asc(tasks.priority)],
    });

    // Add blocker-related recommendations
    for (const blocker of projectBlockers) {
      const score = 100 + (blocker.severity === 'critical' ? 50 : blocker.severity === 'high' ? 30 : 0);
      recommendations.push({
        id: `blocker-${blocker.id}`,
        type: 'project_action',
        projectId: project.id,
        projectName: project.name,
        projectColor: project.color || '#6366f1',
        projectStage: project.stage || 'development',
        title: `Resolve blocker: ${blocker.title}`,
        reason: `Blocking progress on ${project.name}`,
        priority: 1,
        urgency: blocker.severity === 'critical' ? 'critical' : blocker.severity === 'high' ? 'high' : 'medium',
        score,
      });
    }

    // Add task recommendations
    for (const task of projectTasks.slice(0, 3)) {
      let score = (task.priority ?? 3) * 10;
      let urgency: Recommendation['urgency'] = 'medium';

      if (task.priority === 1) {
        urgency = 'high';
        score += 20;
      } else if (task.priority === 2) {
        urgency = 'medium';
        score += 10;
      }

      // Boost score for stuck projects
      if (project.health === 'stuck') {
        score += 50;
        urgency = 'critical';
      } else if (project.health === 'red') {
        score += 30;
        urgency = 'high';
      }

      // Boost for high priority projects
      if (project.priority && project.priority >= 4) {
        score += project.priority * 5;
      }

      recommendations.push({
        id: `task-${task.id}`,
        type: 'task',
        taskId: task.id,
        projectId: project.id,
        projectName: project.name,
        projectColor: project.color || '#6366f1',
        projectStage: project.stage || 'development',
        title: task.title,
        reason: getReason(task, project),
        priority: task.priority || 3,
        urgency,
        score,
      });
    }
  }

  // Sort by score descending
  recommendations.sort((a, b) => b.score - a.score);

  return NextResponse.json({ recommendations: recommendations.slice(0, 10) });
}

function getReason(task: any, project: any): string {
  if (project.health === 'stuck') return 'Project is stuck, needs attention';
  if (project.health === 'red') return 'Project at risk, needs focus';
  if (task.priority === 1) return 'Highest priority task';
  if (project.progress && project.progress < 30) return 'Early stage project, build momentum';
  return 'Regular priority task';
}
