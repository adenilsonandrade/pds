import { Badge } from "../ui/badge";
import { ArrowRight, MousePointer, Calendar, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    number: "01",
    icon: MousePointer,
    title: "Cliente acessa seu site",
    description: "Link simples e direto para agendamento online no seu petshop",
    color: "bg-primary"
  },
  {
    number: "02", 
    icon: Calendar,
    title: "Escolhe serviço e horário",
    description: "Interface intuitiva mostra disponibilidade em tempo real",
    color: "bg-accent"
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "Confirmação automática",
    description: "Cliente e petshop recebem confirmação via WhatsApp/SMS",
    color: "bg-primary"
  }
];

export function HowItWorksSection() {
  const containerVariants = ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2
      }
    }
  } as unknown) as any;

  const stepVariants = ({
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.8
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

  const lineVariants = ({
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: 0.3,
        ease: "easeOut"
      }
    }
  } as unknown) as any;

  return (
    <section id="como-funciona" className="py-20 px-4 bg-gradient-to-b from-secondary/20 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            viewport={{ once: true }}
          >
            <Badge variant="outline" className="mb-4">Como Funciona</Badge>
          </motion.div>
          <motion.h2 
            className="text-4xl mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            viewport={{ once: true }}
          >
            Simples para seus clientes,
            <motion.span 
              className="text-primary block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              viewport={{ once: true }}
            >
              poderoso para você
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            viewport={{ once: true }}
          >
            Em apenas 3 passos, seus clientes conseguem agendar e você tem 
            controle total da agenda do seu petshop.
          </motion.p>
        </motion.div>

        <div className="relative">
          <motion.div
            className="grid lg:grid-cols-3 gap-8 lg:gap-12"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                variants={stepVariants}
                whileHover={{ 
                  y: -10,
                  transition: { duration: 0.1 }
                }}
              >
                <div className="text-center">
                  <motion.div 
                    className={`${step.color} w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto mb-6 relative z-10`}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: [0, -10, 10, 0],
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <step.icon className="h-8 w-8" />
                  </motion.div>
                  <motion.div 
                    className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-2 text-6xl font-bold text-muted/10 z-0"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      delay: index * 0.2 + 0.5,
                      type: "spring",
                      stiffness: 100
                    }}
                    viewport={{ once: true }}
                  >
                    {step.number}
                  </motion.div>
                  
                  <motion.h3 
                    className="text-xl mb-4"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                  >
                    {step.title}
                  </motion.h3>
                  <motion.p 
                    className="text-muted-foreground leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.5 }}
                    viewport={{ once: true }}
                  >
                    {step.description}
                  </motion.p>
                </div>

                {index < steps.length - 1 && (
                  <motion.div 
                    className="lg:hidden flex justify-center my-8"
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.2 + 0.8 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      animate={{ x: [0, 10, 0] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                      }}
                    >
                      <ArrowRight className="h-6 w-6 text-muted-foreground" />
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto"
            whileHover={{ 
              scale: 1.02,
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              transition: { duration: 0.1 }
            }}
          >
            <motion.h3 
              className="text-2xl mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              viewport={{ once: true }}
            >
              Resultado:
            </motion.h3>
            <motion.div 
              className="grid grid-cols-2 gap-8"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
                }}
              >
                <motion.div 
                  className="text-3xl text-primary mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: 0.4,
                    type: "spring",
                    stiffness: 200
                  }}
                  viewport={{ once: true }}
                >
                  -80%
                </motion.div>
                <div className="text-sm text-muted-foreground">Ligações para agendar</div>
              </motion.div>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.3, delay: 0.1 } }
                }}
              >
                <motion.div 
                  className="text-3xl text-accent mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: 0.6,
                    type: "spring",
                    stiffness: 200
                  }}
                  viewport={{ once: true }}
                >
                  +150%
                </motion.div>
                <div className="text-sm text-muted-foreground">Agendamentos mensais</div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}