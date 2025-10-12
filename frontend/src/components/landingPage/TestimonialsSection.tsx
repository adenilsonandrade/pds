import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Star } from "lucide-react";
import { motion } from "motion/react";

const testimonials = [
  {
    name: "Marina Silva",
    role: "Proprietária - Pet Amor",
    location: "São Paulo, SP",
    avatar: "MS",
    content: "Desde que implementamos o sistema, nossos agendamentos triplicaram! Os clientes adoram a praticidade e eu tenho muito mais controle da agenda.",
    rating: 5
  },
  {
    name: "Carlos Roberto",
    role: "Gerente - Clínica VetLife",
    location: "Rio de Janeiro, RJ", 
    avatar: "CR",
    content: "O sistema de lembretes automáticos reduziu drasticamente as faltas. Agora temos 95% de comparecimento nos agendamentos.",
    rating: 5
  },
  {
    name: "Ana Beatriz",
    role: "Dona - Pet Paradise",
    location: "Belo Horizonte, MG",
    avatar: "AB",
    content: "Interface super intuitiva, tanto para nós quanto para os clientes. Suporte excepcional e resultados visíveis desde o primeiro mês.",
    rating: 5
  },
  {
    name: "Fernando Costa",
    role: "Proprietário - Banho & Tosa Express",
    location: "Porto Alegre, RS",
    avatar: "FC",
    content: "Melhor investimento que fiz para o negócio. Além de organizar a agenda, consegui aumentar o ticket médio com agendamentos online.",
    rating: 5
  },
  {
    name: "Juliana Santos",
    role: "Veterinária - Clínica Animal Care",
    location: "Brasília, DF",
    avatar: "JS",
    content: "Sistema completo e confiável. Os relatórios me ajudam a entender melhor o negócio e planejar expansões.",
    rating: 5
  },
  {
    name: "Roberto Lima",
    role: "Sócio - PetShop Central",
    location: "Salvador, BA",
    avatar: "RL",
    content: "Implementação rápida e resultados imediatos. Nossos clientes ficaram encantados com a facilidade de agendamento online.",
    rating: 5
  }
];

export function TestimonialsSection() {
  const containerVariants = ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  } as unknown) as any;

  const cardVariants = ({
    hidden: { 
      opacity: 0, 
      y: 50,
      rotateY: -15
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateY: 0,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  } as unknown) as any;

  const statsVariants = ({
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut"
      }
    }
  } as unknown) as any;

  return (
    <section className="py-20 px-4 bg-white">
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
            Petshops que já crescem
            <motion.span 
              className="text-primary block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              com nossa plataforma
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-xl text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            Mais de 2.000 petshops em todo o Brasil já transformaram seus negócios
          </motion.p>
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                rotateY: 5,
                transition: { duration: 0.1 }
              }}
              style={{ perspective: 1000 }}
            >
              <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
                <CardContent className="p-6">
                  <motion.div 
                    className="flex items-center gap-1 mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
                    viewport={{ once: true }}
                  >
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0, rotate: 180 }}
                        whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ 
                          duration: 0.2, 
                          delay: index * 0.1 + 0.5 + i * 0.1,
                          type: "spring",
                          stiffness: 200 
                        }}
                        viewport={{ once: true }}
                      >
                        <Star className="h-4 w-4 fill-accent text-accent" />
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  <motion.blockquote 
                    className="text-muted-foreground mb-4 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 + 0.4 }}
                    viewport={{ once: true }}
                  >
                    "{testimonial.content}"
                  </motion.blockquote>
                  
                  <motion.div 
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.6 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Avatar>
                        <AvatarFallback className="bg-primary text-white">
                          {testimonial.avatar}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <div>
                      <motion.div 
                        className="font-medium"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.1 + 0.7 }}
                        viewport={{ once: true }}
                      >
                        {testimonial.name}
                      </motion.div>
                      <motion.div 
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.1 + 0.8 }}
                        viewport={{ once: true }}
                      >
                        {testimonial.role}
                      </motion.div>
                      <motion.div 
                        className="text-xs text-muted-foreground"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.1 + 0.9 }}
                        viewport={{ once: true }}
                      >
                        {testimonial.location}
                      </motion.div>
                    </div>
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
          transition={{ duration: 0.5, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {[
              { value: "2.000+", label: "Petshops ativos", color: "text-primary" },
              { value: "50.000+", label: "Agendamentos/mês", color: "text-accent" },
              { value: "4.9/5", label: "Avaliação média", color: "text-primary" },
              { value: "95%", label: "Taxa de retenção", color: "text-accent" }
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                variants={statsVariants}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className={`text-3xl mb-2 ${stat.color}`}
                  initial={{ scale: 0, rotate: 180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    duration: 0.4, 
                    delay: index * 0.1 + 0.5,
                    type: "spring",
                    stiffness: 200 
                  }}
                  viewport={{ once: true }}
                >
                  {stat.value}
                </motion.div>
                <motion.div 
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 + 0.7 }}
                  viewport={{ once: true }}
                >
                  {stat.label}
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}