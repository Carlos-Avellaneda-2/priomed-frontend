import type { ClassifyResponse, Explanation } from '../api/types';
import { alarmSignLabel } from '../domain/senalesAlarma';
import { formatScore, PRIORITY_LABEL } from '../domain/prioridad';

type Explainable = Pick<
  ClassifyResponse,
  'referral_id' | 'priority' | 'source' | 'high_score' | 'alarm_signs'
>;

/** Explicación sintética coherente con la clasificación simulada. */
export function explainSynthetic(decision: Explainable): Explanation {
  const base = {
    referral_id: decision.referral_id,
    priority: decision.priority,
    source: decision.source,
    high_score: decision.high_score,
    alarm_signs: decision.alarm_signs,
  };

  if (decision.source === 'guardrail') {
    return {
      ...base,
      summary:
        'Una regla clínica detectó señales de alarma en el texto y fijó la prioridad en ALTA, sin depender del modelo estadístico.',
      factors: decision.alarm_signs.map((sign) => ({
        label: `Señal de alarma: ${alarmSignLabel(sign)}`,
        effect: 'increases',
      })),
    };
  }

  return {
    ...base,
    summary: `El modelo estadístico estimó un puntaje de riesgo de ${formatScore(decision.high_score)}. Con ese puntaje, la prioridad propuesta es ${PRIORITY_LABEL[decision.priority]}.`,
    factors: [
      {
        label: 'Urgencia estructurada indicada por el médico remitente',
        effect: decision.priority === 'LOW' ? 'decreases' : 'increases',
      },
      { label: 'Sin señales de alarma en el texto del caso', effect: 'decreases' },
    ],
  };
}
