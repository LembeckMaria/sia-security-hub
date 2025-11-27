import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Configuracoes = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState({
    temp_low: 20,
    temp_medium: 30,
    temp_high: 40,
    temp_critical: 50,
    gas_low: 150,
    gas_medium: 250,
    gas_high: 350,
    gas_critical: 500,
    vib_low: 20,
    vib_medium: 40,
    vib_high: 60,
    z_threshold: 2.8,
    window_size: 10
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarConfig();
  }, []);

  const carregarConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('device_config')
        .select('*')
        .eq('device_id', 'sia-box-01')
        .single();

      if (error) throw error;
      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    }
  };

  const salvarConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('device_config')
        .update(config)
        .eq('device_id', 'sia-box-01');

      if (error) throw error;

      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

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
              <h1 className="text-xl font-bold text-primary-foreground">Configurações</h1>
              <p className="text-sm text-primary-foreground/70">Limites e parâmetros dos sensores</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={salvarConfig}>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Temperatura */}
            <Card className="p-6 shadow-metal">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-danger"></span>
                Temperatura (°C)
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="temp_low">Limite Baixo</Label>
                  <Input
                    id="temp_low"
                    type="number"
                    step="0.1"
                    value={config.temp_low}
                    onChange={(e) => handleChange('temp_low', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="temp_medium">Limite Médio</Label>
                  <Input
                    id="temp_medium"
                    type="number"
                    step="0.1"
                    value={config.temp_medium}
                    onChange={(e) => handleChange('temp_medium', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="temp_high">Limite Alto</Label>
                  <Input
                    id="temp_high"
                    type="number"
                    step="0.1"
                    value={config.temp_high}
                    onChange={(e) => handleChange('temp_high', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="temp_critical">Limite Crítico</Label>
                  <Input
                    id="temp_critical"
                    type="number"
                    step="0.1"
                    value={config.temp_critical}
                    onChange={(e) => handleChange('temp_critical', e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Gás */}
            <Card className="p-6 shadow-metal">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-warning"></span>
                Gás Combustível (ppm)
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="gas_low">Limite Baixo</Label>
                  <Input
                    id="gas_low"
                    type="number"
                    value={config.gas_low}
                    onChange={(e) => handleChange('gas_low', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gas_medium">Limite Médio</Label>
                  <Input
                    id="gas_medium"
                    type="number"
                    value={config.gas_medium}
                    onChange={(e) => handleChange('gas_medium', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gas_high">Limite Alto</Label>
                  <Input
                    id="gas_high"
                    type="number"
                    value={config.gas_high}
                    onChange={(e) => handleChange('gas_high', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="gas_critical">Limite Crítico</Label>
                  <Input
                    id="gas_critical"
                    type="number"
                    value={config.gas_critical}
                    onChange={(e) => handleChange('gas_critical', e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* Vibração */}
            <Card className="p-6 shadow-metal">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-info"></span>
                Vibração (Hz)
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="vib_low">Limite Baixo</Label>
                  <Input
                    id="vib_low"
                    type="number"
                    value={config.vib_low}
                    onChange={(e) => handleChange('vib_low', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="vib_medium">Limite Médio</Label>
                  <Input
                    id="vib_medium"
                    type="number"
                    value={config.vib_medium}
                    onChange={(e) => handleChange('vib_medium', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="vib_high">Limite Alto</Label>
                  <Input
                    id="vib_high"
                    type="number"
                    value={config.vib_high}
                    onChange={(e) => handleChange('vib_high', e.target.value)}
                  />
                </div>
              </div>
            </Card>

            {/* IA Preditiva */}
            <Card className="p-6 shadow-metal">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                Parâmetros IA
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="z_threshold">Z-Score Threshold</Label>
                  <Input
                    id="z_threshold"
                    type="number"
                    step="0.1"
                    value={config.z_threshold}
                    onChange={(e) => handleChange('z_threshold', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Desvio padrão para detecção de anomalias (padrão: 2.8)
                  </p>
                </div>
                <div>
                  <Label htmlFor="window_size">Tamanho da Janela</Label>
                  <Input
                    id="window_size"
                    type="number"
                    value={config.window_size}
                    onChange={(e) => handleChange('window_size', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Número de amostras para análise (padrão: 10)
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="gradient-petroleum shadow-glow"
            >
              <Save className="mr-2 h-5 w-5" />
              {loading ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Configuracoes;
