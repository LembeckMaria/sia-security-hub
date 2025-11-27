# 🛡️ SIA - Security Industrial Assistant

## Sistema IoT Industrial Completo com IA Híbrida

**MVP Funcional End-to-End** - Monitoramento inteligente para ambientes industriais com previsão de acidentes.

---

## 🎯 O Que Foi Implementado

### ✅ Frontend Web Profissional
- **Landing Page** com identidade visual metálica industrial
- **Dashboard** em tempo real com 6 sensores monitorados
- **Página de Alertas** com histórico e filtros
- **Configurações** para ajustar limites de cada sensor
- **Autenticação** (preparado para backend)
- Design responsivo com paleta azul petróleo + cinza aço + dourado

### ✅ Backend Completo (Lovable Cloud)
- **Database** com tabelas:
  - `devices` - Dispositivos SIA Box
  - `sensor_readings` - Leituras dos sensores
  - `alerts` - Histórico de alertas
  - `device_config` - Configurações de limites
- **Edge Function** `/sensores-update` para receber dados do ESP8266
- **Análise de IA Local** com regras preditivas
- **Realtime** via WebSocket para atualizações instantâneas
- **RLS Policies** para segurança

### ✅ Documentação Técnica Completa
- **Firmware Arduino** completo (sketch .ino)
- **Firmware ESP8266** com WiFi e HTTPS
- **Protocolo de comunicação** Serial + HTTP
- **Diagrama de ligação** de todos os sensores
- **Motor de IA híbrida** (Z-score + regressão)
- **Troubleshooting** e calibração de sensores

---

## 🚀 Como Usar

### 1. **Frontend Web** (Já Funcionando)

Acesse as páginas:
- `/` - Landing page com apresentação do SIA
- `/dashboard` - Dashboard com sensores simulados
- `/alertas` - Histórico de alertas
- `/configuracoes` - Ajustar limites dos sensores
- `/auth` - Login/Cadastro (preparado para integração)

### 2. **Testar Backend**

O backend está ativo! Para enviar dados simulados ao backend:

```bash
curl -X POST https://njkxnyudzqfyhbiszhnr.supabase.co/functions/v1/sensores-update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qa3hueXVkenFmeWhiaXN6aG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMzk0ODAsImV4cCI6MjA3OTgxNTQ4MH0.ZNiiWB6a3rGb4jhAyFw3HOEHkcWVr0-k4hUJpmiCfkg" \
  -d '{
    "deviceId": "sia-box-01",
    "temperatura": 45.5,
    "gas": 380,
    "chama": 0,
    "movimento": 1,
    "vibracao": 65,
    "distancia": 25,
    "timestamp": 1700000000
  }'
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "Dados recebidos",
  "alerta": {
    "nivel": "ALTO",
    "mensagem": "Temperatura elevada detectada",
    "causa": "Temperatura: 45.5°C",
    "acao": "Verificar resfriamento"
  }
}
```

### 3. **Implementar Hardware**

Siga a documentação técnica completa em **`DOCS_TECNICA_SIA.md`**:
- Lista de componentes necessários
- Diagrama de ligação (pinos)
- Firmware Arduino completo
- Firmware ESP8266 completo
- Calibração de sensores

**ATENÇÃO:** Edite as credenciais WiFi e URL do backend no firmware ESP8266:
```cpp
const char* WIFI_SSID = "SUA_REDE";
const char* WIFI_PASSWORD = "SUA_SENHA";
const char* BACKEND_URL = "https://njkxnyudzqfyhbiszhnr.supabase.co/functions/v1/sensores-update";
```

---

## 🔧 Arquitetura do Sistema

```
┌─────────────────┐
│  Arduino Nano   │ ← Lê 6 sensores (DHT11, MQ-5, HC-SR04, etc)
│  + Sensores     │
└────────┬────────┘
         │ Serial (CSV)
         ↓
┌─────────────────┐
│   ESP8266       │ ← WiFi + HTTPS POST
│  (NodeMCU)      │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────────────────────┐
│  Backend (Lovable Cloud)        │
│  - Edge Function (IA Local)     │ ← Análise Z-score + regras
│  - Database (PostgreSQL)        │
│  - Realtime (WebSocket)         │
└────────┬────────────────────────┘
         │ WebSocket
         ↓
┌─────────────────┐
│  Frontend Web   │ ← React + Tailwind + Chart.js
│  (Dashboard)    │
└─────────────────┘
```

---

## 📊 Níveis de Alerta

| Nível | Condição | Ação |
|-------|----------|------|
| **NORMAL** | Todos os parâmetros OK | Monitoramento contínuo |
| **ATENÇÃO** | Temp > 30°C OU Gás > 250ppm | Monitorar de perto |
| **ALTO** | Temp > 40°C OU Gás > 350ppm | Inspeção urgente |
| **CRÍTICO** | Chama detectada OU Temp > 50°C | Evacuação imediata |
| **PREVISÃO** | IA detecta anomalia | Manutenção preventiva |

---

## 🎨 Design System

### Paleta de Cores (HSL)
- **Azul Petróleo**: `200, 70%, 18%` - Cor primária
- **Cinza Aço**: `210, 10%, 12%` - Secundária
- **Inox**: `210, 15%, 84%` - Muted
- **Dourado Metálico**: `42, 48%, 56%` - Accent
- **Branco Gelo**: `210, 20%, 97%` - Background

### Componentes Customizados
- Gradientes metálicos
- Sombras industriais
- Animações suaves
- Cards com border-gradient

---

## 📡 API Endpoints

### POST `/functions/v1/sensores-update`
Recebe dados do ESP8266 e processa com IA local.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer {ANON_KEY}
```

**Body:**
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

---

## 🔐 Segurança

- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de leitura pública para demo
- ✅ Políticas de escrita protegidas
- ✅ Edge functions com validação
- ✅ HTTPS para comunicação ESP8266

---

## 🧠 Motor de IA Híbrida

### Análise Local (Backend)
1. **Z-Score**: Detecta anomalias por desvio padrão
2. **Regressão Linear**: Prevê tendências
3. **Regras Críticas**: Chama, temperatura, gás
4. **Janela Deslizante**: 10 amostras padrão

### Integração LLM (Opcional)
- Via Lovable AI (Gemini/GPT)
- Para análise complexa e diagnósticos
- Geração de relatórios em linguagem natural

---

## 📚 Próximos Passos

### Curto Prazo
- [ ] Implementar autenticação real
- [ ] Adicionar gráficos Chart.js no dashboard
- [ ] Exportar histórico CSV/PDF
- [ ] Push notifications

### Médio Prazo
- [ ] Integração com LLM para análise avançada
- [ ] Suporte multi-dispositivos
- [ ] Dashboard mobile (PWA)
- [ ] TinyML no ESP32

### Longo Prazo
- [ ] Machine Learning offline
- [ ] Integração com ERPs
- [ ] Certificação ISO
- [ ] Comercialização

---

## 🆘 Suporte

**Documentação:**
- `DOCS_TECNICA_SIA.md` - Documentação técnica completa
- `README_SIA.md` - Este arquivo
- [Lovable Docs](https://docs.lovable.dev)

**Troubleshooting:**
- Sensor de chama disparando: Ajustar potenciômetro
- ESP8266 não conecta WiFi: Verificar 2.4GHz
- Backend não recebe dados: Verificar URL e API key

---

## 📄 Licença

MIT License - Projeto SIA Team 2024

---

## 🎉 Status do MVP

✅ **Frontend**: Completo e funcional  
✅ **Backend**: Cloud ativo com edge functions  
✅ **Database**: Schema completo com RLS  
✅ **Documentação**: Técnica completa com firmware  
✅ **Design**: Identidade visual metálica industrial  

🚧 **Hardware**: Aguardando montagem física  
🚧 **Autenticação**: Preparado (aguardando ativação)  
🚧 **Gráficos**: Dados simulados (pronto para Chart.js)  

**O sistema está pronto para demo e testes reais!** 🚀
