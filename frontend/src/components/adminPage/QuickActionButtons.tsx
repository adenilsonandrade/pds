import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, UserPlus, Calendar, DollarSign } from "lucide-react";

const quickActions = [
  {
    title: "Novo Agendamento",
    description: "Agendar banho ou tosa",
    icon: Plus,
    color: "bg-primary hover:bg-primary/90 text-white",
  },
  {
    title: "Cadastrar Cliente",
    description: "Adicionar novo cliente",
    icon: UserPlus,
    color: "bg-accent hover:bg-accent/90 text-white",
  },
  {
    title: "Ver Agenda",
    description: "Visualizar calendário",
    icon: Calendar,
    color: "bg-emerald-500 hover:bg-emerald-600 text-white",
  },
  {
    title: "Lançar Receita",
    description: "Registrar pagamento",
    icon: DollarSign,
    color: "bg-blue-500 hover:bg-blue-600 text-white",
  }
];

export function QuickActionButtons() {
  return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className={`h-20 flex-col gap-2 ${action.color} border-0`}
              >
                <action.icon className="h-5 w-5" />
                <div className="text-center">
                  <div className="text-sm font-medium">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
  );
}
