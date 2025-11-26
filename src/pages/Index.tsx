import { Shield, Activity, Bell, TrendingUp, Gauge, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-steel">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2djhoOHYtOGgtOHptLTItMmg4di04aC04djh6bS0yIDBIMTZ2OGgxNnYtOHptLTItMnY4SDhWMTRoMjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="container relative mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-accent/50 text-accent">
              Sistema Industrial Inteligente
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 tracking-tight">
              SIA
            </h1>
            <p className="text-2xl md:text-3xl text-primary-foreground/80 mb-4 font-semibold">
              Security Industrial Assistant
            </p>
            <p className="text-lg md:text-xl text-primary-foreground/70 mb-12 max-w-2xl mx-auto">
              Monitoramento inteligente em tempo real para ambientes industriais. 
              Previsão de acidentes com IA híbrida embarcada.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate("/dashboard")}
                className="gradient-petroleum text-primary-foreground shadow-glow hover:shadow-strong transition-all duration-300"
              >
                <Activity className="mr-2 h-5 w-5" />
                Acessar Dashboard
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Shield className="mr-2 h-5 w-5" />
                Login
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tecnologia de Ponta para Segurança Industrial
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Monitoramento multi-sensorial com análise preditiva local e remota via LLM
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 shadow-metal hover:shadow-strong transition-all duration-300 border-gradient">
              <div className="w-12 h-12 rounded-lg gradient-petroleum flex items-center justify-center mb-4 shadow-glow">
                <Gauge className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Sensores Inteligentes</h3>
              <p className="text-muted-foreground">
                DHT11, MQ-5, HC-SR04, PIR, SW-420 e detector de chama integrados em uma única solução.
              </p>
            </Card>

            <Card className="p-6 shadow-metal hover:shadow-strong transition-all duration-300 border-gradient">
              <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">IA Preditiva</h3>
              <p className="text-muted-foreground">
                Análise local com Z-score e regressão + LLM remoto para previsão avançada de acidentes.
              </p>
            </Card>

            <Card className="p-6 shadow-metal hover:shadow-strong transition-all duration-300 border-gradient">
              <div className="w-12 h-12 rounded-lg gradient-steel flex items-center justify-center mb-4">
                <Bell className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Alertas em Tempo Real</h3>
              <p className="text-muted-foreground">
                Notificações instantâneas via WebSocket com níveis BAIXO/MÉDIO/ALTO/CRÍTICO.
              </p>
            </Card>

            <Card className="p-6 shadow-metal hover:shadow-strong transition-all duration-300 border-gradient">
              <div className="w-12 h-12 rounded-lg gradient-petroleum flex items-center justify-center mb-4 shadow-glow">
                <Flame className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Detecção de Incêndio</h3>
              <p className="text-muted-foreground">
                Sensor de chama KY-026 + análise de gás MQ-5 para resposta crítica instantânea.
              </p>
            </Card>

            <Card className="p-6 shadow-metal hover:shadow-strong transition-all duration-300 border-gradient">
              <div className="w-12 h-12 rounded-lg gradient-gold flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">SIA Box</h3>
              <p className="text-muted-foreground">
                Hardware compacto Arduino + ESP8266 com WiFi e comunicação serial robusta.
              </p>
            </Card>

            <Card className="p-6 shadow-metal hover:shadow-strong transition-all duration-300 border-gradient">
              <div className="w-12 h-12 rounded-lg gradient-steel flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Dashboard Profissional</h3>
              <p className="text-muted-foreground">
                Interface responsiva com gráficos Chart.js, histórico e gestão de configurações.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 gradient-petroleum">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Pronto para Revolucionar sua Segurança Industrial?
          </h2>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Implemente o ecossistema SIA completo em sua fábrica e reduza acidentes com tecnologia preditiva.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-strong"
          >
            Começar Agora
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-card">
        <div className="container mx-auto text-center text-muted-foreground">
          <p className="text-sm">
            © 2024 SIA - Security Industrial Assistant. Sistema IoT Industrial com IA Híbrida.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
