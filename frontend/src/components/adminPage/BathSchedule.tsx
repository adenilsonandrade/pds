import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Clock, Phone, MessageSquare, MoreHorizontal, Scissors } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

const appointments = [
  {
    id: 1,
    time: "09:00",
    client: "Ana Silva",
    pet: "Rex (Golden Retriever)",
    service: "Banho + Tosa",
    status: "confirmado",
    phone: "(11) 99999-1111",
    duration: "1h 30min",
    price: "R$ 80,00"
  },
  {
    id: 2,
    time: "10:30",
    client: "Carlos Santos",
    pet: "Bella (Poodle)",
    service: "Banho + Hidratação",
    status: "em-andamento",
    phone: "(11) 99999-2222",
    duration: "1h",
    price: "R$ 65,00"
  },
  {
    id: 3,
    time: "12:00",
    client: "Marina Costa",
    pet: "Thor (Pastor Alemão)",
    service: "Banho + Tosa + Unha",
    status: "pendente",
    phone: "(11) 99999-3333",
    duration: "2h",
    price: "R$ 120,00"
  },
  {
    id: 4,
    time: "14:00",
    client: "Roberto Lima",
    pet: "Luna (Shih Tzu)",
    service: "Banho + Perfume",
    status: "confirmado",
    phone: "(11) 99999-4444",
    duration: "45min",
    price: "R$ 55,00"
  },
  {
    id: 5,
    time: "15:30",
    client: "Juliana Oliveira",
    pet: "Max (Bulldog)",
    service: "Banho Medicinal",
    status: "confirmado",
    phone: "(11) 99999-5555",
    duration: "1h 15min",
    price: "R$ 90,00"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmado":
      return "bg-emerald-100 text-emerald-800";
    case "em-andamento":
      return "bg-blue-100 text-blue-800";
    case "pendente":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "confirmado":
      return "Confirmado";
    case "em-andamento":
      return "Em Andamento";
    case "pendente":
      return "Pendente";
    default:
      return status;
  }
};

export function BathSchedule() {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-primary" />
              Agenda de Banhos - Hoje
            </CardTitle>
            <CardDescription>
              {appointments.length} agendamentos • Receita estimada: R$ 410,00
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            Ver Agenda Completa
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-4">
                  <div className="text-center min-w-[60px]">
                    <div className="text-sm font-medium">{appointment.time}</div>
                    <div className="text-xs text-muted-foreground">{appointment.duration}</div>
                  </div>
                
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {appointment.client.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="font-medium">{appointment.client}</div>
                    <Badge variant="outline" className="text-xs">
                      {appointment.pet}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{appointment.service}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="font-medium text-sm">{appointment.price}</div>
                  <Badge 
                    variant="secondary"
                    className={`text-xs ${getStatusColor(appointment.status)}`}
                  >
                    {getStatusText(appointment.status)}
                  </Badge>
                </div>

                <div className="flex items-center gap-1">
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
                      <DropdownMenuItem>Editar agendamento</DropdownMenuItem>
                      <DropdownMenuItem>Marcar como concluído</DropdownMenuItem>
                      <DropdownMenuItem>Remarcar</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        Cancelar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-secondary/20 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-emerald-600">3</div>
              <div className="text-xs text-muted-foreground">Confirmados</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-blue-600">1</div>
              <div className="text-xs text-muted-foreground">Em Andamento</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">1</div>
              <div className="text-xs text-muted-foreground">Pendentes</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}