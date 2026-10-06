import { Route, Routes } from 'react-router';
import { QueuePage } from './features/cola/QueuePage';
import { CompliancePage } from './features/cumplimiento/CompliancePage';
import { ReferralPage } from './features/remision/ReferralPage';
import { LoginPage } from './features/sesion/LoginPage';
import { HomeRedirect, RequireRole } from './features/sesion/RequireRole';
import { AppShell } from './layout/AppShell';

export function App() {
  return (
    <Routes>
      <Route path="/ingreso" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route element={<RequireRole role="medico" />}>
          <Route path="/remision" element={<ReferralPage />} />
        </Route>
        <Route element={<RequireRole role="ips" />}>
          <Route path="/cola/:referralId?" element={<QueuePage />} />
        </Route>
        <Route element={<RequireRole role="regulador" />}>
          <Route path="/cumplimiento" element={<CompliancePage />} />
        </Route>
      </Route>
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  );
}
