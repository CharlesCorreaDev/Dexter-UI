/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        examples/docs-shell.js
 * @description [PT-BR] Controlador unificado do portal de documentação Dexter UI:
 *              hidrata o cabeçalho limpo (5 categorias), renderiza o catálogo
 *              completo na barra lateral com filtro instantâneo (Ctrl+K), gerencia
 *              gaveta mobile responsiva, persiste o tema Claro/Escuro em localStorage,
 *              gera TOC automático com ScrollSpy e adiciona paginação Anterior/Próxima.
 *              [EN]    Unified controller for the Dexter UI documentation portal:
 *              hydrates clean 5-category header, renders full catalog sidebar with
 *              live search filter (Ctrl+K), handles responsive mobile drawer, persists
 *              Light/Dark theme in localStorage, builds automatic TOC + ScrollSpy,
 *              and appends Previous/Next page navigation.
 *
 * @author      Charles Corrêa
 * @contact     E-mail: charlescorreaweb@gmail.com
 * @website     https://charlescorrea.com.br
 * @github      https://github.com/CharlesCorreaDev
 *
 * @repository  https://github.com/CharlesCorreaDev/Dexter-UI
 * @copyright   2026 Charles Corrêa. Todos os direitos reservados / All rights reserved.
 * =============================================================================
 */

(function () {
  'use strict';

  var NAV_GROUPS = [
    {
      id: 'start',
      label: 'Início',
      heading: 'Começando',
      items: [
        { file: 'index.html', title: 'Introdução & Visão Geral' }
      ]
    },
    {
      id: 'design',
      label: 'Design System',
      heading: 'Design System & Base',
      items: [
        { file: 'colors.html', title: 'Cores & Escala Tonal (28)' },
        { file: 'typography.html', title: 'Tipografia & Escala Fluida' },
        { file: 'prose.html', title: 'Prose (Conteúdo Editorial)' },
        { file: 'utilities.html', title: 'Utilitários CSS & Grid' },
        { file: 'elements.html', title: 'Elementos HTML5 Nativos' },
        { file: 'modern-css.html', title: 'CSS Moderno & Nativos (TW4 / BS6)' },
        { file: 'print.html', title: 'Impressão (@media print)' }
      ]
    },
    {
      id: 'core',
      label: 'Core UI',
      heading: 'Core UI & Estrutura',
      items: [
        { file: 'ui-kit.html', title: 'Core UI Kit (Botões, Alertas, Cards)' },
        { file: 'badges.html', title: 'Badges & Etiquetas (BS6 & Stylify)' },
        { file: 'sidebar.html', title: 'Sidebar Admin (Next-Sidebar)' },
        { file: 'dashboard.html', title: 'Dashboard Skeleton (Admin)' },
        { file: 'toc.html', title: 'Sumário Automático (TOC)' },
        { file: 'avatars.html', title: 'Avatares & Grupos' },
        { file: 'images.html', title: 'Imagens, Formas & Efeitos' },
        { file: 'ribbons.html', title: 'Ribbons & Faixas CSS (57 Estilos)' },
        { file: 'loaders.html', title: 'Loaders & Skeletons' },
        { file: 'tables.html', title: 'Tabelas & Paginação' },
        { file: 'data-display.html', title: 'Dados, Chat, Timeline & Stats' },
        { file: 'collections.html', title: 'Collections (Listas Materialize)' },
        { file: 'footer.html', title: 'Footer & Sticky Footer (Materialize)' },
        { file: 'templates-email.html', title: 'Templates Web & E-mail HTML' }
      ]
    },
    {
      id: 'forms',
      label: 'Formulários',
      heading: 'Formulários & Entradas',
      items: [
        { file: 'forms.html', title: 'Controles de Formulário' },
        { file: 'select.html', title: 'Select Moderno (SelectPicker)' },
        { file: 'multiselect.html', title: 'Seleção Múltipla (MultiSelect)' },
        { file: 'tags.html', title: 'Tags, Chips & Autocomplete' },
        { file: 'fileinput.html', title: 'Upload de Arquivos (FileInput)' },
        { file: 'rating.html', title: 'Avaliação por Estrelas (Rating)' },
        { file: 'spinner.html', title: 'Seletor Numérico (Spinner)' }
      ]
    },
    {
      id: 'interactive',
      label: 'Componentes',
      heading: 'Interativos & Navegação',
      items: [
        { file: 'accordion.html', title: 'Acordeão & Colapso' },
        { file: 'tabs.html', title: 'Abas Horizontais & Verticais' },
        { file: 'wizard.html', title: 'Assistente Wizard & Form' },
        { file: 'modals.html', title: 'Modais & Diálogos Dinâmicos' },
        { file: 'dropdowns.html', title: 'Menus Suspensos (Dropdowns)' },
        { file: 'toasts.html', title: 'Notificações Toast' },
        { file: 'carousel.html', title: 'Carrossel & Slider' },
        { file: 'calendar.html', title: 'Calendário de Eventos' },
        { file: 'treeview.html', title: 'Árvore Hierárquica (TreeView)' },
        { file: 'cookie-consent.html', title: 'Consentimento de Cookies (LGPD/GDPR)' },
        { file: 'waiting.html', title: 'Diálogo de Espera (WaitingFor)' },
        { file: 'layouts-widgets.html', title: 'Layouts, FAB, OTP, Diff & Widgets' },
        { file: 'popover-x.html', title: 'Popover Estendido (Popover-X)' },
        { file: 'alertify.html', title: 'Alertify (Alert, Confirm, Prompt & Factory)' },
        { file: 'colorbox.html', title: 'Colorbox (Lightbox & Modal Multimídia)' },
        { file: 'media-tools.html', title: 'Autosize, Zoom & Wheelzoom' }
      ]
    }
  ];

  function getCurrentFile() {
    var path = window.location.pathname || '';
    var seg = path.split('/').pop() || 'index.html';
    return seg.split('?')[0].split('#')[0] || 'index.html';
  }

  function applySavedTheme() {
    var saved = null;
    try { saved = localStorage.getItem('dexter-theme'); } catch (e) { /* ignore */ }
    var theme = saved === 'dark' || saved === 'light' ? saved : 'light';
    document.documentElement.setAttribute('data-dx-theme', theme);
    return theme;
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-dx-theme', theme);
    try { localStorage.setItem('dexter-theme', theme); } catch (e) { /* ignore */ }
    var btn = document.getElementById('docThemeToggle') || document.getElementById('themeToggle');
    if (btn) {
      btn.textContent = theme === 'dark' ? '☀️ Claro' : '🌙 Escuro';
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    }
  }

  function slugify(text) {
    return String(text || 'secao')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-_]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '') || 'secao';
  }

  function renderHeader(currentFile, activeGroupId) {
    var header = document.querySelector('header.doc-header');
    if (!header) return;

    var catLinks = NAV_GROUPS.map(function (g) {
      var firstHref = g.items[0].file;
      var cls = 'doc-header-link' + (g.id === activeGroupId ? ' active' : '');
      return '<a href="' + firstHref + '" class="' + cls + '">' + g.label + '</a>';
    }).join('');

    var theme = document.documentElement.getAttribute('data-dx-theme') || 'light';
    var themeLabel = theme === 'dark' ? '☀️ Claro' : '🌙 Escuro';

    header.innerHTML =
      '<div class="doc-header-left">' +
        '<button type="button" class="doc-mobile-menu-btn" id="docMobileMenuBtn" aria-label="Abrir menu de navegação" aria-expanded="false">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>' +
        '</button>' +
        '<a href="index.html" class="doc-brand">' +
          '<span class="doc-brand-title">Dexter UI</span>' +
          '<span class="doc-badge">v0.1.0</span>' +
        '</a>' +
      '</div>' +
      '<nav class="doc-header-nav" aria-label="Categorias principais">' + catLinks + '</nav>' +
      '<div class="doc-header-actions">' +
        '<button type="button" class="doc-search-trigger" id="docSearchTrigger" title="Filtrar componentes (Ctrl+K)">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
          '<span class="d-none d-sm-inline">Buscar</span>' +
          '<span class="doc-search-kbd">Ctrl+K</span>' +
        '</button>' +
        '<a href="https://github.com/CharlesCorreaDev/Dexter-UI" target="_blank" rel="noopener" class="doc-icon-btn d-none d-sm-inline-flex" title="GitHub">GitHub</a>' +
        '<button type="button" class="theme-toggle-btn" id="docThemeToggle" title="Alternar tema claro/escuro">' + themeLabel + '</button>' +
      '</div>';

    var toggleBtn = document.getElementById('docThemeToggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function () {
        var cur = document.documentElement.getAttribute('data-dx-theme') || 'light';
        setTheme(cur === 'dark' ? 'light' : 'dark');
      });
    }
  }

  function renderSidebar(currentFile) {
    var aside = document.querySelector('aside.doc-sidebar');
    if (!aside) return;

    var groupsHtml = NAV_GROUPS.map(function (g) {
      var linksHtml = g.items.map(function (item) {
        var active = item.file === currentFile ? ' active' : '';
        return '<a href="' + item.file + '" class="doc-nav-link' + active + '" data-nav-title="' + item.title.toLowerCase() + '">' + item.title + '</a>';
      }).join('');

      return '<div class="doc-nav-group" data-nav-group="' + g.id + '">' +
        '<div class="doc-nav-heading"><span>' + g.heading + '</span><span class="doc-nav-count">' + g.items.length + '</span></div>' +
        linksHtml +
      '</div>';
    }).join('');

    aside.innerHTML =
      '<div class="doc-sidebar-mobile-head">' +
        '<span class="fw-bold">Componentes</span>' +
        '<button type="button" class="doc-mobile-menu-btn d-inline-flex" id="docMobileCloseBtn" aria-label="Fechar menu">✕</button>' +
      '</div>' +
      '<div class="doc-sidebar-search">' +
        '<input type="search" id="docSidebarFilter" class="doc-sidebar-input" placeholder="Filtrar componentes..." aria-label="Filtrar componentes">' +
      '</div>' +
      '<nav aria-label="Menu da documentação">' + groupsHtml + '</nav>';

    // Backdrop para mobile drawer
    var backdrop = document.getElementById('docSidebarBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'docSidebarBackdrop';
      backdrop.className = 'doc-sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    function openDrawer(focusSearch) {
      aside.classList.add('is-open');
      backdrop.classList.add('is-open');
      var mb = document.getElementById('docMobileMenuBtn');
      if (mb) mb.setAttribute('aria-expanded', 'true');
      if (focusSearch) {
        setTimeout(function () {
          var inp = document.getElementById('docSidebarFilter');
          if (inp) inp.focus();
        }, 80);
      }
    }

    function closeDrawer() {
      aside.classList.remove('is-open');
      backdrop.classList.remove('is-open');
      var mb = document.getElementById('docMobileMenuBtn');
      if (mb) mb.setAttribute('aria-expanded', 'false');
    }

    var menuBtn = document.getElementById('docMobileMenuBtn');
    var closeBtn = document.getElementById('docMobileCloseBtn');
    if (menuBtn) menuBtn.addEventListener('click', function () { openDrawer(false); });
    if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);

    var searchTrigger = document.getElementById('docSearchTrigger');
    var filterInput = document.getElementById('docSidebarFilter');

    if (searchTrigger && filterInput) {
      searchTrigger.addEventListener('click', function () {
        if (window.innerWidth < 992) openDrawer(true);
        else filterInput.focus();
      });
    }

    if (filterInput) {
      filterInput.addEventListener('input', function () {
        var q = filterInput.value.trim().toLowerCase();
        var groups = aside.querySelectorAll('.doc-nav-group');
        groups.forEach(function (grp) {
          var visible = 0;
          grp.querySelectorAll('.doc-nav-link').forEach(function (lnk) {
            var match = !q || (lnk.getAttribute('data-nav-title') || '').indexOf(q) !== -1;
            lnk.style.display = match ? '' : 'none';
            if (match) visible++;
          });
          grp.style.display = visible > 0 ? '' : 'none';
        });
      });
    }

    document.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.innerWidth < 992) openDrawer(true);
        else if (filterInput) filterInput.focus();
      } else if (e.key === 'Escape') {
        if (aside.classList.contains('is-open')) closeDrawer();
      }
    });

    // Mantem o link ativo visivel na sidebar sem alterar o scroll da pagina
    var activeLink = aside.querySelector('.doc-nav-link.active');
    if (activeLink && typeof activeLink.scrollIntoView === 'function') {
      activeLink.scrollIntoView({ block: 'nearest' });
    }
  }

  function setupAutoToc() {
    var tocEl = document.querySelector('nav.doc-toc');
    var mainEl = document.querySelector('main.doc-main, main.doc-content, main');
    if (!tocEl || !mainEl) return;

    // Se toc.html usa DexterToc interativo com [data-toggle="toc"], respeita o controlador oficial
    if (tocEl.hasAttribute('data-toggle') && tocEl.getAttribute('data-toggle') === 'toc') {
      return;
    }

    var headings = Array.prototype.slice.call(mainEl.querySelectorAll('h2, h3')).filter(function (h) {
      return !h.closest('.no-toc, [data-toc-skip], .modal, .app, .dx-calendar') && h.textContent.trim().length > 0;
    });

    if (headings.length === 0) {
      tocEl.innerHTML = '<div class="doc-toc-heading">Nesta página</div><div class="small text-muted">Sem subseções.</div>';
      return;
    }

    var used = {};
    var html = '<div class="doc-toc-heading">Nesta página</div>';
    var pairs = [];

    headings.forEach(function (h) {
      var id = h.id;
      if (!id) {
        var base = slugify(h.textContent);
        var cand = base;
        var n = 1;
        while (used[cand] || document.getElementById(cand)) {
          cand = base + '-' + (n++);
        }
        h.id = cand;
        id = cand;
      }
      used[id] = true;
      var isSub = h.tagName.toLowerCase() === 'h3';
      html += '<a href="#' + id + '" class="doc-toc-link' + (isSub ? ' is-sub' : '') + '">' + h.textContent.trim() + '</a>';
      pairs.push({ id: id, heading: h });
    });

    tocEl.innerHTML = html;
    var tocLinks = Array.prototype.slice.call(tocEl.querySelectorAll('.doc-toc-link'));

    function updateActive() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var activeId = pairs[0] ? pairs[0].id : null;
      for (var i = 0; i < pairs.length; i++) {
        var top = pairs[i].heading.getBoundingClientRect().top;
        if (top <= 105) {
          activeId = pairs[i].id;
        } else {
          break;
        }
      }
      if (scrollTop + window.innerHeight >= document.documentElement.scrollHeight - 25 && pairs.length > 0) {
        activeId = pairs[pairs.length - 1].id;
      }
      tocLinks.forEach(function (lnk) {
        lnk.classList.toggle('active', lnk.getAttribute('href') === '#' + activeId);
      });
    }

    var rafId = null;
    window.addEventListener('scroll', function () {
      if (rafId) return;
      rafId = requestAnimationFrame(function () {
        rafId = null;
        updateActive();
      });
    }, { passive: true });
    updateActive();
  }

  function renderPager(currentFile) {
    var mainEl = document.querySelector('main.doc-main, main.doc-content, main');
    if (!mainEl || mainEl.querySelector('.doc-pager')) return;

    var flat = [];
    NAV_GROUPS.forEach(function (g) {
      g.items.forEach(function (it) { flat.push(it); });
    });

    var idx = flat.findIndex(function (it) { return it.file === currentFile; });
    if (idx === -1) return;

    var prev = idx > 0 ? flat[idx - 1] : null;
    var next = idx < flat.length - 1 ? flat[idx + 1] : null;

    var pager = document.createElement('nav');
    pager.className = 'doc-pager';
    pager.setAttribute('aria-label', 'Paginação da documentação');

    pager.innerHTML =
      (prev
        ? '<a href="' + prev.file + '" class="doc-pager-card"><span class="doc-pager-label">&larr; Anterior</span><span class="doc-pager-title">' + prev.title + '</span></a>'
        : '<div></div>') +
      (next
        ? '<a href="' + next.file + '" class="doc-pager-card is-next"><span class="doc-pager-label">Próximo &rarr;</span><span class="doc-pager-title">' + next.title + '</span></a>'
        : '<div></div>');

    mainEl.appendChild(pager);
  }

  // Aplica tema imediatamente antes do primeiro paint
  applySavedTheme();

  function init() {
    var currentFile = getCurrentFile();
    var activeGroup = NAV_GROUPS.find(function (g) {
      return g.items.some(function (it) { return it.file === currentFile; });
    });

    renderHeader(currentFile, activeGroup ? activeGroup.id : 'start');
    renderSidebar(currentFile);
    setupAutoToc();
    renderPager(currentFile);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
