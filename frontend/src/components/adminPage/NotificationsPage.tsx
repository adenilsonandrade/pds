import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Bell, Trash, Check, X } from "lucide-react";

type Notification = {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'info' | 'warning' | 'success' | 'error';
};

const mockNotifications: Notification[] = [
  { id: '1', title: 'Novo Agendamento', message: 'Agendamento para Luna às 10:30', date: '2025-10-05 09:12', read: false, type: 'info' },
  { id: '2', title: 'Pagamento Recebido', message: 'Pagamento de R$85.00 recebido para Bella', date: '2025-10-04 16:20', read: true, type: 'success' },
  { id: '3', title: 'Cancelamento', message: 'Agendamento de Max foi cancelado', date: '2025-10-04 14:05', read: false, type: 'warning' },
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const toggleRead = (id: string) => {
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  };

  const remove = (id: string) => {
    setNotifications((prev) => prev.filter(n => n.id !== id));
  };

  const filtered = notifications.filter(n => filter === 'all' ? true : !n.read);

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-md">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Notificações</h1>
            <p className="text-muted-foreground">Gerencie notificações do sistema</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Buscar notificações..." className="w-64" />
          <Button variant="ghost" onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}>{filter === 'all' ? 'Somente não lidas' : 'Mostrar todas'}</Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Últimas notificações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">Nenhuma notificação encontrada.</div>
              )}

              {filtered.map((n) => (
                <div key={n.id} className={`p-4 rounded-lg border flex items-start justify-between ${n.read ? 'bg-muted/50' : ''}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{n.title}</div>
                      <Badge className={n.type === 'success' ? 'bg-green-100 text-green-800' : n.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : n.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                        {n.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{n.message}</div>
                    <div className="text-xs text-muted-foreground mt-2">{n.date}</div>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => toggleRead(n.id)}>
                      {n.read ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(n.id)}>
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
