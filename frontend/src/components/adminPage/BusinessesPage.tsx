import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { getBusinesses, createBusiness, updateBusiness, deleteBusiness } from '../../services/businesses';
import { getCurrentUser } from '../../services/auth';

export default function BusinessesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ brand_name: '', contact_email: '', phone: '', custom_domain: '' });
  const [role, setRole] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const u = await getCurrentUser();
        setRole(u?.role || null);
        const data = await getBusinesses();
        setItems(data || []);
      } catch (err: any) {
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const startEdit = (b: any) => {
    setEditing(b);
    setForm({ brand_name: b.brand_name || '', contact_email: b.contact_email || '', phone: b.phone || '', custom_domain: b.custom_domain || '' });
    setIsFormOpen(true);
  };

  const onSave = async () => {
    try {
      if (editing) {
        const updated = await updateBusiness(editing.id, form);
        setItems(items.map(i => i.id === updated.id ? updated : i));
        setEditing(null);
      } else {
        const created = await createBusiness(form);
        setItems([created, ...items]);
      }
      setForm({ brand_name: '', contact_email: '', phone: '', custom_domain: '' });
      setIsFormOpen(false);
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm('Confirma apagar este petshop?')) return;
    try {
      await deleteBusiness(id);
      setItems(items.filter(i => i.id !== id));
    } catch (err: any) {
      setError(err.message || String(err));
    }
  };

  if (loading) return <div>Carregando petshops...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (role !== 'support') return <div>Sem permissão para acessar esta página.</div>;

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gestão de Petshops</h1>
          <p className="text-muted-foreground">Cadastre e gerencie os petshops cadastrados</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{items.length}</div>
            <div className="text-sm text-muted-foreground">Total de Petshops</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Input placeholder="Buscar por nome ou email..." value={searchTerm} onChange={(e:any) => setSearchTerm(e.target.value)} className="pl-3" />
        </div>

        <div className="flex gap-2">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); setForm({ brand_name: '', contact_email: '', phone: '', custom_domain: '' }); setIsFormOpen(true); }}>Criar Petshop</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? 'Editar Petshop' : 'Criar Petshop'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Nome (brand_name)</Label>
                    <input value={form.brand_name} onChange={e => setForm({ ...form, brand_name: e.target.value })} className="p-2 border rounded w-full" />
                  </div>
                  <div>
                    <Label>E-mail de contato</Label>
                    <input value={form.contact_email} onChange={e => setForm({ ...form, contact_email: e.target.value })} className="p-2 border rounded w-full" />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="p-2 border rounded w-full" />
                  </div>
                  <div>
                    <Label>Domínio</Label>
                    <input value={form.custom_domain} onChange={e => setForm({ ...form, custom_domain: e.target.value })} className="p-2 border rounded w-full" />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancelar</Button>
                  <Button onClick={onSave}>{editing ? 'Atualizar' : 'Criar'}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div>
        <Card>
          <CardContent>
            <div className="overflow-x-auto bg-white rounded-md">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b">
                    <th className="p-2">Nome</th>
                    <th className="p-2">E-mail</th>
                    <th className="p-2">Telefone</th>
                    <th className="p-2">Domínio</th>
                    <th className="p-2">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.filter(i => i.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) || i.contact_email.toLowerCase().includes(searchTerm.toLowerCase())).map(b => (
                    <tr key={b.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 align-top">{b.brand_name}</td>
                      <td className="p-2 align-top">{b.contact_email}</td>
                      <td className="p-2 align-top">{b.phone}</td>
                      <td className="p-2 align-top">{b.custom_domain}</td>
                      <td className="p-2 align-top">
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => startEdit(b)}>Editar</Button>
                          <Button size="sm" variant="destructive" onClick={() => onDelete(b.id)}>Apagar</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
