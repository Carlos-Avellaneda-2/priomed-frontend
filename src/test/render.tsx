import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';
import type { Role } from '../features/sesion/roles';
import { SessionProvider } from '../features/sesion/SessionContext';

interface Options {
  route?: string;
  role?: Role | null;
}

/** Renderiza con los mismos proveedores que la app, sin reintentos ni caché. */
export function renderWithProviders(ui: ReactElement, { route = '/', role = null }: Options = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <SessionProvider initialRole={role}>{ui}</SessionProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
