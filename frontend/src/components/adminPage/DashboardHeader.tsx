import { Bell, Search, Calendar, Check, Trash, X, Menu } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { useSidebar } from "../ui/sidebar";
import { useState } from "react";

export function DashboardHeader() {
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [notifications, setNotifications] = useState([{
    id: '1', message: '3 clientes confirmaram agendamentos para amanhã', time: '2 min atrás', type: 'success', read: false
  },{
    id: '2', message: 'Pagamento de R$ 80,00 recebido - Ana Silva', time: '15 min atrás', type: 'info', read: true
  },{
    id: '3', message: 'Lembrete: Rex (Golden) tem retorno em 2 dias', time: '1h atrás', type: 'warning', read: false
  }]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
  const remove = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const { toggleSidebar, openMobile } = useSidebar();

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Mobile sidebar trigger */}
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md"
            aria-label={openMobile ? 'Fechar menu' : 'Abrir menu'}
            onClick={toggleSidebar}
          >
            {openMobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div>
            <h1 className="text-xl">Dashboard</h1>
            <p className="text-sm text-muted-foreground capitalize">{currentDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="relative max-w-sm hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar clientes, agendamentos..."
              className="pl-10 pr-4"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent align="end" sideOffset={8}>
              <div className="w-80">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">Notificações Recentes</div>
                  <Button variant="ghost" size="sm">Ver todas</Button>
                </div>

                <div className="space-y-2 max-h-64 overflow-auto">
                  {notifications.length === 0 && (
                    <div className="text-sm text-muted-foreground py-4 text-center">Sem notificações</div>
                  )}

                  {notifications.map(n => (
                    <div key={n.id} className={`flex items-start gap-3 p-2 rounded-md ${n.read ? 'bg-muted/20' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mt-2 ${n.type === 'success' ? 'bg-emerald-500' : n.type === 'info' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{n.message}</div>
                        <div className="text-xs text-muted-foreground">{n.time}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => toggleRead(n.id)}>
                          {n.read ? <X className="h-4 w-4"/> : <Check className="h-4 w-4"/>}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => remove(n.id)}>
                          <Trash className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Hoje: 6 agendamentos</span>
          </div>
        </div>
      </div>
    </header>
  );
}