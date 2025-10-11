import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Bell } from "lucide-react";

const notifications = [
    {
        message: "3 clientes confirmaram agendamentos para amanhã",
        time: "2 min atrás",
        type: "success"
    },
    {
        message: "Pagamento de R$ 80,00 recebido - Ana Silva",
        time: "15 min atrás",
        type: "info"
    },
    {
        message: "Lembrete: Rex (Golden) tem retorno em 2 dias",
        time: "1h atrás",
        type: "warning"
    }
];

export function NotificationsList() {
    return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Bell className="h-5 w-5 text-accent" />
                                Notificações Recentes
                            </CardTitle>
                            <CardDescription>
                                Últimas atividades do sistema
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm">
                            Ver todas
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {notifications.map((notification, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20"
                            >
                                <div className={`w-2 h-2 rounded-full mt-2 ${notification.type === 'success' ? 'bg-emerald-500' :
                                        notification.type === 'info' ? 'bg-blue-500' :
                                            'bg-yellow-500'
                                    }`} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm">{notification.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
    );
}
