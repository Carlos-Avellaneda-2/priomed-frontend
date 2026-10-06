import { useQuery } from '@tanstack/react-query';
import { getJsonOrNoContent, type ApiError } from '../../api/client';
import type { ComplianceAggregate, ComplianceQuery } from '../../api/types';

/**
 * Agregado de cumplimiento. `data === null` significa que la API respondió
 * 204 No Content: no hay datos suficientes para publicar sin comprometer la
 * privacidad. No es un error.
 */
export function useCompliance(query: ComplianceQuery) {
  return useQuery<ComplianceAggregate | null, ApiError>({
    queryKey: ['compliance-aggregate', query],
    queryFn: () => {
      const search = new URLSearchParams({
        ips: query.ips,
        specialty: query.specialty,
        week: query.week,
      });
      return getJsonOrNoContent<ComplianceAggregate>(`/compliance-aggregate?${search.toString()}`);
    },
  });
}
