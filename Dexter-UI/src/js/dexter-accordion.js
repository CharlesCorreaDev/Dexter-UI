/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-accordion.js
 * @description [PT-BR] Controlador nativo zero-dependência para Acordeão e Colapso (Accordion & Collapse),
 *              inspirado no Bootstrap 5 e no accordion-bs5 (hiltonmuccillo).
 *              Oferece suporte a marcação estática via atributos (data-dx-toggle="collapse", data-bs-toggle="collapse"),
 *              controle mútuo por pai (data-dx-parent), modo de abertura múltipla (alwaysOpen), transições fluidas
 *              de altura em CSS, métodos programáticos (openAll, closeAll, toggle), navegação acessível por teclado
 *              (ArrowUp, ArrowDown, Home, End conforme WAI-ARIA) e compatibilidade imediata com Bootstrap.Collapse.
 *              [EN]    Zero-dependency native controller for Accordion and Collapse,
 *              inspired by Bootstrap 5 and accordion-bs5 (hiltonmuccillo).
 *              Supports static markup via data attributes (data-dx-toggle="collapse", data-bs-toggle="collapse"),
 *              mutually exclusive parent grouping (data-dx-parent), multi-open mode (alwaysOpen), smooth CSS height
 *              transitions, programmatic API (openAll, closeAll, toggle), accessible keyboard navigation
 *              (ArrowUp, ArrowDown, Home, End per WAI-ARIA) and immediate compatibility with Bootstrap.Collapse.
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

  var instances = new WeakMap();

  /**
   * Dispara evento customizado compatível com Dexter e Bootstrap
   */
  function dispatchEvent(element, eventName, detail) {
    var prefix = 'dx.collapse';
    var bsPrefix = 'bs.collapse';
    var shortName = eventName.split('.')[0];

    var evt = new CustomEvent(shortName + '.' + prefix, {
      bubbles: true,
      cancelable: true,
      detail: detail || {}
    });
    element.dispatchEvent(evt);

    // Evento espelho Bootstrap para máxima compatibilidade
    var bsEvt = new CustomEvent(shortName + '.' + bsPrefix, {
      bubbles: true,
      cancelable: true,
      detail: detail || {}
    });
    element.dispatchEvent(bsEvt);

    return !evt.defaultPrevented;
  }

  /**
   * Força reflow no navegador
   */
  function reflow(element) {
    return element.offsetHeight;
  }

  /**
   * Classe DexterCollapse para controle individual de elementos colapsáveis
   */
  function DexterCollapse(element, config) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (!element) return;

    var existing = instances.get(element);
    if (existing) return existing;

    this._element = element;
    this._config = Object.assign({
      toggle: true,
      parent: null
    }, config || {});

    this._isTransitioning = false;

    // Detecta pai pelo atributo se não informado
    if (!this._config.parent) {
      var parentSelector = element.getAttribute('data-dx-parent') ||
                           element.getAttribute('data-bs-parent') ||
                           element.getAttribute('data-parent');
      if (parentSelector) {
        this._config.parent = parentSelector;
      }
    }

    instances.set(element, this);

    if (this._config.toggle) {
      this.toggle();
    }
  }

  DexterCollapse.prototype.show = function () {
    if (this._isTransitioning || this._element.classList.contains('show')) {
      return;
    }

    // Se houver pai definido (acordeão clássico mútuo), fecha outros itens abertos
    var parent = this._getParent();
    if (parent && !parent.hasAttribute('data-dx-always-open')) {
      var openCollapses = parent.querySelectorAll('.collapse.show');
      for (var i = 0; i < openCollapses.length; i++) {
        var openItem = openCollapses[i];
        if (openItem !== this._element) {
          var openInstance = DexterCollapse.getOrCreateInstance(openItem, { toggle: false, parent: parent });
          openInstance.hide();
        }
      }
    }

    var startEvent = dispatchEvent(this._element, 'show');
    if (!startEvent) return;

    this._isTransitioning = true;

    // Atualiza estado do botão de gatilho
    this._updateTriggers(true);

    this._element.classList.remove('collapse');
    this._element.classList.add('collapsing');
    this._element.style.height = '0px';

    reflow(this._element);

    var self = this;
    var complete = function () {
      self._isTransitioning = false;
      self._element.classList.remove('collapsing');
      self._element.classList.add('collapse', 'show');
      self._element.style.height = '';
      dispatchEvent(self._element, 'shown');
    };

    var height = this._element.scrollHeight;
    this._element.style.height = height + 'px';

    var duration = 350;
    setTimeout(complete, duration);
  };

  DexterCollapse.prototype.hide = function () {
    if (this._isTransitioning || !this._element.classList.contains('show')) {
      return;
    }

    var startEvent = dispatchEvent(this._element, 'hide');
    if (!startEvent) return;

    this._isTransitioning = true;

    // Atualiza estado do botão de gatilho
    this._updateTriggers(false);

    this._element.style.height = this._element.scrollHeight + 'px';
    reflow(this._element);

    this._element.classList.add('collapsing');
    this._element.classList.remove('collapse', 'show');

    this._element.style.height = '0px';

    var self = this;
    var complete = function () {
      self._isTransitioning = false;
      self._element.classList.remove('collapsing');
      self._element.classList.add('collapse');
      self._element.style.height = '';
      dispatchEvent(self._element, 'hidden');
    };

    var duration = 350;
    setTimeout(complete, duration);
  };

  DexterCollapse.prototype.toggle = function () {
    if (this._element.classList.contains('show')) {
      this.hide();
    } else {
      this.show();
    }
  };

  DexterCollapse.prototype._getParent = function () {
    if (!this._config.parent) return null;
    if (typeof this._config.parent === 'string') {
      return document.querySelector(this._config.parent);
    }
    return this._config.parent;
  };

  DexterCollapse.prototype._updateTriggers = function (isOpen) {
    var id = this._element.id;
    if (!id) return;

    var triggers = document.querySelectorAll(
      '[data-dx-toggle="collapse"][data-dx-target="#' + id + '"], ' +
      '[data-dx-toggle="collapse"][href="#' + id + '"], ' +
      '[data-bs-toggle="collapse"][data-bs-target="#' + id + '"], ' +
      '[data-bs-toggle="collapse"][href="#' + id + '"], ' +
      '[data-toggle="collapse"][data-target="#' + id + '"], ' +
      '[data-toggle="collapse"][href="#' + id + '"]'
    );

    for (var i = 0; i < triggers.length; i++) {
      var btn = triggers[i];
      if (isOpen) {
        btn.classList.remove('collapsed');
        btn.setAttribute('aria-expanded', 'true');
      } else {
        btn.classList.add('collapsed');
        btn.setAttribute('aria-expanded', 'false');
      }
    }
  };

  DexterCollapse.prototype.dispose = function () {
    instances.delete(this._element);
    this._element = null;
    this._config = null;
  };

  DexterCollapse.getInstance = function (element) {
    return instances.get(element) || null;
  };

  DexterCollapse.getOrCreateInstance = function (element, config) {
    return DexterCollapse.getInstance(element) || new DexterCollapse(element, config);
  };

  var accordionInstances = new WeakMap();

  /**
   * Classe DexterAccordion para orquestração de grupos de acordeões
   */
  function DexterAccordion(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    if (!element) return;

    var existing = accordionInstances.get(element);
    if (existing) return existing;

    this._element = element;
    this._initKeyboardNav();
    accordionInstances.set(element, this);
  }

  DexterAccordion.getInstance = function (element) {
    if (typeof element === 'string') element = document.querySelector(element);
    return element ? accordionInstances.get(element) || null : null;
  };

  DexterAccordion.getOrCreateInstance = function (element) {
    return DexterAccordion.getInstance(element) || new DexterAccordion(element);
  };

  DexterAccordion.prototype.openAll = function () {
    var collapses = this._element.querySelectorAll('.accordion-collapse, .collapse');
    for (var i = 0; i < collapses.length; i++) {
      var instance = DexterCollapse.getOrCreateInstance(collapses[i], { toggle: false });
      instance.show();
    }
  };

  DexterAccordion.prototype.closeAll = function () {
    var collapses = this._element.querySelectorAll('.accordion-collapse, .collapse');
    for (var i = 0; i < collapses.length; i++) {
      var instance = DexterCollapse.getOrCreateInstance(collapses[i], { toggle: false });
      instance.hide();
    }
  };

  DexterAccordion.prototype.open = function (indexOrSelector) {
    var target = null;
    if (typeof indexOrSelector === 'number') {
      var collapses = this._element.querySelectorAll('.accordion-collapse, .collapse');
      target = collapses[indexOrSelector];
    } else if (typeof indexOrSelector === 'string') {
      target = this._element.querySelector(indexOrSelector);
    } else {
      target = indexOrSelector;
    }

    if (target) {
      var instance = DexterCollapse.getOrCreateInstance(target, { toggle: false, parent: this._element });
      instance.show();
    }
  };

  DexterAccordion.prototype.close = function (indexOrSelector) {
    var target = null;
    if (typeof indexOrSelector === 'number') {
      var collapses = this._element.querySelectorAll('.accordion-collapse, .collapse');
      target = collapses[indexOrSelector];
    } else if (typeof indexOrSelector === 'string') {
      target = this._element.querySelector(indexOrSelector);
    } else {
      target = indexOrSelector;
    }

    if (target) {
      var instance = DexterCollapse.getOrCreateInstance(target, { toggle: false, parent: this._element });
      instance.hide();
    }
  };

  DexterAccordion.prototype.toggle = function (indexOrSelector) {
    var target = null;
    if (typeof indexOrSelector === 'number') {
      var collapses = this._element.querySelectorAll('.accordion-collapse, .collapse');
      target = collapses[indexOrSelector];
    } else if (typeof indexOrSelector === 'string') {
      target = this._element.querySelector(indexOrSelector);
    } else {
      target = indexOrSelector;
    }

    if (target) {
      var instance = DexterCollapse.getOrCreateInstance(target, { toggle: false });
      instance.toggle();
    }
  };

  /**
   * Acessibilidade por teclado (WAI-ARIA Accordion Pattern)
   */
  DexterAccordion.prototype._initKeyboardNav = function () {
    var self = this;
    this._element.addEventListener('keydown', function (e) {
      var target = e.target;
      if (!target || !target.classList.contains('accordion-button')) {
        return;
      }

      var buttons = Array.prototype.slice.call(self._element.querySelectorAll('.accordion-button'));
      var index = buttons.indexOf(target);
      if (index === -1) return;

      var nextIndex = -1;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        nextIndex = (index + 1) % buttons.length;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        nextIndex = (index - 1 + buttons.length) % buttons.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIndex = buttons.length - 1;
      }

      if (nextIndex >= 0 && buttons[nextIndex]) {
        buttons[nextIndex].focus();
      }
    });
  };

  /**
   * Inicialização declarativa via cliques de atributos data-*
   */
  function handleDocumentClick(e) {
    var trigger = e.target.closest(
      '[data-dx-toggle="collapse"], [data-bs-toggle="collapse"], [data-toggle="collapse"], ' +
      '[data-dx-accordion-action]'
    );

    if (!trigger) return;

    // Ações globais do acordeão (Abrir Todos / Fechar Todos)
    var action = trigger.getAttribute('data-dx-accordion-action');
    if (action) {
      e.preventDefault();
      var accordionTargetSelector = trigger.getAttribute('data-dx-target') ||
                                    trigger.getAttribute('data-bs-target') ||
                                    trigger.getAttribute('href');
      var accordionElem = accordionTargetSelector ? document.querySelector(accordionTargetSelector) : trigger.closest('.accordion');
      if (accordionElem) {
        var acc = new DexterAccordion(accordionElem);
        if (action === 'open-all') {
          acc.openAll();
        } else if (action === 'close-all') {
          acc.closeAll();
        }
      }
      return;
    }

    if (trigger.tagName === 'A') {
      e.preventDefault();
    }

    var targetSelector = trigger.getAttribute('data-dx-target') ||
                         trigger.getAttribute('data-bs-target') ||
                         trigger.getAttribute('data-target') ||
                         trigger.getAttribute('href');

    if (!targetSelector || targetSelector === '#') return;

    var target = document.querySelector(targetSelector);
    if (!target) return;

    var parentSelector = trigger.getAttribute('data-dx-parent') ||
                         trigger.getAttribute('data-bs-parent') ||
                         trigger.getAttribute('data-parent') ||
                         target.getAttribute('data-dx-parent') ||
                         target.getAttribute('data-bs-parent');

    var instance = DexterCollapse.getOrCreateInstance(target, {
      toggle: false,
      parent: parentSelector
    });

    instance.toggle();
  }

  // Registra ouvinte global de cliques
  if (typeof document !== 'undefined') {
    document.addEventListener('click', handleDocumentClick);

    // Inicializa suporte a teclado em todos os acordeões presentes
    var initAccordions = function () {
      var accordions = document.querySelectorAll('.accordion');
      for (var i = 0; i < accordions.length; i++) {
        new DexterAccordion(accordions[i]);
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAccordions);
    } else {
      initAccordions();
    }
  }

  // Exportação no namespace global e UMD
  var dexter = global.dexter || {};
  dexter.Collapse = DexterCollapse;
  dexter.Accordion = DexterAccordion;
  global.dexter = dexter;

  global.DexterCollapse = DexterCollapse;
  global.DexterAccordion = DexterAccordion;

  // Drop-in alias com Bootstrap para interoperabilidade
  global.bootstrap = global.bootstrap || {};
  global.bootstrap.Collapse = DexterCollapse;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      DexterCollapse: DexterCollapse,
      DexterAccordion: DexterAccordion
    };
  }

})(typeof window !== 'undefined' ? window : this);
