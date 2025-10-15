import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar, ChevronLeft, ChevronRight, Filter, Plus, Search, Eye, Grid, List } from "lucide-react";

type ViewType = "month" | "week" | "day";
type StatusType = "confirmed" | "pending" | "completed" | "cancelled";

interface Appointment {
  id: string;
  time: string;
  petName: string;
  ownerName: string;
  service: string;
  status: StatusType;
  value: number;
  duration: number;
}

const mockAppointments: Appointment[] = [
  {
    id: "1",
    time: "09:00",
    petName: "Buddy",
    ownerName: "João Silva",
    service: "Banho e Tosa",
    status: "confirmed",
    value: 65.00,
    duration: 90
  },
  {
    id: "2", 
    time: "10:30",
    petName: "Luna",
    ownerName: "Maria Santos",
    service: "Apenas Banho",
    status: "pending",
    value: 35.00,
    duration: 60
  },
  {
    id: "3",
    time: "14:00",
    petName: "Max",
    ownerName: "Pedro Costa",
    service: "Tosa Higiênica",
    status: "confirmed",
    value: 45.00,
    duration: 75
  },
  {
    id: "4",
    time: "15:30",
    petName: "Bella",
    ownerName: "Ana Oliveira",
    service: "Banho e Tosa Completa",
    status: "completed",
    value: 85.00,
    duration: 120
  }
];

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

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = appointment.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesService = filterService === "all" || appointment.service === filterService;
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    
    return matchesSearch && matchesService && matchesStatus;
  });

  const totalDayValue = filteredAppointments.reduce((sum, apt) => sum + apt.value, 0);
  const confirmedCount = filteredAppointments.filter(apt => apt.status === "confirmed").length;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            Hoje
          </Button>
          <Button variant="outline" size="sm">
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
            <Button className="w-full md:w-auto">
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
          <Card>
            <CardHeader>
              <CardTitle>Visualização Semanal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Visualização semanal em desenvolvimento
              </div>
            </CardContent>
          </Card>
        )}

        {currentView === "month" && (
          <Card>
            <CardHeader>
              <CardTitle>Visualização Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Visualização mensal em desenvolvimento
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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