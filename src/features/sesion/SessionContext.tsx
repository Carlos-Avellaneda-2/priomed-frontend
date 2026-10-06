import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { isRole, type Role } from './roles';

const STORAGE_KEY = 'priomed.rol';

interface SessionValue {
  role: Role | null;
  signIn: (role: Role) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionValue | null>(null);

function readStoredRole(): Role | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return isRole(stored) ? stored : null;
  } catch {
    return null;
  }
}

function storeRole(role: Role | null) {
  try {
    if (role) sessionStorage.setItem(STORAGE_KEY, role);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Sin almacenamiento disponible la sesión vive solo en memoria.
  }
}

interface SessionProviderProps {
  children: ReactNode;
  /** Rol inicial explícito (pruebas). Si se omite, se lee de sessionStorage. */
  initialRole?: Role | null;
}

/** Sesión simulada: guarda solo el rol elegido, sin credenciales. */
export function SessionProvider({ children, initialRole }: SessionProviderProps) {
  const [role, setRole] = useState<Role | null>(() =>
    initialRole === undefined ? readStoredRole() : initialRole,
  );

  const signIn = useCallback((next: Role) => {
    storeRole(next);
    setRole(next);
  }, []);

  const signOut = useCallback(() => {
    storeRole(null);
    setRole(null);
  }, []);

  const value = useMemo(() => ({ role, signIn, signOut }), [role, signIn, signOut]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession debe usarse dentro de SessionProvider');
  return value;
}
