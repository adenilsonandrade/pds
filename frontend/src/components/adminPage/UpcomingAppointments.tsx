import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar, Clock, TrendingUp } from "lucide-react";

const upcomingData = [
  {
    date: "Amanhã",
    count: 8,
    revenue: "R$ 640,00",
    appointments: [
      { time: "09:00", client: "Pedro Alves", service: "Banho + Tosa" },
      { time: "10:30", client: "Carla Mendes", service: "Banho Simples" },
      { time: "14:00", client: "José Silva", service: "Tosa Higiênica" }
    ]
  },
  {
    date: "Quarta-feira",
    count: 12,
    revenue: "R$ 960,00",
    appointments: [
      { time: "08:30", client: "Maria Santos", service: "Banho + Hidratação" },
      { time: "11:00", client: "Ricardo Costa", service: "Banho + Tosa + Unha" },
      { time: "15:30", client: "Ana Rodrigues", service: "Banho Medicinal" }
    ]
  },
  {
    date: "Quinta-feira",
    count: 6,
    revenue: "R$ 420,00",
    appointments: [
      { time: "10:00", client: "Bruno Lima", service: "Tosa Bebê" },
      { time: "13:30", client: "Lucia Ferreira", service: "Banho + Perfume" },
      { time: "16:00", client: "Carlos Oliveira", service: "Banho Simples" }
    ]
  }
];

export function UpcomingAppointments() {
  const totalUpcoming = upcomingData.reduce((sum, day) => sum + day.count, 0);
  const totalRevenue = upcomingData.reduce((sum, day) => {
    return sum + parseFloat(day.revenue.replace('R$ ', '').replace('.', '').replace(',', '.'));
  }, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              Próximos Agendamentos
            </CardTitle>
            <CardDescription>
              {totalUpcoming} agendamentos nos próximos 3 dias
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-200">
            <TrendingUp className="h-3 w-3 mr-1" />
            +15% vs semana passada
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {upcomingData.map((day, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{day.date}</h4>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span>{day.count} agendamentos</span>
                  <span></span>
                  <span className="text-emerald-600 font-medium">{day.revenue}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                {day.appointments.map((appointment, appIndex) => (
                  <div 
                    key={appIndex}
                    className="flex items-center justify-between p-2 rounded-md bg-secondary/20"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {appointment.time}
                      </div>
                      <span className="text-sm">{appointment.client}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {appointment.service}
                    </Badge>
                  </div>
                ))}
                
                {day.count > 3 && (
                  <div className="text-center">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                      Ver mais {day.count - 3} agendamentos
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Receita estimada (3 dias)</div>
              <div className="text-lg font-semibold text-primary">
                R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <Button size="sm">
              Gerenciar Agenda
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}