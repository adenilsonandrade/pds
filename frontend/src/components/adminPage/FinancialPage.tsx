import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar, DateRange } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CalendarIcon, TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";


interface FinancialEntry {
  id: string;
  date: string;
  description: string;
  service: string;
  client: string;
  pet: string;
  amount: number;
  status: "confirmed" | "pending" | "received" | "canceled";
  type: "income" | "expense";
}

const mockEntries: FinancialEntry[] = [
  {
    id: "1",
    date: "2024-12-20",
    description: "Banho e Tosa - Buddy",
    service: "Banho e Tosa",
    client: "João Silva",
    pet: "Buddy",
    amount: 65.00,
    status: "confirmed",
    type: "income"
  },
  {
    id: "2",
    date: "2024-12-19",
    description: "Apenas Banho - Luna",
    service: "Apenas Banho",
    client: "Maria Santos",
    pet: "Luna",
    amount: 35.00,
    status: "received",
    type: "income"
  },
  {
    id: "3",
    date: "2024-12-18",
    description: "Tosa Higiênica - Max",
    service: "Tosa Higiênica",
    client: "Pedro Costa",
    pet: "Max",
    amount: 45.00,
    status: "pending",
    type: "income"
  },
  {
    id: "4",
    date: "2024-12-17",
    description: "Banho e Tosa Completa - Bella",
    service: "Banho e Tosa Completa",
    client: "Ana Oliveira",
    pet: "Bella",
    amount: 85.00,
    status: "received",
    type: "income"
  },
  {
    id: "5",
    date: "2024-12-16",
    description: "Shampoo Premium",
    service: "Material",
    client: "-",
    pet: "-",
    amount: 45.00,
    status: "received",
    type: "expense"
  }
];

const chartData = [
  { month: "Jul", receita: 2400, projeção: 2600 },
  { month: "Ago", receita: 2800, projeção: 3200 },
  { month: "Set", receita: 3200, projeção: 3800 },
  { month: "Out", receita: 3600, projeção: 4200 },
  { month: "Nov", receita: 4100, projeção: 4800 },
  { month: "Dez", receita: 4500, projeção: 5200 }
];

const serviceData = [
  { name: "Banho e Tosa", value: 45, color: "#2563eb" },
  { name: "Apenas Banho", value: 30, color: "#f97316" },
  { name: "Tosa Higiênica", value: 20, color: "#10b981" },
  { name: "Outros", value: 5, color: "#8b5cf6" }
];

const statusColors = {
  confirmed: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  received: "bg-green-100 text-green-800",
  canceled: "bg-red-100 text-red-800"
};

const statusLabels = {
  confirmed: "Confirmado",
  pending: "Pendente",
  received: "Recebido",
  canceled: "Cancelado"
};

export function FinancialPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredEntries = mockEntries.filter(entry => {
    const matchesStatus = filterStatus === "all" || entry.status === filterStatus;
    return matchesStatus;
  });

  const income = filteredEntries.filter(e => e.type === "income");
  const expenses = filteredEntries.filter(e => e.type === "expense");

  const totalIncome = income.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = expenses.reduce((sum, entry) => sum + entry.amount, 0);
  const netRevenue = totalIncome - totalExpenses;

  const confirmedRevenue = income.filter(e => e.status === "confirmed").reduce((sum, e) => sum + e.amount, 0);
  const receivedRevenue = income.filter(e => e.status === "received").reduce((sum, e) => sum + e.amount, 0);
  const pendingRevenue = income.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0);

  return (
    <main className="flex-1 space-y-6 p-3">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Financeiro</h1>
          <p className="text-muted-foreground">
            Acompanhe receitas, despesas e projeções do seu petshop
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Hoje</SelectItem>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          {selectedPeriod === "custom" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-60">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {dateRange.from.toLocaleDateString('pt-BR')} -{" "}
                        {dateRange.to.toLocaleDateString('pt-BR')}
                      </>
                    ) : (
                      dateRange.from.toLocaleDateString('pt-BR')
                    )
                  ) : (
                    "Selecionar período"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <h3 className="text-2xl font-bold text-green-600">
                  R$ {totalIncome.toFixed(2)}
                </h3>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Despesas</p>
                <h3 className="text-2xl font-bold text-red-600">
                  R$ {totalExpenses.toFixed(2)}
                </h3>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Líquida</p>
                <h3 className={`text-2xl font-bold ${netRevenue >= 0 ? 'text-primary' : 'text-red-600'}`}>
                  R$ {netRevenue.toFixed(2)}
                </h3>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <h3 className="text-2xl font-bold text-accent">
                  R$ {income.length > 0 ? (totalIncome / income.length).toFixed(2) : "0,00"}
                </h3>
              </div>
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                receita: {
                  label: "Receita",
                  color: "hsl(var(--primary))",
                },
                projeção: {
                  label: "Projeção",
                  color: "hsl(var(--accent))",
                },
              }}
              className="h-60"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="receita" 
                    stroke="var(--color-primary)" 
                    strokeWidth={2}
                    dot={{ fill: "var(--color-primary)", strokeWidth: 2, r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="projeção" 
                    stroke="var(--color-accent)" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: "var(--color-accent)", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receita por Serviço</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                value: {
                  label: "Valor (%)",
                },
              }}
              className="h-60"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={"70%"}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recebido</p>
                <h3 className="text-xl font-bold text-green-600">
                  R$ {receivedRevenue.toFixed(2)}
                </h3>
              </div>
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Confirmado</p>
                <h3 className="text-xl font-bold text-blue-600">
                  R$ {confirmedRevenue.toFixed(2)}
                </h3>
              </div>
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendente</p>
                <h3 className="text-xl font-bold text-yellow-600">
                  R$ {pendingRevenue.toFixed(2)}
                </h3>
              </div>
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Movimentações Recentes</CardTitle>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
              <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="received">Recebido</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="canceled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-12 rounded-full ${
                    entry.type === "income" ? "bg-green-500" : "bg-red-500"
                  }`} />
                  
                  <div>
                    <div className="font-medium">{entry.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {entry.client !== "-" && (
                        <>
                          {entry.client} • {entry.pet} • 
                        </>
                      )}
                      {new Date(entry.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={statusColors[entry.status]}>
                    {statusLabels[entry.status]}
                  </Badge>
                  
                  <div className={`text-right font-semibold ${
                    entry.type === "income" ? "text-green-600" : "text-red-600"
                  }`}>
                    {entry.type === "income" ? "+" : "-"}R$ {entry.amount.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}