/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-select.js
 * @description [PT-BR] Controlador nativo zero-dependência para Select Moderno (DexterSelect / selectpicker),
 *              inspirado e aprimorado a partir do bootstrap-select (SnapAppointments).
 *              Oferece suporte a seleção simples e múltipla (<select multiple>), busca em tempo real
 *              (data-live-search="true"), caixa de ações em lote (data-actions-box="true" com selecionar/desmarcar todos),
 *              subtextos descritivos (data-subtext), ícones e emojis (data-icon), conteúdo HTML customizado
 *              (data-content), limite máximo de opções (data-max-options), formatação de texto selecionado
 *              (data-selected-text-format="count > 2"), divisores (data-divider="true"), cabeçalhos de grupos
 *              (<optgroup>), cabeçalho de menu (data-header), posicionamento inteligente dropup, navegação
 *              completa por teclado e compatibilidade imediata com a API jQuery/Bootstrap selectpicker.
 *              [EN]    Zero-dependency native controller for Modern Select (DexterSelect / selectpicker),
 *              inspired and enhanced from bootstrap-select (SnapAppointments).
 *              Supports single and multiple selection (<select multiple>), live search (data-live-search="true"),
 *              actions box (data-actions-box="true" with select/deselect all), descriptive subtexts (data-subtext),
 *              icons & emojis (data-icon), custom HTML content (data-content), max options limit (data-max-options),
 *              selected text formatting (data-selected-text-format="count > 2"), dividers (data-divider="true"),
 *              optgroups, menu header (data-header), smart dropup positioning, full keyboard navigation
 *              and immediate compatibility with the jQuery/Bootstrap selectpicker API.
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
    var SelectClass = factory();
    global.DexterSelect = SelectClass;
    global.dexter = global.dexter || {};
    global.dexter.Select = SelectClass;

    // Drop-in alias jQuery se jQuery estiver presente
    if (global.jQuery) {
      global.jQuery.fn.selectpicker = function (option) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
          var instance = DexterSelect.getOrCreateInstance(this);
          if (typeof option === 'string' && typeof instance[option] === 'function') {
            instance[option].apply(instance, args);
          }
        });
      };
    }
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var instances = new WeakMap();

  var SVG_CHEVRON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dx-select-arrow"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  var SVG_CHECK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="dx-select-check"><polyline points="20 6 9 17 4 12"></polyline></svg>';
  var SVG_SEARCH = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="dx-select-search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>';

  /**
   * Remove acentos para busca flexível
   */
  function normalizeText(str) {
    return (str || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  /**
   * Classe principal DexterSelect
   */
  function DexterSelect(selectEl, options) {
    if (!selectEl || selectEl.tagName !== 'SELECT') {
      throw new Error('DexterSelect: O elemento fornecido deve ser um <select>');
    }

    if (instances.has(selectEl)) {
      return instances.get(selectEl);
    }

    this.select = selectEl;
    this.isMultiple = selectEl.multiple;

    // Configurações herdadas de data-attributes ou do objeto options
    var liveSearch = selectEl.hasAttribute('data-live-search')
      ? selectEl.getAttribute('data-live-search') === 'true'
      : (selectEl.hasAttribute('data-dx-search') || selectEl.options.length > 8);

    var actionsBox = selectEl.hasAttribute('data-actions-box')
      ? selectEl.getAttribute('data-actions-box') === 'true'
      : (this.isMultiple && selectEl.hasAttribute('data-dx-actions-box'));

    var maxOptions = selectEl.getAttribute('data-max-options')
      ? parseInt(selectEl.getAttribute('data-max-options'), 10)
      : null;

    var selectedTextFormat = selectEl.getAttribute('data-selected-text-format') || 'values';
    var countSelectedText = selectEl.getAttribute('data-count-selected-text') || '{0} de {1} selecionados';
    var noneSelectedText = selectEl.getAttribute('title') || selectEl.getAttribute('data-none-selected-text') || 'Selecione uma opção...';
    var searchPlaceholder = selectEl.getAttribute('data-live-search-placeholder') || selectEl.getAttribute('data-dx-placeholder') || 'Buscar opção...';
    var selectAllText = selectEl.getAttribute('data-select-all-text') || 'Selecionar Todos';
    var deselectAllText = selectEl.getAttribute('data-deselect-all-text') || 'Desmarcar Todos';
    var header = selectEl.getAttribute('data-header') || '';
    var style = selectEl.getAttribute('data-style') || '';

    this.options = Object.assign({
      striped: true,
      liveSearch: liveSearch,
      actionsBox: actionsBox,
      maxOptions: maxOptions,
      selectedTextFormat: selectedTextFormat,
      countSelectedText: countSelectedText,
      noneSelectedText: noneSelectedText,
      searchPlaceholder: searchPlaceholder,
      selectAllText: selectAllText,
      deselectAllText: deselectAllText,
      header: header,
      style: style,
      size: selectEl.getAttribute('data-size') || 'auto',
      maxHeight: 280
    }, options || {});

    this.isOpen = false;
    this.activeIndex = -1;
    this.itemElements = [];

    this._init();
    instances.set(selectEl, this);
    selectEl._dexterSelect = this;
  }

  DexterSelect.prototype._init = function () {
    var self = this;

    // Oculta acessivelmente o select nativo
    this.select.classList.add('dx-native-hidden');
    this.select.setAttribute('tabindex', '-1');
    this.select.setAttribute('aria-hidden', 'true');

    // Cria o wrapper principal
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'dx-custom-select select-picker bootstrap-select';

    // Copia classes do select (cores temáticas, tamanhos, etc.)
    var classes = (this.select.className || '').split(' ');
    classes.forEach(function (cls) {
      if (
        cls.startsWith('select-') ||
        cls.startsWith('form-select-') ||
        cls.startsWith('dx-custom-select-') ||
        cls === 'select-solid' ||
        cls === 'select-outline'
      ) {
        self.wrapper.classList.add(cls);
      }
    });

    if (this.select.disabled) {
      this.wrapper.classList.add('is-disabled');
    }

    // Botão de Acionamento (Gatilho)
    this.control = document.createElement('button');
    this.control.type = 'button';
    this.control.className = 'dx-select-control';
    if (this.options.style) {
      var styleClasses = this.options.style.split(' ');
      styleClasses.forEach(function (c) {
        if (c) self.control.classList.add(c);
      });
    }
    this.control.setAttribute('aria-haspopup', 'listbox');
    this.control.setAttribute('aria-expanded', 'false');

    this.controlLabel = document.createElement('span');
    this.controlLabel.className = 'dx-select-label';

    this.arrowIcon = document.createElement('span');
    this.arrowIcon.className = 'dx-select-arrow-wrapper';
    this.arrowIcon.innerHTML = SVG_CHEVRON;

    this.control.appendChild(this.controlLabel);
    this.control.appendChild(this.arrowIcon);

    // Menu Suspenso (Dropdown)
    this.menu = document.createElement('div');
    this.menu.className = 'dx-select-menu';
    this.menu.setAttribute('role', 'listbox');
    if (this.isMultiple) {
      this.menu.setAttribute('aria-multiselectable', 'true');
    }

    // Cabeçalho Interno do Menu (data-header)
    if (this.options.header) {
      var headerEl = document.createElement('div');
      headerEl.className = 'dx-select-header';
      headerEl.textContent = this.options.header;
      this.menu.appendChild(headerEl);
    }

    // Campo de Busca em Tempo Real
    if (this.options.liveSearch) {
      this.searchWrapper = document.createElement('div');
      this.searchWrapper.className = 'dx-select-search';

      this.searchInput = document.createElement('input');
      this.searchInput.type = 'text';
      this.searchInput.className = 'dx-select-search-input';
      this.searchInput.placeholder = this.options.searchPlaceholder;
      this.searchInput.setAttribute('aria-label', 'Pesquisar opções');

      var searchIcon = document.createElement('span');
      searchIcon.className = 'dx-select-search-icon-box';
      searchIcon.innerHTML = SVG_SEARCH;

      this.searchWrapper.appendChild(searchIcon);
      this.searchWrapper.appendChild(this.searchInput);
      this.menu.appendChild(this.searchWrapper);

      this.searchInput.addEventListener('input', function (e) {
        self._filterOptions(e.target.value);
      });

      this.searchInput.addEventListener('keydown', function (e) {
        self._handleSearchKeydown(e);
      });
    }

    // Caixa de Ações em Lote (Selecionar Todos / Desmarcar Todos)
    if (this.isMultiple && this.options.actionsBox) {
      this.actionsBox = document.createElement('div');
      this.actionsBox.className = 'dx-select-actions';

      var btnSelectAll = document.createElement('button');
      btnSelectAll.type = 'button';
      btnSelectAll.className = 'dx-select-action-btn';
      btnSelectAll.textContent = this.options.selectAllText;
      btnSelectAll.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.selectAll();
      });

      var btnDeselectAll = document.createElement('button');
      btnDeselectAll.type = 'button';
      btnDeselectAll.className = 'dx-select-action-btn';
      btnDeselectAll.textContent = this.options.deselectAllText;
      btnDeselectAll.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.deselectAll();
      });

      this.actionsBox.appendChild(btnSelectAll);
      this.actionsBox.appendChild(btnDeselectAll);
      this.menu.appendChild(this.actionsBox);
    }

    // Lista de Opções
    this.list = document.createElement('div');
    this.list.className = 'dx-select-list';
    if (this.options.striped) {
      this.list.classList.add('is-striped');
    }
    this.menu.appendChild(this.list);

    // Mensagem de Sem Resultados
    this.noResults = document.createElement('div');
    this.noResults.className = 'dx-select-no-results';
    this.noResults.textContent = 'Nenhum resultado encontrado.';
    this.noResults.style.display = 'none';
    this.menu.appendChild(this.noResults);

    // Aviso de Limite Máximo
    this.maxOptionsNotice = document.createElement('div');
    this.maxOptionsNotice.className = 'dx-select-max-options-notice';
    this.maxOptionsNotice.style.display = 'none';
    this.menu.appendChild(this.maxOptionsNotice);

    // Insere no DOM após o select original
    this.wrapper.appendChild(this.control);
    this.wrapper.appendChild(this.menu);
    this.select.parentNode.insertBefore(this.wrapper, this.select.nextSibling);

    // Renderiza itens e atualiza o texto do botão
    this.render();

    // Vincula eventos do usuário
    this._bindEvents();
  };

  /**
   * Renderiza as opções no DOM do dropdown
   */
  DexterSelect.prototype.render = function () {
    var self = this;
    this.list.innerHTML = '';
    this.itemElements = [];

    var visibleIndex = 0;

    Array.from(this.select.children).forEach(function (child) {
      if (child.tagName === 'OPTGROUP') {
        var groupLabel = document.createElement('div');
        groupLabel.className = 'dx-select-optgroup-label';
        groupLabel.textContent = child.label;
        self.list.appendChild(groupLabel);

        Array.from(child.children).forEach(function (opt) {
          self._createOptionElement(opt, visibleIndex++);
        });
      } else if (child.tagName === 'OPTION') {
        if (child.getAttribute('data-divider') === 'true') {
          var divider = document.createElement('div');
          divider.className = 'dx-select-divider';
          divider.setAttribute('role', 'separator');
          self.list.appendChild(divider);
        } else {
          self._createOptionElement(child, visibleIndex++);
        }
      }
    });

    this._updateControlText();
    this._checkMaxOptions();
  };

  /**
   * Cria elemento DOM de uma opção individual
   */
  DexterSelect.prototype._createOptionElement = function (opt, index) {
    var self = this;
    var isSelected = opt.selected;
    var isDisabled = opt.disabled;

    var item = document.createElement('div');
    item.className = 'dx-select-option';
    item.setAttribute('role', 'option');
    item.setAttribute('data-value', opt.value);
    item.setAttribute('data-index', opt.index);

    // Zebrado tonal
    if (index % 2 === 1) {
      item.classList.add('dx-option-even');
    } else {
      item.classList.add('dx-option-odd');
    }

    if (isSelected) {
      item.classList.add('is-selected');
      item.setAttribute('aria-selected', 'true');
    } else {
      item.setAttribute('aria-selected', 'false');
    }

    if (isDisabled) {
      item.classList.add('is-disabled');
      item.setAttribute('aria-disabled', 'true');
    }

    // Conteúdo da opção
    var contentWrapper = document.createElement('span');
    contentWrapper.className = 'dx-select-option-content';

    // Suporte a data-content (HTML customizado)
    var customContent = opt.getAttribute('data-content');
    if (customContent) {
      contentWrapper.innerHTML = customContent;
    } else {
      // Ícone ou emoji (data-icon)
      var icon = opt.getAttribute('data-icon');
      if (icon) {
        var iconSpan = document.createElement('span');
        iconSpan.className = 'dx-select-icon';
        iconSpan.textContent = icon + ' ';
        contentWrapper.appendChild(iconSpan);
      }

      // Texto principal
      var textSpan = document.createElement('span');
      textSpan.className = 'dx-select-option-text';
      textSpan.textContent = opt.textContent;
      contentWrapper.appendChild(textSpan);

      // Subtexto (data-subtext)
      var subtext = opt.getAttribute('data-subtext');
      if (subtext) {
        var subtextSpan = document.createElement('span');
        subtextSpan.className = 'dx-select-subtext';
        subtextSpan.textContent = subtext;
        contentWrapper.appendChild(subtextSpan);
      }
    }

    // Checkmark de seleção
    var checkSpan = document.createElement('span');
    checkSpan.className = 'dx-select-option-check';
    checkSpan.innerHTML = SVG_CHECK;

    item.appendChild(contentWrapper);
    item.appendChild(checkSpan);

    if (!isDisabled) {
      item.addEventListener('click', function (e) {
        e.stopPropagation();
        self._onOptionClick(opt.index);
      });

      item.addEventListener('mouseenter', function () {
        self._setActiveItem(self.itemElements.indexOf(item));
      });
    }

    this.list.appendChild(item);
    this.itemElements.push(item);
  };

  /**
   * Clique em uma opção
   */
  DexterSelect.prototype._onOptionClick = function (optionIndex) {
    var option = this.select.options[optionIndex];
    if (!option || option.disabled) return;

    if (this.isMultiple) {
      // Verifica limite máximo de opções antes de selecionar nova
      if (!option.selected && this.options.maxOptions) {
        var currentSelectedCount = Array.from(this.select.selectedOptions).length;
        if (currentSelectedCount >= this.options.maxOptions) {
          this._showMaxOptionsAlert();
          return;
        }
      }
      option.selected = !option.selected;
    } else {
      this.select.selectedIndex = optionIndex;
    }

    this._syncVisualState();
    this._updateControlText();
    this._checkMaxOptions();

    // Dispara eventos nativos
    var event = new Event('change', { bubbles: true });
    this.select.dispatchEvent(event);
    var inputEvent = new Event('input', { bubbles: true });
    this.select.dispatchEvent(inputEvent);

    if (!this.isMultiple) {
      this.close();
    }
  };

  /**
   * Sincroniza classes visuais dos itens
   */
  DexterSelect.prototype._syncVisualState = function () {
    var self = this;
    this.itemElements.forEach(function (item) {
      var idx = parseInt(item.getAttribute('data-index'), 10);
      var opt = self.select.options[idx];
      if (opt && opt.selected) {
        item.classList.add('is-selected');
        item.setAttribute('aria-selected', 'true');
      } else {
        item.classList.remove('is-selected');
        item.setAttribute('aria-selected', 'false');
      }
    });
  };

  /**
   * Atualiza o texto exibido no botão de controle
   */
  DexterSelect.prototype._updateControlText = function () {
    var selectedOptions = Array.from(this.select.selectedOptions);
    var totalOptions = Array.from(this.select.options).filter(function (o) {
      return o.getAttribute('data-divider') !== 'true';
    });

    if (selectedOptions.length === 0) {
      this.controlLabel.innerHTML = '<span class="text-muted">' + this.options.noneSelectedText + '</span>';
      return;
    }

    if (!this.isMultiple) {
      var opt = selectedOptions[0];
      var customContent = opt.getAttribute('data-content');
      if (customContent) {
        this.controlLabel.innerHTML = customContent;
      } else {
        var icon = opt.getAttribute('data-icon') ? opt.getAttribute('data-icon') + ' ' : '';
        var sub = opt.getAttribute('data-subtext') ? ' <span class="dx-select-subtext">' + opt.getAttribute('data-subtext') + '</span>' : '';
        this.controlLabel.innerHTML = icon + opt.textContent + sub;
      }
      return;
    }

    // Modo Múltiplo: Formatação configurável de contagem
    var format = this.options.selectedTextFormat;
    var countLimit = 0;
    var isCountMode = false;

    if (format === 'count') {
      isCountMode = true;
    } else if (format.indexOf('count >') === 0) {
      countLimit = parseInt(format.replace('count >', '').trim(), 10) || 0;
      if (selectedOptions.length > countLimit) {
        isCountMode = true;
      }
    }

    if (isCountMode) {
      var countStr = this.options.countSelectedText
        .replace('{0}', selectedOptions.length)
        .replace('{1}', totalOptions.length);
      this.controlLabel.textContent = countStr;
    } else {
      var titles = selectedOptions.map(function (o) {
        var icon = o.getAttribute('data-icon') ? o.getAttribute('data-icon') + ' ' : '';
        return icon + o.textContent.trim();
      });
      this.controlLabel.textContent = titles.join(', ');
    }
  };

  /**
   * Verifica se o limite máximo foi atingido e ajusta opções restantes
   */
  DexterSelect.prototype._checkMaxOptions = function () {
    if (!this.isMultiple || !this.options.maxOptions) return;

    var selectedCount = Array.from(this.select.selectedOptions).length;
    var maxReached = selectedCount >= this.options.maxOptions;

    this.itemElements.forEach(function (item) {
      var isSelected = item.classList.contains('is-selected');
      if (maxReached && !isSelected) {
        item.classList.add('is-disabled');
      } else if (!maxReached && !item.hasAttribute('data-disabled-init')) {
        item.classList.remove('is-disabled');
      }
    });

    if (maxReached) {
      this.maxOptionsNotice.textContent = 'Limite atingido (máx. ' + this.options.maxOptions + ' itens).';
      this.maxOptionsNotice.style.display = 'block';
    } else {
      this.maxOptionsNotice.style.display = 'none';
    }
  };

  DexterSelect.prototype._showMaxOptionsAlert = function () {
    var self = this;
    this.maxOptionsNotice.textContent = 'Você só pode selecionar até ' + this.options.maxOptions + ' itens!';
    this.maxOptionsNotice.style.display = 'block';
    this.maxOptionsNotice.style.animation = 'none';
    setTimeout(function () {
      self.maxOptionsNotice.style.animation = '';
    }, 10);
  };

  /**
   * Selecionar todos os itens (múltiplo)
   */
  DexterSelect.prototype.selectAll = function () {
    if (!this.isMultiple) return;

    var self = this;
    var count = 0;
    Array.from(this.select.options).forEach(function (opt) {
      if (!opt.disabled && opt.getAttribute('data-divider') !== 'true') {
        if (!self.options.maxOptions || count < self.options.maxOptions) {
          opt.selected = true;
          count++;
        }
      }
    });

    this._syncVisualState();
    this._updateControlText();
    this._checkMaxOptions();

    var event = new Event('change', { bubbles: true });
    this.select.dispatchEvent(event);
  };

  /**
   * Desmarcar todos os itens
   */
  DexterSelect.prototype.deselectAll = function () {
    Array.from(this.select.options).forEach(function (opt) {
      opt.selected = false;
    });

    this._syncVisualState();
    this._updateControlText();
    this._checkMaxOptions();

    var event = new Event('change', { bubbles: true });
    this.select.dispatchEvent(event);
  };

  /**
   * Obtém ou define o valor do select (compatível com jQuery .val())
   */
  DexterSelect.prototype.val = function (value) {
    if (value === undefined) {
      if (this.isMultiple) {
        return Array.from(this.select.selectedOptions).map(function (o) { return o.value; });
      }
      return this.select.value;
    }

    if (this.isMultiple && Array.isArray(value)) {
      Array.from(this.select.options).forEach(function (opt) {
        opt.selected = value.includes(opt.value);
      });
    } else {
      this.select.value = value;
    }

    this._syncVisualState();
    this._updateControlText();
    this._checkMaxOptions();

    var event = new Event('change', { bubbles: true });
    this.select.dispatchEvent(event);
  };

  DexterSelect.prototype._bindEvents = function () {
    var self = this;

    // Toggle ao clicar no controle
    this.control.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (!self.select.disabled) {
        self.toggle();
      }
    });

    // Teclado no controle
    this.control.addEventListener('keydown', function (e) {
      if (self.select.disabled) return;

      switch (e.key) {
        case 'ArrowDown':
        case 'Down':
          e.preventDefault();
          if (!self.isOpen) {
            self.open();
          } else {
            self._moveActive(1);
          }
          break;
        case 'ArrowUp':
        case 'Up':
          e.preventDefault();
          if (!self.isOpen) {
            self.open();
          } else {
            self._moveActive(-1);
          }
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (!self.isOpen) {
            self.open();
          } else if (self.activeIndex >= 0 && self.itemElements[self.activeIndex]) {
            var idx = parseInt(self.itemElements[self.activeIndex].getAttribute('data-index'), 10);
            self._onOptionClick(idx);
          }
          break;
        case 'Escape':
          if (self.isOpen) {
            e.preventDefault();
            self.close();
          }
          break;
        case 'Tab':
          if (self.isOpen) {
            self.close();
          }
          break;
      }
    });

    // Fechar ao clicar fora
    document.addEventListener('click', function (e) {
      if (self.isOpen && !self.wrapper.contains(e.target)) {
        self.close();
      }
    });

    // Sincronização externa
    this.select.addEventListener('change', function () {
      self._syncVisualState();
      self._updateControlText();
      self._checkMaxOptions();
    });

    // Reset em formulários
    if (this.select.form) {
      this.select.form.addEventListener('reset', function () {
        setTimeout(function () {
          self.render();
        }, 10);
      });
    }
  };

  DexterSelect.prototype.open = function () {
    if (this.isOpen || this.select.disabled) return;

    // Fecha outras instâncias abertas
    document.querySelectorAll('.dx-custom-select.is-open').forEach(function (el) {
      if (el._dxInstance) el._dxInstance.close();
    });

    this.wrapper.classList.add('is-open');
    this.control.setAttribute('aria-expanded', 'true');
    this.isOpen = true;
    this.wrapper._dxInstance = this;

    // Detecção inteligente de Dropup
    var rect = this.wrapper.getBoundingClientRect();
    var spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < 290 && rect.top > 290) {
      this.wrapper.classList.add('is-dropup');
    } else {
      this.wrapper.classList.remove('is-dropup');
    }

    if (this.searchInput) {
      this.searchInput.value = '';
      this._filterOptions('');
      this.searchInput.focus();
    } else {
      this.control.focus();
    }

    // Move foco para o primeiro item selecionado ou primeiro visível
    var selectedItem = this.list.querySelector('.dx-select-option.is-selected');
    if (selectedItem) {
      this._setActiveItem(this.itemElements.indexOf(selectedItem));
      selectedItem.scrollIntoView({ block: 'nearest' });
    }
  };

  DexterSelect.prototype.close = function () {
    if (!this.isOpen) return;

    this.wrapper.classList.remove('is-open', 'is-dropup');
    this.control.setAttribute('aria-expanded', 'false');
    this.isOpen = false;
    this.activeIndex = -1;
    this.control.focus();
  };

  DexterSelect.prototype.toggle = function () {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  };

  DexterSelect.prototype.refresh = function () {
    this.render();
  };

  DexterSelect.prototype.destroy = function () {
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
    this.select.classList.remove('dx-native-hidden');
    this.select.removeAttribute('tabindex');
    this.select.removeAttribute('aria-hidden');
    instances.delete(this.select);
    delete this.select._dexterSelect;
  };

  DexterSelect.prototype._setActiveItem = function (index) {
    this.activeIndex = index;
    this.itemElements.forEach(function (el, i) {
      if (i === index) {
        el.classList.add('is-focused');
      } else {
        el.classList.remove('is-focused');
      }
    });
  };

  DexterSelect.prototype._moveActive = function (direction) {
    var visibleItems = this.itemElements.filter(function (el) {
      return el.style.display !== 'none' && !el.classList.contains('is-disabled');
    });

    if (visibleItems.length === 0) return;

    var currentIdx = visibleItems.indexOf(this.itemElements[this.activeIndex]);
    var nextIdx = currentIdx + direction;

    if (nextIdx < 0) nextIdx = visibleItems.length - 1;
    if (nextIdx >= visibleItems.length) nextIdx = 0;

    var targetItem = visibleItems[nextIdx];
    this._setActiveItem(this.itemElements.indexOf(targetItem));
    targetItem.scrollIntoView({ block: 'nearest' });
  };

  DexterSelect.prototype._filterOptions = function (query) {
    var q = normalizeText(query);
    var visibleCount = 0;

    this.itemElements.forEach(function (item) {
      var text = normalizeText(item.textContent);
      if (!q || text.includes(q)) {
        item.style.display = 'flex';
        if (visibleCount % 2 === 1) {
          item.classList.add('dx-option-even');
          item.classList.remove('dx-option-odd');
        } else {
          item.classList.add('dx-option-odd');
          item.classList.remove('dx-option-even');
        }
        visibleCount++;
      } else {
        item.style.display = 'none';
      }
    });

    // Controla visibilidade de optgroups se todos os filhos foram ocultados
    var optgroups = this.list.querySelectorAll('.dx-select-optgroup-label');
    optgroups.forEach(function (label) {
      var next = label.nextElementSibling;
      var hasVisibleChild = false;
      while (next && !next.classList.contains('dx-select-optgroup-label')) {
        if (next.style.display !== 'none') {
          hasVisibleChild = true;
          break;
        }
        next = next.nextElementSibling;
      }
      label.style.display = hasVisibleChild ? 'block' : 'none';
    });

    if (visibleCount === 0) {
      this.noResults.style.display = 'block';
    } else {
      this.noResults.style.display = 'none';
    }
  };

  DexterSelect.prototype._handleSearchKeydown = function (e) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this._moveActive(1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this._moveActive(-1);
        break;
      case 'Enter':
        e.preventDefault();
        if (this.activeIndex >= 0 && this.itemElements[this.activeIndex]) {
          var idx = parseInt(this.itemElements[this.activeIndex].getAttribute('data-index'), 10);
          this._onOptionClick(idx);
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
    }
  };

  /**
   * Métodos estáticos
   */
  DexterSelect.getInstance = function (element) {
    return instances.get(element) || null;
  };

  DexterSelect.getOrCreateInstance = function (element, options) {
    return DexterSelect.getInstance(element) || new DexterSelect(element, options);
  };

  DexterSelect.initAll = function (selector) {
    var sel = selector || 'select.selectpicker, select[data-dx-select], select.form-select-striped, select.dx-select';
    var selects = document.querySelectorAll(sel);
    var list = [];
    selects.forEach(function (s) {
      if (!s.hasAttribute('data-dx-native') && !instances.has(s)) {
        list.push(new DexterSelect(s));
      }
    });
    return list;
  };

  // Auto-inicialização quando o DOM estiver pronto
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        DexterSelect.initAll();
      });
    } else {
      DexterSelect.initAll();
    }
  }

  return DexterSelect;
});
