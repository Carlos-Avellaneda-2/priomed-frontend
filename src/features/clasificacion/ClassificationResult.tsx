import { useState, type FormEvent, type ReactNode } from 'react';
import type { ClassifyResponse, Priority } from '../../api/types';
import { Button } from '../../components/ui/Button';
import { PriorityBand, PriorityLabel } from '../../components/ui/Priority';
import { StatusMessage } from '../../components/ui/StatusMessage';
import { formatScore, PRIORITIES, PRIORITY_LABEL, SOURCE_LABEL } from '../../domain/prioridad';
import { alarmSignLabel } from '../../domain/senalesAlarma';
import { useReview } from './useReview';

interface ClassificationResultProps {
  result: ClassifyResponse;
  /** Contenido adicional bajo los datos (por ejemplo, la explicación). */
  children?: ReactNode;
}

/**
 * Prioridad propuesta por el sistema y su validación humana. La prioridad
 * solo se muestra como confirmada cuando el servicio registra la acción de
 * una persona; hasta entonces permanece "Sin confirmar".
 */
export function ClassificationResult({ result, children }: ClassificationResultProps) {
  const review = useReview(result.referral_id);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correction, setCorrection] = useState<Priority | null>(null);

  const reviewed = review.data;
  const shownPriority = reviewed?.final_priority ?? result.priority;
  const alternatives = PRIORITIES.filter((priority) => priority !== result.priority);

  function handleConfirm() {
    review.mutate({ action: 'confirmed', final_priority: result.priority });
  }

  function handleCorrectionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (correction) review.mutate({ action: 'corrected', final_priority: correction });
  }

  return (
    <article className="rounded-base border-borde-suave bg-blanco flex overflow-hidden border">
      <PriorityBand priority={shownPriority} />
      <div className="min-w-0 flex-1 p-4 sm:p-6">
        <p className="text-tinta-suave">
          {reviewed ? 'Prioridad final' : 'Prioridad propuesta por el sistema'}
        </p>
        <PriorityLabel priority={shownPriority} size="lg" />

        <ValidationStatus proposed={result.priority} reviewed={reviewed} />

        <dl className="border-borde-suave mt-5 grid gap-x-6 gap-y-3 border-t pt-4 sm:grid-cols-[auto_1fr]">
          <dt className="text-tinta-suave">Remisión</dt>
          <dd className="font-bold break-all">{result.referral_id}</dd>
          <dt className="text-tinta-suave">Origen de la decisión</dt>
          <dd className="font-bold">{SOURCE_LABEL[result.source]}</dd>
          <dt className="text-tinta-suave">Puntaje de riesgo</dt>
          <dd>
            <span className="font-bold">{formatScore(result.high_score)}</span> de {formatScore(1)}
          </dd>
          <dt className="text-tinta-suave">Señales de alarma</dt>
          <dd>
            {result.alarm_signs.length === 0 ? (
              'Ninguna detectada'
            ) : (
              <ul className="list-disc pl-5 font-bold">
                {result.alarm_signs.map((sign) => (
                  <li key={sign}>{alarmSignLabel(sign)}</li>
                ))}
              </ul>
            )}
          </dd>
        </dl>

        {children}

        {!reviewed && (
          <div className="border-borde-suave mt-5 border-t pt-4">
            {review.isError && (
              <div className="mb-4">
                <StatusMessage tone="error" title="No se pudo guardar la validación">
                  {review.error.message} La prioridad sigue sin confirmar. Intente de nuevo.
                </StatusMessage>
              </div>
            )}

            {isCorrecting ? (
              <form onSubmit={handleCorrectionSubmit}>
                <fieldset>
                  <legend className="font-bold">Prioridad correcta</legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {alternatives.map((priority) => (
                      <label
                        key={priority}
                        className="rounded-base border-borde has-[:checked]:border-petroleo flex min-h-11 cursor-pointer items-center gap-2 border px-3 py-2 has-[:checked]:shadow-[inset_0_-4px_0_var(--color-petroleo)] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2"
                      >
                        <input
                          type="radio"
                          name="prioridad-correcta"
                          value={priority}
                          checked={correction === priority}
                          onChange={() => setCorrection(priority)}
                          className="size-5 shrink-0 outline-none"
                        />
                        <PriorityLabel priority={priority} size="sm" />
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="submit" disabled={!correction || review.isPending}>
                    {review.isPending ? 'Guardando…' : 'Guardar corrección'}
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={review.isPending}
                    onClick={() => {
                      setIsCorrecting(false);
                      setCorrection(null);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Button onClick={handleConfirm} disabled={review.isPending}>
                  {review.isPending ? 'Guardando…' : 'Confirmar prioridad'}
                </Button>
                <Button
                  variant="secondary"
                  disabled={review.isPending}
                  onClick={() => setIsCorrecting(true)}
                >
                  Corregir prioridad
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function ValidationStatus({
  proposed,
  reviewed,
}: {
  proposed: Priority;
  reviewed: { action: 'confirmed' | 'corrected' } | undefined;
}) {
  if (!reviewed) {
    return (
      <p className="rounded-base border-tinta mt-3 inline-flex items-center gap-2 border border-dashed px-3 py-1.5 font-bold">
        <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5 shrink-0">
          <circle
            cx="10"
            cy="10"
            r="7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="3 3"
          />
        </svg>
        Sin confirmar. Requiere validación humana.
      </p>
    );
  }
  return (
    <p className="rounded-base border-exito bg-exito-tinte text-exito mt-3 inline-flex items-center gap-2 border px-3 py-1.5 font-bold">
      <svg viewBox="0 0 20 20" aria-hidden="true" className="size-5 shrink-0">
        <circle cx="10" cy="10" r="9" fill="currentColor" />
        <path d="m5.5 10.5 3 3 6-6.5" fill="none" stroke="#fff" strokeWidth="2.2" />
      </svg>
      {reviewed.action === 'confirmed'
        ? 'Confirmada por validación humana.'
        : `Corregida por validación humana. El sistema había propuesto ${PRIORITY_LABEL[proposed]}.`}
    </p>
  );
}
