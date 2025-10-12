import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Calendar, Clock, Users, Smartphone } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";

export function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

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

  const itemVariants = ({
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

  const iconVariants = ({
    hidden: { opacity: 0, y: 20, scale: 0.8 },
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

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 px-4 overflow-hidden">
      <motion.div 
        className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center"
        style={{ y, opacity }}
      >
        <motion.div 
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="space-y-4" variants={itemVariants}>
            <motion.h1 
              className="text-5xl lg:text-6xl tracking-tight"
              variants={itemVariants}
            >
              Transforme seu
              <motion.span 
                className="text-primary block"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                Petshop
              </motion.span>
              com agendamento
              <motion.span 
                className="text-accent block"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                inteligente
              </motion.span>
            </motion.h1>
            <motion.p 
              className="text-xl text-muted-foreground max-w-lg"
              variants={itemVariants}
            >
              Sistema completo de agendamento online que aumenta suas vendas, 
              reduz cancelamentos e deixa seus clientes mais felizes.
            </motion.p>
          </motion.div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            variants={itemVariants}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Começar Grátis por 30 Dias
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="outline" size="lg">
                Ver Demonstração
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8"
            variants={containerVariants}
          >
            <motion.div className="text-center" variants={iconVariants}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Agendamento Online</p>
            </motion.div>
            <motion.div className="text-center" variants={iconVariants}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Lembretes Automáticos</p>
            </motion.div>
            <motion.div className="text-center" variants={iconVariants}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              </motion.div>
              <p className="text-sm text-muted-foreground">Gestão de Clientes</p>
            </motion.div>
            <motion.div className="text-center" variants={iconVariants}>
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Smartphone className="h-8 w-8 text-accent mx-auto mb-2" />
              </motion.div>
              <p className="text-sm text-muted-foreground">App Mobile</p>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div 
          className="relative"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1725419876939-f8f9987cf0d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXQlMjBncm9vbWluZyUyMHNhbG9uJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc1OTAxNjM5MHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Petshop profissional com agendamento"
                className="rounded-2xl shadow-2xl w-full"
              />
            </motion.div>
            <motion.div 
              className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg"
              initial={{ opacity: 0, y: 50, x: -50 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              whileHover={{ scale: 1.1, y: -5 }}
            >
              <div className="text-center">
                <motion.div 
                  className="text-2xl text-primary mb-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, delay: 1 }}
                >
                  +300%
                </motion.div>
                <div className="text-sm text-muted-foreground">Agendamentos</div>
              </div>
            </motion.div>
            <motion.div 
              className="absolute -top-6 -right-6 bg-accent p-4 rounded-xl shadow-lg text-white"
              initial={{ opacity: 0, y: -50, x: 50 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              transition={{ duration: 0.4, delay: 1 }}
              whileHover={{ scale: 1.1, y: -5 }}
            >
              <div className="text-center">
                <motion.div 
                  className="text-xl mb-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2, delay: 1.2 }}
                >
                  98%
                </motion.div>
                <div className="text-sm">Satisfação</div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}