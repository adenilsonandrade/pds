import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar, DateRange } from "../ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { 
  CalendarIcon, 
  Download, 
  FileText, 
  BarChart3, 
  Users, 
  PawPrint,
  DollarSign,
  Clock,
  TrendingUp
} from "lucide-react";


interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "financial" | "operational" | "clients";
  fields: string[];
  popularity: number;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "financial-summary",
    name: "Resumo Financeiro",
    description: "Receitas, despesas e lucro líquido por período",
    icon: DollarSign,
    category: "financial",
    fields: ["Data", "Receita", "Despesas", "Lucro", "Ticket Médio"],
    popularity: 95
  },
  {
    id: "appointments-report",
    name: "Relatório de Atendimentos",
    description: "Lista completa de agendamentos realizados",
    icon: Clock,
    category: "operational",
    fields: ["Data", "Pet", "Cliente", "Serviço", "Status", "Valor"],
    popularity: 88
  },
  {
    id: "clients-report",
    name: "Relatório de Clientes",
    description: "Informações detalhadas dos clientes cadastrados",
    icon: Users,
    category: "clients",
    fields: ["Nome", "Email", "Telefone", "Total Gasto", "Última Visita"],
    popularity: 76
  },
  {
    id: "services-performance",
    name: "Performance por Serviço",
    description: "Análise de vendas e rentabilidade por tipo de serviço",
    icon: BarChart3,
    category: "financial",
    fields: ["Serviço", "Quantidade", "Receita", "Ticket Médio", "% Total"],
    popularity: 82
  },
  {
    id: "pets-report",
    name: "Relatório de Pets",
    description: "Cadastro completo dos pets atendidos",
    icon: PawPrint,
    category: "clients",
    fields: ["Nome", "Espécie", "Raça", "Tutor", "Última Visita", "Total Gasto"],
    popularity: 71
  },
  {
    id: "monthly-growth",
    name: "Crescimento Mensal",
    description: "Evolução do faturamento e número de clientes",
    icon: TrendingUp,
    category: "financial",
    fields: ["Mês", "Receita", "Novos Clientes", "Crescimento %"],
    popularity: 85
  }
];

const mockReportHistory = [
  {
    id: "1",
    name: "Resumo Financeiro - Novembro 2024",
    generatedAt: "2024-12-01T10:30:00Z",
    format: "PDF",
    size: "245 KB"
  },
  {
    id: "2", 
    name: "Relatório de Atendimentos - Novembro 2024",
    generatedAt: "2024-12-01T09:15:00Z",
    format: "Excel",
    size: "180 KB"
  },
  {
    id: "3",
    name: "Relatório de Clientes - Q3 2024",
    generatedAt: "2024-11-28T14:20:00Z",
    format: "PDF",
    size: "320 KB"
  }
];

export function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedFormat, setSelectedFormat] = useState("pdf");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredTemplates = reportTemplates.filter(template => 
    selectedCategory === "all" || template.category === selectedCategory
  );

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setSelectedFields(template.fields);
  };

  const handleFieldToggle = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;
    
    setIsGenerating(true);
    
  await new Promise(resolve => setTimeout(resolve, 2000));
  setIsGenerating(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "financial": return "bg-green-100 text-green-800";
      case "operational": return "bg-blue-100 text-blue-800";
      case "clients": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "financial": return "Financeiro";
      case "operational": return "Operacional";
      case "clients": return "Clientes";
      default: return category;
    }
  };

  return (
    <main className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Relatórios</h1>
          <p className="text-muted-foreground">
            Gere relatórios personalizados em PDF ou Excel
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{reportTemplates.length}</div>
            <div className="text-sm text-muted-foreground">Modelos Disponíveis</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Templates List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              Todos
            </Button>
            <Button
              variant={selectedCategory === "financial" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("financial")}
            >
              Financeiro
            </Button>
            <Button
              variant={selectedCategory === "operational" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("operational")}
            >
              Operacional
            </Button>
            <Button
              variant={selectedCategory === "clients" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("clients")}
            >
              Clientes
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="grid gap-4">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedTemplate?.id === template.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleTemplateSelect(template)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <template.icon className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{template.name}</h3>
                          <Badge className={getCategoryColor(template.category)}>
                            {getCategoryLabel(template.category)}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-1">
                          {template.fields.slice(0, 4).map((field) => (
                            <Badge key={field} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                          {template.fields.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.fields.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {template.popularity}% popularidade
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full"
                          style={{ width: `${template.popularity}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Report Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurar Relatório</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTemplate ? (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Período</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                                {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                              </>
                            ) : (
                              format(dateRange.from, "dd/MM/yyyy", { locale: ptBR })
                            )
                          ) : (
                            "Selecionar período"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Formato</label>
                    <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Campos do Relatório</label>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedTemplate.fields.map((field) => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={field}
                            checked={selectedFields.includes(field)}
                            onCheckedChange={() => handleFieldToggle(field)}
                          />
                          <label
                            htmlFor={field}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {field}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleGenerateReport}
                    disabled={isGenerating || !dateRange?.from || selectedFields.length === 0}
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Gerar Relatório
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Selecione um modelo de relatório para continuar
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Relatórios Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockReportHistory.map((report) => (
                  <div 
                    key={report.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-sm">{report.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(report.generatedAt).toLocaleDateString('pt-BR')} • {report.size}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {report.format}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}