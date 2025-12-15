import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default function CajaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  const cajaAuth = cookieStore.get('caja_auth')?.value;

  // Permitir acceso si:
  // 1. Tiene un token válido (usuario logueado)
  // 2. Tiene autenticación de caja (PIN validado)
  const hasTokenAuth = token && verifyToken(token);
  const hasCajaAuth = cajaAuth === '7933';

  if (!hasTokenAuth && !hasCajaAuth) {
    redirect('/caja/login');
  }

  // Layout limpio para caja - sin navbar ni sidebar
  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  );
}
