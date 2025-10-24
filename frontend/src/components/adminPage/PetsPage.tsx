import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";
import { Search, Plus, Edit, Eye, Calendar, User, Trash2, PawPrint, Users, Scale, Dog, Cat, MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "../ui/dropdown-menu";
import { getPets, createPet, updatePet, deletePet, Pet } from "../../services/pets";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../ui/alert-dialog";
import { getCustomers, Customer } from "../../services/customers";

export function PetsPage({ currentBusinessId }: { currentBusinessId?: string | null }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [newPet, setNewPet] = useState<Partial<Pet>>({});
  const [pets, setPets] = useState<Pet[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [editValues, setEditValues] = useState<Partial<Pet>>({});
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const list = await getPets();
        if (isMounted) setPets(list);
      } catch (e: any) {
        if (isMounted) setError(e?.message || "Erro ao carregar pets");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const list = await getCustomers();
        if (isMounted) setCustomers(list);
      } catch { }
    })();
    return () => { isMounted = false; };
  }, []);

  const filteredPets = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return pets.filter((pet) => {
      const matchesSearch = !term ||
        pet.name.toLowerCase().includes(term) ||
        (pet.customer_name?.toLowerCase().includes(term) ?? false) ||
        (pet.breed?.toLowerCase().includes(term) ?? false);
      const matchesSpecies = filterSpecies === "all" || pet.species === filterSpecies;
      return matchesSearch && matchesSpecies;
    });
  }, [pets, searchTerm, filterSpecies]);

  async function handleAddPet() {
    setLoading(true);
    setError(null);
    try {
      await createPet({
        name: newPet.name || "",
        species: newPet.species || "",
        breed: newPet.breed || null,
        age: newPet.age != null ? Number(newPet.age) : null,
        weight: newPet.weight != null ? Number(newPet.weight) : null,
        color: newPet.color || null,
        gender: (newPet.gender as Pet["gender"]) ?? null,
        customer_id: newPet.customer_id ?? null,
        notes: newPet.notes ?? null,
        vaccines: Boolean(newPet.vaccines),
        special_needs: newPet.special_needs ?? null,
        business_id: currentBusinessId ?? null,
      });
      setIsAddingPet(false);
      setNewPet({});
      const list = await getPets();
      setPets(list);
    } catch (e: any) {
      setError(e?.message || "Erro ao cadastrar pet");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletePet() {
    if (!petToDelete) return;
    setLoading(true);
    setError(null);
    try {
      await deletePet(petToDelete.id);
      setPetToDelete(null);
      const list = await getPets();
      setPets(list);
    } catch (e: any) {
      setError(e?.message || "Erro ao excluir pet");
    } finally {
      setLoading(false);
    }
  }

  function getAgeText(age?: number | null) {
    if (age == null) return "";
    return age === 1 ? "1 ano" : `${age} anos`;
  }

  async function handleUpdatePet() {
    if (!editingPet) return;
    setLoading(true);
    setError(null);
    try {
      await updatePet(editingPet.id, {
        name: editValues.name,
        species: editValues.species,
        breed: editValues.breed ?? null,
        age: editValues.age != null ? Number(editValues.age) : null,
        weight: editValues.weight != null ? Number(editValues.weight) : null,
        color: editValues.color ?? null,
        gender: (editValues.gender as Pet["gender"]) ?? null,
        customer_id: editValues.customer_id ?? null,
        notes: editValues.notes ?? null,
        vaccines: Boolean(editValues.vaccines),
        special_needs: editValues.special_needs ?? null,
        business_id: editValues.business_id ?? null,
      });
      setIsEditing(false);
      setEditingPet(null);
      setEditValues({});
      const list = await getPets();
      setPets(list);
    } catch (e: any) {
      setError(e?.message || "Erro ao atualizar pet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 space-y-6 p-3">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Pets</h1>
          <p className="text-muted-foreground">Gerencie informações dos pets e histórico de atendimentos</p>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{filteredPets.length}</div>
            <div className="text-sm text-muted-foreground">Pets Cadastrados</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-accent">{filteredPets.filter(p => p.species === "Cão").length}</div>
            <div className="text-sm text-muted-foreground">Cães</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
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
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Pet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-auto w-full">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Pet</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Dados do Pet</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPetName">Nome do Pet</Label>
                    <Input
                      id="newPetName"
                      value={newPet.name || ""}
                      onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                      placeholder="Buddy"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newSpecies">Espécie</Label>
                      <Select value={newPet.species || ""} onValueChange={(value) => setNewPet({ ...newPet, species: value })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cão">Cão</SelectItem>
                          <SelectItem value="Gato">Gato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newGender">Sexo</Label>
                      <RadioGroup value={newPet.gender || ""} onValueChange={(value) => setNewPet({ ...newPet, gender: value as Pet["gender"] })} className="flex items-center gap-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-muted/50 border border-input bg-background shadow-sm">
                          <RadioGroupItem value="male" id="newGenderMale" className="size-5" />
                          <span className="text-sm">Macho</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-muted/50 border border-input bg-background shadow-sm">
                          <RadioGroupItem value="female" id="newGenderFemale" className="size-5" />
                          <span className="text-sm">Fêmea</span>
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newBreed">Raça</Label>
                    <Input
                      id="newBreed"
                      value={newPet.breed || ""}
                      onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                      placeholder="Golden Retriever"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newColor">Cor</Label>
                    <Input
                      id="newColor"
                      value={newPet.color || ""}
                      onChange={(e) => setNewPet({ ...newPet, color: e.target.value })}
                      placeholder="Dourado"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="newAge">Idade (anos)</Label>
                    <Input
                      id="newAge"
                      type="number"
                      value={newPet.age ?? ""}
                      onChange={(e) => setNewPet({ ...newPet, age: e.target.value === "" ? null : Number(e.target.value) })}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newWeight">Peso (kg)</Label>
                    <Input
                      id="newWeight"
                      type="number"
                      step="0.1"
                      value={newPet.weight ?? ""}
                      onChange={(e) => setNewPet({ ...newPet, weight: e.target.value === "" ? null : Number(e.target.value) })}
                      placeholder="28.5"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newCustomer">Cliente</Label>
                  <Select value={newPet.customer_id != null ? String(newPet.customer_id) : ""} onValueChange={(value) => setNewPet({ ...newPet, customer_id: Number(value) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newNotes">Observações</Label>
                  <Textarea
                    id="newNotes"
                    value={newPet.notes || ""}
                    onChange={(e) => setNewPet({ ...newPet, notes: e.target.value })}
                    placeholder="Comportamento, preferências, histórico..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingPet(false)}>Cancelar</Button>
                <Button onClick={handleAddPet} disabled={loading}>{loading ? "Salvando..." : "Cadastrar Pet"}</Button>
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditing} onOpenChange={(open) => { setIsEditing(open); if (!open) { setEditingPet(null); setEditValues({}); } }}>
          <DialogContent className="max-h-[90vh] overflow-auto w-full">
            <DialogHeader>
              <DialogTitle>Editar Pet</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Dados do Pet</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editPetName">Nome do Pet</Label>
                    <Input
                      id="editPetName"
                      value={editValues.name || ""}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      placeholder="Buddy"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="editSpecies">Espécie</Label>
                      <Select value={editValues.species || ""} onValueChange={(value) => setEditValues({ ...editValues, species: value })}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cão">Cão</SelectItem>
                          <SelectItem value="Gato">Gato</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editGender">Sexo</Label>
                      <RadioGroup value={editValues.gender || ""} onValueChange={(value) => setEditValues({ ...editValues, gender: value as Pet["gender"] })} className="flex items-center gap-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-muted/50 border border-input bg-background shadow-sm">
                          <RadioGroupItem value="male" id="editGenderTopMale" className="size-5" />
                          <span className="text-sm">Macho</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-muted/50 border border-input bg-background shadow-sm">
                          <RadioGroupItem value="female" id="editGenderTopFemale" className="size-5" />
                          <span className="text-sm">Fêmea</span>
                        </label>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editBreed">Raça</Label>
                    <Input
                      id="editBreed"
                      value={editValues.breed || ""}
                      onChange={(e) => setEditValues({ ...editValues, breed: e.target.value })}
                      placeholder="Golden Retriever"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editColor">Cor</Label>
                    <Input
                      id="editColor"
                      value={editValues.color || ""}
                      onChange={(e) => setEditValues({ ...editValues, color: e.target.value })}
                      placeholder="Dourado"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editAge">Idade (anos)</Label>
                    <Input
                      id="editAge"
                      type="number"
                      value={editValues.age ?? ""}
                      onChange={(e) => setEditValues({ ...editValues, age: e.target.value === "" ? null : Number(e.target.value) })}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="editWeight">Peso (kg)</Label>
                    <Input
                      id="editWeight"
                      type="number"
                      step="0.1"
                      value={editValues.weight ?? ""}
                      onChange={(e) => setEditValues({ ...editValues, weight: e.target.value === "" ? null : Number(e.target.value) })}
                      placeholder="28.5"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editCustomer">Cliente</Label>
                  <Select value={editValues.customer_id != null ? String(editValues.customer_id) : ""} onValueChange={(value) => setEditValues({ ...editValues, customer_id: Number(value) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editNotes">Observações</Label>
                  <Textarea
                    id="editNotes"
                    value={editValues.notes || ""}
                    onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                    placeholder="Comportamento, preferências, histórico..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancelar</Button>
                <Button onClick={handleUpdatePet} disabled={loading}>{loading ? "Salvando..." : "Salvar alterações"}</Button>
              </div>
              {error && (
                <div className="text-sm text-red-600">{error}</div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {filteredPets.map((pet) => (
          <Card key={pet.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start gap-4 flex-col sm:flex-row">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-xl flex items-center gap-2"><PawPrint className="h-4 w-4 text-muted-foreground" />{pet.name}</h3>
                      </div>
                      {(pet.species || pet.breed || pet.color) && (
                        <div className="text-muted-foreground mb-2">
                          {pet.species}{pet.breed ? ` • ${pet.breed}` : ''}{pet.color ? ` • ${pet.color}` : ''}
                        </div>
                      )}
                      {pet.customer_name && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
                          <User className="h-4 w-4" />
                          Cliente: {pet.customer_name}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {pet.age != null && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="text-sm font-medium">{getAgeText(pet.age)}</div>
                        </div>
                      </div>
                    )}

                    {(pet.weight != null || pet.gender) && (
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-muted-foreground" />
                        <div>
                          {pet.weight != null && <div className="text-sm font-medium inline-block mr-3">{pet.weight}kg</div>}
                          {pet.gender && <div className="text-xs text-muted-foreground inline-block">{pet.gender === "male" ? "♂ Macho" : pet.gender === "female" ? "♀ Fêmea" : ""}</div>}
                        </div>
                      </div>
                    )}
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
                  <div className="hidden md:flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedPet(pet)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingPet(pet);
                        setEditValues({
                          name: pet.name,
                          species: pet.species,
                          breed: pet.breed ?? "",
                          age: pet.age ?? null,
                          weight: pet.weight ?? null,
                          color: pet.color ?? "",
                          gender: pet.gender ?? null,
                          customer_id: pet.customer_id ?? null,
                          notes: pet.notes ?? "",
                          vaccines: Boolean(pet.vaccines),
                          special_needs: pet.special_needs ?? "",
                          business_id: pet.business_id ?? null,
                        });
                        setIsEditing(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setPetToDelete(pet)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="md:hidden">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setSelectedPet(pet)}>
                          <Eye className="h-4 w-4 mr-2" /> Ver
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => {
                          setEditingPet(pet);
                          setEditValues({
                            name: pet.name,
                            species: pet.species,
                            breed: pet.breed ?? "",
                            age: pet.age ?? null,
                            weight: pet.weight ?? null,
                            color: pet.color ?? "",
                            gender: pet.gender ?? null,
                            customer_id: pet.customer_id ?? null,
                            notes: pet.notes ?? "",
                            vaccines: Boolean(pet.vaccines),
                            special_needs: pet.special_needs ?? "",
                            business_id: pet.business_id ?? null,
                          });
                          setIsEditing(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setPetToDelete(pet)} className="text-destructive" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredPets.length === 0 && (
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-muted-foreground">Nenhum pet encontrado para os filtros selecionados.</div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Pets</p>
                <h3 className="text-2xl font-bold text-primary">{pets.length}</h3>
                <p className="text-xs text-muted-foreground">Pets cadastrados no petshop</p>
              </div>
              <PawPrint className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cães</p>
                <h3 className="text-2xl font-bold text-accent">{pets.filter(p => p.species === "Cão").length}</h3>
                <p className="text-xs text-muted-foreground">Total de cães cadastrados</p>
              </div>
              <Dog className="h-8 w-8 text-accent" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gatos</p>
                <h3 className="text-2xl font-bold text-green-600">{pets.filter(p => p.species === "Gato").length}</h3>
                <p className="text-xs text-muted-foreground">Total de gatos cadastrados</p>
              </div>
              <Cat className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

      </div>

      <AlertDialog open={!!petToDelete} onOpenChange={(open) => { if (!open) setPetToDelete(null); }}>
        <AlertDialogContent className="z-[100]">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir pet</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{petToDelete?.name}"? Esta ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="destructive" onClick={handleDeletePet} disabled={loading}>
                {loading ? "Excluindo..." : "Excluir"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={!!selectedPet} onOpenChange={(open) => { if (!open) setSelectedPet(null); }}>
        <DialogContent className="max-h-[90vh] p-4 w-full z-[100]">
          <DialogHeader>
            <DialogTitle>Detalhes do Pet</DialogTitle>
          </DialogHeader>
          {selectedPet && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {selectedPet.name && (
                  <div>
                    <Label>Nome</Label>
                    <p className="text-sm flex items-center gap-2"><PawPrint className="h-4 w-4 text-muted-foreground" />{selectedPet.name}</p>
                  </div>
                )}

                {selectedPet.customer_name && (
                  <div>
                    <Label>Cliente</Label>
                    <p className="text-sm flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />{selectedPet.customer_name}</p>
                  </div>
                )}

                {selectedPet.species && (
                  <div>
                    <Label>Espécie</Label>
                    <p className="text-sm flex items-center gap-2">
                      {selectedPet.species === "Cão" ? <Dog className="h-4 w-4 text-muted-foreground" /> : selectedPet.species === "Gato" ? <Cat className="h-4 w-4 text-muted-foreground" /> : <PawPrint className="h-4 w-4 text-muted-foreground" />}
                      {selectedPet.species}
                    </p>
                  </div>
                )}

                {selectedPet.breed && (
                  <div>
                    <Label>Raça</Label>
                    <p className="text-sm flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground" />{selectedPet.breed}</p>
                  </div>
                )}

                {(selectedPet.age != null) && (
                  <div>
                    <Label>Idade</Label>
                    <p className="text-sm flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />{getAgeText(selectedPet.age)}</p>
                  </div>
                )}

                {selectedPet.weight != null && (
                  <div>
                    <Label>Peso</Label>
                    <p className="text-sm flex items-center gap-2"><Scale className="h-4 w-4 text-muted-foreground" />{selectedPet.weight}kg</p>
                  </div>
                )}

                {selectedPet.color && (
                  <div>
                    <Label>Cor</Label>
                    <p className="text-sm flex items-center gap-2"><span className="inline-block w-3 h-3 rounded-full bg-slate-300" />{selectedPet.color}</p>
                  </div>
                )}

                {selectedPet.gender && (
                  <div>
                    <Label>Sexo</Label>
                    <p className="text-sm flex items-center gap-2">{selectedPet.gender === "male" ? "Macho" : selectedPet.gender === "female" ? "Fêmea" : ""}</p>
                  </div>
                )}

                {selectedPet.notes && (
                  <div>
                    <Label>Observações</Label>
                    <p className="text-sm">{selectedPet.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

