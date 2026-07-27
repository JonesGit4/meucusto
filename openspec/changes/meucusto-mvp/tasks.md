# Tasks: Meu Custo — MVP v1.1

**Versão:** 1.1 (pós-revisão de segurança)

## Fase 1: Setup do Projeto

- [ ] 1.1 Criar repo GitHub `JonesGit4/meucusto` com README e .gitignore
- [ ] 1.2 Inicializar Next.js 15 com TypeScript e Tailwind CSS 4
- [ ] 1.3 Configurar ESLint + Prettier (padrão DuoBro)
- [ ] 1.4 Criar estrutura de pastas: `app/`, `components/`, `lib/`, `hooks/`, `types/`
- [ ] 1.5 Configurar fonte Inter no `layout.tsx`
- [ ] 1.6 Criar design tokens globais no `globals.css` (cores, gradientes, glassmorphism)
- [ ] 1.7 Instalar dependências: `@supabase/supabase-js`, `decimal.js`, `dompurify`, `react-dropzone`, `file-type`, `@sentry/nextjs`
- [ ] 1.8 Configurar Sentry no `layout.tsx` (condicional via `NEXT_PUBLIC_SENTRY_DSN`)
- [ ] 1.9 Criar schema `meucusto` no PostgreSQL self-hosted COM RLS (tabelas + políticas + storage policy)
- [ ] 1.10 Configurar Kong rate limiting para rota `/auth/v1/*` no supabase-wacrm

## Fase 2: Infraestrutura de Dados

- [ ] 2.1 Criar types TypeScript: `Produto`, `Insumo`, `ValorHora`, `Cenario`, `LocalDB`
- [ ] 2.2 Criar hook `useLocalDB` — leitura/escrita em localStorage com schema versionado (`versao: 1`)
- [ ] 2.3 Criar função `migrateLocalDB(from, to)` para migrações futuras de schema
- [ ] 2.4 Criar hook `useSupabase` — cliente auth + storage + db
- [ ] 2.5 Criar utilitário `storage.ts` — adapter que escolhe localStorage ou Supabase conforme estado de auth, com retry e backoff exponencial
- [ ] 2.6 Criar utilitário `sync.ts` — lógica de sync offline-first: salva local → tenta Supabase → fallback com toast "Salvo localmente" → retry (1s, 2s, 4s, 8s) → Sentry se falha permanente
- [ ] 2.7 Criar utilitário `calculos.ts` — funções puras com **Decimal.js**: custoInsumo, custoArea, margemBruta, margemLiquida, valorHoraCalculator
- [ ] 2.8 Criar utilitário `classificacao.ts` — matriz margem×esforço (🟢🟡🟠🔴)
- [ ] 2.9 Criar utilitário `formatters.ts` — moeda BRL, porcentagem, tempo (usando Decimal.js)
- [ ] 2.10 Criar utilitário `sanitize.ts` — wrapper do DOMPurify para todos os inputs de texto
- [ ] 2.11 Criar utilitário `backup.ts` — export JSON completo para download

## Fase 3: Módulo Valor Hora

- [ ] 3.1 Criar página `/valor-hora` com formulário
- [ ] 3.2 Criar componente `ValorHoraForm` — inputs para salário, CNPJ, taxas, horas/mês
- [ ] 3.3 Implementar cálculo em tempo real (sem botão submit)
- [ ] 3.4 Criar componente `ValorHoraResult` — exibição do valor/hora calculado
- [ ] 3.5 Salvar/carregar do localStorage automaticamente
- [ ] 3.6 Exibir resumo do Valor Hora no header/dashboard quando configurado

## Fase 4: Módulo Calculadora de Produto

- [ ] 4.1 Criar página `/produtos/novo` com formulário completo
- [ ] 4.2 Criar componente `ProdutoForm` — nome, tipo, categoria, preço venda
- [ ] 4.3 Criar componente `InsumoList` — lista dinâmica com add/remove/reorder
- [ ] 4.4 Criar componente `InsumoRow` — nome, qtd, unidade (select), custo unitário, altura, largura, tempo
- [ ] 4.5 Implementar cálculo de área (altura × largura) quando aplicável
- [ ] 4.6 Criar componente `MargemPreview` — margem bruta e líquida em tempo real
- [ ] 4.7 Criar página `/produtos/[id]` para edição
- [ ] 4.8 Implementar CRUD completo no localStorage

## Fase 5: Módulo de Imagens

- [ ] 5.1 Criar componente `ImageUploader` com react-dropzone (drag & drop)
- [ ] 5.2 Implementar validação CLIENTE: máx 5MB, formatos JPG/PNG/WebP (extensão)
- [ ] 5.3 Implementar conversão WebP via Canvas API no navegador (qualidade 80%, máx 1200px)
- [ ] 5.4 Criar API route `/api/upload-image` com validação SERVER-SIDE: magic number via `file-type`, mimetype check, tamanho
- [ ] 5.5 Configurar Supabase Storage bucket `produto-imagens` com política: path `{user_id}/{produto_id}.webp`, sem listagem pública
- [ ] 5.6 Criar componente `ProdutoImage` — renderiza WebP do Storage ou ícone padrão SVG memoizado
- [ ] 5.7 Criar ícone padrão SVG com gradiente circular e cor pastel (6 variantes, `React.memo`)
- [ ] 5.8 Implementar fallback JPEG para browsers sem suporte a WebP
- [ ] 5.9 Implementar remoção de imagem com confirmação (soft-delete no Storage)

## Fase 6: Dashboard de Comparação

- [ ] 6.1 Criar página `/` (home) com layout do dashboard
- [ ] 6.2 Criar componente `ProdutoCard` — imagem, nome, margem, indicador visual
- [ ] 6.3 Implementar ranking por margem líquida decrescente
- [ ] 6.4 Implementar filtros: "Todos", "Produtos Físicos", "Serviços"
- [ ] 6.5 Criar componente `MargemIndicator` — selo 🟢🟡🟠🔴 com tooltip
- [ ] 6.6 Criar componente `EmptyState` para quando não há produtos
- [ ] 6.7 Implementar ordenação alternativa por esforço relativo
- [ ] 6.8 Criar visualização de cenários (tabela comparativa ao expandir card)

## Fase 7: Múltiplos Cenários

- [ ] 7.1 Criar seção "Cenários" no formulário de produto
- [ ] 7.2 Implementar botão "+ Novo Cenário" que herda dados do produto base
- [ ] 7.3 Criar componente `CenarioRow` — nome, preço alternativo, ajuste de insumos
- [ ] 7.4 Implementar comparação lado a lado de cenários no dashboard
- [ ] 7.5 Salvar cenários no localStorage/DB

## Fase 8: Autenticação (Google OAuth)

- [ ] 8.1 Configurar Google OAuth no Gotrue do Supabase self-hosted
- [ ] 8.2 Criar componente `AuthButton` — "Entrar com Google" (canto superior direito)
- [ ] 8.3 Criar API route `/api/auth/callback` com validação CSRF (cookie httpOnly + state parameter)
- [ ] 8.4 Implementar detecção de dados locais ao logar → modal "Sincronizar?"
- [ ] 8.5 Implementar migração localStorage → Supabase com 1 clique
- [ ] 8.6 Implementar modal de resolução de conflito (dados locais vs remotos divergentes)
- [ ] 8.7 Ajustar hook `useStorage` para rotear para Supabase quando autenticado
- [ ] 8.8 Criar indicador visual de "salvo na nuvem ☁️" vs "salvo localmente 💻"
- [ ] 8.9 Implementar feature flag `NEXT_PUBLIC_ENABLE_SYNC` para desabilitar login/Supabase

## Fase 9: Polimento Visual

- [ ] 9.1 Implementar animações: count-up nos números, fade-in nos cards
- [ ] 9.2 Implementar glassmorphism nos modais (backdrop-blur)
- [ ] 9.3 Ajustar microinterações: hover, focus, transições
- [ ] 9.4 Validar responsividade: mobile (< 640px), tablet, desktop
- [ ] 9.5 Implementar bottom tab bar no mobile
- [ ] 9.6 Aplicar gradiente accent nos elementos-chave (header, CTAs, cards de destaque)
- [ ] 9.7 Adicionar botão "Exportar Backup" no footer — download JSON com todos os dados

## Fase 10: Segurança e Sanitização

- [ ] 10.1 Aplicar DOMPurify em TODOS os inputs de texto antes do render (nome, insumo, categoria)
- [ ] 10.2 Verificar RLS ativa em todas as tabelas — testar com 2 usuários distintos
- [ ] 10.3 Verificar política de Storage — tentar acessar path de outro usuário (deve falhar)
- [ ] 10.4 Testar CSRF no OAuth callback — forjar requisição sem state (deve ser rejeitada)
- [ ] 10.5 Testar upload de arquivo malicioso (ex: `virus.exe` renomeado como `.jpg` → magic number deve rejeitar)
- [ ] 10.6 Verificar Kong rate limiting ativo na rota `/auth/v1/*`

## Fase 11: Deploy e QA

- [ ] 11.1 Deploy na Vercel (equipe joneslab-projects) — preview
- [ ] 11.2 Configurar variáveis de ambiente na Vercel (NUNCA incluir SERVICE_ROLE_KEY em variáveis públicas)
- [ ] 11.3 Testar fluxo completo: Valor Hora → Criar produto → Dashboard → Cenários
- [ ] 11.4 Testar upload de imagem + conversão WebP + ícone padrão
- [ ] 11.5 Testar persistência localStorage (reload, aba fechada)
- [ ] 11.6 Testar login Google + migração de dados locais + resolução de conflito
- [ ] 11.7 Testar export JSON backup
- [ ] 11.8 Testar sync offline: desconectar rede → salvar → reconectar → verificar retry
- [ ] 11.9 Testar feature flag `ENABLE_SYNC=false` — login deve desaparecer
- [ ] 11.10 Validar cálculos com Decimal.js (casos de teste com valores conhecidos)
- [ ] 11.11 Verificar ausência de erros de hidratação Next.js
- [ ] 11.12 Verificar Sentry capturando erros (console do Sentry)
