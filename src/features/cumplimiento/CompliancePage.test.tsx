import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../api/client';
import type { ComplianceAggregate } from '../../api/types';
import { server } from '../../mocks/server';
import { renderWithProviders } from '../../test/render';
import { CompliancePage } from './CompliancePage';

const NO_DATA_TITLE = 'No hay datos suficientes para mostrar';

function indicators() {
  return screen.getByRole('region', { name: /IPS de demostración/ });
}

describe('Tablero de cumplimiento MGTE', () => {
  it('consulta con IPS, especialidad y semana, y muestra los tres indicadores', async () => {
    const searches: string[] = [];
    const aggregate: ComplianceAggregate = {
      referrals_processed: 128,
      avg_wait_days: 12.4,
      pct_within_mgte_threshold: 86.5,
    };
    server.use(
      http.get(apiUrl('/compliance-aggregate'), ({ request }) => {
        searches.push(new URL(request.url).search);
        return HttpResponse.json(aggregate);
      }),
    );
    renderWithProviders(<CompliancePage />);

    const region = within(indicators());
    expect(await region.findByText('128')).toBeVisible();
    expect(region.getByText('Remisiones procesadas')).toBeVisible();
    expect(region.getByText('12,4')).toBeVisible();
    expect(region.getByText('Espera promedio')).toBeVisible();
    expect(region.getByText('86,5')).toBeVisible();
    expect(region.getByText('Dentro del umbral MGTE')).toBeVisible();
    expect(searches).toEqual(['?ips=ips-demo-a&specialty=cardiologia&week=2026-W40']);
  });

  it('trata el 204 No Content como falta de datos por privacidad, no como error', async () => {
    server.use(
      http.get(apiUrl('/compliance-aggregate'), () => new HttpResponse(null, { status: 204 })),
    );
    renderWithProviders(<CompliancePage />);

    const region = within(indicators());
    expect(await region.findByText(NO_DATA_TITLE)).toBeVisible();
    expect(region.getByText(/Para proteger la privacidad/)).toBeVisible();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(region.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
    expect(region.queryByText('Remisiones procesadas')).not.toBeInTheDocument();
  });

  it('pasa de indicadores al aviso de privacidad cuando el filtro deja un grupo pequeño', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompliancePage />);

    const region = within(indicators());
    expect(await region.findByText('Remisiones procesadas')).toBeVisible();

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Especialidad' }),
      'Reumatología',
    );

    expect(await screen.findByText(NO_DATA_TITLE)).toBeVisible();
    expect(screen.queryByText('Remisiones procesadas')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra un error real como error y permite reintentar', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(apiUrl('/compliance-aggregate'), () => new HttpResponse(null, { status: 500 }), {
        once: true,
      }),
    );
    renderWithProviders(<CompliancePage />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No se pudieron cargar los indicadores');
    expect(screen.queryByText(NO_DATA_TITLE)).not.toBeInTheDocument();

    await user.click(within(alert).getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Remisiones procesadas')).toBeVisible();
  });
});
