import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { fetchGoals, createGoal, updateGoal, deleteGoal } from '../../services/goals';
import { useSelectedBusiness } from '../../contexts/SelectedBusinessContext';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [formValues, setFormValues] = useState<Record<number, string | undefined>>({});

  const { selectedBusinessId } = useSelectedBusiness();

  function parseYMD(dateValue: any) {
    if (!dateValue) return null;
    if (dateValue instanceof Date) {
      return { year: dateValue.getUTCFullYear(), month: dateValue.getUTCMonth(), day: dateValue.getUTCDate() };
    }
    if (typeof dateValue === 'string') {
      const m = dateValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) return { year: Number(m[1]), month: Number(m[2]) - 1, day: Number(m[3]) };
      const parsed = new Date(dateValue);
      if (!isNaN(parsed.getTime())) return { year: parsed.getUTCFullYear(), month: parsed.getUTCMonth(), day: parsed.getUTCDate() };
      return null;
    }
    return null;
  }

  async function load() {
    setLoading(true);
    try {
      const data = await fetchGoals({ business_id: selectedBusinessId || undefined });
      setGoals(data.goals || []);
    } catch (err: any) {
      console.error('failed load goals', err);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, [selectedBusinessId]);
  useEffect(() => {
    const map: Record<number, string | undefined> = {};
    (goals || []).forEach((g: any) => {
      const p = parseYMD(g.period_start);
      if (!p) return;
      const { year: y, month: m } = p;
      if (y === year) map[m] = g.amount !== undefined && g.amount !== null ? String(g.amount) : undefined;
    });
    setFormValues(map);
  }, [goals, year]);

  return (
    <main className="flex-1 p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold">Metas / Orçamentos</h1>
        <p className="text-muted-foreground">Cadastre metas financeiras por período</p>
      </div>

      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setYear((y) => y - 1)} aria-label="Ano anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" className="px-4" disabled>
              {year}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setYear((y) => y + 1)} aria-label="Próximo ano">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={async () => {
            setLoading(true);
            try {
              const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
              for (let idx = 0; idx < 12; idx++) {
                const hasOverride = Object.prototype.hasOwnProperty.call(formValues, idx);
                if (!hasOverride) continue;
                const raw = formValues[idx];
                const start = `${year}-${String(idx+1).padStart(2,'0')}-01`;
                const lastDay = new Date(year, idx+1, 0).getDate();
                const end = `${year}-${String(idx+1).padStart(2,'0')}-${String(lastDay).padStart(2,'0')}`;
                const existing = goals.find((g: any) => {
                  const p = parseYMD(g.period_start);
                  return p ? (p.year === year && p.month === idx) : false;
                });
                const business_id = selectedBusinessId || undefined;

                if (raw === '' || raw === null) {
                  if (existing) {
                    try {
                      await deleteGoal(existing.id);
                    } catch (err) {
                      console.warn('Failed deleting goal for month', idx, err);
                    }
                  }
                } else {
                  const normalized = typeof raw === 'string' ? raw.replace(',', '.') : String(raw);
                  const parsed = Number(normalized);
                  if (Number.isNaN(parsed)) {
                    console.warn('Invalid goal value for month', idx, raw);
                    continue;
                  }
                  if (existing) {
                    await updateGoal(existing.id, { business_id: business_id as any, amount: parsed, period_start: start, period_end: end, description: `Orçamento ${monthNames[idx]} ${year}` });
                  } else {
                    await createGoal({ business_id: business_id as any, amount: parsed, period_start: start, period_end: end, description: `Orçamento ${monthNames[idx]} ${year}` });
                  }
                }
              }
              await load();
            } catch (err) {
              console.error('Failed saving goals', err);
            } finally { setLoading(false); }
          }} disabled={loading}>{loading ? 'Salvando...' : 'Salvar alterações'}</Button>
        </div>
      </div>

      <div>
        {loading && <div>Carregando...</div>}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Metas por Mês — {year}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Array.from({ length: 12 }).map((_, idx) => {
                  const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
                  const existing = goals.find((g: any) => {
                    const p = parseYMD(g.period_start);
                    return p ? (p.year === year && p.month === idx) : false;
                  });
                  const hasOverride = Object.prototype.hasOwnProperty.call(formValues, idx);
                  const display = hasOverride ? (formValues[idx] ?? '') : (existing ? String(existing.amount ?? '') : '');
                  return (
                    <div key={idx} className="flex items-center gap-4 border-b pb-2">
                      <div className="w-40 text-sm">{monthNames[idx]}</div>
                      <Input type="text" inputMode="decimal" step="0.01" value={display} onChange={(e: any) => setFormValues({ ...formValues, [idx]: e.target.value })} className="w-48" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
