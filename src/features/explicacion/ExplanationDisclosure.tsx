import { useId, useState } from 'react';
import { ExplanationPanel } from './ExplanationPanel';

/** Botón que despliega la explicación; solo la pide al servicio al abrirla. */
export function ExplanationDisclosure({ referralId }: { referralId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="border-borde-suave mt-5 border-t pt-4">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((open) => !open)}
        className="rounded-base text-petroleo flex min-h-11 items-center gap-2 font-bold underline underline-offset-4"
      >
        <svg
          viewBox="0 0 20 20"
          aria-hidden="true"
          className={`size-4 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
        >
          <path d="M6 3 14 10 6 17Z" fill="currentColor" />
        </svg>
        {isOpen ? 'Ocultar explicación' : 'Ver explicación de la decisión'}
      </button>
      <div id={panelId} className={isOpen ? 'mt-3' : undefined}>
        {isOpen && <ExplanationPanel referralId={referralId} />}
      </div>
    </div>
  );
}
