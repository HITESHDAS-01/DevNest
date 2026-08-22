import { NextResponse } from 'next/server';
import { setSession } from '@/lib/auth';

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Demo mode: accept any email/password
  const user = {
    id: `user-${Date.now()}`,
    email,
    name: email.split('@')[0],
    image: null,
  };

  await setSession(user);

  return NextResponse.json({ user });
}
