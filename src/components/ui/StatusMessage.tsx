import type { ReactNode } from 'react';
import { Button } from './Button';

type Tone = 'loading' | 'empty' | 'error' | 'info';

const TONE_CLASS: Record<Tone, string> = {
  loading: 'border-borde-suave bg-blanco',
  empty: 'border-borde-suave border-dashed bg-transparent',
  error: 'border-carmin bg-carmin-tinte',
  info: 'border-petroleo bg-blanco',
};

interface StatusMessageProps {
  tone: Tone;
  title: string;
  children?: ReactNode;
  /** Solo para errores recuperables: muestra el botón "Reintentar". */
  onRetry?: () => void;
}

/** Estados de carga, vacío, error e información con la misma voz en toda la app. */
export function StatusMessage({ tone, title, children, onRetry }: StatusMessageProps) {
  const role = tone === 'error' ? 'alert' : tone === 'loading' ? 'status' : undefined;
  return (
    <div role={role} className={`rounded-base border p-4 ${TONE_CLASS[tone]}`}>
      <p className="flex items-center gap-2 font-bold">
        {tone === 'loading' && (
          <span
            aria-hidden="true"
            className="border-borde-suave border-t-petroleo size-4 animate-spin rounded-full border-2"
          />
        )}
        {title}
      </p>
      {children && <div className="text-tinta-suave max-w-lectura mt-1">{children}</div>}
      {onRetry && (
        <Button variant="secondary" className="mt-3" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
