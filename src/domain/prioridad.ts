import type { DecisionSource, Priority, StructuredUrgency } from '../api/types';

/** De mayor a menor: así se ordena la cola y se listan las opciones. */
export const PRIORITIES: readonly Priority[] = ['HIGH', 'MEDIUM', 'LOW'];

export const PRIORITY_LABEL: Record<Priority, string> = {
  HIGH: 'ALTA',
  MEDIUM: 'MEDIA',
  LOW: 'BAJA',
};

export const PRIORITY_RANK: Record<Priority, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export const URGENCY_OPTIONS: readonly { value: StructuredUrgency; label: string }[] = [
  { value: 0, label: 'Baja' },
  { value: 1, label: 'Media' },
  { value: 2, label: 'Alta' },
];

export const SOURCE_LABEL: Record<DecisionSource, string> = {
  guardrail: 'Regla clínica (guardrail)',
  ml: 'Modelo estadístico (ML)',
};

const scoreFormat = new Intl.NumberFormat('es-CO', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatScore(score: number): string {
  return scoreFormat.format(score);
}
