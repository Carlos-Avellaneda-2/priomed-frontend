import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../api/client';
import type { ClassifyRequest } from '../../api/types';
import { classifySynthetic } from '../../mocks/classify';
import { server } from '../../mocks/server';
import { renderWithProviders } from '../../test/render';
import { ReferralPage } from './ReferralPage';

const CASE_TEXT = 'Caso sintético: control por cefalea ocasional sin otros hallazgos.';

/** Registra los cuerpos enviados a POST /classify sin cambiar la respuesta. */
function captureClassifyRequests(): ClassifyRequest[] {
  const requests: ClassifyRequest[] = [];
  server.use(
    http.post<never, ClassifyRequest>(apiUrl('/classify'), async ({ request }) => {
      const body = await request.json();
      requests.push(body);
      return HttpResponse.json(classifySynthetic(body));
    }),
  );
  return requests;
}

function resultRegion() {
  return screen.getByRole('region', { name: 'Resultado de la clasificación' });
}

describe('Formulario de remisión', () => {
  it('tiene etiquetas en todos los campos', () => {
    renderWithProviders(<ReferralPage />);

    expect(screen.getByRole('textbox', { name: 'Descripción del caso' })).toBeInTheDocument();
    const urgency = screen.getByRole('group', { name: 'Urgencia según su criterio' });
    expect(within(urgency).getByRole('radio', { name: 'Baja (0)' })).toBeInTheDocument();
    expect(within(urgency).getByRole('radio', { name: 'Media (1)' })).toBeInTheDocument();
    expect(within(urgency).getByRole('radio', { name: 'Alta (2)' })).toBeInTheDocument();
  });

  it('no envía nada y explica qué falta si el formulario está incompleto', async () => {
    const user = userEvent.setup();
    const requests = captureClassifyRequests();
    renderWithProviders(<ReferralPage />);

    await user.click(screen.getByRole('button', { name: 'Clasificar remisión' }));

    const textbox = screen.getByRole('textbox', { name: 'Descripción del caso' });
    expect(textbox).toBeInvalid();
    expect(textbox).toHaveAccessibleDescription(/al menos 20 caracteres/);
    expect(textbox).toHaveFocus();
    expect(screen.getByText('Seleccione la urgencia que usted asigna al caso.')).toBeVisible();
    expect(requests).toHaveLength(0);
    expect(within(resultRegion()).getByText('Aún no hay resultado')).toBeVisible();
  });

  it('envía el texto y la urgencia a POST /classify y muestra la prioridad', async () => {
    const user = userEvent.setup();
    const requests = captureClassifyRequests();
    renderWithProviders(<ReferralPage />);

    await user.type(screen.getByRole('textbox', { name: 'Descripción del caso' }), CASE_TEXT);
    await user.click(screen.getByRole('radio', { name: 'Media (1)' }));
    await user.click(screen.getByRole('button', { name: 'Clasificar remisión' }));

    expect(await within(resultRegion()).findByText('MEDIA')).toBeVisible();
    expect(requests).toHaveLength(1);
    expect(requests[0]).toEqual({
      referral_id: expect.stringMatching(/^REM-SIM-/),
      text: CASE_TEXT,
      structured_urgency: 1,
    });
  });

  it('informa el error del servicio y permite reintentar sin reescribir', async () => {
    const user = userEvent.setup();
    server.use(
      http.post(apiUrl('/classify'), () => new HttpResponse(null, { status: 503 }), {
        once: true,
      }),
    );
    renderWithProviders(<ReferralPage />);

    await user.type(screen.getByRole('textbox', { name: 'Descripción del caso' }), CASE_TEXT);
    await user.click(screen.getByRole('radio', { name: 'Baja (0)' }));
    await user.click(screen.getByRole('button', { name: 'Clasificar remisión' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No se pudo clasificar la remisión');

    await user.click(within(alert).getByRole('button', { name: 'Reintentar' }));

    expect(await within(resultRegion()).findByText('BAJA')).toBeVisible();
  });
});
