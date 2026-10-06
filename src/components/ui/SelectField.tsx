import { useId } from 'react';
import type { Option } from '../../domain/catalogos';

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly Option[];
  onChange: (value: string) => void;
  /** Texto de la opción vacía ("Todas"). Si se omite, no hay opción vacía. */
  allLabel?: string;
}

export function SelectField({ label, value, options, onChange, allLabel }: SelectFieldProps) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="font-bold">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-base border-borde bg-blanco min-h-11 w-full border px-3 py-2"
      >
        {allLabel !== undefined && <option value="">{allLabel}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
