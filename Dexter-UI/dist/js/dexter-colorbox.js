/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-colorbox.js
 * @description [PT-BR] Controlador Lightbox e Modal Multimídia 100% Vanilla JS,
 *              inspirado e compatível drop-in com Jack Moore Colorbox & Example 5
 *              (com ponte jQuery opcional $.colorbox / $.fn.colorbox). Suporta
 *              galerias agrupadas por rel, slideshow automático, conteúdo inline
 *              com restauração DOM, HTML direto, iframe, AJAX, teclado e ARIA.
 *              [EN]    Zero-dependency Vanilla JS Lightbox & Multimedia Modal
 *              controller inspired and drop-in compatible with Jack Moore's
 *              Colorbox & Example 5 (with optional jQuery bridge). Supports
 *              grouped galleries, slideshow, DOM-restoring inline content,
 *              direct HTML, iframe, AJAX, keyboard shortcuts & WAI-ARIA.
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

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory(global);
  } else if (typeof define === 'function' && define.amd) {
    define([], function () { return factory(global); });
  } else {
    var api = factory(global);
    global.DexterColorbox = api;
    global.colorbox = api;
    if (global.dexter && typeof global.dexter === 'object') {
      global.dexter.colorbox = api;
    }
    if (global.jQuery) {
      global.jQuery.colorbox = api;
      global.jQuery.fn.colorbox = function (opts) {
        api(this, opts);
        return this;
      };
    }
  }
})(typeof window !== 'undefined' ? window : this, function (global) {
  'use strict';

  var defaults = {
    transition: 'elastic',
    speed: 280,
    fadeOut: 220,
    href: false,
    title: false,
    rel: false,
    photo: false,
    inline: false,
    iframe: false,
    html: false,
    width: false,
    height: false,
    innerWidth: false,
    innerHeight: false,
    maxWidth: '92%',
    maxHeight: '88%',
    opacity: 0.78,
    overlayClose: true,
    escKey: true,
    arrowKey: true,
    loop: true,
    returnFocus: true,
    trapFocus: true,
    scrolling: true,
    slideshow: false,
    slideshowSpeed: 2500,
    slideshowAuto: true,
    slideshowStart: 'Iniciar slideshow',
    slideshowStop: 'Pausar slideshow',
    current: 'imagem {current} de {total}',
    previous: 'Anterior',
    next: 'Próxima',
    close: 'Fechar',
    className: '',
    theme: 'example5',
    accent: 'primary',
    onOpen: null,
    onLoad: null,
    onComplete: null,
    onCleanup: null,
    onClosed: null
  };

  var state = {
    built: false,
    isOpen: false,
    group: [],
    index: 0,
    activeOpts: null,
    slideshowTimer: null,
    slideshowRunning: false,
    prevFocus: null,
    inlineRestore: null,
    loadToken: 0,
    closeTimer: null,
    els: {}
  };

  function dispatchCboxEvent(name, detail) {
    if (typeof document === 'undefined') return;
    try {
      document.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail || {} }));
    } catch (e) { /* ignore */ }
  }

  function isPlainObject(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  }

  function isPhotoHref(href, opts) {
    if (opts.photo) return true;
    if (!href || typeof href !== 'string') return false;
    if (/^data:image\//i.test(href)) return true;
    return /\.(png|jpe?g|gif|webp|avif|svg)(\?.*)?$/i.test(href);
  }

  function parseBoolAttr(val) {
    if (val === null || val === undefined || val === '') return undefined;
    if (val === 'true' || val === '1') return true;
    if (val === 'false' || val === '0') return false;
    return val;
  }

  function readElementAttrs(el) {
    if (!el || !el.getAttribute) return {};
    var cfg = {};
    var href = el.getAttribute('data-cbox-href') || el.getAttribute('href');
    if (href) cfg.href = href;

    var imgChild = el.querySelector && el.querySelector('img');
    var title = el.getAttribute('data-cbox-title') || el.getAttribute('title') || (imgChild && imgChild.getAttribute('alt'));
    if (title) cfg.title = title;

    var rel = el.getAttribute('data-cbox-rel') || el.getAttribute('rel');
    if (rel && rel !== 'nofollow' && rel !== 'noopener' && rel !== 'noreferrer') cfg.rel = rel;

    var map = {
      transition: 'data-cbox-transition',
      inline: 'data-cbox-inline',
      iframe: 'data-cbox-iframe',
      photo: 'data-cbox-photo',
      slideshow: 'data-cbox-slideshow',
      slideshowAuto: 'data-cbox-slideshow-auto',
      width: 'data-cbox-width',
      height: 'data-cbox-height',
      innerWidth: 'data-cbox-inner-width',
      innerHeight: 'data-cbox-inner-height',
      theme: 'data-cbox-theme',
      accent: 'data-cbox-accent',
      className: 'data-cbox-class'
    };
    Object.keys(map).forEach(function (prop) {
      var raw = el.getAttribute(map[prop]);
      if (raw !== null) {
        var parsed = parseBoolAttr(raw);
        if (parsed !== undefined) cfg[prop] = parsed;
      }
    });
    return cfg;
  }

  function restoreInlineNode() {
    var rec = state.inlineRestore;
    if (!rec) return;
    if (rec.placeholder && rec.placeholder.parentNode) {
      rec.placeholder.parentNode.insertBefore(rec.node, rec.placeholder);
      rec.placeholder.parentNode.removeChild(rec.placeholder);
    }
    if (rec.wasHidden && rec.node.style) {
      rec.node.style.display = rec.prevDisplay || '';
    }
    state.inlineRestore = null;
  }

  function stopSlideshow() {
    if (state.slideshowTimer) {
      clearTimeout(state.slideshowTimer);
      state.slideshowTimer = null;
    }
    state.slideshowRunning = false;
    if (state.els.slideshow) {
      state.els.slideshow.classList.remove('cboxSlideshow_on');
      state.els.slideshow.classList.add('cboxSlideshow_off');
      var cfg = state.activeOpts || defaults;
      state.els.slideshow.textContent = cfg.slideshowStart || 'Iniciar slideshow';
      state.els.slideshow.setAttribute('aria-pressed', 'false');
    }
  }

  function startSlideshow() {
    var cfg = state.activeOpts || defaults;
    if (!cfg.slideshow || state.group.length < 2) return;
    if (state.slideshowTimer) clearTimeout(state.slideshowTimer);
    state.slideshowRunning = true;
    if (state.els.slideshow) {
      state.els.slideshow.classList.add('cboxSlideshow_on');
      state.els.slideshow.classList.remove('cboxSlideshow_off');
      state.els.slideshow.textContent = cfg.slideshowStop || 'Pausar slideshow';
      state.els.slideshow.setAttribute('aria-pressed', 'true');
    }
    state.slideshowTimer = setTimeout(function () {
      if (state.isOpen && state.slideshowRunning) {
        colorbox.next();
      }
    }, Number(cfg.slideshowSpeed) || 2500);
  }

  function ensureDOM() {
    if (state.built || typeof document === 'undefined') return;

    var overlay = document.createElement('div');
    overlay.id = 'cboxOverlay';

    var root = document.createElement('div');
    root.id = 'colorbox';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-label', 'Visualizador Colorbox');
    root.setAttribute('tabindex', '-1');

    var wrapper = document.createElement('div');
    wrapper.id = 'cboxWrapper';

    var content = document.createElement('div');
    content.id = 'cboxContent';

    var loaded = document.createElement('div');
    loaded.id = 'cboxLoadedContent';

    var loadingOverlay = document.createElement('div');
    loadingOverlay.id = 'cboxLoadingOverlay';
    var loadingGraphic = document.createElement('div');
    loadingGraphic.id = 'cboxLoadingGraphic';
    loadingOverlay.appendChild(loadingGraphic);

    var bar = document.createElement('div');
    bar.className = 'cbox-bar';

    var navGroup = document.createElement('div');
    navGroup.className = 'cbox-nav-group';

    var btnPrev = document.createElement('button');
    btnPrev.id = 'cboxPrevious';
    btnPrev.type = 'button';
    btnPrev.setAttribute('aria-label', 'Anterior');
    btnPrev.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="15 18 9 12 15 6"/></svg>';

    var btnNext = document.createElement('button');
    btnNext.id = 'cboxNext';
    btnNext.type = 'button';
    btnNext.setAttribute('aria-label', 'Próxima');
    btnNext.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>';

    var btnSlideshow = document.createElement('button');
    btnSlideshow.id = 'cboxSlideshow';
    btnSlideshow.type = 'button';
    btnSlideshow.className = 'cboxSlideshow_off';

    var currentEl = document.createElement('span');
    currentEl.id = 'cboxCurrent';

    navGroup.appendChild(btnPrev);
    navGroup.appendChild(btnNext);
    navGroup.appendChild(btnSlideshow);
    navGroup.appendChild(currentEl);

    var titleEl = document.createElement('div');
    titleEl.id = 'cboxTitle';

    var btnClose = document.createElement('button');
    btnClose.id = 'cboxClose';
    btnClose.type = 'button';
    btnClose.setAttribute('aria-label', 'Fechar');
    btnClose.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

    bar.appendChild(navGroup);
    bar.appendChild(titleEl);
    bar.appendChild(btnClose);

    content.appendChild(loaded);
    content.appendChild(loadingOverlay);
    content.appendChild(bar);
    wrapper.appendChild(content);
    root.appendChild(wrapper);

    document.body.appendChild(overlay);
    document.body.appendChild(root);

    state.els = {
      overlay: overlay,
      root: root,
      wrapper: wrapper,
      content: content,
      loaded: loaded,
      loadingOverlay: loadingOverlay,
      bar: bar,
      prev: btnPrev,
      next: btnNext,
      slideshow: btnSlideshow,
      current: currentEl,
      title: titleEl,
      close: btnClose
    };

    btnClose.addEventListener('click', function () { colorbox.close(); });
    btnPrev.addEventListener('click', function () { colorbox.prev(); });
    btnNext.addEventListener('click', function () { colorbox.next(); });
    btnSlideshow.addEventListener('click', function () {
      if (state.slideshowRunning) {
        state.slideshowPausedManually = true;
        stopSlideshow();
      } else {
        state.slideshowPausedManually = false;
        startSlideshow();
      }
    });

    root.addEventListener('click', function (e) {
      if ((e.target === root || e.target === overlay) && state.activeOpts && state.activeOpts.overlayClose) {
        colorbox.close();
      }
    });
    overlay.addEventListener('click', function () {
      if (state.activeOpts && state.activeOpts.overlayClose) {
        colorbox.close();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (!state.isOpen || !state.activeOpts) return;
      if (e.key === 'Escape' && state.activeOpts.escKey) {
        e.preventDefault();
        colorbox.close();
      } else if (e.key === 'ArrowLeft' && state.activeOpts.arrowKey && state.group.length > 1) {
        e.preventDefault();
        colorbox.prev();
      } else if (e.key === 'ArrowRight' && state.activeOpts.arrowKey && state.group.length > 1) {
        e.preventDefault();
        colorbox.next();
      }
    });

    state.built = true;
  }

  function applySizing(opts) {
    var els = state.els;
    els.loaded.style.width = opts.innerWidth || opts.width || '';
    els.loaded.style.height = opts.innerHeight || opts.height || '';

    // Evita que maxWidth/maxHeight em '%' encolham #cboxLoadedContent para menos de 100% dentro de #cboxContent
    var mw = opts.maxWidth ? String(opts.maxWidth).trim() : '';
    var mh = opts.maxHeight ? String(opts.maxHeight).trim() : '';
    els.wrapper.style.maxWidth = /%$/.test(mw) ? (mw.slice(0, -1) + 'vw') : mw;
    els.wrapper.style.maxHeight = /%$/.test(mh) ? (mh.slice(0, -1) + 'vh') : mh;
    els.loaded.style.maxWidth = '100%';
    els.loaded.style.maxHeight = /%$/.test(mh) ? ('calc(' + mh.slice(0, -1) + 'vh - 72px)') : (mh || '');
    els.loaded.style.overflow = opts.scrolling === false ? 'hidden' : 'auto';
  }

  function applyThemeAndClasses(opts) {
    var els = state.els;
    var root = els.root;
    var overlay = els.overlay;

    Array.prototype.slice.call(root.classList).forEach(function (cls) {
      if (cls !== 'is-open') root.classList.remove(cls);
    });
    Array.prototype.slice.call(overlay.classList).forEach(function (cls) {
      if (cls !== 'is-open') overlay.classList.remove(cls);
    });

    var tr = opts.transition || 'elastic';
    root.classList.add('cbox-trans-' + tr);
    overlay.classList.add('cbox-trans-' + tr);
    root.classList.add('cbox-theme-' + (opts.theme || 'example5'));
    if (opts.accent) root.classList.add('cbox-' + opts.accent);
    if (opts.className) {
      String(opts.className).trim().split(/\s+/).forEach(function (c) {
        if (c) root.classList.add(c);
      });
    }

    if (typeof opts.opacity === 'number') {
      overlay.style.backgroundColor = 'rgba(15, 23, 42, ' + opts.opacity + ')';
    }
  }

  function updateControls(opts) {
    var els = state.els;
    var total = state.group.length;
    var showNav = total > 1;
    els.prev.style.display = showNav ? 'inline-flex' : 'none';
    els.next.style.display = showNav ? 'inline-flex' : 'none';
    els.prev.setAttribute('title', opts.previous || 'Anterior');
    els.next.setAttribute('title', opts.next || 'Próxima');
    els.close.setAttribute('title', opts.close || 'Fechar');

    if (showNav) {
      var tpl = opts.current || 'imagem {current} de {total}';
      els.current.textContent = tpl
        .replace('{current}', String(state.index + 1))
        .replace('{total}', String(total));
      els.current.style.display = '';
    } else {
      els.current.textContent = '';
      els.current.style.display = 'none';
    }

    els.slideshow.style.display = (opts.slideshow && showNav) ? 'inline-flex' : 'none';
    els.title.textContent = opts.title || '';
  }

  function finishLoad(opts) {
    var els = state.els;
    els.loadingOverlay.classList.remove('is-loading');
    updateControls(opts);
    if (opts.slideshow && state.group.length > 1 && opts.slideshowAuto && !state.slideshowPausedManually) {
      startSlideshow();
    }
    if (typeof opts.onComplete === 'function') opts.onComplete(opts);
    dispatchCboxEvent('cbox_complete', { settings: opts });
  }

  function loadCurrentItem() {
    ensureDOM();
    restoreInlineNode();
    if (state.slideshowTimer) {
      clearTimeout(state.slideshowTimer);
      state.slideshowTimer = null;
    }

    var entry = state.group[state.index] || {};
    var opts = Object.assign({}, defaults, state.baseOpts || {}, entry.attrs || {});
    state.activeOpts = opts;
    state.loadToken += 1;
    var myToken = state.loadToken;

    var els = state.els;
    applyThemeAndClasses(opts);
    applySizing(opts);
    updateControls(opts);

    if (typeof opts.onLoad === 'function') opts.onLoad(opts);
    dispatchCboxEvent('cbox_load', { settings: opts });

    els.loaded.innerHTML = '';
    els.loaded.classList.remove('cbox-no-padding', 'cbox-is-photo');
    els.loadingOverlay.classList.add('is-loading');

    // 1. Direct HTML
    if (opts.html !== false && opts.html !== undefined && opts.html !== null) {
      if (typeof opts.html === 'object' && opts.html.nodeType) {
        els.loaded.appendChild(opts.html);
      } else {
        els.loaded.innerHTML = String(opts.html);
      }
      finishLoad(opts);
      return;
    }

    // 2. Inline DOM element (moves and restores on close)
    if (opts.inline && opts.href) {
      var target = typeof opts.href === 'string' ? document.querySelector(opts.href) : opts.href;
      if (target && target.parentNode) {
        var placeholder = document.createComment('colorbox-inline-placeholder');
        target.parentNode.insertBefore(placeholder, target);
        var prevDisplay = target.style.display;
        var computedHidden = prevDisplay === 'none' || target.hasAttribute('hidden');
        if (prevDisplay === 'none') target.style.display = 'block';
        state.inlineRestore = {
          node: target,
          placeholder: placeholder,
          wasHidden: prevDisplay === 'none' && !computedHidden,
          prevDisplay: prevDisplay
        };
        els.loaded.appendChild(target);
      } else {
        els.loaded.innerHTML = '<div class="text-danger">Elemento inline não encontrado.</div>';
      }
      finishLoad(opts);
      return;
    }

    // 3. Iframe
    if (opts.iframe && opts.href) {
      els.loaded.classList.add('cbox-no-padding');
      if (!opts.width && !opts.innerWidth) els.loaded.style.width = 'min(860px, 84vw)';
      if (!opts.height && !opts.innerHeight) els.loaded.style.height = 'min(520px, 70vh)';
      var frame = document.createElement('iframe');
      frame.className = 'cboxIframe';
      frame.src = opts.href;
      frame.setAttribute('allowfullscreen', '');
      frame.addEventListener('load', function () {
        if (myToken === state.loadToken) finishLoad(opts);
      });
      els.loaded.appendChild(frame);
      setTimeout(function () {
        if (myToken === state.loadToken && els.loadingOverlay.classList.contains('is-loading')) {
          finishLoad(opts);
        }
      }, 600);
      return;
    }

    // 4. Photo
    if (isPhotoHref(opts.href, opts)) {
      els.loaded.classList.add('cbox-no-padding', 'cbox-is-photo');
      var pre = new Image();
      pre.onload = function () {
        if (myToken !== state.loadToken) return;
        var img = document.createElement('img');
        img.className = 'cboxPhoto';
        img.src = opts.href;
        img.alt = opts.title || 'Imagem Colorbox';
        img.addEventListener('click', function () {
          if (state.group.length > 1) colorbox.next();
        });
        els.loaded.appendChild(img);
        finishLoad(opts);
      };
      pre.onerror = function () {
        if (myToken !== state.loadToken) return;
        els.loaded.classList.remove('cbox-no-padding');
        els.loaded.innerHTML = '<div class="p-3 text-danger">Falha ao carregar imagem.</div>';
        finishLoad(opts);
      };
      pre.src = opts.href;
      return;
    }

    // 5. AJAX / Fetch fallback
    if (opts.href && typeof fetch === 'function') {
      fetch(opts.href, { credentials: 'same-origin' })
        .then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.text();
        })
        .then(function (html) {
          if (myToken !== state.loadToken) return;
          els.loaded.innerHTML = html;
          finishLoad(opts);
        })
        .catch(function () {
          if (myToken !== state.loadToken) return;
          els.loaded.innerHTML = '<div class="text-danger">Não foi possível carregar o conteúdo remoto.</div>';
          finishLoad(opts);
        });
      return;
    }

    finishLoad(opts);
  }

  function openGroup(groupEntries, startIndex, baseOpts) {
    ensureDOM();
    if (state.closeTimer) {
      clearTimeout(state.closeTimer);
      state.closeTimer = null;
    }
    state.group = groupEntries;
    state.index = Math.max(0, startIndex || 0);
    state.baseOpts = baseOpts || {};
    state.slideshowPausedManually = false;

    if (!state.isOpen) {
      state.prevFocus = document.activeElement;
      state.isOpen = true;
      state.els.overlay.classList.add('is-open');
      state.els.root.classList.add('is-open');
      requestAnimationFrame(function () {
        try { state.els.root.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      });
      var openOpts = Object.assign({}, defaults, state.baseOpts, (groupEntries[state.index] && groupEntries[state.index].attrs) || {});
      if (typeof openOpts.onOpen === 'function') openOpts.onOpen(openOpts);
      dispatchCboxEvent('cbox_open', { settings: openOpts });
    }

    loadCurrentItem();
  }

  function collectRelGroup(trigger) {
    var rel = trigger.getAttribute('data-cbox-rel') || trigger.getAttribute('rel');
    if (rel && rel !== 'nofollow' && rel !== 'noopener' && rel !== 'noreferrer') {
      var matches = Array.prototype.slice.call(
        document.querySelectorAll('[rel="' + rel + '"], [data-cbox-rel="' + rel + '"]')
      );
      if (matches.length) {
        return matches.map(function (el) {
          return { el: el, attrs: readElementAttrs(el) };
        });
      }
    }
    return [{ el: trigger, attrs: readElementAttrs(trigger) }];
  }

  // Função principal compatível com colorbox(target, opts) e colorbox(opts)
  function colorbox(target, options) {
    if (typeof document === 'undefined') return null;

    if (isPlainObject(target)) {
      var directOpts = Object.assign({}, target);
      if (directOpts.rel) {
        var grp = Array.prototype.slice.call(
          document.querySelectorAll('[rel="' + directOpts.rel + '"], [data-cbox-rel="' + directOpts.rel + '"]')
        ).map(function (el) {
          return { el: el, attrs: readElementAttrs(el) };
        });
        if (grp.length) {
          openGroup(grp, 0, directOpts);
          return colorbox;
        }
      }
      openGroup([{ el: null, attrs: directOpts }], 0, directOpts);
      return colorbox;
    }

    var els = [];
    if (typeof target === 'string') {
      els = Array.prototype.slice.call(document.querySelectorAll(target));
    } else if (target && target.length !== undefined && !target.nodeType) {
      els = Array.prototype.slice.call(target);
    } else if (target && target.nodeType) {
      els = [target];
    }

    var cfg = isPlainObject(options) ? options : {};
    els.forEach(function (el) {
      if (el.__dxCboxBound) el.removeEventListener('click', el.__dxCboxBound);
      var handler = function (e) {
        e.preventDefault();
        var merged = collectRelGroup(el);
        var idx = 0;
        for (var i = 0; i < merged.length; i++) {
          if (merged[i].el === el) { idx = i; break; }
        }
        openGroup(merged, idx, cfg);
      };
      el.__dxCboxBound = handler;
      el.addEventListener('click', handler);
    });

    if (cfg.open && els.length) {
      els[0].click();
    }
    return colorbox;
  }

  colorbox.settings = defaults;

  colorbox.next = function () {
    if (!state.isOpen || state.group.length < 2) return;
    if (state.index + 1 < state.group.length) {
      state.index += 1;
    } else if (!state.activeOpts || state.activeOpts.loop !== false) {
      state.index = 0;
    } else {
      stopSlideshow();
      return;
    }
    loadCurrentItem();
  };

  colorbox.prev = function () {
    if (!state.isOpen || state.group.length < 2) return;
    if (state.index - 1 >= 0) {
      state.index -= 1;
    } else if (!state.activeOpts || state.activeOpts.loop !== false) {
      state.index = state.group.length - 1;
    } else {
      return;
    }
    loadCurrentItem();
  };

  colorbox.close = function () {
    if (!state.isOpen || !state.built) return;
    var opts = state.activeOpts || defaults;
    if (typeof opts.onCleanup === 'function') opts.onCleanup(opts);
    dispatchCboxEvent('cbox_cleanup', { settings: opts });

    stopSlideshow();
    state.isOpen = false;
    state.els.overlay.classList.remove('is-open');
    state.els.root.classList.remove('is-open');

    state.closeTimer = setTimeout(function () {
      restoreInlineNode();
      if (state.els.loaded) state.els.loaded.innerHTML = '';
      if (opts.returnFocus !== false && state.prevFocus && typeof state.prevFocus.focus === 'function') {
        try { state.prevFocus.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
      }
      if (typeof opts.onClosed === 'function') opts.onClosed(opts);
      dispatchCboxEvent('cbox_closed', { settings: opts });
    }, opts.transition === 'none' ? 10 : Number(opts.fadeOut) || 220);
  };

  colorbox.resize = function (opts) {
    if (!state.built || !opts) return;
    applySizing(Object.assign({}, state.activeOpts || defaults, opts));
  };

  colorbox.element = function () {
    return (state.group[state.index] && state.group[state.index].el) || null;
  };

  colorbox.remove = function () {
    colorbox.close();
    if (state.built) {
      if (state.els.overlay && state.els.overlay.parentNode) state.els.overlay.parentNode.removeChild(state.els.overlay);
      if (state.els.root && state.els.root.parentNode) state.els.root.parentNode.removeChild(state.els.root);
      state.els = {};
      state.built = false;
    }
  };

  // Auto-inicialização declarativa para [data-dx-colorbox] / [data-cbox]
  var autoBound = false;
  colorbox.init = function () {
    if (autoBound || typeof document === 'undefined') return;
    autoBound = true;
    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('[data-dx-colorbox], [data-cbox]');
      if (!trigger || trigger.__dxCboxBound) return;
      e.preventDefault();
      var grp = collectRelGroup(trigger);
      var idx = 0;
      for (var i = 0; i < grp.length; i++) {
        if (grp[i].el === trigger) { idx = i; break; }
      }
      openGroup(grp, idx, {});
    });
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', colorbox.init);
    } else {
      colorbox.init();
    }
  }

  return colorbox;
});
