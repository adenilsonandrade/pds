import { useEffect, useState } from "react";
import { getAppointments } from "../../services/appointments";
import { useSelectedBusiness } from '../../contexts/SelectedBusinessContext';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar, ChevronLeft, ChevronRight, Filter, Plus, Search, Eye, Grid, List } from "lucide-react";
import NewAppointmentForm from './NewAppointmentForm';

type ViewType = "month" | "week" | "day";
type StatusType = "confirmed" | "pending" | "completed" | "cancelled";

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

// no local fallbacks — component will show loading or error states

const statusColors: Record<StatusType, string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800", 
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800"
};

const statusLabels: Record<StatusType, string> = {
  confirmed: "Confirmado",
  pending: "Pendente",
  completed: "Concluído",
  cancelled: "Cancelado"
};

export function SchedulePage() {
  const [currentView, setCurrentView] = useState<ViewType>("day");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterService, setFilterService] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const { selectedBusinessId } = useSelectedBusiness();

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch = appointment.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = filterService === "all" || appointment.service === filterService;
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    
    return matchesSearch && matchesService && matchesStatus;
  });

  const totalDayValue = filteredAppointments.reduce((sum, apt) => sum + apt.value, 0);
  const confirmedCount = filteredAppointments.filter(apt => apt.status === "confirmed").length;

  const formatDate = (date: Date) => {
    if (currentView === 'month') {
      return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    }
    if (currentView === 'week') {
      // compute week start (Monday) and end (Sunday)
      const day = date.getDay();
      const diffToMonday = (day + 6) % 7; // Monday = 0
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
    // adjust for month overflow
    if (n.getDate() < day) {
      n.setDate(0); // last day of previous month
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
      // set to today (month calculation will derive the month)
      setSelectedDate(now);
    } else if (currentView === 'week') {
      // set to today (week calculation uses selectedDate to find week range)
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
        // backend derives business from authenticated user; frontend can still pass selectedBusinessId as an optional filter
        if (selectedBusinessId) params.business_id = selectedBusinessId;
        if (searchTerm) params.q = searchTerm;
        if (filterService && filterService !== 'all') params.q = params.q ? `${params.q} ${filterService}` : filterService;
        if (filterStatus && filterStatus !== 'all') params.q = params.q ? `${params.q} ${filterStatus}` : filterStatus;

        const data = await getAppointments(params, true);
        if (ignore) return;
        const mapped = data.map((r: any) => ({
          id: r.id,
          time: r.time,
          date: r.date,
          petName: r.pet_name || r.petName || '—',
          ownerName: r.customer_name || r.ownerName || '—',
          service: r.service_name || r.service || '—',
          status: (r.status || 'pending') as StatusType,
          value: r.price || 0,
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
    // refetch appointments after creating a new one
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
        service: r.service_name || r.service || '—',
        status: (r.status || 'pending') as StatusType,
        value: r.price || 0,
        duration: r.duration || 60,
      }));
      setAppointments(mapped);
    } catch (err: any) {
      setError(err?.message || 'Falha ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  return (
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
                <SelectItem value="Banho e Tosa">Banho e Tosa</SelectItem>
                <SelectItem value="Apenas Banho">Apenas Banho</SelectItem>
                <SelectItem value="Tosa Higiênica">Tosa Higiênica</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="confirmed">Confirmado</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
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
                        <div className="font-medium">{appointment.petName}</div>
                        <div className="text-sm text-muted-foreground">{appointment.ownerName}</div>
                        <div className="text-sm">{appointment.service}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={statusColors[appointment.status]}>
                        {statusLabels[appointment.status]}
                      </Badge>
                      
                      <div className="text-right">
                        <div className="font-semibold">R$ {appointment.value.toFixed(2)}</div>
                      </div>

                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
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
                // group by date
                Object.entries(appointments.reduce((acc:any, a) => {
                  const k = String(a.date || '');
                  acc[k] = acc[k] || []; acc[k].push(a); return acc;
                }, {})).sort().map(([date, items]: any) => (
                  <div key={date} className="border rounded-lg p-3">
                    <div className="font-medium mb-2">{new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}</div>
                    <div className="space-y-2">
                      {items.map((appointment:any) => (
                        <div key={appointment.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="min-w-[60px] text-sm">{appointment.time}</div>
                            <div>
                              <div className="font-medium">{appointment.petName}</div>
                              <div className="text-sm text-muted-foreground">{appointment.ownerName}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">{appointment.service}</div>
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
                // group by date
                Object.entries(appointments.reduce((acc:any, a) => {
                  const k = String(a.date || '');
                  acc[k] = acc[k] || []; acc[k].push(a); return acc;
                }, {})).sort().map(([date, items]: any) => (
                  <div key={date} className="border rounded-lg p-3">
                    <div className="font-medium mb-2">{new Date(date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}</div>
                    <div className="space-y-2">
                      {items.map((appointment:any) => (
                        <div key={appointment.id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                          <div className="flex items-center gap-3">
                            <div className="min-w-[60px] text-sm">{appointment.time}</div>
                            <div>
                              <div className="font-medium">{appointment.petName}</div>
                              <div className="text-sm text-muted-foreground">{appointment.ownerName}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm">{appointment.service}</div>
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
      {/* New Appointment Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNewModal(false)} />
          <div className="relative bg-background rounded-lg shadow-lg overflow-auto max-h-[90vh]">
            <div className="flex items-center justify-between p-3 border-b">
              <h3 className="text-lg font-medium">Novo Agendamento</h3>
              <Button variant="ghost" onClick={() => setShowNewModal(false)}>Fechar</Button>
            </div>
            <div>
              <NewAppointmentForm
                onClose={() => setShowNewModal(false)}
                onCreated={() => handleNewCreated()}
                defaultDate={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredAppointments.filter(apt => apt.status === "confirmed").length}
              </div>
              <div className="text-sm text-muted-foreground">Confirmados</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredAppointments.filter(apt => apt.status === "pending").length}
              </div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {filteredAppointments.filter(apt => apt.status === "completed").length}
              </div>
              <div className="text-sm text-muted-foreground">Concluídos</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                R$ {totalDayValue.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}