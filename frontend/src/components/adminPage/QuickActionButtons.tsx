import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, UserPlus, Calendar, DollarSign } from "lucide-react";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import NewAppointmentForm from './NewAppointmentForm';
import CustomerForm from './CustomerForm';
import { createCustomer } from '../../services/customers';
import { getBusinesses } from '../../services/businesses';
import FinancialForm from './FinancialForm';
import { createFinancial } from '../../services/financial';

const quickActions = [
  {
    title: "Novo Agendamento",
    description: "Agendar banho ou tosa",
    icon: Plus,
    color: "bg-primary hover:bg-primary/90 text-white",
  },
  {
    title: "Cadastrar Cliente",
    description: "Adicionar novo cliente",
    icon: UserPlus,
    color: "bg-accent hover:bg-accent/90 text-white",
  },
  {
    title: "Ver Agenda",
    description: "Visualizar calendário",
    icon: Calendar,
    color: "bg-emerald-500 hover:bg-emerald-600 text-white",
  },
  {
    title: "Lançar Movimento Financeiro",
    description: "Registrar movimentação (receita/despesa)",
    icon: DollarSign,
    color: "bg-blue-500 hover:bg-blue-600 text-white",
  }
];

export function QuickActionButtons() {
  const [showNewModal, setShowNewModal] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [showFinancialModal, setShowFinancialModal] = useState(false);
  const [businesses, setBusinesses] = useState<Array<{ id: string; brand_name: string }>>([]);
  const [customerFormData, setCustomerFormData] = useState<any>({
    name: '', email: '', phone: '', address: '', city: '', notes: '', business_id: null
  });
  const [financialFormValues, setFinancialFormValues] = useState<any>({ type: 'revenue', amount: undefined, date: '', status: 'pending', description: '' });
  const [financialLoading, setFinancialLoading] = useState(false);
  const [financialError, setFinancialError] = useState<string | null>(null);

  const handleCreated = () => {
    setShowNewModal(false);
    try { window.dispatchEvent(new CustomEvent('appointments:created')); } catch (e) {}
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const bs = await getBusinesses();
        if (!mounted) return;
        setBusinesses(bs || []);
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const navigate = useNavigate();

  const handleCustomerCreated = async () => {
    try {
      const created = await createCustomer(customerFormData);
      setShowNewCustomerModal(false);
      window.dispatchEvent(new CustomEvent('customers:created', { detail: created }));
    } catch (err: any) {
      alert(err?.message || 'Falha ao criar cliente');
    }
  };
  return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-3">
            {quickActions.map((action, index) => {
              const isNew = action.title === 'Novo Agendamento';
              const isNewCustomer = action.title === 'Cadastrar Cliente';
              const isView = action.title === 'Ver Agenda';
              const isFinancial = action.title === 'Lançar Movimento Financeiro';
              return (
                <Button
                  key={index}
                  variant="outline"
                  className={`h-20 flex-col gap-2 ${action.color} border-0`}
                  onClick={() => { if (isNew) setShowNewModal(true); if (isNewCustomer) setShowNewCustomerModal(true); if (isView) navigate('/admin/schedule'); if (isFinancial) setShowFinancialModal(true); }}
                >
                  <action.icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="text-sm font-medium">{action.title}</div>
                    <div className="text-xs opacity-90">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
        <Dialog open={showNewModal} onOpenChange={(open) => setShowNewModal(open)}>
          <DialogContent className="max-h-[90vh] overflow-auto w-full">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <div>
              <NewAppointmentForm
                onClose={() => setShowNewModal(false)}
                onCreated={handleCreated}
                defaultDate={new Date().toISOString().substring(0,10)}
              />
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showNewCustomerModal} onOpenChange={(open) => setShowNewCustomerModal(open)}>
          <DialogContent className="max-h-[90vh] overflow-auto w-full">
            <DialogHeader>
              <DialogTitle>Cadastrar Cliente</DialogTitle>
            </DialogHeader>
            <div>
              <CustomerForm
                formData={customerFormData}
                setFormData={setCustomerFormData}
                viewOnly={false}
                formMode={'create'}
                onSubmit={async (e) => { e.preventDefault(); await handleCustomerCreated(); }}
                onClose={() => setShowNewCustomerModal(false)}
                businesses={businesses}
                currentRole={'admin'}
              />
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showFinancialModal} onOpenChange={(open) => setShowFinancialModal(open)}>
          <DialogContent className="max-h-[90vh] overflow-auto w-full">
            <DialogHeader>
              <DialogTitle>Lançar Movimento Financeiro</DialogTitle>
            </DialogHeader>
            <div>
              <FinancialForm
                formValues={financialFormValues}
                setFormValues={setFinancialFormValues}
                onCancel={() => { setShowFinancialModal(false); setFinancialFormValues({ type: 'revenue', amount: undefined, date: '', status: 'pending', description: '' }); setFinancialError(null); }}
                onSave={async () => {
                  setFinancialLoading(true); setFinancialError(null);
                  try {
                    await createFinancial({ amount: Number(financialFormValues.amount || 0), type: financialFormValues.type, date: financialFormValues.date, status: financialFormValues.status, description: financialFormValues.description });
                    setShowFinancialModal(false);
                    setFinancialFormValues({ type: 'revenue', amount: undefined, date: '', status: 'pending', description: '' });
                    window.dispatchEvent(new CustomEvent('financial:created'));
                  } catch (err: any) {
                    setFinancialError(err?.message || 'Erro ao criar movimento financeiro');
                  } finally { setFinancialLoading(false); }
                }}
                loading={financialLoading}
                error={financialError}
              />
            </div>
          </DialogContent>
        </Dialog>
      </Card>
  );
}
