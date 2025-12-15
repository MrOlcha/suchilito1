import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import { redirect } from 'next/navigation';

/**
 * Verifica que el usuario tenga acceso a una página del dashboard
 * Solo permite acceso a usuarios con rol 'admin'
 * 
 * @returns El usuario verificado si tiene permisos
 * @throws Redirige a /login si no está autenticado
 * @throws Redirige a /atiendemesero si no es admin
 */
export async function requireAdminDashboard() {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const user = verifyToken(token);
  
  if (!user) {
    redirect('/login');
  }

  // Solo admin puede acceder al dashboard
  if (user.rol !== 'admin') {
    redirect('/atiendemesero');
  }

  return user;
}
