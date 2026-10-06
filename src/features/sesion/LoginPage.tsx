import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router';
import type { Priority } from '../../api/types';
import { Button } from '../../components/ui/Button';
import { PriorityBand, PriorityLabel } from '../../components/ui/Priority';
import { PRIORITIES } from '../../domain/prioridad';
import { ROLE_IDS, ROLES, type Role } from './roles';
import { useSession } from './SessionContext';

const LEGEND: Record<Priority, string> = {
  HIGH: 'Franja sólida y triángulo. Requiere atención prioritaria.',
  MEDIUM: 'Franja diagonal y rombo. Atención en plazo intermedio.',
  LOW: 'Franja punteada y círculo. Atención en plazo ordinario.',
};

export function LoginPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Role>('medico');

  if (session.role) return <Navigate to={ROLES[session.role].home} replace />;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    session.signIn(selected);
    navigate(ROLES[selected].home);
  }

  return (
    <main className="max-w-pagina px-margen mx-auto grid gap-10 py-8 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:gap-16 lg:py-16">
      <div>
        <h1 className="font-display text-display font-semibold">PrioMed</h1>
        <p className="max-w-lectura mt-3 text-lg">
          Priorización de remisiones a consulta especializada. El sistema propone la prioridad; una
          persona la confirma siempre.
        </p>

        <form onSubmit={handleSubmit} className="mt-8">
          <fieldset>
            <legend className="text-lg font-bold">¿Con qué rol ingresa?</legend>
            <div className="mt-3 flex flex-col gap-2">
              {ROLE_IDS.map((role) => (
                <label
                  key={role}
                  className="rounded-base border-borde bg-blanco has-[:checked]:border-petroleo flex cursor-pointer items-start gap-3 border p-3 has-[:checked]:shadow-[inset_4px_0_0_var(--color-petroleo)] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2"
                >
                  <input
                    type="radio"
                    name="rol"
                    value={role}
                    checked={selected === role}
                    onChange={() => setSelected(role)}
                    className="mt-1 size-5 shrink-0 outline-none"
                  />
                  <span>
                    <span className="block font-bold">{ROLES[role].label}</span>
                    <span className="text-tinta-suave block">{ROLES[role].description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <Button type="submit" className="mt-5 w-full sm:w-auto">
            Ingresar
          </Button>
          <p className="text-tinta-suave mt-3 text-sm">
            Inicio de sesión simulado: no se piden credenciales y todos los datos son sintéticos.
          </p>
        </form>
      </div>

      <section aria-labelledby="leyenda-titulo" className="lg:pt-4">
        <h2 id="leyenda-titulo" className="text-lg font-bold">
          Cómo se lee la prioridad
        </h2>
        <p className="text-tinta-suave mt-1">
          Cada nivel tiene trama, forma y palabra propias. El color nunca es la única señal.
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {PRIORITIES.map((priority) => (
            <li
              key={priority}
              className="rounded-base border-borde-suave bg-blanco flex overflow-hidden border"
            >
              <PriorityBand priority={priority} />
              <div className="p-3">
                <PriorityLabel priority={priority} />
                <p className="text-tinta-suave">{LEGEND[priority]}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
