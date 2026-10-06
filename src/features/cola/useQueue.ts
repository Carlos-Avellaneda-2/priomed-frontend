import { useQuery } from '@tanstack/react-query';
import { getJson, type ApiError } from '../../api/client';
import type { QueueFilters, QueueItem } from '../../api/types';
import { PRIORITY_RANK } from '../../domain/prioridad';

/** Mayor prioridad primero; a igual prioridad, quien más días lleva esperando. */
export function sortQueue(items: readonly QueueItem[]): QueueItem[] {
  return [...items].sort(
    (a, b) =>
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || b.waiting_days - a.waiting_days,
  );
}

function queuePath(filters: QueueFilters): string {
  const query = new URLSearchParams();
  if (filters.specialty) query.set('specialty', filters.specialty);
  if (filters.priority) query.set('priority', filters.priority);
  const search = query.toString();
  return search ? `/referrals?${search}` : '/referrals';
}

export function useQueue(filters: QueueFilters) {
  return useQuery<QueueItem[], ApiError>({
    queryKey: ['referrals', filters],
    queryFn: () => getJson<QueueItem[]>(queuePath(filters)),
    select: sortQueue,
  });
}
