import React from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type Role = 'support' | 'admin' | 'user';

interface CustomerFormProps {
  formData: any;
  setFormData: (fn: any) => void;
  viewOnly: boolean;
  formMode: 'create' | 'edit';
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  businesses: Array<{ id: string; brand_name: string }>;
  currentRole?: Role;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ formData, setFormData, viewOnly, formMode, onSubmit, onClose, businesses, currentRole }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData((s: any) => ({ ...s, name: e.target.value }))}
              placeholder="Nome completo"
              disabled={viewOnly}
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData((s: any) => ({ ...s, email: e.target.value }))}
              placeholder="email@exemplo.com"
              disabled={viewOnly}
            />
          </div>

          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData((s: any) => ({ ...s, phone: e.target.value }))}
              placeholder="(xx) xxxxx-xxxx"
              disabled={viewOnly}
            />
          </div>

          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input
              value={formData.city}
              onChange={(e) => setFormData((s: any) => ({ ...s, city: e.target.value }))}
              placeholder="São Paulo, SP"
              disabled={viewOnly}
            />
          </div>

          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData((s: any) => ({ ...s, address: e.target.value }))}
              placeholder="Rua, Número, Bairro"
              disabled={viewOnly}
            />
          </div>

          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData((s: any) => ({ ...s, notes: e.target.value }))}
              placeholder="Observações adicionais"
              className="w-full"
              disabled={viewOnly}
              rows={3}
            />
          </div>

          {(businesses && businesses.length > 1) && (
            <div className="space-y-2">
              <Label>Petshop</Label>
              <Select value={formData.business_id ?? (currentRole === 'support' ? (businesses[0]?.id ?? "") : "")} onValueChange={(value) => setFormData((s: any) => ({ ...s, business_id: value || null }))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={currentRole === 'support' ? undefined : "— Selecionar petshop —"} />
                </SelectTrigger>
                <SelectContent>
                  {businesses.map(b => (
                    <SelectItem key={b.id} value={b.id}>{b.brand_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Fechar
        </Button>
        {!viewOnly && (
          <Button type="submit">{formMode === 'create' ? 'Cadastrar' : 'Salvar'}</Button>
        )}
      </div>
    </form>
  );
};

export default CustomerForm;
