/**
 * Contrato de la API de PrioMed. Única fuente de tipos: la usan el cliente
 * HTTP, los hooks, los componentes y los manejadores de MSW.
 */

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type StructuredUrgency = 0 | 1 | 2;
export type DecisionSource = 'guardrail' | 'ml';

/* POST /classify */

export interface ClassifyRequest {
  referral_id: string;
  text: string;
  structured_urgency: StructuredUrgency;
}

export interface ClassifyResponse {
  referral_id: string;
  priority: Priority;
  source: DecisionSource;
  high_score: number;
  alarm_signs: string[];
  requires_human_review: boolean;
}

/* POST /referrals/{id}/review — validación humana obligatoria */

export type ReviewAction = 'confirmed' | 'corrected';

export interface ReviewRequest {
  action: ReviewAction;
  final_priority: Priority;
}

export interface ReviewResponse {
  referral_id: string;
  action: ReviewAction;
  final_priority: Priority;
  reviewed_at: string;
}

/* GET /referrals?specialty=&priority= — cola priorizada */

export type ReviewStatus = 'pending' | ReviewAction;

export interface QueueItem {
  referral_id: string;
  specialty: string;
  priority: Priority;
  source: DecisionSource;
  high_score: number;
  review_status: ReviewStatus;
  waiting_days: number;
}

export interface QueueFilters {
  specialty: string;
  priority: Priority | '';
}

/* GET /referrals/{id}/explanation */

export interface ExplanationFactor {
  label: string;
  effect: 'increases' | 'decreases';
}

export interface Explanation {
  referral_id: string;
  priority: Priority;
  source: DecisionSource;
  high_score: number;
  alarm_signs: string[];
  summary: string;
  factors: ExplanationFactor[];
}

/* GET /compliance-aggregate?ips=&specialty=&week= */

export interface ComplianceQuery {
  ips: string;
  specialty: string;
  week: string;
}

export interface ComplianceAggregate {
  referrals_processed: number;
  avg_wait_days: number;
  /** Porcentaje (0–100) de remisiones atendidas dentro del umbral MGTE. */
  pct_within_mgte_threshold: number;
}
