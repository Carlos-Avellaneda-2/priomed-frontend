/**
 * El servicio de clasificación devuelve las señales de alarma como códigos
 * canónicos (p. ej. "dolor_toracico"). Aquí se traducen a texto legible.
 */
const ALARM_SIGN_LABEL: Record<string, string> = {
  dolor_toracico: 'Dolor torácico',
  ideacion_suicida: 'Ideación suicida',
  dificultad_respiratoria: 'Dificultad respiratoria',
  sincope: 'Síncope',
  herida_arma_fuego: 'Herida por arma de fuego',
};

/**
 * Etiqueta de una señal de alarma. Un código desconocido nunca se oculta:
 * se muestra tal cual, con espacios en lugar de guiones bajos.
 */
export function alarmSignLabel(code: string): string {
  const known = ALARM_SIGN_LABEL[code];
  if (known) return known;
  const readable = code.replaceAll('_', ' ').trim();
  return readable.charAt(0).toUpperCase() + readable.slice(1);
}
