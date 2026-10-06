import { useMutation } from '@tanstack/react-query';
import { postJson, type ApiError } from '../../api/client';
import type { ClassifyRequest, ClassifyResponse } from '../../api/types';

export function useClassify() {
  return useMutation<ClassifyResponse, ApiError, ClassifyRequest>({
    mutationFn: (request) => postJson<ClassifyRequest, ClassifyResponse>('/classify', request),
  });
}
