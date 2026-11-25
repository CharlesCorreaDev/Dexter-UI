/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-treeview.js
 * @description [PT-BR] Controlador nativo zero-dependência para Árvore Hierárquica
 *              (DexterTreeView / BsTreeView), inspirado e aprimorado a partir do
 *              nhmvienna/bs5treeview (e chniter/bstreeview). Funciona sem jQuery, sem
 *              Bootstrap JS e sem FontAwesome (com ponte jQuery opcional $.fn.bstreeview).
 *              Oferece expansão/recolhimento animado, seleção única/múltipla, checkboxes
 *              tri-state em cascata (:indeterminate), pesquisa insensível a acentos NFD
 *              com abertura automática do caminho encontrado, contadores de filhos e
 *              navegação WAI-ARIA completa por teclado.
 *              [EN]    Zero-dependency native controller for Hierarchical Tree View
 *              (DexterTreeView / BsTreeView), inspired and enhanced from
 *              nhmvienna/bs5treeview (and chniter/bstreeview). Runs without jQuery,
 *              Bootstrap JS or FontAwesome (with optional $.fn.bstreeview jQuery bridge).
 *              Features smooth expand/collapse, single/multi selection, cascading tri-state
 *              checkboxes (:indeterminate), NFD accent-insensitive search with path
 *              auto-expansion, child counters and full WAI-ARIA keyboard navigation.
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
    var TreeClass = factory();
    global.DexterTreeView = TreeClass;
    global.BsTreeView = TreeClass;
    global.dexter = global.dexter || {};
    global.dexter.TreeView = TreeClass;

    // Ponte opcional jQuery compatível com $('#tree').bstreeview({ data })
    if (global.jQuery) {
      global.jQuery.fn.bstreeview = function (optionOrMethod) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
          var inst = TreeClass.getOrCreateInstance(this, typeof optionOrMethod === 'object' ? optionOrMethod : {});
          if (typeof optionOrMethod === 'string' && typeof inst[optionOrMethod] === 'function') {
            inst[optionOrMethod].apply(inst, args);
          }
        });
      };
    }
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var INSTANCE_MAP = new WeakMap();
  var CHEVRON_SVG = '<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>';

  var DEFAULT_OPTIONS = {
    data: [],
    expandIcon: null,
    collapseIcon: null,
    expandClass: 'show',
    indent: 1.25,
    parentsMarginLeft: '1.25rem',
    openNodeLinkOnNewTab: true,
    selectable: true,
    multiSelect: false,
    checkboxes: false,
    showCounts: false,
    searchInput: null,
    keyboard: true
  };

  function normalizeText(str) {
    return String(str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function dispatch(el, name, detail) {
    el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail || {} }));
  }

  function DexterTreeView(element, options) {
    this.el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.el) {
      throw new Error('[DexterTreeView] Elemento container não encontrado.');
    }

    if (INSTANCE_MAP.has(this.el)) {
      return INSTANCE_MAP.get(this.el);
    }

    this.options = Object.assign({}, DEFAULT_OPTIONS, this._readDataAttrs(), options || {});
    this.itemIdPrefix = (this.el.id || ('dx-tree-' + Math.floor(Math.random() * 10000))) + '-item-';
    this.flatNodes = [];
    this.nodeMap = new Map();
    this._boundSearch = null;

    this._init();
    INSTANCE_MAP.set(this.el, this);
  }

  DexterTreeView.prototype._readDataAttrs = function () {
    var ds = this.el.dataset || {};
    var opts = {};
    if (ds.checkboxes !== undefined) opts.checkboxes = ds.checkboxes === 'true';
    if (ds.multiSelect !== undefined) opts.multiSelect = ds.multiSelect === 'true';
    if (ds.showCounts !== undefined) opts.showCounts = ds.showCounts === 'true';
    if (ds.indent) {
      var iv = parseFloat(ds.indent);
      if (!isNaN(iv)) opts.indent = iv;
    }
    if (ds.treeviewData) {
      try { opts.data = JSON.parse(ds.treeviewData); } catch (e) { /* ignora JSON inválido */ }
    }
    return opts;
  };

  DexterTreeView.prototype._init = function () {
    this.el.classList.add('dx-treeview', 'bstreeview');
    this.el.setAttribute('role', 'tree');
    if (this.options.multiSelect || this.options.checkboxes) {
      this.el.setAttribute('aria-multiselectable', 'true');
    }

    this.setData(this.options.data);
    this._bindSearchInput();

    if (this.options.keyboard) {
      this._bindKeyboard();
    }

    dispatch(this.el, 'dx:tree:init', { tree: this, count: this.flatNodes.length });
  };

  DexterTreeView.prototype.setData = function (rawData) {
    var parsed = rawData;
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed); } catch (e) { parsed = []; }
    }
    this.tree = Array.isArray(parsed) ? JSON.parse(JSON.stringify(parsed)) : [];
    this.flatNodes = [];
    this.nodeMap.clear();
    this.el.innerHTML = '';

    this._indexData(this.tree, null, 0);
    this._buildDom(this.el, this.tree, 0);

    if (this.options.checkboxes) {
      this._reconcileAllCheckboxes();
    }
  };

  DexterTreeView.prototype._indexData = function (nodes, parentMeta, depth) {
    var self = this;
    nodes.forEach(function (node) {
      var nid = node.id ? String(node.id) : (self.itemIdPrefix + self.flatNodes.length);
      var meta = {
        nodeId: self.flatNodes.length,
        id: nid,
        data: node,
        parent: parentMeta,
        children: [],
        depth: depth,
        expanded: !!node.expanded,
        selected: !!node.selected,
        checked: !!node.checked,
        disabled: !!node.disabled,
        itemEl: null,
        groupEl: null,
        checkboxEl: null,
        stateIconEl: null
      };

      self.flatNodes.push(meta);
      self.nodeMap.set(nid, meta);
      if (parentMeta) parentMeta.children.push(meta);

      if (Array.isArray(node.nodes) && node.nodes.length > 0) {
        self._indexData(node.nodes, meta, depth + 1);
      }
    });
  };

  DexterTreeView.prototype._buildDom = function (parentEl, nodes, depth) {
    var self = this;

    nodes.forEach(function (node) {
      var meta = self.flatNodes.find(function (m) { return m.data === node; });
      if (!meta) return;

      var hasChildren = meta.children.length > 0;
      var padLeft = depth === 0
        ? self.options.parentsMarginLeft
        : (self.options.indent + depth * self.options.indent) + 'rem';

      var item = document.createElement('div');
      item.id = meta.id;
      item.className = 'dx-tree-item list-group-item';
      if (node.class) {
        String(node.class).split(/\s+/).filter(Boolean).forEach(function (c) { item.classList.add(c); });
      }
      if (meta.expanded) item.classList.add('is-expanded');
      if (meta.selected) item.classList.add('is-selected', 'active');
      if (meta.disabled) item.classList.add('is-disabled');

      item.setAttribute('role', 'treeitem');
      item.setAttribute('aria-level', String(depth + 1));
      item.setAttribute('aria-selected', meta.selected ? 'true' : 'false');
      if (hasChildren) {
        item.setAttribute('aria-expanded', meta.expanded ? 'true' : 'false');
        item.setAttribute('data-bs-target', '#' + meta.id + '-group');
      }
      item.setAttribute('tabindex', meta.nodeId === 0 ? '0' : '-1');
      item.style.paddingInlineStart = padLeft;

      // 1. State icon (expand / collapse)
      if (hasChildren) {
        var stateSpan = document.createElement('span');
        stateSpan.className = 'state-icon';
        if (self.options.expandIcon && self.options.collapseIcon) {
          stateSpan.innerHTML = '<i class="' + (meta.expanded ? self.options.expandIcon : self.options.collapseIcon) + '" aria-hidden="true"></i>';
        } else {
          stateSpan.classList.add('is-chevron');
          stateSpan.innerHTML = CHEVRON_SVG;
        }
        item.appendChild(stateSpan);
        meta.stateIconEl = stateSpan;
      } else {
        var spacer = document.createElement('span');
        spacer.className = 'dx-tree-spacer';
        item.appendChild(spacer);
      }

      // 2. Tri-state checkbox
      if (self.options.checkboxes) {
        var cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'dx-tree-checkbox';
        cb.checked = meta.checked;
        cb.disabled = meta.disabled;
        cb.setAttribute('aria-label', 'Selecionar ' + (node.text || ''));
        cb.addEventListener('click', function (e) {
          e.stopPropagation();
          self.setChecked(meta.id, cb.checked, true);
        });
        item.appendChild(cb);
        meta.checkboxEl = cb;
      }

      // 3. Custom node icon
      if (node.icon) {
        var iconSpan = document.createElement('span');
        iconSpan.className = 'item-icon';
        if (String(node.icon).trim().charAt(0) === '<') {
          iconSpan.innerHTML = node.icon;
        } else if (/\s|^fa|^bi|^dx-icon/.test(String(node.icon))) {
          iconSpan.innerHTML = '<i class="' + node.icon + '" aria-hidden="true"></i>';
        } else {
          iconSpan.textContent = node.icon;
        }
        item.appendChild(iconSpan);
      }

      // 4. Label (ou link âncora)
      var label = document.createElement(node.href ? 'a' : 'span');
      label.className = 'dx-tree-label';
      label.textContent = node.text || '';
      if (node.href) {
        label.href = node.href;
        if (self.options.openNodeLinkOnNewTab) {
          label.target = '_blank';
          label.rel = 'noopener';
        }
        label.addEventListener('click', function (e) {
          e.stopPropagation();
        });
      }
      item.appendChild(label);

      // 5. Badge / Contador de filhos
      if (node.badge !== undefined && node.badge !== null) {
        var bSpan = document.createElement('span');
        bSpan.className = 'dx-tree-badge';
        bSpan.textContent = String(node.badge);
        item.appendChild(bSpan);
      } else if (self.options.showCounts && hasChildren) {
        var cSpan = document.createElement('span');
        cSpan.className = 'dx-tree-badge';
        cSpan.textContent = String(meta.children.length);
        item.appendChild(cSpan);
      }

      item.addEventListener('click', function () {
        if (meta.disabled) return;
        self._focusItem(item);

        if (hasChildren) {
          self.toggleNode(meta.id);
        }
        if (self.options.selectable) {
          self.selectNode(meta.id);
        }
        if (node.href && !node.href.startsWith('#')) {
          if (self.options.openNodeLinkOnNewTab) window.open(node.href, '_blank', 'noopener');
          else window.location.href = node.href;
        }
      });

      meta.itemEl = item;
      parentEl.appendChild(item);

      if (hasChildren) {
        var group = document.createElement('div');
        group.id = meta.id + '-group';
        group.className = 'dx-tree-group list-group collapse' + (meta.expanded ? ' ' + self.options.expandClass : '');
        group.setAttribute('role', 'group');
        meta.groupEl = group;
        parentEl.appendChild(group);
        self._buildDom(group, node.nodes, depth + 1);
      }
    });
  };

  DexterTreeView.prototype._focusItem = function (itemEl) {
    this.flatNodes.forEach(function (m) {
      if (m.itemEl) m.itemEl.setAttribute('tabindex', m.itemEl === itemEl ? '0' : '-1');
    });
    if (itemEl) itemEl.focus();
  };

  DexterTreeView.prototype._bindKeyboard = function () {
    var self = this;
    this.el.addEventListener('keydown', function (e) {
      var activeItem = document.activeElement && document.activeElement.closest('.dx-tree-item');
      if (!activeItem || !self.el.contains(activeItem)) return;

      var meta = self.nodeMap.get(activeItem.id);
      if (!meta) return;

      var visible = self.flatNodes.filter(function (m) {
        if (!m.itemEl || m.itemEl.classList.contains('is-hidden')) return false;
        var p = m.parent;
        while (p) {
          if (!p.expanded) return false;
          p = p.parent;
        }
        return true;
      });
      var idx = visible.indexOf(meta);

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (idx < visible.length - 1) self._focusItem(visible[idx + 1].itemEl);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (idx > 0) self._focusItem(visible[idx - 1].itemEl);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (meta.children.length > 0) {
          if (!meta.expanded) self.expandNode(meta.id);
          else if (meta.children[0].itemEl) self._focusItem(meta.children[0].itemEl);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (meta.children.length > 0 && meta.expanded) {
          self.collapseNode(meta.id);
        } else if (meta.parent && meta.parent.itemEl) {
          self._focusItem(meta.parent.itemEl);
        }
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (self.options.checkboxes && e.key === ' ') {
          self.setChecked(meta.id, !meta.checked, true);
        } else {
          activeItem.click();
        }
      }
    });
  };

  DexterTreeView.prototype._bindSearchInput = function () {
    if (!this.options.searchInput) return;
    var inp = typeof this.options.searchInput === 'string'
      ? document.querySelector(this.options.searchInput)
      : this.options.searchInput;
    if (!inp) return;

    var self = this;
    this._boundSearch = function () {
      self.search(inp.value);
    };
    inp.addEventListener('input', this._boundSearch);
  };

  DexterTreeView.prototype._updateExpandVisual = function (meta) {
    if (!meta || !meta.groupEl) return;
    meta.itemEl.classList.toggle('is-expanded', meta.expanded);
    meta.itemEl.setAttribute('aria-expanded', meta.expanded ? 'true' : 'false');
    meta.groupEl.classList.toggle(this.options.expandClass, meta.expanded);

    if (meta.stateIconEl && this.options.expandIcon && this.options.collapseIcon) {
      meta.stateIconEl.innerHTML = '<i class="' + (meta.expanded ? this.options.expandIcon : this.options.collapseIcon) + '" aria-hidden="true"></i>';
    }
  };

  DexterTreeView.prototype.expandNode = function (id) {
    var meta = this.nodeMap.get(String(id));
    if (!meta || meta.children.length === 0 || meta.expanded) return;
    meta.expanded = true;
    this._updateExpandVisual(meta);
    dispatch(this.el, 'dx:tree:expand', { node: meta.data, id: meta.id });
  };

  DexterTreeView.prototype.collapseNode = function (id) {
    var meta = this.nodeMap.get(String(id));
    if (!meta || meta.children.length === 0 || !meta.expanded) return;
    meta.expanded = false;
    this._updateExpandVisual(meta);
    dispatch(this.el, 'dx:tree:collapse', { node: meta.data, id: meta.id });
  };

  DexterTreeView.prototype.toggleNode = function (id) {
    var meta = this.nodeMap.get(String(id));
    if (!meta || meta.children.length === 0) return;
    if (meta.expanded) this.collapseNode(id);
    else this.expandNode(id);
  };

  DexterTreeView.prototype.expandAll = function () {
    var self = this;
    this.flatNodes.forEach(function (meta) {
      if (meta.children.length > 0) {
        meta.expanded = true;
        self._updateExpandVisual(meta);
      }
    });
  };

  DexterTreeView.prototype.collapseAll = function () {
    var self = this;
    this.flatNodes.forEach(function (meta) {
      if (meta.children.length > 0) {
        meta.expanded = false;
        self._updateExpandVisual(meta);
      }
    });
  };

  DexterTreeView.prototype.selectNode = function (id) {
    var meta = this.nodeMap.get(String(id));
    if (!meta || meta.disabled) return;

    if (!this.options.multiSelect) {
      this.flatNodes.forEach(function (m) {
        if (m !== meta) {
          m.selected = false;
          if (m.itemEl) {
            m.itemEl.classList.remove('is-selected', 'active');
            m.itemEl.setAttribute('aria-selected', 'false');
          }
        }
      });
      meta.selected = true;
    } else {
      meta.selected = !meta.selected;
    }

    if (meta.itemEl) {
      meta.itemEl.classList.toggle('is-selected', meta.selected);
      meta.itemEl.classList.toggle('active', meta.selected);
      meta.itemEl.setAttribute('aria-selected', meta.selected ? 'true' : 'false');
    }

    dispatch(this.el, 'dx:tree:select', { node: meta.data, id: meta.id, selected: this.getSelected() });
  };

  DexterTreeView.prototype.getSelected = function () {
    return this.flatNodes.filter(function (m) { return m.selected; }).map(function (m) { return m.data; });
  };

  DexterTreeView.prototype.setChecked = function (id, checked, cascade) {
    var meta = this.nodeMap.get(String(id));
    if (!meta) return;

    var setDesc = function (nodeMeta, val) {
      if (nodeMeta.disabled) return;
      nodeMeta.checked = !!val;
      if (nodeMeta.checkboxEl) {
        nodeMeta.checkboxEl.checked = nodeMeta.checked;
        nodeMeta.checkboxEl.indeterminate = false;
      }
      if (cascade !== false) {
        nodeMeta.children.forEach(function (c) { setDesc(c, val); });
      }
    };

    setDesc(meta, checked);
    this._reconcileAncestors(meta.parent);

    dispatch(this.el, 'dx:tree:check', { node: meta.data, id: meta.id, checked: this.getChecked() });
  };

  DexterTreeView.prototype._reconcileAncestors = function (parentMeta) {
    var cur = parentMeta;
    while (cur) {
      var children = cur.children;
      if (children.length > 0 && cur.checkboxEl) {
        var allChecked = children.every(function (c) { return c.checked && (!c.checkboxEl || !c.checkboxEl.indeterminate); });
        var someChecked = children.some(function (c) { return c.checked || (c.checkboxEl && c.checkboxEl.indeterminate); });
        cur.checked = allChecked;
        cur.checkboxEl.checked = allChecked;
        cur.checkboxEl.indeterminate = !allChecked && someChecked;
      }
      cur = cur.parent;
    }
  };

  DexterTreeView.prototype._reconcileAllCheckboxes = function () {
    var self = this;
    for (var i = this.flatNodes.length - 1; i >= 0; i--) {
      var m = this.flatNodes[i];
      if (m.children.length > 0) {
        self._reconcileAncestors(m);
      }
    }
  };

  DexterTreeView.prototype.getChecked = function () {
    return this.flatNodes
      .filter(function (m) { return m.checked; })
      .map(function (m) { return m.data; });
  };

  DexterTreeView.prototype.search = function (query) {
    var q = normalizeText(query);
    var self = this;

    if (!q) {
      this.clearSearch();
      return [];
    }

    var matches = [];
    var keepIds = new Set();

    this.flatNodes.forEach(function (m) {
      var match = normalizeText(m.data.text).indexOf(q) !== -1;
      if (match) {
        matches.push(m);
        keepIds.add(m.id);
        var p = m.parent;
        while (p) {
          keepIds.add(p.id);
          p.expanded = true;
          self._updateExpandVisual(p);
          p = p.parent;
        }
      }
    });

    this.flatNodes.forEach(function (m) {
      if (!m.itemEl) return;
      var isMatch = matches.indexOf(m) !== -1;
      var visible = keepIds.has(m.id);
      m.itemEl.classList.toggle('is-match', isMatch);
      m.itemEl.classList.toggle('is-hidden', !visible);
    });

    dispatch(this.el, 'dx:tree:search', { query: query, matches: matches.map(function (m) { return m.data; }) });
    return matches.map(function (m) { return m.data; });
  };

  DexterTreeView.prototype.clearSearch = function () {
    this.flatNodes.forEach(function (m) {
      if (m.itemEl) {
        m.itemEl.classList.remove('is-match', 'is-hidden');
      }
    });
  };

  DexterTreeView.prototype.destroy = function () {
    this.el.innerHTML = '';
    INSTANCE_MAP.delete(this.el);
  };

  DexterTreeView.getInstance = function (el) {
    var node = typeof el === 'string' ? document.querySelector(el) : el;
    return node ? INSTANCE_MAP.get(node) || null : null;
  };

  DexterTreeView.getOrCreateInstance = function (el, opts) {
    var node = typeof el === 'string' ? document.querySelector(el) : el;
    if (!node) return null;
    return INSTANCE_MAP.get(node) || new DexterTreeView(node, opts);
  };

  DexterTreeView.initAll = function (root) {
    var els = (root || document).querySelectorAll('[data-dx-treeview], [data-bs-treeview]');
    els.forEach(function (el) {
      DexterTreeView.getOrCreateInstance(el);
    });
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { DexterTreeView.initAll(); });
    } else {
      DexterTreeView.initAll();
    }
  }

  return DexterTreeView;
});
