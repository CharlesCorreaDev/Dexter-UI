/**
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        scripts/build-css.mjs
 * @description [PT-BR] Compila o Sass e gera dexter.css (com sourcemap) e dexter.min.css.
 *                      No CSS final mantém só o cabeçalho do arquivo de entrada e transforma os
 *                      marcadores `@section` de cada partial em separadores de seção.
 *              [EN]    Compiles Sass and generates dexter.css (with sourcemap) and dexter.min.css.
 *                      The final CSS keeps only the entry file header and turns each partial's
 *                      `@section` markers into section separators.
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

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compile } from 'sass';
import postcss from 'postcss';

// pt-BR: Pasta Dexter-UI/ (um nível acima de scripts/).
// EN: Dexter-UI/ folder (one level above scripts/).
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const entry = resolve(root, 'src/scss/dexter.scss');
const outDir = resolve(root, 'dist/css');

// pt-BR: O Sass mantém todo comentário `/* */` no CSS expandido, inclusive o cabeçalho de
//        cada partial. Este plugin aplica estas regras:
//        1. mantém o primeiro comentário (cabeçalho do arquivo de entrada). O primeiro nó do
//           CSS expandido é `@charset`, por isso a regra é "primeiro comentário", não "primeiro nó";
//        2. converte marcadores `/* @section Nome pt-BR | Name EN */` em separadores de seção;
//        3. remove todos os outros comentários.
// EN: Sass keeps every `/* */` comment in expanded CSS, including each partial's header.
//     This plugin applies these rules:
//     1. keeps the first comment (the entry file header). The first node of the expanded CSS
//        is `@charset`, so the rule is "first comment", not "first node";
//     2. turns `/* @section Nome pt-BR | Name EN */` markers into section separators;
//     3. removes every other comment.
const SECTION_MARKER = /^@section\s+(.+)$/;
const SEPARATOR_BAR = '='.repeat(74);

// pt-BR: "Contêineres | Containers" → "Contêineres / Containers"; "Reset" → "Reset".
// EN: "Contêineres | Containers" → "Contêineres / Containers"; "Reset" → "Reset".
const sectionLabel = (raw) => [...new Set(raw.split('|').map((part) => part.trim()).filter(Boolean))].join(' / ');

const commentsPlugin = () => ({
  postcssPlugin: 'dx-comments',
  Once(css) {
    let kept = false;
    css.walkComments((comment) => {
      if (!kept) {
        kept = true;
        return;
      }

      const marker = SECTION_MARKER.exec(comment.text.trim());
      if (!marker) {
        comment.remove();
        return;
      }

      comment.text = `${SEPARATOR_BAR}\n   ${sectionLabel(marker[1])}\n   ${SEPARATOR_BAR}`;
      comment.raws.before = '\n\n';
      comment.raws.left = ' ';
      comment.raws.right = ' ';
    });
  },
});
commentsPlugin.postcss = true;

// pt-BR: Pacotes e saídas: dexter principal e dexter-print autônomo.
// EN: Bundles and outputs: main dexter and standalone dexter-print.
const bundles = [
  {
    entry: resolve(root, 'src/scss/dexter.scss'),
    targets: [
      { style: 'expanded', file: 'dexter.css', sourceMap: true },
      { style: 'compressed', file: 'dexter.min.css', sourceMap: false },
    ],
  },
  {
    entry: resolve(root, 'src/scss/dexter-print.scss'),
    targets: [
      { style: 'expanded', file: 'dexter-print.css', sourceMap: true },
      { style: 'compressed', file: 'dexter-print.min.css', sourceMap: false },
    ],
  },
  {
    entry: resolve(root, 'src/scss/email/dexter-email.scss'),
    targets: [
      { style: 'expanded', file: 'dexter-email.css', sourceMap: true },
      { style: 'compressed', file: 'dexter-email.min.css', sourceMap: false },
    ],
  },
];

await mkdir(outDir, { recursive: true });

for (const bundle of bundles) {
  for (const target of bundle.targets) {
    const to = resolve(outDir, target.file);
    const result = compile(bundle.entry, { style: target.style, sourceMap: target.sourceMap });

    const processed = await postcss([commentsPlugin()]).process(result.css, {
      from: bundle.entry,
      to,
      map: target.sourceMap ? { prev: result.sourceMap, inline: false, annotation: false } : false,
    });

    const css = target.sourceMap
      ? `${processed.css}\n/*# sourceMappingURL=${target.file}.map */\n`
      : processed.css;

    await writeFile(to, css);
    if (target.sourceMap) {
      await writeFile(`${to}.map`, processed.map.toString());
    }
    console.log(`built ${target.file} (${target.style})`);
  }
}
