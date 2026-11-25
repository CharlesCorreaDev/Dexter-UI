/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-popover-x.js
 * @description [PT-BR] Controlador nativo zero-dependência para Popover Estendido com
 *              comportamento Modal (inspirado e compatível drop-in com
 *              kartik-v/bootstrap-popover-x). Suporta cabeçalho, rodapé de ações,
 *              carregamento remoto via fetch, 12 posicionamentos direcionais e 7 modos
 *              automáticos com ajuste à viewport, teclas Escape, auto-fechamento,
 *              aliases PopoverX / PopoverButton e ponte jQuery opcional.
 *              [EN]    Zero-dependency native controller for Extended Modal Popover
 *              (inspired and drop-in compatible with kartik-v/bootstrap-popover-x).
 *              Supports header, footer actions, remote loading via fetch, 12 directional
 *              and 7 auto placements with viewport clamping, Escape dismiss, blur dismiss,
 *              PopoverX / PopoverButton globals and optional jQuery bridge.
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
    var api = factory();
    global.DexterPopoverX = api.PopoverX;
    global.DexterPopoverButton = api.PopoverButton;
    global.PopoverX = api.PopoverX;
    global.PopoverButton = api.PopoverButton;
    global.dexter = global.dexter || {};
    global.dexter.PopoverX = api.PopoverX;
    global.dexter.PopoverButton = api.PopoverButton;

    if (global.jQuery) {
      global.jQuery.fn.popoverX = function (option) {
        return this.each(function () {
          var inst = api.PopoverX.getOrCreateInstance(this, typeof option === 'object' ? option : {});
          if (typeof option === 'string' && inst && typeof inst[option] === 'function') {
            inst[option]();
          }
        });
      };
      global.jQuery.fn.popoverButton = function (option) {
        return this.each(function () {
          var inst = api.PopoverButton.getOrCreateInstance(this, typeof option === 'object' ? option : {});
          if (typeof option === 'string' && inst && typeof inst[option] === 'function') {
            inst[option]();
          }
        });
      };
    }
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var popoverMap = new WeakMap();
  var buttonMap = new WeakMap();
  var ALL_PLACEMENT_CLASSES = [
    'bottom', 'top', 'left', 'right',
    'bottom-left', 'top-left', 'bottom-right', 'top-right',
    'left-bottom', 'left-top', 'right-bottom', 'right-top'
  ];
  var globalListenersBound = false;

  function dispatch(el, name, detail) {
    if (!el || typeof el.dispatchEvent !== 'function') return;
    el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail || {} }));
  }

  function resolveTarget(triggerEl, explicitTarget) {
    var sel = explicitTarget ||
      triggerEl.getAttribute('data-dx-target') ||
      triggerEl.getAttribute('data-bs-target') ||
      triggerEl.getAttribute('data-target') ||
      triggerEl.getAttribute('href');
    if (!sel || sel === '#') return null;
    if (sel.charAt(0) === '#') {
      return document.querySelector(sel);
    }
    try {
      return document.querySelector(sel);
    } catch (e) {
      return null;
    }
  }

  function bindGlobalListeners() {
    if (globalListenersBound || typeof document === 'undefined') return;
    globalListenersBound = true;

    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-toggle="popover-x"], [data-bs-toggle="popover-x"], [data-dx-toggle="popover-x"]')) {
        return;
      }
      if (e.target.closest('.popover-x')) {
        return;
      }
      document.querySelectorAll('.popover-x.is-open').forEach(function (el) {
        var inst = popoverMap.get(el);
        if (inst && inst.options.closePopoverOnBlur) {
          inst.hide();
        }
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      document.querySelectorAll('.popover-x.is-open').forEach(function (el) {
        var inst = popoverMap.get(el);
        if (inst && inst.options.keyboard) {
          inst.hide(true);
        }
      });
    });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        document.querySelectorAll('.popover-x.is-open').forEach(function (el) {
          var inst = popoverMap.get(el);
          if (inst) inst.refreshPosition();
        });
      }, 60);
    });
  }

  // =========================================================================
  // 1. DexterPopoverX (Controlador do Card Popover Modal)
  // =========================================================================

  function DexterPopoverX(element, options) {
    this.el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.el) return;
    if (popoverMap.has(this.el)) {
      var existing = popoverMap.get(this.el);
      if (options) Object.assign(existing.options, options);
      return existing;
    }

    this.options = Object.assign({
      target: null,
      placement: this.el.getAttribute('data-placement') || 'auto',
      remote: this.el.getAttribute('data-remote') || null,
      closeOpenPopovers: this.el.getAttribute('data-close-open-popovers') !== 'false',
      closePopoverOnBlur: this.el.getAttribute('data-close-on-blur') !== 'false',
      keyboard: this.el.getAttribute('data-keyboard') !== 'false',
      autoPlaceSmallScreen: true,
      smallScreenWidth: 640,
      offsetGap: 12
    }, options || {});

    this.triggerEl = this.options.target;
    this.isShown = false;
    this._remoteLoaded = false;

    this.el.classList.add('popover-x');
    if (this.el.querySelector('.popover-footer')) {
      this.el.classList.add('has-footer');
    }

    var self = this;
    this.el.addEventListener('click', function (e) {
      var dismiss = e.target.closest('[data-dismiss="popover-x"], [data-bs-dismiss="popover-x"], [data-dx-dismiss="popover-x"]');
      if (dismiss) {
        e.preventDefault();
        self.hide(true);
      }
    });

    popoverMap.set(this.el, this);
    bindGlobalListeners();
  }

  DexterPopoverX.prototype.getPlacement = function (triggerEl) {
    var rect = triggerEl.getBoundingClientRect();
    var vw = window.innerWidth || document.documentElement.clientWidth;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var placement = String(this.options.placement || 'auto').trim();
    var isH = placement === 'horizontal';
    var isV = placement === 'vertical';
    var autoPlace = placement === 'auto' || isH || isV;

    if (this.options.autoPlaceSmallScreen && vw < this.options.smallScreenWidth && !isV && !isH) {
      if (placement === 'left' || placement === 'right' || placement.indexOf('left-') !== -1 || placement.indexOf('right-') !== -1) {
        autoPlace = true;
      }
    }

    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    if (autoPlace) {
      if (isH) {
        return cx <= vw / 2 ? 'right' : 'left';
      }
      if (isV) {
        return cy <= vh / 2 ? 'bottom' : 'top';
      }
      if (cy < vh * 0.35) {
        return cx < vw * 0.33 ? 'bottom bottom-left' : (cx > vw * 0.66 ? 'bottom bottom-right' : 'bottom');
      }
      if (cy > vh * 0.65) {
        return cx < vw * 0.33 ? 'top top-left' : (cx > vw * 0.66 ? 'top top-right' : 'top');
      }
      return cx <= vw / 2 ? 'right' : 'left';
    }

    if (placement === 'auto-top') {
      return cx < vw / 3 ? 'top top-left' : (cx < vw * 2 / 3 ? 'top' : 'top top-right');
    }
    if (placement === 'auto-bottom') {
      return cx < vw / 3 ? 'bottom bottom-left' : (cx < vw * 2 / 3 ? 'bottom' : 'bottom bottom-right');
    }
    if (placement === 'auto-left') {
      return cy < vh / 3 ? 'left left-top' : (cy < vh * 2 / 3 ? 'left' : 'left left-bottom');
    }
    if (placement === 'auto-right') {
      return cy < vh / 3 ? 'right right-top' : (cy < vh * 2 / 3 ? 'right' : 'right right-bottom');
    }

    return placement;
  };

  DexterPopoverX.prototype.refreshPosition = function () {
    if (!this.triggerEl || !this.el) return;

    var tr = this.triggerEl.getBoundingClientRect();
    var sx = window.scrollX || window.pageXOffset || 0;
    var sy = window.scrollY || window.pageYOffset || 0;
    var absTop = tr.top + sy;
    var absLeft = tr.left + sx;
    var tw = tr.width;
    var th = tr.height;
    var pw = this.el.offsetWidth || 310;
    var ph = this.el.offsetHeight || 160;
    var gap = this.options.offsetGap;
    var placement = this.getPlacement(this.triggerEl);
    var docW = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

    var top = absTop;
    var left = absLeft;

    switch (placement) {
      case 'bottom':
        top = absTop + th + gap;
        left = absLeft + tw / 2 - pw / 2;
        break;
      case 'bottom bottom-left':
        top = absTop + th + gap;
        left = absLeft;
        break;
      case 'bottom bottom-right':
        top = absTop + th + gap;
        left = absLeft + tw - pw;
        break;
      case 'top':
        top = absTop - ph - gap;
        left = absLeft + tw / 2 - pw / 2;
        break;
      case 'top top-left':
        top = absTop - ph - gap;
        left = absLeft;
        break;
      case 'top top-right':
        top = absTop - ph - gap;
        left = absLeft + tw - pw;
        break;
      case 'left':
        top = absTop + th / 2 - ph / 2;
        left = absLeft - pw - gap;
        break;
      case 'left left-top':
        top = absTop;
        left = absLeft - pw - gap;
        break;
      case 'left left-bottom':
        top = absTop + th - ph;
        left = absLeft - pw - gap;
        break;
      case 'right':
        top = absTop + th / 2 - ph / 2;
        left = absLeft + tw + gap;
        break;
      case 'right right-top':
        top = absTop;
        left = absLeft + tw + gap;
        break;
      case 'right right-bottom':
        top = absTop + th - ph;
        left = absLeft + tw + gap;
        break;
      default:
        top = absTop + th + gap;
        left = absLeft + tw / 2 - pw / 2;
    }

    // Garante que nunca vaze horizontalmente da viewport (especialmente mobile)
    left = Math.max(8, Math.min(left, docW - pw - 8));
    top = Math.max(8, top);

    ALL_PLACEMENT_CLASSES.forEach(function (cls) {
      this.el.classList.remove(cls);
    }, this);

    placement.split(/\s+/).forEach(function (cls) {
      if (cls) this.el.classList.add(cls);
    }, this);

    this.el.style.top = Math.round(top) + 'px';
    this.el.style.left = Math.round(left) + 'px';
  };

  DexterPopoverX.prototype.loadRemote = function (url) {
    var remoteUrl = url || this.options.remote;
    if (!remoteUrl || this._remoteLoaded) return Promise.resolve();
    var body = this.el.querySelector('.popover-body, .popover-content');
    if (!body) return Promise.resolve();

    var prevHtml = body.innerHTML;
    body.innerHTML = '<div class="popover-loading" aria-busy="true"></div>';
    var self = this;
    return fetch(remoteUrl)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (html) {
        body.innerHTML = html;
        self._remoteLoaded = true;
        self.refreshPosition();
        dispatch(self.el, 'dx:popover-x:loaded', { url: remoteUrl });
      })
      .catch(function (err) {
        body.innerHTML = prevHtml;
        console.warn('[DexterPopoverX] Erro ao carregar conteúdo remoto:', err);
      });
  };

  DexterPopoverX.prototype.show = function () {
    if (!this.el) return;
    if (this.options.closeOpenPopovers) {
      var self = this;
      document.querySelectorAll('.popover-x.is-open').forEach(function (other) {
        if (other !== self.el) {
          var inst = popoverMap.get(other);
          if (inst) inst.hide();
        }
      });
    }

    if (this.el.parentNode !== document.body) {
      document.body.appendChild(this.el);
    }

    dispatch(this.el, 'dx:popover-x:show', { trigger: this.triggerEl });

    if (this.options.remote && !this._remoteLoaded) {
      this.loadRemote(this.options.remote);
    }

    this.el.classList.add('is-open', 'show');
    this.el.setAttribute('aria-hidden', 'false');
    this.isShown = true;
    this.refreshPosition();
    if (this.triggerEl) {
      this.triggerEl.setAttribute('aria-expanded', 'true');
    }
    dispatch(this.el, 'dx:popover-x:shown', { trigger: this.triggerEl });
  };

  DexterPopoverX.prototype.hide = function (restoreFocus) {
    if (!this.isShown) return;
    dispatch(this.el, 'dx:popover-x:hide', { trigger: this.triggerEl });
    this.el.classList.remove('is-open', 'show', 'in');
    this.el.setAttribute('aria-hidden', 'true');
    this.isShown = false;
    if (this.triggerEl) {
      this.triggerEl.setAttribute('aria-expanded', 'false');
      if (restoreFocus && typeof this.triggerEl.focus === 'function') {
        this.triggerEl.focus();
      }
    }
    dispatch(this.el, 'dx:popover-x:hidden', { trigger: this.triggerEl });
  };

  DexterPopoverX.prototype.toggle = function () {
    if (this.isShown) {
      this.hide();
    } else {
      this.show();
    }
  };

  DexterPopoverX.prototype.destroy = function () {
    this.hide();
    popoverMap.delete(this.el);
  };

  DexterPopoverX.getOrCreateInstance = function (el, opts) {
    var node = typeof el === 'string' ? document.querySelector(el) : el;
    if (!node) return null;
    return popoverMap.get(node) || new DexterPopoverX(node, opts);
  };

  // =========================================================================
  // 2. DexterPopoverButton (Controlador do Gatilho)
  // =========================================================================

  function DexterPopoverButton(element, options) {
    this.el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.el) return;
    if (buttonMap.has(this.el)) return buttonMap.get(this.el);

    this.options = Object.assign({
      target: null,
      trigger: this.el.getAttribute('data-trigger') || 'click keyup',
      placement: this.el.getAttribute('data-dx-placement') || this.el.getAttribute('data-bs-placement') || this.el.getAttribute('data-placement') || null
    }, options || {});

    this.dialogEl = resolveTarget(this.el, this.options.target);
    if (!this.dialogEl) return;

    var popOpts = { target: this.el };
    if (this.options.placement) popOpts.placement = this.options.placement;
    if (this.el.getAttribute('data-remote')) popOpts.remote = this.el.getAttribute('data-remote');

    this.popover = DexterPopoverX.getOrCreateInstance(this.dialogEl, popOpts);
    this.el.setAttribute('aria-expanded', 'false');
    if (this.dialogEl.id) {
      this.el.setAttribute('aria-controls', this.dialogEl.id);
    }

    this._bindEvents();
    buttonMap.set(this.el, this);
  }

  DexterPopoverButton.prototype._bindEvents = function () {
    var self = this;
    var triggers = String(this.options.trigger || 'click').split(/\s+/);

    if (triggers.indexOf('click') !== -1) {
      this.el.addEventListener('click', function (e) {
        if (self.el.tagName === 'A') e.preventDefault();
        if (self.options.placement) self.popover.options.placement = self.options.placement;
        var switchingTrigger = self.popover.isShown && self.popover.triggerEl !== self.el;
        self.popover.triggerEl = self.el;
        if (switchingTrigger) {
          self.popover.show();
        } else {
          self.popover.toggle();
        }
      });
    }

    if (triggers.indexOf('hover') !== -1) {
      var hoverTimer = null;
      this.el.addEventListener('mouseenter', function () {
        clearTimeout(hoverTimer);
        if (self.options.placement) self.popover.options.placement = self.options.placement;
        self.popover.triggerEl = self.el;
        self.popover.show();
      });
      this.el.addEventListener('mouseleave', function () {
        hoverTimer = setTimeout(function () {
          if (!self.dialogEl.matches(':hover')) {
            self.popover.hide();
          }
        }, 160);
      });
      this.dialogEl.addEventListener('mouseleave', function () {
        hoverTimer = setTimeout(function () {
          self.popover.hide();
        }, 160);
      });
    }

    if (triggers.indexOf('focus') !== -1) {
      this.el.addEventListener('focus', function () {
        if (self.options.placement) self.popover.options.placement = self.options.placement;
        self.popover.triggerEl = self.el;
        self.popover.show();
      });
      this.el.addEventListener('blur', function () {
        setTimeout(function () {
          if (!self.dialogEl.contains(document.activeElement)) {
            self.popover.hide();
          }
        }, 120);
      });
    }
  };

  DexterPopoverButton.prototype.show = function () { if (this.popover) this.popover.show(); };
  DexterPopoverButton.prototype.hide = function () { if (this.popover) this.popover.hide(); };
  DexterPopoverButton.prototype.toggle = function () { if (this.popover) this.popover.toggle(); };

  DexterPopoverButton.getOrCreateInstance = function (el, opts) {
    var node = typeof el === 'string' ? document.querySelector(el) : el;
    if (!node) return null;
    return buttonMap.get(node) || new DexterPopoverButton(node, opts);
  };

  DexterPopoverX.initAll = function (root) {
    var btns = (root || document).querySelectorAll('[data-toggle="popover-x"], [data-bs-toggle="popover-x"], [data-dx-toggle="popover-x"]');
    Array.prototype.forEach.call(btns, function (btn) {
      DexterPopoverButton.getOrCreateInstance(btn);
    });
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        DexterPopoverX.initAll();
      });
    } else {
      DexterPopoverX.initAll();
    }
  }

  return {
    PopoverX: DexterPopoverX,
    PopoverButton: DexterPopoverButton
  };
});
