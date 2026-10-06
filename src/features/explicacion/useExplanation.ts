import { useQuery } from '@tanstack/react-query';
import { getJson, type ApiError } from '../../api/client';
import type { Explanation } from '../../api/types';

export function useExplanation(referralId: string) {
  return useQuery<Explanation, ApiError>({
    queryKey: ['referrals', referralId, 'explanation'],
    queryFn: () => getJson<Explanation>(`/referrals/${encodeURIComponent(referralId)}/explanation`),
    // El panel ofrece su propio botón "Reintentar"; no reintentar a escondidas.
    retry: false,
  });
}
