import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test/render';
import { LoginPage } from './LoginPage';

function renderLogin() {
  return renderWithProviders(
    <Routes>
      <Route path="/ingreso" element={<LoginPage />} />
      <Route path="/remision" element={<p>Pantalla del médico</p>} />
      <Route path="/cumplimiento" element={<p>Pantalla del regulador</p>} />
    </Routes>,
    { route: '/ingreso' },
  );
}

describe('Inicio de sesión simulado', () => {
  it('ofrece los tres roles y propone médico por defecto', () => {
    renderLogin();

    expect(screen.getByRole('radio', { name: /médico remitente/i })).toBeChecked();
    expect(screen.getByRole('radio', { name: /^IPS/ })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: /regulador/i })).not.toBeChecked();
  });

  it('lleva al inicio del rol elegido', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('radio', { name: /regulador/i }));
    await user.click(screen.getByRole('button', { name: 'Ingresar' }));

    expect(await screen.findByText('Pantalla del regulador')).toBeInTheDocument();
  });
});
