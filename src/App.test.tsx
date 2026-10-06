import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { renderWithProviders } from './test/render';

describe('Acceso por rol', () => {
  it('sin sesión, cualquier ruta lleva al ingreso', async () => {
    renderWithProviders(<App />, { route: '/cumplimiento' });

    expect(await screen.findByRole('heading', { name: 'PrioMed' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Ingresar' })).toBeVisible();
  });

  it('el médico ve la remisión y no puede abrir la cola ni el tablero', async () => {
    renderWithProviders(<App />, { route: '/cola', role: 'medico' });

    expect(await screen.findByRole('heading', { name: 'Nueva remisión' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Cola priorizada' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Cola priorizada' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Cumplimiento MGTE' })).not.toBeInTheDocument();
  });

  it('la IPS ve la cola y no puede abrir la remisión', async () => {
    renderWithProviders(<App />, { route: '/remision', role: 'ips' });

    expect(await screen.findByRole('heading', { name: 'Cola priorizada' })).toBeVisible();
    expect(screen.queryByRole('heading', { name: 'Nueva remisión' })).not.toBeInTheDocument();
  });

  it('el regulador solo ve el tablero agregado', async () => {
    renderWithProviders(<App />, { route: '/cola/REM-SIM-0004', role: 'regulador' });

    expect(await screen.findByRole('heading', { name: 'Cumplimiento MGTE' })).toBeVisible();
    expect(screen.queryByText(/REM-SIM-/)).not.toBeInTheDocument();
  });

  it('"Cambiar de rol" cierra la sesión y vuelve al ingreso', async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: '/remision', role: 'medico' });

    await user.click(await screen.findByRole('button', { name: 'Cambiar de rol' }));

    expect(await screen.findByRole('button', { name: 'Ingresar' })).toBeVisible();
  });
});
