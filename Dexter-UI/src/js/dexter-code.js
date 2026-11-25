/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-code.js
 * @description [PT-BR] Controlador nativo zero-dependência para Blocos de Código,
 *              Destaque de Sintaxe estilo PrismJS Okaidia / Monokai, Numeração de Linhas
 *              e Botão Inteligente de Cópia para a Área de Transferência.
 *              [EN]    Zero-dependency native controller for Code Blocks,
 *              PrismJS Okaidia / Monokai Syntax Highlighting, Line Numbering
 *              and Smart Copy-to-Clipboard Button.
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

(function (global) {
  'use strict';

  var ICON_COPY = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Z"></path><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z"></path></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z"></path></svg>';

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function escapeCode(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Tokenizador de passagem única: nunca reprocessa spans HTML já injetados.
   */
  function tokenize(text, regex, renderMatch) {
    var result = '';
    var lastIndex = 0;
    var match;
    regex.lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        result += escapeCode(text.slice(lastIndex, match.index));
      }
      result += renderMatch(match);
      lastIndex = regex.lastIndex;
      if (match[0].length === 0) {
        regex.lastIndex++;
      }
    }

    if (lastIndex < text.length) {
      result += escapeCode(text.slice(lastIndex));
    }

    return result;
  }

  function highlightHtmlAttributes(attrText) {
    return tokenize(
      attrText,
      /([a-zA-Z0-9\-_:@.]+)(?:\s*(=)\s*("(?:\\.|[^"])*"|'(?:\\.|[^'])*'|[^\s>]+))?/g,
      function (m) {
        if (!m[2]) {
          return '<span class="token attr-name">' + escapeCode(m[1]) + '</span>';
        }
        return (
          '<span class="token attr-name">' + escapeCode(m[1]) + '</span>' +
          '<span class="token punctuation">' + escapeCode(m[2]) + '</span>' +
          '<span class="token attr-value">' + escapeCode(m[3]) + '</span>'
        );
      }
    );
  }

  /**
   * Tokenizador ultrarrápido em passagem única compatível com Okaidia / Monokai
   */
  function highlightCode(rawText, lang) {
    lang = (lang || 'html').toLowerCase();
    var text = rawText || '';

    // 1. HTML / XML
    if (lang === 'html' || lang === 'xml' || lang === 'markup') {
      return tokenize(
        text,
        /(<!--[\s\S]*?-->)|(<\/?)([a-zA-Z][a-zA-Z0-9\-_:]*)((?:\s+(?:[^>"']|"[^"]*"|'[^']*')*)?)(\s*\/?>)/g,
        function (m) {
          if (m[1]) {
            return '<span class="token comment">' + escapeCode(m[1]) + '</span>';
          }
          return (
            '<span class="token punctuation">' + escapeCode(m[2]) + '</span>' +
            '<span class="token tag">' + escapeCode(m[3]) + '</span>' +
            highlightHtmlAttributes(m[4] || '') +
            '<span class="token punctuation">' + escapeCode(m[5]) + '</span>'
          );
        }
      );
    }

    // 2. CSS / SCSS
    if (lang === 'css' || lang === 'scss') {
      return tokenize(
        text,
        /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:\\.|[^"\\\r\n])*"|'(?:\\.|[^'\\\r\n])*')|(@[a-zA-Z0-9\-_]+)|([a-zA-Z\-_][a-zA-Z0-9\-_]*)(\s*:)|(#[a-fA-F0-9]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms|fr|deg)?\b)/g,
        function (m) {
          if (m[1]) return '<span class="token comment">' + escapeCode(m[1]) + '</span>';
          if (m[2]) return '<span class="token string">' + escapeCode(m[2]) + '</span>';
          if (m[3]) return '<span class="token keyword">' + escapeCode(m[3]) + '</span>';
          if (m[4]) return '<span class="token property">' + escapeCode(m[4]) + '</span><span class="token punctuation">' + escapeCode(m[5]) + '</span>';
          if (m[6]) return '<span class="token number">' + escapeCode(m[6]) + '</span>';
          return escapeCode(m[0]);
        }
      );
    }

    // 3. JavaScript / TypeScript / JSON
    if (lang === 'js' || lang === 'javascript' || lang === 'ts' || lang === 'typescript' || lang === 'json') {
      return tokenize(
        text,
        /(\/\*[\s\S]*?\*\/|\/\/[^\n]*)|("(?:\\.|[^"\\\r\n])*"|'(?:\\.|[^'\\\r\n])*'|`(?:\\.|[^`\\])*`)|\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|import|export|from|default|class|extends|new|this|super|async|await|try|catch|finally|throw|typeof|instanceof|in|of|void|delete)\b|\b(true|false|null|undefined)\b|\b(\d+(?:\.\d+)?)\b|\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g,
        function (m) {
          if (m[1]) return '<span class="token comment">' + escapeCode(m[1]) + '</span>';
          if (m[2]) return '<span class="token string">' + escapeCode(m[2]) + '</span>';
          if (m[3]) return '<span class="token keyword">' + escapeCode(m[3]) + '</span>';
          if (m[4]) return '<span class="token boolean">' + escapeCode(m[4]) + '</span>';
          if (m[5]) return '<span class="token number">' + escapeCode(m[5]) + '</span>';
          if (m[6]) return '<span class="token function">' + escapeCode(m[6]) + '</span>';
          return escapeCode(m[0]);
        }
      );
    }

    // 4. Shell / Bash
    if (lang === 'bash' || lang === 'sh' || lang === 'shell') {
      return tokenize(
        text,
        /(#[^\n]*)|("(?:\\.|[^"\\\r\n])*"|'[^'\r\n]*')|\b(npm|npx|git|cd|ls|mkdir|rm|cp|mv|curl|echo|chmod|node|yarn|pnpm)\b/g,
        function (m) {
          if (m[1]) return '<span class="token comment">' + escapeCode(m[1]) + '</span>';
          if (m[2]) return '<span class="token string">' + escapeCode(m[2]) + '</span>';
          if (m[3]) return '<span class="token keyword">' + escapeCode(m[3]) + '</span>';
          return escapeCode(m[0]);
        }
      );
    }

    return escapeCode(text);
  }

  function copyToClipboard(text, btn) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () {
        showCopied(btn);
      }).catch(function () {
        fallbackCopy(text, btn);
      });
    } else {
      fallbackCopy(text, btn);
    }
  }

  function fallbackCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      showCopied(btn);
    } catch (e) {
      console.warn('[DexterCode] Erro ao copiar texto:', e);
    }
    document.body.removeChild(ta);
  }

  function showCopied(btn) {
    if (!btn) return;
    btn.classList.add('copied');
    var originalHtml = btn.innerHTML;
    btn.innerHTML = ICON_CHECK + ' <span>Copiado!</span>';
    setTimeout(function () {
      btn.classList.remove('copied');
      btn.innerHTML = originalHtml;
    }, 2000);
  }

  function addLineNumbers(pre, codeEl) {
    var code = codeEl.textContent;
    var lines = code.split('\n');
    if (lines.length > 1 && lines[lines.length - 1] === '') {
      lines.pop();
    }
    var lineCount = lines.length;

    var rows = document.createElement('span');
    rows.className = 'line-numbers-rows';
    rows.setAttribute('aria-hidden', 'true');

    for (var i = 0; i < lineCount; i++) {
      rows.appendChild(document.createElement('span'));
    }

    pre.classList.add('line-numbers');
    pre.appendChild(rows);
  }

  function enhanceCodeBlock(pre) {
    if (pre.getAttribute('data-dx-code-enhanced') === 'true') {
      return;
    }
    pre.setAttribute('data-dx-code-enhanced', 'true');

    var codeEl = pre.querySelector('code');
    if (!codeEl) {
      return;
    }

    var langMatch = (codeEl.className || '').match(/language-([a-zA-Z0-9_-]+)/) ||
                    (pre.className || '').match(/language-([a-zA-Z0-9_-]+)/);
    var lang = langMatch ? langMatch[1] : (pre.getAttribute('data-lang') || 'html');
    var filename = pre.getAttribute('data-file') || pre.getAttribute('data-title') || '';

    var parent = pre.parentElement;
    var isInsideWindow = parent && parent.classList.contains('code-window');

    if (!isInsideWindow && !pre.classList.contains('no-window')) {
      var windowWrapper = document.createElement('div');
      windowWrapper.className = 'code-window';

      var header = document.createElement('div');
      header.className = 'code-header';

      var dots = document.createElement('div');
      dots.className = 'code-dots';
      dots.innerHTML = '<span class="dot-close"></span><span class="dot-minimize"></span><span class="dot-maximize"></span>';
      header.appendChild(dots);

      if (filename) {
        var title = document.createElement('div');
        title.className = 'code-title';
        title.textContent = filename;
        header.appendChild(title);
      }

      var actions = document.createElement('div');
      actions.className = 'code-actions';

      var badge = document.createElement('span');
      badge.className = 'code-badge';
      badge.textContent = lang.toUpperCase();
      actions.appendChild(badge);

      var copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'code-copy-btn';
      copyBtn.setAttribute('title', 'Copiar código para a área de transferência');
      copyBtn.innerHTML = ICON_COPY + ' <span>Copiar</span>';

      copyBtn.addEventListener('click', function () {
        var textToCopy = codeEl.textContent.trim();
        copyToClipboard(textToCopy, copyBtn);
      });

      actions.appendChild(copyBtn);
      header.appendChild(actions);

      pre.parentNode.insertBefore(windowWrapper, pre);
      windowWrapper.appendChild(header);
      windowWrapper.appendChild(pre);
    } else if (isInsideWindow) {
      var existingBtn = parent.querySelector('.code-copy-btn, .btn-copy-code');
      if (existingBtn && !existingBtn.getAttribute('data-has-click')) {
        existingBtn.setAttribute('data-has-click', 'true');
        if (!existingBtn.querySelector('svg')) {
          var btnLabel = existingBtn.textContent.trim() || 'Copiar';
          existingBtn.innerHTML = ICON_COPY + ' <span>' + escapeHtml(btnLabel) + '</span>';
        }
        existingBtn.addEventListener('click', function () {
          var textToCopy = codeEl.textContent.trim();
          copyToClipboard(textToCopy, existingBtn);
        });
      }
    }

    if (global.Prism && typeof global.Prism.highlightElement === 'function') {
      global.Prism.highlightElement(codeEl);
    } else {
      var raw = codeEl.textContent;
      codeEl.innerHTML = highlightCode(raw, lang);
    }

    if (pre.classList.contains('line-numbers') || pre.getAttribute('data-line-numbers') === 'true') {
      addLineNumbers(pre, codeEl);
    }
  }

  function highlightAll() {
    var blocks = document.querySelectorAll('pre code, .code-block, .code-window pre');
    Array.prototype.forEach.call(blocks, function (codeOrPre) {
      var pre = codeOrPre.tagName.toLowerCase() === 'pre' ? codeOrPre : codeOrPre.closest('pre');
      if (pre) {
        enhanceCodeBlock(pre);
      }
    });
  }

  var DexterCode = {
    highlightAll: highlightAll,
    enhance: enhanceCodeBlock,
    copy: copyToClipboard
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', highlightAll);
    } else {
      highlightAll();
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DexterCode;
  } else {
    global.DexterCode = DexterCode;
  }

})(typeof window !== 'undefined' ? window : this);
