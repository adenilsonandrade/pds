import { getToken } from './auth';

export interface Appointment {
  id: number | string;
  date: string;
  time: string;
  notes?: string | null;
  status?: string;
  price?: number | null;
  duration?: number | null;
  pet_name?: string | null;
  customer_name?: string | null;
  service_name?: string | null;
}

const base = '/api/appointments';

export async function getAppointments(params?: { business_id?: string | null; date?: string | null; start_date?: string | null; end_date?: string | null; q?: string | null; handle?: string | null }, requireAuth: boolean = false): Promise<Appointment[]> {
  const token = getToken();
  if (requireAuth && !token) throw new Error('Autenticação requerida');
  let url = base;
  if (params?.handle) {
    url = `${base}/${encodeURIComponent(params.handle)}`;
    const qs = new URLSearchParams();
    if (params.date) qs.set('date', params.date);
    if (params.start_date) qs.set('start_date', params.start_date);
    if (params.end_date) qs.set('end_date', params.end_date);
    if (params.q) qs.set('q', params.q);
    if (qs.toString()) url += `?${qs.toString()}`;
  } else {
    const qs = new URLSearchParams();
    if (params?.business_id) qs.set('business_id', params.business_id);
    if (params?.date) qs.set('date', params.date);
    if (params?.start_date) qs.set('start_date', params.start_date);
    if (params?.end_date) qs.set('end_date', params.end_date);
    if (params?.q) qs.set('q', params.q);
    if (qs.toString()) url += `?${qs.toString()}`;
  }

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
    throw new Error(body.message || `Failed to fetch appointments (${res.status})`);
  }
  return res.json();
}

export async function createAppointment(payload: any, handle?: string | null) {
  const token = getToken();
  const url = handle ? `${base}/${encodeURIComponent(handle)}` : base;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to create appointment (${res.status})`);
  }
  return res.json();
}

export async function updateAppointment(id: number | string, payload: any) {
  const token = getToken();
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
    throw new Error(body.message || `Failed to update appointment (${res.status})`);
  }
  return res.json();
}
