/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-ui-kit.js
 * @description [PT-BR] Controlador unificado zero-dependência para primitivas do Core UI
 *              (inspirado em bestguy/sveltestrap e Bootstrap 5): alertas dispensáveis
 *              (DexterAlert), gavetas deslizantes Offcanvas (DexterOffcanvas), colapso de
 *              Navbar responsivo (DexterNavbar), Tooltips dinâmicos (DexterTooltip) e Popovers
 *              interativos (DexterPopover) com suporte completo a WAI-ARIA e teclado.
 *              [EN]    Zero-dependency unified controller for Core UI primitives
 *              (inspired by bestguy/sveltestrap and Bootstrap 5): dismissible alerts
 *              (DexterAlert), Offcanvas drawers (DexterOffcanvas), responsive Navbar collapse
 *              (DexterNavbar), dynamic Tooltips (DexterTooltip) and interactive Popovers
 *              (DexterPopover) with full WAI-ARIA and keyboard support.
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
    var kit = factory();
    global.DexterUIKit = kit;
    global.DexterAlert = kit.Alert;
    global.DexterOffcanvas = kit.Offcanvas;
    global.DexterNavbar = kit.Navbar;
    global.DexterSidenav = kit.Sidenav;
    global.DexterTooltip = kit.Tooltip;
    global.DexterPopover = kit.Popover;
    global.dexter = global.dexter || {};
    global.dexter.Alert = kit.Alert;
    global.dexter.Offcanvas = kit.Offcanvas;
    global.dexter.Navbar = kit.Navbar;
    global.dexter.Sidenav = kit.Sidenav;
    global.dexter.Tooltip = kit.Tooltip;
    global.dexter.Popover = kit.Popover;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var offcanvasMap = new WeakMap();
  var tooltipMap = new WeakMap();
  var popoverMap = new WeakMap();

  function dispatch(el, name, detail) {
    var evt = new CustomEvent(name, { bubbles: true, cancelable: true, detail: detail || {} });
    el.dispatchEvent(evt);
    return !evt.defaultPrevented;
  }

  /**
   * Calcula coordenadas posicionais na viewport para Tooltips e Popovers
   */
  function positionFloating(triggerEl, floatEl, placement) {
    var rect = triggerEl.getBoundingClientRect();
    var fw = floatEl.offsetWidth || 160;
    var fh = floatEl.offsetHeight || 36;
    var gap = 8;
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    var pos = placement || 'top';
    if (pos === 'top' && rect.top - fh - gap < 0) pos = 'bottom';
    if (pos === 'bottom' && rect.bottom + fh + gap > vh) pos = 'top';
    if (pos === 'left' && rect.left - fw - gap < 0) pos = 'right';
    if (pos === 'right' && rect.right + fw + gap > vw) pos = 'left';

    var top = 0;
    var left = 0;

    if (pos === 'top') {
      top = rect.top - fh - gap;
      left = rect.left + (rect.width - fw) / 2;
    } else if (pos === 'bottom') {
      top = rect.bottom + gap;
      left = rect.left + (rect.width - fw) / 2;
    } else if (pos === 'left') {
      top = rect.top + (rect.height - fh) / 2;
      left = rect.left - fw - gap;
    } else {
      top = rect.top + (rect.height - fh) / 2;
      left = rect.right + gap;
    }

    // Clamp dentro da viewport
    left = Math.max(8, Math.min(left, vw - fw - 8));
    top = Math.max(8, Math.min(top, vh - fh - 8));

    floatEl.style.top = Math.round(top) + 'px';
    floatEl.style.left = Math.round(left) + 'px';
  }

  // =========================================================================
  // 1. DexterAlert (Alertas Dispensáveis / Dismissible Alerts)
  // =========================================================================

  var DexterAlert = {
    close: function (alertEl) {
      if (!alertEl) return;
      if (!dispatch(alertEl, 'dx:alert:close')) return;

      var isFade = alertEl.classList.contains('fade');
      alertEl.classList.remove('show');

      var finish = function () {
        if (alertEl.parentNode) {
          alertEl.parentNode.removeChild(alertEl);
        }
        dispatch(document, 'dx:alert:closed', { element: alertEl });
      };

      if (isFade) {
        setTimeout(finish, 200);
      } else {
        finish();
      }
    },

    init: function () {
      if (DexterAlert._bound) return;
      DexterAlert._bound = true;

      document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-dx-dismiss="alert"], [data-bs-dismiss="alert"]');
        if (!btn) return;
        e.preventDefault();
        var target = btn.getAttribute('data-dx-target') || btn.getAttribute('data-bs-target');
        var alertEl = target ? document.querySelector(target) : btn.closest('.alert');
        DexterAlert.close(alertEl);
      });
    }
  };

  // =========================================================================
  // 2. DexterOffcanvas (Gavetas Deslizantes / Offcanvas Drawers)
  // =========================================================================

  function DexterOffcanvas(element) {
    this.el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.el) return;
    if (offcanvasMap.has(this.el)) return offcanvasMap.get(this.el);

    this.isShown = this.el.classList.contains('show');
    this.backdrop = null;
    this._onKeyDown = this._handleKeyDown.bind(this);
    offcanvasMap.set(this.el, this);
  }

  DexterOffcanvas.prototype._handleKeyDown = function (e) {
    if (e.key === 'Escape' && this.isShown && this.el.getAttribute('data-dx-keyboard') !== 'false') {
      this.hide();
    }
  };

  DexterOffcanvas.prototype.show = function () {
    if (this.isShown) return;
    if (!dispatch(this.el, 'dx:offcanvas:show')) return;

    this.isShown = true;
    this.el.setAttribute('aria-modal', 'true');
    this.el.setAttribute('role', 'dialog');
    this.el.removeAttribute('aria-hidden');

    if (this.el.getAttribute('data-dx-backdrop') !== 'false' && this.el.getAttribute('data-bs-backdrop') !== 'false') {
      this.backdrop = document.createElement('div');
      this.backdrop.className = 'offcanvas-backdrop fade';
      document.body.appendChild(this.backdrop);
      void this.backdrop.offsetWidth;
      this.backdrop.classList.add('show');

      var self = this;
      this.backdrop.addEventListener('click', function () {
        if (self.el.getAttribute('data-dx-backdrop') !== 'static') {
          self.hide();
        }
      });
    }

    document.body.style.overflow = 'hidden';
    this.el.classList.add('showing');
    void this.el.offsetWidth;
    this.el.classList.add('show');

    document.addEventListener('keydown', this._onKeyDown);

    var self = this;
    setTimeout(function () {
      self.el.classList.remove('showing');
      dispatch(self.el, 'dx:offcanvas:shown');
    }, 300);
  };

  DexterOffcanvas.prototype.hide = function () {
    if (!this.isShown) return;
    if (!dispatch(this.el, 'dx:offcanvas:hide')) return;

    this.isShown = false;
    this.el.classList.remove('show');
    this.el.setAttribute('aria-hidden', 'true');
    this.el.removeAttribute('aria-modal');
    document.removeEventListener('keydown', this._onKeyDown);

    if (this.backdrop) {
      var bd = this.backdrop;
      this.backdrop = null;
      bd.classList.remove('show');
      setTimeout(function () {
        if (bd.parentNode) bd.parentNode.removeChild(bd);
      }, 250);
    }

    document.body.style.overflow = '';

    var self = this;
    setTimeout(function () {
      dispatch(self.el, 'dx:offcanvas:hidden');
    }, 300);
  };

  DexterOffcanvas.prototype.toggle = function () {
    if (this.isShown) this.hide();
    else this.show();
  };

  DexterOffcanvas.getOrCreateInstance = function (el) {
    var node = typeof el === 'string' ? document.querySelector(el) : el;
    if (!node) return null;
    return offcanvasMap.get(node) || new DexterOffcanvas(node);
  };

  DexterOffcanvas.init = function () {
    if (DexterOffcanvas._bound) return;
    DexterOffcanvas._bound = true;

    document.addEventListener('click', function (e) {
      var toggleBtn = e.target.closest('[data-dx-toggle="offcanvas"], [data-bs-toggle="offcanvas"]');
      if (toggleBtn) {
        var sel = toggleBtn.getAttribute('data-dx-target') || toggleBtn.getAttribute('data-bs-target') || toggleBtn.getAttribute('href');
        if (sel && sel.charAt(0) === '#') {
          var targetEl = document.querySelector(sel);
          if (targetEl) {
            e.preventDefault();
            DexterOffcanvas.getOrCreateInstance(targetEl).toggle();
          }
        }
        return;
      }

      var dismissBtn = e.target.closest('[data-dx-dismiss="offcanvas"], [data-bs-dismiss="offcanvas"]');
      if (dismissBtn) {
        e.preventDefault();
        var offEl = dismissBtn.closest('.offcanvas');
        if (offEl) {
          DexterOffcanvas.getOrCreateInstance(offEl).hide();
        }
      }
    });
  };

  // =========================================================================
  // 3. DexterNavbar & DexterSidenav (Navbar BS6/Materialize + Sidenav Drawer)
  // =========================================================================

  var sidenavMap = new WeakMap();

  function DexterSidenav(element) {
    this.el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.el) return;
    if (sidenavMap.has(this.el)) return sidenavMap.get(this.el);

    this.overlay = null;
    this.isOpen = this.el.classList.contains('show');
    this._opener = null;
    sidenavMap.set(this.el, this);
  }

  DexterSidenav.prototype._ensureOverlay = function () {
    if (this.overlay && document.body.contains(this.overlay)) return this.overlay;
    var ov = document.createElement('div');
    ov.className = 'sidenav-overlay';
    var self = this;
    ov.addEventListener('click', function () {
      self.close();
    });
    document.body.appendChild(ov);
    this.overlay = ov;
    return ov;
  };

  DexterSidenav.prototype.open = function (opener) {
    if (this.isOpen) return;
    if (opener) this._opener = opener;
    this.isOpen = true;
    var ov = this._ensureOverlay();
    this.el.classList.add('show');
    this.el.setAttribute('aria-hidden', 'false');
    ov.classList.add('show');
    dispatch(this.el, 'dx:sidenav:show');
  };

  DexterSidenav.prototype.close = function () {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.el.classList.remove('show');
    this.el.setAttribute('aria-hidden', 'true');
    if (this.overlay) {
      this.overlay.classList.remove('show');
    }
    if (this._opener && typeof this._opener.focus === 'function') {
      try { this._opener.focus(); } catch (e) {}
    }
    dispatch(this.el, 'dx:sidenav:hide');
  };

  DexterSidenav.prototype.toggle = function (opener) {
    if (this.isOpen) this.close();
    else this.open(opener);
  };

  DexterSidenav.getOrCreateInstance = function (el) {
    var node = typeof el === 'string' ? document.querySelector(el) : el;
    if (!node) return null;
    return sidenavMap.get(node) || new DexterSidenav(node);
  };

  DexterSidenav.init = function () {
    if (DexterSidenav._bound) return;
    DexterSidenav._bound = true;

    document.addEventListener('click', function (e) {
      var trigger = e.target.closest('.sidenav-trigger');
      if (trigger) {
        var sel = trigger.getAttribute('data-target') || trigger.getAttribute('data-dx-target') || trigger.getAttribute('href');
        if (sel && sel.charAt(0) !== '#') sel = '#' + sel;
        var target = sel ? document.querySelector(sel) : null;
        if (target && target.classList.contains('sidenav')) {
          e.preventDefault();
          DexterSidenav.getOrCreateInstance(target).toggle(trigger);
        }
        return;
      }

      var closeBtn = e.target.closest('.sidenav .sidenav-close, .sidenav [data-dx-dismiss="sidenav"]');
      if (closeBtn) {
        var navEl = closeBtn.closest('.sidenav');
        if (navEl) {
          e.preventDefault();
          DexterSidenav.getOrCreateInstance(navEl).close();
        }
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.sidenav.show').forEach(function (nav) {
          DexterSidenav.getOrCreateInstance(nav).close();
        });
      }
    });
  };

  var DexterNavbar = {
    init: function () {
      if (DexterNavbar._bound) return;
      DexterNavbar._bound = true;

      DexterSidenav.init();

      document.addEventListener('click', function (e) {
        // Clear de campo de pesquisa estilo Materialize
        var clearBtn = e.target.closest('.nav-wrapper .dx-nav-search-clear, .nav-wrapper [data-dx-nav-clear]');
        if (clearBtn) {
          var field = clearBtn.closest('.input-field');
          var input = field ? field.querySelector('input[type="search"], input') : null;
          if (input) {
            input.value = '';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.focus();
          }
          return;
        }

        var toggler = e.target.closest('.navbar-toggler[data-dx-toggle="collapse"], .navbar-toggler[data-bs-toggle="collapse"]');
        if (!toggler) return;

        var sel = toggler.getAttribute('data-dx-target') || toggler.getAttribute('data-bs-target') || toggler.getAttribute('href');
        if (!sel || sel === '#') return;

        var target = document.querySelector(sel);
        if (!target || (!target.classList.contains('navbar-collapse') && !target.classList.contains('collapse'))) return;

        e.preventDefault();
        var expanded = target.classList.toggle('show');
        toggler.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      });
    }
  };

  // =========================================================================
  // 4. DexterTooltip (Dicas Flutuantes / Floating Tooltips)
  // =========================================================================

  function DexterTooltip(element) {
    this.el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.el) return;
    if (tooltipMap.has(this.el)) return tooltipMap.get(this.el);

    this.tooltipEl = null;
    this.title = this.el.getAttribute('data-dx-title') || this.el.getAttribute('data-bs-title') || this.el.getAttribute('title') || '';
    if (this.el.hasAttribute('title')) {
      this.el.setAttribute('data-dx-original-title', this.title);
      this.el.removeAttribute('title');
    }
    this.placement = this.el.getAttribute('data-dx-placement') || this.el.getAttribute('data-bs-placement') || 'top';

    var self = this;
    this.el.addEventListener('mouseenter', function () { self.show(); });
    this.el.addEventListener('mouseleave', function () { self.hide(); });
    this.el.addEventListener('focus', function () { self.show(); });
    this.el.addEventListener('blur', function () { self.hide(); });

    tooltipMap.set(this.el, this);
  }

  DexterTooltip.prototype.show = function () {
    var text = this.el.getAttribute('data-dx-title') || this.el.getAttribute('data-bs-title') || this.title;
    if (!text) return;

    this.hide();
    var tip = document.createElement('div');
    tip.className = 'dx-tooltip tooltip';
    tip.setAttribute('role', 'tooltip');
    var inner = document.createElement('div');
    inner.className = 'tooltip-inner';
    inner.textContent = text;
    tip.appendChild(inner);
    document.body.appendChild(tip);

    this.tooltipEl = tip;
    positionFloating(this.el, tip, this.placement);
    void tip.offsetWidth;
    tip.classList.add('show');
  };

  DexterTooltip.prototype.hide = function () {
    if (this.tooltipEl) {
      var tip = this.tooltipEl;
      this.tooltipEl = null;
      tip.classList.remove('show');
      setTimeout(function () {
        if (tip.parentNode) tip.parentNode.removeChild(tip);
      }, 160);
    }
  };

  DexterTooltip.initAll = function (root) {
    var els = (root || document).querySelectorAll('[data-dx-toggle="tooltip"], [data-bs-toggle="tooltip"], [data-dx-tooltip]');
    els.forEach(function (el) {
      if (!tooltipMap.has(el)) new DexterTooltip(el);
    });
  };

  // =========================================================================
  // 5. DexterPopover (Cartões Flutuantes Interativos / Interactive Popovers)
  // =========================================================================

  function DexterPopover(element, options) {
    this.el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.el) return;
    if (popoverMap.has(this.el)) return popoverMap.get(this.el);

    this.options = Object.assign({
      title: this.el.getAttribute('data-dx-title') || this.el.getAttribute('data-bs-title') || this.el.getAttribute('title') || '',
      content: this.el.getAttribute('data-dx-content') || this.el.getAttribute('data-bs-content') || '',
      html: (this.el.getAttribute('data-dx-html') || this.el.getAttribute('data-bs-html')) === 'true',
      trigger: this.el.getAttribute('data-dx-trigger') || this.el.getAttribute('data-bs-trigger') || 'click',
      placement: this.el.getAttribute('data-dx-placement') || this.el.getAttribute('data-bs-placement') || 'top'
    }, options || {});

    this.popoverEl = null;
    this._bindTriggers();
    popoverMap.set(this.el, this);
  }

  DexterPopover.prototype._bindTriggers = function () {
    var self = this;
    var triggers = this.options.trigger.split(/\s+/);

    if (triggers.indexOf('click') !== -1) {
      this.el.addEventListener('click', function (e) {
        e.preventDefault();
        self.toggle();
      });
    }
    if (triggers.indexOf('hover') !== -1) {
      this.el.addEventListener('mouseenter', function () { self.show(); });
      this.el.addEventListener('mouseleave', function () { self.hide(); });
    }
    if (triggers.indexOf('focus') !== -1) {
      this.el.addEventListener('focus', function () { self.show(); });
      this.el.addEventListener('blur', function () { self.hide(); });
    }
  };

  DexterPopover.prototype.show = function () {
    if (this.popoverEl) return;

    var pop = document.createElement('div');
    pop.className = 'dx-popover popover';
    pop.setAttribute('role', 'tooltip');

    if (this.options.title) {
      var hdr = document.createElement('h3');
      hdr.className = 'popover-header';
      if (this.options.html) hdr.innerHTML = this.options.title;
      else hdr.textContent = this.options.title;
      pop.appendChild(hdr);
    }

    var body = document.createElement('div');
    body.className = 'popover-body';
    if (this.options.html) body.innerHTML = this.options.content;
    else body.textContent = this.options.content;
    pop.appendChild(body);

    document.body.appendChild(pop);
    this.popoverEl = pop;
    positionFloating(this.el, pop, this.options.placement);
    void pop.offsetWidth;
    pop.classList.add('show');
  };

  DexterPopover.prototype.hide = function () {
    if (!this.popoverEl) return;
    var pop = this.popoverEl;
    this.popoverEl = null;
    pop.classList.remove('show');
    setTimeout(function () {
      if (pop.parentNode) pop.parentNode.removeChild(pop);
    }, 180);
  };

  DexterPopover.prototype.toggle = function () {
    if (this.popoverEl) this.hide();
    else this.show();
  };

  DexterPopover.prototype.dispose = function () {
    this.hide();
    popoverMap.delete(this.el);
  };

  DexterPopover.getOrCreateInstance = function (el, opts) {
    var node = typeof el === 'string' ? document.querySelector(el) : el;
    if (!node) return null;
    return popoverMap.get(node) || new DexterPopover(node, opts);
  };

  DexterPopover.initAll = function (root) {
    var els = (root || document).querySelectorAll('[data-dx-toggle="popover"], [data-bs-toggle="popover"]');
    els.forEach(function (el) {
      if (!popoverMap.has(el)) new DexterPopover(el);
    });
  };

  // =========================================================================
  // 6. DexterBadge (Badges Removíveis / Dismissible Badges)
  // =========================================================================
  var DexterBadge = {
    _bound: false,
    dismiss: function (badgeEl) {
      if (!badgeEl || badgeEl.classList.contains('badge-dismissing')) return;
      badgeEl.classList.add('badge-dismissing');
      try {
        badgeEl.dispatchEvent(new CustomEvent('dexter.badge.dismiss', { bubbles: true }));
      } catch (e) { /* ignore */ }
      setTimeout(function () {
        if (badgeEl.parentNode) badgeEl.parentNode.removeChild(badgeEl);
      }, 160);
    },
    init: function () {
      if (this._bound || typeof document === 'undefined') return;
      this._bound = true;
      var self = this;
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-dx-dismiss="badge"], [data-bs-dismiss="badge"], .badge > .badge-close, .badge > .btn-close-badge, .dx-badge > .badge-close, .dx-badge > .btn-close-badge');
        if (!btn) return;
        if (btn.closest('.form-tags, .tagin, .tags-input')) return;
        var badge = btn.closest('.badge, .dx-badge');
        if (badge) {
          e.preventDefault();
          self.dismiss(badge);
        }
      });
    }
  };

  // Auto-init global
  function initAll() {
    DexterAlert.init();
    DexterOffcanvas.init();
    DexterNavbar.init();
    DexterTooltip.initAll();
    DexterPopover.initAll();
    DexterBadge.init();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initAll);
    } else {
      initAll();
    }
  }

  return {
    Alert: DexterAlert,
    Offcanvas: DexterOffcanvas,
    Navbar: DexterNavbar,
    Sidenav: DexterSidenav,
    Tooltip: DexterTooltip,
    Popover: DexterPopover,
    Badge: DexterBadge,
    initAll: initAll
  };
});
