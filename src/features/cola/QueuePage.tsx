import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router';
import type { Priority, QueueFilters } from '../../api/types';
import { Button } from '../../components/ui/Button';
import { SelectField } from '../../components/ui/SelectField';
import { StatusMessage } from '../../components/ui/StatusMessage';
import { SPECIALTIES, type Option } from '../../domain/catalogos';
import { PRIORITIES, PRIORITY_LABEL } from '../../domain/prioridad';
import { ExplanationPanel } from '../explicacion/ExplanationPanel';
import { QueueRow } from './QueueRow';
import { useQueue } from './useQueue';

const NO_FILTERS: QueueFilters = { specialty: '', priority: '' };

const PRIORITY_OPTIONS: readonly Option[] = PRIORITIES.map((priority) => ({
  value: priority,
  label: PRIORITY_LABEL[priority].charAt(0) + PRIORITY_LABEL[priority].slice(1).toLowerCase(),
}));

function countText(count: number): string {
  return count === 1 ? '1 remisión' : `${count} remisiones`;
}

export function QueuePage() {
  const { referralId } = useParams();
  const [filters, setFilters] = useState<QueueFilters>(NO_FILTERS);
  const queue = useQueue(filters);
  const hasFilters = filters.specialty !== '' || filters.priority !== '';

  // Al elegir una remisión, el foco pasa al título de su explicación.
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (referralId) detailHeadingRef.current?.focus();
  }, [referralId]);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)] lg:gap-12">
      {/* En móvil, la lista cede su lugar a la explicación seleccionada. */}
      <div className={referralId ? 'hidden lg:block' : undefined}>
        <h1 className="text-2xl font-bold">Cola priorizada</h1>
        <p className="text-tinta-suave max-w-lectura mt-1">
          Ordenada por prioridad y, a igual prioridad, por días en espera. Seleccione una remisión
          para ver su explicación.
        </p>

        <form
          aria-label="Filtros de la cola"
          className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2"
          onSubmit={(event) => event.preventDefault()}
        >
          <SelectField
            label="Especialidad"
            value={filters.specialty}
            options={SPECIALTIES}
            allLabel="Todas"
            onChange={(specialty) => setFilters((current) => ({ ...current, specialty }))}
          />
          <SelectField
            label="Prioridad"
            value={filters.priority}
            options={PRIORITY_OPTIONS}
            allLabel="Todas"
            onChange={(priority) =>
              setFilters((current) => ({ ...current, priority: priority as Priority | '' }))
            }
          />
        </form>

        <section aria-label="Remisiones en cola" className="mt-6">
          <p aria-live="polite" className="mb-2 min-h-6 font-bold">
            {queue.isSuccess && countText(queue.data.length)}
          </p>

          {queue.isPending && <StatusMessage tone="loading" title="Cargando la cola…" />}

          {queue.isError && (
            <StatusMessage
              tone="error"
              title="No se pudo cargar la cola"
              onRetry={() => void queue.refetch()}
            >
              {queue.error.message}
            </StatusMessage>
          )}

          {queue.isSuccess && queue.data.length === 0 && (
            <StatusMessage
              tone="empty"
              title={
                hasFilters ? 'Ninguna remisión coincide con los filtros' : 'La cola está vacía'
              }
            >
              {hasFilters ? (
                <Button variant="secondary" className="mt-2" onClick={() => setFilters(NO_FILTERS)}>
                  Quitar filtros
                </Button>
              ) : (
                'Las remisiones clasificadas aparecerán aquí.'
              )}
            </StatusMessage>
          )}

          {queue.isSuccess && queue.data.length > 0 && (
            <ol className="flex flex-col gap-2">
              {queue.data.map((item) => {
                const isSelected = item.referral_id === referralId;
                return (
                  <li key={item.referral_id}>
                    <Link
                      to={`/cola/${encodeURIComponent(item.referral_id)}`}
                      aria-current={isSelected ? 'true' : undefined}
                      className="rounded-base border-borde-suave bg-blanco hover:border-petroleo aria-[current=true]:border-petroleo flex overflow-hidden border aria-[current=true]:shadow-[0_0_0_2px_var(--color-petroleo)]"
                    >
                      <QueueRow item={item} />
                    </Link>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>

      <section
        aria-labelledby="explicacion-titulo"
        className={referralId ? undefined : 'hidden lg:block'}
      >
        {referralId ? (
          <>
            <Link
              to="/cola"
              className="rounded-base text-petroleo mb-3 inline-flex min-h-11 items-center font-bold underline underline-offset-4 lg:hidden"
            >
              Volver a la cola
            </Link>
            <h2
              id="explicacion-titulo"
              ref={detailHeadingRef}
              tabIndex={-1}
              className="mb-4 text-xl font-bold break-words"
            >
              Explicación de {referralId}
            </h2>
            <div className="rounded-base border-borde-suave bg-blanco border p-4 sm:p-6">
              <ExplanationPanel key={referralId} referralId={referralId} />
            </div>
          </>
        ) : (
          <>
            <h2 id="explicacion-titulo" className="mb-4 text-xl font-bold">
              Explicación
            </h2>
            <StatusMessage tone="empty" title="Ninguna remisión seleccionada">
              Seleccione una remisión de la cola para ver por qué el sistema propuso su prioridad.
            </StatusMessage>
          </>
        )}
      </section>
    </div>
  );
}
