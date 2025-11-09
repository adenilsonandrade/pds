import React, { useState, useEffect } from 'react';
import { DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export interface LocalService {
  id: string | number;
  name: string;
  active: boolean;
  value?: number | null;
  description?: string | null;
}

interface ServiceFormProps {
  service?: LocalService | null;
  mode: 'create' | 'edit';
  onClose: () => void;
  onSaved: (s: LocalService) => void;
}

export default function ServiceForm({ service, mode, onClose, onSaved }: ServiceFormProps) {
  const [name, setName] = useState('');
  const [active, setActive] = useState<'active' | 'inactive'>('active');
  const [value, setValue] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (service) {
      setName(String(service.name || ''));
      setActive(service.active ? 'active' : 'inactive');
  setValue(service.value !== undefined && service.value !== null ? String(service.value) : '');
  setDescription(service.description !== undefined && service.description !== null ? String(service.description) : '');
    } else {
      setName('');
      setActive('active');
      setValue('');
    }
  }, [service]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const payload: LocalService = {
      id: service?.id ?? `new-${Date.now()}`,
      name: name.trim() || 'Sem nome',
      active: active === 'active',
      value: value === '' ? null : Number(String(value).replace(',', '.')),
      description: description.trim() || null,
    };
    onSaved(payload);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="text-sm">Nome do serviço</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Banho e Tosa" />
      </div>

      <div>
        <label className="text-sm">Valor (R$)</label>
        <Input type="number" step="0.01" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0.00" />
      </div>

      <div>
        <label className="text-sm">Descrição</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descrição do serviço (opcional)" />
      </div>

      <div>
        <label className="text-sm">Status</label>
        <Select value={active} onValueChange={(v: any) => setActive(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="inactive">Inativo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button variant="ghost" type="button" onClick={onClose}>Cancelar</Button>
        <Button type="submit">{mode === 'create' ? 'Cadastrar' : 'Salvar'}</Button>
      </DialogFooter>
    </form>
  );
}
