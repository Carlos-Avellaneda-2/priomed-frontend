import { describe, expect, it } from 'vitest';
import { alarmSignLabel } from './senalesAlarma';

describe('Etiquetas de señales de alarma', () => {
  it('traduce los códigos del servicio de clasificación', () => {
    expect(alarmSignLabel('dolor_toracico')).toBe('Dolor torácico');
    expect(alarmSignLabel('dificultad_respiratoria')).toBe('Dificultad respiratoria');
    expect(alarmSignLabel('sincope')).toBe('Síncope');
  });

  it('muestra un código desconocido en lugar de ocultarlo', () => {
    expect(alarmSignLabel('fiebre_alta')).toBe('Fiebre alta');
  });
});
