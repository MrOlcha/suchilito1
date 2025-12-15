import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '../lib/auth';

export default function HomePage() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token);
  if (!user) {
    redirect('/login');
  }

  redirect('/dashboard');
}