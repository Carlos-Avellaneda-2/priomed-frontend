import { setupWorker } from 'msw/browser';
import { createHandlers } from './handlers';

// VITE_MOCK_CLASSIFY=false deja pasar POST /classify al servicio real (modo mixto).
const mockClassify = import.meta.env.VITE_MOCK_CLASSIFY !== 'false';

export const worker = setupWorker(...createHandlers({ mockClassify }));
