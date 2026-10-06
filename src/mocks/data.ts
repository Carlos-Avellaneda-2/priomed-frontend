import type { QueueItem } from '../api/types';

/**
 * Cola sintética de demostración. Los identificadores llevan el prefijo
 * REM-SIM y no hay nombres, documentos ni datos de personas.
 */
export const QUEUE: readonly QueueItem[] = [
  item('0001', 'cardiologia', 'MEDIUM', 'ml', 0.52, 9),
  item('0002', 'oncologia', 'HIGH', 'guardrail', 0.96, 3),
  item('0003', 'neurologia', 'LOW', 'ml', 0.14, 21),
  item('0004', 'cardiologia', 'HIGH', 'guardrail', 0.93, 6),
  item('0005', 'reumatologia', 'LOW', 'ml', 0.22, 34),
  item('0006', 'neurologia', 'HIGH', 'ml', 0.81, 2),
  item('0007', 'oncologia', 'MEDIUM', 'ml', 0.61, 12),
  item('0008', 'cardiologia', 'LOW', 'ml', 0.18, 15),
  item('0009', 'neurologia', 'MEDIUM', 'ml', 0.44, 18),
  item('0010', 'oncologia', 'HIGH', 'guardrail', 0.99, 1),
  item('0011', 'cardiologia', 'MEDIUM', 'ml', 0.58, 4),
  item('0012', 'neurologia', 'LOW', 'ml', 0.09, 27),
];

/** La explicación de esta remisión falla la primera vez, para probar el reintento. */
export const FLAKY_EXPLANATION_ID = 'REM-SIM-0007';

function item(
  suffix: string,
  specialty: string,
  priority: QueueItem['priority'],
  source: QueueItem['source'],
  high_score: number,
  waiting_days: number,
): QueueItem {
  return {
    referral_id: `REM-SIM-${suffix}`,
    specialty,
    priority,
    source,
    high_score,
    review_status: 'pending',
    waiting_days,
  };
}
