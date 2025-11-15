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
