import { useState } from 'react';
import type { ComplianceAggregate, ComplianceQuery } from '../../api/types';
import { SelectField } from '../../components/ui/SelectField';
import { StatusMessage } from '../../components/ui/StatusMessage';
import { IPS_OPTIONS, labelOf, SPECIALTIES, WEEKS } from '../../domain/catalogos';
import { useCompliance } from './useCompliance';

const INITIAL_QUERY: ComplianceQuery = {
  ips: IPS_OPTIONS[0]?.value ?? '',
  specialty: SPECIALTIES[0]?.value ?? '',
  week: WEEKS[0]?.value ?? '',
};

const integerFormat = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });
const decimalFormat = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export function CompliancePage() {
  const [query, setQuery] = useState<ComplianceQuery>(INITIAL_QUERY);
  const compliance = useCompliance(query);

  function update(field: keyof ComplianceQuery) {
    return (value: string) => setQuery((current) => ({ ...current, [field]: value }));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Cumplimiento MGTE</h1>
      <p className="text-tinta-suave max-w-lectura mt-1">
        Indicadores del Modelo de Gestión de Tiempos de Espera, agregados y anonimizados por IPS,
        especialidad y semana. Esta vista no muestra remisiones ni datos individuales.
      </p>

      <form
        aria-label="Consulta de cumplimiento"
        className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3"
        onSubmit={(event) => event.preventDefault()}
      >
        <SelectField label="IPS" value={query.ips} options={IPS_OPTIONS} onChange={update('ips')} />
        <SelectField
          label="Especialidad"
          value={query.specialty}
          options={SPECIALTIES}
          onChange={update('specialty')}
        />
        <SelectField label="Semana" value={query.week} options={WEEKS} onChange={update('week')} />
      </form>

      <section aria-labelledby="indicadores-titulo" className="mt-8">
        <h2 id="indicadores-titulo" className="text-xl font-bold">
          {labelOf(IPS_OPTIONS, query.ips)}, {labelOf(SPECIALTIES, query.specialty)},{' '}
          {labelOf(WEEKS, query.week).toLowerCase()}
        </h2>

        <div aria-live="polite" className="mt-4">
          {compliance.isPending && <StatusMessage tone="loading" title="Cargando indicadores…" />}

          {compliance.isError && (
            <StatusMessage
              tone="error"
              title="No se pudieron cargar los indicadores"
              onRetry={() => void compliance.refetch()}
            >
              {compliance.error.message}
            </StatusMessage>
          )}

          {compliance.isSuccess && compliance.data === null && (
            <StatusMessage tone="info" title="No hay datos suficientes para mostrar">
              Para proteger la privacidad, no se publican indicadores cuando el grupo consultado es
              demasiado pequeño. Pruebe con otra IPS, especialidad o semana.
            </StatusMessage>
          )}

          {compliance.isSuccess && compliance.data !== null && (
            <Indicators aggregate={compliance.data} />
          )}
        </div>
      </section>
    </div>
  );
}

function Indicators({ aggregate }: { aggregate: ComplianceAggregate }) {
  const pct = Math.min(100, Math.max(0, aggregate.pct_within_mgte_threshold));
  return (
    <dl className="rounded-base border-borde-suave divide-borde-suave bg-blanco grid divide-y border md:grid-cols-3 md:divide-x md:divide-y-0">
      <div className="flex flex-col-reverse justify-end p-4 sm:p-6">
        <dt className="text-tinta-suave">Remisiones procesadas</dt>
        <dd className="font-display text-display font-semibold">
          {integerFormat.format(aggregate.referrals_processed)}
        </dd>
      </div>
      <div className="flex flex-col-reverse justify-end p-4 sm:p-6">
        <dt className="text-tinta-suave">Espera promedio</dt>
        <dd className="font-display text-display font-semibold">
          {decimalFormat.format(aggregate.avg_wait_days)}
          <span className="text-xl"> días</span>
        </dd>
      </div>
      <div className="flex flex-col-reverse justify-end p-4 sm:p-6">
        <dt className="text-tinta-suave">
          Dentro del umbral MGTE
          <span
            aria-hidden="true"
            className="rounded-base border-borde bg-niebla mt-2 block h-3 overflow-hidden border"
          >
            <span className="bg-petroleo block h-full" style={{ width: `${pct}%` }} />
          </span>
        </dt>
        <dd className="font-display text-display font-semibold">
          {decimalFormat.format(aggregate.pct_within_mgte_threshold)}
          <span className="text-xl"> %</span>
        </dd>
      </div>
    </dl>
  );
}
