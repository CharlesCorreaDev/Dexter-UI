/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-sidebar.js
 * @description [PT-BR] Controlador nativo zero-dependência para Barra Lateral Administrativa
 *              Colapsável (DexterSidebar / NextSidebar), inspirado e aprimorado a partir do
 *              Next-sidebar (Nelh/Next-sidebar). Gerencia submenus acordeão multinível sem
 *              jQuery, recolhimento em trilho de ícones no desktop, gaveta deslizante mobile
 *              com backdrop e Escape, caixa de pesquisa expansível no topo e destaque automático
 *              do link ativo.
 *              [EN]    Zero-dependency native controller for Collapsible Admin Sidebar
 *              (DexterSidebar / NextSidebar), inspired and enhanced from Next-sidebar
 *              (Nelh/Next-sidebar). Handles nested multi-level accordion submenus without
 *              jQuery, desktop icon-rail collapsing, mobile drawer with backdrop & Escape,
 *              expandable navbar search box and automatic active link highlighting.
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
    var SidebarClass = factory();
    global.DexterSidebar = SidebarClass;
    global.NextSidebar = SidebarClass;
    global.SidebarMenu = SidebarClass.SidebarMenu;
    global.SidebarMenuApp = SidebarClass.SidebarMenu;
    global.dexter = global.dexter || {};
    global.dexter.Sidebar = SidebarClass;
    global.dexter.SidebarMenu = SidebarClass.SidebarMenu;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var INSTANCE_MAP = new WeakMap();

  function dispatch(el, name, detail) {
    el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail || {} }));
  }

  function DexterSidebar(element, options) {
    this.appEl = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.appEl) {
      throw new Error('[DexterSidebar] Elemento .app não encontrado.');
    }

    if (INSTANCE_MAP.has(this.appEl)) {
      return INSTANCE_MAP.get(this.appEl);
    }

    this.options = Object.assign({
      breakpoint: 992,
      autoActiveLink: true,
      closeSiblings: true
    }, options || {});

    this.sidebarEl = this.appEl.querySelector('.sidebar, .dx-sidebar');
    this.backdropEl = null;
    this._onKeyDown = this._handleKeyDown.bind(this);
    this._onClick = this._handleClick.bind(this);

    this._init();
    INSTANCE_MAP.set(this.appEl, this);
  }

  DexterSidebar.prototype._init = function () {
    this.appEl.addEventListener('click', this._onClick);
    document.addEventListener('keydown', this._onKeyDown);

    if (this.options.autoActiveLink) {
      this._markActiveLink();
    }
  };

  DexterSidebar.prototype._isMobileView = function () {
    return window.innerWidth < this.options.breakpoint;
  };

  DexterSidebar.prototype._handleKeyDown = function (e) {
    if (e.key === 'Escape' && this.appEl.classList.contains('is-mobile-open')) {
      this.closeMobile();
    }
  };

  DexterSidebar.prototype._handleClick = function (e) {
    // 1. Toggle Sidebar / Mobile Toggle
    var toggleBtn = e.target.closest('.sidebar-toggle, .mobile-toggle');
    if (toggleBtn && this.appEl.contains(toggleBtn)) {
      e.preventDefault();
      this.toggle();
      return;
    }

    // 2. Pesquisa Expansível na Barra Superior (.search-toggle)
    var searchBtn = e.target.closest('.search-toggle');
    if (searchBtn && this.appEl.contains(searchBtn)) {
      e.preventDefault();
      var searchBoxes = this.appEl.querySelectorAll('.search-box, .search-input');
      searchBoxes.forEach(function (box) { box.classList.toggle('active'); });
      var inp = this.appEl.querySelector('.search-input input');
      if (inp && inp.closest('.search-input').classList.contains('active')) {
        inp.focus();
      }
      return;
    }

    // 3. Offcanvas Toggle (.offcanvas-toggle)
    var offBtn = e.target.closest('.offcanvas-toggle');
    if (offBtn && this.appEl.contains(offBtn)) {
      e.preventDefault();
      var offMenu = this.appEl.querySelector('.offcanvas-menu') || document.querySelector('.offcanvas-menu');
      if (offMenu) offMenu.classList.toggle('open');
      return;
    }

    // 4. Cliques em links de submenus dentro da .sidebar-menu
    var menuLink = e.target.closest('.sidebar .sidebar-menu li a, .dx-sidebar .sidebar-menu li a');
    if (menuLink && this.sidebarEl && this.sidebarEl.contains(menuLink)) {
      var parentLi = menuLink.parentElement;
      if (!parentLi) return;

      var hasSubmenu = parentLi.querySelector(':scope > .dropdown-menu');
      if (hasSubmenu) {
        e.preventDefault();
        this.toggleSubmenu(parentLi);
      } else {
        // Marca item folha como ativo
        var links = this.sidebarEl.querySelectorAll('.sidebar-menu a.active, .sidebar-menu a.actived');
        links.forEach(function (l) { l.classList.remove('active', 'actived'); });
        menuLink.classList.add('active');
        if (this._isMobileView()) {
          this.closeMobile();
        }
      }
    }
  };

  DexterSidebar.prototype._markActiveLink = function () {
    if (!this.sidebarEl) return;
    var existing = this.sidebarEl.querySelector('.sidebar-link.active, .sidebar-link.actived, .nav-link.active');
    if (existing) return;

    var currentPath = (window.location.pathname || '').replace(/^\/+/, '');
    if (!currentPath) return;

    var links = this.sidebarEl.querySelectorAll('.sidebar-link');
    links.forEach(function (el) {
      var href = (el.getAttribute('href') || '').replace(/^\/+/, '');
      if (href && href !== '#' && href === currentPath) {
        el.classList.add('active');
      }
    });
  };

  DexterSidebar.prototype.toggleSubmenu = function (liEl) {
    if (!liEl) return;
    var willOpen = !liEl.classList.contains('open');

    if (willOpen && this.options.closeSiblings && liEl.parentElement) {
      var siblings = Array.prototype.slice.call(liEl.parentElement.children);
      siblings.forEach(function (sib) {
        if (sib !== liEl && sib.classList.contains('open')) {
          sib.classList.remove('open');
        }
      });
    }

    liEl.classList.toggle('open', willOpen);
    dispatch(this.appEl, willOpen ? 'dx:sidebar:submenu-open' : 'dx:sidebar:submenu-close', { item: liEl });
  };

  DexterSidebar.prototype.closeAllSubmenus = function () {
    if (!this.sidebarEl) return;
    this.sidebarEl.querySelectorAll('li.dropdown.open').forEach(function (li) {
      li.classList.remove('open');
    });
  };

  DexterSidebar.prototype.toggle = function () {
    if (this._isMobileView()) {
      if (this.appEl.classList.contains('is-mobile-open')) {
        this.closeMobile();
      } else {
        this.openMobile();
      }
    } else {
      if (this.appEl.classList.contains('is-collapsed')) {
        this.expand();
      } else {
        this.collapse();
      }
    }
  };

  DexterSidebar.prototype.collapse = function () {
    this.appEl.classList.add('is-collapsed');
    dispatch(this.appEl, 'dx:sidebar:collapse', { collapsed: true });
  };

  DexterSidebar.prototype.expand = function () {
    this.appEl.classList.remove('is-collapsed');
    dispatch(this.appEl, 'dx:sidebar:expand', { collapsed: false });
  };

  DexterSidebar.prototype.openMobile = function () {
    var self = this;
    this.appEl.classList.add('is-mobile-open');

    if (!this.backdropEl) {
      this.backdropEl = document.createElement('div');
      this.backdropEl.className = 'sidebar-backdrop';
      this.backdropEl.addEventListener('click', function () {
        self.closeMobile();
      });
      this.appEl.appendChild(this.backdropEl);
      void this.backdropEl.offsetWidth;
    }
    this.backdropEl.classList.add('show');
    dispatch(this.appEl, 'dx:sidebar:mobile-open');
  };

  DexterSidebar.prototype.closeMobile = function () {
    this.appEl.classList.remove('is-mobile-open');
    if (this.backdropEl) {
      var bd = this.backdropEl;
      this.backdropEl = null;
      bd.classList.remove('show');
      setTimeout(function () {
        if (bd.parentNode) bd.parentNode.removeChild(bd);
      }, 250);
    }
    dispatch(this.appEl, 'dx:sidebar:mobile-close');
  };

  DexterSidebar.prototype.destroy = function () {
    this.closeMobile();
    this.appEl.removeEventListener('click', this._onClick);
    document.removeEventListener('keydown', this._onKeyDown);
    INSTANCE_MAP.delete(this.appEl);
  };

  DexterSidebar.getInstance = function (el) {
    var node = typeof el === 'string' ? document.querySelector(el) : el;
    return node ? INSTANCE_MAP.get(node) || null : null;
  };

  DexterSidebar.getOrCreateInstance = function (el, opts) {
    var node = typeof el === 'string' ? document.querySelector(el) : el;
    if (!node) return null;
    return INSTANCE_MAP.get(node) || new DexterSidebar(node, opts);
  };

  DexterSidebar.initAll = function (root) {
    var apps = (root || document).querySelectorAll('.app, [data-dx-sidebar]');
    apps.forEach(function (appEl) {
      DexterSidebar.getOrCreateInstance(appEl);
    });
    SidebarMenu.init(root);
  };

  /**
   * ---------------------------------------------------------------------------
   * Compostrap SidebarMenu / SidebarMenuApp (multi-level list-item + link-arrow)
   * ---------------------------------------------------------------------------
   */
  var SidebarMenu = {
    _slideStates: new WeakMap(),
    _submenuId: 0,

    init: function (root) {
      var scope = root || document;
      var elements = scope.querySelectorAll('.list-item');
      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var duration = reduceMotion ? 0 : 200;

      elements.forEach(function (el) {
        var links = el.querySelectorAll('a.link-arrow, button.link-arrow');
        links.forEach(function (link) {
          var submenu = link.nextElementSibling;
          if (!submenu) return;
          if (link.dataset.sidebarMenuInitialized === 'true') return;

          link.dataset.sidebarMenuInitialized = 'true';
          link.classList.add('up');
          if (!submenu.id) {
            submenu.id = 'sidebar-submenu-' + (++SidebarMenu._submenuId);
          }
          link.setAttribute('aria-controls', submenu.id);

          if (link.classList.contains('link-current')) {
            link.classList.add('active', 'down');
            submenu.style.display = 'block';
            SidebarMenu._slideStates.set(submenu, { open: true, timer: null });
          }

          var curDisplay = window.getComputedStyle(submenu).display;
          link.setAttribute('aria-expanded', String(submenu.style.display === 'block' || curDisplay === 'block'));

          if (!link.hasAttribute('href') && link.tagName.toLowerCase() === 'a') {
            link.setAttribute('role', 'button');
            link.tabIndex = 0;
            link.addEventListener('keydown', function (event) {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                link.click();
              }
            });
          }

          link.addEventListener('click', function (event) {
            event.preventDefault();
            var expanded = SidebarMenu._slideToggle(submenu, duration);
            link.setAttribute('aria-expanded', String(expanded));

            if (link.classList.contains('down')) {
              link.classList.toggle('rotate-revert');
            }
            link.classList.add('transition');
            link.classList.toggle('active', expanded);
            link.classList.toggle('rotate', expanded);

            link.dispatchEvent(new CustomEvent('dx:sidebar-menu:toggle', {
              bubbles: true,
              detail: { link: link, submenu: submenu, expanded: expanded }
            }));
          });
        });
      });

      scope.querySelectorAll('.list-link.link-current:not(.link-arrow)').forEach(function (link) {
        link.setAttribute('aria-current', 'page');
      });
    },

    _slideToggle: function (target, duration) {
      var state = SidebarMenu._slideStates.get(target);
      var isOpen = state ? state.open : window.getComputedStyle(target).display !== 'none';
      if (!isOpen) {
        SidebarMenu._animate(target, true, duration);
      } else {
        SidebarMenu._animate(target, false, duration);
      }
      return !isOpen;
    },

    _animate: function (target, open, duration) {
      var prev = SidebarMenu._slideStates.get(target);
      var currentHeight = target.getBoundingClientRect().height;
      if (prev && prev.timer) clearTimeout(prev.timer);

      if (open) target.style.display = 'block';

      ['height', 'padding-top', 'padding-bottom', 'margin-top', 'margin-bottom', 'overflow', 'box-sizing', 'transition-duration', 'transition-property']
        .forEach(function (prop) { target.style.removeProperty(prop); });

      var naturalHeight = target.offsetHeight;
      target.style.overflow = 'hidden';
      target.style.boxSizing = 'border-box';
      target.style.height = currentHeight + 'px';
      if (open) {
        target.style.paddingTop = '0';
        target.style.paddingBottom = '0';
        target.style.marginTop = '0';
        target.style.marginBottom = '0';
      }
      void target.offsetHeight;

      target.style.transitionProperty = 'height, margin, padding';
      target.style.transitionDuration = duration + 'ms';
      target.style.height = open ? naturalHeight + 'px' : '0';

      if (open) {
        target.style.removeProperty('padding-top');
        target.style.removeProperty('padding-bottom');
        target.style.removeProperty('margin-top');
        target.style.removeProperty('margin-bottom');
      } else {
        target.style.paddingTop = '0';
        target.style.paddingBottom = '0';
        target.style.marginTop = '0';
        target.style.marginBottom = '0';
      }

      var state = { open: open, timer: null };
      SidebarMenu._slideStates.set(target, state);

      var finish = function () {
        if (SidebarMenu._slideStates.get(target) !== state) return;
        if (!open) target.style.display = 'none';
        ['height', 'padding-top', 'padding-bottom', 'margin-top', 'margin-bottom', 'overflow', 'box-sizing', 'transition-duration', 'transition-property']
          .forEach(function (prop) { target.style.removeProperty(prop); });
        SidebarMenu._slideStates.set(target, { open: open, timer: null });
      };

      if (duration === 0) finish();
      else state.timer = setTimeout(finish, duration);
    }
  };

  DexterSidebar.SidebarMenu = SidebarMenu;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { DexterSidebar.initAll(); });
    } else {
      DexterSidebar.initAll();
    }
  }

  return DexterSidebar;
});
