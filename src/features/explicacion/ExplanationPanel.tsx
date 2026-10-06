import type { ExplanationFactor } from '../../api/types';
import { PriorityLabel } from '../../components/ui/Priority';
import { StatusMessage } from '../../components/ui/StatusMessage';
import { formatScore, SOURCE_LABEL } from '../../domain/prioridad';
import { useExplanation } from './useExplanation';

const EFFECT_LABEL: Record<ExplanationFactor['effect'], string> = {
  increases: 'Aumenta la prioridad',
  decreases: 'Reduce la prioridad',
};

/** Carga y muestra por qué el sistema propuso la prioridad de una remisión. */
export function ExplanationPanel({ referralId }: { referralId: string }) {
  const explanation = useExplanation(referralId);

  return (
    <div aria-live="polite">
      {explanation.isPending && <StatusMessage tone="loading" title="Cargando la explicación…" />}

      {explanation.isError && (
        <StatusMessage
          tone="error"
          title="No se pudo cargar la explicación"
          onRetry={() => void explanation.refetch()}
        >
          {explanation.error.status === 404
            ? 'No hay una explicación registrada para esta remisión.'
            : explanation.error.message}
        </StatusMessage>
      )}

      {explanation.isSuccess && (
        <div className="flex flex-col gap-4">
          <PriorityLabel priority={explanation.data.priority} />
          <p className="max-w-lectura">{explanation.data.summary}</p>

          <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[auto_1fr]">
            <dt className="text-tinta-suave">Origen de la decisión</dt>
            <dd className="font-bold">{SOURCE_LABEL[explanation.data.source]}</dd>
            <dt className="text-tinta-suave">Puntaje de riesgo</dt>
            <dd>
              <span className="font-bold">{formatScore(explanation.data.high_score)}</span> de{' '}
              {formatScore(1)}
            </dd>
          </dl>

          <div>
            <h3 className="font-bold">Factores que pesaron</h3>
            {explanation.data.factors.length === 0 ? (
              <p className="text-tinta-suave">El servicio no informó factores para este caso.</p>
            ) : (
              <ul className="divide-borde-suave border-borde-suave mt-1 divide-y border-y">
                {explanation.data.factors.map((factor) => (
                  <li key={factor.label} className="flex items-start gap-3 py-2">
                    <EffectIcon effect={factor.effect} />
                    <span>
                      <span className="block">{factor.label}</span>
                      <span className="text-tinta-suave block text-sm">
                        {EFFECT_LABEL[factor.effect]}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="text-tinta-suave max-w-lectura text-sm">
            La explicación describe la propuesta del sistema. La decisión final es siempre de una
            persona.
          </p>
        </div>
      )}
    </div>
  );
}

function EffectIcon({ effect }: { effect: ExplanationFactor['effect'] }) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="text-tinta mt-1 size-4 shrink-0">
      {effect === 'increases' ? (
        <path d="M10 3 18 16H2L10 3Z" fill="currentColor" />
      ) : (
        <path d="M10 17 2 4h16L10 17Z" fill="none" stroke="currentColor" strokeWidth="2" />
      )}
    </svg>
  );
}
