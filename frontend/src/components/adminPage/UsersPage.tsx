import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { getUsers, deleteUser } from '../../services/users';
import { createUser, updateUser } from '../../services/users';
import { getBusinesses } from '../../services/businesses';
import { getCurrentUser } from '../../services/auth';
import { Edit3, Trash2, Info } from 'lucide-react';

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
  const [viewOnly, setViewOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [businesses, setBusinesses] = useState<Array<{ id: string; brand_name: string }>>([]);

  const location = useLocation();

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
          if (currentRole === 'support' && currentBusinessId) {
            const filtered = (bs || []).filter((b: any) => String(b.id) === String(currentBusinessId));
            setBusinesses(filtered || []);
          } else {
            setBusinesses(bs || []);
          }
        } catch (e) {
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [location.pathname]);

  function openCreate() {
    setFormMode('create');
    setViewOnly(false);
    setFormData({ email: '', first_name: '', last_name: '', phone: null, password: null, role: 'user', business_id: currentBusinessId || null });
    setIsFormOpen(true);
  }

  function openEdit(user: UserRow) {
    setViewOnly(false);
    setFormMode('edit');
    setFormData({ id: user.id, email: user.email, first_name: user.first_name || '', last_name: user.last_name || '', phone: user.phone || null, password: null, role: user.role, business_id: user.business_id || null });
    setIsFormOpen(true);
  }

  function openDetails(user: UserRow) {
    setViewOnly(true);
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
    if (currentRole === 'support') return true;
    if (currentRole === 'admin') {
      return row.business_id && currentBusinessId && row.business_id === currentBusinessId;
    }
    return !!(currentUserId && row.id && String(row.id) === String(currentUserId));
  }

  async function handleDelete(id: number | string) {
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

  const visibleUsers = users
    .filter((u) => !(currentRole === 'admin' && u.role === 'support'))
    .filter((u) => {
      const q = searchTerm.toLowerCase();
      return (
        u.email.toLowerCase().includes(q) ||
        ((u.first_name || '') + ' ' + (u.last_name || '')).toLowerCase().includes(q) ||
        (u.phone || '').toLowerCase().includes(q)
      );
    });

  return (
    <main className="flex-1 space-y-4 p-3">
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
                    <input required value={formData.email} onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))} placeholder="email@exemplo.com" className="p-2 border rounded w-full" disabled={viewOnly} />
                  </div>
                  <div>
                    <Label>First name</Label>
                    <input value={formData.first_name} onChange={(e) => setFormData((s) => ({ ...s, first_name: e.target.value }))} placeholder="Nome" className="p-2 border rounded w-full" disabled={viewOnly} />
                  </div>
                  <div>
                    <Label>Last name</Label>
                    <input value={formData.last_name} onChange={(e) => setFormData((s) => ({ ...s, last_name: e.target.value }))} placeholder="Sobrenome" className="p-2 border rounded w-full" disabled={viewOnly} />
                  </div>
                  <div>
                    <Label>Senha</Label>
                    <input type="password" value={formData.password || ''} onChange={(e) => setFormData((s) => ({ ...s, password: e.target.value }))} placeholder="Senha (opcional)" className="p-2 border rounded w-full" disabled={viewOnly} />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <input value={formData.phone || ''} onChange={(e) => setFormData((s) => ({ ...s, phone: e.target.value }))} placeholder="(xx) xxxxx-xxxx" className="p-2 border rounded w-full" disabled={viewOnly} />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <select value={formData.role as string} onChange={(e) => setFormData((s) => ({ ...s, role: e.target.value }))} className="p-2 border rounded w-full" disabled={viewOnly}>
                      <option value="user">user</option>
                      {currentRole === 'admin' && <option value="admin">admin</option>}
                      {currentRole === 'support' && <option value="admin">admin</option>}
                      {currentRole === 'support' && <option value="support">support</option>}
                    </select>
                  </div>
                  {currentRole === 'support' ? (
                    <div>
                      <Label>Petshop</Label>
                      <select value={formData.business_id ?? (businesses[0]?.id ?? '')} onChange={(e) => {
                        const v = e.target.value || null;
                        const first = businesses[0];
                        if (!v && first) {
                          setFormData((s) => ({ ...s, business_id: first.id }));
                          return;
                        }
                        setFormData((s) => ({ ...s, business_id: v }));
                      }} className="p-2 border rounded w-full" disabled={viewOnly}>
                        {businesses.map(b => (
                          <option key={b.id} value={b.id}>{b.brand_name}</option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setFormMode('create'); setViewOnly(false); }}>Fechar</Button>
                  {viewOnly ? (
                    <Button type="button" onClick={() => { setIsFormOpen(false); setViewOnly(false); setFormMode('create'); }}>Fechar</Button>
                  ) : (
                    <Button type="submit">{formMode === 'create' ? 'Criar' : 'Salvar'}</Button>
                  )}
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
          <>
            <Card className="hidden md:block">
              <CardContent>
                <div className="overflow-x-auto bg-white rounded-md">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2">Nome</th>
                        <th className="p-2">Role</th>
                        {currentRole !== 'admin' && <th className="p-2">Business</th>}
                        <th className="p-2">Telefone</th>
                        <th className="p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleUsers.map((u) => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                          <td className="p-2 align-top">
                            <div className="font-medium">{(u.first_name || '') + (u.last_name ? ' ' + u.last_name : '') || '—'}</div>
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                          </td>
                          <td className="p-2 align-top">{u.role}</td>
                          {currentRole !== 'admin' && <td className="p-2 align-top">{u.business_name || u.business_id || '—'}</td>}
                          <td className="p-2 align-top">{u.phone || '—'}</td>
                          <td className="p-2 align-top">
                            <div className="flex gap-2 items-center">
                              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Detalhes de ${u.email}`} onClick={() => openDetails(u)}>
                                <Info className="h-4 w-4" />
                              </Button>

                              {canEditRow(u) && (
                                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Editar ${u.email}`} onClick={() => openEdit(u)}>
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              )}

                              {canEditRow(u) && (String(u.id) === String(currentUserId) ? (
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 cursor-not-allowed" aria-disabled="true" disabled>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Excluir ${u.email}`} onClick={() => handleDelete(u.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              ))}

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

            <div className="md:hidden space-y-3">
              {visibleUsers.map(u => (
                <Card key={u.id}>
                  <CardContent className="px-6 pb-4">
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col justify-center">
                        <div className="font-medium">{(u.first_name || '') + (u.last_name ? ' ' + u.last_name : '') || '—'}</div>
                        <div className="text-sm text-muted-foreground">{u.email}</div>
                        {currentRole !== 'admin' && <div className="text-sm text-muted-foreground mt-1">{u.business_name || u.business_id || '—'}</div>}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Detalhes de ${u.email}`} onClick={() => openDetails(u)}>
                          <Info className="h-4 w-4" />
                        </Button>
                        {canEditRow(u) && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Editar ${u.email}`} onClick={() => openEdit(u)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        )}
                        {canEditRow(u) && (String(u.id) === String(currentUserId) ? (
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-50 cursor-not-allowed" aria-disabled="true" disabled>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Excluir ${u.email}`} onClick={() => handleDelete(u.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default UsersPage;
