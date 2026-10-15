// Cliente HTTP único. Todos los servicios pasan por acá: configura la URL,
// procesa la respuesta { success, data | message } del backend y lanza un
// ApiError legible cuando algo falla.

const API_URL: string = import.meta.env.VITE_API_URL ?? '/api';

const SIN_CONEXION =
  'No pudimos conectar con el servidor. Revisá que el backend esté corriendo en el puerto 3000.';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RespuestaOk<T> {
  success: true;
  data: T;
}

interface RespuestaError {
  success: false;
  message: string;
}

type RespuestaApi<T> = RespuestaOk<T> | RespuestaError;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  } catch {
    throw new ApiError(SIN_CONEXION, 0);
  }

  let body: RespuestaApi<T> | null = null;
  try {
    body = (await response.json()) as RespuestaApi<T>;
  } catch {
    body = null;
  }

  if (!response.ok || !body || !body.success) {
    const message = body && !body.success ? body.message : `Error ${response.status} del servidor.`;
    throw new ApiError(message, response.status);
  }

  return body.data;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(data) }),
  put: <T>(path: string, data: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' })
};

export function mensajeDeError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return 'Ocurrió un error inesperado.';
}
