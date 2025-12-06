import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { SelectContent as _SC } from '../ui/select';

import type { Service as ServiceItem } from '../../services/services';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAppointment: any | null;
  editDate: string;
  setEditDate: (v: string) => void;
  editTime: string;
  setEditTime: (v: string) => void;
  editNotes: string;
  setEditNotes: (v: string) => void;
  editService: string;
  setEditService: (v: string) => void;
  editStatus: any;
  setEditStatus: (v: any) => void;
  editPrice: string;
  setEditPrice: (v: string) => void;
  editReceived: boolean;
  setEditReceived: (v: boolean) => void;
  services: ServiceItem[];
  statusLabels: Record<string, string>;
  closeEdit: () => void;
  handleSaveEdit: () => Promise<void>;
}

export default function EditAppointmentForm(props: Props) {
  const {
    open,
    onOpenChange,
    editingAppointment,
    editDate,
    setEditDate,
    editTime,
    setEditTime,
    editNotes,
    setEditNotes,
    editService,
    setEditService,
    editStatus,
    setEditStatus,
    editPrice,
    setEditPrice,
    editReceived,
    setEditReceived,
    services,
    statusLabels,
    closeEdit,
    handleSaveEdit,
  } = props;

  return (
    <Dialog open={!!open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] p-4 w-full">
        <DialogHeader>
          <DialogTitle>Editar Agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm">Data</label>
            <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Hora</label>
            <Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Observações</label>
            <Input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
          </div>
          <div>
            <label className="text-sm">Serviço</label>
            <Select value={editService} onValueChange={(v) => {
              setEditService(v);
              try {
                const svc = services.find(s => String(s.name) === String(v));
                if (svc) {
                  setEditPrice(svc.value !== undefined && svc.value !== null ? String(Number(svc.value).toFixed(2)) : '0.00');
                } else if (v === 'none' || v === '' || v === null) {
                  setEditPrice('');
                }
              } catch (e) {}
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={String(s.id)} value={String(s.name)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm">Preço (opcional)</label>
            <Input type="number" step="0.01" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} placeholder="Deixe em branco para manter valor atual" />
          </div>

          <div>
            <label className="text-sm">Status</label>
            <Select value={editStatus} onValueChange={(v: any) => setEditStatus(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(statusLabels).map(([k, label]) => (
                  <SelectItem key={k} value={k}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input id="editReceived" type="checkbox" checked={editReceived} onChange={(e) => { setEditReceived(e.target.checked); }} className="w-4 h-4" />
            <label htmlFor="editReceived" className="text-sm">Recebido</label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => closeEdit()}>Cancelar</Button>
            <Button onClick={() => handleSaveEdit()}>Salvar</Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
