import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../api/client';
import type { ClassifyResponse, ReviewRequest, ReviewResponse } from '../../api/types';
import { server } from '../../mocks/server';
import { renderWithProviders } from '../../test/render';
import { ClassificationResult } from './ClassificationResult';

const RESULT: ClassifyResponse = {
  referral_id: 'REM-SIM-PRUEBA1',
  priority: 'HIGH',
  source: 'guardrail',
  high_score: 0.93,
  alarm_signs: ['Dolor torácico'],
  requires_human_review: true,
};

const UNCONFIRMED = 'Sin confirmar. Requiere validación humana.';
const CONFIRMED = /Confirmada por validación humana/;

/** Registra las validaciones enviadas a POST /referrals/{id}/review. */
function captureReviews(): ReviewRequest[] {
  const requests: ReviewRequest[] = [];
  server.use(
    http.post<{ id: string }, ReviewRequest, ReviewResponse>(
      apiUrl('/referrals/:id/review'),
      async ({ params, request }) => {
        const body = await request.json();
        requests.push(body);
        return HttpResponse.json({
          referral_id: params.id,
          action: body.action,
          final_priority: body.final_priority,
          reviewed_at: '2026-10-05T12:00:00.000Z',
        });
      },
    ),
  );
  return requests;
}

describe('Validación humana de la prioridad', () => {
  it('muestra prioridad, origen, puntaje y señales de alarma con texto, no solo color', () => {
    renderWithProviders(<ClassificationResult result={RESULT} />);

    expect(screen.getByText('ALTA')).toBeVisible();
    expect(screen.getByText('Regla clínica (guardrail)')).toBeVisible();
    expect(screen.getByText('0,93')).toBeVisible();
    expect(screen.getByText('Dolor torácico')).toBeVisible();
  });

  it('no queda confirmada sin acción humana', () => {
    const reviews = captureReviews();
    renderWithProviders(<ClassificationResult result={RESULT} />);

    expect(screen.getByText(UNCONFIRMED)).toBeVisible();
    expect(screen.queryByText(CONFIRMED)).not.toBeInTheDocument();
    expect(screen.getByText('Prioridad propuesta por el sistema')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Confirmar prioridad' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Corregir prioridad' })).toBeEnabled();
    expect(reviews).toHaveLength(0);
  });

  it('queda confirmada solo después de que una persona pulsa "Confirmar prioridad"', async () => {
    const user = userEvent.setup();
    const reviews = captureReviews();
    renderWithProviders(<ClassificationResult result={RESULT} />);

    await user.click(screen.getByRole('button', { name: 'Confirmar prioridad' }));

    expect(await screen.findByText(CONFIRMED)).toBeVisible();
    expect(screen.queryByText(UNCONFIRMED)).not.toBeInTheDocument();
    expect(screen.getByText('Prioridad final')).toBeVisible();
    expect(reviews).toEqual([{ action: 'confirmed', final_priority: 'HIGH' }]);
    expect(screen.queryByRole('button', { name: 'Confirmar prioridad' })).not.toBeInTheDocument();
  });

  it('permite corregir la prioridad y registra la que elige la persona', async () => {
    const user = userEvent.setup();
    const reviews = captureReviews();
    renderWithProviders(<ClassificationResult result={RESULT} />);

    await user.click(screen.getByRole('button', { name: 'Corregir prioridad' }));
    expect(screen.getByRole('button', { name: 'Guardar corrección' })).toBeDisabled();
    expect(screen.getByText(UNCONFIRMED)).toBeVisible();

    await user.click(screen.getByRole('radio', { name: /MEDIA/ }));
    await user.click(screen.getByRole('button', { name: 'Guardar corrección' }));

    expect(
      await screen.findByText('Corregida por validación humana. El sistema había propuesto ALTA.'),
    ).toBeVisible();
    expect(screen.getByText('MEDIA')).toBeVisible();
    expect(reviews).toEqual([{ action: 'corrected', final_priority: 'MEDIUM' }]);
  });

  it('sigue sin confirmar si el servicio no registra la validación', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(apiUrl('/referrals/:id/review'), () => new HttpResponse(null, { status: 500 })),
    );
    renderWithProviders(<ClassificationResult result={RESULT} />);

    await user.click(screen.getByRole('button', { name: 'Confirmar prioridad' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar la validación');
    expect(screen.getByText(UNCONFIRMED)).toBeVisible();
    expect(screen.queryByText(CONFIRMED)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar prioridad' })).toBeEnabled();
  });
});
