import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { exportProject, exportToJSON, exportToCSV } from '@/lib/export';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'json';

  try {
    const data = await exportProject(id);

    if (format === 'csv') {
      const csv = exportToCSV(data);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${data.project.slug}-export.csv"`,
        },
      });
    }

    const json = exportToJSON(data);
    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${data.project.slug}-export.json"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
