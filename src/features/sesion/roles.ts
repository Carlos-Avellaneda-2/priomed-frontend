export type Role = 'medico' | 'ips' | 'regulador';

interface RoleInfo {
  label: string;
  description: string;
  /** Pantalla de inicio del rol; también es su única sección de navegación. */
  home: string;
  homeLabel: string;
}

export const ROLES: Record<Role, RoleInfo> = {
  medico: {
    label: 'Médico remitente',
    description: 'Registra remisiones y valida la prioridad que propone el sistema.',
    home: '/remision',
    homeLabel: 'Remisión',
  },
  ips: {
    label: 'IPS',
    description: 'Consulta la cola priorizada y la explicación de cada remisión.',
    home: '/cola',
    homeLabel: 'Cola priorizada',
  },
  regulador: {
    label: 'Regulador (Ministerio de Salud)',
    description: 'Consulta indicadores agregados y anonimizados de cumplimiento.',
    home: '/cumplimiento',
    homeLabel: 'Cumplimiento MGTE',
  },
};

export const ROLE_IDS = Object.keys(ROLES) as Role[];

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && value in ROLES;
}
