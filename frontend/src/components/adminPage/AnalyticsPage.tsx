import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  PawPrint, 
  DollarSign, 
  Calendar,
  Award,
  Target,
  Activity,
  Zap
} from "lucide-react";

// Mock data for analytics
const monthlyGrowth = [
  { month: "Jan", receita: 3200, clientes: 45, agendamentos: 78 },
  { month: "Fev", receita: 3800, clientes: 52, agendamentos: 89 },
  { month: "Mar", receita: 4200, clientes: 61, agendamentos: 95 },
  { month: "Abr", receita: 3900, clientes: 58, agendamentos: 87 },
  { month: "Mai", receita: 4600, clientes: 68, agendamentos: 102 },
  { month: "Jun", receita: 5200, clientes: 74, agendamentos: 118 },
  { month: "Jul", receita: 4800, clientes: 71, agendamentos: 108 },
  { month: "Ago", receita: 5800, clientes: 82, agendamentos: 132 },
  { month: "Set", receita: 6200, clientes: 89, agendamentos: 145 },
  { month: "Out", receita: 6800, clientes: 96, agendamentos: 158 },
  { month: "Nov", receita: 7200, clientes: 103, agendamentos: 167 },
  { month: "Dez", receita: 7800, clientes: 110, agendamentos: 182 }
];

const servicePopularity = [
  { name: "Banho e Tosa", vendas: 145, receita: 9425, color: "#2563eb" },
  { name: "Apenas Banho", vendas: 89, receita: 3115, color: "#f97316" },
  { name: "Tosa Higiênica", vendas: 67, receita: 3015, color: "#10b981" },
  { name: "Tosa Completa", vendas: 45, receita: 3825, color: "#8b5cf6" },
  { name: "Banho Medicinal", vendas: 23, receita: 1380, color: "#ef4444" }
];

const petsBySpecies = [
  { name: "Cães", value: 68, color: "#2563eb" },
  { name: "Gatos", value: 32, color: "#f97316" }
];

const topClients = [
  { name: "Maria Santos", pets: 3, totalGasto: 1250.00, visitas: 18 },
  { name: "João Silva", pets: 2, totalGasto: 890.00, visitas: 12 },
  { name: "Ana Costa", pets: 2, totalGasto: 760.00, visitas: 14 },
  { name: "Pedro Lima", pets: 1, totalGasto: 680.00, visitas: 9 },
  { name: "Carla Oliveira", pets: 4, totalGasto: 1420.00, visitas: 22 }
];

const weeklyPerformance = [
  { day: "Seg", agendamentos: 12, receita: 780 },
  { day: "Ter", agendamentos: 15, receita: 975 },
  { day: "Qua", agendamentos: 18, receita: 1170 },
  { day: "Qui", agendamentos: 22, receita: 1430 },
  { day: "Sex", agendamentos: 25, receita: 1625 },
  { day: "Sáb", agendamentos: 32, receita: 2080 },
  { day: "Dom", agendamentos: 8, receita: 520 }
];

export function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("12months");
  const [selectedMetric, setSelectedMetric] = useState("receita");

  // Calculate metrics
  const currentMonth = monthlyGrowth[monthlyGrowth.length - 1];
  const previousMonth = monthlyGrowth[monthlyGrowth.length - 2];

  // Guard against undefined (in case the array has fewer than 2 items)
  const safeCurrent = currentMonth ?? { receita: 0, clientes: 0, agendamentos: 1 };
  const safePrevious = previousMonth ?? { receita: 0, clientes: 0, agendamentos: 1 };

  const revenueGrowth = safePrevious.receita !== 0 ? ((safeCurrent.receita - safePrevious.receita) / safePrevious.receita * 100) : 0;
  const clientGrowth = safePrevious.clientes !== 0 ? ((safeCurrent.clientes - safePrevious.clientes) / safePrevious.clientes * 100) : 0;
  const appointmentGrowth = safePrevious.agendamentos !== 0 ? ((safeCurrent.agendamentos - safePrevious.agendamentos) / safePrevious.agendamentos * 100) : 0;

  const averageTicket = safeCurrent.agendamentos !== 0 ? safeCurrent.receita / safeCurrent.agendamentos : 0;
  const totalClients = safeCurrent.clientes;
  const monthlyRecurring = Math.round(totalClients * 0.75); // 75% clientes recorrentes

  const getMetricColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <main className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Análises</h1>
          <p className="text-muted-foreground">
            Insights e métricas de desempenho do seu petshop
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="12months">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Crescimento Receita</p>
                <h3 className={`text-2xl font-bold ${getMetricColor(revenueGrowth)}`}>
                  {revenueGrowth > 0 ? "+" : ""}{revenueGrowth.toFixed(1)}%
                </h3>
                <p className="text-xs text-muted-foreground">vs mês anterior</p>
              </div>
              <div className={`p-2 rounded-lg ${revenueGrowth >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {revenueGrowth >= 0 ? (
                  <TrendingUp className="h-6 w-6 text-green-600" />
                ) : (
                  <TrendingDown className="h-6 w-6 text-red-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <h3 className="text-2xl font-bold text-primary">
                  {formatCurrency(averageTicket)}
                </h3>
                <p className="text-xs text-muted-foreground">por atendimento</p>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                <h3 className="text-2xl font-bold text-accent">
                  {totalClients}
                </h3>
                <p className={`text-xs ${getMetricColor(clientGrowth)}`}>
                  {clientGrowth > 0 ? "+" : ""}{clientGrowth.toFixed(1)}% este mês
                </p>
              </div>
              <Users className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa Recorrência</p>
                <h3 className="text-2xl font-bold text-green-600">
                  75%
                </h3>
                <p className="text-xs text-muted-foreground">{monthlyRecurring} clientes/mês</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Evolução Anual</CardTitle>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="clientes">Clientes</SelectItem>
                <SelectItem value="agendamentos">Agendamentos</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                [selectedMetric]: {
                  label: selectedMetric === "receita" ? "Receita (R$)" : 
                         selectedMetric === "clientes" ? "Clientes" : "Agendamentos",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyGrowth}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area 
                    type="monotone" 
                    dataKey={selectedMetric}
                    stroke="var(--color-primary)" 
                    fill="var(--color-primary)"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Weekly Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Semanal</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                agendamentos: {
                  label: "Agendamentos",
                  color: "hsl(var(--primary))",
                },
                receita: {
                  label: "Receita (R$)",
                  color: "hsl(var(--accent))",
                },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyPerformance}>
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar yAxisId="left" dataKey="agendamentos" fill="var(--color-primary)" />
                  <Bar yAxisId="right" dataKey="receita" fill="var(--color-accent)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Service Analysis & Pet Distribution */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Serviços Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {servicePopularity.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-muted-foreground">{service.vendas} vendas</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(service.receita)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(service.receita / service.vendas)} avg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pets por Espécie</CardTitle>
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
                    data={petsBySpecies}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {petsBySpecies.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            
            <div className="space-y-2 mt-4">
              {petsBySpecies.map((species) => (
                <div key={species.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: species.color }}
                    />
                    <span className="text-sm">{species.name}</span>
                  </div>
                  <span className="text-sm font-medium">{species.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top 5 Clientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topClients.map((client, index) => (
              <div key={client.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    <span className="font-semibold">#{index + 1}</span>
                  </div>
                  
                  <div>
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {client.pets} pets • {client.visitas} visitas
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-semibold text-primary">
                    {formatCurrency(client.totalGasto)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(client.totalGasto / client.visitas)} média
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