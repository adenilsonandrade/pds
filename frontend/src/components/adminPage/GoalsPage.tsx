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
  const [formValues, setFormValues] = useState<Record<number, number | undefined>>({});

  const { selectedBusinessId } = useSelectedBusiness();

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
    const map: Record<number, number | undefined> = {};
    (goals || []).forEach((g: any) => {
      if (!g.period_start) return;
      const d = new Date(g.period_start);
      const y = d.getFullYear();
      const m = d.getMonth();
      if (y === year) map[m] = Number(g.amount || 0);
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
      </div>

      <div>
        {loading && <div>Carregando...</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Array.from({ length: 12 }).map((_, idx) => {
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            const existing = goals.find((g: any) => g.period_start && new Date(g.period_start).getFullYear() === year && new Date(g.period_start).getMonth() === idx);
            const val = formValues[idx] ?? (existing ? Number(existing.amount || 0) : undefined);
            return (
              <Card key={idx}>
                <CardHeader>
                  <CardTitle>{monthNames[idx]} {year}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Input type="number" step="0.01" value={val ?? ''} onChange={(e: any) => setFormValues({ ...formValues, [idx]: e.target.value === '' ? undefined : Number(e.target.value) })} className="w-48 no-spinner" />
                    <div className="flex gap-2 ml-auto">
                      <Button onClick={async () => {
                        try {
                          const amount = formValues[idx];
                          const start = `${year}-${String(idx + 1).padStart(2, '0')}-01`;
                          const lastDay = new Date(year, idx + 1, 0).getDate();
                          const end = `${year}-${String(idx + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
                          const business_id = selectedBusinessId ? Number(selectedBusinessId) : undefined;
                          if (existing) {
                            await updateGoal(existing.id, { business_id, amount: amount ?? 0, period_start: start, period_end: end, description: `Orçamento ${monthNames[idx]} ${year}` });
                          } else {
                            await createGoal({ business_id, amount: amount ?? 0, period_start: start, period_end: end, description: `Orçamento ${monthNames[idx]} ${year}` });
                          }
                          await load();
                        } catch (err) { console.error(err); }
                      }}>Salvar</Button>
                      {existing && (<Button variant="outline" onClick={async () => { try { await deleteGoal(existing.id); await load(); } catch (err) { console.error(err); } }}>Excluir</Button>)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
