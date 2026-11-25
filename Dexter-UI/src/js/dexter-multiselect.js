/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-multiselect.js
 * @description [PT-BR] Controlador nativo zero-dependência para Seleção Múltipla com
 *              Dropdown e Checkboxes (MultiSelect), inspirado e aprimorado a partir do
 *              BsMultiSelect (github.com/DashboardCode/BsMultiSelect).
 *              Converte nativamente elementos <select multiple> com suporte a grupos (<optgroup>),
 *              busca em tempo real, barra de ações (Selecionar Todos / Limpar), badges personalizadas
 *              ou modo resumo condensado ("N selecionados"), acessibilidade total por teclado,
 *              integração às 28 cores oficiais e Dark Mode.
 *              [EN]    Zero-dependency native controller for MultiSelect Dropdown with Checkboxes,
 *              inspired and enhanced from BsMultiSelect (github.com/DashboardCode/BsMultiSelect).
 *              Transforms native <select multiple> elements with optgroup support, live filtering,
 *              toolbar actions (Select All / Clear), custom badges or collapsed summary mode,
 *              full keyboard accessibility, 28 official colors, and native Dark Mode.
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

  // Ícone SVG de fechar / remover tag (×)
  var ICON_CLOSE = '<svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"></path></svg>';

  // Ícone SVG de lupa para busca
  var ICON_SEARCH = '<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/></svg>';

  /**
   * Escape seguro de HTML
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Construtor principal do DexterMultiSelect
   */
  function DexterMultiSelect(element, options) {
    if (!element || element.tagName.toLowerCase() !== 'select') return;
    if (element._dexterMultiSelectInstance) {
      return element._dexterMultiSelectInstance;
    }

    this.el = element;

    // Resgata configurações de atributos HTML
    var colorAttr = element.getAttribute('data-dx-color') || element.getAttribute('data-color');
    var maxAttr = element.getAttribute('data-max');
    var collapseAttr = element.getAttribute('data-collapse-after');
    var searchAttr = element.getAttribute('data-search');
    var selectAllAttr = element.getAttribute('data-select-all');
    var placeholderAttr = element.getAttribute('placeholder') || element.getAttribute('data-placeholder');
    var styleAttr = element.getAttribute('data-badge-style');

    this.options = Object.assign({
      color: colorAttr || 'primary',
      placeholder: placeholderAttr || 'Selecione as opções...',
      max: maxAttr ? parseInt(maxAttr, 10) : null,
      collapseAfter: collapseAttr !== null ? parseInt(collapseAttr, 10) : null, // ex: 3
      showSearch: searchAttr !== null ? searchAttr === 'true' : true,
      showSelectAll: selectAllAttr !== null ? selectAllAttr === 'true' : true,
      badgeStyle: styleAttr || 'soft', // 'soft', 'solid', 'outline'
      searchPlaceholder: 'Filtrar opções...',
      selectAllText: 'Selecionar Todos',
      clearAllText: 'Limpar',
      emptyText: 'Nenhuma opção encontrada',
      allSelectedText: 'Todos selecionados',
      countSelectedText: '{0} selecionados',
      onChange: null
    }, options || {});

    this.isOpen = false;
    this.highlightedIndex = -1;

    this._init();
    element._dexterMultiSelectInstance = this;
  }

  DexterMultiSelect.prototype._init = function () {
    var self = this;

    // 1. Oculta o select nativo preservando formulário
    this.el.style.display = 'none';
    this.el.setAttribute('aria-hidden', 'true');
    this.el.tabIndex = -1;

    // 2. Contêiner principal
    this.container = document.createElement('div');
    this.container.className = 'dx-multiselect';
    if (this.options.color) {
      this.container.classList.add('multiselect-' + this.options.color);
    }
    if (this.options.badgeStyle === 'solid') {
      this.container.classList.add('multiselect-solid');
    } else if (this.options.badgeStyle === 'outline') {
      this.container.classList.add('multiselect-outline');
    }

    // Copia classes de tamanho e validação
    if (this.el.classList.contains('form-select-sm') || this.el.classList.contains('form-control-sm') || this.el.classList.contains('input-sm')) {
      this.container.classList.add('multiselect-sm');
    }
    if (this.el.classList.contains('form-select-lg') || this.el.classList.contains('form-control-lg') || this.el.classList.contains('input-lg')) {
      this.container.classList.add('multiselect-lg');
    }
    if (this.el.classList.contains('is-valid')) this.container.classList.add('is-valid');
    if (this.el.classList.contains('is-invalid')) this.container.classList.add('is-invalid');
    if (this.el.disabled) this.container.classList.add('is-disabled');

    // 3. Gatilho (Trigger Toggle)
    this.toggle = document.createElement('div');
    this.toggle.className = 'multiselect-toggle';
    this.toggle.tabIndex = this.el.disabled ? -1 : 0;
    this.toggle.setAttribute('role', 'button');
    this.toggle.setAttribute('aria-haspopup', 'listbox');
    this.toggle.setAttribute('aria-expanded', 'false');

    this.container.appendChild(this.toggle);

    // 4. Menu Suspenso
    this.menu = document.createElement('div');
    this.menu.className = 'multiselect-menu';

    // Barra de busca interna
    if (this.options.showSearch) {
      this.searchWrapper = document.createElement('div');
      this.searchWrapper.className = 'multiselect-search-wrapper';

      var searchIcon = document.createElement('span');
      searchIcon.className = 'multiselect-search-icon';
      searchIcon.innerHTML = ICON_SEARCH;

      this.searchInput = document.createElement('input');
      this.searchInput.type = 'text';
      this.searchInput.className = 'multiselect-search-input';
      this.searchInput.placeholder = this.options.searchPlaceholder;
      this.searchInput.autocomplete = 'off';

      this.searchWrapper.appendChild(searchIcon);
      this.searchWrapper.appendChild(this.searchInput);
      this.menu.appendChild(this.searchWrapper);
    }

    // Barra de ações (Selecionar Todos / Limpar)
    if (this.options.showSelectAll) {
      this.toolbar = document.createElement('div');
      this.toolbar.className = 'multiselect-toolbar';

      this.btnSelectAll = document.createElement('button');
      this.btnSelectAll.type = 'button';
      this.btnSelectAll.className = 'multiselect-action-btn';
      this.btnSelectAll.textContent = this.options.selectAllText;

      this.btnClearAll = document.createElement('button');
      this.btnClearAll.type = 'button';
      this.btnClearAll.className = 'multiselect-action-btn';
      this.btnClearAll.textContent = this.options.clearAllText;

      this.toolbar.appendChild(this.btnSelectAll);
      this.toolbar.appendChild(this.btnClearAll);
      this.menu.appendChild(this.toolbar);
    }

    // Lista de opções
    this.list = document.createElement('ul');
    this.list.className = 'multiselect-list';
    this.list.setAttribute('role', 'listbox');
    this.menu.appendChild(this.list);

    this.container.appendChild(this.menu);
    this.el.parentNode.insertBefore(this.container, this.el.nextSibling);

    // 5. Renderiza opções e gatilho
    this._buildOptions();
    this._renderToggle();

    // 6. Vincula eventos
    this._bindEvents();
  };

  /**
   * Constrói a lista de opções a partir do select nativo
   */
  DexterMultiSelect.prototype._buildOptions = function () {
    var self = this;
    this.items = [];
    this.list.innerHTML = '';

    var children = Array.from(this.el.children);
    children.forEach(function (child) {
      if (child.tagName.toLowerCase() === 'optgroup') {
        var groupLabel = child.getAttribute('label') || 'Grupo';
        var header = document.createElement('li');
        header.className = 'multiselect-group-header';
        header.textContent = groupLabel;
        self.list.appendChild(header);

        var subOptions = Array.from(child.children);
        subOptions.forEach(function (opt) {
          self._createOptionItem(opt);
        });
      } else if (child.tagName.toLowerCase() === 'option') {
        self._createOptionItem(child);
      }
    });

    // Mensagem de vazio
    this.emptyMsg = document.createElement('li');
    this.emptyMsg.className = 'multiselect-empty';
    this.emptyMsg.textContent = this.options.emptyText;
    this.emptyMsg.style.display = 'none';
    this.list.appendChild(this.emptyMsg);
  };

  /**
   * Cria um item individual com checkbox
   */
  DexterMultiSelect.prototype._createOptionItem = function (option) {
    var self = this;
    var val = option.value;
    var text = option.text;
    var isSelected = option.selected;
    var isDisabled = option.disabled;

    var li = document.createElement('li');
    li.className = 'multiselect-item';
    li.setAttribute('role', 'option');
    li.setAttribute('data-value', val);
    if (isSelected) li.classList.add('is-selected');
    if (isDisabled) li.classList.add('is-disabled');

    var check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'multiselect-check';
    check.checked = isSelected;
    check.disabled = isDisabled;

    var textSpan = document.createElement('span');
    textSpan.className = 'multiselect-item-text';
    textSpan.textContent = text;

    li.appendChild(check);
    li.appendChild(textSpan);

    var itemObj = {
      el: li,
      check: check,
      textSpan: textSpan,
      option: option,
      value: val,
      text: text
    };

    li.addEventListener('click', function (e) {
      if (isDisabled) return;
      if (e.target !== check) {
        check.checked = !check.checked;
      }
      self._toggleItem(itemObj, check.checked);
    });

    this.list.appendChild(li);
    this.items.push(itemObj);
  };

  /**
   * Alterna seleção de um item
   */
  DexterMultiSelect.prototype._toggleItem = function (itemObj, isSelected) {
    if (isSelected && this.options.max) {
      var currentSelectedCount = this.items.filter(function (it) { return it.check.checked; }).length;
      if (currentSelectedCount > this.options.max) {
        itemObj.check.checked = false;
        return;
      }
    }

    itemObj.option.selected = isSelected;
    itemObj.check.checked = isSelected;
    if (isSelected) {
      itemObj.el.classList.add('is-selected');
    } else {
      itemObj.el.classList.remove('is-selected');
    }

    this._syncNative();
    this._renderToggle();
  };

  /**
   * Renderiza os badges ou resumo condensado no gatilho
   */
  DexterMultiSelect.prototype._renderToggle = function () {
    var self = this;
    var selected = this.items.filter(function (it) { return it.check.checked; });
    this.toggle.innerHTML = '';

    if (selected.length === 0) {
      var placeholder = document.createElement('span');
      placeholder.className = 'multiselect-placeholder';
      placeholder.textContent = this.options.placeholder;
      this.toggle.appendChild(placeholder);
      return;
    }

    // Modo resumo condensado se ultrapassar collapseAfter
    var totalOptions = this.items.length;
    var collapseThreshold = this.options.collapseAfter;

    if (totalOptions > 0 && selected.length === totalOptions) {
      var summaryAll = document.createElement('div');
      summaryAll.className = 'multiselect-summary';
      summaryAll.innerHTML = '<span class="multiselect-count-badge">' + selected.length + '</span> <span>' + escapeHtml(this.options.allSelectedText) + '</span>';
      this.toggle.appendChild(summaryAll);
      return;
    }

    if (collapseThreshold !== null && selected.length > collapseThreshold) {
      var summaryText = this.options.countSelectedText.replace('{0}', selected.length);
      var summary = document.createElement('div');
      summary.className = 'multiselect-summary';
      summary.innerHTML = '<span class="multiselect-count-badge">' + selected.length + '</span> <span>' + escapeHtml(summaryText) + '</span>';
      this.toggle.appendChild(summary);
      return;
    }

    // Badges normais
    selected.forEach(function (it) {
      var badge = document.createElement('span');
      badge.className = 'multiselect-badge';
      if (it.option.getAttribute('data-dx-color')) {
        badge.classList.add('badge-' + it.option.getAttribute('data-dx-color'));
      }

      var textSpan = document.createElement('span');
      textSpan.textContent = it.text;
      badge.appendChild(textSpan);

      var removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'multiselect-badge-remove';
      removeBtn.setAttribute('aria-label', 'Remover ' + it.text);
      removeBtn.innerHTML = ICON_CLOSE;

      removeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self._toggleItem(it, false);
      });

      badge.appendChild(removeBtn);
      self.toggle.appendChild(badge);
    });
  };

  /**
   * Sincroniza estado com o elemento nativo
   */
  DexterMultiSelect.prototype._syncNative = function () {
    var changeEvt = new Event('change', { bubbles: true });
    var inputEvt = new Event('input', { bubbles: true });
    this.el.dispatchEvent(changeEvt);
    this.el.dispatchEvent(inputEvt);

    if (typeof this.options.onChange === 'function') {
      var values = this.getSelectedValues();
      this.options.onChange(values, this);
    }
  };

  /**
   * Vincula eventos de clique, teclado e busca
   */
  DexterMultiSelect.prototype._bindEvents = function () {
    var self = this;

    // Abrir / Fechar dropdown
    this.toggle.addEventListener('click', function (e) {
      if (e.target.closest('.multiselect-badge-remove')) return;
      self.toggleMenu();
    });

    this.toggle.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        self.toggleMenu();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!self.isOpen) self.openMenu();
        self._navigateList(1);
      }
    });

    // Barra de busca
    if (this.searchInput) {
      this.searchInput.addEventListener('input', function () {
        self._filterItems(self.searchInput.value.trim().toLowerCase());
      });

      this.searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          self.closeMenu();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          self._navigateList(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          self._navigateList(-1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (self.highlightedIndex >= 0 && self.visibleItems && self.visibleItems[self.highlightedIndex]) {
            var item = self.visibleItems[self.highlightedIndex];
            item.check.checked = !item.check.checked;
            self._toggleItem(item, item.check.checked);
          }
        }
      });
    }

    // Ações: Selecionar Todos / Limpar
    if (this.btnSelectAll) {
      this.btnSelectAll.addEventListener('click', function (e) {
        e.preventDefault();
        self.selectAll();
      });
    }

    if (this.btnClearAll) {
      this.btnClearAll.addEventListener('click', function (e) {
        e.preventDefault();
        self.deselectAll();
      });
    }

    // Clique fora fecha o menu
    document.addEventListener('click', function (e) {
      if (!self.container.contains(e.target)) {
        self.closeMenu();
      }
    });
  };

  /**
   * Filtra itens por texto de busca
   */
  DexterMultiSelect.prototype._filterItems = function (query) {
    var visibleCount = 0;
    this.visibleItems = [];

    this.items.forEach(function (it) {
      var match = !query || it.text.toLowerCase().indexOf(query) !== -1;
      if (match) {
        it.el.style.display = '';
        visibleCount++;

        // Highlight do termo
        if (query) {
          var reg = new RegExp('(' + query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + ')', 'gi');
          it.textSpan.innerHTML = escapeHtml(it.text).replace(reg, '<span class="multiselect-highlight">$1</span>');
        } else {
          it.textSpan.textContent = it.text;
        }
      } else {
        it.el.style.display = 'none';
      }
    });

    this.visibleItems = this.items.filter(function (it) { return it.el.style.display !== 'none'; });
    this.emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    this.highlightedIndex = -1;
  };

  /**
   * Navega pelas opções visíveis com as setas
   */
  DexterMultiSelect.prototype._navigateList = function (direction) {
    var list = this.visibleItems || this.items;
    if (!list.length) return;

    list.forEach(function (it) { it.el.classList.remove('is-highlighted'); });

    this.highlightedIndex += direction;
    if (this.highlightedIndex >= list.length) {
      this.highlightedIndex = 0;
    } else if (this.highlightedIndex < 0) {
      this.highlightedIndex = list.length - 1;
    }

    var active = list[this.highlightedIndex];
    if (active) {
      active.el.classList.add('is-highlighted');
      active.el.scrollIntoView({ block: 'nearest' });
    }
  };

  /**
   * Abre o menu suspenso
   */
  DexterMultiSelect.prototype.openMenu = function () {
    if (this.el.disabled) return;
    this.isOpen = true;
    this.container.classList.add('is-open');
    this.toggle.setAttribute('aria-expanded', 'true');
    if (this.searchInput) {
      this.searchInput.value = '';
      this._filterItems('');
      this.searchInput.focus();
    }
  };

  /**
   * Fecha o menu suspenso
   */
  DexterMultiSelect.prototype.closeMenu = function () {
    this.isOpen = false;
    this.container.classList.remove('is-open');
    this.toggle.setAttribute('aria-expanded', 'false');
    this.highlightedIndex = -1;
  };

  /**
   * Alterna abertura e fechamento
   */
  DexterMultiSelect.prototype.toggleMenu = function () {
    if (this.isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  };

  /**
   * Seleciona todas as opções
   */
  DexterMultiSelect.prototype.selectAll = function () {
    var self = this;
    this.items.forEach(function (it) {
      if (!it.option.disabled) {
        it.option.selected = true;
        it.check.checked = true;
        it.el.classList.add('is-selected');
      }
    });
    this._syncNative();
    this._renderToggle();
  };

  /**
   * Desmarca todas as opções
   */
  DexterMultiSelect.prototype.deselectAll = function () {
    var self = this;
    this.items.forEach(function (it) {
      if (!it.option.disabled) {
        it.option.selected = false;
        it.check.checked = false;
        it.el.classList.remove('is-selected');
      }
    });
    this._syncNative();
    this._renderToggle();
  };

  /**
   * Retorna os valores selecionados
   */
  DexterMultiSelect.prototype.getSelectedValues = function () {
    return this.items.filter(function (it) { return it.check.checked; }).map(function (it) { return it.value; });
  };

  /**
   * Destrói a instância
   */
  DexterMultiSelect.prototype.destroy = function () {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.el.style.display = '';
    this.el.removeAttribute('aria-hidden');
    this.el.tabIndex = 0;
    delete this.el._dexterMultiSelectInstance;
  };

  /**
   * Inicialização automática
   */
  DexterMultiSelect.initAll = function () {
    var elements = document.querySelectorAll('select[multiple][data-dx-multiselect], select[multiple].form-multiselect, select[multiple].bs-multiselect');
    Array.prototype.forEach.call(elements, function (el) {
      if (!el._dexterMultiSelectInstance) {
        new DexterMultiSelect(el);
      }
    });
  };

  // Auto-init no DOMContentLoaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', DexterMultiSelect.initAll);
    } else {
      DexterMultiSelect.initAll();
    }
  }

  // Exportação UMD / Global (com alias BsMultiSelect para compatibilidade direta)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DexterMultiSelect;
    module.exports.BsMultiSelect = DexterMultiSelect;
  } else {
    global.DexterMultiSelect = DexterMultiSelect;
    global.BsMultiSelect = DexterMultiSelect;
  }

})(typeof window !== 'undefined' ? window : this);
