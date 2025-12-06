import { useEffect, useState } from 'react';
import { createAppointment } from '../../services/appointments';
import { getPets } from '../../services/pets';
import { getServices } from '../../services/services';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

interface Props {
  onClose: () => void;
  onCreated?: () => void;
  defaultDate?: string;
}

export default function NewAppointmentForm({ onClose, onCreated, defaultDate }: Props) {
  const [pets, setPets] = useState<Array<any>>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [petName, setPetName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState<string | null>('Banho e Tosa');
  const [services, setServices] = useState<Array<any>>([]);
  const [date, setDate] = useState(defaultDate || '');
  const [time, setTime] = useState('09:00');
  const [notes, setNotes] = useState('');
  const [priceOverride, setPriceOverride] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        species: null,
        date,
        time,
        notes
      };
      if (selectedPetId && selectedPetId !== 'new') {
        payload.petId = selectedPetId;
      } else {
        payload.petName = petName;
        payload.customerName = customerName;
        payload.phone = phone;
      }

      if (service) {
        const s = services.find((x:any) => String(x.id) === String(service) || x.name === service);
        if (s) payload.service = s.id;
        else payload.service = service;
      }
      if (priceOverride && priceOverride !== '') {
        const v = Number(priceOverride);
        if (!isNaN(v)) payload.price = v;
      }
      await createAppointment(payload);
      if (onCreated) onCreated();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao criar agendamento');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getPets();
        if (!mounted) return;
        setPets(data || []);
      } catch (e) {
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getServices(true).catch(() => []);
        if (!mounted) return;
        setServices(data || []);
        if (data && data.length > 0) {
          const match = data.find((s:any) => s.name === service);
          if (match) setService(String(match.id));
        }
      } catch (e) {
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-3 p-4 w-full md:w-96">
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div>
        <label className="text-sm">Pet cadastrado</label>
        <Select value={selectedPetId || 'new'} onValueChange={(v) => {
          setSelectedPetId(v === 'new' ? 'new' : v);
          if (v && v !== 'new') {
            const p = pets.find((x:any) => String(x.id) === String(v));
            if (p) {
              setPetName(p.name || '');
              setCustomerName(p.customer_name || '');
              setPhone(p.customer_phone || p.phone || '');
            }
          } else {
            setPetName('');
            setCustomerName('');
            setPhone('');
          }
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione ou novo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">+ Novo pet</SelectItem>
            {pets.map((p:any) => (
              <SelectItem key={p.id} value={String(p.id)}>{p.name} — {p.customer_name || ''}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {(!selectedPetId || selectedPetId === 'new') && (
        <>
          <div>
            <label className="text-sm">Nome do Pet</label>
            <Input value={petName} onChange={(e) => setPetName(e.target.value)} required />
          </div>

          <div>
            <label className="text-sm">Nome do Tutor</label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </div>

          <div>
            <label className="text-sm">Telefone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
        </>
      )}

      <div>
        <label className="text-sm">Serviço</label>
        <Select value={service || undefined} onValueChange={(v) => setService(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {services.length === 0 && (
              <>
                <SelectItem value="Banho e Tosa">Banho e Tosa</SelectItem>
                <SelectItem value="Apenas Banho">Apenas Banho</SelectItem>
                <SelectItem value="Tosa Higiênica">Tosa Higiênica</SelectItem>
              </>
            )}
            {services.map((s:any) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name} — R$ {Number(s.value || 0).toFixed(2)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm">Data</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>

        <div>
          <label className="text-sm">Hora</label>
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
      </div>

      <div>
        <label className="text-sm">Observações</label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <div>
        <label className="text-sm">Preço (opcional)</label>
        <Input type="number" step="0.01" value={priceOverride} onChange={(e) => setPriceOverride(e.target.value)} placeholder="Deixe em branco para usar preço do serviço" />
      </div>

      

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
      </div>
    </form>
  );
}
