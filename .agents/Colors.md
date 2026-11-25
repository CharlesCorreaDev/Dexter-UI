# Colors / Cores – Dexter UI

> Fonte única de verdade para as cores do framework: paleta, contraste WCAG e pares texto/fundo.
> Single source of truth for framework colors: palette, WCAG contrast and text/background pairs.

- **Autor / Author:** Charles Corrêa
- **Implementação / Implementation:** `Dexter-UI/src/scss/abstracts/_config.scss` (`$theme-colors`) → CSS Variables `--dx-*` em `base/_root.scss`
- **Relacionados / Related:** [agents-info.md](agents-info.md) · [Project.md](Project.md) · [WebFonts.md](WebFonts.md)

---

## 1. Paleta oficial / Official palette

Definida pelo autor. **Não alterar sem autorização.** / Defined by the author. **Do not change without approval.**

| Token CSS | Variável Sass | Nome | Hex | RGB | Status |
|-----------|---------------|------|-----|-----|--------|
| `--dx-primary` | `$primary` | Primária | `#3b5998` | 59, 89, 152 | ✅ implementado |
| `--dx-secondary` | `$secondary` | Secundária | `#14306b` | 20, 48, 107 | ✅ implementado |
| `--dx-tertiary` | `$tertiary` | Terciária | `#869dcc` | 134, 157, 204 | ✅ implementado |
| `--dx-quaternary` | `$quaternary` | Quaternária | `#224389` | 34, 67, 137 | ✅ implementado |
| `--dx-quinary` | `$quinary` | Quinária | `#5772ac` | 87, 114, 172 | ✅ implementado |

`--dx-focus-ring` usa hoje o valor de `quinary`.

---

## 1.1 Paleta estendida / Extended palette (23 cores)

Definida pelo autor. Disponíveis em `$colors` e `$all-colors` (`abstracts/_config.scss`), exportadas em `--dx-*` (`base/_root.scss`) e com utilitários `.text-*`, `.bg-*`, `.border-*` e `.shadow-*`.

| Token CSS | Variável Sass | Nome PT-BR / EN | Hex | RGB | Texto ideal |
|-----------|---------------|-----------------|-----|-----|-------------|
| `--dx-purple` | `$purple` | Roxo / Purple | `#501b85` | 80, 27, 133 | branco (11.43:1) |
| `--dx-red` | `$red` | Vermelho / Red | `#cf000f` | 207, 0, 15 | branco (5.74:1) |
| `--dx-navy` | `$navy` | Navy | `#003171` | 0, 49, 113 | branco (12.52:1) |
| `--dx-brown` | `$brown` | Marrom / Brown | `#3f1b0f` | 63, 27, 15 | branco (15.27:1) |
| `--dx-green` | `$green` | Verde / Green | `#1b7021` | 27, 112, 33 | branco (6.20:1) |
| `--dx-midnight` | `$midnight` | Midnight | `#2c3e50` | 44, 62, 80 | branco (10.98:1) |
| `--dx-silver-light` | `$silver-light` | Silver Light | `#e9eaeb` | 233, 234, 235 | escuro (15.80:1) |
| `--dx-silver` | `$silver` | Silver | `#8e9aa2` | 142, 154, 162 | escuro (6.61:1) |
| `--dx-light` | `$light` | Light | `#f7f7f7` | 247, 247, 247 | escuro (17.76:1) |
| `--dx-turquoise` | `$turquoise` | Turquesa / Turquoise | `#007e65` | 0, 126, 101 | branco (5.03:1) |
| `--dx-cyan` | `$cyan` | Ciano / Cyan | `#0099a7` | 0, 153, 167 | escuro (5.54:1) |
| `--dx-dark` | `$dark` | Dark | `#130f10` | 19, 15, 16 | branco (19.03:1) |
| `--dx-black` | `$black` | Black | `#030303` | 3, 3, 3 | branco (20.62:1) |
| `--dx-beige` | `$beige` | Bege / Beige | `#e9d7be` | 233, 215, 190 | escuro (13.53:1) |
| `--dx-olive` | `$olive` | Olive | `#546c00` | 84, 108, 0 | branco (5.96:1) |
| `--dx-steelblue` | `$steelblue` | SteelBlue | `#4682b4` | 70, 130, 180 | escuro (4.63:1) |
| `--dx-aquamarine` | `$aquamarine` | Aquamarine | `#7fffd4` | 127, 255, 212 | escuro (15.55:1) |
| `--dx-coral` | `$coral` | Coral | `#ff7f50` | 255, 127, 80 | escuro (7.62:1) |
| `--dx-lime` | `$lime` | Lime | `#00ff00` | 0, 255, 0 | escuro (13.87:1) |
| `--dx-teal` | `$teal` | Teal | `#008080` | 0, 128, 128 | branco (4.77:1) |
| `--dx-indigo` | `$indigo` | Indigo | `#4b0082` | 75, 0, 130 | branco (12.95:1) |
| `--dx-gray` | `$gray` | Gray | `#808080` | 128, 128, 128 | escuro (4.82:1) |
| `--dx-fuchsia` | `$fuchsia` | Fuchsia | `#ff00ff` | 255, 0, 255 | escuro (6.07:1) |

Aliases em português suportados em CSS Variables: `--dx-roxo`, `--dx-vermelho`, `--dx-marrom`, `--dx-verde`, `--dx-turquesa`, `--dx-ciano`, `--dx-bege`.

---

## 1.2 Escala tonal de 13 passos / 13-step tonal scale

**Todas as 28 cores** (5 oficiais + 23 estendidas) geram uma escala completa com 13 variações através da função Sass `color-scale($base)`:

`025` · `050` · `100` · `200` · `300` · `400` · **`500` (base)** · `600` · `700` · `800` · `900` · `950` · `975`

- **Tints (025 a 400):** interpolação com `#ffffff` para superfícies claras, fundos de badges, cartões e realces suaves.
- **Base (500):** a cor nativa da paleta.
- **Shades (600 a 975):** interpolação com `#030303` para estados hover/active, bordas de alto contraste e textos sobre fundos claros.
- **Classes geradas:** `.text-{cor}-{passo}` e `.bg-{cor}-{passo}` (ex.: `.bg-primary-050`, `.text-purple-700`).
- **Canais RGB:** `--dx-{cor}-{passo}-rgb` gerados para composição com canal alfa.

---

## 2. Cores semânticas / Semantic colors

> ⚠️ **PROPOSTA, aguardando aprovação do autor.** Ainda **não** estão no código.
> ⚠️ **PROPOSAL, awaiting author approval.** Not in the code yet.

Valores escolhidos para passar no contraste AA com o texto indicado (seção 3).

| Token | Hex proposto | RGB | Uso / Use |
|-------|--------------|-----|-----------|
| `danger` | `#b42318` | 180, 35, 24 | Erro, ação destrutiva / Error, destructive action |
| `info` | `#0e7490` | 14, 116, 144 | Informação neutra / Neutral information |
| `secret` | `#5b3a8c` | 91, 58, 140 | Conteúdo restrito ou especial / Restricted or special content |
| `warning` | `#f2b01e` | 242, 176, 30 | Atenção / Caution |
| `success` | `#1e7a46` | 30, 122, 70 | Sucesso / Success |
| `light` | `#f4f6fb` | 244, 246, 251 | Superfícies claras / Light surfaces |
| `dark` | `#1b2233` | 27, 34, 51 | Superfícies e texto escuros / Dark surfaces and text |

`outline` e `reverse` **não são cores**: são modificadores de componente (ver `Project.md`, seção 5.1).
*`outline` and `reverse` are **not colors**: they are component modifiers (see `Project.md`, section 5.1).*

### 2.1 Neutros e destaque / Neutrals and highlight

> ⚠️ **PROPOSTA, aguardando aprovação.** Já estão no código como tokens configuráveis (valores do Bootstrap usados como ponto de partida), mas **não são parte da paleta oficial**.
> ⚠️ **PROPOSAL, awaiting approval.** Already in the code as configurable tokens (Bootstrap values used as a starting point), but **not part of the official palette**.

| Token CSS | Variável Sass | Hex | Uso / Use | Contraste / Contrast |
|-----------|---------------|-----|-----------|----------------------|
| `--dx-text-muted` | `$text-muted` | `#6c757d` | Texto secundário (ex.: `.blockquote-footer`) / Muted text | 4.69:1 sobre branco (AA); 4.23:1 sobre `mark-bg` ❌ |
| `--dx-mark-bg` | `$mark-bg` | `#fff3cd` | Fundo de `mark` / `.mark` | texto preto 18.95:1; `dark` 14.32:1 |

Não use `--dx-text-muted` dentro de `mark`: o contraste cai abaixo de 4.5:1.
*Do not use `--dx-text-muted` inside `mark`: contrast drops below 4.5:1.*

---

## 3. Contraste e pares texto/fundo / Contrast and text/background pairs

Razões calculadas com a fórmula de luminância relativa do WCAG 2.x. Referência de escuro: `dark` = `#1b2233`.
*Ratios computed with the WCAG 2.x relative luminance formula. Dark reference: `dark` = `#1b2233`.*

Metas / Targets: texto normal **AA ≥ 4.5:1** (1.4.3), **AAA ≥ 7:1**; componentes de interface e gráficos **≥ 3:1** (1.4.11).

| Cor / Color | Texto sobre a cor / Text on color | Razão / Ratio | Nível / Level |
|-------------|-----------------------------------|---------------|---------------|
| primary `#3b5998` | branco / white | 6.84 | AA |
| secondary `#14306b` | branco / white | 12.61 | AAA |
| **tertiary `#869dcc`** | **escuro / dark** (branco = 2.72 ❌) | 5.83 | AA |
| quaternary `#224389` | branco / white | 9.41 | AAA |
| quinary `#5772ac` | branco / white | 4.76 | AA (margem pequena / thin margin) |
| danger `#b42318` *(proposta)* | branco / white | 6.57 | AA |
| info `#0e7490` *(proposta)* | branco / white | 5.36 | AA |
| secret `#5b3a8c` *(proposta)* | branco / white | 8.65 | AAA |
| warning `#f2b01e` *(proposta)* | escuro / dark (branco = 1.91 ❌) | 8.32 | AAA |
| success `#1e7a46` *(proposta)* | branco / white | 5.35 | AA |
| light `#f4f6fb` *(proposta)* | escuro / dark | 14.68 | AAA |
| dark `#1b2233` *(proposta)* | branco / white | 15.87 | AAA |

### Regras derivadas / Derived rules

1. **Nunca** usar texto branco sobre `tertiary` nem sobre `warning`. Usar o escuro.
   *Never use white text on `tertiary` or `warning`. Use the dark color.*
2. Todo componente com fundo colorido define a cor do texto com o **par da tabela**, via variável (ex.: `--dx-btn-color`), nunca com `#fff` fixo.
   *Every component with a colored background sets its text color from the **table pair**, via variable (e.g. `--dx-btn-color`), never a hard-coded `#fff`.*
3. **Variante `outline`:** a cor vira texto e borda sobre fundo claro. Sobre branco, `tertiary` tem 2.72:1 (falha 3:1 e 4.5:1) e `quinary` tem 4.76:1. `outline-tertiary` precisa de uma versão mais escura da cor para texto/borda (a definir).
   *In the **`outline`** variant the color becomes text and border on a light background. On white, `tertiary` is 2.72:1 (fails 3:1 and 4.5:1). `outline-tertiary` needs a darker shade for text/border (to be defined).*
4. **Variante `reverse`:** inverte fundo e texto usando o mesmo par; o par deve continuar passando AA.
   *`reverse` swaps background and text using the same pair; the pair must still pass AA.*
5. Estados `hover`, `active` e `disabled` também precisam manter o contraste. Não basta `filter: brightness()`: validar o resultado.
   *`hover`, `active` and `disabled` must keep contrast too. `filter: brightness()` is not enough: validate the result.*
6. O foco (`--dx-focus-ring`) deve ter ≥ 3:1 contra o fundo adjacente.
   *The focus ring (`--dx-focus-ring`) must have ≥ 3:1 against the adjacent background.*
7. Cor nunca é o único meio de transmitir informação (WCAG 1.4.1): usar ícone ou texto junto.
   *Color is never the only way to convey information (WCAG 1.4.1): add an icon or text.*

---

## 4. Como usar / How to use

```scss
// Sass: personalizar no arquivo de entrada, antes dos demais @use
// Sass: customize in the entry file, before the other @use rules
@use "abstracts" with ($primary: #3b5998, $quinary: #5772ac);
```

```css
/* CSS: sobrescrever em tempo de execução, sem recompilar / override at runtime, no rebuild */
:root { --dx-primary: #3b5998; }
[data-dx-theme="dark"] { --dx-primary: #869dcc; }
```

---

## 5. Pendências / Pending

- [ ] Aprovar ou ajustar as cores semânticas da seção 2 / Approve or adjust the semantic colors from section 2.
- [ ] Definir tokens "on-color" (`--dx-on-primary` etc.) a partir da tabela da seção 3 / Define "on-color" tokens from the section 3 table.
- [ ] Definir tons escuros para `outline` (em especial `tertiary`) / Define darker shades for `outline` (especially `tertiary`).
- [ ] Definir estados `hover`/`active` (`color-mix()` ou valores pré-calculados em Sass) / Define `hover`/`active` states.
- [ ] Tema escuro (`[data-dx-theme="dark"]`) e validação de contraste / Dark theme and contrast validation.
- [ ] E-mail: valores fixos (sem `var()`), validados nos clientes alvo / Email: fixed values (no `var()`), validated in target clients.
- [ ] Validar com axe, Accessibility Insights e TPGi Color Contrast Checker / Validate with axe, Accessibility Insights and TPGi Color Contrast Checker.
