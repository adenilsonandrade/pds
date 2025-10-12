import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Check, Zap, Crown, Rocket } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: "R$ 79",
    period: "/mês",
    description: "Perfeito para petshops iniciantes",
    badge: null,
    features: [
      "Até 300 agendamentos/mês",
      "Agenda online básica", 
      "Modulo financeiro",
      "Suporte por email",
      "1 usuário"
    ],
    cta: "Começar Grátis",
    popular: false
  },
  {
    name: "Professional", 
    icon: Crown,
    price: "R$ 149",
    period: "/mês",
    description: "Para petshops em crescimento",
    badge: "Mais Popular",
    features: [
      "Agendamentos ilimitados",
      "Múltiplos serviços",
      "Lembretes via WhatsApp",
      "Relatórios avançados",
      "Até 5 usuários",
      "Suporte prioritário"
    ],
    cta: "Escolher Plano",
    popular: true
  },
  {
    name: "Enterprise",
    icon: Rocket,
    price: "Consulte",
    description: "Para redes e grandes petshops",
    badge: "Mais Completo",
    features: [
      "Tudo do Professional",
      "Múltiplas unidades",
      "API personalizada",
      "Integração com sistemas",
      "Usuários ilimitados",
      "Customizações especiais"
    ],
    cta: "Conversar com Vendas",
    popular: false
  }
];

export function PricingSection() {
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');

  function parseBRL(priceStr: string) {
    if (!priceStr || priceStr.toLowerCase().includes('consulte')) return NaN;
    const digits = priceStr.replace(/[^0-9,\.]/g, '').replace(',', '.');
    return Number(digits) || NaN;
  }
    function BillingToggle() {
      return (
        <div className="inline-flex rounded-md bg-transparent">
          <button
            onClick={() => setBilling('monthly')}
            className={`px-4 py-2 text-sm ${billing === 'monthly' ? 'bg-primary text-white rounded-md' : 'text-muted-foreground'}`}
          >
            Mensal
          </button>
          <button
            onClick={() => setBilling('annual')}
            className={`px-4 py-2 text-sm ${billing === 'annual' ? 'bg-primary text-white rounded-md' : 'text-muted-foreground'}`}
          >
            Trimestral (-5%)
          </button>
        </div>
      );
    }

  function formatBRL(value: number) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 });
  }
  const containerVariants = ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  } as unknown) as any;

  const cardVariants = ({
    hidden: { 
      opacity: 0, 
      y: 80,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  } as unknown) as any;

  const featureVariants = ({
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    }
  } as unknown) as any;

  return (
    <section id="precos" className="py-20 px-4 bg-gradient-to-b from-secondary/20 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h2 
            className="text-4xl mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Planos que cabem no seu
            <motion.span 
              className="text-primary block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              orçamento
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Comece grátis por 30 dias. Sem compromisso, sem taxa de setup.
          </motion.p>
          
          <motion.div 
            className="inline-flex items-center bg-white p-1 rounded-lg shadow-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05 }}
          >
            {/* Billing toggle */}
            <BillingToggle />
          </motion.div>
        </motion.div>

        <motion.div 
          className="grid lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -15,
                scale: plan.popular ? 1.02 : 1.05,
                transition: { duration: 0.1 }
              }}
              className="relative"
            >
              <Card 
                className={`relative ${plan.popular ? 'ring-2 ring-primary shadow-xl scale-105' : ''} hover:shadow-lg transition-all duration-300 h-full`}
              >
                {plan.badge && (
                  <motion.div 
                    className="absolute -top-4 left-1/2 -translate-x-1/2"
                    initial={{ opacity: 0, y: -20, scale: 0 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.1 + 0.5,
                      type: "spring",
                      stiffness: 200 
                    }}
                    viewport={{ once: true }}
                  >
                    <Badge className="bg-accent text-white">{plan.badge}</Badge>
                  </motion.div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: 180 }}
                    whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1 + 0.3,
                      type: "spring",
                      stiffness: 200 
                    }}
                    viewport={{ once: true }}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.3 }
                    }}
                  >
                    <plan.icon className={`h-12 w-12 mx-auto mb-4 ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
                    viewport={{ once: true }}
                  >
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
                    viewport={{ once: true }}
                  >
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                  </motion.div>
                  <motion.div 
                    className="mt-4"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1 + 0.6,
                      type: "spring",
                      stiffness: 200 
                    }}
                    viewport={{ once: true }}
                  >
                    {/* Price rendering depending on billing */}
                    {(() => {
                      const base = parseBRL(plan.price as string);
                      if (isNaN(base)) {
                        return <span className="text-2xl">{plan.price}</span>;
                      }

                      if (billing === 'monthly') {
                        return (
                          <>
                            <span className="text-4xl">{formatBRL(base)}</span>
                            <span className="text-muted-foreground">/mês</span>
                          </>
                        );
                      }

                      const monthlyDiscounted = +(base * 0.95).toFixed(0);
                      const totalAnnual = monthlyDiscounted * 3;

                      return (
                        <div className="flex flex-col items-center">
                          <div>
                            <span className="text-4xl">{formatBRL(monthlyDiscounted)}</span>
                            <span className="text-muted-foreground">/mês</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">Total: <span className="font-medium">{formatBRL(totalAnnual)}</span></div>
                        </div>
                      );
                    })()}
                  </motion.div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <motion.ul 
                    className="space-y-3"
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.1,
                          delayChildren: index * 0.1 + 0.8
                        }
                      }
                    }}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={featureIndex} 
                        className="flex items-center gap-3"
                        variants={featureVariants}
                        whileHover={{ x: 5 }}
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: 180 }}
                          whileInView={{ scale: 1, rotate: 0 }}
                          transition={{ 
                            duration: 0.1, 
                            delay: index * 0.1 + 0.8 + featureIndex * 0.05,
                            type: "spring",
                            stiffness: 200 
                          }}
                          viewport={{ once: true }}
                        >
                          <Check className="h-5 w-5 text-primary flex-shrink-0" />
                        </motion.div>
                        <span className="text-sm">{feature}</span>
                      </motion.li>
                    ))}
                  </motion.ul>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 1.2 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`}
                        variant={plan.popular ? 'default' : 'outline'}
                      >
                        {plan.cta}
                      </Button>
                    </motion.div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="bg-white p-8 rounded-2xl shadow-lg max-w-4xl mx-auto"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              transition: { duration: 0.1 }
            }}
          >
            <motion.h3 
              className="text-2xl mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Todos os planos incluem:
            </motion.h3>
            <motion.div 
              className="grid md:grid-cols-3 gap-6 text-sm text-muted-foreground"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                    delayChildren: 0.7
                  }
                }
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                "30 dias grátis para testar",
                "Cancele quando quiser", 
                "Migração gratuita dos dados",
                "Plataforma de treinamento",
                "Atualizações automáticas",
                "Garantia de uptime 99.9%"
              ].map((feature, index) => (
                <motion.div 
                  key={index}
                  className="flex items-center gap-2"
                  variants={featureVariants}
                  whileHover={{ x: 5, scale: 1.05 }}
                >
                  <motion.div
                    initial={{ scale: 0, rotate: 180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      duration: 0.1, 
                      delay: 0.5 + index * 0.1,
                      type: "spring",
                      stiffness: 200 
                    }}
                    viewport={{ once: true }}
                  >
                    <Check className="h-4 w-4 text-primary" />
                  </motion.div>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}