import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Banknote, Target } from "lucide-react";
import { fetchFinancialOverview } from '../../services/financial';
import { fetchGoals } from '../../services/goals';
import { useSelectedBusiness } from '../../contexts/SelectedBusinessContext';

function fmtCurrency(v: number | null | undefined) {
  if (v == null || Number.isNaN(Number(v))) return '—';
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function FinancialCards() {
  const { selectedBusinessId } = useSelectedBusiness();
  const [todayRevenue, setTodayRevenue] = useState<number | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number | null>(null);
  const [monthlyExpenses, setMonthlyExpenses] = useState<number | null>(null);
  const [monthlyGoal, setMonthlyGoal] = useState<number | null>(null);
  const [yesterdayRevenue, setYesterdayRevenue] = useState<number | null>(null);
  const [monthlyRevenuePrev, setMonthlyRevenuePrev] = useState<number | null>(null);
  const [monthlyExpensesPrev, setMonthlyExpensesPrev] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const dayY = now.getFullYear();
        const dayM = String(now.getMonth() + 1).padStart(2, '0');
        const today = `${dayY}-${dayM}-${String(now.getDate()).padStart(2, '0')}`;
        const yDate = new Date(now);
        yDate.setDate(now.getDate() - 1);
        const yY = yDate.getFullYear();
        const yM = String(yDate.getMonth() + 1).padStart(2, '0');
        const yD = String(yDate.getDate()).padStart(2, '0');
        const yesterday = `${yY}-${yM}-${yD}`;

        const monthStart = `${y}-${m}-01`;
        const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
        const monthEnd = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;

        const dayRes = await fetchFinancialOverview({ start: today, end: today, business_id: selectedBusinessId || undefined });
        const dayResPrev = await fetchFinancialOverview({ start: yesterday, end: yesterday, business_id: selectedBusinessId || undefined });

        const monthRes = await fetchFinancialOverview({ start: monthStart, end: monthEnd, business_id: selectedBusinessId || undefined });
        const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const py = prevMonth.getFullYear();
        const pm = String(prevMonth.getMonth() + 1).padStart(2, '0');
        const prevMonthStart = `${py}-${pm}-01`;
        const prevLastDay = new Date(py, prevMonth.getMonth() + 1, 0).getDate();
        const prevMonthEnd = `${py}-${pm}-${String(prevLastDay).padStart(2, '0')}`;
        const monthResPrev = await fetchFinancialOverview({ start: prevMonthStart, end: prevMonthEnd, business_id: selectedBusinessId || undefined });

        const dayRevenue = Number(dayRes.totalrevenue ?? dayRes.totalIncome ?? dayRes.totalRevenue ?? 0) || 0;
        const dayRevenuePrev = Number(dayResPrev.totalrevenue ?? dayResPrev.totalIncome ?? dayResPrev.totalRevenue ?? 0) || 0;
        const mRevenue = Number(monthRes.totalrevenue ?? monthRes.totalIncome ?? monthRes.totalRevenue ?? 0) || 0;
        const mRevenuePrev = Number(monthResPrev.totalrevenue ?? monthResPrev.totalIncome ?? monthResPrev.totalRevenue ?? 0) || 0;
        const mExpenses = Number(monthRes.totalExpenses ?? monthRes.total_expenses ?? monthRes.totalexpenses ?? 0) || 0;
        const mExpensesPrev = Number(monthResPrev.totalExpenses ?? monthResPrev.total_expenses ?? monthResPrev.totalexpenses ?? 0) || 0;

        if (!mounted) return;
        setTodayRevenue(dayRevenue);
        setYesterdayRevenue(dayRevenuePrev);
        setMonthlyRevenue(mRevenue);
        setMonthlyRevenuePrev(mRevenuePrev);
        setMonthlyExpenses(mExpenses);
        setMonthlyExpensesPrev(mExpensesPrev);

        const goalsRes = await fetchGoals({ business_id: selectedBusinessId || undefined });
        const goals = goalsRes.goals || [];
        const currentGoal = goals.find((g: any) => {
          if (!g.period_start) return false;
          const d = new Date(g.period_start);
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        });
        const goalAmount = currentGoal ? Number(currentGoal.amount || 0) : 0;
        setMonthlyGoal(goalAmount || null);

      } catch (err) {
        console.error('Failed to load financial cards', err);
        if (!mounted) return;
        setTodayRevenue(null);
        setMonthlyRevenue(null);
        setMonthlyExpenses(null);
        setMonthlyGoal(null);
      }
    }
    load();
    return () => { mounted = false; };
  }, [selectedBusinessId]);

  const goalPercent = (monthlyGoal && monthlyGoal > 0 && monthlyRevenue != null) ? Math.round((monthlyRevenue / monthlyGoal) * 100) : null;
  const goalRemaining = (monthlyGoal != null && monthlyRevenue != null) ? (monthlyGoal - (monthlyRevenue || 0)) : null;

  function computeChange(current: number | null, previous: number | null) {
    const cur = Number(current || 0);
    const prev = Number(previous || 0);
    if (prev === 0) {
      if (cur === 0) return { change: '0%', trend: 'up' };
      return { change: '—', trend: 'up' };
    }
    const pct = Math.round(((cur - prev) / prev) * 100);
    return { change: (pct >= 0 ? '+' : '') + String(pct) + '%', trend: pct >= 0 ? 'up' : 'down' };
  }

  function comparePhrase(current: number | null, previous: number | null, previousLabel: string) {
    if (current == null || previous == null) return '';
    const diff = Number(current) - Number(previous);
    if (diff === 0) return `igual a ${previousLabel}`;
    if (diff > 0) return `${fmtCurrency(diff)} a mais que ${previousLabel}`;
    return `${fmtCurrency(Math.abs(diff))} a menos que ${previousLabel}`;
  }

  const todayChangeObj = computeChange(todayRevenue, yesterdayRevenue);
  const monthRevenueChangeObj = computeChange(monthlyRevenue, monthlyRevenuePrev);
  const monthExpensesChangeObj = computeChange(monthlyExpenses, monthlyExpensesPrev);
  const todayPhrase = comparePhrase(todayRevenue, yesterdayRevenue, 'ontem');
  const monthPhrase = comparePhrase(monthlyRevenue, monthlyRevenuePrev, 'o mês anterior');
  const monthExpensesPhrase = comparePhrase(monthlyExpenses, monthlyExpensesPrev, 'o mês anterior');

  const cards = [
    {
      title: 'Receita Hoje',
      value: fmtCurrency(todayRevenue),
      change: todayPhrase || todayChangeObj.change,
      trend: todayChangeObj.trend,
      icon: DollarSign,
      description: ''
    },
    {
      title: 'Receita Mensal',
      value: fmtCurrency(monthlyRevenue),
      change: monthPhrase || monthRevenueChangeObj.change,
      trend: monthRevenueChangeObj.trend,
      icon: CreditCard,
      description: ''
    },
    {
      title: 'Despesa Mensal',
      value: fmtCurrency(monthlyExpenses),
      change: monthExpensesPhrase || monthExpensesChangeObj.change,
      trend: monthExpensesChangeObj.trend,
      invertColor: true,
      icon: Banknote,
      description: ''
    },
    {
      title: 'Meta Mensal',
      value: monthlyGoal != null ? (monthlyGoal > 0 ? `${goalPercent ?? 0}%` : fmtCurrency(monthlyGoal)) : '—',
      change: (() => {
        if (monthlyGoal != null && monthlyGoal > 0 && goalRemaining != null) {
          if (goalRemaining > 0) return `${fmtCurrency(goalRemaining)} para atingir a meta`;
          if (goalRemaining === 0) return `atingiu a meta`;
          return `${fmtCurrency(Math.abs(goalRemaining))} a mais que a meta`;
        }
        return monthlyGoal != null ? `Meta: ${fmtCurrency(monthlyGoal)}` : '';
      })(),
      trend: (() => {
        if (monthlyGoal != null && monthlyGoal > 0 && goalRemaining != null) {
          return goalRemaining > 0 ? 'down' : 'up';
        }
        return 'up';
      })(),
      icon: Target,
      description: monthlyGoal != null && monthlyGoal > 0 ? '' : 'Nenhuma meta definida'
    }
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <div className={`flex items-center ${item.invertColor ? (item.trend === 'up' ? 'text-red-600' : 'text-emerald-600') : (item.trend === 'up' ? 'text-emerald-600' : 'text-red-600')}`}>
                {item.trend === 'up' ? (
                  <TrendingUp className="h-4 w-4 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 mr-1" />
                )}
                <span>{item.change}</span>
              </div>
              {item.description ? (
                <>
                  <span>•</span>
                  <span>{item.description}</span>
                </>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}