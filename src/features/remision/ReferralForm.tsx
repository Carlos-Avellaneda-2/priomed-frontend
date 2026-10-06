import { useRef, useState, type FormEvent } from 'react';
import type { StructuredUrgency } from '../../api/types';
import { Button } from '../../components/ui/Button';
import { URGENCY_OPTIONS } from '../../domain/prioridad';

export const MIN_TEXT_LENGTH = 20;

export interface ReferralFormValues {
  text: string;
  structured_urgency: StructuredUrgency;
}

interface ReferralFormProps {
  onSubmit: (values: ReferralFormValues) => void;
  isSubmitting: boolean;
}

interface Errors {
  text?: string;
  urgency?: string;
}

export function ReferralForm({ onSubmit, isSubmitting }: ReferralFormProps) {
  const [text, setText] = useState('');
  const [urgency, setUrgency] = useState<StructuredUrgency | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const textRef = useRef<HTMLTextAreaElement>(null);
  const firstUrgencyRef = useRef<HTMLInputElement>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    const next: Errors = {};
    if (trimmed.length < MIN_TEXT_LENGTH) {
      next.text = `Describa el caso con al menos ${MIN_TEXT_LENGTH} caracteres.`;
    }
    if (urgency === null) {
      next.urgency = 'Seleccione la urgencia que usted asigna al caso.';
    }
    setErrors(next);

    if (next.text) {
      textRef.current?.focus();
      return;
    }
    if (urgency === null) {
      firstUrgencyRef.current?.focus();
      return;
    }
    onSubmit({ text: trimmed, structured_urgency: urgency });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <label htmlFor="caso-texto" className="font-bold">
          Descripción del caso
        </label>
        <p id="caso-texto-ayuda" className="text-tinta-suave text-sm">
          Motivo de remisión, síntomas y hallazgos. No incluya nombres ni documentos del paciente.
        </p>
        <textarea
          id="caso-texto"
          ref={textRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={8}
          aria-describedby={`caso-texto-ayuda${errors.text ? ' caso-texto-error' : ''}`}
          aria-invalid={errors.text ? true : undefined}
          className="rounded-base border-borde bg-blanco aria-invalid:border-carmin w-full border p-3 aria-invalid:border-2"
        />
        {errors.text && (
          <p id="caso-texto-error" className="text-carmin font-bold">
            {errors.text}
          </p>
        )}
      </div>

      <fieldset aria-describedby={errors.urgency ? 'urgencia-error' : undefined}>
        <legend className="font-bold">Urgencia según su criterio</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {URGENCY_OPTIONS.map((option, index) => (
            <label
              key={option.value}
              className="rounded-base border-borde bg-blanco has-[:checked]:border-petroleo flex min-h-11 min-w-0 cursor-pointer items-center gap-2 border px-2 py-2 has-[:checked]:shadow-[inset_0_-4px_0_var(--color-petroleo)] has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2"
            >
              <input
                ref={index === 0 ? firstUrgencyRef : undefined}
                type="radio"
                name="urgencia"
                value={option.value}
                checked={urgency === option.value}
                onChange={() => setUrgency(option.value)}
                className="size-5 shrink-0 outline-none"
              />
              <span>
                {option.label} <span className="text-tinta-suave">({option.value})</span>
              </span>
            </label>
          ))}
        </div>
        {errors.urgency && (
          <p id="urgencia-error" className="text-carmin mt-1 font-bold">
            {errors.urgency}
          </p>
        )}
      </fieldset>

      <Button type="submit" disabled={isSubmitting} className="sm:self-start">
        {isSubmitting ? 'Clasificando…' : 'Clasificar remisión'}
      </Button>
    </form>
  );
}
