import type { ComplianceAggregate, ComplianceQuery } from '../api/types';

/**
 * Agregado sintético y determinista por consulta. Devuelve null cuando el
 * grupo sería demasiado pequeño para publicarse (la API responde 204).
 */
export function aggregateSynthetic(query: ComplianceQuery): ComplianceAggregate | null {
  const isSmallGroup =
    query.specialty === 'reumatologia' || (query.ips === 'ips-demo-c' && query.week === '2026-W37');
  if (isSmallGroup) return null;

  const seed = hash(`${query.ips}|${query.specialty}|${query.week}`);
  return {
    referrals_processed: 40 + (seed % 180),
    avg_wait_days: 4 + ((seed >> 3) % 220) / 10,
    pct_within_mgte_threshold: 55 + ((seed >> 5) % 440) / 10,
  };
}

function hash(text: string): number {
  let value = 7;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) % 1_000_003;
  return value;
}
