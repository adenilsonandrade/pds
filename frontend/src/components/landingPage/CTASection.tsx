import { Button } from "../ui/button";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ArrowRight, Phone, MessageCircle } from "lucide-react";

export function CTASection() {
  return (
    <section id="contato" className="py-20 px-4 bg-gradient-to-r from-primary to-accent">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl">
                Pronto para revolucionar 
                <span className="block">seu petshop?</span>
              </h2>
              <p className="text-xl text-white/90 leading-relaxed">
                Junte-se a mais de 2.000 petshops que já aumentaram seus 
                agendamentos e receita com nossa plataforma.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Setup gratuito e migração de dados incluída</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Treinamento completo para sua equipe</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span>Suporte dedicado durante toda a implementação</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                Começar Teste Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                <Phone className="mr-2 h-5 w-5" />
                Ligar Agora
              </Button>
            </div>

            <div className="pt-8 border-t border-white/20">
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl mb-1">30 dias</div>
                  <div className="text-sm text-white/80">Teste grátis</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">24/7</div>
                  <div className="text-sm text-white/80">Suporte</div>
                </div>
                <div>
                  <div className="text-2xl mb-1">0%</div>
                  <div className="text-sm text-white/80">Taxa setup</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1643435690300-a7af818ea471?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGRvZyUyMG93bmVyJTIwcGV0c2hvcHxlbnwxfHx8fDE3NTkwMTYzOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Cliente feliz com pet"
              className="rounded-2xl shadow-2xl"
            />
            
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur p-6 rounded-xl">
              <div className="text-center">
                <div className="text-2xl text-primary mb-2">"O melhor investimento que fiz!"</div>
                <div className="text-sm text-muted-foreground">
                  Marina Silva - Pet Amor (São Paulo)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}