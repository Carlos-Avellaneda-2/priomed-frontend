import { NavLink, Outlet, useNavigate } from 'react-router';
import { ROLES } from '../features/sesion/roles';
import { useSession } from '../features/sesion/SessionContext';

/** Marco común de las pantallas con sesión: cabecera, rol activo y pie. */
export function AppShell() {
  const session = useSession();
  const navigate = useNavigate();
  const info = session.role ? ROLES[session.role] : null;

  function handleSignOut() {
    session.signOut();
    navigate('/ingreso');
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#contenido"
        className="rounded-base bg-petroleo text-blanco sr-only px-3 py-2 focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10"
      >
        Saltar al contenido
      </a>
      <header className="border-borde-suave bg-blanco border-b">
        <div className="max-w-pagina px-margen mx-auto flex flex-wrap items-center gap-x-6 gap-y-2 py-3 sm:px-6">
          <span className="font-display text-xl font-semibold">PrioMed</span>
          {info && (
            <>
              <nav aria-label="Principal">
                <NavLink
                  to={info.home}
                  className="rounded-base text-petroleo aria-[current=page]:text-tinta px-1 py-2 font-bold underline underline-offset-4 aria-[current=page]:decoration-4"
                >
                  {info.homeLabel}
                </NavLink>
              </nav>
              <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1">
                <p className="text-sm">
                  <span className="text-tinta-suave">Rol: </span>
                  <span className="font-bold">{info.label}</span>
                </p>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="rounded-base text-petroleo min-h-11 px-1 font-bold underline underline-offset-4"
                >
                  Cambiar de rol
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main
        id="contenido"
        className="max-w-pagina px-margen mx-auto w-full flex-1 py-6 sm:px-6 lg:py-10"
      >
        <Outlet />
      </main>

      <footer className="border-borde-suave border-t">
        <p className="max-w-pagina px-margen text-tinta-suave mx-auto py-4 text-sm sm:px-6">
          Prototipo académico con datos sintéticos de demostración. Ningún registro corresponde a
          pacientes reales.
        </p>
      </footer>
    </div>
  );
}
