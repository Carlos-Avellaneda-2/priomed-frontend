import type { QueueItem, ReviewStatus } from '../../api/types';
import { PriorityBand, PriorityLabel } from '../../components/ui/Priority';
import { labelOf, SPECIALTIES } from '../../domain/catalogos';

const REVIEW_LABEL: Record<ReviewStatus, string> = {
  pending: 'Sin confirmar',
  confirmed: 'Confirmada',
  corrected: 'Corregida',
};

function waitingText(days: number): string {
  return days === 1 ? '1 día en espera' : `${days} días en espera`;
}

/** Contenido de una fila de la cola. El contenedor (enlace o no) lo pone la página. */
export function QueueRow({ item }: { item: QueueItem }) {
  const isPending = item.review_status === 'pending';
  return (
    <span className="flex min-w-0 flex-1">
      <PriorityBand priority={item.priority} />
      <span className="grid min-w-0 flex-1 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 p-3">
        <PriorityLabel priority={item.priority} />
        <span className="text-right font-bold">{waitingText(item.waiting_days)}</span>
        <span className="min-w-0">
          <span className="font-bold break-all">{item.referral_id}</span>
          <span className="text-tinta-suave"> {labelOf(SPECIALTIES, item.specialty)}</span>
        </span>
        <span
          className={`rounded-base justify-self-end border px-2 text-sm font-bold ${
            isPending ? 'border-tinta border-dashed' : 'border-exito bg-exito-tinte text-exito'
          }`}
        >
          {REVIEW_LABEL[item.review_status]}
        </span>
      </span>
    </span>
  );
}
