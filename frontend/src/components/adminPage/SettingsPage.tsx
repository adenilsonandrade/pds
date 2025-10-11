import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Toggle } from "../ui/toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function SettingsPage() {
  const [businessName, setBusinessName] = useState("AgendaPet");
  const [currency, setCurrency] = useState("BRL");
  const [openNotifications, setOpenNotifications] = useState(true);

  const save = () => {
  };

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Configurações</h1>
          <p className="text-muted-foreground">Ajustes gerais do sistema e preferências da clínica</p>
        </div>
        <div>
          <Button onClick={save}>Salvar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Clínica</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Nome da Empresa</Label>
                <Input value={businessName} onChange={(e) => setBusinessName((e.target as HTMLInputElement).value)} />
              </div>

              <div>
                <Label>Moeda</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL - R$</SelectItem>
                    <SelectItem value="USD">USD - $</SelectItem>
                    <SelectItem value="EUR">EUR - €</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Notificações por e-mail</div>
                <div className="text-sm text-muted-foreground">Receba notificações sobre novos agendamentos e lembretes</div>
              </div>
              <Toggle pressed={openNotifications} onPressedChange={(v) => setOpenNotifications(!!v)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">Configurações de integrações futuras (ex.: gateways de pagamento, API externa)</div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
