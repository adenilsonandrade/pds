import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Heart, Eye, EyeOff, ArrowLeft, Shield, Zap } from "lucide-react";
import { setToken } from '../../services/auth';
import { useSelectedBusiness } from '../../contexts/SelectedBusinessContext';

interface LoginPageProps {
  onBackToLanding: () => void;
  onLoginSuccess: () => void;
}

export function LoginPage({ onBackToLanding, onLoginSuccess }: LoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const { setSelectedBusinessId } = useSelectedBusiness();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data && data.message ? data.message : 'Erro ao autenticar');
        return data;
      })
      .then((data) => {
        if (data.token) {
          try {
            setToken(data.token, rememberMe);
            try { localStorage.removeItem('selectedBusinessId'); } catch (e) {}
            try { setSelectedBusinessId(null); } catch (e) {}
          } catch (err) {
            // ignore storage errors
          }
        }
        onLoginSuccess();
      })
      .catch((err: any) => {
        setError(err && err.message ? err.message : 'Erro ao autenticar');
      })
        .finally(() => setLoading(false));
    };

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        <div className="hidden lg:block relative">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1629819126368-d85e9138d2c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2UlMjBwZXRzfGVufDF8fHx8MTc1OTAyMzQ5N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Workspace moderno para petshops"
            className="rounded-2xl shadow-2xl w-full"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent rounded-2xl"></div>
          
          <div className="absolute bottom-8 left-8 right-8 text-white">
            <h2 className="text-3xl mb-4">
              Gerencie seu petshop com facilidade
            </h2>
            <p className="text-lg text-white/90 mb-6">
              Acesse o painel administrativo e tenha controle total sobre agendamentos, clientes e relatórios.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-accent p-2 rounded-lg">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm">Gestão Completa</div>
                  <div className="text-xs text-white/80">Tudo em um lugar</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm">100% Seguro</div>
                  <div className="text-xs text-white/80">Dados protegidos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <Button
            variant="ghost"
            onClick={onBackToLanding}
            className="self-start mb-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao site
          </Button>

          <Card className="w-full max-w-md mx-auto shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-primary p-3 rounded-xl">
                  <Heart className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-2xl">Área Administrativa</CardTitle>
                <CardDescription className="text-base">
                  Entre com suas credenciais para acessar o painel
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(!!checked)}
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Lembrar-me
                    </Label>
                  </div>
                  <Button variant="link" className="text-sm text-primary p-0 h-auto">
                    Esqueci minha senha
                  </Button>
                </div>

                <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/90">
                  {loading ? 'Entrando...' : 'Entrar no Painel'}
                </Button>
              </form>

              {error && (
                <div className="text-sm text-red-600 mt-2 text-center">{error}</div>
              )}

              <div className="text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-4 text-muted-foreground">Ou</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full h-12">
                  Entrar com Google
                </Button>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Não tem uma conta?{" "}
                  <Button variant="link" className="text-accent p-0 h-auto">
                    Solicitar demonstração
                  </Button>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 text-center">
            <p className="text-xs text-muted-foreground">
              Ao fazer login, você concorda com nossos{" "}
              <Button variant="link" className="text-xs p-0 h-auto">
                Termos de Uso
              </Button>{" "}
              e{" "}
              <Button variant="link" className="text-xs p-0 h-auto">
                Política de Privacidade
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}