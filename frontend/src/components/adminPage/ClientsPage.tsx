import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Search, Plus, Edit, Eye, Phone, Mail, MapPin, Calendar, PawPrint } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  registerDate: string;
  totalAppointments: number;
  totalSpent: number;
  pets: string[];
  lastVisit: string;
  status: "active" | "inactive";
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 99999-9999",
    address: "Rua das Flores, 123",
    city: "São Paulo, SP",
    registerDate: "2024-01-15",
    totalAppointments: 8,
    totalSpent: 520.00,
    pets: ["Buddy", "Luna"],
    lastVisit: "2024-12-01",
    status: "active"
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria.santos@email.com",
    phone: "(11) 98888-8888",
    address: "Av. Principal, 456",
    city: "São Paulo, SP",
    registerDate: "2024-02-20",
    totalAppointments: 12,
    totalSpent: 780.00,
    pets: ["Max", "Bella", "Charlie"],
    lastVisit: "2024-12-15",
    status: "active"
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro.costa@email.com",
    phone: "(11) 97777-7777",
    address: "Rua do Centro, 789",
    city: "São Paulo, SP",
    registerDate: "2024-03-10",
    totalAppointments: 5,
    totalSpent: 325.00,
    pets: ["Rocky"],
    lastVisit: "2024-11-28",
    status: "active"
  },
  {
    id: "4",
    name: "Ana Oliveira",
    email: "ana.oliveira@email.com",
    phone: "(11) 96666-6666",
    address: "Alameda Verde, 321",
    city: "São Paulo, SP",
    registerDate: "2024-04-05",
    totalAppointments: 3,
    totalSpent: 195.00,
    pets: ["Mimi"],
    lastVisit: "2024-10-15",
    status: "inactive"
  }
];

export function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    notes: ""
  });

  const filteredClients = mockClients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm)
  );

  const handleAddClient = () => {
    setIsAddingClient(false);
    setNewClient({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      notes: ""
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <main className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie os dados dos tutores e seu histórico
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{filteredClients.length}</div>
            <div className="text-sm text-muted-foreground">Total de Clientes</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent">
              {filteredClients.filter(c => c.status === "active").length}
            </div>
            <div className="text-sm text-muted-foreground">Ativos</div> 
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Dados do Tutor</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      placeholder="João Silva"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      placeholder="joao@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={newClient.city}
                      onChange={(e) => setNewClient({...newClient, city: e.target.value})}
                      placeholder="São Paulo, SP"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    placeholder="Rua das Flores, 123"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={newClient.notes}
                    onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                    placeholder="Informações adicionais sobre o cliente..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingClient(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddClient}>
                  Cadastrar Cliente
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Client List */}
      <div className="grid gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">{client.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          {client.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {client.phone}
                        </div>
                      </div>
                    </div>
                    <Badge variant={client.status === "active" ? "default" : "secondary"}>
                      {client.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm">{client.address}</div>
                        <div className="text-xs text-muted-foreground">{client.city}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <PawPrint className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{client.pets.length} pets</div>
                        <div className="text-xs text-muted-foreground">
                          {client.pets.slice(0, 2).join(", ")}
                          {client.pets.length > 2 && ` +${client.pets.length - 2}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{client.totalAppointments} visitas</div>
                        <div className="text-xs text-muted-foreground">
                          Última: {formatDate(client.lastVisit)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary">
                        R$ {client.totalSpent.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Total gasto</div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedClient(client)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Detalhes do Cliente</DialogTitle>
                      </DialogHeader>
                      {selectedClient && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Nome</Label>
                              <p className="text-sm">{selectedClient.name}</p>
                            </div>
                            <div>
                              <Label>Status</Label>
                              <p className="text-sm">
                                <Badge variant={selectedClient.status === "active" ? "default" : "secondary"}>
                                  {selectedClient.status === "active" ? "Ativo" : "Inativo"}
                                </Badge>
                              </p>
                            </div>
                            <div>
                              <Label>Email</Label>
                              <p className="text-sm">{selectedClient.email}</p>
                            </div>
                            <div>
                              <Label>Telefone</Label>
                              <p className="text-sm">{selectedClient.phone}</p>
                            </div>
                            <div className="col-span-2">
                              <Label>Endereço</Label>
                              <p className="text-sm">{selectedClient.address}, {selectedClient.city}</p>
                            </div>
                            <div>
                              <Label>Data de Cadastro</Label>
                              <p className="text-sm">{formatDate(selectedClient.registerDate)}</p>
                            </div>
                            <div>
                              <Label>Última Visita</Label>
                              <p className="text-sm">{formatDate(selectedClient.lastVisit)}</p>
                            </div>
                            <div>
                              <Label>Pets</Label>
                              <p className="text-sm">{selectedClient.pets.join(", ")}</p>
                            </div>
                            <div>
                              <Label>Total Gasto</Label>
                              <p className="text-sm font-semibold">R$ {selectedClient.totalSpent.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredClients.length === 0 && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-muted-foreground">
                Nenhum cliente encontrado para o termo de busca.
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mockClients.length}</div>
              <div className="text-sm text-muted-foreground">Total Clientes</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockClients.filter(c => c.status === "active").length}
              </div>
              <div className="text-sm text-muted-foreground">Ativos</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {mockClients.reduce((sum, c) => sum + c.totalAppointments, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Visitas</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                R$ {mockClients.reduce((sum, c) => sum + c.totalSpent, 0).toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">Receita Total</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}