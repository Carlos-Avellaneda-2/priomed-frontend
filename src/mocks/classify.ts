import type { ClassifyRequest, ClassifyResponse, Priority } from '../api/types';

/**
 * Imitación sintética del servicio de clasificación: un guardrail de señales
 * de alarma por palabras clave y, si no hay ninguna, un puntaje que depende
 * solo de la urgencia estructurada. No es el modelo real, pero devuelve los
 * mismos códigos de señal de alarma que el servicio de clasificación.
 */
const ALARM_PATTERNS: readonly { sign: string; pattern: RegExp }[] = [
  { sign: 'dolor_toracico', pattern: /dolor toracico|dolor en el pecho|opresion en el pecho/ },
  {
    sign: 'ideacion_suicida',
    pattern: /ideacion suicida|pensamientos de muerte|pensamientos suicidas/,
  },
  {
    sign: 'dificultad_respiratoria',
    pattern: /dificultad para respirar|falta de aire|disnea|ahogo/,
  },
  { sign: 'sincope', pattern: /desmayo|sincope|perdida de conocimiento/ },
  { sign: 'herida_arma_fuego', pattern: /herida por arma de fuego|disparo/ },
];

const ML_SCORE_BY_URGENCY = [0.16, 0.47, 0.78] as const;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

function priorityFromScore(score: number): Priority {
  if (score >= 0.7) return 'HIGH';
  if (score >= 0.4) return 'MEDIUM';
  return 'LOW';
}

export function classifySynthetic(request: ClassifyRequest): ClassifyResponse {
  const text = normalize(request.text);
  const alarmSigns = ALARM_PATTERNS.filter(({ pattern }) => pattern.test(text)).map(
    ({ sign }) => sign,
  );

  if (alarmSigns.length > 0) {
    return {
      referral_id: request.referral_id,
      priority: 'HIGH',
      source: 'guardrail',
      high_score: Math.min(0.99, 0.9 + 0.03 * alarmSigns.length),
      alarm_signs: alarmSigns,
      requires_human_review: true,
    };
  }

  const score = ML_SCORE_BY_URGENCY[request.structured_urgency];
  return {
    referral_id: request.referral_id,
    priority: priorityFromScore(score),
    source: 'ml',
    high_score: score,
    alarm_signs: [],
    requires_human_review: true,
  };
}
