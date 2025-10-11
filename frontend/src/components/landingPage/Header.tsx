import { Button } from "../ui/button";
import { Heart, Menu, X } from "lucide-react";
import { useCallback, useState } from "react";

interface HeaderProps {
  onNavigateToLogin: () => void;
}

function smoothScrollTo(id?: string) {
  if (!id) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function Header({ onNavigateToLogin }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const onLogoClick = useCallback(() => smoothScrollTo(), []);

  const handleNav = (id?: string) => {
    smoothScrollTo(id);
    setMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onLogoClick} className="flex items-center gap-2 focus:outline-none">
            <div className="bg-primary p-2 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl">AugendaPet</span>
          </button>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          <button onClick={() => smoothScrollTo('#recursos')} className="text-muted-foreground hover:text-foreground transition-colors">
            Recursos
          </button>
          <button onClick={() => smoothScrollTo('#como-funciona')} className="text-muted-foreground hover:text-foreground transition-colors">
            Como Funciona
          </button>
          <button onClick={() => smoothScrollTo('#precos')} className="text-muted-foreground hover:text-foreground transition-colors">
            Preços
          </button>
          <button onClick={() => smoothScrollTo('#contato')} className="text-muted-foreground hover:text-foreground transition-colors">
            Contato
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            className="hidden md:inline-flex"
            onClick={onNavigateToLogin}
          >
            Entrar
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
            Teste Grátis
          </Button>
          <button
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen(v => !v)}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-border w-full fixed left-0 top-16 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-3">
            <button onClick={() => handleNav('#recursos')} className="text-left text-base py-2">Recursos</button>
            <button onClick={() => handleNav('#como-funciona')} className="text-left text-base py-2">Como Funciona</button>
            <button onClick={() => handleNav('#precos')} className="text-left text-base py-2">Preços</button>
            <button onClick={() => handleNav('#contato')} className="text-left text-base py-2">Contato</button>
            <div className="pt-2 border-t border-border mt-2 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => { onNavigateToLogin(); setMenuOpen(false); }}>Entrar</Button>
              <Button className="flex-1 bg-primary hover:bg-primary/90">Teste Grátis</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}