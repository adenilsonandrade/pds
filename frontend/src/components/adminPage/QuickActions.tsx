import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Bell, FileText } from "lucide-react";
import { QuickActionButtons } from "./QuickActionButtons";
import { NotificationsList } from "./NotificationsList";
import { QuickReports } from "./QuickReports";

export function QuickActions() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Quick action buttons moved to their own component */}
        </CardContent>
      </Card>

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
          {/* Notifications list moved to its own component */}
          <NotificationsList />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Relatórios Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Quick reports moved to their own component */}
          <QuickReports />
        </CardContent>
      </Card>
    </div>
  );
}
