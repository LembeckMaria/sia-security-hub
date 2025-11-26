import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação de login
    setTimeout(() => {
      toast.success("Login realizado com sucesso!");
      navigate("/dashboard");
      setIsLoading(false);
    }, 1000);
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulação de cadastro
    setTimeout(() => {
      toast.success("Conta criada com sucesso!");
      navigate("/dashboard");
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen gradient-steel flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6 text-primary-foreground hover:bg-primary-foreground/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="shadow-strong border-gradient">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-xl gradient-petroleum mx-auto flex items-center justify-center mb-4 shadow-glow">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">SIA</h1>
              <p className="text-muted-foreground mt-2">Security Industrial Assistant</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Cadastro</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gradient-petroleum shadow-glow"
                    disabled={isLoading}
                  >
                    {isLoading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Seu nome"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-mail</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="seu@email.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full gradient-petroleum shadow-glow"
                    disabled={isLoading}
                  >
                    {isLoading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </Card>

        <p className="text-center text-sm text-primary-foreground/70 mt-6">
          Acesso seguro com criptografia JWT
        </p>
      </div>
    </div>
  );
};

export default Auth;
