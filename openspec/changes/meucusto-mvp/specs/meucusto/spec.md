# Spec: Meu Custo — MVP v1.1

**Versão:** 1.1 (pós-revisão de segurança)
**Changelog v1.1:** +REQ-008 (Segurança), +REQ-009 (Precisão Financeira), +REQ-010 (Resiliência), +REQ-011 (Versionamento)

## Requirements

### REQ-001: Calculadora de Valor Hora
O sistema deve permitir que o usuário calcule seu valor/hora real baseado em salário desejado, custos empresariais e taxas fixas.

**Campos:**
- Salário líquido desejado (R$/mês)
- Custo CNPJ/MEI mensal (contador, mensalidade MEI, etc.)
- Taxas fixas mensais (aluguel, energia, internet, software)
- Total de horas trabalhadas por mês

**Fórmula:** `Valor Hora = (Salário + CNPJ + Taxas) / Horas por mês`

**Scenarios:**

- **Given** usuário está na tela de Valor Hora
- **When** preenche salário R$ 5.000, CNPJ R$ 200, taxas R$ 800, 160h/mês
- **Then** o sistema exibe: Valor Hora = R$ 37,50

- **Given** usuário já salvou Valor Hora anteriormente
- **When** acessa a calculadora de produto
- **Then** o Valor Hora salvo é usado automaticamente no cálculo de mão de obra

- **Given** usuário modifica qualquer campo
- **When** todos os campos estão preenchidos
- **Then** o resultado recalcula em tempo real (sem botão "Calcular")

### REQ-002: Calculadora de Produto/Serviço
O sistema deve permitir criar produtos ou serviços com insumos detalhados, calculando custo, margem bruta e líquida.

**Campos do produto:**
- Nome (obrigatório)
- Tipo: produto físico / serviço (obrigatório)
- Preço de venda (obrigatório)
- Categoria (opcional)
- Imagem (opcional)

**Campos do insumo:**
- Nome (obrigatório)
- Quantidade (obrigatório)
- Unidade: m², m linear, cm², cm linear, kg, g, unidade (obrigatório)
- Custo unitário por unidade (obrigatório)
- Altura e largura (opcional, para cálculo de área)
- Tempo de trabalho: horas e minutos (opcional)

**Fórmulas:**
- `Custo insumo = Quantidade × Custo unitário`
- `Custo área = (Altura × Largura) / fator_conversão × Custo unitário` (para m², cm²)
- `Custo mão de obra = (Horas + Minutos/60) × Valor Hora`
- `Custo total direto = Soma(custos insumos) + Custo mão de obra`
- `Margem bruta = ((Preço venda − Custo total direto) / Preço venda) × 100`
- `Margem líquida = ((Preço venda − Custo total direto − Rateios proporcionais) / Preço venda) × 100`

**Scenarios:**

- **Given** usuário cria um produto "Bolsa de Couro"
- **When** adiciona insumo "Couro" 0.5 m² a R$ 80/m², "Fecho" 2 un a R$ 15/un, mão de obra 3h, Valor Hora R$ 37,50
- **Then** custo total = R$ 40 + R$ 30 + R$ 112,50 = R$ 182,50

- **Given** produto com preço R$ 300 e custo direto R$ 182,50
- **When** rateios fixos do mês = R$ 1.000 e usuário vende ~10 produtos/mês
- **Then** margem bruta = 39,2% e margem líquida ≈ 35,8% (considerando rateio de R$ 100 por produto)

- **Given** usuário adiciona insumo com altura 50cm × largura 30cm
- **When** unidade é cm² e custo R$ 0,05/cm²
- **Then** custo área = (50 × 30) × 0,05 = R$ 75,00

### REQ-003: Imagens de Produto
O sistema deve permitir upload opcional de imagem do produto, com conversão automática para WebP e ícone padrão quando ausente.

**Scenarios:**

- **Given** usuário faz upload de imagem JPEG 2MB
- **When** a imagem é processada
- **Then** o sistema converte para WebP (qualidade 80%, máx 1200px), armazena no Supabase Storage e descarta a original

- **Given** usuário NÃO faz upload de imagem
- **When** o produto é salvo
- **Then** o sistema aplica ícone padrão SVG amigável (categoria genérica com cor pastel, borda arredondada)

- **Given** upload de arquivo > 5MB ou formato inválido
- **When** o usuário tenta fazer upload
- **Then** o sistema exibe erro: "Imagem deve ter até 5MB nos formatos JPG, PNG ou WebP"

- **Given** usuário remove imagem existente
- **When** confirma remoção
- **Then** o ícone padrão é restaurado (imagem anterior deletada do Storage)

### REQ-004: Persistência e Sincronização
O sistema deve salvar dados localmente e opcionalmente sincronizar com Supabase quando o usuário fizer login.

**Scenarios:**

- **Given** usuário NÃO está logado
- **When** salva um produto
- **Then** o produto é persistido em localStorage e sobrevive a reload da página

- **Given** usuário faz login com Google
- **When** já tem produtos em localStorage
- **Then** o sistema pergunta: "Deseja sincronizar seus dados com a nuvem?" e migra ao confirmar

- **Given** usuário está logado e cria novo produto
- **When** salva
- **Then** o produto é salvo diretamente no Supabase (não mais no localStorage)

- **Given** usuário limpa dados do navegador sem estar logado
- **When** abre o app novamente
- **Then** todos os dados são perdidos (aviso exibido no primeiro acesso)

### REQ-005: Dashboard de Comparação
O sistema deve exibir dashboard com ranking de produtos por margem e esforço, ajudando o usuário a decidir onde focar.

**Indicadores visuais:**
- 🟢 **FOCO** — Alta margem, baixo esforço → priorizar venda
- 🟡 **REPRECIFICAR** — Baixa margem, baixo esforço → subir preço
- 🟠 **REVISAR** — Alta margem, alto esforço → otimizar processo
- 🔴 **EVITAR** — Baixa margem, alto esforço → descontinuar ou reformular

**Scenarios:**

- **Given** usuário tem 3+ produtos salvos
- **When** acessa o Dashboard
- **Then** vê cards dos produtos ordenados por margem líquida decrescente

- **Given** produto tem margem líquida > 40% e tempo < 2h
- **When** o dashboard renderiza
- **Then** o card exibe selo 🟢 FOCO com destaque visual

- **Given** usuário clica em "Comparar cenários"
- **When** seleciona um produto com múltiplos cenários
- **Then** tabela lado a lado mostra preço, custo, margem para cada cenário

### REQ-006: Múltiplos Cenários por Produto
O sistema deve permitir criar cenários alternativos para um mesmo produto (ex: "preço +10%", "fornecedor mais barato").

**Scenarios:**

- **Given** usuário está na tela do produto "Bolsa de Couro" (preço R$ 300)
- **When** clica "+ Novo Cenário" e nomeia "Preço Premium R$ 350"
- **Then** o cenário herda todos os insumos do original com preço alterado para R$ 350

- **Given** usuário ajusta um insumo no cenário
- **When** salva o cenário
- **Then** o cenário base (original) NÃO é alterado

### REQ-007: Design Visual — Estilo Stripe Dark
O sistema deve seguir design system escuro com gradientes, glassmorphism e animações sutis.

**Especificações:**
- Fundo: `#0a0a0f` (quase preto)
- Cards: `#1a1a2e` com borda sutil `rgba(255,255,255,0.05)`
- Gradiente accent: `#6366f1` → `#8b5cf6` (indigo → violeta)
- Tipografia: Inter (Google Fonts)
- Glassmorphism: `backdrop-blur-md bg-white/5` nos modais
- Animações: números contando (count-up), hover com `translateY(-2px)`, transições 200ms ease

**Scenarios:**

- **Given** usuário acessa o app pela primeira vez
- **When** a página carrega
- **Then** vê fundo escuro com gradiente sutil no hero, cards com efeito glass

- **Given** dark mode é o padrão
- **When** usuário navega por qualquer tela
- **Then** não há toggle de tema — o app é sempre dark

### REQ-008: Segurança e Proteção de Dados
O sistema deve proteger dados do usuário e impedir vetores de ataque comuns em aplicações web.

**Scenarios:**

- **Given** requisição para `/api/upload-image`
- **When** o arquivo enviado não é JPG/PNG/WebP por magic number
- **Then** o servidor rejeita com 400 "Formato não permitido" (validação server-side, não apenas cliente)

- **Given** requisição para `/api/auth/callback`
- **When** o parâmetro `state` não confere com o armazenado no cookie
- **Then** o servidor rejeita com 403 "CSRF detectado" e loga o incidente

- **Given** usuário insere `<script>alert(1)</script>` no nome do produto
- **When** o texto é renderizado no Dashboard
- **Then** o sistema sanitiza e exibe texto puro, sem executar JavaScript (DOMPurify)

- **Given** qualquer query ao Supabase via anon key
- **When** Row Level Security está ativa
- **Then** usuário só acessa registros onde `user_id = auth.uid()` (suas próprias linhas)

- **Given** Storage bucket `produto-imagens`
- **When** configurada política de acesso
- **Then** paths seguem padrão `{user_id}/{produto_id}.webp`, sem listagem pública

### REQ-009: Precisão Financeira
Todos os cálculos monetários devem usar precisão decimal exata, sem erros de ponto flutuante.

**Scenarios:**

- **Given** cálculo de custo: R$ 0,10 × 3 unidades
- **When** implementado com Decimal.js
- **Then** resultado é exatamente R$ 0,30 (não 0.30000000000000004)

- **Given** margem líquida = ((300 − 182,50 − 18,25) / 300) × 100
- **When** calculado com Decimal.js (precisão 2 casas)
- **Then** resultado = 33,08% (não 33.083333333333336)

### REQ-010: Resiliência e Recuperação
O sistema deve proteger contra perda de dados e oferecer mecanismos de recuperação.

**Scenarios:**

- **Given** usuário deleta um produto
- **When** confirma a exclusão
- **Then** o registro é soft-deleted (`deleted_at = now()`), não removido fisicamente

- **Given** usuário clica em "Exportar Backup"
- **When** tem produtos salvos
- **Then** faz download de arquivo JSON com todos os dados (produtos, insumos, valor hora, cenários)

- **Given** sync com Supabase falha (timeout 10s ou erro de rede)
- **When** usuário salva produto
- **Then** sistema salva no localStorage como fallback, exibe toast "Salvo localmente. Sincronizaremos quando a conexão voltar.", e agenda retry com backoff exponencial (1s, 2s, 4s, 8s)

- **Given** dados no localStorage e no Supabase divergem
- **When** usuário faz login
- **Then** sistema exibe modal de conflito: "Você tem X itens locais e Y na nuvem. Qual manter?" com opções "Manter nuvem", "Manter local", "Mesclar"

### REQ-011: Versionamento de Schema
O sistema deve versionar a estrutura de dados para permitir migrações futuras sem perda.

**Scenarios:**

- **Given** schema localStorage versão 1
- **When** app atualiza para versão 2 com novos campos obrigatórios
- **Then** função de migração transforma dados antigos automaticamente, sem perda

- **Given** tabela `produtos` ganha coluna `moeda` em migração futura
- **When** migration SQL é executada
- **Then** registros existentes recebem valor padrão 'BRL'

## Edge Cases

- **Valor Hora não configurado:** Se usuário acessa calculadora de produto sem ter salvo Valor Hora, o campo "mão de obra" mostra "Configure seu Valor Hora primeiro" com link
- **Divisão por zero:** Se horas por mês = 0, Valor Hora = "—" com tooltip "Informe suas horas trabalhadas"
- **localStorage cheio:** Se localStorage atinge cota (5-10MB), exibir aviso e sugerir login para usar Supabase
- **Imagem corrompida:** Se conversão WebP falhar, manter miniatura da original e logar erro no Sentry
- **Browser sem suporte a WebP:** Fallback para JPEG com qualidade 85% (Safari < 14, IE)
- **Rateio fixo distribuído:** Se usuário não informa quantos produtos vende/mês, badge "Sem rateio" é exibido e margem líquida = margem bruta
- **Muitos insumos:** Limitar a 30 insumos por produto com virtualização se necessário
- **Sync offline:** Dados sempre salvos localmente primeiro. Sync com Supabase é assíncrono, com retry e notificação de falha
- **Conflito de merge:** Ao logar, se dados locais e remotos divergem, exibir modal de resolução
- **Arquivo malicioso:** Validação server-side por magic number + extensão. Arquivos suspeitos são rejeitados e logados
- **CSRF no OAuth:** State parameter obrigatório, validado contra cookie httpOnly
