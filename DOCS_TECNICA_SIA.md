# 📘 Documentação Técnica Completa - Ecossistema SIA

## Security Industrial Assistant - Sistema IoT Industrial com IA Híbrida

---

## 🎯 1. VISÃO GERAL DO SISTEMA

O SIA é um ecossistema completo de monitoramento industrial que integra:
- **Hardware**: Arduino + ESP8266 + 6 sensores
- **Software**: Frontend web responsivo + Backend REST API
- **IA Híbrida**: Análise local (Z-score + regressão) + LLM remoto (Gemini)
- **Comunicação**: WiFi HTTPS + Serial + opcional NRF24L01

---

## 🔌 2. ESPECIFICAÇÃO DE HARDWARE

### 2.1 Lista de Componentes Essenciais

| Componente | Modelo | Função | Alimentação |
|------------|--------|--------|-------------|
| Microcontrolador | Arduino Nano/Pro | Leitura de sensores | 5V |
| WiFi Module | ESP8266 (NodeMCU) | Comunicação backend | 3.3V |
| Temperatura/Umidade | DHT11 | Monitorar ambiente | 3.3-5V |
| Gás Combustível | MQ-5 (GLP/GN) | Detectar vazamentos | 5V |
| Chama | KY-026 (Digital) | Detectar fogo | 3.3-5V |
| Movimento | HC-SR501 (PIR) | Detectar presença | 5V |
| Vibração | SW-420 | Monitorar equipamentos | 3.3-5V |
| Distância | HC-SR04 (Ultrassom) | Proximidade obstáculos | 5V |
| Buzzer | Ativo 5V | Alarme sonoro | 5V |
| LEDs | RGB ou individuais | Indicadores visuais | 3.3-5V |
| Relé | 5V (2 canais) | Controle de equipamentos | 5V |
| Fonte | Step-down 12V→5V/3.3V | Alimentação geral | - |

### 2.2 Diagrama de Ligação (Pinos Sugeridos - Arduino Nano)

```
DHT11:
  VCC → 5V
  DATA → D2 (Digital Pin 2)
  GND → GND

MQ-5:
  VCC → 5V
  AOUT → A0 (Analog Pin)
  DOUT → D3 (opcional)
  GND → GND

KY-026 (Chama):
  VCC → 5V
  DO → D4 (Digital Out)
  AO → A1 (Analog Out - opcional)
  GND → GND

HC-SR501 (PIR):
  VCC → 5V
  OUT → D5
  GND → GND

SW-420 (Vibração):
  VCC → 5V
  DO → D6
  AO → A2 (opcional)
  GND → GND

HC-SR04 (Ultrassom):
  VCC → 5V
  TRIG → D7
  ECHO → D8 (com divisor de tensão 5V→3.3V se necessário)
  GND → GND

Buzzer:
  + → D9 (PWM)
  - → GND

LEDs (Status):
  LED_VERDE → D10 (Normal)
  LED_AMARELO → D11 (Atenção)
  LED_VERMELHO → D12 (Crítico)
  GND → GND (com resistor 220Ω)

Comunicação Serial (Arduino ↔ ESP8266):
  Arduino TX (D1) → ESP RX
  Arduino RX (D0) → ESP TX
  GND comum
```

**⚠️ IMPORTANTE - Alimentação:**
- ESP8266 opera em **3.3V** - nunca alimentar com 5V direto!
- Use divisor de tensão para sinais 5V→3.3V se necessário
- HC-SR04 ECHO pode precisar de divisor de tensão

---

## 💻 3. FIRMWARE ARDUINO (Sketch Completo)

### 3.1 Código Arduino - Leitura e Envio de Dados

```cpp
// ============================================
// SIA - Firmware Arduino Nano
// Versão: 1.0
// Autor: SIA Team
// ============================================

#include <DHT.h>

// ===== DEFINIÇÕES DE PINOS =====
#define DHT_PIN 2
#define DHT_TYPE DHT11
#define MQ5_PIN A0
#define CHAMA_PIN 4
#define PIR_PIN 5
#define VIBRACAO_PIN 6
#define TRIG_PIN 7
#define ECHO_PIN 8
#define BUZZER_PIN 9
#define LED_VERDE 10
#define LED_AMARELO 11
#define LED_VERMELHO 12

// ===== OBJETOS =====
DHT dht(DHT_PIN, DHT_TYPE);

// ===== VARIÁVEIS GLOBAIS =====
float temperatura = 0;
int gasAnalogico = 0;
int chamaDetectada = 0;
int movimentoDetectado = 0;
int vibracaoDetectada = 0;
int distanciaCm = 0;

// Debouncing
unsigned long ultimaLeitura = 0;
const unsigned long INTERVALO_LEITURA = 2000; // 2 segundos

// ===== FUNÇÕES AUXILIARES =====

// Lê distância do HC-SR04
int lerDistanciaUltrassom() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duracao = pulseIn(ECHO_PIN, HIGH, 30000); // timeout 30ms
  if (duracao == 0) return -1; // Erro
  
  int distancia = duracao * 0.034 / 2;
  return distancia;
}

// Atualiza LEDs de status
void atualizarLEDs(int nivel) {
  digitalWrite(LED_VERDE, nivel == 0 ? HIGH : LOW);
  digitalWrite(LED_AMARELO, nivel == 1 ? HIGH : LOW);
  digitalWrite(LED_VERMELHO, nivel >= 2 ? HIGH : LOW);
}

// Aciona buzzer se crítico
void verificarAlarme() {
  if (chamaDetectada == 1 || temperatura > 50 || gasAnalogico > 700) {
    tone(BUZZER_PIN, 1000, 500); // Beep 1kHz por 500ms
  }
}

// ===== SETUP =====
void setup() {
  Serial.begin(9600); // Comunicação com ESP8266
  
  dht.begin();
  
  // Configurar pinos
  pinMode(MQ5_PIN, INPUT);
  pinMode(CHAMA_PIN, INPUT);
  pinMode(PIR_PIN, INPUT);
  pinMode(VIBRACAO_PIN, INPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_AMARELO, OUTPUT);
  pinMode(LED_VERMELHO, OUTPUT);
  
  // LED inicial (verde)
  atualizarLEDs(0);
  
  delay(2000); // Aguarda estabilização sensores
  Serial.println("SIA_READY");
}

// ===== LOOP PRINCIPAL =====
void loop() {
  unsigned long agora = millis();
  
  if (agora - ultimaLeitura >= INTERVALO_LEITURA) {
    ultimaLeitura = agora;
    
    // ===== LEITURA DOS SENSORES =====
    temperatura = dht.readTemperature();
    if (isnan(temperatura)) temperatura = -1; // Erro de leitura
    
    gasAnalogico = analogRead(MQ5_PIN); // 0-1023
    chamaDetectada = !digitalRead(CHAMA_PIN); // Invertido (LOW = chama)
    movimentoDetectado = digitalRead(PIR_PIN);
    vibracaoDetectada = digitalRead(VIBRACAO_PIN);
    distanciaCm = lerDistanciaUltrassom();
    
    // ===== ENVIO SERIAL (Formato CSV) =====
    // Formato: TEMP,GAS,CHAMA,MOV,VIB,DIST,TIMESTAMP
    Serial.print(temperatura, 1);
    Serial.print(",");
    Serial.print(gasAnalogico);
    Serial.print(",");
    Serial.print(chamaDetectada);
    Serial.print(",");
    Serial.print(movimentoDetectado);
    Serial.print(",");
    Serial.print(vibracaoDetectada);
    Serial.print(",");
    Serial.print(distanciaCm);
    Serial.print(",");
    Serial.println(agora);
    
    // ===== ANÁLISE LOCAL SIMPLES =====
    int nivelAlerta = 0; // 0=Normal, 1=Atenção, 2+=Crítico
    
    if (chamaDetectada || temperatura > 50 || gasAnalogico > 700) {
      nivelAlerta = 3; // CRÍTICO
    } else if (temperatura > 35 || gasAnalogico > 500 || vibracaoDetectada) {
      nivelAlerta = 2; // ALTO
    } else if (temperatura > 30 || gasAnalogico > 300) {
      nivelAlerta = 1; // ATENÇÃO
    }
    
    atualizarLEDs(nivelAlerta);
    verificarAlarme();
  }
  
  // Possibilita comandos via Serial do ESP
  if (Serial.available()) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();
    
    if (comando == "RESET") {
      asm volatile ("jmp 0"); // Reset software
    }
  }
}
```

---

## 📡 4. FIRMWARE ESP8266 (NodeMCU)

### 4.1 Código ESP8266 - Comunicação WiFi + Backend

```cpp
// ============================================
// SIA - Firmware ESP8266 (NodeMCU)
// Versão: 1.0
// Função: Recebe dados do Arduino e envia ao backend
// ============================================

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// ===== CONFIGURAÇÕES WiFi =====
const char* WIFI_SSID = "SUA_REDE_WIFI";
const char* WIFI_PASSWORD = "SUA_SENHA_WIFI";

// ===== CONFIGURAÇÕES BACKEND =====
const char* BACKEND_URL = "https://SEU_PROJETO.supabase.co/functions/v1/sensores-update";
const char* API_KEY = "SUA_API_KEY"; // Ou JWT token
const char* DEVICE_ID = "sia-box-01";

// ===== VARIÁVEIS =====
WiFiClientSecure client;
String ultimaLeitura = "";
unsigned long ultimoEnvio = 0;
const unsigned long INTERVALO_ENVIO = 5000; // 5 segundos

// ===== SETUP =====
void setup() {
  Serial.begin(9600);
  delay(1000);
  
  Serial.println("ESP8266 - SIA Box Iniciando...");
  
  // Conectar WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  Serial.print("Conectando WiFi");
  int tentativas = 0;
  while (WiFi.status() != WL_CONNECTED && tentativas < 30) {
    delay(500);
    Serial.print(".");
    tentativas++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Conectado!");
    Serial.print("IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFalha ao conectar WiFi!");
  }
  
  // Configurar cliente HTTPS (sem validação de certificado para teste)
  client.setInsecure();
}

// ===== FUNÇÕES =====

// Parseia CSV do Arduino
bool parsearDados(String csv, float &temp, int &gas, int &chama, int &mov, int &vib, int &dist, unsigned long &timestamp) {
  int indices[7];
  int count = 0;
  
  for (int i = 0; i < csv.length() && count < 7; i++) {
    if (csv.charAt(i) == ',' || i == csv.length() - 1) {
      indices[count++] = i;
    }
  }
  
  if (count < 6) return false; // Dados incompletos
  
  temp = csv.substring(0, indices[0]).toFloat();
  gas = csv.substring(indices[0] + 1, indices[1]).toInt();
  chama = csv.substring(indices[1] + 1, indices[2]).toInt();
  mov = csv.substring(indices[2] + 1, indices[3]).toInt();
  vib = csv.substring(indices[3] + 1, indices[4]).toInt();
  dist = csv.substring(indices[4] + 1, indices[5]).toInt();
  timestamp = csv.substring(indices[5] + 1).toInt();
  
  return true;
}

// Envia dados ao backend
bool enviarDados(float temp, int gas, int chama, int mov, int vib, int dist) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi desconectado! Tentando reconectar...");
    WiFi.reconnect();
    return false;
  }
  
  HTTPClient http;
  http.begin(client, BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + API_KEY);
  
  // Criar JSON
  StaticJsonDocument<256> doc;
  doc["deviceId"] = DEVICE_ID;
  doc["temperatura"] = temp;
  doc["gas"] = gas;
  doc["chama"] = chama;
  doc["movimento"] = mov;
  doc["vibracao"] = vib;
  doc["distancia"] = dist;
  doc["timestamp"] = millis();
  
  String payload;
  serializeJson(doc, payload);
  
  Serial.print("Enviando: ");
  Serial.println(payload);
  
  int httpCode = http.POST(payload);
  
  if (httpCode > 0) {
    Serial.print("HTTP Response: ");
    Serial.println(httpCode);
    String response = http.getString();
    Serial.println(response);
    http.end();
    return (httpCode == 200);
  } else {
    Serial.print("Erro HTTP: ");
    Serial.println(http.errorToString(httpCode));
    http.end();
    return false;
  }
}

// ===== LOOP PRINCIPAL =====
void loop() {
  // Ler dados do Arduino via Serial
  if (Serial.available()) {
    String linha = Serial.readStringUntil('\n');
    linha.trim();
    
    if (linha == "SIA_READY") {
      Serial.println("Arduino pronto!");
      return;
    }
    
    ultimaLeitura = linha;
    Serial.print("Recebido: ");
    Serial.println(linha);
  }
  
  // Enviar dados periodicamente
  unsigned long agora = millis();
  if (agora - ultimoEnvio >= INTERVALO_ENVIO && ultimaLeitura.length() > 0) {
    ultimoEnvio = agora;
    
    float temp;
    int gas, chama, mov, vib, dist;
    unsigned long timestamp;
    
    if (parsearDados(ultimaLeitura, temp, gas, chama, mov, vib, dist, timestamp)) {
      bool sucesso = enviarDados(temp, gas, chama, mov, vib, dist);
      if (sucesso) {
        Serial.println("Dados enviados com sucesso!");
      } else {
        Serial.println("Falha ao enviar dados.");
      }
    }
  }
  
  delay(100);
}
```

---

## 🔗 5. PROTOCOLO DE COMUNICAÇÃO

### 5.1 Arduino ↔ ESP8266 (Serial)

**Formato CSV compactado:**
```
TEMPERATURA,GAS,CHAMA,MOVIMENTO,VIBRACAO,DISTANCIA,TIMESTAMP
Exemplo: 24.5,180,0,0,12,45,123456
```

**Baud Rate:** 9600 (recomendado) ou 115200 (se estável)

**Comandos ESP → Arduino:**
- `RESET` - Reinicia Arduino
- Futuramente: `CONFIG:param=value` para ajustar thresholds

### 5.2 ESP8266 ↔ Backend (HTTPS POST)

**Endpoint:** `POST /api/sensores/atualizar`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {JWT_TOKEN_ou_API_KEY}
```

**Payload JSON:**
```json
{
  "deviceId": "sia-box-01",
  "temperatura": 24.5,
  "gas": 180,
  "chama": 0,
  "movimento": 0,
  "vibracao": 12,
  "distancia": 45,
  "timestamp": 1700000000
}
```

**Response (Sucesso):**
```json
{
  "success": true,
  "message": "Dados recebidos",
  "alerta": {
    "nivel": "NORMAL",
    "mensagem": "Sistema operando normalmente"
  }
}
```

---

## 🤖 6. MOTOR DE IA HÍBRIDA

### 6.1 Análise Local (Backend - Node.js/TypeScript)

**Pipeline de Processamento:**

```typescript
// Exemplo de análise Z-score + regressão linear
interface SensorReading {
  temperatura: number;
  gas: number;
  vibracao: number;
  timestamp: number;
}

// Configurações padrão
const CONFIG = {
  windowSize: 10, // Últimas 10 amostras
  zThreshold: 2.8, // Desvio padrão
  trendThreshold: 2.0, // °C/min para temperatura
  persistence: 3 // Amostras consecutivas
};

// Calcula média
function media(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Calcula desvio padrão
function desvioPadrao(arr: number[]): number {
  const m = media(arr);
  const variancia = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length;
  return Math.sqrt(variancia);
}

// Calcula Z-score
function calcularZScore(valor: number, janela: number[]): number {
  const m = media(janela);
  const dp = desvioPadrao(janela);
  return dp === 0 ? 0 : (valor - m) / dp;
}

// Regressão linear simples (retorna coeficiente angular)
function regressaoLinear(valores: number[]): number {
  const n = valores.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = valores;
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  return slope; // Taxa de mudança por amostra
}

// Análise completa
function analisarDados(historico: SensorReading[]): {
  nivel: string;
  mensagem: string;
  causa: string;
  acao: string;
} {
  if (historico.length < CONFIG.windowSize) {
    return { nivel: "NORMAL", mensagem: "Coletando dados...", causa: "", acao: "" };
  }
  
  const janela = historico.slice(-CONFIG.windowSize);
  const ultima = janela[janela.length - 1];
  
  // REGRA CRÍTICA: Chama detectada
  if (ultima.chama === 1) {
    return {
      nivel: "CRÍTICO",
      mensagem: "INCÊNDIO DETECTADO! Evacuação imediata!",
      causa: "Sensor de chama ativado",
      acao: "Acionar alarme, desligar equipamentos, chamar bombeiros"
    };
  }
  
  // Z-score para temperatura
  const tempsJanela = janela.map(r => r.temperatura);
  const zTemp = calcularZScore(ultima.temperatura, tempsJanela);
  
  // Regressão para tendência
  const tendenciaTemp = regressaoLinear(tempsJanela);
  
  // Gás alto + vibração = Alto risco
  if (ultima.gas > 400 && ultima.vibracao > 60) {
    return {
      nivel: "ALTO",
      mensagem: "Combinação perigosa: gás elevado + vibração anormal",
      causa: "Possível vazamento próximo a equipamento vibrando",
      acao: "Verificar vazamentos, desligar motores próximos"
    };
  }
  
  // Temperatura com tendência de alta
  if (zTemp > CONFIG.zThreshold && tendenciaTemp > CONFIG.trendThreshold) {
    return {
      nivel: "PREVISÃO",
      mensagem: "Temperatura subindo rapidamente - risco de superaquecimento",
      causa: `Z-score: ${zTemp.toFixed(2)}, Tendência: +${tendenciaTemp.toFixed(2)}°C/leitura`,
      acao: "Verificar resfriamento, monitorar de perto"
    };
  }
  
  // Temperatura crítica
  if (ultima.temperatura > 50) {
    return {
      nivel: "CRÍTICO",
      mensagem: "Temperatura crítica ultrapassada",
      causa: `Temperatura: ${ultima.temperatura}°C (limite: 50°C)`,
      acao: "Parar processos, resfriar área"
    };
  }
  
  // Normal
  return {
    nivel: "NORMAL",
    mensagem: "Sistema operando normalmente",
    causa: "",
    acao: ""
  };
}
```

### 6.2 Integração LLM Remoto (Gemini via Lovable AI)

**Quando usar LLM:**
- Análise complexa de múltiplos sensores
- Geração de relatórios em linguagem natural
- Diagnóstico avançado de falhas

**Exemplo de Prompt para LLM:**

```typescript
const systemPrompt = `Você é um assistente de segurança industrial especializado.
Analise os dados dos sensores e forneça:
1. Nível de alerta (NORMAL/ATENÇÃO/ALTO/CRÍTICO)
2. Mensagem clara para operador
3. Causa provável
4. Ação recomendada
5. Confiança da análise (0-100%)

Responda APENAS em JSON no formato:
{
  "level": "NORMAL|ATENÇÃO|ALTO|CRÍTICO",
  "message": "mensagem curta",
  "cause": "causa identificada",
  "action": "ação recomendada",
  "confidence": 85
}`;

const userPrompt = `Dados dos últimos 10 minutos:
Temperatura: [24.5, 25.1, 26.3, 28.7, 31.2, 34.5, 38.1, 42.3, 46.8, 51.2]°C
Gás: [180, 185, 195, 210, 240, 280, 320, 380, 450, 520] ppm
Vibração: [12, 15, 18, 22, 28, 35, 45, 58, 72, 88] Hz
Movimento: detectado há 5 minutos
Chama: não detectada
Distância: 45cm (estável)

Analise esses dados e identifique riscos.`;

// Chamar LLM via edge function
const response = await fetch('/functions/v1/ia-analise', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ systemPrompt, userPrompt })
});
```

---

## 📊 7. EXEMPLOS DE MENSAGENS DO SISTEMA

### Categoria: NORMAL
1. "Sistema operando dentro dos parâmetros normais. Todos os sensores estáveis."
2. "Ambiente seguro. Temperatura: 24°C | Gás: 180ppm | Sem movimento detectado."
3. "Monitoramento ativo. Nenhuma anomalia detectada nas últimas 2 horas."

### Categoria: ATENÇÃO
4. "Temperatura em elevação gradual: 32°C (limite amarelo: 30°C). Monitorar."
5. "Gás combustível acima do normal: 250ppm. Verificar possível vazamento lento."
6. "Vibração anormal detectada: padrão irregular na esteira transportadora."

### Categoria: ALTO
7. "ALERTA: Temperatura 45°C + tendência crescente. Risco de superaquecimento!"
8. "Gás elevado (420ppm) próximo a equipamento vibrando. Perigo de ignição!"
9. "Múltiplas anomalias: temp 38°C, gás 350ppm, vibração 65Hz. Inspeção urgente!"

### Categoria: CRÍTICO
10. "🔥 INCÊNDIO DETECTADO! Chama identificada no setor B. EVACUAÇÃO IMEDIATA!"

### Categoria: PREVISÃO (IA)
11. "IA prevê falha em equipamento nas próximas 2h (confiança: 87%). Manutenção preventiva recomendada."
12. "Padrão de vibração indica desgaste de rolamento. Substituição sugerida antes de falha catastrófica."

---

## 🚀 8. DEPLOY E OPERAÇÕES

### 8.1 Backend (Supabase Edge Functions)

O backend já está configurado com Lovable Cloud. Para testar:

1. Acesse o dashboard do projeto
2. Navegue até Cloud → Functions
3. As edge functions são automaticamente deployadas

### 8.2 Frontend

**Deploy automático:**
- Clique em "Publish" no canto superior direito
- O frontend é automaticamente hospedado

**Custom Domain (opcional):**
- Project Settings → Domains → Connect Domain

### 8.3 Calibração de Sensores

**MQ-5 (Gás):**
- Ligar sensor em área limpa por 24-48h para pré-aquecimento
- Ajustar threshold com base em leituras ambiente (geralmente 150-200ppm normal)

**KY-026 (Chama):**
- Ajustar potenciômetro onboard para sensibilidade
- Testar com vela a 30cm de distância

**HC-SR04:**
- Evitar superfícies irregulares ou muito absorventes
- Distância confiável: 2cm - 4m

---

## ✅ 9. CHECKLIST PRÉ-APRESENTAÇÃO

- [ ] Hardware montado e alimentado corretamente
- [ ] Arduino carregado com firmware e comunicando via Serial
- [ ] ESP8266 conectado ao WiFi e enviando dados
- [ ] Backend recebendo e processando dados
- [ ] Frontend exibindo dashboard em tempo real
- [ ] LEDs indicadores funcionando
- [ ] Buzzer respondendo a alertas críticos
- [ ] Gráficos atualizando a cada 3-5 segundos
- [ ] Histórico de alertas sendo registrado
- [ ] Testar cenário de emergência (simular chama)
- [ ] Backup de código e banco de dados

---

## 🔧 10. TROUBLESHOOTING COMUM

### Problema: Sensor de chama disparando falsamente
**Solução:** Ajustar potenciômetro do KY-026 para reduzir sensibilidade.

### Problema: ESP8266 não conecta ao WiFi
**Soluções:**
- Verificar SSID e senha
- Confirmar que WiFi é 2.4GHz (ESP não suporta 5GHz)
- Aumentar tentativas de conexão no código

### Problema: Leituras de gás sempre altas
**Solução:** Aguardar pré-aquecimento do MQ-5 (24-48h). Calibrar em ambiente limpo.

### Problema: Backend não recebe dados
**Soluções:**
- Verificar URL do backend no firmware ESP8266
- Confirmar que API key/JWT está correta
- Testar endpoint manualmente com curl ou Postman

---

## 📚 11. PRÓXIMOS PASSOS E EXTENSIBILIDADE

- **Adicionar sensores:** Modificar código Arduino para novos pinos
- **Multi-dispositivos:** Criar deviceId único para cada SIA Box
- **Notificações push:** Integrar com Firebase Cloud Messaging
- **Machine Learning offline:** Implementar TinyML no ESP32
- **Gráficos avançados:** Adicionar heatmaps e correlações
- **Integração ERP:** APIs para conectar com sistemas existentes

---

## 📞 SUPORTE

Para dúvidas ou problemas, consulte:
- Documentação Lovable: https://docs.lovable.dev
- Arduino Reference: https://www.arduino.cc/reference
- ESP8266 Docs: https://arduino-esp8266.readthedocs.io

---

**Versão:** 1.0  
**Data:** 2024  
**Licença:** MIT  
**Equipe:** SIA - Security Industrial Assistant
