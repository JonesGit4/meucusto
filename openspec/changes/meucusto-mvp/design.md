# Design: Meu Custo — MVP v1.1

**Versão:** 1.1 (pós-revisão de segurança)
**Changelog v1.1:** RLS, CSRF, sanitização, Decimal.js, soft-delete, versionamento schema, backup JSON, observabilidade, rate-limiting, storage policy, feature flag

## Approach

Aplicação Next.js 15 App Router, **totalmente client-side no MVP** (sem SSR obrigatório — os cálculos são todos no navegador). localStorage como camada primária de persistência, Supabase como camada de sincronização opcional pós-login.

### Por que client-side primeiro?

- Cálculos são instantâneos (sem round-trip ao servidor)
- MVP sem login obrigatório = localStorage ideal
- Migração suave: ao logar, os dados sobem para o Supabase
- Next.js API Routes apenas para: upload de imagem (com validação server-side), proxy Supabase Storage, callback OAuth (com CSRF), health check

### Stack de Segurança

| Camada | Tecnologia | Propósito |
|--------|-----------|-----------|
| Sanitização | DOMPurify | Prevenir XSS em inputs de texto |
| CSRF | cookie httpOnly + state param | Proteger OAuth callback |
| Upload validation | magic-number + mimetype (server-side) | Bloquear arquivos maliciosos |
| RLS | Supabase Row Level Security | Isolar dados por usuário |
| Rate limiting | Kong (já existe no supabase-wacrm) | Limitar tentativas de auth |
| Observabilidade | Sentry | Logar erros de sync e upload |
| Precisão | Decimal.js | Evitar erros de ponto flutuante |

## Architecture

```
┌─────────────────────────────────────────────────┐
│                    VERCEL                        │
│  ┌───────────────────────────────────────────┐  │
│  │         Next.js 15 App Router              │  │
│  │                                            │  │
│  │  / (home)           → Dashboard            │  │
│  │  /valor-hora        → ValorHoraPage        │  │
│  │  /produtos          → ListaProdutos        │  │
│  │  /produtos/novo     → NovoProduto          │  │
│  │  /produtos/[id]     → EditarProduto        │  │
│  │  /api/upload-image  → Conversão WebP       │  │
│  │  /api/auth/callback → OAuth callback       │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
        localStorage         Supabase Self-Hosted
        (dados locais)       (manager1, stack supabase-wacrm)
                             ├─ Schema: meucusto
                             ├─ Auth: Google OAuth
                             └─ Storage: imagens WebP
```

## Component Tree

```
Layout (DarkTheme, Inter font)
├─ HomePage (Dashboard)
│   ├─ ValorHoraCard (resumo do valor/hora)
│   ├─ ProdutoCard[] (grid de produtos)
│   │   ├─ ProdutoImage (WebP ou ícone padrão)
│   │   ├─ MargemIndicator (🟢🟡🟠🔴)
│   │   └─ CenariosDropdown
│   └─ EmptyState (quando 0 produtos)
│
├─ ValorHoraPage
│   ├─ SalarioInput
│   ├─ CustosFixosInput
│   ├─ HorasMesInput
│   └─ ResultadoDisplay (cálculo em tempo real)
│
├─ ProdutoFormPage (novo/editar)
│   ├─ NomeCategoriaInput
│   ├─ ImageUploader (drag & drop, preview, conversão)
│   ├─ InsumoList (dinâmico, add/remove)
│   │   └─ InsumoRow (nome, qtd, unidade, custo, altura, largura, tempo)
│   ├─ PrecoVendaInput
│   ├─ MargemPreview (bruta + líquida, recalcula ao vivo)
│   └─ CenariosSection (lista de cenários alternativos)
│
└─ AuthButton (Google login, canto superior direito)
```

## Data Flow

### localStorage Schema

```typescript
interface LocalDB {
  valorHora: {
    salario: number
    custoCnpj: number
    taxasFixas: number
    horasMes: number
  } | null
  produtos: Produto[]
  versao: number  // para migração futura
}
```

### Supabase Schema (schema: meucusto)

```sql
CREATE SCHEMA IF NOT EXISTS meucusto;

-- ═══════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════
-- Todas as tabelas são isoladas por user_id = auth.uid()

CREATE TABLE meucusto.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  nome TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE meucusto.valor_hora (
  user_id UUID REFERENCES meucusto.profiles(id) PRIMARY KEY,
  salario DECIMAL(10,2) NOT NULL,
  custo_cnpj DECIMAL(10,2) DEFAULT 0,
  taxas_fixas DECIMAL(10,2) DEFAULT 0,
  horas_mes INTEGER NOT NULL DEFAULT 160,
  moeda TEXT DEFAULT 'BRL',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE meucusto.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES meucusto.profiles(id),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('fisico', 'servico')),
  preco_venda DECIMAL(10,2) NOT NULL,
  categoria TEXT,
  imagem_url TEXT,
  moeda TEXT DEFAULT 'BRL',
  schema_version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ  -- soft delete
);

CREATE TABLE meucusto.insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES meucusto.produtos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  quantidade DECIMAL(10,4) NOT NULL,
  unidade TEXT NOT NULL CHECK (unidade IN ('m2', 'm_linear', 'cm2', 'cm_linear', 'kg', 'g', 'unidade')),
  custo_unitario DECIMAL(10,4) NOT NULL,
  altura DECIMAL(10,2),
  largura DECIMAL(10,2),
  tempo_horas DECIMAL(4,2) DEFAULT 0,
  ordem INTEGER DEFAULT 0,
  deleted_at TIMESTAMPTZ  -- soft delete
);

CREATE TABLE meucusto.cenarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES meucusto.produtos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  preco_venda DECIMAL(10,2) NOT NULL,
  insumos_override JSONB DEFAULT '[]',
  moeda TEXT DEFAULT 'BRL',
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ  -- soft delete
);

-- ═══════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════

-- profiles: usuário vê apenas seu próprio perfil
ALTER TABLE meucusto.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_self ON meucusto.profiles
  FOR ALL USING (id = auth.uid());

-- valor_hora: usuário vê/edita apenas seu próprio registro
ALTER TABLE meucusto.valor_hora ENABLE ROW LEVEL SECURITY;
CREATE POLICY vh_self ON meucusto.valor_hora
  FOR ALL USING (user_id = auth.uid());

-- produtos: usuário vê apenas seus produtos não deletados
ALTER TABLE meucusto.produtos ENABLE ROW LEVEL SECURITY;
CREATE POLICY produtos_self ON meucusto.produtos
  FOR ALL USING (user_id = auth.uid() AND deleted_at IS NULL);

-- insumos: herdado via produto (RLS indireta via FK)
ALTER TABLE meucusto.insumos ENABLE ROW LEVEL SECURITY;
CREATE POLICY insumos_self ON meucusto.insumos
  FOR ALL USING (
    produto_id IN (
      SELECT id FROM meucusto.produtos
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- cenarios: herdado via produto
ALTER TABLE meucusto.cenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY cenarios_self ON meucusto.cenarios
  FOR ALL USING (
    produto_id IN (
      SELECT id FROM meucusto.produtos
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- ═══════════════════════════════════════
-- STORAGE POLICY
-- ═══════════════════════════════════════
-- Bucket: produto-imagens
-- Path: {user_id}/{produto_id}.webp
-- Política: usuário só acessa seu próprio path, sem listagem pública
```

## Design Decisions

### 1. localStorage primeiro, Supabase depois
- **Trade-off:** Risco de perda de dados vs zero fricção no onboarding
- **Decisão:** localStorage MVP. Aviso no footer: "Seus dados ficam salvos neste navegador. Faça login para sincronizar na nuvem."
- **Migração:** Ao logar via Google, o sistema detecta dados locais e oferece migração com 1 clique
- **Conflito:** Se dados locais e remotos divergem ao logar, modal de resolução com opções "Manter nuvem", "Manter local", "Mesclar"
- **Sync offline:** Salva localmente primeiro, sincroniza em background. Em caso de falha (timeout 10s), retry com backoff exponencial (1s, 2s, 4s, 8s) e toast informativo

### 2. Conversão WebP no cliente (Canvas API)
- **Trade-off:** Upload direto vs conversão antes do upload
- **Decisão:** Converter no navegador usando Canvas API + `toBlob('image/webp', 0.8)`. Sobe apenas o WebP para o Supabase Storage.
- **Limite:** 5MB. Validação DUPLA: cliente (extensão + tamanho) + servidor (magic number + mimetype via `file-type`).
- **Fallback:** JPEG com qualidade 85% se browser não suportar WebP

### 3. Ícone padrão SVG inline memoizado
- Ícone SVG com gradiente circular, borda arredondada 16px, cor pastel aleatória (6 opções pré-definidas)
- Exibido como placeholder antes do upload e quando não há imagem
- Nunca armazenado — gerado no momento da renderização
- Componente memoizado com `React.memo` para evitar re-renderizações

### 4. Cálculos com Decimal.js
- **Decisão:** Toda operação monetária usa `Decimal` do pacote `decimal.js` (precisão configurável, padrão 2 casas)
- **Por quê:** `number` do JavaScript causa erros de ponto flutuante (ex: `0.1 + 0.2 = 0.30000000000000004`)
- Performance: mesmo com 30 insumos, cálculos com Decimal.js são < 15ms — aceitável
- `useMemo` para evitar recálculos desnecessários

### 5. Segurança em camadas
- **Sanitização:** DOMPurify em todos os inputs de texto antes do render (nome do produto, insumo, categoria)
- **CSRF:** OAuth callback usa cookie `httpOnly` + parâmetro `state` validado server-side
- **Upload:** API route valida magic number (não confia no `Content-Type` do cliente)
- **RLS:** Row Level Security em todas as tabelas — `user_id = auth.uid()`
- **Storage:** Bucket com política por path `{user_id}/{produto_id}.webp`, sem listagem pública
- **Rate limiting:** Kong no supabase-wacrm já provê rate limiting na Auth (reaproveitar config existente)
- **HTTPS:** Vercel força HTTPS automaticamente

### 6. Soft-delete em todas as entidades
- Registros nunca são removidos fisicamente — ganham `deleted_at = now()`
- API e queries sempre filtram `WHERE deleted_at IS NULL`
- Recuperação: expor "Lixeira" com opção de restaurar em versão futura

### 7. Versionamento de schema
- `LocalDB.versao` no localStorage (começa em 1)
- `produtos.schema_version` no PostgreSQL (começa em 1)
- Função `migrateLocalDB(from, to)` transforma dados entre versões
- Campo `moeda` já previsto para internacionalização futura

### 8. Backup manual (export JSON)
- Botão "Exportar Backup" no footer/settings
- Download de arquivo `.json` com estrutura completa: `{ versao, data_exportacao, valorHora, produtos: [...] }`
- Sem import automático no MVP (manual via suporte), mas estrutura compatível com import futuro

### 9. Feature Flag ENABLE_SYNC
- Variável `NEXT_PUBLIC_ENABLE_SYNC` (default: `true`)
- Quando `false`, oculta botão de login e desabilita chamadas ao Supabase
- Permite desligar sync remoto sem redeploy

### 10. Observabilidade com Sentry
- `@sentry/nextjs` configurado no `layout.tsx`
- Captura: erros de sync, falhas de upload, exceções não tratadas
- Não captura: dados do localStorage (PII)
- DSN via variável de ambiente `NEXT_PUBLIC_SENTRY_DSN` (opcional)

## Dependencies

- **next** 15.x
- **tailwindcss** 4.x
- **@supabase/supabase-js** (auth + storage + db)
- **@supabase/ssr** (para server components se necessário)
- **lucide-react** (ícones)
- **decimal.js** (precisão financeira — NUNCA usar `number` para dinheiro)
- **dompurify** (sanitização de inputs contra XSS)
- **react-dropzone** (upload de imagem com drag & drop)
- **file-type** (validação server-side de magic number no upload)
- **@sentry/nextjs** (observabilidade — opcional, via feature flag)
- Sem dependências de UI library — Tailwind puro com design system próprio

## Visual Design Tokens

```css
:root {
  --bg-primary: #0a0a0f;
  --bg-card: #1a1a2e;
  --bg-card-hover: #1f1f35;
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-active: rgba(99, 102, 241, 0.3);
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --accent-start: #6366f1;
  --accent-end: #8b5cf6;
  --success: #22c55e;
  --warning: #eab308;
  --danger: #ef4444;
  --font-sans: 'Inter', system-ui, sans-serif;
}
```

## Responsive Design

- Mobile-first com breakpoints Tailwind padrão
- Dashboard: 1 coluna mobile, 2 colunas tablet, 3 colunas desktop
- Formulários: stack vertical mobile, side-by-side desktop
- Navegação: bottom tab bar no mobile, sidebar no desktop
