import { getToken } from './auth';

export interface FinancialOverview {
  totalIncome: number;
  totalExpenses: number;
  netRevenue: number;
  ticketAvg: number;
  confirmedRevenue: number;
  receivedRevenue: number;
  pendingRevenue: number;
  revenueByService: Array<{ name: string; value: number }>;
  recentTransactions: Array<any>;
}

export async function fetchFinancialOverview(params: { start?: string; end?: string; handle?: string } = {}): Promise<FinancialOverview> {
  const token = getToken();
  const qp: string[] = [];
  if (params.start) qp.push(`start_date=${encodeURIComponent(params.start)}`);
  if (params.end) qp.push(`end_date=${encodeURIComponent(params.end)}`);
  if (params.handle) qp.push(`handle=${encodeURIComponent(params.handle)}`);
  const url = `/api/financial${qp.length ? '?' + qp.join('&') : ''}`;

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
    throw new Error(body.message || `Failed to fetch financial overview (${res.status})`);
  }

  return res.json();
}

export default { fetchFinancialOverview };

export async function createFinancial(payload: { amount: number; type: 'revenue' | 'expense'; date?: string; status?: string; description?: string; appointment_id?: number | null; business_id?: number | null }) {
  const token = getToken();
  const res = await fetch(`/api/financial`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to create financial (${res.status})`);
  }
  return res.json();
}

export async function updateFinancial(id: string | number, payload: { amount?: number; type?: string; date?: string; status?: string; description?: string }) {
  const token = getToken();
  const res = await fetch(`/api/financial/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Failed to update financial (${res.status})`);
  }
  return res.json();
}
