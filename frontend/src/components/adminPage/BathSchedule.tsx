import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Scissors } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { CardDescription, CardTitle } from "../ui/card";
import { Phone, MessageSquare, MoreHorizontal } from "lucide-react";
import React, { useEffect, useState } from "react";
import { getAppointments, updateAppointment, Appointment as AppointmentType } from "../../services/appointments";
import useBusiness from '../../hooks/useBusiness';
import { getServices, Service as ServiceItem } from '../../services/services';
import EditAppointmentForm from './EditAppointmentForm';

type UIAppointment = AppointmentType & {
  client?: string | null;
  pet?: string | null;
  service?: string | null;
  price_formatted?: string;
  price_number?: number | null;
  duration_formatted?: string | null;
};

const formatPrice = (p: any) => {
  if (p == null) return "R$ 0,00";
  if (typeof p === "number") return p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  if (typeof p === "string") return p;
  return String(p);
};

const formatDuration = (d: any) => {
  if (d == null) return "";
  if (typeof d === "number") {
    const hours = Math.floor(d / 60);
    const minutes = d % 60;
    return `${hours > 0 ? hours + "h " : ""}${minutes > 0 ? minutes + "min" : ""}`.trim();
  }
  return String(d);
};

const normalizeStatus = (status?: string | null) => {
  if (!status) return "pendente";
  const s = String(status).toLowerCase();
  if (s.includes("confirm")) return "confirmado";
  if (s.includes("progress") || s.includes("andamento") || s.includes("in-progress") || s.includes("in_progress")) return "concluido";
  if (s.includes("pend") || s.includes("sched")) return "pendente";
  if (s.includes("complete") || s.includes("completed") || s.includes("conclu")) return "concluido";
  return status;
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case "confirmado":
      return "bg-emerald-100 text-emerald-800";
    case "concluido":
      return "bg-blue-100 text-blue-800";
    case "pendente":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status?: string) => {
  switch (status) {
    case "confirmado":
      return "Confirmado";
    case "concluido":
      return "Concluído";
    case "pendente":
      return "Pendente";
    default:
      return status;
  }
};

export function BathSchedule() {
  const [appointments, setAppointments] = useState<UIAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [services, setServices] = useState<ServiceItem[]>([]);
  const { business, businessId, loading: businessLoading } = useBusiness();

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const today = new Date();
      const startIso = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0)).toISOString();
      const endIso = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999)).toISOString();
      const params: any = { start_date: startIso, end_date: endIso };
      if (businessId) params.business_id = businessId;
      const data = await getAppointments(params, true);
      const mapped: UIAppointment[] = (data || []).map((a: AppointmentType) => {
        const price_number = (a.price == null) ? null : Number(a.price);
        return {
          ...a,
          client: a.customer_name ?? null,
          pet: (a.pet_name as any) || a['pet_name'] || null,
          service: (a.service_name as any) || a['service_name'] || null,
          raw_status: (a.status as any) || '',
          price_number,
          price_formatted: formatPrice(price_number ?? a.price),
          duration_formatted: formatDuration(a.duration),
          status: normalizeStatus(a.status),
        };
      });
      setAppointments(mapped);
    } catch (err: any) {
      setError(err?.message || "Falha ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (!businessLoading) loadAppointments();

    const fetchServices = async () => {
      try {
        const s = await getServices(true, { business_id: businessId || undefined });
        if (!mounted) return;
        setServices(s || []);
      } catch (e) {
        // ignore
      }
    };
    fetchServices();

    return () => { mounted = false; };
  }, [businessId, businessLoading]);

  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editService, setEditService] = useState<string>('');
  const [editStatus, setEditStatus] = useState<string>('');
  const [editPrice, setEditPrice] = useState<string>('');
  const [editReceived, setEditReceived] = useState<boolean>(false);

  const openEdit = (apt: any) => {
    setEditingAppointment(apt);
    let dval = '';
    if (apt && apt.date) {
      const ds = String(apt.date);
      dval = ds.includes('T') ? ds.substring(0,10) : ds.substring(0,10);
    }
    setEditDate(dval);
    const t = apt.time || '09:00';
    const parts = String(t).split(':');
    if (parts.length >= 2 && parts[0] !== undefined && parts[1] !== undefined) {
      setEditTime(`${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}`);
    } else {
      setEditTime(`${String(t).padStart(2,'0')}:00`);
    }
    setEditNotes(apt.notes || '');
    setEditService(apt.service || '');
    setEditStatus((apt.raw_status || apt.status || '') as string);
    setEditPrice((apt.price_number !== undefined && apt.price_number !== null) ? String(Number(apt.price_number).toFixed(2)) : (apt.price ? String(Number(apt.price).toFixed(2)) : ''));
    setEditReceived(String(apt.financial_status || apt.raw_status || apt.status || '').toLowerCase() === 'received');
  };

  const closeEdit = () => {
    setEditingAppointment(null);
    setEditDate(''); setEditTime(''); setEditNotes(''); setEditService(''); setEditStatus(''); setEditPrice(''); setEditReceived(false);
  };

  const handleSaveEdit = async () => {
    if (!editingAppointment) return;
    try {
      setLoading(true);
      let dateToSend = editDate;
      if (dateToSend && dateToSend.includes('T')) dateToSend = dateToSend.substring(0,10);
      const payload: any = { date: dateToSend, time: editTime, notes: editNotes };
      if (editService && editService !== 'none') payload.service = editService;
      if (editService === 'none') payload.service = '';
      if (editStatus) payload.status = editStatus;
      if (editPrice !== undefined && editPrice !== null && String(editPrice).trim() !== '') {
        const v = Number(editPrice);
        if (!isNaN(v)) payload.price = v;
      }
      payload.received = !!editReceived;
      await updateAppointment(editingAppointment.id, payload);
      closeEdit();
      await loadAppointments();
    } catch (e: any) {
      setError(e?.message || 'Falha ao salvar alterações');
    } finally {
      setLoading(false);
    }
  };

  const totalRevenueNumber = appointments.reduce((s, a) => s + (Number(a.price_number ?? 0) || 0), 0);
  const totalRevenue = formatPrice(totalRevenueNumber);

  const confirmedCount = appointments.filter(a => normalizeStatus(a.status) === 'confirmado').length;
  const completedCount = appointments.filter(a => normalizeStatus(a.status) === 'concluido').length;
  const pendingCount = appointments.filter(a => normalizeStatus(a.status) === 'pendente').length;
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(appointments.length / pageSize));

  useEffect(() => {
    setPage(0);
  }, [appointments.length]);

  return (
    <div className="col-span-2">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Scissors className="h-5 w-5 text-primary" />
            Agenda - Hoje
          </h3>
          <p className="text-sm text-muted-foreground">
            {appointments.length} agendamentos • Receita: {totalRevenue}
          </p>
        </div>
        
      </div>

      <EditAppointmentForm
        open={!!editingAppointment}
        onOpenChange={(open) => { if (!open) closeEdit(); }}
        editingAppointment={editingAppointment}
        editDate={editDate}
        setEditDate={setEditDate}
        editTime={editTime}
        setEditTime={setEditTime}
        editNotes={editNotes}
        setEditNotes={setEditNotes}
        editService={editService}
        setEditService={setEditService}
        editStatus={editStatus}
        setEditStatus={setEditStatus}
        editPrice={editPrice}
        setEditPrice={setEditPrice}
        editReceived={editReceived}
        setEditReceived={setEditReceived}
        services={services}
        statusLabels={{ confirmed: 'Confirmado', scheduled: 'Agendado', completed: 'Concluído', canceled: 'Cancelado' }}
        closeEdit={closeEdit}
        handleSaveEdit={handleSaveEdit}
      />

      <div className="space-y-3">
        {loading && <div className="text-sm text-muted-foreground">Carregando agendamentos...</div>}
        {error && <div className="text-sm text-destructive">{error}</div>}
        {appointments.length === 0 && !loading && !error && <div className="text-sm text-muted-foreground">Sem agendamentos hoje.</div>}
        {(() => {
          const start = page * pageSize;
          const end = Math.min(start + pageSize, appointments.length);
          const paginated = appointments.slice(start, end);
          return paginated.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="text-center min-w-[60px]">
                <div className="text-sm font-medium">{appointment.time}</div>
                <div className="text-xs text-muted-foreground">{appointment.duration_formatted ?? appointment.duration}</div>
              </div>

              <Avatar className="hidden sm:flex h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {(((appointment.client ?? appointment.customer_name) as string) || "").split(" ").filter(Boolean).map((n) => n[0]).join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 mb-1">
                  <div className="font-medium truncate">{appointment.client ?? appointment.customer_name}</div>
                  <Badge variant="outline" className="text-xs sm:ml-2">
                    {appointment.pet ?? appointment.pet_name}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground truncate">{appointment.service ?? appointment.service_name}</div>
              </div>
            </div>

            <div className="ml-4 flex items-center gap-3">
              <div className="text-sm font-medium text-right">
                <div className="font-medium text-sm">{(appointment as any).price_formatted ?? (appointment.price ?? "R$ 0,00")}</div>
                <Badge variant="secondary" className={`text-xs ${getStatusColor(appointment.status ?? "")}`}>
                  {getStatusText(appointment.status ?? "")}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MessageSquare className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => openEdit(appointment)}>Editar agendamento</DropdownMenuItem>
                      <DropdownMenuItem onSelect={async () => {
                        try { setLoading(true); await updateAppointment(appointment.id, { status: 'concluido' }); await loadAppointments(); }
                        catch (e:any) { setError(e?.message || 'Falha'); }
                        finally { setLoading(false); }
                      }}>Marcar como concluído</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => { /* TODO: abrir remarcação */ }}>Remarcar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onSelect={async () => { try { setLoading(true); await updateAppointment(appointment.id, { status: 'canceled' }); await loadAppointments(); } catch(e:any){ setError(e?.message||'Falha'); } finally { setLoading(false);} }}>Cancelar</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
          ));
        })()}

        {appointments.length > pageSize && (
          <div className="flex items-center justify-between mt-3">
            <div className="text-sm text-muted-foreground">
              {`Mostrando ${page * pageSize + 1}-${Math.min((page + 1) * pageSize, appointments.length)} de ${appointments.length}`}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
        <div className="grid grid-cols-3 sm:grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-semibold text-emerald-600">{confirmedCount}</div>
            <div className="text-xs text-muted-foreground">Confirmados</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">{completedCount}</div>
            <div className="text-xs text-muted-foreground">Concluídos</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-yellow-600">{pendingCount}</div>
            <div className="text-xs text-muted-foreground">Pendentes</div>
          </div>
        </div>
      </div>
    </div>
  );
}