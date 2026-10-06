import { useState } from 'react';
import type { ClassifyRequest } from '../../api/types';
import { StatusMessage } from '../../components/ui/StatusMessage';
import { ClassificationResult } from '../clasificacion/ClassificationResult';
import { ExplanationDisclosure } from '../explicacion/ExplanationDisclosure';
import { ReferralForm, type ReferralFormValues } from './ReferralForm';
import { newReferralId } from './referralId';
import { useClassify } from './useClassify';

export function ReferralPage() {
  const classify = useClassify();
  const [lastRequest, setLastRequest] = useState<ClassifyRequest | null>(null);

  function handleSubmit(values: ReferralFormValues) {
    const request: ClassifyRequest = { referral_id: newReferralId(), ...values };
    setLastRequest(request);
    classify.mutate(request);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <section aria-labelledby="remision-titulo">
        <h1 id="remision-titulo" className="mb-5 text-2xl font-bold">
          Nueva remisión
        </h1>
        <ReferralForm onSubmit={handleSubmit} isSubmitting={classify.isPending} />
      </section>

      <section aria-labelledby="resultado-titulo">
        <h2 id="resultado-titulo" className="mb-5 text-2xl font-bold">
          Resultado de la clasificación
        </h2>
        <div aria-live="polite">
          {classify.isPending && <StatusMessage tone="loading" title="Clasificando la remisión…" />}
          {classify.isError && (
            <StatusMessage
              tone="error"
              title="No se pudo clasificar la remisión"
              onRetry={lastRequest ? () => classify.mutate(lastRequest) : undefined}
            >
              {classify.error.message} La remisión no se ha enviado; puede reintentar sin volver a
              escribirla.
            </StatusMessage>
          )}
          {classify.isSuccess && (
            <ClassificationResult key={classify.data.referral_id} result={classify.data}>
              <ExplanationDisclosure referralId={classify.data.referral_id} />
            </ClassificationResult>
          )}
          {classify.isIdle && (
            <StatusMessage tone="empty" title="Aún no hay resultado">
              Describa el caso, indique la urgencia y clasifique la remisión. La prioridad propuesta
              aparecerá aquí para que usted la valide.
            </StatusMessage>
          )}
        </div>
      </section>
    </div>
  );
}
