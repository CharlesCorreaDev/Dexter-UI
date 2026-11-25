# WebFonts / Fontes – Dexter UI

> Fontes aprovadas, papéis, carregamento e fallbacks.
> Approved fonts, roles, loading and fallbacks.

- **Autor / Author:** Charles Corrêa
- **Implementação / Implementation:** `Dexter-UI/src/scss/abstracts/_config.scss` (`$font-body`, `$font-title`, `$font-code`) → `--dx-font-body`, `--dx-font-title`, `--dx-font-code`
- **Relacionados / Related:** [agents-info.md](agents-info.md) · [Project.md](Project.md) · [Colors.md](Colors.md)

> **Estado atual / Current state:** os tokens e os *fallbacks* existem, mas **nenhuma fonte é carregada ainda** (sem `<link>`, sem `@font-face`). Sem o carregamento, o navegador cai no fallback de sistema.
> *Tokens and fallbacks exist, but **no font is loaded yet** (no `<link>`, no `@font-face`). Without loading, the browser falls back to system fonts.*

---

## 1. Padrões / Defaults

| Papel / Role | Token | Padrão / Default | Pilha atual / Current stack |
|--------------|-------|------------------|-----------------------------|
| Texto / Body | `--dx-font-body` | **Inter** | `"Inter"`, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif |
| Títulos / Titles | `--dx-font-title` | **Poppins** | `"Poppins"`, + pilha de sistema / system stack |
| Código / Code | `--dx-font-code` | **JetBrains Mono** | `"JetBrains Mono"`, ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace |

Os padrões são sugestões; o autor pode trocar por qualquer família das listas abaixo.
*Defaults are suggestions; the author may swap in any family from the lists below.*

---

## 2. Famílias aprovadas / Approved families

Página de cada família: `https://fonts.google.com/specimen/<Nome+Da+Fonte>`.

### 2.1 Texto / Body

[Google Sans](https://fonts.google.com/specimen/Google+Sans) ·
[Roboto](https://fonts.google.com/specimen/Roboto) ·
[Open Sans](https://fonts.google.com/specimen/Open+Sans) ·
[Inter](https://fonts.google.com/specimen/Inter) ·
[Lato](https://fonts.google.com/specimen/Lato) ·
[DM Sans](https://fonts.google.com/specimen/DM+Sans) ·
[Noto Sans](https://fonts.google.com/specimen/Noto+Sans) ·
[Nunito Sans](https://fonts.google.com/specimen/Nunito+Sans) ·
[Ubuntu](https://fonts.google.com/specimen/Ubuntu) ·
[Work Sans](https://fonts.google.com/specimen/Work+Sans) ·
[PT Sans](https://fonts.google.com/specimen/PT+Sans) ·
[Ubuntu Sans](https://fonts.google.com/specimen/Ubuntu+Sans)

### 2.2 Títulos / Titles

[Google Sans Flex](https://fonts.google.com/specimen/Google+Sans+Flex) ·
[Poppins](https://fonts.google.com/specimen/Poppins) ·
[Montserrat](https://fonts.google.com/specimen/Montserrat) ·
[Roboto Condensed](https://fonts.google.com/specimen/Roboto+Condensed) ·
[Playfair Display](https://fonts.google.com/specimen/Playfair+Display) ·
[Raleway](https://fonts.google.com/specimen/Raleway) ·
[Nunito](https://fonts.google.com/specimen/Nunito) ·
[Rubik](https://fonts.google.com/specimen/Rubik) ·
[Roboto Slab](https://fonts.google.com/specimen/Roboto+Slab) ·
[Manrope](https://fonts.google.com/specimen/Manrope) ·
[Outfit](https://fonts.google.com/specimen/Outfit) ·
[Merriweather](https://fonts.google.com/specimen/Merriweather) ·
[Bebas Neue](https://fonts.google.com/specimen/Bebas+Neue) ·
[Ubuntu Condensed](https://fonts.google.com/specimen/Ubuntu+Condensed) ·
[Ubuntu](https://fonts.google.com/specimen/Ubuntu)

### 2.3 Código / Code

[Google Sans Code](https://fonts.google.com/specimen/Google+Sans+Code) ·
[Roboto Mono](https://fonts.google.com/specimen/Roboto+Mono) ·
[JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) ·
[Prompt](https://fonts.google.com/specimen/Prompt) ⚠️ ·
[IBM Plex Sans](https://fonts.google.com/specimen/IBM+Plex+Sans) ⚠️ ·
[Source Code Pro](https://fonts.google.com/specimen/Source+Code+Pro) ·
[Ubuntu Mono](https://fonts.google.com/specimen/Ubuntu+Mono)

> ⚠️ **Prompt** e **IBM Plex Sans** estão na lista de código, mas **não são monoespaçadas**. Para código, o equivalente é **IBM Plex Mono**. Confirmar com o autor antes de usar como `--dx-font-code`.
> *⚠️ **Prompt** and **IBM Plex Sans** are in the code list but are **not monospaced**. The monospaced equivalent is **IBM Plex Mono**. Confirm with the author before using them as `--dx-font-code`.*

---

## 3. Carregamento / Loading

### 3.1 Google Fonts (recomendado para começar / recommended to start)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

- Carregar **somente** as famílias e pesos usados. / Load **only** the families and weights in use.
- Sempre `display=swap`. / Always `display=swap`.
- Evitar `@import` de fontes dentro do CSS: bloqueia a renderização. / Avoid font `@import` inside CSS: it blocks rendering.

### 3.2 Self-hosted (opcional / optional)

Arquivos em `Dexter-UI/assets/fonts/` (pasta planejada), com `@font-face`, `font-display: swap` e formato `woff2`. Evita requisição a terceiros e ajuda na privacidade/LGPD.
*Files in `Dexter-UI/assets/fonts/` (planned folder), with `@font-face`, `font-display: swap` and `woff2` format. Avoids third-party requests and helps privacy.*

### 3.3 Trocar a fonte / Switching a font

```scss
// Sass: no arquivo de entrada, antes dos demais @use / in the entry file, before other @use rules
@use "abstracts" with ($font-body: ("Roboto", system-ui, sans-serif));
```

```css
/* CSS: em tempo de execução / at runtime */
:root { --dx-font-body: "Roboto", system-ui, sans-serif; }
```

---

## 4. Boas práticas / Best practices

- Sempre incluir *fallback* de sistema depois da fonte. / Always add a system fallback after the font.
- Corpo de texto ≥ 16 px (`1rem`), `line-height` ≈ 1.5, tamanhos em `rem` (respeita o zoom do usuário). / Body text ≥ 16 px (`1rem`), `line-height` ≈ 1.5, sizes in `rem` (respects user zoom).
- Limitar a 3 famílias por página (texto, título, código) e poucos pesos. / Limit to 3 families per page (body, title, code) and few weights.
- Verificar a **licença** de cada fonte antes de redistribuir arquivos (self-host). A maioria no Google Fonts tem licença aberta, mas confirme família por família.
  *Check each font's **license** before redistributing files (self-host). Most Google Fonts are openly licensed, but confirm family by family.*
- Garantir suporte a caracteres do português (acentos, cedilha). / Ensure Portuguese character support (accents, cedilla).

---

## 5. E-mail / Email

Fontes web têm suporte parcial em clientes de e-mail e nunca são garantidas. Regra: **fonte segura primeiro no fallback, fonte web como aprimoramento**.
*Web fonts have partial support in email clients and are never guaranteed. Rule: **safe font in the fallback, web font as enhancement**.*

| Estilo / Style | Pilha para e-mail / Email stack |
|----------------|---------------------------------|
| Sans | `Inter, Arial, Helvetica, sans-serif` |
| Serifa / Serif | `Georgia, "Times New Roman", Times, serif` |
| Mono | `"Courier New", Courier, monospace` |

---

## 6. Pendências / Pending

- [ ] Implementar o carregamento (Google Fonts `<link>` nos templates e docs) / Implement loading.
- [ ] Decidir `--dx-font-code` entre as opções monoespaçadas / Decide `--dx-font-code` among monospaced options.
- [ ] Decidir se haverá versão self-hosted em `assets/fonts/` / Decide whether to ship a self-hosted version.
- [x] Escala tipográfica definida em `_config.scss` (`$font-sizes`, `$display-sizes`, `$font-weights`...) / Type scale defined. Cuidado: as classes `.fw-light` (300) e `.fw-extrabold` (800) só funcionam se esses pesos forem carregados; o exemplo `Dexter-UI/examples/typography.html` carrega Inter 300–800 / `.fw-light` and `.fw-extrabold` only work if those weights are loaded.
- [ ] Verificar licenças das famílias antes de qualquer redistribuição / Verify licenses before any redistribution.
