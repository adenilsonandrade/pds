import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viewingAppointment: any | null;
}

export default function ViewAppointmentDetails({ open, onOpenChange, viewingAppointment }: Props) {
  const formatDate = (val: any) => {
    if (!val) return '—';
    try {
      const s = String(val);
      const d = new Date(s);
      if (!isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
      const m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
      if (m) return `${m[3]}/${m[2]}/${m[1]}`;
      return s;
    } catch (e) {
      return String(val);
    }
  };

  return (
    <Dialog open={!!open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] p-4 w-full">
        <DialogHeader>
          <DialogTitle>Detalhes do Agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <div><strong>Pet:</strong> {viewingAppointment?.petName}</div>
          <div><strong>Tutor:</strong> {viewingAppointment?.ownerName}</div>
          <div><strong>Serviço:</strong> {viewingAppointment?.service}</div>
          <div><strong>Data:</strong> {formatDate(viewingAppointment?.date)}</div>
          <div><strong>Hora:</strong> {viewingAppointment?.time}</div>
          <div><strong>Observações:</strong> {viewingAppointment?.notes || '—'}</div>
          <div><strong>Status:</strong> {viewingAppointment?.status}</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
