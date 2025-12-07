import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar, DateRange } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { CalendarIcon, TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, AlertCircle, Search } from "lucide-react";
import { useEffect } from "react";
import { fetchFinancialOverview, createFinancial, updateFinancial } from "../../services/financial";
import { useSelectedBusiness } from '../../contexts/SelectedBusinessContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import FinancialForm from './FinancialForm';
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Edit } from "lucide-react";


interface FinancialEntry {
  id: string;
  date: string;
  description: string;
  service: string;
  client: string;
  pet: string;
  amount: number;
  status: "confirmed" | "pending" | "received" | "canceled" | "paid";
  type: "revenue" | "expense";
}

const mockEntries: FinancialEntry[] = [];

const initialChartData: Array<{ label: string; previsto: number; efetivado: number }> = [];

const defaultServiceColors = ["#2563eb", "#f97316", "#10b981", "#8b5cf6", "#e11d48", "#7c3aed"];

const statusColors = {
  confirmed: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  received: "bg-green-100 text-green-800",
  canceled: "bg-red-100 text-red-800"
  , paid: "bg-green-100 text-green-800"
};

const statusLabels = {
  confirmed: "Confirmado",
  pending: "Pendente",
  received: "Recebido",
  canceled: "Cancelado"
  , paid: "Pago"
};

export function FinancialPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [filterStatus, setFilterStatus] = useState("all");
  const [entries, setEntries] = useState<FinancialEntry[]>(mockEntries);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<'all' | 'revenue' | 'expense'>('all');
  const [serviceData, setServiceData] = useState<Array<{ name: string; value: number; color?: string }>>([]);
  const [chartDataState, setChartDataState] = useState<Array<{ label: string; previsto: number; efetivado: number }>>(initialChartData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [formValues, setFormValues] = useState<{ amount?: number; type?: string; date?: string; status?: string; description?: string; id?: any }>({});
  const [reloadKey, setReloadKey] = useState(0);

  const { selectedBusinessId } = useSelectedBusiness();

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const range = computeRangeFromPeriod(selectedPeriod, dateRange);
        const data = await fetchFinancialOverview({ start: range.start, end: range.end, business_id: selectedBusinessId || undefined });
        if (!mounted) return;
        const rec = (data.recentTransactions || []).map((t: any) => ({
          id: String(t.id || `${t.date}-${Math.random()}`),
          date: t.date,
          description: t.description || (t.service ? `${t.service} - ${t.pet || '-'} ` : '-'),
          service: t.service || '-',
          client: t.client || '-',
          pet: t.pet || '-',
          amount: Number(t.amount || 0),
          status: (t.status || 'pending'),
          type: (t.type || 'revenue')
        } as FinancialEntry));
        setEntries(rec);
        const nonCanceledRevenue = (rec || []).filter((r: any) => r.type === 'revenue' && r.status !== 'canceled');
        const svcMap: Record<string, number> = {};
        nonCanceledRevenue.forEach((r: any) => {
          const name = r.service || 'Serviço';
          svcMap[name] = (svcMap[name] || 0) + Number(r.amount || 0);
        });
        const svc = Object.keys(svcMap).map((name, idx) => ({ name, value: Number(svcMap[name] || 0), color: defaultServiceColors[idx % defaultServiceColors.length] }));
        setServiceData(svc);
        const buckets: Record<string, { date: Date; previsto: number; efetivado: number }> = {};
        (rec || []).forEach((r: any) => {
          const d = new Date(r.date);
          let key = '';
          let label = '';
          if (selectedPeriod === 'year') {
            key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            label = `${String(d.getMonth() + 1).padStart(2, '0')}`;
          } else {
            key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
          }
          if (!buckets[key]) buckets[key] = { date: d, previsto: 0, efetivado: 0 };

          const amt = Number(r.amount || 0) * (r.type === 'expense' ? -1 : 1);

          if (r.status !== 'canceled') {
            buckets[key]!.previsto = (buckets[key]!.previsto || 0) + amt;
          }

          const isRealized = (r.type === 'revenue' && r.status === 'received') || (r.type === 'expense' && r.status === 'paid');
          if (isRealized) {
            buckets[key]!.efetivado = (buckets[key]!.efetivado || 0) + amt;
          }
        });

        const sorted = Object.keys(buckets).map(k => ({ key: k, date: buckets[k]!.date, previsto: buckets[k]!.previsto, efetivado: buckets[k]!.efetivado })).sort((a, b) => a.date.getTime() - b.date.getTime());
        const chartArr = sorted.map(s => ({ label: selectedPeriod === 'year' ? `${String(s.date.getMonth() + 1).padStart(2, '0')}` : `${String(s.date.getDate()).padStart(2, '0')}/${String(s.date.getMonth() + 1).padStart(2, '0')}`, previsto: Number(s.previsto || 0), efetivado: Number(s.efetivado || 0) }));
        setChartDataState(chartArr);
      } catch (err: any) {
        console.error('Failed to load financial overview', err);
        setError(err.message || 'Erro ao carregar dados financeiros');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [selectedPeriod, dateRange, reloadKey, selectedBusinessId]);

  const filteredEntries = entries.filter(entry => {
    const matchesStatus = filterStatus === "all" || entry.status === filterStatus;
    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    const term = (searchTerm || '').trim().toLowerCase();
    const matchesSearch = !term || (
      (entry.description || '').toLowerCase().includes(term) ||
      (entry.client || '').toLowerCase().includes(term) ||
      (entry.pet || '').toLowerCase().includes(term) ||
      (entry.service || '').toLowerCase().includes(term)
    );
    return matchesStatus && matchesSearch && matchesType;
  });

  const nonCanceled = filteredEntries.filter(e => e.status !== 'canceled');

  const revenue = nonCanceled.filter(e => e.type === "revenue");
  const expenses = nonCanceled.filter(e => e.type === "expense");

  const totalrevenue = revenue.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = expenses.reduce((sum, entry) => sum + entry.amount, 0);
  const netRevenue = totalrevenue - totalExpenses;

  const confirmedRevenue = revenue.filter(e => e.status === "confirmed").reduce((sum, e) => sum + e.amount, 0);
  const receivedRevenue = revenue.filter(e => e.status === "received").reduce((sum, e) => sum + e.amount, 0);
  const pendingRevenue = revenue.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0);

  return (
    <main className="flex-1 space-y-6 p-3">
      <div>
        <h1 className="text-2xl font-semibold">Financeiro</h1>
        <p className="text-muted-foreground">
          Acompanhe receitas, despesas e projeções do seu petshop
        </p>
      </div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 w-full">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 w-full">
          <div className="w-auto sm:w-auto flex-shrink-0">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full sm:w-40">
                <CalendarIcon className="mr-2 h-4 w-4" />
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
          </div>

          {selectedPeriod === "custom" && (
            <div className="w-auto sm:w-auto flex-shrink-0">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-60">
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
            </div>
          )}

          <div className="relative flex-1 min-w-0 w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição, cliente, pet ou serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9"
            />
          </div>
        </div>
      </div>




      <div className="flex flex-col sm:flex-row gap-2 w-full">

        <div className="w-full sm:flex-1">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as 'all' | 'revenue' | 'expense')}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="revenue">Receita</SelectItem>
              <SelectItem value="expense">Despesa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:flex-1">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="received">Recebido</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="canceled">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:flex-1 flex sm:justify-end">
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">Cadastrar</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-auto w-full">
              <DialogHeader>
                <DialogTitle>Cadastrar Movimento</DialogTitle>
              </DialogHeader>
                  <FinancialForm
                    formValues={formValues}
                    setFormValues={setFormValues}
                    onCancel={() => { setCreateOpen(false); setFormValues({}); }}
                    onSave={async () => {
                      setLoading(true); setError(null);
                      try {
                        await createFinancial({ amount: Number(formValues.amount || 0), type: (formValues.type as any) || 'revenue', date: formValues.date, status: formValues.status, description: formValues.description, business_id: selectedBusinessId || undefined });
                        setCreateOpen(false);
                        setFormValues({});
                        setReloadKey(k => k + 1);
                      } catch (err: any) {
                        setError(err.message || 'Erro ao criar movimento');
                      } finally { setLoading(false); }
                    }}
                    loading={loading}
                    error={error}
                  />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <h3 className="text-2xl font-bold text-green-600">
                  R$ {totalrevenue.toFixed(2)}
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
                  R$ {revenue.length > 0 ? (totalrevenue / revenue.length).toFixed(2) : "0,00"}
                </h3>
              </div>
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Receita</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                efetivado: {
                  label: "Efetivado",
                  color: "hsl(var(--primary))",
                },
                previsto: {
                  label: "Previsto",
                  color: "hsl(var(--accent))",
                },
              }}
              className="h-60"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartDataState}>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="efetivado"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-primary)", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="previsto"
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
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {serviceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || defaultServiceColors[index % defaultServiceColors.length]} />
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
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading && (
              <div className="p-4 text-sm text-muted-foreground">Carregando...</div>
            )}
            {error && (
              <div className="p-4 text-sm text-red-600">{error}</div>
            )}
            {filteredEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-12 rounded-full ${entry.type === "revenue" ? "bg-green-500" : "bg-red-500"
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

                  <div className={`text-right font-semibold ${entry.type === "revenue" ? "text-green-600" : "text-red-600"
                    }`}>
                    {entry.type === "revenue" ? "+" : "-"}R$ {entry.amount.toFixed(2)}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setFormValues({ id: entry.id, amount: entry.amount, type: entry.type, date: entry.date?.substring(0, 10), status: entry.status, description: entry.description });
                    setEditOpen(true);
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setFormValues({}); }}>
        <DialogContent className="max-h-[90vh] overflow-auto w-full">
          <DialogHeader>
            <DialogTitle>Editar Movimentação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select value={formValues.type || 'revenue'} onValueChange={(v) => setFormValues({ ...formValues, type: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Receita</SelectItem>
                    <SelectItem value="expense">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" value={formValues.amount ?? ''} onChange={(e) => setFormValues({ ...formValues, amount: e.target.value === '' ? undefined : Number(e.target.value) })} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" value={formValues.date || ''} onChange={(e) => setFormValues({ ...formValues, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formValues.status || 'pending'} onValueChange={(v) => setFormValues({ ...formValues, status: v })}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="received">Recebido</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="canceled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={formValues.description || ''} onChange={(e) => setFormValues({ ...formValues, description: e.target.value })} rows={3} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setEditOpen(false); setFormValues({}); }}>Cancelar</Button>
              <Button onClick={async () => {
                setLoading(true); setError(null);
                try {
                  if (!formValues.id) throw new Error('ID ausente');
                  await updateFinancial(formValues.id, { amount: formValues.amount, type: formValues.type, date: formValues.date, status: formValues.status, description: formValues.description });
                  setEditOpen(false);
                  setFormValues({});
                  setReloadKey(k => k + 1);
                } catch (err: any) {
                  setError(err.message || 'Erro ao atualizar movimento');
                } finally { setLoading(false); }
              }}>{loading ? 'Salvando...' : 'Salvar'}</Button>
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}

function formatISODate(d: Date) {
  return d.toISOString().substring(0, 10);
}

function computeRangeFromPeriod(period: string, customRange?: DateRange | undefined) {
  const now = new Date();
  if (period === 'day') {
    return { start: formatISODate(now), end: formatISODate(now) };
  }
  if (period === 'week') {
    const day = now.getDay();
    const diffToMonday = (day + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { start: formatISODate(monday), end: formatISODate(sunday) };
  }
  if (period === 'month') {
    const y = now.getFullYear();
    const m = now.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    return { start: formatISODate(first), end: formatISODate(last) };
  }
  if (period === 'year') {
    const y = now.getFullYear();
    const first = new Date(y, 0, 1);
    const last = new Date(y, 11, 31);
    return { start: formatISODate(first), end: formatISODate(last) };
  }
  if (period === 'custom' && customRange && customRange.from) {
    const start = formatISODate(customRange.from);
    const end = customRange.to ? formatISODate(customRange.to) : start;
    return { start, end };
  }
  return computeRangeFromPeriod('month');
}
