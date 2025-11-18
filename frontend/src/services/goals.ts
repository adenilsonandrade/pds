import { getToken } from './auth';

export interface Goal {
  id?: number;
  business_id?: number | null;
  amount: number;
  period_start?: string | null;
  period_end?: string | null;
  description?: string | null;
  status?: string | null;
}

export async function fetchGoals(params: { business_id?: string | number } = {}) {
  const token = getToken();
  const qp: string[] = [];
  if (params.business_id) qp.push(`business_id=${encodeURIComponent(String(params.business_id))}`);
  const url = `/api/goals${qp.length ? '?' + qp.join('&') : ''}`;

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store'
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to fetch goals (${res.status})`);
  }

  return res.json();
}

export async function createGoal(payload: Goal) {
  const token = getToken();
  const res = await fetch(`/api/goals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to create goal (${res.status})`);
  }
  return res.json();
}

export async function updateGoal(id: string | number, payload: Partial<Goal>) {
  const token = getToken();
  const res = await fetch(`/api/goals/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to update goal (${res.status})`);
  }
  return res.json();
}

export async function deleteGoal(id: string | number) {
  const token = getToken();
  const res = await fetch(`/api/goals/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to delete goal (${res.status})`);
  }
  return res.json();
}

export default { fetchGoals, createGoal, updateGoal, deleteGoal };
