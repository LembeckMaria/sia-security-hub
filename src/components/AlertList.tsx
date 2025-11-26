import { AlertTriangle, TrendingUp, Activity, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const mockAlerts = [
  {
    id: 1,
    level: "CRÍTICO",
    message: "Chama detectada no setor B - Ação imediata necessária",
    timestamp: new Date(Date.now() - 5 * 60000).toLocaleString(),
    color: "danger"
  },
  {
    id: 2,
    level: "ALTO",
    message: "Temperatura elevada: 45°C - Tendência de aumento detectada",
    timestamp: new Date(Date.now() - 15 * 60000).toLocaleString(),
    color: "warning"
  },
  {
    id: 3,
    level: "ATENÇÃO",
    message: "Vibração anormal: padrão irregular na esteira transportadora",
    timestamp: new Date(Date.now() - 30 * 60000).toLocaleString(),
    color: "warning"
  },
  {
    id: 4,
    level: "PREVISÃO",
    message: "IA detectou possível falha em equipamento nas próximas 2 horas",
    timestamp: new Date(Date.now() - 45 * 60000).toLocaleString(),
    color: "info"
  },
  {
    id: 5,
    level: "NORMAL",
    message: "Sistema operando dentro dos parâmetros normais",
    timestamp: new Date(Date.now() - 60 * 60000).toLocaleString(),
    color: "success"
  }
];

export const AlertList = () => {
  const getIcon = (level: string) => {
    switch (level) {
      case "CRÍTICO":
      case "ALTO":
        return AlertTriangle;
      case "PREVISÃO":
        return TrendingUp;
      case "ATENÇÃO":
        return Activity;
      default:
        return Shield;
    }
  };

  return (
    <ScrollArea className="h-[400px] pr-4">
      <div className="space-y-4">
        {mockAlerts.map((alert) => {
          const Icon = getIcon(alert.level);
          return (
            <div
              key={alert.id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${alert.color === 'danger' ? 'bg-danger text-white' :
                  alert.color === 'warning' ? 'bg-warning text-white' :
                  alert.color === 'info' ? 'bg-info text-white' :
                  'bg-success text-white'}
              `}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge 
                    className={`
                      ${alert.color === 'danger' ? 'bg-danger text-white' :
                        alert.color === 'warning' ? 'bg-warning text-white' :
                        alert.color === 'info' ? 'bg-info text-white' :
                        'bg-success text-white'}
                    `}
                  >
                    {alert.level}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                </div>
                <p className="text-sm">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
