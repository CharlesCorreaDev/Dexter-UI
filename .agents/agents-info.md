# agents-info.md – Dexter UI (leia primeiro / read first)

> Ponto de entrada obrigatório para agentes de IA (`AGENTS.md` e `CLAUDE.md` apontam para cá).
> Mandatory entry point for AI agents (`AGENTS.md` and `CLAUDE.md` point here).

---

## 1. O que é o projeto / What this project is

**Dexter UI Framework**: framework CSS/JS moderno, semelhante ao Bootstrap, para **web e e-mail**, com temas via Sass/Less, CSS Variables, acessibilidade por padrão, pronto para HTML5 e HTMX, e documentação para humanos e agentes de IA.
*Dexter UI Framework: a modern CSS/JS framework, similar to Bootstrap, for **web and email**, themeable via Sass/Less, CSS Variables, accessible by default, HTML5/HTMX ready, with docs for humans and AI agents.*

- **Autor / Author:** Charles Corrêa
- **Licença / License:** MIT (arquivo `LICENSE` na raiz)
- **Repositório / Repository:** <https://github.com/CharlesCorreaDev/Dexter-UI> (remote `origin`)
- **Branch de trabalho / Working branch:** `development`
- **Independente:** o Dexter UI é um framework **separado e autônomo**. Pode ser integrado a outros projetos, mas **não depende** deles. Tailwind, DaisyUI, Bulma, Bootstrap etc. são **apenas inspiração**, nunca dependência.
  *Independent: Dexter UI is a **separate, standalone** framework. It can be integrated into other projects but **does not depend** on them. Tailwind, DaisyUI, Bulma, Bootstrap, etc. are **inspiration only**, never dependencies.*

---

## 2. Leia nesta ordem / Reading order

| # | Arquivo | Para quê |
|---|---------|----------|
| 1 | `.agents/agents-info.md` | Este arquivo: regras, mapa, comandos, estado atual |
| 2 | [Project.md](Project.md) | Visão, componentes, e-mail, acessibilidade, roadmap, convenção de comentários e cabeçalho |
| 3 | [Colors.md](Colors.md) | Paleta, contraste, pares texto/fundo (leia antes de mexer em cor) |
| 4 | [WebFonts.md](WebFonts.md) | Fontes e carregamento (leia antes de mexer em tipografia) |

Para documentação de **bibliotecas externas** (Sass, Vite, HTMX, Floating UI, Vanilla Calendar etc.), consulte a documentação atual (MCP Context7) em vez de depender de memória.
*For **external library** documentation (Sass, Vite, HTMX, Floating UI, Vanilla Calendar, etc.), consult current docs (Context7 MCP) instead of relying on memory.*

---

## 3. Regras inegociáveis / Non-negotiable rules

1. **Local dos arquivos:** todo arquivo do framework fica em `Dexter-UI/`. A raiz só tem arquivos de projeto (`package.json`, `LICENSE`, `README.md`, `.agents/` etc.). *Framework files live in `Dexter-UI/`.*
2. **Comentários bilíngues:** todo comentário em código é **pt-BR + inglês**, pt-BR primeiro. Inline: `// pt-BR: …` e `// EN: …`. Nomes de classes, variáveis, funções e mensagens de erro ficam em inglês. *All code comments are bilingual, pt-BR first.*
3. **Cabeçalho de arquivo:** todo arquivo de código **novo** começa com o bloco padrão da seção **3.1** deste documento (copie e preencha); os 10 arquivos Sass existentes já o têm e, ao editar um arquivo, mantenha o cabeçalho (não o recrie nem mude o ano de `@copyright`). `@file` = caminho relativo à pasta de código; `@license` = MIT. O arquivo de entrada compilado abre com `/*!`. *Every **new** code file starts with the standard block from section 3.1; existing files already have it, so keep it when editing.*
4. **Documentação bilíngue:** toda documentação do projeto em **pt-BR e inglês**. *All project docs in pt-BR and English.*
5. **Atribuição de autoria:** sempre **Charles Corrêa** (sem o prefixo "GM"; "GM Charles Corrêa" só existe em skills de RPG/VTT, que não pertencem a este projeto). *Author is always Charles Corrêa.*
6. **CSS Variables primeiro:** todo token é uma custom property com prefixo `--dx-`. Sass/Less geram os padrões de `:root`. *CSS Variables first, `--dx-` prefix.*
7. **Acessibilidade (WCAG 2.2 AA):** foco visível, contraste conforme `Colors.md`, `prefers-reduced-motion`, ARIA onde couber. Texto branco **nunca** sobre `tertiary`. *Accessible by default.*
8. **Interação suave:** todo componente tem `hover`/`focus-visible`/`active`/`disabled` com transições curtas (150–250 ms) e respeita `prefers-reduced-motion`. *Smooth, modern hover/focus on every component.*
9. **Variantes de tema:** todo componente aplicável aceita Primary, Secondary, Tertiary, Quaternary, Quinary, Danger, Info, Secret, Warning, Success, Light, Dark, **Outline**, **Reverse**. Nome: classe base + modificador (`.btn` + `.btn-primary`). *Every applicable component supports the 14 variants.*
10. **Paleta do autor é intocável:** não altere as 5 cores oficiais nem as fontes aprovadas sem autorização. Cores semânticas estão em **proposta** (ver `Colors.md`). *Do not change the official palette or approved fonts without approval.*
11. **Sem segredos no repositório:** nada de chaves de API (ex.: Pexels) ou `.env` versionados. *No secrets in the repo.*
12. **Git:** não faça `commit`, `push` ou mude de branch sem pedido explícito. *Never commit, push or switch branches unless explicitly asked.*

---

## 3.1 Cabeçalho obrigatório em todo arquivo de código / Mandatory header in every code file

Copie este bloco **no início** de todo arquivo de código novo (Sass, Less, CSS, JS, TS) e preencha `@file`, `@description` e o ano de `@copyright`. Em HTML, use o mesmo conteúdo dentro de `<!-- ... -->`. JSON e Markdown ficam de fora.
*Copy this block at the **top** of every new code file (Sass, Less, CSS, JS, TS) and fill in `@file`, `@description` and the `@copyright` year. In HTML, use the same content inside `<!-- ... -->`. JSON and Markdown are excluded.*

```
/**
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        caminho/relativo/do/arquivo.scss
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

| Campo | Regra |
|-------|-------|
| `@file` | Caminho relativo à pasta de código (ex.: `layout/_grid.scss`) |
| `@description` | Sempre `[PT-BR]` e `[EN]`; linhas extras alinhadas sob o texto |
| `@copyright` | **Ano de criação do arquivo** (hoje: `2026`) |
| `@license` | **MIT** (confirmado no `LICENSE` do repositório). Se a licença mudar, atualizar o modelo e todos os arquivos |
| Arquivo de entrada compilado (`dexter.scss`) | Abre com `/*!` em vez de `/**`, para a licença sobreviver à minificação |

Modelo vivo para consulta: `Dexter-UI/src/scss/layout/_grid.scss`. Detalhes completos em [Project.md](Project.md) ("Cabeçalho de arquivo").
*Live reference: `Dexter-UI/src/scss/layout/_grid.scss`. Full details in [Project.md](Project.md) ("File header").*

---

## 4. Mapa do repositório / Repository map

✅ existe · ⏳ planejado

```
Dexter-CSS/                         # raiz do repositório
├─ .agents/                         # ✅ documentação para agentes
│   ├─ agents-info.md               #    este arquivo
│   ├─ Project.md  Colors.md  WebFonts.md
│   └─ skills/                      #    skills de terceiros (fora do framework)
├─ skills/                          # ✅ cópia duplicada de claude-code-setup (ver §8)
├─ AGENTS.md  CLAUDE.md             # ✅ redirecionam para .agents/agents-info.md
├─ package.json  package-lock.json  LICENSE  README.md  .gitignore
└─ Dexter-UI/                       # ← TODO o framework
    ├─ src/scss/
    │   ├─ dexter.scss              # ✅ entrada principal (@use)
    │   ├─ dexter-print.scss        # ✅ entrada autônoma de impressão (@media print)
    │   ├─ abstracts/               # ✅ _config, _breakpoints, _functions, _index
    │   ├─ base/                    # ✅ _reset, _root, _typography, _elements, _print
    │   ├─ layout/                  # ✅ _container, _grid, _gutters
    │   ├─ utilities/               # ✅ display, flex, position, sizing, spacing, borders, shadows, interactions, transitions, colors, text, vertical-align, filters, shapes-masks, blends, z-index
    │   ├─ components/              # ✅ images; tables (striped, hover 700ms, active, bordered, table-card, suite Bootstrap Table); prose; loaders (25+ modelos, skeletons lazy loading, pace.js barras, tamanhos, cores, alinhamentos, backdrop); forms (inputs hover/foco suave 700ms na paleta Dexter, selects com options zebrados, switches, grupos, validação, Awesome Bootstrap Checkbox, iCheck Bootstrap e DexterSelect); avatars (12 tamanhos, 5 formas, status, avatar-group com hover 700ms, anéis story); dropdowns (Dallas Lu multiníveis infinitos, dropend, dropstart, hover/click, 28 cores oficiais); toasts (grid de 9 posições, countdown bar animada, pause-on-hover, snacks em pílula, glassmorphism, 28 cores oficiais); code (blocos de código e sintaxe PrismJS Okaidia / Monokai, janelas macOS, botão de cópia, line-numbers)
    │   ├─ themes/  email/          # ⏳
    ├─ src/js/                      # ✅ dexter-table.js, dexter-code.js, dexter-dropdown.js, dexter-select.js, dexter-toast.js (DexterToast vanilla JS com grid de 9 quadrantes e countdown)
    ├─ scripts/build-css.mjs        # ✅ build do CSS (Sass + PostCSS) para dexter e dexter-print
    ├─ dist/css/                    # ✅ dexter.css, dexter.min.css, dexter-print.css, dexter-print.min.css (+ maps)
    ├─ dist/js/                     # ✅ dexter-table.js, dexter-code.js, dexter-dropdown.js, dexter-select.js, dexter-toast.js
    ├─ examples/                    # ✅ Portal de documentação no padrão D4Sign/ReadMe (layout com topbar, sidebar, toc, tema claro/escuro)
    │   ├─ docs.css                 # ✅ Estilos compartilhados do layout de documentação e code windows Okaidia/Monokai
    │   ├─ index.html               # ✅ Introdução ao framework
    │   ├─ colors.html              # ✅ Catálogo das 28 cores com escala tonal de 13 passos
    │   ├─ typography.html          # ✅ Tipografia e display fluido
    │   ├─ prose.html               # ✅ Conteúdo Tipográfico (Prose): markdown, artigos, .not-prose, medidas e temas
    │   ├─ loaders.html             # ✅ Loaders, Skeletons (Lazy Loading) e barras de progresso Pace.js
    │   ├─ forms.html               # ✅ Formulários, inputs com foco na paleta, selects zebrados com DexterSelect, Awesome Checkbox, iCheck e switches
    │   ├─ avatars.html             # ✅ Suíte de Avatares: 12 tamanhos, 5 formas, status com pulso, avatar-group empilhado e anéis story
    │   ├─ dropdowns.html           # ✅ Menus Suspensos Multiníveis (Dallas Lu pattern), dropend, dropstart, hover e 28 cores oficiais
    │   ├─ toasts.html              # ✅ Notificações Toast & Snackbars: 9 quadrantes, countdown bar, pause-on-hover, glassmorphism e 28 cores
    │   ├─ images.html              # ✅ Imagens, formas, filtros, visão noturna, 2.5D, 3D flip, slider e efeitos
    │   ├─ tables.html              # ✅ Tabelas: variantes, listras, hover 700ms, table-card SaaS, responsivas, empilhadas e suíte interativa Bootstrap Table (dexter-table.js)
    │   ├─ utilities.html           # ✅ Espaçamentos, bordas, sombras e cursores
    │   ├─ elements.html            # ✅ Elementos nativos, tabelas, forms e dialogs
    │   └─ print.html               # ✅ Demonstração e testes de impressão (@media print)
    ├─ assets/  templates/  docs/  skills/dexter-ui/   # ⏳
    └─ llms.txt                     # ⚠️ rascunho fora do formato llmstxt.org; llms-full.txt ⏳
```

---

## 5. Comandos / Commands

Execute na raiz do repositório. / Run from the repository root.

| Comando | O que faz |
|---------|-----------|
| `npm install` | Instala dependências |
| `npm run build` (alias `build:css`) | Compila Sass com `Dexter-UI/scripts/build-css.mjs` → `Dexter-UI/dist/css/dexter.css` (+ `.map`) e `dexter.min.css`. O CSS final mantém **só o cabeçalho do arquivo de entrada** (os cabeçalhos dos partials são removidos) |

Os demais scripts do `package.json` (`dev`, `lint`, `format`, `test`) **ainda não têm configuração funcional** (ver seção 8).
*The remaining `package.json` scripts (`dev`, `lint`, `format`, `test`) **have no working configuration yet** (see section 8).*

---

## 6. Convenções técnicas / Technical conventions

**Sass**
- Use `@use` / `@forward`. **Nunca** `@import` (obsoleto).
- Funções globais obsoletas: use `math.percentage`, `math.div`, `@if/@else` (não `if()`), `color.channel` quando precisar de canais.
- **Chaves de breakpoint entre aspas** (`"2xl"`): sem aspas, o Sass lê `2xl` como número com unidade.
- Configuração só no arquivo de entrada, antes dos demais `@use`: `@use "abstracts" with ($primary: …);` (testado).
- Compilação deve terminar **sem avisos** (`npm run build`).
- **Tipografia responsiva:** use `fluid-size($min, $max)` (em `rem`) de `abstracts/_functions.scss` para gerar `clamp()` que cresce linearmente entre 576px e 1536px. Não escreva `clamp()` à mão.

**Tokens e classes**
- Prefixo `dx` (`$prefix`). Variáveis: `--dx-primary`, `--dx-font-body`, `--dx-gutter-x`, `--dx-z-modal`…
- Variáveis por componente, sobrescrevíveis: `--dx-btn-bg`, `--dx-btn-color`.
- Temas em `[data-dx-theme="…"]`, sem recompilar.

**Breakpoints (mobile first, `min-width`):** `xs` <576 · `sm` 576 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536. Infixo de classe: `-sm`, `-md`… (nenhum para `xs`). Use `media-up($bp)` e `breakpoint-infix($bp)`.

**Layout implementado**
- **Container:** `.container`, `.container-fluid`, `.container-{sm…2xl}` (padding lateral `--dx-container-padding-x`).
- **Grid (flexbox):** `.row` + `.col`, `.col-auto`, `.col-1`…`.col-14`, `.offset-0`…`.offset-13`, `.order-first|0–5|last`, `.row-cols-{1,2,7,14,auto}`. Todas com variantes `-{bp}-`. O número de colunas é `$grid-columns` (14) **em tempo de compilação**.
- **Gutters:** `--dx-gutter-x` / `--dx-gutter-y`; classes `.g-*`, `.gx-*`, `.gy-*` (0–5) com variantes por breakpoint.
- **z-index:** camadas semânticas `--dx-z-*` (dropdown 1000 … alert-floating 1100) e utilitários `.z-n1`, `.z-0`…`.z-3`, `.z-{camada}`.
- **Tipografia (`base/_typography.scss`):** `h1`–`h6` e `.h1`–`.h6` (mesma aparência; h1–h3 fluidos), `.display-1`–`.display-6`, `.lead`, `p`, texto em linha (`small`/`.small`, `mark`/`.mark`; `strong`, `em`, `del`, `s`, `ins`, `u` usam o estilo nativo), `abbr[title]` e `.initialism`, `.blockquote` + `.blockquote-footer` (alinhe com `.text-center`/`.text-end` no `figure`), listas (`ul`/`ol` com recuo `--dx-list-padding-start`, aninhadas sem margem extra, `dl`/`dt`/`dd` alinháveis com `.row` + `.col-*`, `.list-unstyled`, `.list-inline`). **O reset zera margem e padding** (`* { margin: 0; padding: 0 }`), por isso a tipografia restaura recuos e margens. Escala em `$font-sizes`, `$display-sizes`, `$font-weights`, `$line-heights`, `$letter-spacings` → `--dx-fs-*`, `--dx-display-*`, `--dx-fw-*`, `--dx-lh-*`, `--dx-ls-*`.
- **Utilitários de texto** (`!important`): `.fs-1`–`.fs-6` (+ `.fs-{bp}-N`, ex.: `.fs-5 .fs-lg-3`), `.fw-{light,normal,medium,semibold,bold,extrabold}`, `.fst-{italic,normal}`, `.lh-{1,tight,base,loose}`, `.ls-{tight,normal,wide,wider,widest}`, `.font-{body,title,code}`, `.text-{start,center,end}` (+ `-{bp}-`), `.text-{lowercase,uppercase,capitalize}`, `.text-decoration-*`, `.text-{wrap,nowrap,truncate,break,balance}`.
- **Utilitários de cores e fundos (`utilities/_colors.scss`):** 28 famílias de cores (5 oficiais + 23 estendidas) com `.text-{cor}` e `.bg-{cor}`, além de todos os 13 passos da escala tonal: `.text-{cor}-{passo}` e `.bg-{cor}-{passo}` (ex.: `.bg-primary-050`, `.text-purple-700`). Cores auxiliares: `.text-white`, `.text-black`, `.text-body`, `.text-muted`, `.bg-white`, `.bg-black`, `.bg-transparent`, `.bg-body`.
- **Utilitários de espaçamento (`utilities/_spacing.scss`):** base `$spacer: 1rem` gerando escala 0 a 5 + auto e margens negativas (`-n1` a `-n5`). Classes responsivas: `.m-*`, `.mt-*`, `.mb-*`, `.ms-*`, `.me-*`, `.mx-*`, `.my-*`, `.p-*`, `.pt-*`, `.pb-*`, `.ps-*`, `.pe-*`, `.px-*`, `.py-*`, `.gap-*`, `.row-gap-*`, `.column-gap-*` (todas aceitam infixo `-{bp}-`).
- **Utilitários de bordas e raio (`utilities/_borders.scss`):** `.border`, `.border-{top,end,bottom,start}`, `.border-0`, larguras `.border-1` a `.border-5`, cores `.border-{cor}` para todas as 28 cores, e raio de arredondamento `.rounded`, `.rounded-sm`, `.rounded-lg`, `.rounded-xl`, `.rounded-2xl`, `.rounded-pill`, `.rounded-circle`, `.rounded-{top,end,bottom,start}` via `--dx-radius-*`.
- **Utilitários de sombras (`utilities/_shadows.scss`):** `.shadow-none`, `.shadow-sm`, `.shadow` (base), `.shadow-lg`, `.shadow-inset`. Modificadores de intensidade: `.shadow-light` (mais clara/suave), `.shadow-normal` (padrão), `.shadow-dark` (mais escura/marcada), `.shadow-darker` (intensa). Sombras coloridas pelo tema e paleta: `.shadow-{cor}` para todas as 28 cores. No tema escuro (`[data-dx-theme="dark"]`), as opacidades aumentam automaticamente para garantir contraste sobre fundos escuros.
- **Utilitários de interação e ponteiro (`utilities/_interactions.scss`):** cursores `.cursor-{pointer,default,not-allowed,wait,text,move,grab,grabbing}`, eventos de ponteiro `.pe-auto`, `.pe-none`, e seleção de texto `.user-select-{all,auto,none,text}`.
- **Loaders, Lazy Loading & Progresso (`components/_loaders.scss`):**
  - **Modelos animados (25 modelos):** `.loader-ring` / `.loader-1`, `.loader-orbit` / `.loader-2`, `.loader-dual-ring` / `.loader-3`, `.loader-quad` / `.loader-4`, `.loader-dots` / `.loader-5`, `.loader-cube` / `.loader-6`, `.loader-wings` / `.loader-7`, `.loader-bars` / `.loader-8`, `.loader-equalizer` / `.loader-9`, `.loader-barber` / `.loader-10`, `.loader-candy` / `.loader-11`, `.loader-progress` / `.loader-12`, `.loader-slide` / `.loader-13`, `.loader-pacman` / `.loader-14`, `.loader-hourglass` / `.loader-15`, `.loader-gears` / `.loader-16`, `.loader-typing` / `.loader-17`, `.loader-skeleton-card` / `.loader-18`, `.loader-skeleton-media` / `.loader-19`, `.loader-skeleton-product` / `.loader-20`, `.loader-skeleton-text` / `.loader-21`, `.lds-hourglass` / `.loader-22`, `.lds-ripple` / `.loader-23`, `.lds-spinner` / `.loader-24`, `.lds-ellipsis` / `.loader-25`.
  - **Efeitos utilitários Loading.io (`loading.io/animation`):** `.ld-spin`, `.ld-spin-reverse`, `.ld-beat`, `.ld-bounce`, `.ld-pulse`, `.ld-shake`, `.ld-float`, `.ld-fade`, `.ld-blink`, `.ld-swing`, `.ld-rubber`, com modificadores de velocidade `.ld-fast`, `.ld-slow`, `.ld-pause`, `.ld-running`.
  - **Tamanhos modulares:** `.loader-size-1` / `.loader-sm` (`--size: 1px`), `.loader-size-2` / `.loader-md` (`--size: 2px`), `.loader-size-3` / `.loader-lg` (`--size: 3px`), `.loader-size-4` / `.loader-xl` (`--size: 4px`), além de `.loader-xs` (`--size: 0.5px`), `.loader-2xl` (`--size: 5px`), `.loader-3xl` (`--size: 6px`).
  - **Cores modulares:** `.loader-{cor}` para todas as 28 famílias de cores e aliases em português da paleta oficial de `_colors.scss` (alimentando `--color-1` a `--color-4`, `--color-track` e `color: var(--color-2)`), incluindo `.loader-light` e `.loader-dark`.
  - **Alinhamento e posicionamento:** `.loader-left`, `.loader-center`, `.loader-right`, `.loader-top`, `.loader-bottom`, `.loader-inline`, `.loader-float-left`, `.loader-float-right`, `.loader-absolute`, `.loader-absolute-center`, `.loader-fixed-center` e `.loader-backdrop`.
  - **Lazy Loading Pure CSS (ThatSoftwareDude inspired):** componente `.card-skeleton` e utilitários atômicos `.skeleton`, `.skeleton-avatar` (`-sm`, `-lg`), `.skeleton-title`, `.skeleton-text` (`-sm`, `-lg`), `.skeleton-thumbnail` (`.skeleton-img`), `.skeleton-btn`, `.skeleton-badge` com animação `@keyframes shimmer` contínua por `translateX(-100%)` a `(100%)` e suporte automático a Dark Mode (`[data-dx-theme="dark"]`).
  - **Barras estilo Pace.js:** `.pace-topbar`, `.pace-barber-shop` e `.pace-corner-radar` inspiradas em <https://codebyzach.github.io/pace/>.
  - **Materialize CSS Preloaders (`materializecss.com/preloader.html`):** barras lineares `.progress` escopadas via `:has(> .determinate, > .indeterminate)` (`.determinate`, `.indeterminate`, `.progress-{cor}`) e spinners circulares `.preloader-wrapper` (`.small` 36px, padrão 50px, `.big` 64px, `.active`, modo único `.spinner-{cor}-only` para 28 cores + Flashing 4 cores `.spinner-blue|red|yellow|green`) com suporte a Dark Mode e `prefers-reduced-motion`.

- **Formulários e Controles (`components/_forms.scss`):**
  - Inspirado na ergonomia e mecânica de foco/sombra interna do **Bootstrap 3.4/3.5** (`inset 0 1px 2px rgba(0, 0, 0, 0.075)` + glow colorido suave com halo de 8px `0 0 8px rgba(var(--dx-primary-rgb), 0.55)`), 100% integrado à paleta de 28 cores do Dexter UI.
  - **Campos de entrada (`.form-control`):** inputs text, email, password, search, number, tel, url com hover state e halo de foco primário.
  - **Modificadores de tamanho:** `.form-control-sm` / `.input-sm` (30px) e `.form-control-lg` / `.input-lg` (48px).
  - **Controles estendidos:** `textarea.form-control`, `.form-select` com chevron SVG customizado embutido, `.form-control-color` e `.form-control-file` com botão estilizado.
  - **Estrutura de layout:** `.form-group`, `.form-label` com indicador `.required` (`::after { content: " *"; color: var(--dx-red); }`), `.form-text` / `.help-block`.
  - **Seleções customizadas:** `.form-check`, `.form-check-input`, `.form-check-label` (checkbox e radio) e `.form-switch` (interruptor reativo).
  - **Grupos de entrada (`.input-group`):** `.input-group-text` / `.input-group-addon`, suporte a prefixos, sufixos, botões acoplados e tamanhos `.input-group-sm` / `.input-group-lg`.
  - **Validação de formulários:** estados `.is-valid` / `.has-success`, `.is-invalid` / `.has-error` e `.has-warning` com halos temáticos e mensagens `.valid-feedback` / `.invalid-feedback`.
  - **Cores temáticas de foco:** `.form-control-{cor}` para todas as 28 cores da paleta oficial do Dexter UI e aliases em português.
  - **Botões base para formulários:** `.btn`, `.btn-sm`, `.btn-lg`, `.btn-primary`, `.btn-secondary`, `.btn-outline-primary`.
  - **Dark mode:** suporte nativo via `[data-dx-theme="dark"]` com fundos profundos da família Midnight e bordas ajustadas.
  - **Página de documentação:** `examples/forms.html` completa e interativa integrada ao menu de navegação de todas as páginas.

- **Blocos de Código e Janelas estilo Terminal/macOS (`components/_code.scss`, `dexter-code.js`):**
  - Tema canônico **Okaidia / Monokai** de alta fidelidade visual.
  - Suporte completo às classes de cabeçalho `.code-header` e `.code-window-header`.
  - Controles estilo macOS com bolinhas coloridas `.code-dots` (`.dot-close` / `.red`, `.dot-minimize` / `.yellow`, `.dot-maximize` / `.green`).
  - Badge de linguagem (`.code-badge` / `.code-lang`) e botão de cópia com feedback (`.code-copy-btn` / `.btn-copy-code`) com ícone SVG inteligente injetado automaticamente e alinhamento flex horizontal perfeito (`margin-inline-start: auto;`).
  - Destaque sintático nativo zero-dependência para HTML/XML, JavaScript, CSS, SCSS e Bash/Shell via `DexterCode`.

- **Tags, Badges, Chips e Autocomplete Multiselect (`components/_tags.scss`, `dexter-tags.js`):**
  - Inspirado e aprimorado a partir do **bootstrap5-tags** (`github.com/lekoala/bootstrap5-tags`), **tagin** (`github.com/erwinheldy/tagin`) e **bootstrap-tag-input** (`github.com/More-Than-Solitaire/bootstrap-tag-input`), eliminando dependências externas (zero jQuery e zero Bootstrap JS).
  - **Badges Standalone:** variantes sólidas (`.badge-{cor}`), suaves (`.badge-soft-{cor}`) e de contorno (`.badge-outline-{cor}`) para todas as 28 cores oficiais, com suporte a pílula (`.badge-pill`), ponto de status (`.badge-dot`) e botão de fechar (`.badge-close`).
  - **Controlador Nativo Vanilla JS (`DexterTags` / `Tagin` / `initTags`):** converte nativamente `<select multiple>`, `<input>` ou contêineres `<div class="tags-input form-control">` em campos interativos de chips com auto-inicialização via `[data-dx-tags]`, `.form-tags`, `.tagin`, `.tags-input`, ou `[data-role="tagsinput"]`.
  - **Compatibilidade Bootstrap Tag Input (More-Than-Solitaire):** suporte direto a `<div class="tags-input form-control">` integrados em `.input-group`, criação automática de input oculto para submissão via `data-name="meuCampo"`, separadores regex customizados via `data-splitchars="[;']"`, estilização de cores via `.tag-bg-{cor}` para todas as 28 cores do framework e função global `initTags(tagsList)` com métodos `addTag()`, `addTags()`, `removeTag()`, `resetTags()`, `refreshTags()` e `getValue()`.
  - **Recursos Tagin Integrados:** transformações de texto em tempo real (`data-transform="hashtag|lowercase|uppercase|slug"` ou função `transform`), separadores customizados por tecla de espaço (`data-separator=" "`), colagem inteligente de múltiplos termos (`paste`) e edição imediata de tags por **duplo clique**.
  - **Menu de Sugestões Dropdown:** navegação acessível por teclado (ArrowDown, ArrowUp, Enter, Tab, Escape, Backspace para remover última tag), pesquisa e filtro com realce de termo (`.form-tags-highlight`).
  - **Recursos Avançados:** criação livre de novas tags (`data-allow-new="true"`), limite máximo com contador em tempo real (`data-max="N"`), botão de limpar tudo (`data-clear="true"`), estilos visuais (`data-badge-style="solid|soft|outline"`), tamanhos (`.form-tags-sm`, `.form-tags-lg`), validação (`.is-valid`, `.is-invalid`) e suporte nativo a Dark Mode.
  - **Página de Documentação:** `examples/tags.html` com demonstrações interativas completas de todos os modos e integrada à navegação de todas as páginas.

- **Avaliação por Estrelas & Reviews Fracionadas (`components/_rating.scss`, `dexter-rating.js`):**
  - Inspirado e aprimorado a partir do **Krajee Bootstrap Star Rating** (`github.com/kartik-v/bootstrap-star-rating`), eliminando a dependência de jQuery.
  - **Preenchimento Fracionado Preciso:** corte contínuo por CSS clipping permitindo meias estrelas (`step="0.5"`) ou frações decimais arbitrárias (`step="0.1"`).
  - **Símbolos Vetoriais SVG:** suporte a estrelas (`star`), corações (`heart`), polegares (`thumb`) e círculos (`circle`).
  - **Recursos Nativos:** botão de limpeza/reset (`.rating-clear`), legendas reativas em badges (`.rating-caption`), modo somente leitura (`.rating-readonly`) para médias de avaliações, 5 tamanhos modulares (`.rating-xs` a `.rating-xl`), navegação por teclado (setas, Home, End, Delete), integração às 28 cores e Dark Mode.
  - **Página de Documentação:** `examples/rating.html` completa e interativa integrada a todas as páginas do framework.

- **Seleção Múltipla com Dropdown & Checkboxes (`components/_multiselect.scss`, `dexter-multiselect.js`):**
  - Inspirado e aprimorado a partir do **BsMultiSelect** (`github.com/DashboardCode/BsMultiSelect`), eliminando qualquer dependência de jQuery.
  - **Gatilho com Chips e Resumo Condensado:** badges interativas removíveis no gatilho ou contador condensado automático (`data-collapse-after="N"`, ex: "4 selecionados") para evitar sobrecarga visual.
  - **Menu Suspenso com Checkboxes:** cada opção possui caixa de seleção funcional, suporte hierárquico completo a `<optgroup>`s, barra de pesquisa em tempo real com realce (`.multiselect-highlight`), e barra de ferramentas (*Selecionar Todos / Limpar*).
  - **Recursos Corporativos:** navegação por teclado, estados de validação (`.is-valid`, `.is-invalid`), sincronização contínua com formulários nativos, suporte às 28 cores oficiais e Dark Mode nativo.
  - **Página de Documentação:** `examples/multiselect.html` com demonstrações interativas e integrada à navegação de todas as páginas.

- **Seletor Numérico Stepper & Contador (`components/_spinner.scss`, `dexter-input-spinner.js`):**
  - Inspirado e aprimorado a partir do **bootstrap-input-spinner** (`github.com/shaack/bootstrap-input-spinner`), eliminando qualquer dependência externa.
  - **Aceleração Contínua ao Pressionar:** cliques longos aceleram a taxa de incremento/decremento automaticamente.
  - **Prefixos & Sufixos Integrados:** suporte a moedas (`data-prefix="R$"`), unidades (`data-suffix="kg"`), percentuais (`data-suffix="%"`) com formatação decimal precisa baseada em `step`.
  - **Layouts Flexíveis:** layout horizontal padrão (`[-] [input] [+]`) e layout vertical empilhado (`.spinner-stacked` com botões `▲`/`▼` à direita).
  - **Recursos Nativos:** navegação completa por teclado (setas, PageUp/PageDown, Home/End), suporte a `min`, `max`, `step`, estados de validação (`.is-valid`, `.is-invalid`), integração às 28 cores oficiais e Dark Mode nativo.
  - **Página de Documentação:** `examples/spinner.html` com demonstrações interativas e integrada à navegação de todas as páginas.

- **Carrossel & Slider Multi-Item (`components/_carousel.scss`, `dexter-carousel.js`):**
  - Inspirado e aprimorado a partir do **bootstrap5-carousel-multi** (`github.com/jibarradelgado/bootstrap5-carousel-multi`), eliminando qualquer dependência externa.
  - **Deslizamento Suave 1 a 1:** elimina os saltos rígidos de páginas inteiras através de transições 3D aceleradas por hardware calculadas dinamicamente via `item.offsetLeft`.
  - **Múltiplos Cartões Responsivos:** exibe 1 item em celulares, 2 em tablets, 3 em telas médias e 4 em desktops via CSS variables `--items-visible`.
  - **Touch Swipe & Mobile:** suporte nativo a gestos de arrasto e deslizamento touch com detecção de limiar e prevenção de interferência de scroll.
  - **Autoplay Inteligente:** ciclo contínuo com pausa automática ao passar o cursor do mouse (`pauseOnHover`).
  - **Controles & Indicadores:** botões de navegação circulares flutuantes com sombras suaves (`.carousel-controls-outside` opcional) e pílulas indicadoras de posição ativas.
  - **Design System & Dark Mode:** suporte total às 28 cores oficiais (`.carousel-{cor}`) e ao tema escuro `[data-dx-theme="dark"]`.
  - **Página de Documentação:** `examples/carousel.html` com demonstrações interativas e integrada à navegação global de todas as páginas.

- **Abas, Abas Verticais & Tabs-X (`components/_tabs.scss`, `dexter-tabs.js`):**
  - Inspirado e aprimorado a partir do **bootstrap-5-vertical-tabs** (`github.com/tromgy/bootstrap-5-vertical-tabs`) e **bootstrap-tabs-x** (`kartik-v/bootstrap-tabs-x`), eliminando qualquer dependência externa (sem jQuery e sem Bootstrap JS).
  - **Fusão Perfeita de Bordas & Orientações Tabs-X:** suporte nativo a `.vtabs` / `.vtabs-left` / `.vtabs-right` e `.tabs-x` em todas as 4 orientações (`.tabs-above`, `.tabs-below`, `.tabs-left`, `.tabs-right`), alinhamentos (`.tab-align-left|center|right`), painéis com borda fundida (`.tab-bordered`), rotação lateral moderna em CSS puro (`.tab-sideways` via `writing-mode: vertical-rl`) e alturas fixas roláveis (`.tab-height-xs..lg`).
  - **Controlador Nativo (`DexterTabs`, `DexterScrollableTabs`, `DexterTabsX` / `TabsX`):** compatibilidade com `data-dx-toggle="tab"`, `data-bs-toggle="tab"`, carregamento remoto assíncrono via `data-url` / `loader` com cache TTL (`cacheTimeout`, `flushCache()`, spinner CSS `.kv-tab-loading`), navegação por teclado WAI-ARIA, ponte jQuery opcional (`$.fn.tabsX`), 28 cores oficiais (`.vtabs-{cor}`, `.tabs-x-{cor}`) e Dark Mode nativo (`[data-dx-theme="dark"]`).
  - **Página de Documentação:** `examples/tabs.html` (incluindo Seção 10 interativa de Tabs-X).

- **Assistente de Passos Multi-Etapas (`components/_wizard.scss`, `dexter-wizard.js`):**
  - Inspirado e aprimorado a partir do **jqueryBootstrapWizard** e **step-wizard-ui-bootstrap**, eliminando dependências externas (sem jQuery e sem plugins externos).
  - **Círculos Numerados & Conectores Dinâmicos:** círculos de etapas com numeração automática, ícone de checkmark `✓` ao concluir (`.completed`), e barra de progresso fluida animada proporcional ao número de etapas.
  - **Validação Integrada de Formulários:** suporte a `data-validate="true"`, validando automaticamente os campos obrigatórios (`required`, e-mails, etc.) com a API HTML5 de formulários e classes de validação do Dexter UI (`.is-invalid`, `.invalid-feedback`) antes de liberar o avanço.
  - **Layouts Horizontal & Vertical:** modo horizontal padrão (`.wizard`) e vertical em coluna (`.wizard-vertical`), com linha conectora vertical contínua.
  - **Navegação & Botões Automáticos:** botões `Anterior`, `Próximo` e `Finalizar` gerenciados automaticamente, com desativação na primeira etapa e exibição do botão de conclusão na última etapa.
  - **Design System & Dark Mode:** suporte total às 28 cores oficiais (`.wizard-{cor}`) e tema escuro nativo `[data-dx-theme="dark"]`.
  - **Página de Documentação:** `examples/wizard.html` com demonstrações interativas e integrada à navegação global de todas as páginas.

- **Modais & Diálogos Dinâmicos (`components/_modals.scss`, `dexter-modal.js`):**
  - Inspirado e aprimorado a partir do **bootstrap-show-modal** (`shaack/bootstrap-show-modal`), permitindo uso estático em marcação HTML e criação dinâmica 100% via JavaScript (`dexter.showModal`, `dexter.showAlert`, `dexter.showConfirm`, `dexter.showPrompt`).
  - **Zero Dependências:** código Vanilla JS ultra-leve sem jQuery nem dependência do Bootstrap JS externo.
  - **APIs Assíncronas com Promises:** `dexter.showAlert(...)`, `dexter.showConfirm(...)` e `dexter.showPrompt(...)` retornam Promises para um fluxo assíncrono limpo com `await`.
  - **Gerenciamento e Limpeza Automática do DOM:** modais dinâmicos (`data-dx-dynamic="true"`) removem-se automaticamente do DOM e descartam listeners após o fechamento e transição de fade.
  - **Design System & Dark Mode:** suporte a todas as 28 cores temáticas oficiais (`.modal-header-{cor}`), tamanhos (`.modal-sm`, `.modal-lg`, `.modal-xl`, `.modal-fullscreen`), backdrop com desfoque (`backdrop-filter: blur(4px)`), centralização vertical (`.modal-dialog-centered`) e scroll interno (`.modal-dialog-scrollable`).
  - **Página de Documentação:** `examples/modals.html` com demonstrações interativas de todas as variantes e integrada à navegação global de todas as páginas.

- **Estabilização de Blocos de Código & Cabeçalhos (`components/_code.scss`, `dexter-code.js`):**
  - Correção definitiva do vazamento de `white-space: pre` que causava distorção vertical e empilhamento indevido de badges (`.code-badge`) e botões (`.code-copy-btn`) em cabeçalhos de código.
  - Isolamento estrito de `white-space: pre !important` exclusivamente na tag `<pre>`, garantindo `white-space: normal` para `.code-window` e `.code-window-header`.
  - Estruturação modular com sub-container `.code-actions` alinhado via flexbox (`margin-inline-start: auto`), mantendo as bolinhas macOS (`.code-dots`) à esquerda e as ações de cópia/badge agrupadas à direita.

- **Acordeão & Colapso (`components/_accordion.scss`, `dexter-accordion.js`):**
  - Inspirado e aprimorado a partir do **accordion-bs5** (`hiltonmuccillo/accordion-bs5`) e nas especificações canônicas do Bootstrap 5, eliminando qualquer dependência externa.
  - **Transição Fluida CSS de Altura:** expansão e recolhimento suaves através de `.collapse`, `.collapsing` e `.collapse.show` com cálculo dinâmico de `scrollHeight` e suporte a `prefers-reduced-motion`.
  - **Exclusão Mútua & Abertura Múltipla:** suporte nativo ao agrupamento pai (`data-dx-parent`) para fechamento automático dos demais itens ou modo independente (`alwaysOpen` / sem parent).
  - **Barra de Ações Globais:** botões declarativos (`data-dx-accordion-action="open-all"` e `data-dx-accordion-action="close-all"`) e métodos programáticos (`acc.openAll()`, `acc.closeAll()`, `acc.toggle()`) para controle em lote.
  - **Variantes de Layout:** modo contínuo padrão (`.accordion`), nivelado sem bordas externas (`.accordion-flush`), separado em cartões independentes (`.accordion-bordered` / `.accordion-separated`), ícone no início/esquerda (`.accordion-icon-start`), alternador mais/menos (`.accordion-plus-minus`) e minimalista transparente (`.accordion-minimal`).
  - **Acessibilidade WAI-ARIA & Teclado:** conformidade total com o padrão WAI-ARIA Accordion Pattern com navegação por teclado (<kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>Home</kbd>, <kbd>End</kbd>).
  - **Design System & Dark Mode:** suporte a todas as 28 cores temáticas oficiais (`.accordion-{cor}` e `.accordion-solid`) com coloração currentColor via máscara CSS sem poluição de SVG e suporte nativo ao Modo Escuro `[data-dx-theme="dark"]`.
  - **Página de Documentação:** `examples/accordion.html` com demonstrações interativas de todas as variantes e integrada à navegação global de todas as páginas.

- **Select Moderno / SelectPicker (`components/_select.scss`, `dexter-select.js`):**
  - Inspirado e aprimorado a partir do **bootstrap-select** (`developer.snapappointments.com/bootstrap-select`), eliminando 100% das dependências de jQuery e Bootstrap JS em favor de Vanilla JS moderno e CSS puro.
  - **Pesquisa em Tempo Real (Live Search):** busca instantânea insensível a maiúsculas/minúsculas e acentos (normalização diacrítica NFD, ex: "japao" localiza "Japão") com mensagem customizável de nenhum resultado (`data-none-results-text`).
  - **Seleção Única e Múltipla com Contagem:** suporte a seleção única e múltipla (`multiple`), exibição delimitada ou compactada (`data-selected-text-format="count > x"`), e formatação inteligente de contagem.
  - **Barra de Ações Rápidas (Actions Box):** botões de "Selecionar Todos" e "Desmarcar Todos" integrados (`data-actions-box="true"`).
  - **Riqueza Semântica de Opções:** suporte a subtítulos (`data-subtext`), ícones SVG/Font (`data-icon`), conteúdo HTML customizado (`data-content`), divisores visuais (`data-divider="true"`) e grupos de opções (`<optgroup>`).
  - **Limite Máximo de Seleção:** imposição declarativa de limite (`data-max-options="x"`) com alerta visual automático inline.
  - **Detecção Inteligente de Espaço (Dropup Automático):** inversão automática para abertura superior (`.is-dropup`) quando o espaço inferior na viewport for insuficiente (< 290px).
  - **Acessibilidade WAI-ARIA & Teclado:** navegação por teclado completa (<kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>Escape</kbd>, <kbd>Tab</kbd>) e suporte a leitores de tela via atributos ARIA (`aria-expanded`, `aria-haspopup`, `aria-selected`).
  - **Design System & Dark Mode:** suporte a todas as 28 cores temáticas oficiais (`.select-{cor}`, `.select-solid`, `.select-outline`), tamanhos (`.select-sm`, `.select-lg`), visual com linhas zebradas e suporte nativo ao Modo Escuro `[data-dx-theme="dark"]`.
  - **Página de Documentação:** `examples/select.html` com 11 seções interativas cobrindo todos os cenários da SnapAppointments, blocos de código Monokai com botão de cópia e integrada à navegação global de todas as 25 páginas de exemplo.

- **Select Moderno / SelectPicker (`components/_select.scss`, `dexter-select.js`):**
  - Inspirado e aprimorado a partir do **bootstrap-select** (`SnapAppointments/bootstrap-select`), reimaginado como um componente nativo, moderno e **100% Vanilla JS sem jQuery nem dependência do Bootstrap JS**.
  - **Seleção Simples & Múltipla:** suporte a `multiple`, contagem dinâmica formatada (`data-selected-text-format="count > 2"`), limite máximo de opções (`data-max-options="2"` com feedback visual inline) e badges elegantes de itens selecionados.
  - **Busca em Tempo Real (Live Search):** campo de busca integrado (`data-live-search="true"`) com normalização de acentos/diacríticos (busca insensível a maiúsculas e acentos em português/inglês) e placeholder customizável (`data-none-results-text`).
  - **Caixa de Ações Rápidas (Actions Box):** botões de seleção rápida declarativos (`data-actions-box="true"`) para "Selecionar Todos" e "Desmarcar Todos".
  - **Subtextos, Ícones e Conteúdo Rico:** suporte a `data-subtext="..."` (metadados discretos), `data-icon="..."` (ícones SVG inline / classes de fonte) e `data-content="..."` (HTML customizado com badges coloridos e formatação avançada).
  - **Grupos de Opções & Divisores:** estilização refinada de `<optgroup>` com contadores e `<option data-divider="true">` para separação lógica e limpa de opções.
  - **Design System, 28 Cores & Linhas Zebradas:** suporte integral a todas as 28 cores do Dexter (`.select-{cor}`, `.select-solid`, `.select-outline`), tamanhos (`.select-sm`, `.select-lg`), visual com linhas alternadas (`.form-select-striped`) e suporte completo a Dark Mode `[data-dx-theme="dark"]`.
  - **Posicionamento Inteligente (Dropup Auto-detect):** detecção automática de espaço na viewport invertendo a abertura para cima (`.is-dropup`) quando próximo ao rodapé da tela.
  - **Acessibilidade WAI-ARIA & Teclado:** navegação completa por teclado (<kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>Enter</kbd>, <kbd>Espaço</kbd>, <kbd>Esc</kbd>, <kbd>Tab</kbd>) e atributos ARIA (`role="combobox"`, `role="listbox"`, `aria-expanded`, `aria-selected`).
  - **Página de Documentação:** `examples/select.html` com 11 seções interativas cobrindo todos os cenários da SnapAppointments, blocos de código Monokai com botão de cópia e integrada à navegação global de todas as 26 páginas de exemplo.

- **Sumário Automático & ScrollSpy (`components/_toc.scss`, `dexter-toc.js`):**
  - Inspirado e aprimorado a partir do **bootstrap-toc** (`afeld/bootstrap-toc`), eliminando 100% das dependências de jQuery e plugins externos em favor de Vanilla JS moderno, alta performance e CSS puro.
  - **Geração Automática de Índice:** varre dinamicamente cabeçalhos da página ou container (`data-toc-target`, `data-toc-content` ou `main`), construindo uma estrutura hierárquica aninhada (`h2`, `h3`, `h4`).
  - **Normalização e Geração de Slugs em Português:** detecta cabeçalhos sem ID e gera slugs únicos e amigáveis (`slugify`), decompondo acentos (normalização diacrítica NFD, ex.: "Configuração" -> `#configuracao`) e prevenindo colisões de ID.
  - **Motor ScrollSpy Nativo de Alta Performance:** rastreia a posição de leitura em tempo real via listeners otimizados com `requestAnimationFrame`, compensando automaticamente cabeçalhos fixos (`offset: 80px`).
  - **Rolagem Suave e Histórico (URL Hash):** ao clicar nos links do sumário, rola suavemente até a seção alvo sem saltos bruscos e atualiza o hash da URL via `history.pushState()`.
  - **Modo Recolhível Hierárquico (Collapsible):** suporte a `.toc-collapsible` ou `data-toc-collapsible="true"`, mantendo subitens recolhidos e expandindo-os de forma fluida conforme a seção ativa.
  - **Estilos Visuais e Variantes:** trilha lateral contínua padrão (`.toc-track`), modo cápsula (`.toc-pills`), marcador pontilhado (`.toc-dots`), tamanhos (`.toc-sm`, `.toc-lg`) e container sticky para barra lateral (`.toc-sticky`).
  - **Design System & Dark Mode:** suporte a todas as 28 cores temáticas oficiais (`.toc-{cor}`) e suporte nativo ao Modo Escuro `[data-dx-theme="dark"]`.
  - **Compatibilidade Drop-in:** compatível com `Toc.init(...)`, `DexterToc.init(...)`, atributos declarativos `data-toggle="toc"` ou `data-dx-toc="true"` e plugin jQuery `$.fn.toc` caso jQuery esteja presente no ambiente.
  - **Página de Documentação:** `examples/toc.html` com layout responsivo de 3 colunas, sumário sticky funcional em tempo real, painel interativo de testes, blocos de código Monokai e navegação integrada em todas as 29 páginas de exemplo.

- **Core UI Kit — Primitivas Bootstrap 5 / Sveltestrap (`components/_buttons.scss`, `components/_alerts.scss`, `components/_cards.scss`, `components/_ui-primitives.scss`, `dexter-ui-kit.js`):**
  - Inspirado no **bestguy/sveltestrap** e nos componentes fundamentais do Bootstrap 5, cobrindo **Botões** (`.btn-{cor}`, `.btn-outline-*`, `.btn-soft-*`, `.btn-ghost-*`, `.btn-pill`, `.btn-group`, `.btn-toolbar`), **Alertas** (`.alert-{cor}`, `.alert-solid-*`, `.alert-outline-*`, `.alert-accent-*`, `.alert-dismissible`), **Cartões** (`.card`, `.card-deck`, `.card-group`, `.card-img-overlay`, `.card-outline-*`, `.card-header-*`), **Breadcrumbs**, **Barras de Progresso**, **List Groups**, **Navbar**, **Offcanvas Drawers** (`.offcanvas-start|end|top|bottom`), **Tooltips** e **Popovers** para todas as 28 cores e Modo Escuro.
  - **Controlador Vanilla JS (`dexter-ui-kit.js`):** `DexterAlert`, `DexterOffcanvas`, `DexterNavbar`, `DexterTooltip` e `DexterPopover` sem dependências externas.
  - **Página de Documentação:** `examples/ui-kit.html`.

- **Calendário de Eventos (`components/_calendar.scss`, `dexter-calendar.js`):**
  - Inspirado no **jquery-bs-calendar** (`ThomasDev-de/jquery-bs-calendar`), reescrito em Vanilla JS puro (com ponte jQuery opcional `$.fn.bsCalendar` / `$.bsCalendar`), utilizando `Intl.DateTimeFormat` para localização (`pt-BR`, `en-US`, `de-DE`, `es-ES`), fontes de eventos estáticas, remotas (`fetch`) ou por função, painel interno/externo (`eventListContainer`), popover ao passar o cursor, eventos delegados, 28 cores e Modo Escuro.
  - **Página de Documentação:** `examples/calendar.html`.

- **Upgrade Form Wizard (`components/_wizard.scss`, `dexter-wizard.js`):**
  - Evolução nativa do assistente incorporando compatibilidade drop-in com **`BootstrapFormWizard`** (`xonipatino/bootstrap-form-wizard`): navegação por pills (`[data-bs-toggle="step"]`), painéis `role="steppanel"`, campos externos ao `<form>` vinculados via `form="..."` + `data-bfw-in-step="N"`, suporte conjunto a `novalidate` + `useBootstrapValidation`, retorno automático à etapa do primeiro campo inválido (`reportValidityForm()`), `forElement()` e `getCurrentStep()`.
  - **Página de Documentação:** `examples/wizard.html` (Seção 5).

- **Barra Lateral Administrativa (`components/_sidebar.scss`, `dexter-sidebar.js`):**
  - Inspirado no **Nelh/Next-sidebar** e no **compostrap/sidebar-menu**, 100% Vanilla JS (sem jQuery, sem FontAwesome e sem PerfectScrollbar), estritamente escopado em `.app .sidebar`, `.dx-sidebar` e `.dx-sidebar-list` para conviver com `.doc-sidebar` e `.dropdown-menu` globais. Suporta trilho recolhido (`70px`) com expansão hover no desktop, acordeão multinível, gaveta mobile com backdrop/Escape, busca expansível no topo (`.search-box` / `.search-input`), modo contido `.app.app-contained`, `.sidebar-light`, 28 cores e Dark Mode.
  - **Compatibilidade Compostrap (`SidebarMenu` / `SidebarMenuApp`):** API idempotente `SidebarMenuApp.init()` (pode ser rechamada após adicionar itens dinâmicos), marcação `.list-item` / `.list-title` / `.list-link` / `.link-arrow` / `.list-hidden` / `.link-current` (`aria-current="page"`), chevron SVG rotativo nativo sem FontAwesome, animação `.bell` nos ícones, linhas guia verticais multinível, variante cápsula (`.sidebar-menu-pills`) e tokens `--sm-*` com `[data-bs-theme="dark"]` e `[data-dx-theme="dark"]`.
  - **Página de Documentação:** `examples/sidebar.html`.

- **Portal de Documentação Unificado e Responsivo (`examples/docs.css`, `examples/docs-shell.js`):**
  - Reestruturação completa das **45 páginas** de exemplo em CSS Grid responsivo de 3 colunas (`.doc-layout`), cabeçalho limpo com apenas 5 categorias principais (`.doc-header`), menu lateral único gerenciado por `docs-shell.js` com filtro instantâneo (`Ctrl+K`) e gaveta offcanvas em telas mobile (`< 992px`), persistência global de tema Claro/Escuro via `localStorage`, Auto-TOC com ScrollSpy e paginação Anterior/Próximo automática (`.doc-pager`).

- **Árvore Hierárquica / Tree View (`components/_treeview.scss`, `dexter-treeview.js`):**
  - Inspirado e aprimorado a partir do **nhmvienna/bs5treeview** (`chniter/bstreeview`), eliminando dependências de jQuery, Bootstrap JS e FontAwesome (com ponte jQuery opcional `$.fn.bstreeview`).
  - **Recursos Nativos:** expansão/recolhimento com chevron SVG rotativo, seleção simples ou múltipla, checkboxes tri-state em cascata (`:indeterminate` e `getChecked()`), pesquisa instantânea insensível a acentos NFD com autoabertura dos ramos encontrados (`search()` / `is-match`), contadores de filhos (`showCounts`), linhas guia (`.treeview-lines`), modos `.treeview-sm`/`.treeview-lg`/`.treeview-flush`, navegação WAI-ARIA por teclado (`↑`/`↓`/`←`/`→`/`Enter`/`Space`), 28 cores oficiais e Modo Escuro nativo.
  - **Página de Documentação:** `examples/treeview.html`.

- **Dashboard Skeleton / Painel Administrativo (`components/_dashboard.scss`, `dexter-dashboard.js`):**
  - Inspirado e aprimorado a partir do **compostrap/dashboard-skeleton**, 100% Vanilla JS (sem jQuery e sem FontAwesome), estritamente escopado em `.dx-dashboard` / `.dashboard-shell` (com modo embutido `.dx-dashboard-contained`).
  - **Recursos Nativos:** tokens em camadas (`--dx-ds-body-bg` / `--dx-ds-surface-bg`) no modo Claro e Escuro (`data-ds-theme` escopado ou `[data-dx-theme="dark"]` / `[data-bs-theme="dark"]`), `.ds-navbar` com `.navbar-nav-breadcrumb` (chevrons em SVG puro CSS), `.custom-dropdown`, `.ds-sidebar` retrátil (`.sidebar-rounded-top-right`) integrada ao `SidebarMenuApp`, cards elevados `.content-box` e `.content-box-kpi`, barra superior `DexterNanobar` (`Nanobar`), alternador `DexterThemeSwitcher` (`ThemeSwitcher`), 28 cores oficiais (`.dashboard-{cor}`) e suporte a `prefers-reduced-motion`.
  - **Página de Documentação:** `examples/dashboard.html`.

- **Consentimento de Cookies LGPD/GDPR (`components/_cookie-consent.scss`, `dexter-cookie-consent.js`):**
  - Inspirado e compatível drop-in com **shaack/bootstrap-cookie-consent-settings**, 100% Vanilla JS (sem Bootstrap JS e sem jQuery), mantendo o alias `BootstrapCookieConsentSettings` ao lado de `DexterCookieConsent`.
  - **Recursos Nativos:** 3 modos de layout (`modal`, `bar-bottom`, `floating-bottom-start` / `floating-bottom-end`), acordeão nativo de preferências granulares por categoria (`necessary`, `statistics`, `marketing`, `personalization`), dicionários i18n embutidos (`pt`, `en`, `es`, `de`) com suporte opcional a `contentURL`/`content`, armazenamento em Cookie Query String + LocalStorage, ativação automática de `<script type="text/plain" data-cookie-category="...">`, 28 cores oficiais (`.cookie-consent-{cor}`), Dark Mode nativo e `prefers-reduced-motion`.
  - **Página de Documentação:** `examples/cookie-consent.html`.

- **Diálogo de Espera e Progresso (`components/_waiting.scss`, `dexter-waiting.js`):**
  - Inspirado e compatível drop-in com **ehpc/bootstrap-waitingfor** (`waitingDialog`), 100% Vanilla JS, com variantes de tamanho (`sm`, `m`, `lg`, `xl`), progresso determinado (`progress(pct, msg)`), execução de Promises (`run()`), loaders CSS integrados, botão cancelável, 28 cores + semânticas e Dark Mode.
  - **Página de Documentação:** `examples/waiting.html`.

- **CSS Moderno, Primitivas Nativas, Data Display, Widgets & E-mail Multi-Framework (`_modern-css.scss`, `_native-b6.scss`, `_data-display.scss`, `_layouts-nav.scss`, `dexter-extras.js`, `email/dexter-email.scss`):**
  - Síntese sem dependências inspirada em **Tailwind CSS v4, UnoCSS, daisyUI v5, Materialize CSS, Bulma v1, Foundation Sites/Emails/Templates, UIkit 3, Skeleton/Skeleton.dev e Bootstrap 6**: utilitários CSS Grid 1..12, Container Queries (`.dx-cq-grid`), Rings, Presets (`[data-dx-preset="skeleton|material|bulma|uikit"]`), `<dialog class="dx-dialog">`, `<details class="dx-details">`, `[popover].dx-popover-native`, `.swap`, `.dx-aura`, `.stats`, `.timeline`, `.chat`, `.radial-progress`, `.countdown`, `.divider`, `.indicator`, `.status`, `.kbd`, `.stack`, mockups de dispositivos, `.hero`, `.dx-app-bar`, `.level`, `.box`, `.panel`, `.message`, `.callout`, `.dock`, `.dx-segmented`, `.collection`, Material Ripple (`DexterRipple`), FAB Speed Dial (`DexterFAB`), comparador Before/After (`DexterDiff`), OTP PIN (`DexterOTP`), Galeria Lightbox (`DexterLightbox`), Filtro Grid (`DexterFilter`), Drilldown (`DexterDrilldown`), `DexterTotop` e Spotlight (`DexterSpotlight`).
  - **Motor de E-mail & Templates Prontos:** `src/scss/email/dexter-email.scss` compilando `dist/css/dexter-email.css` + `.min.css` sem `var()`, acompanhado de 3 templates de e-mail em `templates/email/` (`transactional.html`, `welcome.html`, `newsletter.html`) e 3 templates Web em `templates/web/` (`starter.html`, `landing.html`, `parallax.html`).
  - **Páginas de Documentação:** `examples/modern-css.html`, `examples/data-display.html`, `examples/layouts-widgets.html` e `examples/templates-email.html`.

- **Popover Estendido Modal / Popover-X (`components/_popover-x.scss`, `dexter-popover-x.js`):**
  - Inspirado e compatível drop-in com **kartik-v/bootstrap-popover-x** (`PopoverX` & `PopoverButton`, além de ponte jQuery opcional `$.fn.popoverX` / `$.fn.popoverButton`), 100% Vanilla JS sem dependências obrigatórias.
  - **Recursos Nativos:** 12 posicionamentos direcionais fixos + 7 modos automáticos responsivos com setas CSS coloridas (`.arrow`), cabeçalho e rodapé de ações (`.popover-footer`), suporte a formulários inline, carregamento remoto via `fetch` (`.popover-loading`), 4 tamanhos (`.popover-sm|md|lg|xl`), variantes suaves e sólidas nas 28 cores + semânticas (`.popover-{cor}`, `.popover-solid-{cor}`), fechamento por `Escape` / blur e Dark Mode nativo.
  - **Página de Documentação:** `examples/popover-x.html`.

- **Upgrade Bootstrap-Lightbox (`components/_layouts-nav.scss`, `dexter-extras.js`, `examples/layouts-widgets.html`):**
  - Evolução de `DexterLightbox` (com alias `BS5Lightbox`) para compatibilidade drop-in com **avalon-studio/Bootstrap-Lightbox**: suporta gatilhos `[data-modal*="bs-lightbox"]` além de `[data-dx-lightbox]`, modal `#lightboxModalFullscreen` com `#LightboxCanvas`, agrupamento via `[data-bs-lightbox-gallery]` / `data-dx-lightbox-group` / `data-gallery`, contador (`1 / N`), zoom interativo (`1x` ↔ `1.75x`, tecla `Z`/`+`), resolução de legenda em cascata e atalhos `Escape` / `←` / `→`.

- **Suíte AlertifyJS para Dexter UI (`components/_alertify.scss`, `dexter-alertify.js`, `examples/alertify.html`):**
  - Clone completo e compatível drop-in com **AlertifyJS** (`DexterAlertify` / `alertify`), 100% Vanilla JS sem dependências externas.
  - **Diálogos Core:** `alertify.alert()`, `alertify.confirm()` e `alertify.prompt()` com todas as sobrecargas, callbacks `onok`/`oncancel`, API encadeável (`.set()`, `.setting()`, `.get()`, `.show()`, `.close()`, `.maximize()`, `.restore()`, `.moveTo()`, `.resizeTo()`), cabeçalho arrastável (`movable`), redimensionamento (`resizable`), modo `frameless`/`basic`, transições (`pulse`, `zoom`, `fade`, `slide`), bloqueio com shake no dimmer e alternância nativa entre tema Dexter e **Tema Bootstrap 5/6** (`.ajs-theme-bootstrap`).
  - **Notificador & Dialog Factory:** `alertify.notify()`, `.success()`, `.error()`, `.warning()`, `.message()`, `.dismissAll()` nas **6 posições** (`top-left|center|right`, `bottom-left|center|right`), além de `alertify.dialog(name, factory, singleton, baseName)` para diálogos customizados com herança e múltiplos botões, todas as 28 cores + semânticas e Dark Mode.
  - **Página de Documentação:** `examples/alertify.html` (registrada em `examples/docs-shell.js`).

- **Colorbox & Example 5 (`components/_colorbox.scss`, `dexter-colorbox.js`, `examples/colorbox.html`):**
  - Clone e compatibilidade drop-in com **Jack Moore Colorbox & Example 5** (`DexterColorbox` / `colorbox`, além de ponte jQuery opcional `$.colorbox` / `$.fn.colorbox`), 100% Vanilla JS com controles puros em CSS/Unicode (sem sprites PNG externos).
  - **Recursos Nativos:** moldura translúcida *Example 5* (`#cboxOverlay`, `#colorbox`, `#cboxWrapper`, `#cboxContent`) e variante `.cbox-theme-modern`, galerias agrupadas por `rel` / `data-cbox-rel`, slideshow automático Play/Pause (`#cboxSlideshow`), conteúdo `inline` com restauração automática do nó DOM ao fechar, HTML direto, `iframe`, AJAX (`fetch`), transições `elastic`/`fade`/`none`, 28 cores + semânticas e Dark Mode.
  - **Página de Documentação:** `examples/colorbox.html`.

- **Autosize, Zoom & Wheelzoom (`components/_media-zoom.scss`, `dexter-media-tools.js`, `examples/media-tools.html`):**
  - Portagem 100% Vanilla JS de **Jack Moore Autosize** (`DexterAutosize` / `autosize` com `.update()`, `.destroy()` e evento `autosize:resized`), **DexterZoom** (`DexterZoom` / `zoom` + `$.fn.zoom` opcional nos 4 modos `mouseover`, `grab`, `click` e `toggle`) e **DexterWheelzoom** (`DexterWheelzoom` / `wheelzoom` com zoom por scroll focalizado no cursor, arrasto `pointerdown`, placeholder SVG proporcional, controles flutuantes opcionais e 28 cores).
  - **Página de Documentação:** `examples/media-tools.html`.

- **Ribbons & Faixas CSS — 57 Estilos (`components/_ribbons.scss`, `examples/ribbons.html`):**
  - Biblioteca modular em 3 eixos independentes de classes (`formato` + `tamanho` + `cor`) com todas as **57 geometrias puras em CSS** (`clip-path`, `mask` / `-webkit-mask`, `conic-gradient`, `border-image-outset` e funções trigonométricas `cos`/`sin`/`tan`): classes semânticas de formato (ex.: `.ribbon-corner-tr`, `.ribbon-bookmark-tl`, `.ribbon-curl-wrap-top`, `.ribbon-medal-star`, `.ribbon-medal-heart-crossed`, `.ribbon-origami`, `.ribbon-bleed-left`, `.ribbon-multiline`, `.ribbon-multiline-origami` e `.ribbon-1`..`.ribbon-57`), 6 classes dedicadas de tamanho (`.ribbon-size-xs`..`.ribbon-size-2xl`, `.ribbon-size-1`..`.ribbon-size-6` e aliases `.ribbon-xs`..`.ribbon-2xl`), e classes dedicadas de cor (`.ribbon-color-{cor}` e `.ribbon-{cor}`) para todas as 28 cores oficiais + semânticas com contraste automático WCAG.
  - **Página de Documentação:** `examples/ribbons.html` (com seções dedicadas de Tamanhos, Cores WCAG e Playground interativo das 57 formas).

- **Badges & Etiquetas Modernas — Bootstrap 6.0 & Stylify CSS (`components/_badges.scss`, `dexter-ui-kit.js`, `examples/badges.html`):**
  - Módulo dedicado extraído e expandido de `_tags.scss`, combinando a arquitetura componível do **Bootstrap 6.0** (`.badge` com escala relativa em `em` em `h1`–`h6`, `.theme-{cor}`, `.badge-subtle`/`.badge-soft`, `.badge-outline`, `.badge-ghost`, `.text-bg-{cor}`, contadores posicionados com `.visually-hidden`) e os arquétipos do **Stylify CSS** (ícones SVG nativos, `.badge-dot`, `.badge-dot-pulse`, `.badge-dot-only`, `.badge-counter`, `.badge-avatar`, `.badge-split`, `.badge-glass`, `.badge-gradient-{cor}` e 5 tamanhos `.badge-xs` a `.badge-xl`).
  - **Controlador JS (`DexterBadge`):** remoção animada delegada via `.badge-close` / `data-dx-dismiss="badge"` em `dexter-ui-kit.js` com `CustomEvent('dexter.badge.dismiss')`, além das 28 cores + semânticas WCAG e Dark Mode.
  - **Página de Documentação:** `examples/badges.html` (registrada em `examples/docs-shell.js`).

- **Correções de Qualidade e Componentes (`_cards.scss`, `dexter-dropdown.js`, `_toasts.scss`, `dexter-toast.js`, `dexter-code.js`):**
  - `.card-header-{cor}` recebeu espaçamento, peso tipográfico e raio superior próprio para funcionar de forma autônoma ou combinada com `.card-header`.
  - `DexterDropdown` passou a verificar explicitamente `typeof global.bootstrap.Dropdown === 'function'` (evitando conflito com namespaces parciais de `Modal`/`Collapse`), fechar corretamente em clique externo / `Escape`, impedir listeners duplicados e resetar `aria-expanded`.
  - `_toasts.scss` e `DexterToast` passaram a incluir variantes semânticas (`.toast-success`, `.toast-danger`, `.toast-error`, `.toast-warning`, `.toast-info` e `.toast-soft-*`), remoção do duplo ícone de fechar (`.btn-close`) e aplicação automática da cor semântica via `DexterToast.success()`, `.error()`, `.warning()`, `.info()`.
  - `DexterCode` foi reescrito com tokenizador em passagem única (`tokenize()`), eliminando injeção de texto `class="token ...">` nos blocos de código HTML, CSS, JS e Bash.

- **Collections & Page Footer no Padrão Materialize CSS (`components/_layouts-nav.scss`, `dexter-extras.js`, `examples/collections.html`, `examples/footer.html`):**
  - Upgrade completo de `.collection` para paridade 100% com **Materialize CSS Collections**: coleções básicas (`ul.collection > li.collection-item`), links clicáveis (`a.collection-item`) com estado `.active` e seleção automática via `[data-dx-collection-selectable]`, cabeçalhos `.with-header` (`.collection-header h1..h6`), ações secundárias (`.secondary-content`), itens com avatar circular `.collection-item.avatar` (`.circle` `42px×42px`, `.title`, `<p>`), descarte horizontal `.dismissable`/`.dismissible` (Pointer Events swipe `&ge; 90px` + `.collection-dismiss-btn` acessível via `DexterCollection.dismiss()`), variantes `.collection-sm` e `.collection-flush`, 28 cores oficiais + semânticas (`.collection-{cor}` via `--dx-col-accent`), Dark Mode nativo e `prefers-reduced-motion`.
  - Adição de `.page-footer`, `.footer-copyright`, variantes `.footer-sm` / `.page-footer-sm` / `.page-footer-soft`, helpers Flexbox de Sticky Footer (`.dx-sticky-footer-layout`, `body.dx-sticky-footer`, `.dx-sticky-main`) e classes modulares `.page-footer-{cor}` / `.footer-{cor}` com contraste WCAG automático para todas as 28 cores oficiais + semânticas.
  - **Páginas de Documentação:** `examples/collections.html` e `examples/footer.html` (registradas em `examples/docs-shell.js`).

**Como adicionar um componente / Adding a component**
1. Criar `src/scss/components/_nome.scss` com o cabeçalho padrão e comentários bilíngues. Logo abaixo do cabeçalho, adicionar o marcador de seção `/* @section Nome em pt-BR | Name in EN */` (ou só `/* @section Nome */` quando a palavra é igual nos dois idiomas): o build o transforma no separador do `dexter.css` (ex.: `Contêineres / Containers`). Apenas o marcador e o cabeçalho de entrada sobrevivem; qualquer outro `/* */` é removido do CSS final.
2. Variáveis `--dx-nome-*` por componente; cores vêm de `$theme-colors`; texto vem do **par** de `Colors.md`.
3. Gerar as 14 variantes (incluindo `outline` e `reverse`) com `@each`.
4. Estados `hover`, `focus-visible`, `active`, `disabled` + `prefers-reduced-motion`.
5. Registrar com `@use` em `dexter.scss`.
6. `npm run build` sem avisos; conferir o CSS gerado.
7. Documentar em pt-BR e EN e atualizar `llms.txt`/`llms-full.txt`.

---

## 7. Estado atual / Current state

**Pronto / Done:** reset moderno · tokens como CSS Variables · tipografia (títulos, display, utilitários de texto) · container · grid de até 14 colunas · gutters · escala de z-index · build Sass (dev + min + sourcemap) · cabeçalhos e comentários bilíngues nos 10 arquivos Sass.

**Próximo / Next (roadmap Fase 1):** Button + variantes · Alert · **alerta flutuante de navegador desatualizado** (2+ versões atrás) · utilitários restantes (espaçamento, cores de texto/fundo, display) · template Starter.

**Em aberto / Open decisions** (aguardam o autor):
- Aprovar cores semânticas (`danger`, `info`, `secret`, `warning`, `success`, `light`, `dark`): `Colors.md` §2.
- Fonte de código: Prompt e IBM Plex Sans não são monoespaçadas: `WebFonts.md` §2.3.
- Carregamento de fontes ainda não implementado: `WebFonts.md` §3.

---

## 8. Problemas conhecidos / Known issues

- `package.json` lista `tailwindcss`, `daisyui` (e `webpack`) como devDependencies, mas o framework é independente e o build usa só Sass. Candidatas a remoção. `dev` (vite), `lint` (eslint/stylelint) e `prepare` (husky) não têm configuração.
- `README.md` ainda tem o título antigo (`Dexter-Framework-CSS`).
- `Dexter-UI/llms.txt` é um rascunho fora do formato <https://llmstxt.org/> (que é Markdown); precisa ser refeito.
- A skill de terceiros `claude-code-setup` existe duplicada, em `skills/` (raiz) e em `.agents/skills/`. Está fora de `Dexter-UI/` e não faz parte do framework; manter só uma cópia.
- Medialoot: licenças variam por pacote; verificar antes de redistribuir ícones.

---

## 9. Definição de pronto / Definition of done

- [ ] `npm run build` sem erros nem avisos.
- [ ] Cabeçalho padrão e comentários bilíngues em todo arquivo novo/alterado.
- [ ] Variantes de tema completas e pares de contraste conforme `Colors.md`.
- [ ] Estados interativos e `prefers-reduced-motion`.
- [ ] Documentação pt-BR **e** EN atualizada; `llms.txt` / `llms-full.txt` atualizados.
- [ ] Nada fora de `Dexter-UI/` além de arquivos de projeto.
- [ ] Mudanças relevantes refletidas em `Project.md` / este arquivo.

---

## 10. Idioma de trabalho / Working language

Converse com o autor em **pt-BR**. Código: identificadores em inglês; comentários e documentação em pt-BR + inglês.
*Talk to the author in **pt-BR**. Code: identifiers in English; comments and docs in pt-BR + English.*
