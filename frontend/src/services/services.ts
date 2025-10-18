import { getToken } from './auth';

export interface Service {
  id: number | string;
  name: string;
  description?: string | null;
  value?: number | null;
}

const base = '/api/services';

export async function getServices(requireAuth: boolean = false): Promise<Service[]> {
  const token = getToken();
  if (requireAuth && !token) throw new Error('Autenticação requerida');
  const res = await fetch(base, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to fetch services (${res.status})`);
  }
  return res.json();
}
