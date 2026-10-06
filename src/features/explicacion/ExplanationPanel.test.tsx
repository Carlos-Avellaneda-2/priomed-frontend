import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../api/client';
import { server } from '../../mocks/server';
import { renderWithProviders } from '../../test/render';
import { ExplanationPanel } from './ExplanationPanel';

describe('Panel de explicación', () => {
  it('muestra el estado de carga y luego la explicación', async () => {
    renderWithProviders(<ExplanationPanel referralId="REM-SIM-0004" />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando la explicación…');

    expect(await screen.findByText(/Una regla clínica detectó señales de alarma/)).toBeVisible();
    expect(screen.getByText('ALTA')).toBeVisible();
    expect(screen.getByText('Regla clínica (guardrail)')).toBeVisible();
    expect(screen.getByText('Aumenta la prioridad')).toBeVisible();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('muestra el error y carga la explicación al reintentar', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        apiUrl('/referrals/:id/explanation'),
        () => new HttpResponse(null, { status: 503 }),
        { once: true },
      ),
    );
    renderWithProviders(<ExplanationPanel referralId="REM-SIM-0001" />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No se pudo cargar la explicación');

    await user.click(within(alert).getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText(/El modelo estadístico estimó un puntaje/)).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('avisa cuando la remisión no tiene explicación registrada', async () => {
    renderWithProviders(<ExplanationPanel referralId="REM-SIM-NO-EXISTE" />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No hay una explicación registrada para esta remisión.',
    );
  });
});
