import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useNavigate } from 'react-router-dom';
import { DollarSign } from 'lucide-react';
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Toggle } from "../ui/toggle";
import { useSelectedBusiness } from '../../contexts/SelectedBusinessContext';
import { updateBusiness } from '../../services/businesses';

export function SettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [currency, setCurrency] = useState("BRL");
  const [openNotifications, setOpenNotifications] = useState(true);
  const navigate = useNavigate();
  const { selectedBusinessId, businesses, setBusinesses } = useSelectedBusiness();
  const [contactEmail, setContactEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (selectedBusinessId) {
        const b = (businesses || []).find(b => b.id === selectedBusinessId);
        if (b) {
          if (!mounted) return;
          setBusinessName(b.brand_name || '');
          setContactEmail((b as any).contact_email || '');
          setPhone((b as any).phone || '');
          setCustomDomain((b as any).custom_domain || '');
          setLocation((b as any).location || '');
          return;
        }

        try {
          const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
          const res = await fetch('/api/admin/businesses', { method: 'GET', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }, cache: 'no-store' });
          if (res.ok) {
            const list = await res.json();
            const found = (list || []).find((x: any) => x.id === selectedBusinessId);
            if (found && mounted) {
              setBusinessName(found.brand_name || '');
              setContactEmail(found.contact_email || '');
              setPhone(found.phone || '');
              setCustomDomain(found.custom_domain || '');
              setLocation(found.location || '');
              try { setBusinesses(list); } catch (e) {}
              return;
            }
          }
        } catch (e) {
        }
      }

      try {
        const res2 = await fetch('/api/businesses/info', { method: 'GET', cache: 'no-store' });
        if (res2.ok) {
          const info = await res2.json();
          if (mounted && info) {
            setBusinessName(info.brand_name || '');
            setContactEmail(info.contact_email || '');
            setPhone(info.phone || '');
            setCustomDomain(info.custom_domain || '');
            setLocation(info.location || '');
          }
        }
      } catch (e) {}
    })();
    return () => { mounted = false; };
  }, [selectedBusinessId, businesses]);

  const save = () => {
    (async () => {
      if (!selectedBusinessId) return alert('Nenhum negócio selecionado');
      try {
        const updated = await updateBusiness(selectedBusinessId, {
          brand_name: businessName,
          contact_email: contactEmail,
          phone: phone,
          custom_domain: customDomain || null,
          location: location || null
        });
        try {
          const newBs = (businesses || []).map(b => b.id === updated.id ? { ...b, ...(updated as any) } : b);
          setBusinesses(newBs);
        } catch (e) {}
        alert('Informações da propriedade atualizadas');
      } catch (err: any) {
        alert(err.message || 'Falha ao salvar alterações');
      }
    })();
  };

  return (
    <main className="flex-1 space-y-6 p-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Configurações</h1>
          <p className="text-muted-foreground">Ajustes gerais do sistema e preferências da propriedade</p>
        </div>
        <div>
          <Button onClick={save}>Salvar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Propriedade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Nome da Empresa</Label>
                <Input value={businessName} onChange={(e) => setBusinessName((e.target as HTMLInputElement).value)} />
              </div>

              <div>
                <Label>E-mail de contato</Label>
                <Input value={contactEmail} onChange={(e) => setContactEmail((e.target as HTMLInputElement).value)} />
              </div>

              <div>
                <Label>Telefone</Label>
                <Input value={phone} onChange={(e) => setPhone((e.target as HTMLInputElement).value)} />
              </div>

              <div>
                <Label>Localização</Label>
                <Input value={location} onChange={(e) => setLocation((e.target as HTMLInputElement).value)} />
                {location ? (
                  <>
                    <div className="mt-1">
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                        Abrir no Maps
                      </a>
                    </div>

                    <div className="mt-3">
                      <div className="w-full h-64 border rounded overflow-hidden">
                        <iframe
                          title="Mapa - preview"
                          src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&output=embed`}
                          width="100%"
                          height="100%"
                          className="block"
                          style={{ border: 0 }}
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </>
                ) : null}
              </div>

              <div>
                <Label>Página da Propriedade</Label>
                {customDomain ? (
                  <div className="mt-1">
                    {(() => {
                      const href = `https://augendapet.ddns.net/booking/${customDomain}`;
                      return (
                        <a href={href} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {href}
                        </a>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">Nenhum domínio personalizado configurado</div>
                )}
              </div>

            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Atalhos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  <div>
                    <div className="font-medium">Metas / Orçamentos</div>
                    <div className="text-sm text-muted-foreground">Acesse e gerencie metas mensais</div>
                  </div>
                </div>
                <div>
                  <Button variant="outline" onClick={() => navigate('/admin/goals')}>Ir</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
