/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-toc.js
 * @description [PT-BR] Controlador nativo zero-dependência para Sumário Automático
 *              (DexterToc / Table of Contents) com rastreamento ScrollSpy integrado,
 *              inspirado e aprimorado a partir do bootstrap-toc (afeld/bootstrap-toc).
 *              Gera automaticamente listas hierárquicas e aninhadas de seções (H1 a H5),
 *              cria âncoras/slugs únicas para títulos sem ID (com normalização de
 *              caracteres e acentos em português), rastreia a posição de leitura em
 *              tempo real via ScrollSpy, suporta rolagem suave com compensação de
 *              cabeçalhos fixos, modo recolhível (collapsible), atualização de hash na URL
 *              e compatibilidade imediata com a API jQuery/Bootstrap Toc.
 *              [EN]    Zero-dependency native controller for automated Table of Contents
 *              (DexterToc) with integrated ScrollSpy tracking, inspired and enhanced from
 *              bootstrap-toc (afeld/bootstrap-toc).
 *              Automatically generates nested hierarchical section lists (H1 to H5),
 *              creates unique slug anchors for headings without an ID (with Portuguese
 *              character & accent normalization), tracks live reading position via
 *              ScrollSpy, supports smooth scrolling with sticky header offset compensation,
 *              collapsible mode, URL hash updating and drop-in compatibility with the
 *              jQuery/Bootstrap Toc API.
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
    var TocClass = factory();
    global.DexterToc = TocClass;
    global.Toc = TocClass; // Drop-in compatibility with afeld/bootstrap-toc
    global.dexter = global.dexter || {};
    global.dexter.Toc = TocClass;

    // Drop-in alias jQuery se jQuery estiver presente
    if (global.jQuery) {
      global.jQuery.fn.toc = function (option) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
          var instance = TocClass.getOrCreateInstance(this, typeof option === 'object' ? option : {});
          if (typeof option === 'string' && typeof instance[option] === 'function') {
            instance[option].apply(instance, args);
          }
        });
      };
    }
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var INSTANCE_MAP = new WeakMap();

  var DEFAULT_OPTIONS = {
    target: null, // Elemento ou seletor com o conteúdo (null = auto-detect [data-toc-content], main ou body)
    headings: 'h2, h3', // Títulos a indexar
    ignoreSelector: '.no-toc, [data-toc-skip], .modal *, .code-window *, .card-header *, .dropdown-menu *',
    scrollSpy: true,
    offset: 80, // Offset do cabeçalho fixo em pixels
    smoothScroll: true,
    collapsible: false,
    autoIds: true,
    title: '', // Título opcional exibido no topo do sumário
    titleIcon: true,
    updateHash: true,
    activeClass: 'active',
    slugPrefix: ''
  };

  /**
   * Converte texto em slug limpo para URL / ID (normaliza acentos em pt-BR)
   * @param {string} text
   * @returns {string}
   */
  function slugify(text) {
    if (!text) return 'secao';
    return text
      .toString()
      .normalize('NFD') // Decompõe acentos (ex.: ã -> a + ~)
      .replace(/[\u0300-\u036f]/g, '') // Remove marcas de acentuação
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-_]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Espaços para traços
      .replace(/-+/g, '-') // Múltiplos traços para um só
      .replace(/^-+|-+$/g, '') || 'secao';
  }

  /**
   * Classe principal DexterToc
   */
  function DexterToc(element, options) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) {
      throw new Error('[DexterToc] Elemento do sumário não encontrado.');
    }

    // Evita inicialização duplicada
    if (INSTANCE_MAP.has(this.element)) {
      return INSTANCE_MAP.get(this.element);
    }

    this.options = Object.assign({}, DEFAULT_OPTIONS);
    this._readDataAttributes();
    if (options && typeof options === 'object') {
      Object.assign(this.options, options);
    }

    this._headings = [];
    this._links = [];
    this._activeId = null;
    this._isScrolling = false;
    this._scrollRafId = null;
    this._boundOnScroll = this._onScroll.bind(this);
    this._boundOnClick = this._onClick.bind(this);

    this._init();
    INSTANCE_MAP.set(this.element, this);
  }

  /**
   * Lê atributos data-* do container HTML
   */
  DexterToc.prototype._readDataAttributes = function () {
    var el = this.element;
    var dataset = el.dataset || {};

    if (dataset.tocTarget || dataset.target) {
      this.options.target = dataset.tocTarget || dataset.target;
    }
    if (dataset.tocHeadings) {
      this.options.headings = dataset.tocHeadings;
    }
    if (dataset.tocOffset) {
      var offsetVal = parseInt(dataset.tocOffset, 10);
      if (!isNaN(offsetVal)) this.options.offset = offsetVal;
    }
    if (dataset.tocCollapsible !== undefined) {
      this.options.collapsible = dataset.tocCollapsible === 'true' || dataset.tocCollapsible === '';
    }
    if (dataset.tocTitle !== undefined) {
      this.options.title = dataset.tocTitle;
    }
    if (dataset.tocSmoothScroll !== undefined) {
      this.options.smoothScroll = dataset.tocSmoothScroll !== 'false';
    }
    if (dataset.tocUpdateHash !== undefined) {
      this.options.updateHash = dataset.tocUpdateHash !== 'false';
    }
    if (el.classList.contains('toc-collapsible')) {
      this.options.collapsible = true;
    }
  };

  /**
   * Inicializa o componente
   */
  DexterToc.prototype._init = function () {
    this.refresh();
    this._setupEvents();

    // Dispara evento de inicialização
    this.element.dispatchEvent(new CustomEvent('dx:toc:init', {
      bubbles: true,
      detail: { toc: this, headingsCount: this._headings.length }
    }));
  };

  /**
   * Localiza o elemento container do conteúdo
   */
  DexterToc.prototype._getContentContainer = function () {
    if (this.options.target) {
      var customEl = typeof this.options.target === 'string'
        ? document.querySelector(this.options.target)
        : this.options.target;
      if (customEl) return customEl;
    }

    var designated = document.querySelector('[data-toc-content]');
    if (designated) return designated;

    var main = document.querySelector('main');
    if (main) return main;

    return document.body;
  };

  /**
   * Localiza os títulos dentro do container
   */
  DexterToc.prototype._findHeadings = function () {
    var container = this._getContentContainer();
    if (!container) return [];

    var selectors = this.options.headings.split(',').map(function (s) {
      return s.trim();
    }).filter(Boolean);

    if (selectors.length === 0) selectors = ['h2', 'h3'];

    var querySelector = selectors.join(', ');
    var rawHeadings = Array.prototype.slice.call(container.querySelectorAll(querySelector));

    // Filtra cabeçalhos a ignorar
    var ignoreSelector = this.options.ignoreSelector;
    var filtered = rawHeadings.filter(function (h) {
      // Ignora elementos vazios ou escondidos
      if (!h.textContent.trim()) return false;
      if (h.closest('.no-toc') || h.closest('[data-toc-skip]')) return false;
      if (h.matches(ignoreSelector)) return false;
      return true;
    });

    // Garante que cada cabeçalho possui um ID único
    var usedIds = {};
    filtered.forEach(function (h, idx) {
      var id = h.id;
      if (!id && this.options.autoIds) {
        var baseSlug = slugify(h.textContent);
        if (this.options.slugPrefix) {
          baseSlug = this.options.slugPrefix + '-' + baseSlug;
        }
        var uniqueSlug = baseSlug;
        var counter = 1;
        while (usedIds[uniqueSlug] || document.getElementById(uniqueSlug)) {
          uniqueSlug = baseSlug + '-' + counter;
          counter++;
        }
        h.id = uniqueSlug;
        id = uniqueSlug;
      }
      if (id) {
        usedIds[id] = true;
      }
    }.bind(this));

    return filtered;
  };

  /**
   * Constrói a árvore de elementos HTML do Sumário
   */
  DexterToc.prototype._buildDom = function (headings) {
    var self = this;
    var fragment = document.createDocumentFragment();

    // Cabeçalho opcional do TOC
    if (this.options.title) {
      var headerEl = document.createElement('div');
      headerEl.className = 'dx-toc-header toc-header';

      if (this.options.titleIcon) {
        var iconSpan = document.createElement('span');
        iconSpan.className = 'dx-toc-header-icon';
        iconSpan.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>';
        headerEl.appendChild(iconSpan);
      }

      var textSpan = document.createElement('span');
      textSpan.textContent = this.options.title;
      headerEl.appendChild(textSpan);

      fragment.appendChild(headerEl);
    }

    var navEl = document.createElement('nav');
    navEl.className = 'dx-toc-nav toc-nav';
    navEl.setAttribute('aria-label', this.options.title || 'Sumário de conteúdo');

    var rootUl = document.createElement('ul');
    rootUl.className = 'dx-toc-list toc-list nav';

    if (headings.length === 0) {
      var emptyLi = document.createElement('li');
      emptyLi.className = 'text-muted small px-3 py-2';
      emptyLi.textContent = 'Nenhuma seção encontrada.';
      rootUl.appendChild(emptyLi);
      navEl.appendChild(rootUl);
      fragment.appendChild(navEl);
      return fragment;
    }

    // Pilha hierárquica para aninhamento correto (ex.: h2 -> h3 -> h4)
    var stack = [{ level: 0, ul: rootUl }];
    self._links = [];

    headings.forEach(function (h) {
      var level = parseInt(h.tagName.substring(1), 10) || 2;
      var text = (h.getAttribute('data-toc-text') || h.textContent || '').trim();
      var id = h.id;

      if (!id) return;

      // Cria item <li>
      var li = document.createElement('li');
      li.className = 'dx-toc-item toc-item toc-item-h' + level;
      li.setAttribute('data-target-id', id);

      // Cria link <a>
      var a = document.createElement('a');
      a.className = 'dx-toc-link toc-link nav-link';
      a.href = '#' + id;
      a.setAttribute('data-target-id', id);
      a.textContent = text;
      li.appendChild(a);

      self._links.push({
        linkEl: a,
        itemEl: li,
        headingEl: h,
        id: id,
        level: level
      });

      // Ajusta pilha de níveis
      while (stack.length > 1 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      var currentTop = stack[stack.length - 1];

      if (level > currentTop.level && stack.length > 1) {
        // Precisa aninhar em sublista dentro do li anterior
        var parentLi = currentTop.ul.lastElementChild;
        if (parentLi) {
          var subUl = parentLi.querySelector(':scope > ul');
          if (!subUl) {
            subUl = document.createElement('ul');
            subUl.className = 'dx-toc-sublist toc-sublist nav';
            parentLi.appendChild(subUl);
          }
          subUl.appendChild(li);
          stack.push({ level: level, ul: subUl });
          return;
        }
      }

      // Nível direto no ul atual
      currentTop.ul.appendChild(li);
      stack.push({ level: level, ul: currentTop.ul });
    });

    navEl.appendChild(rootUl);
    fragment.appendChild(navEl);
    return fragment;
  };

  /**
   * Recarrega e remonta o Sumário (útil para SPAs e conteúdo dinâmico)
   */
  DexterToc.prototype.refresh = function () {
    this._headings = this._findHeadings();
    this.element.innerHTML = '';
    var dom = this._buildDom(this._headings);
    this.element.appendChild(dom);

    if (this.options.scrollSpy) {
      this._onScroll();
    }
  };

  /**
   * Configura listeners de eventos (cliques e scroll)
   */
  DexterToc.prototype._setupEvents = function () {
    this.element.addEventListener('click', this._boundOnClick);

    if (this.options.scrollSpy) {
      window.addEventListener('scroll', this._boundOnScroll, { passive: true });
      window.addEventListener('resize', this._boundOnScroll, { passive: true });
    }
  };

  /**
   * Manipulador de clique nos links do TOC
   */
  DexterToc.prototype._onClick = function (e) {
    var link = e.target.closest('.dx-toc-link, .toc-link, a.nav-link');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;

    var targetId = href.substring(1);
    var targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    e.preventDefault();

    this.scrollTo(targetId, this.options.smoothScroll);

    // Dispara evento customizado
    this.element.dispatchEvent(new CustomEvent('dx:toc:click', {
      bubbles: true,
      detail: { id: targetId, heading: targetEl, link: link }
    }));
  };

  /**
   * Rola suavemente até o elemento de destino
   */
  DexterToc.prototype.scrollTo = function (targetId, smooth) {
    var targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    var self = this;
    var offset = this.options.offset || 80;
    var targetTop = targetEl.getBoundingClientRect().top + window.pageYOffset - offset;

    self._isScrolling = true;
    self._activateHeading(targetId);

    if (smooth !== false && 'scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth'
      });
      setTimeout(function () {
        self._isScrolling = false;
      }, 500);
    } else {
      window.scrollTo(0, Math.max(0, targetTop));
      self._isScrolling = false;
    }

    if (self.options.updateHash && window.history && window.history.pushState) {
      window.history.pushState(null, '', '#' + targetId);
    }
  };

  /**
   * Manipulador de rolagem para o ScrollSpy em tempo real
   */
  DexterToc.prototype._onScroll = function () {
    var self = this;
    if (self._isScrolling) return;

    if (self._scrollRafId) {
      cancelAnimationFrame(self._scrollRafId);
    }

    self._scrollRafId = requestAnimationFrame(function () {
      self._updateActiveHeading();
    });
  };

  /**
   * Calcula qual título está em foco na viewport
   */
  DexterToc.prototype._updateActiveHeading = function () {
    if (!this._links || this._links.length === 0) return;

    var offset = (this.options.offset || 80) + 15;
    var scrollY = window.pageYOffset || document.documentElement.scrollTop;
    var windowHeight = window.innerHeight || document.documentElement.clientHeight;
    var docHeight = document.documentElement.scrollHeight;

    // Se estiver no final da página, ativa o último item
    if (scrollY + windowHeight >= docHeight - 20) {
      var last = this._links[this._links.length - 1];
      if (last) this._activateHeading(last.id);
      return;
    }

    // Procura o cabeçalho mais próximo da linha de leitura (offset)
    var currentActiveId = null;

    for (var i = 0; i < this._links.length; i++) {
      var item = this._links[i];
      var rect = item.headingEl.getBoundingClientRect();

      if (rect.top <= offset) {
        currentActiveId = item.id;
      } else {
        break;
      }
    }

    // Se nenhum passou da linha de corte, ativa o primeiro se a página estiver no topo
    if (!currentActiveId && this._links.length > 0 && scrollY < 200) {
      currentActiveId = this._links[0].id;
    }

    if (currentActiveId && currentActiveId !== this._activeId) {
      this._activateHeading(currentActiveId);
    }
  };

  /**
   * Ativa visualmente o item no sumário
   */
  DexterToc.prototype._activateHeading = function (id) {
    if (!id) return;
    this._activeId = id;

    var activeLink = null;
    var activeItem = null;

    // Atualiza links e classes
    this._links.forEach(function (entry) {
      var isActive = entry.id === id;
      entry.linkEl.classList.toggle(this.options.activeClass, isActive);
      if (isActive) {
        entry.linkEl.setAttribute('aria-current', 'true');
        activeLink = entry.linkEl;
        activeItem = entry.itemEl;
      } else {
        entry.linkEl.removeAttribute('aria-current');
      }
    }.bind(this));

    // Manipula expansão no modo recolhível / collapsible
    if (this.options.collapsible) {
      // Limpa estados has-active e is-expanded
      var allItems = this.element.querySelectorAll('.dx-toc-item, .toc-item, li');
      allItems.forEach(function (li) {
        li.classList.remove('has-active', 'is-expanded');
      });

      // Adiciona aos ancestrais do ativo
      if (activeItem) {
        var parent = activeItem;
        while (parent && parent !== this.element) {
          if (parent.classList.contains('toc-item') || parent.classList.contains('dx-toc-item') || parent.tagName === 'LI') {
            parent.classList.add('has-active', 'is-expanded');
          }
          parent = parent.parentElement;
        }
      }
    }

    // Dispara evento
    this.element.dispatchEvent(new CustomEvent('dx:toc:activate', {
      bubbles: true,
      detail: { id: id, link: activeLink }
    }));
  };

  /**
   * Destrói a instância e remove event listeners
   */
  DexterToc.prototype.destroy = function () {
    this.element.removeEventListener('click', this._boundOnClick);
    window.removeEventListener('scroll', this._boundOnScroll);
    window.removeEventListener('resize', this._boundOnScroll);

    if (this._scrollRafId) {
      cancelAnimationFrame(this._scrollRafId);
    }

    this.element.innerHTML = '';
    INSTANCE_MAP.delete(this.element);

    this.element.dispatchEvent(new CustomEvent('dx:toc:destroy', {
      bubbles: true,
      detail: { toc: this }
    }));
  };

  // -------------------------------------------------------------------------
  // Métodos Estáticos / Static Methods
  // -------------------------------------------------------------------------

  DexterToc.getInstance = function (element) {
    var el = typeof element === 'string' ? document.querySelector(element) : element;
    return el ? INSTANCE_MAP.get(el) || null : null;
  };

  DexterToc.getOrCreateInstance = function (element, options) {
    return DexterToc.getInstance(element) || new DexterToc(element, options);
  };

  /**
   * Inicializa um ou múltiplos sumários (compatível com Toc.init)
   * @param {string|Element|Object} selectorOrOptions
   * @param {Object} [options]
   */
  DexterToc.init = function (selectorOrOptions, options) {
    var selector = 'nav[data-toggle="toc"], nav[data-dx-toc], [data-dx-toc], .dx-toc';
    var opts = {};

    if (typeof selectorOrOptions === 'string') {
      selector = selectorOrOptions;
      opts = options || {};
    } else if (selectorOrOptions instanceof HTMLElement) {
      return DexterToc.getOrCreateInstance(selectorOrOptions, options || {});
    } else if (selectorOrOptions && typeof selectorOrOptions === 'object') {
      opts = selectorOrOptions;
      if (opts.selector) selector = opts.selector;
    }

    var elements = document.querySelectorAll(selector);
    var instances = [];
    elements.forEach(function (el) {
      instances.push(DexterToc.getOrCreateInstance(el, opts));
    });
    return instances.length === 1 ? instances[0] : instances;
  };

  /**
   * Auto-inicialização automática ao carregar o DOM
   */
  DexterToc.autoInit = function () {
    var elements = document.querySelectorAll('nav[data-toggle="toc"], nav[data-dx-toc], [data-dx-toc], .dx-toc:not([data-dx-manual])');
    elements.forEach(function (el) {
      DexterToc.getOrCreateInstance(el);
    });
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', DexterToc.autoInit);
    } else {
      DexterToc.autoInit();
    }
  }

  return DexterToc;
});
