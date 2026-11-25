# Dexter UI Framework

> **Versão Beta (`0.1.0-beta.1`)** &bull; Framework modular CSS/SCSS &amp; Vanilla JavaScript para aplicações **Web** e **E-mail HTML** com zero dependências externas, **28 cores oficiais** com escala tonal, contraste WCAG, Dark Mode nativo e portal interativo com **45 páginas de documentação**.
>
> *Beta Release (`0.1.0-beta.1`) &bull; Zero-dependency modular CSS/SCSS &amp; Vanilla JavaScript framework for **Web** and **HTML Email**, featuring **28 official colors** with tonal scales, WCAG contrast, native Dark Mode, and a **45-page interactive documentation portal**.*

---

## Principais Recursos / Key Features

- **Zero Dependências em Runtime / Zero Runtime Dependencies:** Escrito em Sass moderno (`@use` / CSS Custom Properties `--dx-*`) e JavaScript ES5/UMD compatível, sem exigir Bootstrap JS, jQuery ou bibliotecas externas de ícones.
- **Paleta Oficial de 28 Cores + Semânticas:** Escala tonal de 13 passos (`025` a `950`), suporte completo a `--dx-*` tokens e pares de contraste calculados conforme diretrizes WCAG (`primary`, `secondary`, `tertiary`, `quaternary`, `quinary`, `purple`, `red`, `navy`, `brown`, `green`, `midnight`, `silver-light`, `silver`, `light`, `turquoise`, `cyan`, `dark`, `black`, `beige`, `olive`, `steelblue`, `aquamarine`, `coral`, `lime`, `teal`, `indigo`, `gray`, `fuchsia` + `success`, `danger`, `warning`, `info`).
- **Grid Responsivo de 14 Colunas + CSS Grid v4:** Sistema de layout em Flexbox de 14 colunas aliado a utilitários modernos de CSS Grid (`grid-cols-*`), Container Queries (`.dx-cq-grid`) e espaçamentos responsivos.
- **Dark Mode Nativo & Acessibilidade:** Suporte imediato via `[data-dx-theme="dark"]` e `[data-bs-theme="dark"]`, navegação WAI-ARIA por teclado, foco visível e respeito automático a `@media (prefers-reduced-motion: reduce)`.
- **Engine de E-mail HTML & Impressão:** Entradas dedicadas (`dexter-email.scss` sem CSS Custom Properties para clientes de e-mail e `dexter-print.scss` para `@media print`).

---

## Catálogo de Componentes / Component Catalog

| Categoria / Category | Componentes Incluídos / Included Components |
|---|---|
| **Design System & Base** | Sistema de Cores (28 + tonal), Tipografia Fluida, Prose Editorial, Utilitários CSS & Grid, HTML5 Nativos, CSS Moderno (TW4/BS6), Impressão (`@media print`) |
| **Core UI & Layout** | Botões, Alertas, Cards, Badges (Bootstrap 6.0 & Stylify CSS), Avatares & Story Rings, Ribbons (57 estilos modulares), Loaders (25 modelos + Materialize Preloaders + Skeletons), Tabelas (`DexterTable`), Collections (Materialize), Page Footer & Sticky Footer, Data Display (`timeline`, `chat`, `stats`), Sidebar Admin (`Next-Sidebar` & `SidebarMenu`), Dashboard Skeleton, Sumário Automático (`DexterTOC`) |
| **Formulários / Forms** | Controles base, `DexterSelect`, `DexterMultiSelect`, `DexterTags` (Chips & Autocomplete), `DexterFileInput`, `DexterRating`, `DexterInputSpinner`, `DexterAutosize` |
| **Interativos & Widgets** | Accordion, Tabs, Wizard, Modais, Dropdowns multiníveis, Toasts (`DexterToast` 9 posições), Carousel (autoplay & hover-pause), Calendário (`DexterCalendar`), TreeView (`DexterTreeView` tri-state), Cookie Consent (`DexterCookieConsent` LGPD/GDPR), Waiting Dialog (`DexterWaiting`), Alertify (`DexterAlertify`), Colorbox (`DexterColorbox`), Popover-X (`DexterPopoverX`), Zoom & Wheelzoom, Lightbox, Diff, OTP, Ripple & FAB Speed Dial |

---

## Estrutura do Projeto / Project Structure

```text
Dexter-CSS/
├─ Dexter-UI/
│  ├─ src/
│  │  ├─ scss/                 # Fonte Sass modular (abstracts, base, layout, components, utilities, email)
│  │  └─ js/                   # Controladores Vanilla JS sem dependências
│  ├─ dist/
│  │  ├─ css/                  # dexter.css, dexter.min.css, dexter-print.css, dexter-email.css (+ .map)
│  │  └─ js/                   # Módulos prontos para inclusão em páginas web
│  ├─ examples/                # Portal de documentação interativa (45 páginas + docs-shell.js)
│  ├─ templates/               # Templates Web (starter, landing, parallax) e E-mail HTML
│  └─ scripts/                 # build-css.mjs, serve-dexter.mjs
├─ .agents/                    # Documentação técnica para agentes de IA e especificações
├─ package.json                # Scripts e dependências de desenvolvimento (Sass / Build)
└─ LICENSE                     # Licença MIT
```

---

## Instalação e Build / Installation & Build

> **Pré-requisitos:** Node.js 18+ e npm.

```bash
# 1. Instalar dependências de compilação
npm install

# 2. Compilar SCSS -> CSS (expanded, minified, print e email)
npm run build

# 3. Abrir o portal interativo de documentação localmente
node Dexter-UI/scripts/serve-dexter.mjs
```

---

## Uso Rápido em HTML / Quick Start

```html
<!DOCTYPE html>
<html lang="pt-BR" data-dx-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minha Aplicação - Dexter UI</title>
  <link rel="stylesheet" href="Dexter-UI/dist/css/dexter.min.css">
</head>
<body class="dx-sticky-footer">
  <main class="dx-sticky-main container py-5">
    <div class="card card-hover">
      <div class="card-header card-header-primary">Dexter UI Beta</div>
      <div class="card-body">
        <span class="badge badge-teal badge-pill mb-2">Zero Dependências</span>
        <p class="mb-3">Pronto para Web, Dashboards, HTMX e Dark Mode.</p>
        <button type="button" class="btn btn-primary" onclick="DexterToast.success({ title: 'Tudo pronto!', content: 'Dexter UI carregado com sucesso.' })">
          Disparar Toast
        </button>
      </div>
    </div>
  </main>

  <footer class="page-footer page-footer-indigo footer-sm">
    <div class="footer-copyright">
      <div class="container">
        <span>&copy; 2026 Charles Corrêa &mdash; Dexter UI Framework</span>
      </div>
    </div>
  </footer>

  <script src="Dexter-UI/dist/js/dexter-ui-kit.js"></script>
  <script src="Dexter-UI/dist/js/dexter-toast.js"></script>
</body>
</html>
```

---

## Aviso da Versão Beta / Beta Notice

Esta é uma versão **Beta pública (`0.1.0-beta.1`)**. As APIs de classes CSS, tokens `--dx-*` e controladores JavaScript já são utilizáveis e foram validadas nas 45 páginas de documentação, mas pequenos ajustes de nomenclatura e novos componentes podem ocorrer antes da versão `1.0.0`.

*This is a public **Beta release (`0.1.0-beta.1`)**. CSS class APIs, `--dx-*` tokens, and Vanilla JS controllers are ready for evaluation across all 45 documentation pages, with minor refinements expected before `1.0.0`.*

---

## Autor & Licença / Author & License

- **Autor / Author:** **Charles Corrêa**
- **Website:** <https://charlescorrea.com.br>
- **GitHub:** [@CharlesCorreaDev](https://github.com/CharlesCorreaDev)
- **Repositório:** <https://github.com/CharlesCorreaDev/Dexter-UI>
- **Licença / License:** [MIT](LICENSE)
