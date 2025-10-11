import { getToken } from './auth';

const base = '/api/admin/businesses';

export async function getBusinesses() {
  const token = getToken();
  const res = await fetch(base, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
  if (!res.ok) throw new Error('Falha ao listar petshops');
  return res.json();
}

export async function createBusiness(payload: any) {
  const token = getToken();
  const res = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Falha ao criar petshop');
  return res.json();
}

export async function updateBusiness(id: string, payload: any) {
  const token = getToken();
  const res = await fetch(`${base}/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify(payload) });
  if (!res.ok) throw new Error('Falha ao atualizar petshop');
  return res.json();
}

export async function deleteBusiness(id: string) {
  const token = getToken();
  const res = await fetch(`${base}/${id}`, { method: 'DELETE', headers: { Authorization: token ? `Bearer ${token}` : '' } });
  if (!res.ok) throw new Error('Falha ao apagar petshop');
  return res.json();
}
