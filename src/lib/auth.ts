import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'devnest-super-secret-key-change-in-production-abc123xyz'
);

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}

export interface Session {
  user: User;
}

export async function createToken(user: User): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('devnest-token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSession(user: User): Promise<void> {
  const token = await createToken(user);
  const cookieStore = await cookies();
  cookieStore.set('devnest-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('devnest-token');
}
