let sequence = 0;

/** Identificador sintético: el prefijo SIM deja claro que no es un registro real. */
export function newReferralId(): string {
  sequence += 1;
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  return `REM-SIM-${stamp}${sequence}`;
}
