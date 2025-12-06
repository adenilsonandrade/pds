import React, { useEffect } from 'react';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface Props {
  formValues: any;
  setFormValues: (v: any) => void;
  onCancel: () => void;
  onSave: () => void | Promise<void>;
  loading: boolean;
  error?: string | null;
}

const FinancialForm: React.FC<Props> = ({ formValues, setFormValues, onCancel, onSave, loading, error }) => {
  useEffect(() => {
    const type = formValues.type || 'revenue';
    const allowed = type === 'expense' ? ['pending', 'paid'] : ['pending', 'received'];
    if (formValues.status && !allowed.includes(formValues.status)) {
      setFormValues({ ...formValues, status: 'pending' });
    }
  }, [formValues.type]);
  return (
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
              {formValues.type === 'expense' ? (
                <SelectItem value="paid">Pago</SelectItem>
              ) : (
                <SelectItem value="received">Recebido</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea value={formValues.description || ''} onChange={(e) => setFormValues({ ...formValues, description: e.target.value })} rows={3} />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSave}>{loading ? 'Salvando...' : 'Cadastrar'}</Button>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
};

export default FinancialForm;
