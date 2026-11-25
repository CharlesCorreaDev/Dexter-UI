import fs from 'node:fs';
import path from 'node:path';

const examplesDir = path.resolve('Dexter-UI/examples');
const skipFiles = new Set(['ui-kit.html', 'calendar.html', 'sidebar.html']);
const files = fs.readdirSync(examplesDir).filter((f) => f.endsWith('.html') && !skipFiles.has(f)).sort();

function stripStatementBlock(code, startPattern) {
  let out = code;
  let match;
  while ((match = startPattern.exec(out)) !== null) {
    const startIdx = match.index;
    const braceOpen = out.indexOf('{', startIdx);
    if (braceOpen === -1) break;
    let depth = 0;
    let endIdx = -1;
    for (let i = braceOpen; i < out.length; i++) {
      if (out[i] === '{') depth++;
      else if (out[i] === '}') {
        depth--;
        if (depth === 0) {
          // Consome ); opcional
          let tail = i + 1;
          while (tail < out.length && /[\s);]/.test(out[tail])) tail++;
          endIdx = tail;
          break;
        }
      }
    }
    if (endIdx === -1) break;
    out = out.slice(0, startIdx) + '\n' + out.slice(endIdx);
  }
  return out;
}

function cleanThemeToggleInScripts(html) {
  return html.replace(/<script>([\s\S]*?)<\/script>/gi, (full, body) => {
    if (!/themeToggle|dexter-theme|dx-theme/.test(body)) {
      return full;
    }

    let cleaned = body;
    cleaned = cleaned.replace(/\/\/[^\n]*[Tt]ema[^\n]*\n?/g, '');
    cleaned = cleaned.replace(/(?:const|let|var)\s+(?:themeToggleBtn|themeBtn|htmlElem)\s*=[^;]+;\s*/g, '');
    cleaned = cleaned.replace(/(?:const|let|var)\s+currentTheme\s*=[^;]+;\s*/g, '');
    cleaned = cleaned.replace(/document\.documentElement\.setAttribute\(['"]data-dx-theme['"][^;]+;\s*/g, '');
    cleaned = cleaned.replace(/(?:themeToggleBtn|themeBtn)\.textContent\s*=[^;]+;\s*/g, '');
    cleaned = stripStatementBlock(cleaned, /(?:themeToggleBtn|themeBtn)(?:\?\.)?\.addEventListener\(\s*['"]click['"]/);

    const stripped = cleaned.replace(/\/\/[^\n]*/g, '').trim();
    if (!stripped || /^document\.addEventListener\(['"]DOMContentLoaded['"],\s*\(\)\s*=>\s*\{\s*\}\);?$/.test(stripped)) {
      return '';
    }
    return '<script>' + cleaned + '</script>';
  });
}

let migrated = 0;

for (const file of files) {
  const filePath = path.join(examplesDir, file);
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Header unificado
  if (!/<header class="doc-header"[\s\S]*?<\/header>/i.test(html)) {
    throw new Error(`[unify] <header> não encontrado em ${file}`);
  }
  html = html.replace(
    /<header class="doc-header"[\s\S]*?<\/header>/i,
    '<header class="doc-header" data-doc-header></header>'
  );

  // 2. Wrapper de abertura: <div class="container-fluid..."> <div class="row"> ... <aside ... doc-sidebar ...>...</aside> ... <main ...>
  const wrapperStartRegex = /<div class="container-fluid[^"]*">\s*<div class="row">\s*(?:<!--[\s\S]*?-->\s*)?<aside class="[^"]*doc-sidebar[^"]*"[\s\S]*?<\/aside>\s*(?:<!--[\s\S]*?-->\s*)?<main[^>]*>/i;
  if (!wrapperStartRegex.test(html)) {
    throw new Error(`[unify] Wrapper de abertura não encontrado em ${file}`);
  }
  html = html.replace(
    wrapperStartRegex,
    '<div class="doc-layout">\n    <aside class="doc-sidebar" data-doc-sidebar aria-label="Navegação da documentação"></aside>\n\n    <main class="doc-main" data-toc-content>'
  );

  // 3. Normaliza </main> ... (opcional <(aside|nav) ... doc-toc ...>...</(aside|nav)>) ... </div>\s*</div>
  const tocMarkup = file === 'toc.html'
    ? '<nav id="toc" data-toggle="toc" class="doc-toc" data-toc-title="Nesta página" data-toc-headings="h2, h3" aria-label="Nesta página"></nav>'
    : '<nav class="doc-toc" id="toc" data-doc-toc aria-label="Nesta página"></nav>';

  const closingWithTocRegex = /<\/main>\s*(?:<!--[\s\S]*?-->\s*)?<(?:aside|nav)\b[^>]*class="[^"]*doc-toc[^"]*"[\s\S]*?<\/(?:aside|nav)>\s*<\/div>\s*<\/div>/i;
  const closingWithoutTocRegex = /<\/main>\s*<\/div>\s*<\/div>/i;

  if (closingWithTocRegex.test(html)) {
    html = html.replace(closingWithTocRegex, `</main>\n\n    ${tocMarkup}\n  </div>`);
  } else if (closingWithoutTocRegex.test(html)) {
    html = html.replace(closingWithoutTocRegex, `</main>\n\n    ${tocMarkup}\n  </div>`);
  } else {
    throw new Error(`[unify] Fechamento </main>...</div></div> não encontrado em ${file}`);
  }

  // 4. Corrige caminhos relativos quebrados ("dist/js/..." -> "../dist/js/...")
  html = html.replace(/src="dist\/js\//g, 'src="../dist/js/');

  // 5. Limpa scripts duplicados de #themeToggle sem quebrar demos específicas
  html = html.replace(/\s*<!--\s*JavaScript para alternância de tema[\s\S]*?-->\s*/gi, '\n');
  html = cleanThemeToggleInScripts(html);

  // 6. Remove duplicatas de dexter-ui-kit.js / docs-shell.js e garante footer limpo
  html = html.replace(/\s*<script src="\.\.\/dist\/js\/dexter-ui-kit\.js"><\/script>/g, '');
  html = html.replace(/\s*<script src="docs-shell\.js"><\/script>/g, '');

  html = html.replace(
    /<footer[^>]*>[\s\S]*?<\/footer>/i,
    '<footer class="doc-footer">&copy; 2026 Charles Corrêa. Todos os direitos reservados. Licenciado sob MIT.</footer>'
  );
  if (!/<footer[\s\S]*?<\/footer>/i.test(html)) {
    html = html.replace(
      /(<!--\s*Controladores JS|<script[\s>])/i,
      '<footer class="doc-footer">&copy; 2026 Charles Corrêa. Todos os direitos reservados. Licenciado sob MIT.</footer>\n\n  $1'
    );
  }

  // 7. Garante carregamento ordenado de dexter-ui-kit.js e docs-shell.js uma única vez antes de </body>
  if (/<script src="\.\.\/dist\/js\/dexter-code\.js"><\/script>/i.test(html)) {
    html = html.replace(
      '<script src="../dist/js/dexter-code.js"></script>',
      '<script src="../dist/js/dexter-code.js"></script>\n  <script src="../dist/js/dexter-ui-kit.js"></script>\n  <script src="docs-shell.js"></script>'
    );
  } else {
    html = html.replace(
      '</body>',
      '  <script src="../dist/js/dexter-ui-kit.js"></script>\n  <script src="docs-shell.js"></script>\n</body>'
    );
  }

  fs.writeFileSync(filePath, html, 'utf8');
  migrated++;
}

console.log(`Migrated ${migrated} HTML files successfully.`);
