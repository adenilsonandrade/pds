import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Calendar, MessageSquare, CreditCard, BarChart3, Bell, Shield } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Calendar,
    title: "Agendamento 24/7",
    description: "Seus clientes podem agendar a qualquer hora, mesmo quando você está fechado.",
    badge: "Essencial",
    color: "text-primary"
  },
  {
    icon: MessageSquare,
    title: "Lembretes Automáticos",
    description: "SMS e WhatsApp automáticos reduzem faltas em até 90%.",
    badge: "Popular",
    color: "text-accent"
  },
  {
    icon: CreditCard,
    title: "Pagamento Online",
    description: "Receba antecipado via PIX, cartão ou link de pagamento.",
    badge: "Novo",
    color: "text-primary"
  },
  {
    icon: BarChart3,
    title: "Relatórios Inteligentes",
    description: "Analise receita, horários mais procurados e performance do negócio.",
    badge: "Pro",
    color: "text-accent"
  },
  {
    icon: Bell,
    title: "Notificações em Tempo Real",
    description: "Receba alertas de novos agendamentos instantaneamente.",
    badge: "Essencial",
    color: "text-primary"
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    description: "LGPD compliant com backup automático e segurança bancária.",
    badge: "Seguro",
    color: "text-accent"
  }
];

export function FeaturesSection() {
  const containerVariants = ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  } as unknown) as any;

  const cardVariants = ({
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  } as unknown) as any;

  const titleVariants = ({
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  } as unknown) as any;

  return (
    <section id="recursos" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={titleVariants}
        >
          <motion.h2 
            className="text-4xl mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            Tudo que seu petshop precisa
            <motion.span 
              className="text-primary block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              viewport={{ once: true }}
            >
              em uma plataforma
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Funcionalidades pensadas especificamente para petshops que querem crescer 
            e oferecer a melhor experiência para seus clientes.
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="relative group hover:shadow-lg transition-shadow duration-300 h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: [0, -10, 10, 0],
                        transition: { duration: 0.3 }
                      }}
                    >
                      <feature.icon className={`h-12 w-12 ${feature.color}`} />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                      viewport={{ once: true }}
                    >
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    </motion.div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-secondary px-6 py-3 rounded-full"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span 
              className="text-sm"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              viewport={{ once: true }}
            >
              ✨ E muito mais funcionalidades sendo adicionadas
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}