import { delay, http, HttpResponse, type HttpHandler } from 'msw';
import { apiUrl } from '../api/client';
import type {
  ClassifyRequest,
  ClassifyResponse,
  ComplianceAggregate,
  Explanation,
  QueueItem,
  ReviewRequest,
  ReviewResponse,
} from '../api/types';
import { classifySynthetic } from './classify';
import { aggregateSynthetic } from './compliance';
import { FLAKY_EXPLANATION_ID, QUEUE } from './data';
import { explainSynthetic } from './explanation';

/** Escribir este texto en un caso hace que el servicio simulado falle. */
export const SIMULATED_FAILURE_MARK = '[simular error]';

/* Estado de la sesión simulada (solo en memoria; se pierde al recargar). */
const classified = new Map<string, ClassifyResponse>();
const reviews = new Map<string, ReviewResponse>();
const explanationFailedOnce = new Set<string>();

function findDecision(id: string) {
  const fromSession = classified.get(id);
  if (fromSession) return fromSession;
  const fromQueue = QUEUE.find((item) => item.referral_id === id);
  if (!fromQueue) return undefined;
  return {
    ...fromQueue,
    alarm_signs: fromQueue.source === 'guardrail' ? ['Señal sintética de demostración'] : [],
  };
}

/** Manejadores de MSW compartidos por el navegador (desarrollo) y las pruebas. */
export const handlers: HttpHandler[] = [
  http.post<never, ClassifyRequest, ClassifyResponse>(apiUrl('/classify'), async ({ request }) => {
    const body = await request.json();
    await delay();
    if (body.text.includes(SIMULATED_FAILURE_MARK)) {
      return new HttpResponse(null, { status: 503 }) as never;
    }
    const result = classifySynthetic(body);
    classified.set(result.referral_id, result);
    return HttpResponse.json(result);
  }),

  http.post<{ id: string }, ReviewRequest, ReviewResponse>(
    apiUrl('/referrals/:id/review'),
    async ({ params, request }) => {
      const body = await request.json();
      await delay();
      const review: ReviewResponse = {
        referral_id: params.id,
        action: body.action,
        final_priority: body.final_priority,
        reviewed_at: new Date().toISOString(),
      };
      reviews.set(params.id, review);
      return HttpResponse.json(review);
    },
  ),

  http.get<never, never, QueueItem[]>(apiUrl('/referrals'), async ({ request }) => {
    const query = new URL(request.url).searchParams;
    const specialty = query.get('specialty');
    const priority = query.get('priority');
    await delay();
    const items = QUEUE.filter(
      (item) =>
        (!specialty || item.specialty === specialty) && (!priority || item.priority === priority),
    ).map((item) => {
      const review = reviews.get(item.referral_id);
      return review
        ? { ...item, priority: review.final_priority, review_status: review.action }
        : item;
    });
    return HttpResponse.json(items);
  }),

  http.get<{ id: string }, never, Explanation>(
    apiUrl('/referrals/:id/explanation'),
    async ({ params }) => {
      await delay();
      if (params.id === FLAKY_EXPLANATION_ID && !explanationFailedOnce.has(params.id)) {
        explanationFailedOnce.add(params.id);
        return new HttpResponse(null, { status: 503 }) as never;
      }
      const decision = findDecision(params.id);
      if (!decision) return new HttpResponse(null, { status: 404 }) as never;
      return HttpResponse.json(explainSynthetic(decision));
    },
  ),

  http.get<never, never, ComplianceAggregate>(
    apiUrl('/compliance-aggregate'),
    async ({ request }) => {
      const query = new URL(request.url).searchParams;
      const ips = query.get('ips');
      const specialty = query.get('specialty');
      const week = query.get('week');
      await delay();
      if (!ips || !specialty || !week) return new HttpResponse(null, { status: 400 }) as never;
      const aggregate = aggregateSynthetic({ ips, specialty, week });
      // Grupo demasiado pequeño: sin cuerpo, para no exponer casos individuales.
      if (!aggregate) return new HttpResponse(null, { status: 204 }) as never;
      return HttpResponse.json(aggregate);
    },
  ),
];
