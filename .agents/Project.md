# Dexter UI Framework

> Framework CSS/JS moderno para **web e e-mail**, com temas via Sass/Less, CSS Variables, acessibilidade nativa e documentação feita para **humanos e agentes de IA**.
> A modern CSS/JS framework for **web and email**, themeable via Sass/Less and CSS Variables, accessible by default, with docs built for **humans and AI agents**.

- **Autor / Author:** Charles Corrêa
- **Status:** Fase 0 em andamento: fundação pronta (reset, tokens, container, grid de 14 colunas, gutters, z-index, build Sass); componentes na sequência / Phase 0 in progress: foundation ready; components next
- **Idiomas da documentação / Docs languages:** pt-BR e EN (obrigatório / mandatory)
- **Repositório:** <https://github.com/CharlesCorreaDev/Dexter-UI>
- **Documentos relacionados / Related docs:** [agents-info.md](agents-info.md) (leia primeiro / read first) · [Colors.md](Colors.md) · [WebFonts.md](WebFonts.md)

---

## 1. Princípios / Principles

| # | Princípio | Detalhe |
|---|-----------|---------|
| 1 | **Independente** | O Dexter UI é um framework separado e autônomo. Pode ser integrado a outros projetos/frameworks, mas nunca depende deles. |
| 2 | **Web + E-mail** | Mesmo vocabulário de classes para páginas web e e-mails HTML (tabelas, estilos inline, fallbacks). |
| 3 | **CSS Variables first** | Todo token (cor, fonte, espaçamento, raio, sombra, transição) é uma custom property; Sass/Less geram e estendem, não substituem. |
| 4 | **Acessível por padrão** | WCAG 2.2 AA, ARIA, `prefers-reduced-motion`, contraste mínimo validado. |
| 5 | **Interação suave** | Todos os componentes têm efeitos de `hover`/`focus` suaves e modernos. |
| 6 | **Pronto para HTML5 + HTMX** | Componentes funcionam com atributos `hx-*` sem JS extra. |
| 7 | **IA-friendly** | `llms.txt`, `llms-full.txt` e uma skill dedicada para agentes. |
| 8 | **Raiz limpa** | Todos os arquivos do framework vivem em `Dexter-UI/`. |
| 9 | **Comentários bilíngues** | Todo comentário em código deve estar em **pt-BR e inglês** (ver convenção abaixo). |

### Convenção de comentários / Comment convention

Todos os comentários em código (Sass, Less, CSS, JS, HTML, configs) são escritos em **pt-BR e em inglês**, nesta ordem: pt-BR primeiro, inglês logo abaixo, com o prefixo do idioma.
*All code comments (Sass, Less, CSS, JS, HTML, configs) are written in **pt-BR and English**, pt-BR first and English right below, each with a language prefix.*

```scss
// pt-BR: Consulta de mídia mobile-first. Emite o conteúdo sem @media para xs.
// EN: Mobile-first media query. Emits the content without @media for xs.
```

```js
/**
 * pt-BR: Detecta se o navegador está 2 versões ou mais atrás da estável.
 * EN: Detects whether the browser is 2 or more versions behind stable.
 */
```

- Comentários de bloco e cabeçalhos de arquivo seguem a mesma regra.
- Nomes de classes, variáveis, funções e mensagens de erro de desenvolvedor permanecem em inglês.
- Comentários com `/*! ... */` (preservados no CSS final) também são bilíngues.
- Vale para código novo e para revisões de código existente: nenhum comentário monolíngue.

### Cabeçalho de arquivo / File header

**Todo arquivo de código** começa com este bloco de documentação (Sass, Less, CSS, JS, TS). Em HTML, usar o mesmo conteúdo dentro de `<!-- ... -->`.
*Every code file starts with this documentation block (Sass, Less, CSS, JS, TS). In HTML, use the same content inside `<!-- ... -->`.*

```
/**
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        Nome do Arquivo
 * @description [PT-BR] Descrição do arquivo em pt-BR
 *              [EN]    File description in English
 *
 * @author      Charles Corrêa
 * @contact     E-mail: charlescorreaweb@gmail.com
 * @website     https://charlescorrea.com.br
 * @github      https://github.com/CharlesCorreaDev
 *
 * @repository  https://github.com/CharlesCorreaDev/Dexter-UI
 * @issues      https://github.com/CharlesCorreaDev/Dexter-UI/issues/
 * @wiki        https://github.com/CharlesCorreaDev/Dexter-UI/wiki/
 * @releases    https://github.com/CharlesCorreaDev/Dexter-UI/releases/
 * @tags        https://github.com/CharlesCorreaDev/Dexter-UI/tags/
 *
 * @copyright   2026 Charles Corrêa. Todos os direitos reservados / All rights reserved.
 * @license     [PT-BR] MIT – consulte o arquivo LICENSE na raiz do repositório.
 *              [EN]    MIT – see the LICENSE file at the repository root.
 * =============================================================================
 */
```

Regras / Rules:

- `@file`: caminho do arquivo relativo à pasta de código (ex.: `layout/_grid.scss`).
- `@description`: sempre em pt-BR (`[PT-BR]`) e em inglês (`[EN]`).
- `@copyright`: usar o **ano de criação do arquivo**.
- `@license`: **MIT**, conforme o `LICENSE` do repositório. Se a licença mudar, atualizar este modelo e todos os arquivos.
- O cabeçalho usa os rótulos `[PT-BR]` / `[EN]`; os comentários internos usam os prefixos `pt-BR:` / `EN:` (convenção acima).
- Arquivo de entrada compilado (ex.: `dexter.scss`) abre o bloco com `/*!` em vez de `/**`, para que a licença sobreviva à minificação.
- **Separadores de seção no CSS final:** cada partial que gera CSS tem, logo abaixo do cabeçalho, um marcador `/* @section Nome em pt-BR | Name in EN */`. O build (`Dexter-UI/scripts/build-css.mjs`) o converte em um separador no `dexter.css` e remove os demais comentários `/* */` (o `.min.css` não leva separadores). Partials que não geram CSS (ex.: `abstracts/`) não precisam de marcador.
- Arquivos que não aceitam comentários (JSON) ficam de fora.

---

## 2. Estrutura de diretórios / Directory Layout

Tudo do framework fica dentro de `Dexter-UI/` para manter a raiz do repositório limpa. ✅ = existe · ⏳ = planejado.

```
Dexter-CSS/                          # raiz do repositório (somente arquivos de projeto)
├─ .agents/                          # ✅ documentação para agentes
│   ├─ agents-info.md                #    ponto de entrada dos agentes
│   ├─ Project.md                    #    este documento
│   ├─ Colors.md                     #    paleta, contraste, pares texto/fundo
│   └─ WebFonts.md                   #    fontes, carregamento, fallbacks
├─ AGENTS.md / CLAUDE.md             # ✅ redirecionam para .agents/agents-info.md
├─ package.json  LICENSE  README.md  # ✅
└─ Dexter-UI/                        # ← TODO o framework
    ├─ src/
    │   ├─ scss/
    │   │   ├─ abstracts/            # ✅ _config, _breakpoints, _index
    │   │   ├─ base/                 # ✅ _reset, _root (CSS vars), _typography
    │   │   ├─ layout/               # ✅ _container, _grid (14 col), _gutters
    │   │   ├─ utilities/            # ✅ _text, _z-index
    │   │   ├─ components/           # ⏳ _button, _alert, _card, _modal ...
    │   │   ├─ themes/               # ⏳ light, dark, temas customizados
    │   │   ├─ email/                # ⏳ estilos e blocos específicos de e-mail
    │   │   └─ dexter.scss           # ✅ entrada principal
    │   ├─ less/                     # ⏳ equivalente Less (mesmos tokens)
    │   └─ js/                       # ⏳ core/, components/ (alert-outdated...), index.js
    ├─ scripts/build-css.mjs         # ✅ build do CSS (Sass + PostCSS); mantém só o cabeçalho de entrada
    ├─ dist/css/                     # ✅ dexter.css  dexter.min.css  dexter.css.map (gerados)
    ├─ dist/js/  dist/email/         # ⏳
    ├─ assets/                       # ⏳ icons/, fonts/, placeholders/
    ├─ templates/                    # ⏳ web/ (starter, parallax, landing) e email/
    ├─ docs/                         # ⏳ pt-BR/ e en/
    ├─ examples/                     # 🟡 typography.html ✅; demais demos e integrações ⏳
    ├─ skills/dexter-ui/SKILL.md     # ⏳ skill para agentes de IA
    ├─ llms.txt                      # ⚠️ rascunho a refazer no formato llmstxt.org
    └─ llms-full.txt                 # ⏳ documentação completa concatenada
```

---

## 3. Tecnologias / Technologies

| Área | Tecnologia | Referência |
|------|-----------|------------|
| Pré-processadores | Sass | <https://sass-lang.com/documentation/> |
| | Less | <https://lesscss.org/> |
| | PostCSS | <https://postcss.org/docs/> |
| Build | Vite | <https://vite.dev/guide/> |
| | Webpack | <https://webpack.js.org/concepts/> |
| | Vinext | <https://vinext.dev/docs> |
| | Bun (fullstack bundler) | <https://bun.com/docs/bundler/fullstack> |
| Interatividade | HTMX | <https://htmx.org/docs/> |
| Posicionamento | Floating UI (dropdowns, tooltips, popovers) | <https://floating-ui.com/> |
| Calendário | Vanilla Calendar Pro (datepicker) | <https://vanilla-calendar.pro/> |
| Imagens de exemplo | placehold.co | <https://placehold.co/> |
| Avatares / fotos | DiceBear · Pexels API | <https://www.dicebear.com/> · <https://www.pexels.com/api/documentation/> |

---

## 4. Design tokens

### 4.1 Paleta / Palette

Cinco cores oficiais definidas pelo autor (`primary` `#3b5998`, `secondary` `#14306b`, `tertiary` `#869dcc`, `quaternary` `#224389`, `quinary` `#5772ac`). Valores RGB, **contraste WCAG**, pares texto/fundo e a proposta de cores semânticas (`danger`, `info`, `secret`, `warning`, `success`, `light`, `dark`) estão em **[Colors.md](Colors.md)**.

> Atenção: texto branco **não** passa no contraste sobre `tertiary` (2.72:1); use o par escuro.

### 4.2 Convenção de CSS Variables

- Prefixo `--dx-` para evitar colisões (`--dx-primary`, `--dx-font-body`, `--dx-radius`, `--dx-transition`).
- Variáveis por componente, sobrescrevíveis localmente: `--dx-btn-bg`, `--dx-btn-color`, `--dx-alert-z-index`.
- Temas = conjuntos de variáveis em `[data-dx-theme="dark"]`, sem recompilar CSS.
- Variáveis Sass/Less geram os valores padrão de `:root`.

### 4.3 Breakpoints

| Breakpoint | Infixo | Dimensão |
|------------|--------|----------|
| Extra small | *(nenhum)* | < 576px |
| Small | `sm` | ≥ 576px |
| Medium | `md` | ≥ 768px |
| Large | `lg` | ≥ 1024px |
| Extra large | `xl` | ≥ 1280px |
| Extra extra large | `2xl` | ≥ 1536px |

### 4.4 Tipografia / Typography

Padrões: **Inter** (texto), **Poppins** (títulos), **JetBrains Mono** (código), sempre com *fallback* de sistema. A lista completa de famílias aprovadas, o carregamento e as regras de e-mail estão em **[WebFonts.md](WebFonts.md)**.

---

## 5. Componentes / Components

### 5.1 Convenção de nomes

Classe base + modificador de tema: `.btn` + `.btn-primary`, `.btn-quinary`, `.btn-outline-primary`.

**Variantes de tema obrigatórias em todos os componentes aplicáveis:**
Primary · Secondary · Tertiary · Quaternary · Quinary · Danger · Info · Secret · Warning · Success · Light · Dark · **Outline** · **Reverse**

### 5.2 Catálogo (por fase)

| Fase | Componentes |
|------|-------------|
| **MVP** | Grid (até **14 colunas**), Container, Utilities, Button, Alert, **Alerta flutuante de navegador desatualizado**, Typography, Card, Badge |
| **Formulários** | Input, Select, Checkbox, Radio, Switch, Textarea, Validation, Datepicker (Vanilla Calendar) |
| **Navegação** | Navbar, Breadcrumb, Pagination, Tabs, Dropdown (Floating UI), Sidebar |
| **Overlays** | Modal, Tooltip, Popover (Floating UI), Toast, Offcanvas |
| **Dados** | Table, List group, Accordion, Progress, Spinner, Avatar (DiceBear) |
| **Ícones** | `.dx-icon` unificado sobre os pacotes listados na seção 8 |
| **E-mail** | Layout em tabelas, botões "bulletproof", cards, header/footer, módulos responsivos |

### 5.3 Grid de 14 colunas — ✅ implementado

- Flexbox: `.row` + `.col`, `.col-auto`, `.col-1` … `.col-14`, `.offset-0` … `.offset-13`, `.order-*` e `.row-cols-{1,2,7,14,auto}`, todos com variantes `-{bp}-`.
- O número de colunas vem de `$grid-columns` (14) **em tempo de compilação**; `--dx-grid-columns` existe apenas como referência.
- Gutters via `--dx-gutter-x` / `--dx-gutter-y` e classes `.g-*`, `.gx-*`, `.gy-*` (0–5), também por breakpoint.

### 5.4 Alerta de navegador desatualizado

- Banner **flutuante fixo no topo** quando o navegador está **2 ou mais versões** atrás da versão estável atual.
- Detecção em JS (`src/js/components/alert-outdated.js`), com tabela de versões mínimas atualizável sem alterar o código (arquivo de dados).
- Fechável, acessível (`role="alert"`), persiste dispensa (`localStorage`) e respeita `prefers-reduced-motion`.

### 5.5 Efeitos de interação

- Transições curtas (150–250 ms) em `background-color`, `border-color`, `box-shadow`, `transform`.
- Estados `:hover`, `:focus-visible`, `:active`, `:disabled` em todos os componentes.
- Sob `prefers-reduced-motion: reduce`, transições e animações são desativadas ou minimizadas.

### 5.6 Exemplo

```html
<button class="btn btn-primary">Salvar</button>
<button class="btn btn-outline-quinary">Cancelar</button>
```

```scss
.btn {
  --dx-btn-bg: var(--dx-primary);
  --dx-btn-color: #fff;
  background: var(--dx-btn-bg);
  color: var(--dx-btn-color);
  transition: background-color .2s ease, box-shadow .2s ease, transform .2s ease;
  &:hover { filter: brightness(1.08); transform: translateY(-1px); }
  &:focus-visible { outline: 3px solid var(--dx-focus-ring); outline-offset: 2px; }
}
@each $name, $color in $theme-colors { .btn-#{$name} { --dx-btn-bg: #{$color}; } }
```

---

## 6. E-mail

- Objetivo: mesmas classes e tokens, com saída compilada para **estilos inline** (inliner no build).
- Layout em tabelas, largura máx. 600 px, imagens com `alt`, texto alternativo e *preheader*.
- Compatibilidade alvo: Gmail, Outlook (desktop/web), Apple Mail, Yahoo, clientes móveis.
- Variáveis CSS **não** são suportadas em vários clientes: o build de e-mail resolve as `var()` para valores fixos.
- Templates: transacional, newsletter, boas-vindas.

---

## 7. Acessibilidade / Accessibility

- Normas: WCAG 2.2 (AA), Section 508, WAI-ARIA, contraste de texto (1.4.3) e não-texto (1.4.11).
- Media query `prefers-reduced-motion` (Media Queries Level 5).
- Teclado: foco visível e ordem lógica em todos os componentes interativos.
- Validação: axe (Deque), Accessibility Insights, TPGi Color Contrast Checker.
- Referências:
  - <https://www.w3.org/TR/WCAG/>
  - <https://www.w3.org/WAI/standards-guidelines/aria/>
  - <https://www.w3.org/TR/mediaqueries-5/#prefers-reduced-motion>
  - <https://www.section508.gov/>
  - <https://www.a11yproject.com/>
  - <https://developer.mozilla.org/en-US/docs/Web/Accessibility>
  - <https://www.tpgi.com/color-contrast-checker/>
  - <https://accessibilityinsights.io/>
  - <https://www.deque.com/axe/>
  - <https://www.w3.org/WAI/fundamentals/accessibility-intro/>

---

## 8. Ícones / Icons

| Pacote | Link |
|--------|------|
| Bootstrap Icons | <https://icons.getbootstrap.com/> |
| Font Awesome | <https://docs.fontawesome.com/> |
| Google Material Icons | <https://fonts.google.com/icons> |
| Hugeicons | <https://hugeicons.com/icon-font> |
| Boxicons | <https://boxicons.com/> |
| RPG Awesome | <https://github.com/nagoshiashumari/Rpg-Awesome> |
| Game Icons | <https://game-icons.net/> · <https://github.com/game-icons/icons> |

**Medialoot** (verificar licença de cada pacote antes de redistribuir):
[Coronavirus](https://medialoot.com/item/coronavirus-vector-line-icons/) ·
[User Interface](https://medialoot.com/item/user-interface-vector-icons/) ·
[Valentines Day](https://medialoot.com/item/valentines-day-vector-icons/) ·
[Halloween Line](https://medialoot.com/item/halloween-vector-line-icons/) ·
[Stock Market](https://medialoot.com/item/stock-market-vector-icons/) ·
[Zodiac](https://medialoot.com/item/zodiac-sign-icons/) ·
[Simple Social 2013](https://medialoot.com/item/simple-social-icons-2013/) ·
[Credit Card 32px](https://medialoot.com/item/credit-card-32px-icons/) ·
[Camera Functions](https://medialoot.com/item/photography-camera-function-icons/) ·
[Halloween](https://medialoot.com/item/halloween-vector-icons/) ·
[Business](https://medialoot.com/item/business-vector-icon-set/) ·
[Map Pins](https://medialoot.com/item/free-vector-map-location-pins/) ·
[Listicons](https://medialoot.com/item/listicons-arrows-bullets-webfont/) ·
[Zombie](https://medialoot.com/item/free-vector-zombie-icons/) ·
[Filetype](https://medialoot.com/item/free-vector-filetype-icons/) ·
[Weather](https://medialoot.com/item/free-weather-vector-icons/)

---

## 9. Distribuição / Distribution

- Arquivos **dev** (legíveis, com sourcemap) e **min** (minificados) para CSS e JS.
- Saídas: `dexter.css`, `dexter.min.css`, `dexter.js`, `dexter.min.js`, `dexter-email*.css`.
- Entrega via npm, CDN e cópia direta; Sass/Less como fontes de personalização.
- Versionamento SemVer; changelog por release.

---

## 10. Documentação / Documentation

Obrigatoriamente **pt-BR e EN**, com as seções:

1. Instalação (npm, CDN, dev vs min)
2. Compilação (Vite, Webpack, PostCSS, Bun, Vinext)
3. Temas (CSS Variables, Sass, Less)
4. Componentes (exemplos, variantes, acessibilidade)
5. E-mail
6. HTMX
7. Templates (Starter, Parallax, Landing Page)
8. Integrações

**Integrações previstas:** React, Vue, Svelte/SvelteKit, Angular, Astro, Next.js, Nuxt, Vike, Django, Laravel, Ruby on Rails, Elixir/Phoenix, Electron.

**LLM-ready docs** (convenção <https://llmstxt.org/>):

| Arquivo | Descrição |
|---------|-----------|
| `llms.txt` | Índice curado de todas as páginas com links e descrições |
| `llms-full.txt` | Texto completo da documentação em um único arquivo |

**Skill para agentes de IA:** `Dexter-UI/skills/dexter-ui/SKILL.md` — ensina agentes a usar tokens, classes, variantes e templates corretamente, além de apontar para `llms.txt`.

Imagens de exemplo: `https://placehold.co/{LxA}/{fundo}/{texto}/{ext}?text=...&font=roboto`.

---

## 11. Templates de página / Page Templates

| Template | Descrição |
|----------|-----------|
| Starter | Estrutura mínima (header, conteúdo, footer, grid) |
| Parallax | Seções com efeito parallax em CSS |
| Landing Page | Hero, features, depoimentos, CTA |

---

## 12. Roadmap

| Fase | Entregas | Status |
|------|----------|--------|
| **0 – Fundação** | Estrutura de pastas, tokens (CSS vars + Sass), reset, tipografia, container, grid de 14 colunas, gutters, z-index, build Sass, dist dev/min | 🟡 Em andamento: Sass, tokens, layout e build prontos; faltam Less, lint/format e pastas de docs/templates |
| **1 – MVP** | Button, Alert, alerta de navegador desatualizado, utilitários restantes, template Starter | ⏳ Próxima |
| **2 – Componentes** | Formulários, navegação, overlays (Floating UI), datepicker | ⏳ |
| **3 – E-mail** | Build com inline CSS, templates de e-mail, testes de clientes | ⏳ |
| **4 – Docs & IA** | Docs pt-BR/EN, `llms.txt`/`llms-full.txt`, skill para IA, páginas Parallax/Landing | ⏳ |
| **5 – Integrações** | Guias e exemplos por framework, publicação npm/CDN, release 1.0 | ⏳ |

---

## 13. Referências de inspiração / Inspiration

Bootstrap ([repo](https://github.com/twbs/bootstrap) · [v6 docs](https://getbootstrap.com/docs/6.0/getting-started/install/) · [examples](https://github.com/twbs/examples/tree/main)), Tailwind, DaisyUI, Bulma, Foundation ([web](https://get.foundation/sites/docs/) · [emails](https://get.foundation/emails/docs/)), UIkit, Materialize, Pure.css, Furtive, Mantine, MUI ([Material UI](https://mui.com/material-ui/) · [System](https://mui.com/system/getting-started/) · [Base UI](https://base-ui.com/)), Chakra UI, PrimeFlex.

**E-mail:** [responsive-html-email-template](https://github.com/leemunroe/responsive-html-email-template), [html5-email-regex](https://github.com/coliff/html5-email-regex), [emailregex.com](https://emailregex.com/), [Really Good Emails](https://reallygoodemails.com/templates), [Designmodo](https://designmodo.com/email-templates/), [Smashing Magazine](https://www.smashingmagazine.com/2017/01/introduction-building-sending-html-email-for-web-developers/), [Tuts+ transactional](https://webdesign.tutsplus.com/everything-developers-need-to-know-about-sending-transactional-email--cms-31759a), [UIowa](https://brand.uiowa.edu/html-email-templates).

**Frameworks alvo da documentação:** [Webpack](https://webpack.js.org/concepts/) · [Vinext](https://vinext.dev/docs) · [Vite](https://vite.dev/guide/) · [PostCSS](https://postcss.org/docs/) · [Svelte](https://svelte.dev/docs/svelte/overview) · [SvelteKit](https://svelte.dev/docs/kit/introduction) · [Astro](https://docs.astro.build/en/getting-started/) · [React](https://react.dev/reference/react) · [Nuxt](https://nuxt.com/docs/4.x/getting-started/introduction) · [Next.js](https://nextjs.org/docs) · [Django](https://docs.djangoproject.com/en/6.1/) · [Electron](https://www.electronjs.org/docs/latest/) · [Rails](https://rubyonrails.org/docs) · [Laravel](https://laravel.com/framework/docs/13.x/installation) · [Elixir](https://elixir-lang.org/docs/) · [Angular](https://angular.dev/overview) · [Bun](https://bun.com/docs/bundler/fullstack) · [Vike](https://vike.dev/) · [Vue](https://vuejs.org/guide/quick-start.html)
