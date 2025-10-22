import { useEffect, useState } from "react";
import { getAppointments } from "../../services/appointments";
import { useSelectedBusiness } from '../../contexts/SelectedBusinessContext';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar, ChevronLeft, ChevronRight, Filter, Plus, Search, Eye, Grid, List, Edit3, X, PawPrint, Trash2, CheckCircle, DollarSign, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../ui/alert-dialog';
import { updateAppointment } from '../../services/appointments';
import NewAppointmentForm from './NewAppointmentForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import ErrorBoundary from '../ErrorBoundary';
import { getServices, Service as ServiceItem } from '../../services/services';

type ViewType = "month" | "week" | "day";
type StatusType = "confirmed" | "scheduled" | "completed" | "canceled";

interface Appointment {
  id: string | number;
  time: string;
  date?: string;
  petName: string;
  ownerName: string;
  service: string;
  status: StatusType;
  value: number;
  duration: number;
}

const statusColors: Record<StatusType, string> = {
  confirmed: "bg-green-100 text-green-800",
  scheduled: "bg-yellow-100 text-yellow-800", 
  completed: "bg-blue-100 text-blue-800",
  canceled: "bg-red-100 text-red-800"
};

const statusLabels: Record<StatusType, string> = {
  confirmed: "Confirmado",
  scheduled: "Agendado",
  completed: "Concluído",
  canceled: "Cancelado"
};

export function SchedulePage() {
  const [currentView, setCurrentView] = useState<ViewType>("day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterService, setFilterService] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const { selectedBusinessId } = useSelectedBusiness();

  useEffect(() => {
    let ignore = false;
    const fetchServices = async () => {
      try {
        const s = await getServices(true);
        if (ignore) return;
        setServices(s || []);
      } catch (e:any) {
        console.warn('Failed to load services', e?.message || e);
      }
    };
    fetchServices();
    return () => { ignore = true; };
  }, []);

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = appointment.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = filterService === "all" || appointment.service === filterService;
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    
    return matchesSearch && matchesService && matchesStatus;
  });

  const totalDayValue = filteredAppointments.reduce((sum, apt) => sum + apt.value, 0);
  const confirmedCount = filteredAppointments.filter(apt => apt.status === "confirmed").length;
  const canceledCount = filteredAppointments.filter(apt => String(apt.status) === "canceled").length;

  const formatDate = (date: Date) => {
    if (currentView === 'month') {
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
    if (currentView === 'week') {
      const day = date.getDay();
      const diffToMonday = (day + 6) % 7;
      const monday = new Date(date);
      monday.setDate(date.getDate() - diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const mStr = monday.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      const sStr = sunday.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${mStr} — ${sStr}`;
    }
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const addDays = (d: Date, days: number) => {
    const n = new Date(d);
    n.setDate(n.getDate() + days);
    return n;
  };

  const addMonths = (d: Date, months: number) => {
    const n = new Date(d);
    const day = n.getDate();
    n.setMonth(n.getMonth() + months);
    if (n.getDate() < day) {
      n.setDate(0);
    }
    return n;
  };

  const toISODate = (d: Date) => {
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    return new Date(Date.UTC(y, m, day)).toISOString();
  };

  const toISOStart = (d: Date) => {
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    return new Date(Date.UTC(y, m, day, 0, 0, 0, 0)).toISOString();
  };

  const toISOEnd = (d: Date) => {
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();
    return new Date(Date.UTC(y, m, day, 23, 59, 59, 999)).toISOString();
  };

  const handlePrev = () => {
    if (currentView === 'month') setSelectedDate(prev => addMonths(prev, -1));
    else if (currentView === 'week') setSelectedDate(prev => addDays(prev, -7));
    else setSelectedDate(prev => addDays(prev, -1));
  };

  const handleNext = () => {
    if (currentView === 'month') setSelectedDate(prev => addMonths(prev, 1));
    else if (currentView === 'week') setSelectedDate(prev => addDays(prev, 7));
    else setSelectedDate(prev => addDays(prev, 1));
  };

  const handleToday = () => {
    const now = new Date();
    if (currentView === 'month') {
      setSelectedDate(now);
    } else if (currentView === 'week') {
      setSelectedDate(now);
    } else {
      setSelectedDate(now);
    }
  };

  const todayLabel = () => {
    if (currentView === 'month') return 'Mês atual';
    if (currentView === 'week') return 'Semana atual';
    return 'Hoje';
  };

  useEffect(() => {
    let ignore = false;
    const fetchApts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: any = {};
        if (currentView === 'day') {
          params.start_date = toISOStart(selectedDate);
          params.end_date = toISOEnd(selectedDate);
        } else if (currentView === 'week') {
          const day = selectedDate.getDay();
          const diffToMonday = (day + 6) % 7;
          const monday = new Date(selectedDate);
          monday.setDate(selectedDate.getDate() - diffToMonday);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          params.start_date = toISOStart(monday);
          params.end_date = toISOEnd(sunday);
        } else if (currentView === 'month') {
          const first = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
          const last = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
          params.start_date = toISOStart(first);
          params.end_date = toISOEnd(last);
        }
        if (selectedBusinessId) params.business_id = selectedBusinessId;
        if (searchTerm) params.q = searchTerm;
        if (filterService && filterService !== 'all') params.q = params.q ? `${params.q} ${filterService}` : filterService;
        if (filterStatus && filterStatus !== 'all') params.q = params.q ? `${params.q} ${filterStatus}` : filterStatus;

        const data = await getAppointments(params, true);
        if (ignore) return;
        const mapped = data.map((r: any) => ({
          id: r.id,
          time: (function() {
            if (!r.time) return '';
            const t = String(r.time);
            const isoMatch = t.match(/T(\d{2}:\d{2}:?\d{0,2})/);
            if (isoMatch && isoMatch[1]) {
              const parts = isoMatch[1].split(':');
              if (parts.length >= 2 && parts[0] !== undefined && parts[1] !== undefined) {
                return `${parts[0].padStart(2,'0')}:${parts[1].padStart(2,'0')}`;
              }
            }
            const p = t.split(':');
            if (p.length >= 2 && p[0] !== undefined && p[1] !== undefined) return `${p[0].padStart(2,'0')}:${p[1].padStart(2,'0')}`;
            return t;
          })(),
          date: r.date,
          petName: r.pet_name || r.petName || '—',
          ownerName: r.customer_name || r.ownerName || '—',
          service: r.service_name || r.service || (r.service_id ? String(r.service_id) : '—'),
          status: (r.status || 'scheduled') as StatusType,
          value: (r.price !== undefined && r.price !== null) ? Number(r.price) : (r.service_value !== undefined ? Number(r.service_value) : 0),
          duration: r.duration || 60,
        }));
        setAppointments(mapped);
      } catch (err: any) {
        if (err?.message === 'Autenticação requerida') {
          setError('Faça login para ver os agendamentos');
        } else {
          setError(err?.message || 'Falha ao carregar agendamentos');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchApts();
    return () => { ignore = true; };
  }, [currentView, selectedDate, searchTerm, filterService, filterStatus, selectedBusinessId]);

  const handleNewCreated = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {};
      if (currentView === 'day') {
        params.start_date = toISOStart(selectedDate);
        params.end_date = toISOEnd(selectedDate);
      } else if (currentView === 'week') {
        const day = selectedDate.getDay();
        const diffToMonday = (day + 6) % 7;
        const monday = new Date(selectedDate);
        monday.setDate(selectedDate.getDate() - diffToMonday);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        params.start_date = toISOStart(monday);
        params.end_date = toISOEnd(sunday);
      } else if (currentView === 'month') {
        const first = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const last = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        params.start_date = toISOStart(first);
        params.end_date = toISOEnd(last);
      }
      if (selectedBusinessId) params.business_id = selectedBusinessId;
      const data = await getAppointments(params, true);
      const mapped = data.map((r: any) => ({
        id: r.id,
        time: r.time,
        date: r.date,
        petName: r.pet_name || r.petName || '—',
        ownerName: r.customer_name || r.ownerName || '—',
        service: r.service_name || r.service || (r.service_id ? String(r.service_id) : '—'),
        status: (r.status || 'scheduled') as StatusType,
        value: (r.price !== undefined && r.price !== null) ? Number(r.price) : (r.service_value !== undefined ? Number(r.service_value) : 0),
        duration: r.duration || 60,
      }));
      setAppointments(mapped);
    } catch (err: any) {
      setError(err?.message || 'Falha ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const [viewingAppointment, setViewingAppointment] = useState<any | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<any | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editService, setEditService] = useState<string>('');
  const [editStatus, setEditStatus] = useState<StatusType>('scheduled');

  const openView = (apt: any) => {
    setViewingAppointment(apt);
  };

  const openEdit = (apt: any) => {
    setEditingAppointment(apt);
    let dval = '';
    if (apt && apt.date) {
      const ds = String(apt.date);
      if (ds.includes('T')) dval = ds.substring(0, 10);
      else dval = ds.substring(0, 10);
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
    setEditStatus((apt.status || 'scheduled') as StatusType);
  };

  const closeEdit = () => {
    setEditingAppointment(null);
    setEditDate(''); setEditTime(''); setEditNotes('');
    setEditService(''); setEditStatus('scheduled');
  };

  const handleSaveEdit = async () => {
    if (!editingAppointment) return;
    try {
      setLoading(true);
      let dateToSend = editDate;
      if (dateToSend && dateToSend.includes('T')) dateToSend = dateToSend.substring(0, 10);
      const payload: any = { date: dateToSend, time: editTime, notes: editNotes };
      if (editService && editService !== 'none') payload.service = editService;
      if (editService === 'none') payload.service = '';
      if (editStatus) payload.status = editStatus;
      await updateAppointment(editingAppointment.id, payload);
      closeEdit();
      await handleNewCreated();
    } catch (e:any) {
      setError(e?.message || 'Falha ao salvar alterações');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (apt: any) => {
    setAppointmentToDelete(apt);
  };

  const confirmCancelAppointment = async () => {
    if (!appointmentToDelete) return;
    try {
      setLoading(true);
      await updateAppointment(appointmentToDelete.id, { status: 'canceled' });
      setAppointmentToDelete(null);
      await handleNewCreated();
    } catch (e:any) {
      setError(e?.message || 'Falha ao excluir agendamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
    <main className="flex-1 space-y-6 p-3">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Agenda / Calendário</h1>
          <p className="text-muted-foreground">
            {formatDate(selectedDate)}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">R$ {totalDayValue.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total do Dia</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent">{confirmedCount}</div>
            <div className="text-sm text-muted-foreground">Confirmados</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={currentView === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentView("month")}
          >
            Mês
          </Button>
          <Button
            variant={currentView === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentView("week")}
          >
            Semana
          </Button>
          <Button
            variant={currentView === "day" ? "default" : "outline"}
            size="sm"
            onClick={() => setCurrentView("day")}
          >
            Dia
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            {todayLabel()}
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1" />

        <div className="flex flex-col md:flex-row md:items-center gap-2 w-full">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar pet ou tutor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full md:w-64"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-2 w-full md:w-auto">
            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Serviço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {services.length === 0 ? (
                  <>
                    <SelectItem value="Banho e Tosa">Banho e Tosa</SelectItem>
                    <SelectItem value="Apenas Banho">Apenas Banho</SelectItem>
                    <SelectItem value="Tosa Higiênica">Tosa Higiênica</SelectItem>
                  </>
                ) : (
                  services.map((s) => (
                    <SelectItem key={String(s.id)} value={String(s.name)}>{s.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="scheduled">Agendado</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-auto">
            <Button className="w-full md:w-auto" onClick={() => setShowNewModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Agendamento
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {currentView === "day" && (
          <section>
            <header className="mb-3">
              <h3 className="flex items-center gap-2 text-lg font-medium">
                <Calendar className="h-5 w-5" />
                Agendamentos do Dia
              </h3>
            </header>

            <div>
              <div className="space-y-4">
                {loading && (
                  <div className="text-center py-4 text-muted-foreground">Carregando agendamentos...</div>
                )}
                {error && (
                  <div className="text-center py-4 text-red-600">{error}</div>
                )}
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center min-w-[60px]">
                        <div className="font-semibold">{appointment.time}</div>
                        <div className="text-xs text-muted-foreground">{appointment.duration}min</div>
                      </div>
                      
                        <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2"><PawPrint className="h-4 w-4 text-muted-foreground" />{appointment.petName}</div>
                        <div className="text-sm text-muted-foreground">{appointment.ownerName}</div>
                        <div className="text-sm">{appointment.service}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-3">
                        <Badge className={statusColors[(appointment as Appointment).status]}>
                          {statusLabels[(appointment as Appointment).status]}
                        </Badge>
                        <div className="text-left md:text-right md:ml-2">
                          <div className="font-semibold">R$ {appointment.value.toFixed(2)}</div>
                        </div>
                      </div>

                      <div className="flex gap-2 ml-auto items-center">
                        <div className="hidden md:flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openView(appointment)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(appointment)}>
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleCancelAppointment(appointment)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                        <div className="md:hidden">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => openView(appointment)}>
                                <Eye className="h-4 w-4 mr-2" /> Ver
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => openEdit(appointment)}>
                                <Edit3 className="h-4 w-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleCancelAppointment(appointment)} className="text-destructive" variant="destructive">
                                <Trash2 className="h-4 w-4 mr-2" /> Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredAppointments.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum agendamento encontrado para os filtros selecionados.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {currentView === "week" && (
          <section>
            <header className="mb-3">
              <h3 className="flex items-center gap-2 text-lg font-medium">
                <Calendar className="h-5 w-5" />
                Agendamentos da Semana
              </h3>
            </header>
            <div className="space-y-4">
              {loading && <div className="text-center py-4 text-muted-foreground">Carregando agendamentos...</div>}
              {error && <div className="text-center py-4 text-red-600">{error}</div>}
              {
                Object.entries(filteredAppointments.reduce((acc:any, a) => {
                  const k = String(a.date || '');
                  acc[k] = acc[k] || []; acc[k].push(a); return acc;
                }, {})).sort().map(([date, items]: any) => (
                  <div key={date} className="border rounded-lg p-3">
                    <div className="font-medium mb-2">{new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}</div>
                    <div className="space-y-2">
                      {items.map((appointment:any) => (
                        <div key={appointment.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                          <div className="flex items-center gap-4">
                            <div className="text-center min-w-[60px]">
                              <div className="font-semibold">{appointment.time}</div>
                              <div className="text-xs text-muted-foreground">{appointment.duration}min</div>
                            </div>
                              <div className="space-y-1">
                              <div className="font-medium flex items-center gap-2"><PawPrint className="h-4 w-4 text-muted-foreground" />{appointment.petName}</div>
                              <div className="text-sm text-muted-foreground">{appointment.ownerName}</div>
                              <div className="text-sm">{appointment.service}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-3">
                              <Badge className={statusColors[(appointment as Appointment).status]}>
                                {statusLabels[(appointment as Appointment).status]}
                              </Badge>
                              <div className="text-left md:text-right md:ml-2">
                                <div className="font-semibold">R$ {appointment.value.toFixed(2)}</div>
                              </div>
                            </div>

                            <div className="flex gap-2 ml-auto items-center">
                              <div className="hidden md:flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openView(appointment)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openEdit(appointment)}>
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleCancelAppointment(appointment)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>

                              <div className="md:hidden">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => openView(appointment)}>
                                      <Eye className="h-4 w-4 mr-2" /> Ver
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => openEdit(appointment)}>
                                      <Edit3 className="h-4 w-4 mr-2" /> Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleCancelAppointment(appointment)} className="text-destructive" variant="destructive">
                                      <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>
          </section>
        )}

        {currentView === "month" && (
          <section>
            <header className="mb-3">
              <h3 className="flex items-center gap-2 text-lg font-medium">
                <Calendar className="h-5 w-5" />
                Agendamentos do Mês
              </h3>
            </header>
            <div className="space-y-4">
              {loading && <div className="text-center py-4 text-muted-foreground">Carregando agendamentos...</div>}
              {error && <div className="text-center py-4 text-red-600">{error}</div>}
              {
                Object.entries(filteredAppointments.reduce((acc:any, a) => {
                  const k = String(a.date || '');
                  acc[k] = acc[k] || []; acc[k].push(a); return acc;
                }, {})).sort().map(([date, items]: any) => (
                  <div key={date} className="border rounded-lg p-3">
                    <div className="font-medium mb-2">{new Date(date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</div>
                    <div className="space-y-2">
                      {items.map((appointment:any) => (
                        <div key={appointment.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                          <div className="flex items-center gap-4">
                            <div className="text-center min-w-[60px]">
                              <div className="font-semibold">{appointment.time}</div>
                              <div className="text-xs text-muted-foreground">{appointment.duration}min</div>
                            </div>
                            <div className="space-y-1">
                              <div className="font-medium flex items-center gap-2"><PawPrint className="h-4 w-4 text-muted-foreground" />{appointment.petName}</div>
                              <div className="text-sm text-muted-foreground">{appointment.ownerName}</div>
                              <div className="text-sm">{appointment.service}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-3">
                              <Badge className={statusColors[(appointment as Appointment).status]}>
                                {statusLabels[(appointment as Appointment).status]}
                              </Badge>
                              <div className="text-left md:text-right md:ml-2">
                                <div className="font-semibold">R$ {appointment.value.toFixed(2)}</div>
                              </div>
                            </div>

                            <div className="flex gap-2 ml-auto items-center">
                              <div className="hidden md:flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openView(appointment)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openEdit(appointment)}>
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleCancelAppointment(appointment)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>

                              <div className="md:hidden">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => openView(appointment)}>
                                      <Eye className="h-4 w-4 mr-2" /> Ver
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => openEdit(appointment)}>
                                      <Edit3 className="h-4 w-4 mr-2" /> Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => handleCancelAppointment(appointment)} className="text-destructive" variant="destructive">
                                      <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>
          </section>
        )}
      </div>
      <Dialog open={showNewModal} onOpenChange={(open) => setShowNewModal(open)}>
    <DialogContent className="max-h-[90vh] overflow-auto w-full">
          <DialogHeader>
            <DialogTitle>Novo Agendamento</DialogTitle>
          </DialogHeader>
          <div>
            <NewAppointmentForm
              onClose={() => setShowNewModal(false)}
              onCreated={() => handleNewCreated()}
              defaultDate={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`}
            />
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!viewingAppointment} onOpenChange={(open) => { if (!open) setViewingAppointment(null); }}>
  <DialogContent className="max-h-[90vh] p-4 w-full">
          <DialogHeader>
            <DialogTitle>Detalhes do Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <div><strong>Pet:</strong> {viewingAppointment?.petName}</div>
            <div><strong>Tutor:</strong> {viewingAppointment?.ownerName}</div>
            <div><strong>Serviço:</strong> {viewingAppointment?.service}</div>
            <div><strong>Data:</strong> {viewingAppointment?.date}</div>
            <div><strong>Hora:</strong> {viewingAppointment?.time}</div>
            <div><strong>Observações:</strong> {viewingAppointment?.notes || '—'}</div>
            <div><strong>Status:</strong> {viewingAppointment?.status}</div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingAppointment} onOpenChange={(open) => { if (!open) closeEdit(); }}>
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
              <Select value={editService} onValueChange={(v) => setEditService(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum</SelectItem>
                    {services.map((s) => (
                      <SelectItem key={String(s.id)} value={String(s.name)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm">Status</label>
              <Select value={editStatus} onValueChange={(v:any) => setEditStatus(v)}>
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
            <DialogFooter>
              <Button variant="ghost" onClick={() => closeEdit()}>Cancelar</Button>
              <Button onClick={() => handleSaveEdit()}>Salvar</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmados</p>
                <h3 className="text-2xl font-bold text-green-600">{filteredAppointments.filter(apt => apt.status === "confirmed").length}</h3>
                <p className="text-xs text-muted-foreground">Agendamentos confirmados</p>
              </div>
              <PawPrint className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Agendados</p>
                <h3 className="text-2xl font-bold text-yellow-600">{filteredAppointments.filter(apt => apt.status === "scheduled").length}</h3>
                <p className="text-xs text-muted-foreground">Agendamentos pendentes</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Concluídos</p>
                <h3 className="text-2xl font-bold text-blue-600">{filteredAppointments.filter(apt => apt.status === "completed").length}</h3>
                <p className="text-xs text-muted-foreground">Atendimentos finalizados</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelados</p>
                <h3 className="text-2xl font-bold text-red-600">{canceledCount}</h3>
                <p className="text-xs text-muted-foreground">Agendamentos cancelados</p>
              </div>
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

              <AlertDialog open={!!appointmentToDelete} onOpenChange={(open) => { if (!open) setAppointmentToDelete(null); }}>
                <AlertDialogContent className="z-[100]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir agendamento</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir o agendamento de "{appointmentToDelete?.petName}" em {appointmentToDelete?.date} às {appointmentToDelete?.time}? Esta ação pode ser revertida alterando o status posteriormente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <Button variant="destructive" onClick={confirmCancelAppointment} disabled={loading}>{loading ? 'Excluindo...' : 'Excluir'}</Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
    </main>
    </ErrorBoundary>
  );
}