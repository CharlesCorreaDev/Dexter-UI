/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-dashboard.js
 * @description [PT-BR] Controlador nativo zero-dependência para o Painel Administrativo
 *              (Dashboard Skeleton) inspirado em compostrap/dashboard-skeleton.
 *              Gerencia barra de progresso superior (DexterNanobar / Nanobar), alternância
 *              de tema Claro/Escuro global ou escopada (DexterThemeSwitcher / ThemeSwitcher),
 *              retração de sidebar responsiva (desktop collapse + mobile drawer) e
 *              integração automática com SidebarMenuApp.
 *              [EN]    Zero-dependency native controller for Dashboard Skeleton
 *              (inspired by compostrap/dashboard-skeleton). Manages slim top progress loader
 *              (DexterNanobar / Nanobar), global or scoped Light/Dark theme switching
 *              (DexterThemeSwitcher / ThemeSwitcher), responsive sidebar collapse/drawer
 *              and automatic SidebarMenuApp initialization.
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
    global.DexterDashboard = api.DexterDashboard;
    global.DexterNanobar = api.DexterNanobar;
    global.DexterThemeSwitcher = api.DexterThemeSwitcher;
    global.Nanobar = api.DexterNanobar;
    global.ThemeSwitcher = api.DexterThemeSwitcher;
    global.dexter = global.dexter || {};
    global.dexter.Dashboard = api.DexterDashboard;
    global.dexter.Nanobar = api.DexterNanobar;
    global.dexter.ThemeSwitcher = api.DexterThemeSwitcher;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var dashboardMap = new WeakMap();
  var switcherMap = new WeakMap();

  function dispatch(el, name, detail) {
    if (!el || typeof el.dispatchEvent !== 'function') return true;
    var evt = new CustomEvent(name, { bubbles: true, cancelable: true, detail: detail || {} });
    el.dispatchEvent(evt);
    return !evt.defaultPrevented;
  }

  // =========================================================================
  // 1. DexterNanobar / Nanobar (Barra de Carregamento Superior)
  // =========================================================================

  function DexterNanobar(options) {
    this.options = Object.assign({
      id: '',
      classname: 'nanobar',
      target: null,
      color: null
    }, options || {});

    this._hideTimer = null;
    this.el = document.createElement('div');
    this.el.className = this.options.classname || 'nanobar';
    if (this.options.id) {
      this.el.id = this.options.id;
    }

    this.bar = document.createElement('div');
    this.bar.className = 'bar';
    if (this.options.color) {
      this.bar.style.backgroundColor = this.options.color;
    }
    this.el.appendChild(this.bar);

    var mountTarget = this.options.target;
    if (typeof mountTarget === 'string') {
      mountTarget = document.querySelector(mountTarget);
    }

    if (mountTarget && mountTarget.insertBefore) {
      mountTarget.insertBefore(this.el, mountTarget.firstChild);
    } else if (document.body) {
      document.body.insertBefore(this.el, document.body.firstChild);
    }
  }

  DexterNanobar.prototype.go = function (percent) {
    var val = Number(percent);
    if (isNaN(val)) val = 0;
    val = Math.max(0, Math.min(100, val));

    clearTimeout(this._hideTimer);
    if (val > 0) {
      this.bar.style.opacity = '1';
    }
    this.bar.style.width = val + '%';

    var self = this;
    if (val >= 100) {
      this._hideTimer = setTimeout(function () {
        self.bar.style.opacity = '0';
        self._hideTimer = setTimeout(function () {
          self.bar.style.width = '0%';
        }, 260);
      }, 300);
    } else if (val === 0) {
      this.bar.style.opacity = '0';
    }

    return val;
  };

  DexterNanobar.prototype.destroy = function () {
    clearTimeout(this._hideTimer);
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  };

  // =========================================================================
  // 2. DexterThemeSwitcher / ThemeSwitcher (Alternador Claro/Escuro)
  // =========================================================================

  function DexterThemeSwitcher(element, options) {
    this.el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.el) return;
    if (switcherMap.has(this.el)) return switcherMap.get(this.el);

    this.options = Object.assign({
      target: this.el.getAttribute('data-theme-target') || null,
      storageKey: this.el.getAttribute('data-theme-storage') || null
    }, options || {});

    this._onClick = this.toggle.bind(this);
    this.el.addEventListener('click', this._onClick);
    switcherMap.set(this.el, this);

    this._syncInitial();
  }

  DexterThemeSwitcher.prototype._getTargetEl = function () {
    if (this.options.target) {
      return typeof this.options.target === 'string'
        ? document.querySelector(this.options.target)
        : this.options.target;
    }
    return document.documentElement;
  };

  DexterThemeSwitcher.prototype._isScoped = function (targetEl) {
    return Boolean(targetEl && targetEl !== document.documentElement);
  };

  DexterThemeSwitcher.prototype.getTheme = function () {
    var target = this._getTargetEl();
    if (!target) return 'light';
    if (this._isScoped(target)) {
      return target.getAttribute('data-ds-theme') ||
             document.documentElement.getAttribute('data-dx-theme') ||
             'light';
    }
    return target.getAttribute('data-dx-theme') || target.getAttribute('data-bs-theme') || 'light';
  };

  DexterThemeSwitcher.prototype.setTheme = function (theme) {
    var next = theme === 'dark' ? 'dark' : 'light';
    var target = this._getTargetEl();
    if (!target) return next;

    if (this._isScoped(target)) {
      target.setAttribute('data-ds-theme', next);
    } else {
      target.setAttribute('data-dx-theme', next);
      target.setAttribute('data-bs-theme', next);
    }

    if (this.options.storageKey) {
      try {
        localStorage.setItem(this.options.storageKey, next);
      } catch (e) { /* ignore */ }
    }

    this.el.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    dispatch(target, 'dx:dashboard:theme-change', { theme: next });
    return next;
  };

  DexterThemeSwitcher.prototype.toggle = function () {
    var current = this.getTheme();
    return this.setTheme(current === 'dark' ? 'light' : 'dark');
  };

  DexterThemeSwitcher.prototype._syncInitial = function () {
    if (this.options.storageKey) {
      try {
        var saved = localStorage.getItem(this.options.storageKey);
        if (saved === 'dark' || saved === 'light') {
          this.setTheme(saved);
          return;
        }
      } catch (e) { /* ignore */ }
    }
    this.el.setAttribute('aria-pressed', this.getTheme() === 'dark' ? 'true' : 'false');
  };

  DexterThemeSwitcher.prototype.destroy = function () {
    this.el.removeEventListener('click', this._onClick);
    switcherMap.delete(this.el);
  };

  DexterThemeSwitcher.initAll = function (root) {
    var btns = (root || document).querySelectorAll('[data-theme-switcher]');
    Array.prototype.forEach.call(btns, function (btn) {
      if (!switcherMap.has(btn)) {
        new DexterThemeSwitcher(btn);
      }
    });
  };

  // =========================================================================
  // 3. DexterDashboard (Controlador Completo do Dashboard Skeleton)
  // =========================================================================

  function DexterDashboard(element, options) {
    this.el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.el) return;
    if (dashboardMap.has(this.el)) return dashboardMap.get(this.el);

    this.options = Object.assign({
      breakpoint: 992,
      nanobar: true,
      colorPrefix: 'dashboard-'
    }, options || {});

    this.sidebar = this.el.querySelector('.ds-sidebar');
    this.backdrop = this.el.querySelector('.ds-backdrop');
    this.togglers = this.el.querySelectorAll('[data-ds-toggle="sidebar"], [data-bs-toggle="sidebar"]');
    this.nanobar = null;

    if (!this.backdrop && this.sidebar) {
      this.backdrop = document.createElement('div');
      this.backdrop.className = 'ds-backdrop';
      var wrapper = this.el.querySelector('.wrapper, .ds-wrapper') || this.el;
      wrapper.appendChild(this.backdrop);
    }

    // Inicializa Nanobar existente ou cria uma nova dentro do root
    if (this.options.nanobar) {
      var existingNano = this.el.querySelector(':scope > .nanobar, :scope > .dx-nanobar');
      if (existingNano && existingNano.querySelector('.bar')) {
        var barEl = existingNano.querySelector('.bar');
        this.nanobar = {
          el: existingNano,
          bar: barEl,
          go: function (pct) {
            var val = Math.max(0, Math.min(100, Number(pct) || 0));
            barEl.style.opacity = val > 0 ? '1' : '0';
            barEl.style.width = val + '%';
            if (val >= 100) {
              setTimeout(function () {
                barEl.style.opacity = '0';
                setTimeout(function () { barEl.style.width = '0%'; }, 260);
              }, 300);
            }
            return val;
          }
        };
      } else {
        this.nanobar = new DexterNanobar({ target: this.el });
      }
    }

    // Inicializa Compostrap SidebarMenu dentro do Dashboard, se carregado
    var rootWin = typeof window !== 'undefined' ? window : null;
    if (rootWin && rootWin.SidebarMenuApp && typeof rootWin.SidebarMenuApp.init === 'function') {
      rootWin.SidebarMenuApp.init(this.el);
    }

    // Inicializa ThemeSwitchers internos
    DexterThemeSwitcher.initAll(this.el);

    this._bindEvents();
    this._syncTogglerAria();
    dashboardMap.set(this.el, this);
  }

  DexterDashboard.prototype._isMobileView = function () {
    return window.innerWidth < this.options.breakpoint;
  };

  DexterDashboard.prototype._syncTogglerAria = function () {
    var isOpen = this._isMobileView()
      ? this.el.classList.contains('is-mobile-sidebar-open')
      : !this.el.classList.contains('is-sidebar-collapsed');

    Array.prototype.forEach.call(this.togglers, function (btn) {
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  };

  DexterDashboard.prototype._bindEvents = function () {
    var self = this;

    this._onToggleClick = function (e) {
      e.preventDefault();
      self.toggleSidebar();
    };

    Array.prototype.forEach.call(this.togglers, function (btn) {
      btn.addEventListener('click', self._onToggleClick);
    });

    this._onBackdropClick = function () {
      self.closeSidebar();
    };
    if (this.backdrop) {
      this.backdrop.addEventListener('click', this._onBackdropClick);
    }

    this._onKeyDown = function (e) {
      if (e.key === 'Escape' && self.el.classList.contains('is-mobile-sidebar-open')) {
        self.closeSidebar();
      }
    };
    document.addEventListener('keydown', this._onKeyDown);

    this._onResize = function () {
      if (!self._isMobileView()) {
        self.el.classList.remove('is-mobile-sidebar-open');
      }
      self._syncTogglerAria();
    };
    window.addEventListener('resize', this._onResize);
  };

  DexterDashboard.prototype.openSidebar = function () {
    if (this._isMobileView()) {
      this.el.classList.add('is-mobile-sidebar-open');
    } else {
      this.el.classList.remove('is-sidebar-collapsed');
    }
    this._syncTogglerAria();
    dispatch(this.el, 'dx:dashboard:sidebar-toggle', { open: true });
  };

  DexterDashboard.prototype.closeSidebar = function () {
    if (this._isMobileView()) {
      this.el.classList.remove('is-mobile-sidebar-open');
    } else {
      this.el.classList.add('is-sidebar-collapsed');
    }
    this._syncTogglerAria();
    dispatch(this.el, 'dx:dashboard:sidebar-toggle', { open: false });
  };

  DexterDashboard.prototype.toggleSidebar = function () {
    if (this._isMobileView()) {
      if (this.el.classList.contains('is-mobile-sidebar-open')) {
        this.closeSidebar();
      } else {
        this.openSidebar();
      }
    } else {
      if (this.el.classList.contains('is-sidebar-collapsed')) {
        this.openSidebar();
      } else {
        this.closeSidebar();
      }
    }
  };

  DexterDashboard.prototype.setTheme = function (theme) {
    var next = theme === 'dark' ? 'dark' : 'light';
    this.el.setAttribute('data-ds-theme', next);
    var btns = this.el.querySelectorAll('[data-theme-switcher]');
    Array.prototype.forEach.call(btns, function (btn) {
      btn.setAttribute('aria-pressed', next === 'dark' ? 'true' : 'false');
    });
    dispatch(this.el, 'dx:dashboard:theme-change', { theme: next });
    return next;
  };

  DexterDashboard.prototype.goProgress = function (percent) {
    if (!this.nanobar) {
      this.nanobar = new DexterNanobar({ target: this.el });
    }
    return this.nanobar.go(percent);
  };

  DexterDashboard.prototype.setColor = function (colorName) {
    var prefix = this.options.colorPrefix;
    var classes = Array.prototype.slice.call(this.el.classList);
    var self = this;
    classes.forEach(function (cls) {
      if (cls.indexOf(prefix) === 0) {
        self.el.classList.remove(cls);
      }
    });
    if (colorName) {
      this.el.classList.add(prefix + colorName);
    }
  };

  DexterDashboard.prototype.destroy = function () {
    var self = this;
    Array.prototype.forEach.call(this.togglers, function (btn) {
      btn.removeEventListener('click', self._onToggleClick);
    });
    if (this.backdrop) {
      this.backdrop.removeEventListener('click', this._onBackdropClick);
    }
    document.removeEventListener('keydown', this._onKeyDown);
    window.removeEventListener('resize', this._onResize);
    if (this.nanobar && typeof this.nanobar.destroy === 'function') {
      this.nanobar.destroy();
    }
    dashboardMap.delete(this.el);
  };

  DexterDashboard.getInstance = function (el) {
    var node = typeof el === 'string' ? document.querySelector(el) : el;
    return node ? dashboardMap.get(node) || null : null;
  };

  DexterDashboard.getOrCreateInstance = function (el, opts) {
    var node = typeof el === 'string' ? document.querySelector(el) : el;
    if (!node) return null;
    return dashboardMap.get(node) || new DexterDashboard(node, opts);
  };

  DexterDashboard.initAll = function (root) {
    var scope = root || document;
    DexterThemeSwitcher.initAll(scope);
    var shells = scope.querySelectorAll('[data-dx-dashboard], .dx-dashboard[data-ds-auto]');
    Array.prototype.forEach.call(shells, function (el) {
      if (!dashboardMap.has(el)) {
        new DexterDashboard(el);
      }
    });
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        DexterDashboard.initAll();
      });
    } else {
      DexterDashboard.initAll();
    }
  }

  return {
    DexterDashboard: DexterDashboard,
    DexterNanobar: DexterNanobar,
    DexterThemeSwitcher: DexterThemeSwitcher
  };
});
