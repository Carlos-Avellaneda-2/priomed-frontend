/** Catálogos de demostración. Los nombres de IPS son ficticios a propósito. */

export interface Option {
  value: string;
  label: string;
}

export const SPECIALTIES: readonly Option[] = [
  { value: 'cardiologia', label: 'Cardiología' },
  { value: 'neurologia', label: 'Neurología' },
  { value: 'oncologia', label: 'Oncología' },
  { value: 'reumatologia', label: 'Reumatología' },
];

export const IPS_OPTIONS: readonly Option[] = [
  { value: 'ips-demo-a', label: 'IPS de demostración A' },
  { value: 'ips-demo-b', label: 'IPS de demostración B' },
  { value: 'ips-demo-c', label: 'IPS de demostración C' },
];

export const WEEKS: readonly Option[] = [
  { value: '2026-W40', label: 'Semana 40 de 2026' },
  { value: '2026-W39', label: 'Semana 39 de 2026' },
  { value: '2026-W38', label: 'Semana 38 de 2026' },
  { value: '2026-W37', label: 'Semana 37 de 2026' },
];

export function labelOf(options: readonly Option[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}
