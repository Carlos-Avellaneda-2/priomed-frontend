import type { Priority } from '../../api/types';
import { PRIORITY_LABEL } from '../../domain/prioridad';

const TEXT_CLASS: Record<Priority, string> = {
  HIGH: 'text-carmin',
  MEDIUM: 'text-ambar',
  LOW: 'text-azul',
};

const SIZE_CLASS = {
  sm: { text: 'text-lg', icon: 'size-4' },
  md: { text: 'text-xl', icon: 'size-5' },
  lg: { text: 'text-display', icon: 'size-9' },
} as const;

/** Franja lateral con trama propia por nivel. Decorativa: el texto va aparte. */
export function PriorityBand({ priority }: { priority: Priority }) {
  return <span aria-hidden="true" className={`banda banda-${priority}`} />;
}

/** Forma distinta por nivel: triángulo (alta), rombo (media), círculo (baja). */
export function PriorityIcon({
  priority,
  className = 'size-5',
}: {
  priority: Priority;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
    >
      {priority === 'HIGH' && (
        <>
          <path d="M10 1.5 19 18H1L10 1.5Z" fill="currentColor" />
          <path d="M9 7h2v5.5H9zM9 14h2v2H9z" fill="#fff" />
        </>
      )}
      {priority === 'MEDIUM' && (
        <>
          <path d="M10 1 19 10 10 19 1 10 10 1Z" fill="currentColor" />
          <path d="M5.5 9h9v2h-9z" fill="#fff" />
        </>
      )}
      {priority === 'LOW' && (
        <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" strokeWidth="3" />
      )}
    </svg>
  );
}

/** Icono + palabra de prioridad. El color nunca va solo. */
export function PriorityLabel({
  priority,
  size = 'md',
}: {
  priority: Priority;
  size?: keyof typeof SIZE_CLASS;
}) {
  const sizes = SIZE_CLASS[size];
  return (
    <span
      className={`font-display inline-flex items-center gap-2 font-semibold tracking-wide ${TEXT_CLASS[priority]} ${sizes.text}`}
    >
      <PriorityIcon priority={priority} className={sizes.icon} />
      <span>
        <span className="sr-only">Prioridad </span>
        {PRIORITY_LABEL[priority]}
      </span>
    </span>
  );
}
