import { Heart, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2 focus:outline-none">
                <div className="bg-primary p-2 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl">AugendaPet</span>
              </button>
            </div>
            <p className="text-slate-400 leading-relaxed">
              A plataforma completa de agendamento para petshops que querem crescer e oferecer a melhor experiência aos seus clientes.
            </p>
          </div>

          <div>
            <h3 className="text-lg mb-4">Produto</h3>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Recursos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Demonstração</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg mb-4">Empresa</h3>
            <ul className="space-y-3 text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Carreiras</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Imprensa</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg mb-4">Contato</h3>
            <ul className="space-y-3 text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(51) 99999-9876</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contato@augendapet.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Torres, RS</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-slate-400 text-sm">
              © 2025 AugendaPet. Todos os direitos reservados.
            </div>
            <div className="flex gap-6 text-slate-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">LGPD</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}