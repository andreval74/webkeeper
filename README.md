# WebKeeper

**Fábrica de Ideias — IA, Automação, Web3, Sistemas e SEO**
Londrina, Paraná, Brasil · [webkeeper.com.br](https://webkeeper.com.br)

> Você traz o desafio, nós entramos como parceiros: IA, automação, desenvolvimento, Web3 e SEO para tirar do papel e escalar. Atendimento 100% pelo WhatsApp, 24/7.

---

## Sobre o Projeto

Site institucional da WebKeeper, agência/parceira de tecnologia que atua como "fábrica de ideias": desenvolvimento de sistemas, automação com IA, chatbots, Web3/Smart Contracts, marketing digital e SEO. A página é uma landing one-page com diagnóstico digital interativo, chatbot de atendimento com captura de leads por e-mail e galeria de clientes.

**Stack:** HTML5 · CSS3 (inline) · JavaScript · React (via `support.js`) · GSAP + ScrollTrigger (animações) · Google Fonts (Sora + Inter) · PHP (endpoint de leads)
**Deploy:** publicação estática em `webkeeper.com.br`

---

## Seções da Página (`index.html`)

| Âncora | Seção |
|---|---|
| `#cenario` | Estatísticas do mercado digital (PMEs, crescimento de vendas online) |
| `#servicos` | Pilares de serviço (sistemas, automação/IA, Web3, marketing, SEO) |
| `#ia` | Banda de Inteligência Artificial (chips de soluções de IA) |
| `#processo` | Timeline do processo (planejamento → suporte) |
| `#sobre` | Sobre a WebKeeper, diferenciais ("Por que a WebKeeper") e modelo de parceria |
| `#projetos` | Cards de projetos/soluções (dashboard, SaaS, rede, landing page) |
| `#clientes` | Marquee com logos de clientes que já confiaram no trabalho |
| `#diagnostico` | **Diagnóstico Digital** — simulador de análise do site do visitante, com CTA via WhatsApp |
| `#investimento` | Modelo de investimento/proposta sob medida |
| `#faq` | Perguntas frequentes (accordion) |
| `#contato` | CTA final + rodapé com redes sociais e links institucionais |

Todo o conteúdo (textos, ícones, dados dos cards) fica em objetos JS dentro do próprio `index.html` (arrays como `pillars`, `projects`, `clientLogos`, `faqs`, `footerCols`, etc.), renderizados via componentes `sc-for`/`sc-if`.

---

## Chatbot & Captura de Leads

- `chatbot/chatbot.js` + `chatbot/chatbot.css` — widget de chat injetado em `#wk-chatbot-root`, presente em todas as páginas.
- `chatbot/knowledge-base.json` — base de respostas/conhecimento do chatbot.
- `send-chat-lead.php` — recebe o payload do chat (contato informado, página de origem, transcrição da conversa) via POST JSON e envia por e-mail para `contato@webkeeper.com.br`.

---

## Estrutura de Arquivos

```
webkeeper/
├── index.html                    ← página principal (site atual em produção)
├── support.js                    ← runtime dos componentes (React + helpers) usado pelo index.html
├── send-chat-lead.php            ← endpoint de recebimento de leads do chatbot
├── politica-de-privacidade.html
├── termos-de-uso.html
├── robots.txt
├── sitemap.xml
├── README.md
├── chatbot/
│   ├── chatbot.js
│   ├── chatbot.css
│   └── knowledge-base.json
└── images/                       ← imagens usadas pelo index.html atual
    ├── clients/                  ← logos da galeria de clientes (#clientes)
    └── wk-logo.png / wk-og.png / wk-core.png
```

Os mockups da seção de Projetos e os ícones da banda de IA são gerados como SVG inline via JS (não são arquivos de imagem).

---

## Como Editar

1. Abra a pasta no VS Code
2. Edite `index.html` diretamente (CSS e JS estão inline no mesmo arquivo)
3. Abra no navegador para visualizar (ou use a extensão **Live Server** no VS Code)
4. Para alterar conteúdo de texto: busque pelo trecho exato ou pelo array correspondente (ex.: `pillarsData`, `projectsData`, `clientLogos`, `faqData`) perto do fim do arquivo

**Campos importantes para atualizar:**
- WhatsApp: buscar `5543999446606` → substituir se o número mudar (usado pela função `wa(...)`)
- E-mail de leads do chatbot: buscar `contato@webkeeper.com.br` em `send-chat-lead.php`
- Redes sociais: buscar `webkeeperia` (Instagram/Facebook) e `linkedin.com/company/webkeeper`
- Logos de clientes: adicionar arquivo em `images/clients/` e referenciar no array `clientLogos`
- Copyright: buscar `© 2026`

---

## Deploy

```bash
git add .
git commit -m "descrição da mudança"
git push
```

**Após alterações,** revalidar no [Google Search Console](https://search.google.com/search-console):
1. Propriedade `webkeeper.com.br` já registrada
2. Submeter novamente `https://webkeeper.com.br/sitemap.xml` se houver novas URLs

---

## SEO Implementado

- `<title>` e `<meta name="description">` orientados a palavras-chave (IA, automação, sites, SEO)
- Open Graph (Facebook, LinkedIn, WhatsApp preview) e Twitter Card com imagem `images/wk-og.png`
- Geo/idioma: `pt-BR`, `theme-color`
- `<link rel="canonical">` para `https://www.webkeeper.com.br/`
- Schema.org JSON-LD: `Organization`/`ProfessionalService`, `WebSite`, `Service`
- `robots.txt` liberando indexação + apontando para `sitemap.xml`
- `sitemap.xml` para submissão no Google Search Console

---

## Páginas Legais

- `politica-de-privacidade.html`
- `termos-de-uso.html`

---

## Contato

**WebKeeper**
WhatsApp: [(43) 99944-6606](https://wa.me/5543999446606)
E-mail: [contato@webkeeper.com.br](mailto:contato@webkeeper.com.br)
Site: [webkeeper.com.br](https://webkeeper.com.br)
Instagram: [instagram.com/webkeeperia](https://www.instagram.com/webkeeperia)
Facebook: [facebook.com/webkeeperia](https://www.facebook.com/webkeeperia/)
LinkedIn: [linkedin.com/company/webkeeper](https://www.linkedin.com/company/webkeeper)
