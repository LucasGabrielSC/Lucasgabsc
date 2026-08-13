# Lucas Gabriel — Portfólio :rocket:

> Landing page / portfólio profissional de **Lucas Gabriel** — Desenvolvedor Front-End & UX Designer.
> Single-page estática, sem build step, otimizada para SEO, acessibilidade e Core Web Vitals.

![Status](https://img.shields.io/badge/status-production%20ready-bright)
![License](https://img.shields.io/badge/license-MIT-blue)
![HTML5](https://img.shields.io/badge/HTML5-Semantic-orange?logo=html5&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-CDN%20JIT-38bdf8?logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-f7df1e?logo=javascript&logoColor=black)
![SEO](https://img.shields.io/badge/SEO-OpenGraph%20%7C%20JSON--LD-success)

---

## Índice

- [Visão Geral](#visão-geral)
- [Demo Online](#demo-online)
- [Pré-requisitos](#pré-requisitos)
- [Estrutura de Diretórios](#estrutura-de-diretórios)
- [Instalação e Execução Local](#instalação-e-execução-local)
- [SEO e LLMs](#seo-e-llms)
- [Acessibilidade e Performance](#acessibilidade-e-performance)
- [Deploy](#deploy)
- [Tecnologias](#tecnologias)
- [Contato](#contato)
- [Licença](#licença)

---

## Visão Geral

Portfólio single-page (SPA estática) apresentando: hero com vídeo de fundo, marquee de tech stack, três cases de projetos (Ótica Manecolos, Dra. Fabiana Gomes, Dra. Camila), seção "Sobre Mim" com vídeo de fundo e formulário de contato com redirecionamento para WhatsApp. Tipografia em **Bebas Neue** (display/títulos) + **Inter** (corpo). Tailwind via CDN com `tailwind.config` inline.

| Métrica                  | Valor                                                 |
|--------------------------|-------------------------------------------------------|
| Páginas                  | 1 (`index.html`) — anchor navigation                 |
| Framework                | Nenhum (HTML + JS vanilla)                             |
| Tipografia               | Bebas Neue + Inter (Google Fonts)                    |
| Build                    | Não requerido                                         |
| SEO                      | Meta tags, OG, Twitter Card, Schema.org JSON-LD       |
| LLMs                     | `llms.txt` + `llms-full.txt`                          |
| PWA                      | `site.webmanifest` + touch icons                     |

---

## Demo Online

Produção: **https://lucasgabriel.dev/**

---

## Pré-requisitos

Não há dependências de runtime. Para editar/preview local:

- Um navegador moderno (Chrome, Edge, Firefox, Safari).
- (Opcional) Um servidor estático para testar caminhos relativos: `Python 3`, `Node.js` ou qualquer static server.

---

## Estrutura de Diretórios

```
.
├─ index.html              # single-page principal
├─ robots.txt              # regras de crawl
├─ sitemap.xml             # sitemap XML
├─ llms.txt                # contexto curto para LLMs (https://llmstxt.org/)
├─ llms-full.txt           # contexto técnico completo para LLMs
├─ site.webmanifest        # PWA manifest
├─ README.md               # este arquivo
├─ LICENSE                 # MIT
├─ .gitignore
├─ .github/
│  └─ workflows/
│     └─ deploy.yml        # CI: deploy automático para GitHub Pages
└─ src/
   └─ assets/
      ├─ images/           # logos, screenshots, foto de perfil
      │  ├─ logonav.png        # logo da navbar / favicon / apple-touch-icon
      │  ├─ logo arara.png     # logo swap no scroll (mobile)
      │  ├─ imagemref.png      # poster do vídeo hero + OG image
      │  ├─ oticamanecolo.png  # screenshot projeto 1
      │  ├─ fabiana.png        # screenshot projeto 2
      │  ├─ camila.png         # screenshot projeto 3
      │  └─ eu.jpeg            # foto de perfil (sobre)
      └─ video/
         ├─ videohero.mp4      # vídeo de fundo do hero
         └─ videosobre.mp4     # vídeo de fundo da seção sobre
```

---

## Instalação e Execução Local

### Opção A — Abrir direto no navegador
```bash
# Windows
start index.html
# macOS
open index.html
# Linux
xdg-open index.html
```
> Observação: alguns recursos (vídeo, manifest) precisam de protocolo `http(s)://` para funcionar 100%. Use a Opção B para validação completa.

### Opção B — Servidor estático local (recomendado)

Com **Python 3**:
```bash
python -m http.server 8000
# acesse http://localhost:8000
```

Com **Node.js** (`npx`):
```bash
npx serve -l 8000
# ou
npx http-server -p 8000
```

---

## SEO e LLMs

- `robots.txt` — indexação permitida a motores de busca e crawlers de IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, etc.)
- `sitemap.xml` — mapa do site com prioridades, `changefreq` e extensão de imagens (`image:image`)
- `llms.txt` — versão curta descrevendo perfil, stack, projetos e contato
- `llms-full.txt` — versão técnica completa (estrutura, arquitetura, seções, atributos de a11y)
- **Open Graph** + **Twitter Card** configurados no `<head>` do `index.html`
- **Schema.org JSON-LD** tipo `Person` para Knowledge Panel / rich results

---

## Acessibilidade e Performance

- HTML5 semântico (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- `alt` em imagens; `aria-label` em links de mídia; `aria-hidden` em decorativos
- `aria-expanded` no menu mobile; `role="status"` no feedback de formulário
- Hierarquia de headings (h1 único → h2 por seção → h3 em sub-blocos)
- `preconnect` ao Google Fonts; `display=swap` para evitar FOIT
- `loading="lazy"` em screenshots e foto de perfil
- Tailwind via CDN JIT — zero CSS inflado de build
- Animações via CSS keyframes + `IntersectionObserver`

---

## Deploy

### GitHub Pages (automático)

O workflow `.github/workflows/deploy.yml` publica automaticamente em `gh-pages` a cada push em `main`. Para habilitar:

1. Push do repositório para o GitHub.
2. Repositório → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. O deploy acontece no próximo push em `main`. A URL será `https://<usuario>.github.io/<repo>/`.

> Para usar um domínio customizado (lucasgabriel.dev), configure um arquivo `CNAME` na raiz do repo publicando, ou ajuste acesse **Settings → Pages → Custom domain**.

### Alternativa: Vercel / Netlify

Faça import do repositório e configure:

- **Build command:** *(vazio — site estático)*
- **Output directory:** `./` (raiz do projeto)

Ambos detectam o `site.webmanifest` e servem os assets com CDN global.

---

## Tecnologias

| Camada     | Tecnologia                              |
|------------|-----------------------------------------|
| Marcação   | HTML5 semântico                         |
| Estilo     | Tailwind CSS 3 (CDN — JIT inline config)|
| Tipografia | Bebas Neue + Inter (Google Fonts)       |
| Scripts    | JavaScript ES6+ vanilla                 |
| SEO        | Meta tags, OG, Twitter Card, JSON-LD    |
| IA context | llms.txt / llms-full.txt                |
| PWA        | site.webmanifest                        |
| CI/CD      | GitHub Actions                          |
| Domínio    | lucasgabriel.dev                        |

---

## Contato

- **Site:** https://lucasgabriel.dev/
- **E-mail:** lucasgscbusiness@gmail.com
- **Telefone:** +55 11 91842-0158
- **WhatsApp:** https://wa.me/5511918420158
- **LinkedIn:** https://www.linkedin.com/in/lucasgabsc/
- **GitHub:** https://github.com/LucasGabrielSC

---

## Licença

Distribuído sob a licença **MIT**. Veja [`LICENSE`](LICENSE) para detalhes.

&copy; 2026 Lucas Gabriel SC.
