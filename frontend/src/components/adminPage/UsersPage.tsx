import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { getUsers, deleteUser } from '../../services/users';
import { createUser, updateUser } from '../../services/users';
import { getBusinesses } from '../../services/businesses';
import { getCurrentUser } from '../../services/auth';

type Role = 'support' | 'admin' | 'user';

interface UserRow {
  id: number | string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  role: Role;
  business_id?: string | null;
  business_name?: string | null;
}

interface Props {
  currentRole: Role;
  currentBusinessId?: string | null;
  currentUserId?: number | null;
}

export const UsersPage: React.FC<Props> = ({ currentRole, currentBusinessId, currentUserId }) => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [formData, setFormData] = useState<{ id?: number | string; email: string; first_name?: string; last_name?: string; phone?: string | null; password?: string | null; role?: Role | string; business_id?: string | null }>({ email: '', first_name: '', last_name: '', phone: null, password: null, role: 'user', business_id: null });
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [businesses, setBusinesses] = useState<Array<{ id: string; brand_name: string }>>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        if (currentRole === 'user') {
          const me = await getCurrentUser();
          setUsers([me]);
        } else {
          const all = await getUsers();
          setUsers(all);
        }

        try {
          const bs = await getBusinesses();
          setBusinesses(bs || []);
        } catch (e) {
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function openCreate() {
    setFormMode('create');
    setFormData({ email: '', first_name: '', last_name: '', phone: null, password: null, role: 'user', business_id: currentRole === 'admin' ? currentBusinessId || null : null });
    setIsFormOpen(true);
  }

  function openEdit(user: UserRow) {
    setFormMode('edit');
    setFormData({ id: user.id, email: user.email, first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || null, password: null, role: user.role, business_id: user.business_id || null });
    setIsFormOpen(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (formMode === 'create') {
        const created = await createUser(formData as any);
        setUsers((s) => [created, ...s]);
      } else if (formMode === 'edit' && formData.id) {
        const updated = await updateUser(formData.id, formData as any);
        setUsers((s) => s.map((u) => (u.id === updated.id ? updated : u)));
      }
  setFormData({ email: '', first_name: '', last_name: '', phone: null, password: null, role: 'user', business_id: currentBusinessId || null });
  setFormMode('create');
  setIsFormOpen(false);
    } catch (err) {
      alert('Falha ao salvar usuário');
    }
  }

  function canEditRow(row: UserRow) {
    if (currentRole === 'support') return true; // support sees/edits all
    if (currentRole === 'admin') {
      // admin can edit only users from same business or null business? limit to same business
      return row.business_id && currentBusinessId && row.business_id === currentBusinessId;
    }
    // regular user: can edit only own record (normalize types)
    return !!(currentUserId && row.id && String(row.id) === String(currentUserId));
  }

  async function handleDelete(id: number | string) {
    // Prevent deleting own user
    if (String(id) === String(currentUserId)) {
      alert('Você não pode excluir seu próprio usuário');
      return;
    }
    if (!confirm('Confirma excluir este usuário?')) return;
    try {
      await deleteUser(id);
      setUsers((s) => s.filter((u) => u.id !== id));
    } catch (err) {
      alert('Falha ao apagar usuário');
    }
  }

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Gerencie as contas e permissões do sistema</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{users.length}</div>
            <div className="text-sm text-muted-foreground">Total de usuários</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Input placeholder="Buscar por email ou nome..." value={searchTerm} onChange={(e:any) => setSearchTerm(e.target.value)} className="pl-3" />
        </div>

        <div className="flex gap-2">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            {currentRole !== 'user' && (
              <DialogTrigger asChild>
                <Button onClick={openCreate}>Criar usuário</Button>
              </DialogTrigger>
            )}
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{formMode === 'create' ? 'Criar Usuário' : 'Editar Usuário'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={submitForm} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Email</Label>
                    <input required value={formData.email} onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))} placeholder="email@exemplo.com" className="p-2 border rounded w-full" />
                  </div>
                  <div>
                    <Label>First name</Label>
                    <input value={formData.first_name} onChange={(e) => setFormData((s) => ({ ...s, first_name: e.target.value }))} placeholder="Nome" className="p-2 border rounded w-full" />
                  </div>
                  <div>
                    <Label>Last name</Label>
                    <input value={formData.last_name} onChange={(e) => setFormData((s) => ({ ...s, last_name: e.target.value }))} placeholder="Sobrenome" className="p-2 border rounded w-full" />
                  </div>
                  <div>
                    <Label>Senha</Label>
                    <input type="password" value={formData.password || ''} onChange={(e) => setFormData((s) => ({ ...s, password: e.target.value }))} placeholder="Senha (opcional)" className="p-2 border rounded w-full" />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <input value={formData.phone || ''} onChange={(e) => setFormData((s) => ({ ...s, phone: e.target.value }))} placeholder="(xx) xxxxx-xxxx" className="p-2 border rounded w-full" />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <select value={formData.role as string} onChange={(e) => setFormData((s) => ({ ...s, role: e.target.value }))} className="p-2 border rounded w-full">
                      {/* support: can assign user/admin/support; admin: can assign user/admin; user: only user */}
                      <option value="user">user</option>
                      {currentRole === 'admin' && <option value="admin">admin</option>}
                      {currentRole === 'support' && <option value="admin">admin</option>}
                      {currentRole === 'support' && <option value="support">support</option>}
                    </select>
                  </div>
                  {currentRole === 'support' ? (
                    <div>
                      <Label>Petshop</Label>
                      <select value={formData.business_id || ''} onChange={(e) => setFormData((s) => ({ ...s, business_id: e.target.value || null }))} className="p-2 border rounded w-full">
                        <option value="">— Selecionar petshop —</option>
                        {businesses.map(b => (
                          <option key={b.id} value={b.id}>{b.brand_name}</option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setFormMode('create'); }}>Cancelar</Button>
                  <Button type="submit">{formMode === 'create' ? 'Criar' : 'Salvar'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div>
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <Card>
            <CardContent>
              <div className="overflow-x-auto bg-white rounded-md">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2">ID</th>
                      <th className="p-2">Nome</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Role</th>
                      {currentRole !== 'admin' && <th className="p-2">Business</th>}
                      <th className="p-2">Telefone</th>
                      <th className="p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter((u) => !(currentRole === 'admin' && u.role === 'support'))
                      .filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()) || ((u.first_name || '') + ' ' + (u.last_name || '')).toLowerCase().includes(searchTerm.toLowerCase()) || (u.phone || '').toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((u) => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 align-top">{u.id}</td>
                        <td className="p-2 align-top">{(u.first_name || '') + (u.last_name ? ' ' + u.last_name : '') || '—'}</td>
                        <td className="p-2 align-top">{u.email}</td>
                        <td className="p-2 align-top">{u.role}</td>
                        {currentRole !== 'admin' && <td className="p-2 align-top">{u.business_name || u.business_id || '—'}</td>}
                        <td className="p-2 align-top">{u.phone || '—'}</td>
                        <td className="p-2 align-top">
                          <div className="flex gap-2">
                            {canEditRow(u) && <Button size="sm" onClick={() => openEdit(u)}>Editar</Button>}
                            {canEditRow(u) && (
                              String(u.id) === String(currentUserId) ? (
                                // Show the delete button but make it visually subtle and non-interactive.
                                // Use title as a simple tooltip explaining why it's disabled.
                                <button
                                  className="inline-flex items-center px-3 py-1 text-sm rounded bg-transparent text-gray-500 opacity-70 cursor-not-allowed border border-transparent"
                                  aria-disabled="true"
                                  title="Você não pode excluir seu próprio usuário. Peça para outro administrador ou suporte realizar a exclusão se necessário."
                                  onClick={(e) => { e.preventDefault(); }}
                                  disabled
                                >
                                  Excluir
                                </button>
                              ) : (
                                <Button size="sm" variant="destructive" onClick={() => handleDelete(u.id)}>Excluir</Button>
                              )
                            )}
                            {!canEditRow(u) && <span className="text-sm text-muted-foreground">Sem permissão</span>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
};

export default UsersPage;
