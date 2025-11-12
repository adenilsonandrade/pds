export async function getPublicBusinessInfo(handle: string) {
  const res = await fetch(`/api/business/${encodeURIComponent(handle)}/info`, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body && body.message ? body.message : 'Falha ao buscar informações do petshop');
  }
  return res.json();
}

export async function getPublicBusinessServices(handle: string) {
  const res = await fetch(`/api/business/${encodeURIComponent(handle)}/services`, { cache: 'no-store' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body && body.message ? body.message : 'Falha ao buscar serviços');
  }
  return res.json();
}

export async function createPublicBooking(handle: string, payload: any) {
  const url = handle ? `/api/agendamentos-publicos/${encodeURIComponent(handle)}` : '/api/agendamentos-publicos';
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body && body.message ? body.message : 'Falha ao criar agendamento');
  }
  return res.json();
}
