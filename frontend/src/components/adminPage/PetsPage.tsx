import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Search, Plus, Edit, Eye, Calendar, User, Heart, Stethoscope } from "lucide-react";

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  weight: number;
  color: string;
  gender: "male" | "female";
  ownerId: string;
  ownerName: string;
  registerDate: string;
  lastVisit: string;
  totalAppointments: number;
  totalSpent: number;
  notes: string;
  vaccines: boolean;
  specialNeeds: string;
}

const mockPets: Pet[] = [
  {
    id: "1",
    name: "Buddy",
    species: "Cão",
    breed: "Golden Retriever",
    age: 3,
    weight: 28.5,
    color: "Dourado",
    gender: "male",
    ownerId: "1",
    ownerName: "João Silva",
    registerDate: "2024-01-15",
    lastVisit: "2024-12-01",
    totalAppointments: 5,
    totalSpent: 325.00,
    notes: "Muito dócil, gosta de água",
    vaccines: true,
    specialNeeds: ""
  },
  {
    id: "2",
    name: "Luna",
    species: "Gato",
    breed: "Persa",
    age: 2,
    weight: 4.2,
    color: "Branco",
    gender: "female",
    ownerId: "1",
    ownerName: "João Silva",
    registerDate: "2024-01-15",
    lastVisit: "2024-11-28",
    totalAppointments: 3,
    totalSpent: 195.00,
    notes: "Tímida, não gosta de barulho",
    vaccines: true,
    specialNeeds: "Sensível a ruídos"
  },
  {
    id: "3",
    name: "Max",
    species: "Cão",
    breed: "Poodle",
    age: 5,
    weight: 12.8,
    color: "Preto",
    gender: "male",
    ownerId: "2",
    ownerName: "Maria Santos",
    registerDate: "2024-02-20",
    lastVisit: "2024-12-15",
    totalAppointments: 8,
    totalSpent: 520.00,
    notes: "Energético, precisa de paciência para tosa",
    vaccines: true,
    specialNeeds: ""
  },
  {
    id: "4",
    name: "Bella",
    species: "Cão",
    breed: "Shih Tzu",
    age: 1,
    weight: 6.5,
    color: "Caramelo",
    gender: "female",
    ownerId: "2",
    ownerName: "Maria Santos",
    registerDate: "2024-02-20",
    lastVisit: "2024-12-10",
    totalAppointments: 4,
    totalSpent: 260.00,
    notes: "Filhote, primeira vez na tosa",
    vaccines: false,
    specialNeeds: "Primeira tosa"
  }
];

export function PetsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [newPet, setNewPet] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    weight: "",
    color: "",
    gender: "",
    ownerId: "",
    notes: "",
    vaccines: false,
    specialNeeds: ""
  });

  const filteredPets = mockPets.filter(pet => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pet.breed.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecies = filterSpecies === "all" || pet.species === filterSpecies;
    
    return matchesSearch && matchesSpecies;
  });

  const handleAddPet = () => {
    setIsAddingPet(false);
    setNewPet({
      name: "",
      species: "",
      breed: "",
      age: "",
      weight: "",
      color: "",
      gender: "",
      ownerId: "",
      notes: "",
      vaccines: false,
      specialNeeds: ""
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getAgeText = (age: number) => {
    return age === 1 ? "1 ano" : `${age} anos`;
  };

  return (
    <main className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Pets</h1>
          <p className="text-muted-foreground">
            Gerencie informações dos pets e histórico de atendimentos
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{filteredPets.length}</div>
            <div className="text-sm text-muted-foreground">Pets Cadastrados</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent">
              {filteredPets.filter(p => p.species === "Cão").length}
            </div>
            <div className="text-sm text-muted-foreground">Cães</div>
          </div>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome do pet, tutor ou raça..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={filterSpecies} onValueChange={setFilterSpecies}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Espécie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Cão">Cães</SelectItem>
            <SelectItem value="Gato">Gatos</SelectItem>
          </SelectContent>
        </Select>

        <Dialog open={isAddingPet} onOpenChange={setIsAddingPet}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Pet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Pet</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Dados do Pet</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="petName">Nome do Pet</Label>
                    <Input
                      id="petName"
                      value={newPet.name}
                      onChange={(e) => setNewPet({...newPet, name: e.target.value})}
                      placeholder="Buddy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="species">Espécie</Label>
                    <Select value={newPet.species} onValueChange={(value) => setNewPet({...newPet, species: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cão">Cão</SelectItem>
                        <SelectItem value="Gato">Gato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="breed">Raça</Label>
                    <Input
                      id="breed"
                      value={newPet.breed}
                      onChange={(e) => setNewPet({...newPet, breed: e.target.value})}
                      placeholder="Golden Retriever"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      value={newPet.color}
                      onChange={(e) => setNewPet({...newPet, color: e.target.value})}
                      placeholder="Dourado"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Idade (anos)</Label>
                    <Input
                      id="age"
                      type="number"
                      value={newPet.age}
                      onChange={(e) => setNewPet({...newPet, age: e.target.value})}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      value={newPet.weight}
                      onChange={(e) => setNewPet({...newPet, weight: e.target.value})}
                      placeholder="28.5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Sexo</Label>
                    <Select value={newPet.gender} onValueChange={(value) => setNewPet({...newPet, gender: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Macho</SelectItem>
                        <SelectItem value="female">Fêmea</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="owner">Tutor</Label>
                  <Select value={newPet.ownerId} onValueChange={(value) => setNewPet({...newPet, ownerId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tutor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">João Silva</SelectItem>
                      <SelectItem value="2">Maria Santos</SelectItem>
                      <SelectItem value="3">Pedro Costa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialNeeds">Necessidades Especiais</Label>
                  <Input
                    id="specialNeeds"
                    value={newPet.specialNeeds}
                    onChange={(e) => setNewPet({...newPet, specialNeeds: e.target.value})}
                    placeholder="Medicamentos, cuidados especiais..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={newPet.notes}
                    onChange={(e) => setNewPet({...newPet, notes: e.target.value})}
                    placeholder="Comportamento, preferências, histórico..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingPet(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddPet}>
                  Cadastrar Pet
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pet List */}
      <div className="grid gap-4">
        {filteredPets.map((pet) => (
          <Card key={pet.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                      <Heart className="h-8 w-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-xl">{pet.name}</h3>
                        <Badge variant="outline">
                          {pet.gender === "male" ? "♂ Macho" : "♀ Fêmea"}
                        </Badge>
                        {pet.vaccines && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Vacinado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-muted-foreground mb-2">
                        {pet.species} • {pet.breed} • {pet.color}
                      </div>
                      
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        Tutor: {pet.ownerName}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{getAgeText(pet.age)}</div>
                        <div className="text-xs text-muted-foreground">{pet.weight}kg</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{pet.totalAppointments} consultas</div>
                        <div className="text-xs text-muted-foreground">
                          Última: {formatDate(pet.lastVisit)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium">Necessidades</div>
                      <div className="text-xs text-muted-foreground">
                        {pet.specialNeeds || "Nenhuma"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-semibold text-primary">
                        R$ {pet.totalSpent.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Total gasto</div>
                    </div>
                  </div>

                  {pet.notes && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-sm text-muted-foreground">
                        <strong>Observações:</strong> {pet.notes}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setSelectedPet(pet)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Detalhes do Pet</DialogTitle>
                      </DialogHeader>
                      {selectedPet && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label>Nome</Label>
                              <p className="text-sm">{selectedPet.name}</p>
                            </div>
                            <div>
                              <Label>Tutor</Label>
                              <p className="text-sm">{selectedPet.ownerName}</p>
                            </div>
                            <div>
                              <Label>Espécie</Label>
                              <p className="text-sm">{selectedPet.species}</p>
                            </div>
                            <div>
                              <Label>Raça</Label>
                              <p className="text-sm">{selectedPet.breed}</p>
                            </div>
                            <div>
                              <Label>Idade</Label>
                              <p className="text-sm">{getAgeText(selectedPet.age)}</p>
                            </div>
                            <div>
                              <Label>Peso</Label>
                              <p className="text-sm">{selectedPet.weight}kg</p>
                            </div>
                            <div>
                              <Label>Cor</Label>
                              <p className="text-sm">{selectedPet.color}</p>
                            </div>
                            <div>
                              <Label>Sexo</Label>
                              <p className="text-sm">{selectedPet.gender === "male" ? "Macho" : "Fêmea"}</p>
                            </div>
                            <div className="col-span-2">
                              <Label>Necessidades Especiais</Label>
                              <p className="text-sm">{selectedPet.specialNeeds || "Nenhuma"}</p>
                            </div>
                            <div className="col-span-2">
                              <Label>Observações</Label>
                              <p className="text-sm">{selectedPet.notes}</p>
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

        {filteredPets.length === 0 && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-muted-foreground">
                Nenhum pet encontrado para os filtros selecionados.
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
              <div className="text-2xl font-bold text-primary">{mockPets.length}</div>
              <div className="text-sm text-muted-foreground">Total Pets</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {mockPets.filter(p => p.species === "Cão").length}
              </div>
              <div className="text-sm text-muted-foreground">Cães</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockPets.filter(p => p.species === "Gato").length}
              </div>
              <div className="text-sm text-muted-foreground">Gatos</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockPets.filter(p => p.vaccines).length}
              </div>
              <div className="text-sm text-muted-foreground">Vacinados</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}