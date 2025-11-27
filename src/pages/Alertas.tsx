import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Activity, 
  ArrowLeft, 
  AlertTriangle, 
  TrendingUp, 
  Shield,
  CheckCircle,
  Filter
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Alert {
  id: string;
  device_id: string;
  level: string;
  message: string;
  cause: string | null;
  action: string | null;
  read: boolean;
  created_at: string;
}

const Alertas = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filtro, setFiltro] = useState<string>("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarAlertas();
    
    // Subscrever a atualizações em tempo real
    const channel = supabase
      .channel('alerts-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          console.log('Novo alerta:', payload);
          setAlerts(prev => [payload.new as Alert, ...prev]);
          toast.info('Novo alerta recebido!');
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const carregarAlertas = async () => {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('device_id', 'sia-box-01')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
      toast.error('Erro ao carregar alertas');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLido = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === id ? { ...alert, read: true } : alert
      ));
      toast.success('Alerta marcado como lido');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao marcar alerta');
    }
  };

  const marcarTodosComoLidos = async () => {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ read: true })
        .eq('device_id', 'sia-box-01')
        .eq('read', false);

      if (error) throw error;

      setAlerts(prev => prev.map(alert => ({ ...alert, read: true })));
      toast.success('Todos os alertas marcados como lidos');
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao marcar alertas');
    }
  };

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

  const getColorClass = (level: string) => {
    switch (level) {
      case "CRÍTICO":
        return "danger";
      case "ALTO":
      case "ATENÇÃO":
        return "warning";
      case "PREVISÃO":
        return "info";
      default:
        return "success";
    }
  };

  const alertasFiltrados = alerts.filter(alert => {
    if (filtro === "todos") return true;
    if (filtro === "nao-lidos") return !alert.read;
    return alert.level === filtro;
  });

  const naoLidos = alerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="gradient-steel shadow-metal sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
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
                <h1 className="text-xl font-bold text-primary-foreground">Histórico de Alertas</h1>
                <p className="text-sm text-primary-foreground/70">
                  {naoLidos > 0 ? `${naoLidos} alertas não lidos` : 'Todos os alertas lidos'}
                </p>
              </div>
            </div>

            {naoLidos > 0 && (
              <Button
                size="sm"
                onClick={marcarTodosComoLidos}
                className="bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar Todos como Lidos
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros */}
        <Card className="p-4 mb-6 shadow-metal">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Button
              variant={filtro === "todos" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro("todos")}
            >
              Todos
            </Button>
            <Button
              variant={filtro === "nao-lidos" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro("nao-lidos")}
            >
              Não Lidos ({naoLidos})
            </Button>
            <Button
              variant={filtro === "CRÍTICO" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro("CRÍTICO")}
            >
              Crítico
            </Button>
            <Button
              variant={filtro === "ALTO" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro("ALTO")}
            >
              Alto
            </Button>
            <Button
              variant={filtro === "ATENÇÃO" ? "default" : "outline"}
              size="sm"
              onClick={() => setFiltro("ATENÇÃO")}
            >
              Atenção
            </Button>
          </div>
        </Card>

        {/* Lista de Alertas */}
        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Carregando alertas...</p>
          </Card>
        ) : alertasFiltrados.length === 0 ? (
          <Card className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-success" />
            <p className="text-lg font-semibold mb-2">Nenhum alerta encontrado</p>
            <p className="text-muted-foreground">O sistema está operando normalmente</p>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="space-y-4 pr-4">
              {alertasFiltrados.map((alert) => {
                const Icon = getIcon(alert.level);
                const colorClass = getColorClass(alert.level);
                
                return (
                  <Card
                    key={alert.id}
                    className={`p-6 shadow-metal transition-all ${
                      !alert.read ? 'border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`
                        w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0
                        ${colorClass === 'danger' ? 'bg-danger text-white' :
                          colorClass === 'warning' ? 'bg-warning text-white' :
                          colorClass === 'info' ? 'bg-info text-white' :
                          'bg-success text-white'}
                      `}>
                        <Icon className="h-6 w-6" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`
                            ${colorClass === 'danger' ? 'bg-danger text-white' :
                              colorClass === 'warning' ? 'bg-warning text-white' :
                              colorClass === 'info' ? 'bg-info text-white' :
                              'bg-success text-white'}
                          `}>
                            {alert.level}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(alert.created_at).toLocaleString('pt-BR')}
                          </span>
                          {!alert.read && (
                            <Badge variant="outline" className="ml-auto">Novo</Badge>
                          )}
                        </div>

                        <h3 className="text-lg font-bold mb-2">{alert.message}</h3>

                        {alert.cause && (
                          <p className="text-sm text-muted-foreground mb-2">
                            <strong>Causa:</strong> {alert.cause}
                          </p>
                        )}

                        {alert.action && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Ação:</strong> {alert.action}
                          </p>
                        )}

                        {!alert.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => marcarComoLido(alert.id)}
                            className="mt-3"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Lido
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
    </div>
  );
};

export default Alertas;
