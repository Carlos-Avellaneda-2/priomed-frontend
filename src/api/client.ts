const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export function apiUrl(path: string): string {
  return `${BASE_URL}${path}`;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servicio.');
  }
  if (!response.ok) {
    throw new ApiError(response.status, `El servicio respondió con un error (${response.status}).`);
  }
  return response;
}

export async function getJson<T>(path: string): Promise<T> {
  const response = await send(path);
  return (await response.json()) as T;
}

/** Como getJson, pero devuelve null cuando la API responde 204 No Content. */
export async function getJsonOrNoContent<T>(path: string): Promise<T | null> {
  const response = await send(path);
  if (response.status === 204) return null;
  return (await response.json()) as T;
}

export async function postJson<TBody, TResult>(path: string, body: TBody): Promise<TResult> {
  const response = await send(path, { method: 'POST', body: JSON.stringify(body) });
  return (await response.json()) as TResult;
}
