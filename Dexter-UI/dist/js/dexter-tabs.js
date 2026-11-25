/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-tabs.js
 * @description [PT-BR] Controlador nativo e acessível de Abas e Abas Verticais (Tabs & Vertical Tabs)
 *              para o Dexter UI: ativação por clique, navegação por teclado (WAI-ARIA Tabs Pattern),
 *              animação de transição suave, eventos de ciclo de vida e compatibilidade total com
 *              os atributos data-dx-toggle="tab", data-bs-toggle="tab" e data-toggle="tab", com zero dependências externas.
 *              [EN]    Native and accessible Tabs & Vertical Tabs controller for Dexter UI:
 *              click activation, full keyboard navigation (WAI-ARIA Tabs Pattern), smooth pane transitions,
 *              lifecycle events, and drop-in compatibility with data-dx-toggle="tab", data-bs-toggle="tab"
 *              and data-toggle="tab", zero external dependencies.
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
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    var instance = factory();
    global.DexterTabs = instance;
    global.Tab = instance; // Alias Bootstrap
    global.DexterTabsX = instance.TabsX;
    global.TabsX = instance.TabsX;

    if (global.jQuery) {
      global.jQuery.fn.tabsX = function (option) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
          var inst = instance.TabsX.getOrCreateInstance(this, typeof option === 'object' ? option : {});
          if (typeof option === 'string' && inst && typeof inst[option] === 'function') {
            inst[option].apply(inst, args);
          }
        });
      };
    }
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var instances = new WeakMap();

  /**
   * Dispara evento customizado compatível
   */
  function dispatchTabEvent(element, eventName, relatedTarget) {
    var evt = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: true,
      detail: { relatedTarget: relatedTarget }
    });
    element.dispatchEvent(evt);
    return !evt.defaultPrevented;
  }

  /**
   * Classe DexterTabs
   */
  function DexterTabs(element, options) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;

    if (instances.has(this.element)) {
      return instances.get(this.element);
    }

    this.options = Object.assign({
      syncHash: this.element.getAttribute('data-sync-hash') === 'true'
    }, options || {});

    this.targetPane = this._getTargetPane();
    this.nav = this.element.closest('.nav, .nav-tabs, .nav-pills, .nav-underline');

    this._initAria();
    this._bindEvents();

    instances.set(this.element, this);
  }

  /**
   * Obtém o painel de conteúdo alvo da aba
   */
  DexterTabs.prototype._getTargetSelector = function () {
    return this.element.getAttribute('data-dx-target') ||
           this.element.getAttribute('data-bs-target') ||
           this.element.getAttribute('data-target') ||
           this.element.getAttribute('href');
  };

  DexterTabs.prototype._getTargetPane = function () {
    var targetSelector = this._getTargetSelector();

    if (!targetSelector || targetSelector === '#') return null;

    try {
      return document.querySelector(targetSelector);
    } catch (e) {
      return null;
    }
  };

  /**
   * Inicializa atributos de acessibilidade ARIA
   */
  DexterTabs.prototype._initAria = function () {
    if (!this.element.getAttribute('role')) {
      this.element.setAttribute('role', 'tab');
    }

    var isActive = this.element.classList.contains('active');
    this.element.setAttribute('aria-selected', isActive ? 'true' : 'false');
    this.element.setAttribute('tabindex', isActive ? '0' : '-1');

    if (this.nav && !this.nav.getAttribute('role')) {
      this.nav.setAttribute('role', 'tablist');
    }

    if (this.targetPane) {
      if (!this.targetPane.getAttribute('role')) {
        this.targetPane.setAttribute('role', 'tabpanel');
      }
      if (this.element.id && !this.targetPane.getAttribute('aria-labelledby')) {
        this.targetPane.setAttribute('aria-labelledby', this.element.id);
      }
    }
  };

  /**
   * Associa os eventos de clique e teclado
   */
  DexterTabs.prototype._bindEvents = function () {
    var self = this;

    this.element.addEventListener('click', function (e) {
      e.preventDefault();
      var tabsXContainer = self.element.closest('.tabs-x');
      var vUrl = self.element.getAttribute('data-url') || self.element.getAttribute('data-dx-url');
      if (tabsXContainer && vUrl) {
        var tabsXInst = DexterTabsX.getOrCreateInstance(tabsXContainer);
        var cacheKey = vUrl + (self._getTargetSelector() || '');
        if (!tabsXInst.enableCache || !tabsXInst.isCached(cacheKey)) {
          tabsXInst.loadTab(self.element);
          return;
        }
      }
      self.show();
    });

    this.element.addEventListener('keydown', function (e) {
      self._handleKeydown(e);
    });
  };

  /**
   * Navegação acessível por teclado (WAI-ARIA Tabs)
   */
  DexterTabs.prototype._handleKeydown = function (e) {
    if (!this.nav) return;

    var tabs = Array.prototype.filter.call(
      this.nav.querySelectorAll('[role="tab"], .nav-link'),
      function (el) { return !el.disabled && !el.classList.contains('disabled'); }
    );

    var currentIndex = tabs.indexOf(this.element);
    if (currentIndex === -1) return;

    var isVertical = this.nav.classList.contains('flex-column') ||
                     !!this.nav.closest('.vtabs, .tabs-vertical, .tabs-left, .tabs-right');

    var targetIndex = -1;

    switch (e.key) {
      case 'ArrowDown':
        if (isVertical) {
          e.preventDefault();
          targetIndex = (currentIndex + 1) % tabs.length;
        }
        break;
      case 'ArrowUp':
        if (isVertical) {
          e.preventDefault();
          targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        }
        break;
      case 'ArrowRight':
        if (!isVertical) {
          e.preventDefault();
          targetIndex = (currentIndex + 1) % tabs.length;
        }
        break;
      case 'ArrowLeft':
        if (!isVertical) {
          e.preventDefault();
          targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        }
        break;
      case 'Home':
        e.preventDefault();
        targetIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        targetIndex = tabs.length - 1;
        break;
    }

    if (targetIndex !== -1 && tabs[targetIndex]) {
      var nextTab = tabs[targetIndex];
      var nextInstance = DexterTabs.getOrCreateInstance(nextTab);
      nextInstance.show();
      nextTab.focus();
    }
  };

  /**
   * Ativa a aba e exibe seu respectivo painel de conteúdo
   */
  DexterTabs.prototype.show = function () {
    if (this.element.classList.contains('active') || this.element.disabled || this.element.classList.contains('disabled')) {
      return;
    }

    var self = this;
    var currentActive = this.nav ? this.nav.querySelector('.nav-link.active, [role="tab"].active') : null;

    // Dispara eventos 'hide' e 'show' canceláveis
    if (currentActive) {
      if (!dispatchTabEvent(currentActive, 'dexter:tab:hide', this.element)) return;
      dispatchTabEvent(currentActive, 'hide.bs.tab', this.element);
    }

    if (!dispatchTabEvent(this.element, 'dexter:tab:show', currentActive)) return;
    dispatchTabEvent(this.element, 'show.bs.tab', currentActive);

    // 1. Desativa a aba anterior
    if (this.nav) {
      var allTabs = this.nav.querySelectorAll('.nav-link, [role="tab"]');
      allTabs.forEach(function (tab) {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
      });
    }

    // 2. Ativa esta aba
    this.element.classList.add('active');
    this.element.setAttribute('aria-selected', 'true');
    this.element.setAttribute('tabindex', '0');

    // 3. Alterna os painéis de conteúdo
    if (this.targetPane) {
      var tabContent = this.targetPane.parentElement;
      if (tabContent && tabContent.classList.contains('tab-content')) {
        var currentActivePane = tabContent.querySelector('.tab-pane.active');
        if (currentActivePane) {
          currentActivePane.classList.remove('show');
          currentActivePane.classList.remove('active');
        }
      }

      this.targetPane.classList.add('active');
      // Força reflow para transição suave em classes .fade
      void this.targetPane.offsetWidth;
      this.targetPane.classList.add('show');
    }

    // 4. Sincroniza hash na URL se configurado
    if (this.options.syncHash && this.targetPane && this.targetPane.id) {
      try {
        history.replaceState(null, null, '#' + this.targetPane.id);
      } catch (err) {}
    }

    // 5. Se pertencer a um container rolável (.tabs-scrollable), centraliza a aba ativa
    var scrollableParent = this.nav ? this.nav.closest('.tabs-scrollable') : null;
    if (scrollableParent && scrollableInstances.has(scrollableParent)) {
      var scrollableInst = scrollableInstances.get(scrollableParent);
      scrollableInst.scrollToActiveTab(this.element);
    }

    // Dispara eventos finais 'hidden' e 'shown'
    if (currentActive) {
      dispatchTabEvent(currentActive, 'dexter:tab:hidden', this.element);
      dispatchTabEvent(currentActive, 'hidden.bs.tab', this.element);
    }

    dispatchTabEvent(this.element, 'dexter:tab:shown', currentActive);
    dispatchTabEvent(this.element, 'shown.bs.tab', currentActive);
  };

  /**
   * Retorna ou cria uma instância do controlador para o elemento
   */
  DexterTabs.getOrCreateInstance = function (element, options) {
    return instances.get(element) || new DexterTabs(element, options);
  };

  /**
   * Retorna uma instância existente
   */
  DexterTabs.getInstance = function (element) {
    return instances.get(element) || null;
  };

  // ---------------------------------------------------------------------------
  // DexterScrollableTabs: Controlador de Abas Roláveis com Setas de Navegação
  // Inspirado no scrollable-tabs-bootstrap-5 com arquitetura Vanilla JS nativa
  // ---------------------------------------------------------------------------

  var scrollableInstances = new WeakMap();

  var SVG_CHEVRON_LEFT = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>';
  var SVG_CHEVRON_RIGHT = '<svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>';

  /**
   * Construtor DexterScrollableTabs
   */
  function DexterScrollableTabs(element, options) {
    this.container = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.container) return;

    if (scrollableInstances.has(this.container)) {
      return scrollableInstances.get(this.container);
    }

    this.options = Object.assign({
      scrollAmount: 220,
      autoScrollActive: true,
      wheelScroll: true,
      dragScroll: true
    }, options || {});

    this._initElements();
    this._bindEvents();
    this.updateArrows();

    if (this.options.autoScrollActive) {
      var self = this;
      setTimeout(function () {
        self.scrollToActiveTab();
      }, 50);
    }

    scrollableInstances.set(this.container, this);
  }

  DexterScrollableTabs.prototype._initElements = function () {
    // 1. Trilha de abas
    this.track = this.container.querySelector('.tabs-scrollable-track, .nav-tabs-scrollable');
    if (!this.track) {
      if (this.container.classList.contains('nav') || this.container.classList.contains('nav-tabs') || this.container.classList.contains('nav-pills')) {
        this.track = this.container;
      } else {
        this.track = this.container.querySelector('.nav, .nav-tabs, .nav-pills') || this.container;
      }
    }

    // 2. Localiza ou cria botões de seta
    this.btnLeft = this.container.querySelector('.tabs-scroller-left, .scroller-left');
    this.btnRight = this.container.querySelector('.tabs-scroller-right, .scroller-right');

    if (!this.btnLeft) {
      this.btnLeft = document.createElement('button');
      this.btnLeft.type = 'button';
      this.btnLeft.className = 'tabs-scroller-btn tabs-scroller-left';
      this.btnLeft.setAttribute('aria-label', 'Rolar abas para a esquerda');
      this.btnLeft.innerHTML = SVG_CHEVRON_LEFT;
      this.container.insertBefore(this.btnLeft, this.track);
    }

    if (!this.btnRight) {
      this.btnRight = document.createElement('button');
      this.btnRight.type = 'button';
      this.btnRight.className = 'tabs-scroller-btn tabs-scroller-right';
      this.btnRight.setAttribute('aria-label', 'Rolar abas para a direita');
      this.btnRight.innerHTML = SVG_CHEVRON_RIGHT;
      this.container.appendChild(this.btnRight);
    }
  };

  DexterScrollableTabs.prototype._bindEvents = function () {
    var self = this;

    if (this.btnLeft) {
      this.btnLeft.addEventListener('click', function (e) {
        e.preventDefault();
        self.scrollLeft();
      });
    }

    if (this.btnRight) {
      this.btnRight.addEventListener('click', function (e) {
        e.preventDefault();
        self.scrollRight();
      });
    }

    if (this.track) {
      this.track.addEventListener('scroll', function () {
        self.updateArrows();
      }, { passive: true });

      // Suporte à rolagem horizontal com a roda do mouse
      if (this.options.wheelScroll) {
        this.track.addEventListener('wheel', function (e) {
          if (e.deltaY !== 0 && self.track.scrollWidth > self.track.clientWidth) {
            e.preventDefault();
            self.track.scrollLeft += e.deltaY;
            self.updateArrows();
          }
        }, { passive: false });
      }

      // Suporte ao arrasto com o mouse (Drag to Scroll)
      if (this.options.dragScroll) {
        var isDown = false;
        var startX = 0;
        var scrollLeftStart = 0;
        var hasDragged = false;

        this.track.addEventListener('mousedown', function (e) {
          if (e.button !== 0) return;
          isDown = true;
          hasDragged = false;
          startX = e.pageX - self.track.offsetLeft;
          scrollLeftStart = self.track.scrollLeft;
        });

        window.addEventListener('mousemove', function (e) {
          if (!isDown) return;
          var x = e.pageX - self.track.offsetLeft;
          var walk = (x - startX);
          if (Math.abs(walk) > 5) {
            hasDragged = true;
          }
          self.track.scrollLeft = scrollLeftStart - walk;
        });

        window.addEventListener('mouseup', function () {
          if (isDown) {
            isDown = false;
          }
        });

        this.track.addEventListener('click', function (e) {
          if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
            hasDragged = false;
          }
        }, true);
      }
    }

    // Redimensionamento responsivo
    if (typeof ResizeObserver !== 'undefined' && this.track) {
      this._resizeObserver = new ResizeObserver(function () {
        self.updateArrows();
      });
      this._resizeObserver.observe(this.track);
      if (this.container !== this.track) {
        this._resizeObserver.observe(this.container);
      }
    } else {
      window.addEventListener('resize', function () {
        self.updateArrows();
      });
    }
  };

  DexterScrollableTabs.prototype.scrollLeft = function (amount) {
    var delta = amount || this.options.scrollAmount || Math.round(this.track.clientWidth * 0.7);
    this.track.scrollBy({ left: -delta, behavior: 'smooth' });
  };

  DexterScrollableTabs.prototype.scrollRight = function (amount) {
    var delta = amount || this.options.scrollAmount || Math.round(this.track.clientWidth * 0.7);
    this.track.scrollBy({ left: delta, behavior: 'smooth' });
  };

  DexterScrollableTabs.prototype.updateArrows = function () {
    if (!this.track) return;
    var maxScroll = this.track.scrollWidth - this.track.clientWidth;
    var canScroll = maxScroll > 2;

    if (!canScroll) {
      if (this.btnLeft) {
        this.btnLeft.disabled = true;
        this.btnLeft.classList.add('is-hidden');
      }
      if (this.btnRight) {
        this.btnRight.disabled = true;
        this.btnRight.classList.add('is-hidden');
      }
      return;
    }

    if (this.btnLeft) {
      this.btnLeft.classList.remove('is-hidden');
      var isAtStart = this.track.scrollLeft <= 2;
      this.btnLeft.disabled = isAtStart;
      this.btnLeft.setAttribute('aria-disabled', isAtStart ? 'true' : 'false');
    }

    if (this.btnRight) {
      this.btnRight.classList.remove('is-hidden');
      var isAtEnd = this.track.scrollLeft >= maxScroll - 2;
      this.btnRight.disabled = isAtEnd;
      this.btnRight.setAttribute('aria-disabled', isAtEnd ? 'true' : 'false');
    }
  };

  DexterScrollableTabs.prototype.scrollToActiveTab = function (activeTab) {
    if (!this.track) return;
    var tab = activeTab || this.track.querySelector('.nav-link.active, [role="tab"].active');
    if (!tab) return;

    var tabLeft = tab.offsetLeft;
    var tabWidth = tab.offsetWidth;
    var trackScroll = this.track.scrollLeft;
    var trackWidth = this.track.clientWidth;

    if (tabLeft < trackScroll) {
      this.track.scrollTo({ left: Math.max(0, tabLeft - 30), behavior: 'smooth' });
    } else if (tabLeft + tabWidth > trackScroll + trackWidth) {
      this.track.scrollTo({ left: tabLeft + tabWidth - trackWidth + 30, behavior: 'smooth' });
    }
  };

  DexterScrollableTabs.getOrCreateInstance = function (element, options) {
    return scrollableInstances.get(element) || new DexterScrollableTabs(element, options);
  };

  DexterScrollableTabs.getInstance = function (element) {
    return scrollableInstances.get(element) || null;
  };

  /**
   * Inicialização estática universal
   */
  DexterTabs.initAll = function (root) {
    var container = root || document;
    var selector = '[data-dx-toggle="tab"], [data-bs-toggle="tab"], [data-toggle="tab"], ' +
                   '[data-dx-toggle="pill"], [data-bs-toggle="pill"], [data-toggle="pill"]';
    var tabs = container.querySelectorAll(selector);
    var list = [];
    tabs.forEach(function (tab) {
      list.push(DexterTabs.getOrCreateInstance(tab));
    });

    // Inicializa contêineres roláveis (.tabs-scrollable e data-dx-scrollable)
    var scrollables = container.querySelectorAll('.tabs-scrollable, [data-dx-scrollable="true"]');
    scrollables.forEach(function (scrollContainer) {
      DexterScrollableTabs.getOrCreateInstance(scrollContainer);
    });

    // Inicializa contêineres Tabs-X (.tabs-x)
    var tabsXContainers = container.querySelectorAll('.tabs-x');
    tabsXContainers.forEach(function (tx) {
      DexterTabsX.getOrCreateInstance(tx);
    });

    // Se houver hash na URL, ativa a aba correspondente
    if (typeof window !== 'undefined' && window.location.hash) {
      try {
        var hashPane = document.querySelector(window.location.hash);
        if (hashPane && hashPane.classList.contains('tab-pane')) {
          var matchingTrigger = document.querySelector('[href="' + window.location.hash + '"], [data-bs-target="' + window.location.hash + '"], [data-dx-target="' + window.location.hash + '"]');
          if (matchingTrigger) {
            DexterTabs.getOrCreateInstance(matchingTrigger).show();
          }
        }
      } catch (e) {}
    }

    return list;
  };

  // ---------------------------------------------------------------------------
  // DexterTabsX: Controlador Avançado de Tabs-X (kartik-v/bootstrap-tabs-x)
  // ---------------------------------------------------------------------------

  var tabsXInstances = new WeakMap();

  function DexterTabsX(element, options) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;

    if (tabsXInstances.has(this.element)) {
      var existing = tabsXInstances.get(this.element);
      if (options) {
        Object.assign(existing.options, options);
        existing.enableCache = Boolean(existing.options.enableCache);
        existing.cacheTimeout = Number(existing.options.cacheTimeout) || 300000;
      }
      return existing;
    }

    this.options = Object.assign({
      enableCache: this.element.getAttribute('data-enable-cache') !== 'false',
      cacheTimeout: parseFloat(this.element.getAttribute('data-cache-timeout')) || 300000,
      maxTitleLength: 14,
      addCss: 'tabs-krajee',
      loadingClass: 'kv-tab-loading',
      fetchOptions: {},
      loader: null,
      successCallback: {},
      errorCallback: {}
    }, options || {});

    this.enableCache = Boolean(this.options.enableCache);
    this.cacheTimeout = isNaN(this.options.cacheTimeout) ? 300000 : this.options.cacheTimeout;
    this._cache = {};

    if (this.options.addCss && !this.element.classList.contains(this.options.addCss)) {
      this.element.classList.add(this.options.addCss);
    }

    // Garante inicialização dos gatilhos internos
    var tabs = this.element.querySelectorAll('.nav-tabs .nav-link, [role="tab"], [data-dx-toggle="tab"], [data-bs-toggle="tab"], [data-toggle="tab"]');
    tabs.forEach(function (tab) {
      DexterTabs.getOrCreateInstance(tab);
    });

    tabsXInstances.set(this.element, this);
  }

  DexterTabsX.prototype.isCached = function (key) {
    var ts = this._cache[key];
    if (!ts) return false;
    return (Date.now() - ts) < this.cacheTimeout;
  };

  DexterTabsX.prototype.flushCache = function (tabIds) {
    if (!tabIds) {
      this._cache = {};
      return;
    }
    var list = Array.isArray(tabIds) ? tabIds : [tabIds];
    var self = this;
    list.forEach(function (tabId) {
      Object.keys(self._cache).forEach(function (k) {
        if (k.slice(-tabId.length) === tabId) {
          delete self._cache[k];
        }
      });
    });
  };

  DexterTabsX.prototype.loadTab = function (tabEl) {
    var self = this;
    var tab = typeof tabEl === 'string' ? this.element.querySelector(tabEl) : tabEl;
    if (!tab) return Promise.resolve();

    var url = tab.getAttribute('data-url') || tab.getAttribute('data-dx-url');
    var targetSel = tab.getAttribute('data-dx-target') || tab.getAttribute('data-bs-target') || tab.getAttribute('data-target') || tab.getAttribute('href');
    var pane = targetSel && targetSel !== '#' ? document.querySelector(targetSel) : null;
    if (!url || !pane) {
      DexterTabs.getOrCreateInstance(tab).show();
      return Promise.resolve();
    }

    var cacheKey = url + targetSel;
    if (this.enableCache && this.isCached(cacheKey)) {
      DexterTabs.getOrCreateInstance(tab).show();
      return Promise.resolve(pane.innerHTML);
    }

    var loadingCls = tab.getAttribute('data-loading-class') || this.options.loadingClass || 'kv-tab-loading';
    tab.classList.add(loadingCls);
    dispatchTabEvent(tab, 'tabsX:beforeSend', pane);
    dispatchTabEvent(tab, 'dx:tabs-x:load', pane);

    var reqPromise = typeof this.options.loader === 'function'
      ? Promise.resolve(this.options.loader(url, tab, pane))
      : fetch(url, this.options.fetchOptions).then(function (r) {
          if (!r.ok) throw new Error('HTTP ' + r.status);
          return r.text();
        });

    return reqPromise
      .then(function (html) {
        pane.innerHTML = html;
        if (self.enableCache) {
          self._cache[cacheKey] = Date.now();
        }
        tab.classList.remove(loadingCls);
        DexterTabs.getOrCreateInstance(tab).show();
        if (self.options.successCallback && typeof self.options.successCallback[targetSel] === 'function') {
          self.options.successCallback[targetSel](html, tab, pane);
        }
        dispatchTabEvent(tab, 'tabsX:success', pane);
        dispatchTabEvent(tab, 'dx:tabs-x:loaded', pane);
        return html;
      })
      .catch(function (err) {
        tab.classList.remove(loadingCls);
        if (self.options.errorCallback && typeof self.options.errorCallback[targetSel] === 'function') {
          self.options.errorCallback[targetSel](err, tab, pane);
        }
        dispatchTabEvent(tab, 'tabsX:error', pane);
        dispatchTabEvent(tab, 'dx:tabs-x:error', pane);
      });
  };

  DexterTabsX.getOrCreateInstance = function (element, options) {
    var el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!el) return null;
    if (tabsXInstances.has(el)) {
      var inst = tabsXInstances.get(el);
      if (options) {
        Object.assign(inst.options, options);
        inst.enableCache = Boolean(inst.options.enableCache);
        inst.cacheTimeout = Number(inst.options.cacheTimeout) || 300000;
      }
      return inst;
    }
    return new DexterTabsX(el, options);
  };

  DexterTabsX.getInstance = function (element) {
    var el = typeof element === 'string' ? document.querySelector(element) : element;
    return el ? tabsXInstances.get(el) || null : null;
  };

  DexterTabs.Scrollable = DexterScrollableTabs;
  DexterTabs.TabsX = DexterTabsX;

  // Auto-init no carregamento da página
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        DexterTabs.initAll();
      });
    } else {
      DexterTabs.initAll();
    }
  }

  return DexterTabs;
});
