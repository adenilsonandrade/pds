import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { FileText } from "lucide-react";

export function QuickReports() {
  return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-primary" />
            Relatórios Rápidos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Faturamento do Mês
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Clientes Mais Frequentes
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Serviços Mais Solicitados
          </Button>
        </CardContent>
      </Card>
  );
}
