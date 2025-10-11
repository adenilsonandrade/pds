import { getToken } from './auth';

export async function getUsers() {
  const token = getToken();
  const res = await fetch('/api/admin/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to fetch users (${res.status})`);
  }
  return res.json();
}

export async function deleteUser(id: number | string) {
  const token = getToken();
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to delete user (${res.status})`);
  }
  return res.json();
}

export async function createUser(payload: { email: string; first_name?: string; last_name?: string; phone?: string | null; password?: string; role?: string; business_id?: string | null }) {
  const token = getToken();
  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to create user (${res.status})`);
  }
  return res.json();
}

export async function updateUser(id: number | string, payload: { email?: string; first_name?: string; last_name?: string; phone?: string | null; password?: string | null; role?: string; business_id?: string | null; status?: string }) {
  const token = getToken();
  const res = await fetch(`/api/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to update user (${res.status})`);
  }
  return res.json();
}
