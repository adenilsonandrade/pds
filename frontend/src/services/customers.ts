import { getToken } from './auth';

export interface Customer {
  id: number | string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  business_id: string;
  business_name?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface CreateCustomerPayload {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  business_id?: string | null;
}

export interface UpdateCustomerPayload {
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  notes?: string | null;
  business_id?: string | null;
}

export async function getCustomers(): Promise<Customer[]> {
  const token = getToken();
  const res = await fetch('/api/customers', {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to fetch customers (${res.status})`);
  }
  return res.json();
}

export async function getCustomer(id: number | string): Promise<Customer> {
  const token = getToken();
  const res = await fetch(`/api/customers/${id}`, {
    method: 'GET',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to fetch customer (${res.status})`);
  }
  return res.json();
}

export async function createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
  const token = getToken();
  const res = await fetch('/api/customers', {
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
    throw new Error(body.message || `Failed to create customer (${res.status})`);
  }
  return res.json();
}

export async function updateCustomer(id: number | string, payload: UpdateCustomerPayload): Promise<Customer> {
  const token = getToken();
  const res = await fetch(`/api/customers/${id}`, {
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
    throw new Error(body.message || `Failed to update customer (${res.status})`);
  }
  return res.json();
}

export async function deleteCustomer(id: number | string): Promise<void> {
  const token = getToken();
  const res = await fetch(`/api/customers/${id}`, {
    method: 'DELETE',
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to delete customer (${res.status})`);
  }
  return res.json();
}
