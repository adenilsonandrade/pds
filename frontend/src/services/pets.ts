import { getToken } from './auth';

export interface Pet {
  id: number | string;
  name: string;
  species: string;
  breed?: string | null;
  age?: number | null;
  weight?: number | null;
  color?: string | null;
  gender?: 'male' | 'female' | null;
  customer_id?: number | string | null;
  customer_name?: string | null;
  notes?: string | null;
  vaccines?: boolean;
  special_needs?: string | null;
  business_id: string;
  business_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePetPayload {
  name: string;
  species: string;
  breed?: string | null;
  age?: number | null;
  weight?: number | null;
  color?: string | null;
  gender?: 'male' | 'female' | null;
  customer_id?: number | string | null;
  notes?: string | null;
  vaccines?: boolean;
  special_needs?: string | null;
  business_id?: string | null;
}

export interface UpdatePetPayload {
  name?: string;
  species?: string;
  breed?: string | null;
  age?: number | null;
  weight?: number | null;
  color?: string | null;
  gender?: 'male' | 'female' | null;
  customer_id?: number | string | null;
  notes?: string | null;
  vaccines?: boolean;
  special_needs?: string | null;
  business_id?: string | null;
}

export async function getPets(params?: { business_id?: string | null; q?: string | null }): Promise<Pet[]> {
  const token = getToken();
  const qs = new URLSearchParams();
  if (params?.business_id) qs.set('business_id', params.business_id);
  if (params?.q) qs.set('q', params.q);
  const url = qs.toString() ? `/api/pets?${qs.toString()}` : '/api/pets';
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
    throw new Error(body.message || `Failed to fetch pets (${res.status})`);
  }
  return res.json();
}

export async function getPet(id: number | string): Promise<Pet> {
  const token = getToken();
  const res = await fetch(`/api/pets/${id}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to fetch pet (${res.status})`);
  }
  return res.json();
}

export async function createPet(payload: CreatePetPayload): Promise<Pet> {
  const token = getToken();
  const res = await fetch('/api/pets', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to create pet (${res.status})`);
  }
  return res.json();
}

export async function updatePet(id: number | string, payload: UpdatePetPayload): Promise<Pet> {
  const token = getToken();
  const res = await fetch(`/api/pets/${id}`, {
    method: 'PUT',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to update pet (${res.status})`);
  }
  return res.json();
}

export async function deletePet(id: number | string): Promise<void> {
  const token = getToken();
  const res = await fetch(`/api/pets/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to delete pet (${res.status})`);
  }
  return res.json();
}
