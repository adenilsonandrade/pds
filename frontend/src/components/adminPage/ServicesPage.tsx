import React, { useEffect, useState } from 'react';
import { getServices as apiGetServices, createService as apiCreateService, updateService as apiUpdateService, deleteService as apiDeleteService } from '../../services/services';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '../ui/dropdown-menu';
import { ChevronDown, Search, Plus, Edit3, Trash2 } from 'lucide-react';
import ErrorBoundary from '../ErrorBoundary';
import ServiceForm, { LocalService } from './ServiceForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

export default function ServicesPage() {
  const [services, setServices] = useState<LocalService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['active']);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [editingService, setEditingService] = useState<LocalService | null>(null);

  useEffect(() => {
    let ignore = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await apiGetServices(true);
        if (ignore) return;
    const mapped = data.map((s: any) => ({ id: s.id ?? s.name, name: s.name ?? String(s), description: s.description ?? null, active: s.active !== undefined ? !!s.active : true, value: s.value !== undefined && s.value !== null ? Number(s.value) : null }));
        setServices(mapped);
      } catch (e: any) {
        setError(e?.message || 'Falha ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };
    fetch();
    return () => { ignore = true; };
  }, []);

  const toggleStatus = (status: string) => {
    setSelectedStatuses((prev) => {
      if (!prev) return [status];
      if (prev.includes(status)) return prev.length === 1 ? prev : prev.filter(s => s !== status);
      return [...prev, status];
    });
  };

  const areAllStatusesSelected = () => selectedStatuses.length === 2;
  const handleStatusAllToggle = () => {
    if (areAllStatusesSelected()) setSelectedStatuses(['active']);
    else setSelectedStatuses(['active', 'inactive']);
  };

  const filtered = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = (s.active ? selectedStatuses.includes('active') : selectedStatuses.includes('inactive'));
    return matchesSearch && matchesStatus;
  });

  const openCreate = () => { setEditingService(null); setShowFormDialog(true); };
  const openEdit = (s: LocalService) => { setEditingService(s); setShowFormDialog(true); };

  const handleSaved = (s: LocalService) => {
    (async () => {
      try {
        setLoading(true);
        if (editingService) {
          const updated = await apiUpdateService(s.id, { name: s.name, description: s.description ?? null, active: s.active, value: s.value });
          setServices(prev => prev.map(p => String(p.id) === String(s.id) ? { id: updated.id ?? s.id, name: updated.name ?? s.name, description: updated.description ?? s.description ?? null, active: updated.active !== undefined ? !!updated.active : !!s.active, value: updated.value !== undefined && updated.value !== null ? Number(updated.value) : (s.value ?? null) } : p));
        } else {
          const created = await apiCreateService({ name: s.name, description: s.description ?? null, value: s.value ?? null, active: s.active });
          setServices(prev => [ { id: created.id ?? s.id, name: created.name ?? s.name, description: created.description ?? s.description ?? null, active: created.active !== undefined ? !!created.active : !!s.active, value: created.value !== undefined && created.value !== null ? Number(created.value) : (s.value ?? null) }, ...prev ]);
        }
      } catch (e: any) {
        setError(e?.message || 'Falha ao salvar serviço');
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleDelete = (s: LocalService) => {
    setServiceToDelete(s);
  };

  const [serviceToDelete, setServiceToDelete] = useState<LocalService | null>(null);

  const confirmDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      setLoading(true);
      await apiDeleteService(serviceToDelete.id);
      setServices(prev => prev.filter(p => String(p.id) !== String(serviceToDelete.id)));
      setServiceToDelete(null);
    } catch (e: any) {
      setError(e?.message || 'Falha ao remover serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <main className="flex-1 space-y-6 p-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Serviços</h1>
            <p className="text-muted-foreground">Gerencie os serviços oferecidos</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{services.length}</div>
              <div className="text-sm text-muted-foreground">Total de serviços</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4 w-full lg:w-auto">
              <div className="relative w-full lg:w-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar serviço..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 w-full md:w-64" />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center gap-2 w-full">
            <div className="w-full md:w-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="border-input data-[placeholder]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full md:w-40 items-center justify-between gap-2 rounded-md border bg-input-background px-3 py-2 text-sm whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50">
                    <span className="truncate">{areAllStatusesSelected() ? 'Todos os status' : (selectedStatuses.length === 1 ? (selectedStatuses[0] === 'active' ? 'Ativo' : 'Inativo') : 'Status')}</span>
                    <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <DropdownMenuCheckboxItem checked={areAllStatusesSelected()} onCheckedChange={() => handleStatusAllToggle()}>Todos os status</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={selectedStatuses.includes('active')} onCheckedChange={() => toggleStatus('active')}>Ativo</DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem checked={selectedStatuses.includes('inactive')} onCheckedChange={() => toggleStatus('inactive')}>Inativo</DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="w-full md:w-auto">
              <Button className="w-full md:w-auto" onClick={openCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Serviço
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="grid grid-cols-1 gap-4">
            {loading && <div className="p-4 text-muted-foreground col-span-full">Carregando serviços...</div>}
            {error && <div className="p-4 text-red-600 col-span-full">{error}</div>}
            {!loading && filtered.length === 0 && <div className="p-6 text-center text-muted-foreground col-span-full">Nenhum serviço encontrado.</div>}
            {filtered.map((s) => (
              <Card key={String(s.id)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-lg truncate">{s.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">R$ {s.value !== undefined && s.value !== null ? Number(s.value).toFixed(2) : '—'}</div>
                      {s.description && <div className="text-sm text-muted-foreground mt-2 line-clamp-3">{s.description}</div>}
                    </div>
                    <div className="ml-2">
                      <Badge className={s.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{s.active ? 'Ativo' : 'Inativo'}</Badge>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(s)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => { if (!open) setServiceToDelete(null); }}>
          <AlertDialogContent className="z-[100]">
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir serviço</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover o serviço "{serviceToDelete?.name}"? Esta ação pode ser revertida apenas recriando o serviço.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button variant="destructive" onClick={confirmDeleteService} disabled={loading}>{loading ? 'Excluindo...' : 'Excluir'}</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={showFormDialog} onOpenChange={(open) => { if (!open) setShowFormDialog(false); }}>
          <DialogContent className="max-h-[90vh] overflow-auto w-full">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Editar Serviço' : 'Cadastrar Serviço'}</DialogTitle>
            </DialogHeader>
            <ServiceForm service={editingService ?? undefined} mode={editingService ? 'edit' : 'create'} onClose={() => setShowFormDialog(false)} onSaved={handleSaved} />
          </DialogContent>
        </Dialog>
      </main>
    </ErrorBoundary>
  );
}
