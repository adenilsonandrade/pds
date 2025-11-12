import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicBusinessInfo, getPublicBusinessServices, createPublicBooking } from '../../services/publicBusiness';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../ui/select';

interface BusinessInfo {
    brand_name?: string;
    logo_url?: string | null;
    phone?: string | null;
    contact_email?: string | null;
    location?: string | null;
    maps_url?: string | null;
    primary_theme_color?: string | null;
    secondary_theme_color?: string | null;
}

export default function BookingPage() {
    const { handle } = useParams<{ handle: string }>();
    const [business, setBusiness] = useState<BusinessInfo | null>(null);
    const [services, setServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({ nomeCliente: '', nomePet: '', telefone: '', servico: '', data: '', hora: '', observacoes: '' });
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const minDate = (() => {
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    })();

    function formatPhone(digits: string) {
        if (!digits) return '';
        const d = digits.replace(/\D/g, '').slice(0, 11); // max 11
        if (d.length <= 2) return `(${d}`;
        const area = d.slice(0, 2);
        const rest = d.slice(2);
        if (rest.length <= 5) return `(${area}) ${rest}`;
        const part1 = rest.slice(0, 5);
        const part2 = rest.slice(5);
        return `(${area}) ${part1}-${part2}`;
    }

    function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value || '';
        const digits = raw.replace(/\D/g, '').slice(0, 11);
        setForm(f => ({ ...f, telefone: digits }));
    }

    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                if (!handle) throw new Error('Handle do petshop ausente');
                const [info, svcs] = await Promise.all([
                    getPublicBusinessInfo(handle),
                    getPublicBusinessServices(handle),
                ]);
                if (!mounted) return;
                setBusiness(info);
                setServices(Array.isArray(svcs) ? svcs.filter(s => s.active !== 0) : []);
            } catch (err: any) {
                if (!mounted) return;
                setError(err.message || 'Erro ao buscar dados');
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => { mounted = false; };
    }, [handle]);

    function onChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    }

    function validate() {
        if (!form.nomeCliente.trim()) return 'Nome do cliente é obrigatório';
        if (!form.nomePet.trim()) return 'Nome do pet é obrigatório';
        if (!form.telefone.trim()) return 'Telefone é obrigatório';
        const phoneDigits = form.telefone.replace(/\D/g, '');
        if (phoneDigits.length < 10) return 'Telefone inválido';
        if (!form.servico) return 'Selecione um serviço';
        if (!form.data) return 'Data é obrigatória';
        if (form.data < minDate) return 'Data não pode ser anterior a hoje';
        if (!form.hora) return 'Hora é obrigatória';
        return null;
    }

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitMessage(null);
        const v = validate();
        if (v) {
            setSubmitMessage({ type: 'error', text: v });
            return;
        }
        setSubmitting(true);
        try {
            const payload = {
                nomePet: form.nomePet,
                especie: '',
                nomeCliente: form.nomeCliente,
                telefone: form.telefone,
                servico: form.servico,
                data: form.data,
                hora: form.hora,
                observacoes: form.observacoes
            };
            await createPublicBooking(handle || '', payload);
            setSubmitMessage({ type: 'success', text: 'Agendamento criado com sucesso!' });
            setForm({ nomeCliente: '', nomePet: '', telefone: '', servico: '', data: '', hora: '', observacoes: '' });
        } catch (err: any) {
            setSubmitMessage({ type: 'error', text: err.message || 'Falha ao criar agendamento' });
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>;

    return (
        <div className="min-h-screen px-4 py-8" style={{
            ...(business?.primary_theme_color ? { ['--primary' as any]: business.primary_theme_color } : {}),
            ...(business?.secondary_theme_color ? { ['--secondary' as any]: business.secondary_theme_color } : {})
        }}>
            <div className="max-w-4xl mx-auto text-center mb-8">
                {business?.logo_url ? (
                    <img src={business.logo_url} alt={business.brand_name || 'Logo'} className="mx-auto block w-auto object-contain" style={{ height: 200 }} />
                ) : (
                    <div className="mx-auto bg-primary rounded-lg flex items-center justify-center text-white text-lg font-semibold" style={{ height: 200, width: 200 }}>PET</div>
                )}
                <h1 className="mt-4 text-2xl font-semibold">{business?.brand_name}</h1>
            </div>

            <main className="max-w-6xl mx-auto flex flex-col gap-8">
                <section className="space-y-4">
                    <div className="p-4 border rounded-lg bg-card shadow-sm">
                        <h2 className="text-lg font-medium mb-4">Agendar um horário</h2>
                        {submitMessage && (
                            <div className={`p-2 mb-3 rounded ${submitMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-destructive'}`}>{submitMessage.text}</div>
                        )}
                        <form onSubmit={onSubmit} className="space-y-3 p-4 w-full md:w-96">
                            {submitMessage && <div className={`p-2 mb-3 rounded ${submitMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-destructive'}`}>{submitMessage.text}</div>}

                            <div>
                                <label className="text-sm">Nome do cliente</label>
                                <Input id="nomeCliente" name="nomeCliente" value={form.nomeCliente} onChange={onChange} required />
                            </div>

                            <div>
                                <label className="text-sm">Nome do Pet</label>
                                <Input id="nomePet" name="nomePet" value={form.nomePet} onChange={onChange} required />
                            </div>

                            <div>
                                <label className="text-sm">Telefone</label>
                                <Input id="telefone" name="telefone" type="tel" value={formatPhone(form.telefone)} onChange={handlePhoneChange} required />
                            </div>

                            <div>
                                <label className="text-sm">Serviço</label>
                                <Select value={form.servico || undefined} onValueChange={(v: any) => setForm(f => ({ ...f, servico: v }))}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione ou novo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {services.length === 0 && (
                                            <>
                                                <SelectItem value="Banho e Tosa">Banho e Tosa</SelectItem>
                                                <SelectItem value="Apenas Banho">Apenas Banho</SelectItem>
                                                <SelectItem value="Tosa Higiênica">Tosa Higiênica</SelectItem>
                                            </>
                                        )}
                                        {services.map((s: any) => (
                                            <SelectItem key={s.id} value={s.name}>{s.name} — R$ {Number(s.value || 0).toFixed(2)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <label className="text-sm">Data</label>
                                <Input id="data" type="date" name="data" value={form.data} onChange={onChange} required min={minDate} />
                            </div>

                            <div>
                                <label className="text-sm">Hora</label>
                                <Input id="hora" type="time" name="hora" value={form.hora} onChange={onChange} required />
                            </div>

                            <div>
                                <label className="text-sm">Observações</label>
                                <Input id="observacoes" name="observacoes" value={form.observacoes} onChange={onChange} />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-2 items-center sm:justify-end w-full">
                                <Button type="submit" className="w-full sm:w-auto" disabled={submitting}>{submitting ? 'Enviando...' : 'Agendar'}</Button>
                            </div>
                        </form>
                    </div>

                    <div className="p-4 border rounded-lg bg-card shadow-sm">
                        <h2 className="text-lg font-medium mb-2">Localização</h2>
                        {business?.location && <p className="text-sm text-muted-foreground">{business.location}</p>}
                        {business?.maps_url ? (
                            <div className="w-full h-80 overflow-hidden rounded-lg border">
                                <iframe title="Mapa" src={business.maps_url} className="w-full h-full border-0" />
                            </div>
                        ) : (
                            <div className="h-80 flex items-center justify-center text-sm text-muted-foreground">Mapa indisponível</div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
