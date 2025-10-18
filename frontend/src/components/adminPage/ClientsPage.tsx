import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Search, Plus, Edit, Eye, Phone, Mail, MapPin, Calendar, PawPrint, Trash2, Info, Users, DollarSign } from "lucide-react";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer, Customer } from "../../services/customers";
import { getPets, Pet } from '../../services/pets';
import { getBusinesses } from "../../services/businesses";

type Role = 'support' | 'admin' | 'user';

interface Props {
  currentRole: Role;
  currentBusinessId?: string | null;
  currentUserId?: number | null;
}

export const ClientsPage: React.FC<Props> = ({ currentRole, currentBusinessId, currentUserId }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalVisits, setTotalVisits] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [activeClients, setActiveClients] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [viewOnly, setViewOnly] = useState(false);
  const [formData, setFormData] = useState<{
    id?: number | string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    notes?: string;
    business_id?: string | null;
  }>({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
    business_id: null
  });
  const [businesses, setBusinesses] = useState<Array<{ id: string; brand_name: string }>>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [petsByCustomer, setPetsByCustomer] = useState<Record<string, Pet[]>>({});

  const location = useLocation();

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const all = await getCustomers();
        setCustomers(all);

        // Buscar businesses se for support
        if (currentRole === 'support') {
          try {
            const bs = await getBusinesses();
            setBusinesses(bs || []);
          } catch (e) {
            console.error('Error loading businesses:', e);
          }
        }
      } catch (err) {
        console.error('Error loading customers:', err);
        alert('Erro ao carregar clientes');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [location.pathname, currentRole]);

  // Load pets and index them by customer_id
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const allPets = await getPets();
        if (!isMounted) return;
        setPets(allPets || []);
        const map: Record<string, Pet[]> = {};
        (allPets || []).forEach(p => {
          const key = p.customer_id != null ? String(p.customer_id) : '__no_customer__';
          if (!map[key]) map[key] = [];
          map[key].push(p);
        });
        setPetsByCustomer(map);
      } catch (e) {
        // ignore if pets cannot be loaded (permissions) - pets list will be empty
        console.error('Could not load pets:', e);
      }
    })();
    return () => { isMounted = false; };
  }, [location.pathname]);

  // Compute active clients (heuristic: customers with activity in last 6 months)
  useEffect(() => {
    const now = Date.now();
    const sixMonthsMs = 180 * 24 * 60 * 60 * 1000; // ~180 days
    const active = customers.filter((c) => {
      const dateStr = c.updated_at || c.created_at;
      if (!dateStr) return false;
      const t = new Date(dateStr).getTime();
      if (Number.isNaN(t)) return false;
      return (now - t) <= sixMonthsMs;
    }).length;
    setActiveClients(active);
  }, [customers]);

  // Try to load appointments to calculate visits and revenue. If endpoint not available, fall back to zeros.
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const res = await fetch('/api/appointments', { method: 'GET', cache: 'no-store' });
        if (!res.ok) return; // endpoint missing or protected
        const apps = await res.json();
        if (!isMounted || !Array.isArray(apps)) return;
        const visits = apps.length;
        // try to extract numeric price from possible fields
        const revenue = apps.reduce((sum: number, a: any) => {
          if (!a) return sum;
          if (typeof a.price === 'number') return sum + a.price;
          if (typeof a.price === 'string') {
            // Accept formats like "R$ 80,00" or "80.00"
            const parsed = Number(String(a.price).replace(/[^0-9,.-]/g, '').replace(',', '.'));
            return sum + (Number.isNaN(parsed) ? 0 : parsed);
          }
          if (typeof a.value === 'number') return sum + a.value;
          return sum;
        }, 0);
        setTotalVisits(visits);
        setTotalRevenue(revenue);
      } catch (e) {
        // ignore — keep zeros
      }
    })();
    return () => { isMounted = false; };
  }, []);

  function openCreate() {
    setFormMode('create');
    setViewOnly(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      notes: '',
      business_id: currentRole === 'support' ? null : (currentBusinessId || null)
    });
    setIsFormOpen(true);
  }

  function openEdit(customer: Customer) {
    setViewOnly(false);
    setFormMode('edit');
    setFormData({
      id: customer.id,
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      notes: customer.notes || '',
      business_id: customer.business_id || null
    });
    setIsFormOpen(true);
  }

  function openDetails(customer: Customer) {
    setViewOnly(true);
    setFormMode('edit');
    setFormData({
      id: customer.id,
      name: customer.name,
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      notes: customer.notes || '',
      business_id: customer.business_id || null
    });
    setIsFormOpen(true);
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (formMode === 'create') {
        const created = await createCustomer(formData as any);
        setCustomers((s) => [created, ...s]);
        alert('Cliente criado com sucesso!');
      } else if (formMode === 'edit' && formData.id) {
        const updated = await updateCustomer(formData.id, formData as any);
        setCustomers((s) => s.map((c) => (c.id === updated.id ? updated : c)));
        alert('Cliente atualizado com sucesso!');
      }
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        notes: '',
        business_id: currentBusinessId || null
      });
      setFormMode('create');
      setIsFormOpen(false);
    } catch (err: any) {
      alert(err.message || 'Falha ao salvar cliente');
    }
  }

  function canEditRow(row: Customer) {
    if (currentRole === 'support') return true; // support pode editar todos
    if (currentRole === 'admin' || currentRole === 'user') {
      // admin/user pode editar apenas clientes do mesmo business
      return row.business_id && currentBusinessId && row.business_id === currentBusinessId;
    }
    return false;
  }

  async function handleDelete(id: number | string) {
    if (!confirm('Confirma excluir este cliente?')) return;
    try {
      await deleteCustomer(id);
      setCustomers((s) => s.filter((c) => c.id !== id));
      alert('Cliente excluído com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Falha ao excluir cliente');
    }
  }

  const filteredCustomers = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.city || '').toLowerCase().includes(q)
    );
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <main className="flex-1 space-y-6 p-3">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Gerencie os clientes e seu histórico</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{customers.length}</div>
            <div className="text-sm text-muted-foreground">Total de clientes</div>
          </div>
        </div>
      </div>

      {/* (cards moved below the customers list) */}

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex gap-2">
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{formMode === 'create' ? 'Criar Cliente' : (viewOnly ? 'Detalhes do Cliente' : 'Editar Cliente')}</DialogTitle>
              </DialogHeader>
              <form onSubmit={submitForm} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Nome *</Label>
                    <input
                      required
                      value={formData.name}
                      onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
                      placeholder="Nome completo"
                      className="p-2 border rounded w-full"
                      disabled={viewOnly}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
                      placeholder="email@exemplo.com"
                      className="p-2 border rounded w-full"
                      disabled={viewOnly}
                    />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <input
                      value={formData.phone}
                      onChange={(e) => setFormData((s) => ({ ...s, phone: e.target.value }))}
                      placeholder="(xx) xxxxx-xxxx"
                      className="p-2 border rounded w-full"
                      disabled={viewOnly}
                    />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <input
                      value={formData.city}
                      onChange={(e) => setFormData((s) => ({ ...s, city: e.target.value }))}
                      placeholder="São Paulo, SP"
                      className="p-2 border rounded w-full"
                      disabled={viewOnly}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Endereço</Label>
                    <input
                      value={formData.address}
                      onChange={(e) => setFormData((s) => ({ ...s, address: e.target.value }))}
                      placeholder="Rua, Número, Bairro"
                      className="p-2 border rounded w-full"
                      disabled={viewOnly}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Observações</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData((s) => ({ ...s, notes: e.target.value }))}
                      placeholder="Observações adicionais"
                      className="w-full"
                      disabled={viewOnly}
                      rows={3}
                    />
                  </div>
                  {currentRole === 'support' && (
                    <div className="md:col-span-2">
                      <Label>Petshop</Label>
                      <select
                        value={formData.business_id || ''}
                        onChange={(e) => setFormData((s) => ({ ...s, business_id: e.target.value || null }))}
                        className="p-2 border rounded w-full"
                        disabled={viewOnly}
                      >
                        <option value="">— Selecionar petshop —</option>
                        {businesses.map(b => (
                          <option key={b.id} value={b.id}>{b.brand_name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setIsFormOpen(false); setFormMode('create'); setViewOnly(false); }}>
                    Fechar
                  </Button>
                  {!viewOnly && (
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
            {/* Clientes em cards (desktop) - sem wrapper Card */}
            <div className="hidden md:block">
              <div className="grid grid-cols-1 gap-4">
                {filteredCustomers.map((customer) => (
                  <Card key={customer.id} className="hover:shadow-lg">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 pr-4">
                          <div className="font-medium text-lg">{customer.name}</div>
                          <div className="text-sm text-muted-foreground mt-2 space-y-1">
                            {customer.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span>{customer.email}</span>
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{customer.phone}</span>
                              </div>
                            )}
                            {customer.city && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{customer.city}</span>
                              </div>
                            )}
                            {/* Pets linked to this customer: paw icon + two-line info (count + names) */}
                            {(() => {
                              const petsFor = (petsByCustomer[String(customer.id)] ?? []);
                              if (petsFor.length === 0) return null;
                              const names = petsFor.map(p => p.name).join(', ');
                              return (
                                <div className="mt-2 flex items-center gap-3">
                                  <PawPrint className="h-6 w-6 text-accent flex-shrink-0" />
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium">{petsFor.length} pet{petsFor.length > 1 ? 's' : ''}</div>
                                    <div className="text-xs text-muted-foreground truncate max-w-[36rem]">{names}</div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                          <div className="text-sm text-muted-foreground mt-3">Cadastro: {formatDate(customer.created_at)}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            aria-label={`Detalhes de ${customer.name}`}
                            onClick={() => openDetails(customer)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>

                          {canEditRow(customer) ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label={`Editar ${customer.name}`}
                                onClick={() => openEdit(customer)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                aria-label={`Excluir ${customer.name}`}
                                onClick={() => handleDelete(customer.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-sm text-muted-foreground">Sem permissão</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Cards Mobile */}
            <div className="md:hidden space-y-3">
              {filteredCustomers.map(customer => (
                <Card key={customer.id}>
                  <CardContent className="px-6 pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium">{customer.name}</div>
                        {customer.email && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Mail className="h-3 w-3" />
                            <span>{customer.email}</span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{customer.phone}</span>
                          </div>
                        )}
                        {customer.city && (
                          <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{customer.city}</span>
                          </div>
                        )}
                        {currentRole === 'support' && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Petshop: {customer.business_name || customer.business_id || '—'}
                          </div>
                        )}
                        {/* Pets (mobile) - paw + two-line info */}
                        {(() => {
                          const petsFor = (petsByCustomer[String(customer.id)] ?? []);
                          if (petsFor.length === 0) return null;
                          const names = petsFor.map(p => p.name).join(', ');
                          return (
                            <div className="text-sm text-muted-foreground mt-2 flex items-center gap-3">
                              <PawPrint className="h-5 w-5 text-accent flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="text-sm font-medium">{petsFor.length} pet{petsFor.length > 1 ? 's' : ''}</div>
                                <div className="text-xs truncate max-w-[20rem]">{names}</div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label={`Detalhes de ${customer.name}`}
                          onClick={() => openDetails(customer)}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        {canEditRow(customer) && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label={`Editar ${customer.name}`}
                              onClick={() => openEdit(customer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              aria-label={`Excluir ${customer.name}`}
                              onClick={() => handleDelete(customer.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCustomers.length === 0 && (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center text-muted-foreground">
                    Nenhum cliente encontrado.
                  </div>
                </CardContent>
              </Card>
            )}

            {/* KPI Cards (moved below the customers list) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Clientes</p>
                      <h3 className="text-2xl font-bold text-primary">{customers.length}</h3>
                      <p className="text-xs text-muted-foreground">Clientes cadastrados no petshop</p>
                    </div>
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                      <h3 className="text-2xl font-bold text-accent">{activeClients}</h3>
                      <p className="text-xs text-muted-foreground">Atividade nos últimos 6 meses</p>
                    </div>
                    <PawPrint className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total de Visitas</p>
                      <h3 className="text-2xl font-bold text-primary">{totalVisits}</h3>
                      <p className="text-xs text-muted-foreground">Total de agendamentos/atendimentos</p>
                    </div>
                    <Calendar className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Receita Total</p>
                      <h3 className="text-2xl font-bold text-accent">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)}
                      </h3>
                      <p className="text-xs text-muted-foreground">Receita acumulada (sistema)</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-accent" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default ClientsPage;
