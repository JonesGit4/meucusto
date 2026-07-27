# Proposal: Meu Custo — MVP v1.1

**Status:** Aguardando aprovação
**Data:** 2026-07-27
**Autor:** Jones Lauriano (via Hermes)
**Versão:** 1.1 (pós-revisão de segurança)
**Changelog v1.1:** RLS, CSRF, sanitização XSS, Decimal.js, soft-delete, versionamento schema, backup JSON, Sentry, rate-limiting, storage policy, feature flag

## Why

Pequenos produtores, artesãos e prestadores de serviço não têm uma ferramenta **completa e gratuita** que calcule simultaneamente:
- Margem bruta e líquida de cada produto/serviço
- Esforço relativo (tempo investido vs retorno)
- Valor hora real (considerando CNPJ, taxas fixas, rateios)

Apps existentes (`PrecificaProduto`, `PrecificAção`, `Calcularte`) focam só no preço final — nenhum responde à pergunta estratégica: **"o que vale mais a pena eu vender?"**

Além disso, serve como ferramenta de **portfólio/atração** da DuoBro — totalmente gratuito, visual moderno estilo Stripe.

## What Changes

- **Novo projeto greenfield:** App web Next.js 15, Vercel deploy
- **Módulo Valor Hora:** Salário desejado + custos CNPJ/MEI + taxas fixas → valor/hora real
- **Módulo Calculadora de Produto/Serviço:** Insumos com unidades flexíveis (m², cm, kg, g, unidade), cálculo de área (altura × largura), tempo de trabalho, margem bruta e líquida
- **Módulo Dashboard:** Cards comparativos, ranking por margem e esforço, indicador "foco"
- **Imagens de produto:** Upload opcional com conversão automática para WebP (Canvas API), validação dupla cliente+servidor (magic number), ícone padrão SVG memoizado se não houver foto
- **Persistência offline-first:** localStorage como camada primária, Supabase como sync opcional. Retry com backoff exponencial, resolução de conflitos, backup JSON manual
- **Segurança em camadas:** RLS em todas as tabelas, CSRF no OAuth, sanitização XSS (DOMPurify), validação server-side de upload, rate limiting via Kong
- **Precisão financeira:** Decimal.js em todos os cálculos monetários (zero erros de ponto flutuante)
- **Supabase self-hosted:** Novo schema `meucusto` com soft-delete e versionamento na stack existente `supabase-wacrm`
- **Observabilidade:** Sentry para erros de sync/upload, feature flag `ENABLE_SYNC`

## Scope

### IN
- Calculadora de Valor Hora com salário, CNPJ/MEI e taxas fixas
- CRUD de produtos e serviços com insumos detalhados
- Cálculo de área (altura × largura) para insumos em m²/cm
- Margem bruta (preço − custos diretos) e líquida (bruta − taxas − rateios)
- Múltiplos cenários por produto (ex: "e se eu aumentar 10%?")
- Dashboard com ranking e indicadores visuais
- Upload de imagem → conversão WebP → descarte da original
- Ícone padrão SVG amigável para produtos sem foto
- Persistência em localStorage
- Login opcional via Google OAuth (Supabase Auth)
- Design dark mode estilo Stripe (gradientes, glassmorphism)

### OUT
- App mobile nativo (React Native) — será fase 2
- Autenticação via email/senha — apenas Google OAuth no MVP
- Compartilhamento social de cálculos
- Exportação PDF/CSV de relatórios
- Multilíngue (i18n)
- Cobrança/monetização (ferramenta 100% gratuita)
- Domínio próprio `meucusto.online` — será registrado posteriormente pelo Jones

## Impact

- **Novo repo GitHub:** `JonesGit4/meucusto`
- **Novo projeto Vercel:** `meucusto` (equipe joneslab-projects)
- **Supabase:** Novo schema `meucusto` no PostgreSQL self-hosted (stack `supabase-wacrm`)
- **Infra:** Sem custo adicional (reutiliza Supabase existente, Vercel free tier)

## Rollback Plan

- Remover schema `meucusto` do PostgreSQL
- Deletar projeto Vercel
- Arquivar repo GitHub
- Sem impacto em sistemas existentes
