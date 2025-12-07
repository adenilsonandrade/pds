import { getToken } from './auth';

export interface Service {
  id: number | string;
  name: string;
  description?: string | null;
  value?: number | null;
}

const base = '/api/services';

export async function getServices(requireAuth: boolean = false, params?: { business_id?: string | null; q?: string | null }): Promise<Service[]> {
  const token = getToken();
  if (requireAuth && !token) throw new Error('Autenticação requerida');
  const qs = new URLSearchParams();
  if (params?.business_id) qs.set('business_id', params.business_id);
  if (params?.q) qs.set('q', params.q);
  const url = qs.toString() ? `${base}?${qs.toString()}` : base;
  const res = await fetch(url, {
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

export async function createService(payload: any, requireAuth: boolean = true) {
  const token = getToken();
  if (requireAuth && !token) throw new Error('Autenticação requerida');
  const res = await fetch(base, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to create service (${res.status})`);
  }
  return res.json();
}

export async function updateService(id: string | number, payload: any, requireAuth: boolean = true) {
  const token = getToken();
  if (requireAuth && !token) throw new Error('Autenticação requerida');
  const res = await fetch(`${base}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to update service (${res.status})`);
  }
  return res.json();
}

export async function deleteService(id: string | number, requireAuth: boolean = true) {
  const token = getToken();
  if (requireAuth && !token) throw new Error('Autenticação requerida');
  const res = await fetch(`${base}/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  });
  if (!res.ok && res.status !== 204) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to delete service (${res.status})`);
  }
  return true;
}
