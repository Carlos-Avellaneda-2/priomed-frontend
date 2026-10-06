import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { apiUrl } from '../../api/client';
import { server } from '../../mocks/server';
import { renderWithProviders } from '../../test/render';
import { QueuePage } from './QueuePage';

async function findRows() {
  const list = await screen.findByRole('list');
  return within(list).getAllByRole('listitem');
}

describe('Cola priorizada', () => {
  it('ordena por prioridad y luego por días en espera', async () => {
    renderWithProviders(<QueuePage />);

    const rows = await findRows();
    const priorities = rows.map((row) => row.textContent?.match(/ALTA|MEDIA|BAJA/)?.[0]);

    expect(priorities).toEqual([...priorities].sort(byRank));
    expect(rows[0]).toHaveTextContent('REM-SIM-0004');
    expect(rows[0]).toHaveTextContent('6 días en espera');
    expect(screen.getByText('12 remisiones')).toBeVisible();
  });

  it('filtra por especialidad y prioridad', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QueuePage />);
    await findRows();

    await user.selectOptions(screen.getByRole('combobox', { name: 'Especialidad' }), 'Oncología');
    await user.selectOptions(screen.getByRole('combobox', { name: 'Prioridad' }), 'Alta');

    expect(await screen.findByText('2 remisiones')).toBeVisible();
    const rows = await findRows();
    expect(rows).toHaveLength(2);
    for (const row of rows) {
      expect(row).toHaveTextContent('ALTA');
      expect(row).toHaveTextContent('Oncología');
    }
  });

  it('explica cuando ningún caso coincide y deja quitar los filtros', async () => {
    const user = userEvent.setup();
    renderWithProviders(<QueuePage />);
    await findRows();

    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Especialidad' }),
      'Reumatología',
    );
    await user.selectOptions(screen.getByRole('combobox', { name: 'Prioridad' }), 'Alta');

    expect(await screen.findByText('Ninguna remisión coincide con los filtros')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Quitar filtros' }));

    expect(await screen.findByText('12 remisiones')).toBeVisible();
  });

  it('muestra el error del servicio y permite reintentar', async () => {
    const user = userEvent.setup();
    server.use(
      http.get(apiUrl('/referrals'), () => new HttpResponse(null, { status: 500 }), {
        once: true,
      }),
    );
    renderWithProviders(<QueuePage />);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No se pudo cargar la cola');

    await user.click(within(alert).getByRole('button', { name: 'Reintentar' }));

    expect(await findRows()).toHaveLength(12);
  });
});

const RANK: Record<string, number> = { ALTA: 0, MEDIA: 1, BAJA: 2 };

function byRank(a: string | undefined, b: string | undefined): number {
  return (RANK[a ?? ''] ?? 9) - (RANK[b ?? ''] ?? 9);
}
