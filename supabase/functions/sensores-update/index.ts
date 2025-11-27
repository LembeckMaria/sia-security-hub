import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SensorData {
  deviceId: string;
  temperatura: number;
  gas: number;
  chama: number;
  movimento: number;
  vibracao: number;
  distancia: number;
  timestamp: number;
}

interface AlertResult {
  nivel: string;
  mensagem: string;
  causa: string;
  acao: string;
}

// Análise simples local
function analisarDados(data: SensorData): AlertResult {
  // REGRA CRÍTICA: Chama detectada
  if (data.chama === 1) {
    return {
      nivel: "CRÍTICO",
      mensagem: "🔥 INCÊNDIO DETECTADO! Evacuação imediata!",
      causa: "Sensor de chama ativado",
      acao: "Acionar alarme, desligar equipamentos, chamar bombeiros"
    };
  }

  // Temperatura crítica
  if (data.temperatura > 50) {
    return {
      nivel: "CRÍTICO",
      mensagem: "Temperatura crítica ultrapassada",
      causa: `Temperatura: ${data.temperatura}°C (limite: 50°C)`,
      acao: "Parar processos, resfriar área"
    };
  }

  // Gás alto + vibração
  if (data.gas > 400 && data.vibracao > 60) {
    return {
      nivel: "ALTO",
      mensagem: "Combinação perigosa: gás elevado + vibração anormal",
      causa: "Possível vazamento próximo a equipamento vibrando",
      acao: "Verificar vazamentos, desligar motores próximos"
    };
  }

  // Temperatura alta
  if (data.temperatura > 40) {
    return {
      nivel: "ALTO",
      mensagem: "Temperatura elevada detectada",
      causa: `Temperatura: ${data.temperatura}°C`,
      acao: "Verificar resfriamento"
    };
  }

  // Gás elevado
  if (data.gas > 350) {
    return {
      nivel: "ALTO",
      mensagem: "Concentração de gás elevada",
      causa: `Gás: ${data.gas}ppm`,
      acao: "Verificar vazamentos, ventilar área"
    };
  }

  // Atenção - temperatura moderada
  if (data.temperatura > 30 || data.gas > 250) {
    return {
      nivel: "ATENÇÃO",
      mensagem: "Parâmetros acima do normal",
      causa: `Temp: ${data.temperatura}°C, Gás: ${data.gas}ppm`,
      acao: "Monitorar de perto"
    };
  }

  return {
    nivel: "NORMAL",
    mensagem: "Sistema operando normalmente",
    causa: "",
    acao: ""
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const data: SensorData = await req.json();
    
    console.log('Dados recebidos:', data);

    // Validar dados
    if (!data.deviceId || data.temperatura === undefined) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar se dispositivo existe
    const { data: device, error: deviceError } = await supabase
      .from('devices')
      .select('device_id')
      .eq('device_id', data.deviceId)
      .single();

    if (deviceError || !device) {
      console.error('Dispositivo não encontrado:', data.deviceId);
      return new Response(
        JSON.stringify({ error: 'Dispositivo não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Inserir leitura
    const { error: readingError } = await supabase
      .from('sensor_readings')
      .insert({
        device_id: data.deviceId,
        temperatura: data.temperatura,
        gas: data.gas,
        chama: data.chama,
        movimento: data.movimento,
        vibracao: data.vibracao,
        distancia: data.distancia,
        timestamp: data.timestamp
      });

    if (readingError) {
      console.error('Erro ao inserir leitura:', readingError);
      throw readingError;
    }

    // Analisar dados
    const alerta = analisarDados(data);

    // Inserir alerta se não for NORMAL
    if (alerta.nivel !== "NORMAL") {
      const { error: alertError } = await supabase
        .from('alerts')
        .insert({
          device_id: data.deviceId,
          level: alerta.nivel,
          message: alerta.mensagem,
          cause: alerta.causa,
          action: alerta.acao,
          read: false
        });

      if (alertError) {
        console.error('Erro ao inserir alerta:', alertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Dados recebidos',
        alerta: alerta
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
