import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Flame, 
  Wind, 
  Thermometer, 
  Waves,
  Bell,
  Settings,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SensorCard } from "@/components/SensorCard";
import { AlertList } from "@/components/AlertList";

const Dashboard = () => {
  const navigate = useNavigate();
  const [sensorData, setSensorData] = useState({
    temperatura: 24.5,
    gas: 180,
    chama: 0,
    movimento: 0,
    vibracao: 12,
    distancia: 45,
    timestamp: Date.now()
  });

  // Simula atualização de dados
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorData(prev => ({
        temperatura: prev.temperatura + (Math.random() - 0.5) * 2,
        gas: Math.max(0, prev.gas + (Math.random() - 0.5) * 50),
        chama: Math.random() > 0.95 ? 1 : 0,
        movimento: Math.random() > 0.7 ? 1 : 0,
        vibracao: Math.max(0, prev.vibracao + (Math.random() - 0.5) * 10),
        distancia: Math.max(5, Math.min(100, prev.distancia + (Math.random() - 0.5) * 5)),
        timestamp: Date.now()
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusLevel = () => {
    if (sensorData.chama === 1 || sensorData.temperatura > 50 || sensorData.gas > 400) {
      return { level: "CRÍTICO", color: "danger", icon: AlertTriangle };
    }
    if (sensorData.temperatura > 35 || sensorData.gas > 300 || sensorData.vibracao > 60) {
      return { level: "ALTO", color: "warning", icon: AlertTriangle };
    }
    if (sensorData.temperatura > 30 || sensorData.gas > 200 || sensorData.vibracao > 30) {
      return { level: "ATENÇÃO", color: "warning", icon: TrendingUp };
    }
    return { level: "NORMAL", color: "success", icon: Activity };
  };

  const status = getStatusLevel();
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-steel shadow-metal sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-petroleum flex items-center justify-center shadow-glow">
                <Activity className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary-foreground">SIA Dashboard</h1>
                <p className="text-sm text-primary-foreground/70">Security Industrial Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/configuracoes")}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Settings className="h-4 w-4 mr-2" />
                Config
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/alertas")}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Bell className="h-4 w-4 mr-2" />
                Alertas
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Status Geral */}
        <Card className="p-6 mb-8 shadow-strong border-gradient">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Status do Sistema</h2>
              <p className="text-muted-foreground">Monitoramento em tempo real - SIA Box 01</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                className={`text-lg px-4 py-2 ${
                  status.color === 'danger' ? 'bg-danger text-white' :
                  status.color === 'warning' ? 'bg-warning text-white' :
                  'bg-success text-white'
                }`}
              >
                <StatusIcon className="h-5 w-5 mr-2" />
                {status.level}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Grid de Sensores */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <SensorCard
            title="Temperatura"
            value={sensorData.temperatura.toFixed(1)}
            unit="°C"
            icon={Thermometer}
            color="danger"
            threshold={{ low: 20, medium: 30, high: 40 }}
            currentValue={sensorData.temperatura}
          />
          
          <SensorCard
            title="Gás Combustível"
            value={sensorData.gas.toFixed(0)}
            unit="ppm"
            icon={Wind}
            color="warning"
            threshold={{ low: 150, medium: 250, high: 350 }}
            currentValue={sensorData.gas}
          />

          <SensorCard
            title="Detector de Chama"
            value={sensorData.chama === 1 ? "DETECTADO" : "NORMAL"}
            unit=""
            icon={Flame}
            color={sensorData.chama === 1 ? "danger" : "success"}
            threshold={{ low: 0, medium: 0, high: 1 }}
            currentValue={sensorData.chama}
          />

          <SensorCard
            title="Vibração"
            value={sensorData.vibracao.toFixed(0)}
            unit="Hz"
            icon={Waves}
            color="info"
            threshold={{ low: 20, medium: 40, high: 60 }}
            currentValue={sensorData.vibracao}
          />

          <SensorCard
            title="Movimento"
            value={sensorData.movimento === 1 ? "DETECTADO" : "NENHUM"}
            unit=""
            icon={Activity}
            color={sensorData.movimento === 1 ? "warning" : "success"}
            threshold={{ low: 0, medium: 0, high: 1 }}
            currentValue={sensorData.movimento}
          />

          <SensorCard
            title="Distância"
            value={sensorData.distancia.toFixed(0)}
            unit="cm"
            icon={Activity}
            color="info"
            threshold={{ low: 30, medium: 20, high: 10 }}
            currentValue={sensorData.distancia}
          />
        </div>

        {/* Alertas Recentes */}
        <Card className="p-6 shadow-metal">
          <h2 className="text-xl font-bold mb-4">Histórico de Alertas</h2>
          <AlertList />
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
