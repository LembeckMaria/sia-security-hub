import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, ArrowLeft, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const TestSensor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState({
    temperatura: 24.5,
    gas: 180,
    chama: 0,
    movimento: 0,
    vibracao: 12,
    distancia: 45
  });

  const enviarDados = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('sensores-update', {
        body: {
          deviceId: 'sia-box-01',
          temperatura: parseFloat(dados.temperatura.toString()),
          gas: parseInt(dados.gas.toString()),
          chama: parseInt(dados.chama.toString()),
          movimento: parseInt(dados.movimento.toString()),
          vibracao: parseInt(dados.vibracao.toString()),
          distancia: parseInt(dados.distancia.toString()),
          timestamp: Date.now()
        }
      });

      if (error) throw error;

      console.log('Resposta:', data);
      
      if (data?.alerta) {
        toast.success(`Dados enviados! Alerta: ${data.alerta.nivel}`, {
          description: data.alerta.mensagem
        });
      } else {
        toast.success('Dados enviados com sucesso!');
      }

      // Navegar para dashboard após 1 segundo
      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao enviar dados', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const cenarios = [
    {
      nome: "Normal",
      valores: { temperatura: 24.5, gas: 180, chama: 0, movimento: 0, vibracao: 12, distancia: 45 }
    },
    {
      nome: "Atenção",
      valores: { temperatura: 32, gas: 270, chama: 0, movimento: 1, vibracao: 35, distancia: 30 }
    },
    {
      nome: "Alto",
      valores: { temperatura: 45, gas: 380, chama: 0, movimento: 1, vibracao: 65, distancia: 15 }
    },
    {
      nome: "Crítico - Incêndio",
      valores: { temperatura: 55, gas: 520, chama: 1, movimento: 1, vibracao: 88, distancia: 10 }
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-steel shadow-metal sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="w-10 h-10 rounded-lg gradient-petroleum flex items-center justify-center shadow-glow">
              <Activity className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">Teste de Sensores</h1>
              <p className="text-sm text-primary-foreground/70">Simular envio de dados ao backend</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Formulário Manual */}
          <Card className="p-6 shadow-metal">
            <h2 className="text-xl font-bold mb-4">Envio Manual</h2>
            <form onSubmit={enviarDados} className="space-y-4">
              <div>
                <Label htmlFor="temperatura">Temperatura (°C)</Label>
                <Input
                  id="temperatura"
                  type="number"
                  step="0.1"
                  value={dados.temperatura}
                  onChange={(e) => setDados(prev => ({ ...prev, temperatura: parseFloat(e.target.value) }))}
                />
              </div>

              <div>
                <Label htmlFor="gas">Gás (ppm)</Label>
                <Input
                  id="gas"
                  type="number"
                  value={dados.gas}
                  onChange={(e) => setDados(prev => ({ ...prev, gas: parseInt(e.target.value) }))}
                />
              </div>

              <div>
                <Label htmlFor="chama">Chama (0=Não, 1=Sim)</Label>
                <Input
                  id="chama"
                  type="number"
                  min="0"
                  max="1"
                  value={dados.chama}
                  onChange={(e) => setDados(prev => ({ ...prev, chama: parseInt(e.target.value) }))}
                />
              </div>

              <div>
                <Label htmlFor="movimento">Movimento (0=Não, 1=Sim)</Label>
                <Input
                  id="movimento"
                  type="number"
                  min="0"
                  max="1"
                  value={dados.movimento}
                  onChange={(e) => setDados(prev => ({ ...prev, movimento: parseInt(e.target.value) }))}
                />
              </div>

              <div>
                <Label htmlFor="vibracao">Vibração (Hz)</Label>
                <Input
                  id="vibracao"
                  type="number"
                  value={dados.vibracao}
                  onChange={(e) => setDados(prev => ({ ...prev, vibracao: parseInt(e.target.value) }))}
                />
              </div>

              <div>
                <Label htmlFor="distancia">Distância (cm)</Label>
                <Input
                  id="distancia"
                  type="number"
                  value={dados.distancia}
                  onChange={(e) => setDados(prev => ({ ...prev, distancia: parseInt(e.target.value) }))}
                />
              </div>

              <Button
                type="submit"
                className="w-full gradient-petroleum shadow-glow"
                disabled={loading}
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Enviando..." : "Enviar Dados"}
              </Button>
            </form>
          </Card>

          {/* Cenários Pré-Definidos */}
          <Card className="p-6 shadow-metal">
            <h2 className="text-xl font-bold mb-4">Cenários Pré-Definidos</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Teste rapidamente diferentes situações
            </p>

            <div className="space-y-3">
              {cenarios.map((cenario) => (
                <Card key={cenario.nome} className="p-4 bg-muted/30">
                  <h3 className="font-semibold mb-2">{cenario.nome}</h3>
                  <div className="text-xs text-muted-foreground mb-3 space-y-1">
                    <div>Temp: {cenario.valores.temperatura}°C | Gás: {cenario.valores.gas}ppm</div>
                    <div>Chama: {cenario.valores.chama ? 'Sim' : 'Não'} | Vibração: {cenario.valores.vibracao}Hz</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => setDados(cenario.valores)}
                  >
                    Carregar Cenário
                  </Button>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        {/* Instruções */}
        <Card className="p-6 mt-6 shadow-metal">
          <h2 className="text-xl font-bold mb-4">📝 Instruções</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>1. <strong>Escolha um cenário</strong> pré-definido ou preencha manualmente os valores</p>
            <p>2. <strong>Clique em "Enviar Dados"</strong> para simular o ESP8266 enviando ao backend</p>
            <p>3. O sistema irá <strong>analisar os dados</strong> e gerar alertas automaticamente</p>
            <p>4. Você será <strong>redirecionado ao Dashboard</strong> para ver os resultados</p>
            <p>5. Verifique a página de <strong>Alertas</strong> para ver o histórico completo</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TestSensor;
