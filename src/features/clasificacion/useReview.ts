import { useMutation } from '@tanstack/react-query';
import { postJson, type ApiError } from '../../api/client';
import type { ReviewRequest, ReviewResponse } from '../../api/types';

/** Registra la validación humana de una remisión (confirmar o corregir). */
export function useReview(referralId: string) {
  return useMutation<ReviewResponse, ApiError, ReviewRequest>({
    mutationFn: (request) =>
      postJson<ReviewRequest, ReviewResponse>(
        `/referrals/${encodeURIComponent(referralId)}/review`,
        request,
      ),
  });
}
