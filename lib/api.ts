// ============================================================
// API CLIENT
// ============================================================
// Cliente HTTP para hablar con el backend NestJS.
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// ----------------------------------------------------------
// getToken()
// Obtiene el token del localStorage.
// ----------------------------------------------------------
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

// ----------------------------------------------------------
// setToken(token)
// Guarda el token en localStorage.
// ----------------------------------------------------------
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
}

// ----------------------------------------------------------
// removeToken()
// Borra el token.
// ----------------------------------------------------------
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
}

// ----------------------------------------------------------
// apiFetch(path, options)
// Wrapper de fetch que añade el token automáticamente.
// ----------------------------------------------------------
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Error de conexión',
    }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  return response.json();
}

// ----------------------------------------------------------
// apiPublic(path)
// Para endpoints públicos (sin token).
// ----------------------------------------------------------
export async function apiPublic<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Error de conexión',
    }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  return response.json();
}

// ----------------------------------------------------------
// apiUpload(path, formData)
// Sube archivos usando multipart/form-data con token.
// ----------------------------------------------------------
export async function apiUpload<T>(
  path: string,
  formData: FormData,
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Error de conexión',
    }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  return response.json();
}


// ============================================================
// downloadFile(path, filename)
// Descarga un archivo con autenticación (token).
// Útil para PDFs y archivos protegidos.
// ============================================================
export async function downloadFile(
  path: string,
  filename: string,
): Promise<void> {
  const token = getToken();

  const headers: HeadersInit = {};
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Error al descargar',
    }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  // Convertir la respuesta a blob
  const blob = await response.blob();

  // Crear un enlace temporal para descargar
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Limpiar
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}