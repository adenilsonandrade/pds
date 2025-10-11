import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Banknote, Target } from "lucide-react";

const financialData = [
  {
    title: "Receita Hoje",
    value: "R$ 2.480,00",
    change: "+12%",
    trend: "up",
    icon: DollarSign,
    description: "Comparado a ontem"
  },
  {
    title: "Receita Mensal",
    value: "R$ 42.350,00",
    change: "+18%",
    trend: "up", 
    icon: CreditCard,
    description: "Comparado ao mês anterior"
  },
  {
    title: "Despesas Mensais",
    value: "R$ 12.890,00",
    change: "-5%",
    trend: "down",
    icon: Banknote,
    description: "Redução este mês"
  },
  {
    title: "Meta Mensal",
    value: "85%",
    change: "R$ 7.650 restante",
    trend: "up",
    icon: Target,
    description: "Meta: R$ 50.000"
  }
];

export function FinancialCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {financialData.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className={`flex items-center ${item.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {item.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                <span>{item.change}</span>
              </div>
              <span>•</span>
              <span>{item.description}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}