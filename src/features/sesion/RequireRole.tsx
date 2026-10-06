import { Navigate, Outlet } from 'react-router';
import { ROLES, type Role } from './roles';
import { useSession } from './SessionContext';

/** Deja pasar solo al rol indicado; a los demás los devuelve a su inicio. */
export function RequireRole({ role }: { role: Role }) {
  const session = useSession();
  if (!session.role) return <Navigate to="/ingreso" replace />;
  if (session.role !== role) return <Navigate to={ROLES[session.role].home} replace />;
  return <Outlet />;
}

/** Destino por defecto: el inicio del rol activo o la pantalla de ingreso. */
export function HomeRedirect() {
  const session = useSession();
  return <Navigate to={session.role ? ROLES[session.role].home : '/ingreso'} replace />;
}
