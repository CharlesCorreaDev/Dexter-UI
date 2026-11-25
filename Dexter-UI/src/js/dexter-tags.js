/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-tags.js
 * @description [PT-BR] Controlador nativo zero-dependência para Tags, Badges, Chips e
 *              Seleção Múltipla com Autocomplete, inspirado e aprimorado a partir do
 *              bootstrap5-tags (github.com/lekoala/bootstrap5-tags).
 *              Permite transformar <select multiple> e <input> em campos interativos de tags,
 *              com navegação completa por teclado, sugestões em tempo real, badges personalizadas
 *              nas 28 cores oficiais, validação e Dark Mode.
 *              [EN]    Zero-dependency native controller for Tags, Badges, Chips and
 *              Autocomplete Multiselect, inspired and enhanced from
 *              bootstrap5-tags (github.com/lekoala/bootstrap5-tags).
 *              Transforms <select multiple> and <input> into interactive tag fields
 *              with keyboard navigation, live suggestions, custom badges in 28 official colors,
 *              validation, and native Dark Mode.
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

  // Ícone SVG de limpar tudo
  var ICON_CLEAR = '<svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"></path></svg>';

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
   * Classe principal do DexterTags
   */
  function DexterTags(element, options) {
    if (!element) return;
    if (element._dexterTagsInstance) {
      return element._dexterTagsInstance;
    }

    this.el = element;
    this.isSelect = element.tagName.toLowerCase() === 'select';
    this.isMultiple = this.isSelect ? element.multiple : true;

    // Configurações e opções com herança de atributos data-*
    var colorAttr = element.getAttribute('data-dx-color') || '';
    var allowNewAttr = element.getAttribute('data-allow-new');
    var maxAttr = element.getAttribute('data-max');
    var clearAttr = element.getAttribute('data-clear');
    var pillAttr = element.getAttribute('data-pill');
    var styleAttr = element.getAttribute('data-badge-style');
    var placeholderAttr = element.getAttribute('placeholder') || element.getAttribute('data-placeholder') || '';
    var duplicateAttr = element.getAttribute('data-duplicate');
    var separatorAttr = element.getAttribute('data-separator');
    var transformAttr = element.getAttribute('data-transform') || '';

    var allowDuplicates = false;
    if (options && options.duplicate !== undefined) {
      allowDuplicates = options.duplicate;
    } else if (duplicateAttr !== null) {
      allowDuplicates = duplicateAttr === 'true';
    } else if (options && options.allowDuplicates !== undefined) {
      allowDuplicates = options.allowDuplicates;
    }

    var separators = [',', 'Enter'];
    var customSep = (options && (options.separator || options.separators)) || separatorAttr;
    if (customSep) {
      if (Array.isArray(customSep)) {
        separators = customSep;
      } else {
        separators = [customSep, 'Enter'];
      }
    }

    // Função de transformação (lowercase, uppercase, hashtag, slug ou custom)
    var transformFn = null;
    if (options && typeof options.transform === 'function') {
      transformFn = options.transform;
    } else if (transformAttr === 'lowercase') {
      transformFn = function (val) { return val.toLowerCase(); };
    } else if (transformAttr === 'uppercase') {
      transformFn = function (val) { return val.toUpperCase(); };
    } else if (transformAttr === 'hashtag') {
      transformFn = function (val) { return val.startsWith('#') ? val : '#' + val.replace(/\s+/g, ''); };
    } else if (transformAttr === 'slug') {
      transformFn = function (val) { return val.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9_-]/g, ''); };
    }

    this.transformFn = transformFn;

    this.options = Object.assign({
      allowNew: allowNewAttr !== null ? allowNewAttr === 'true' : true,
      allowDuplicates: allowDuplicates,
      max: maxAttr ? parseInt(maxAttr, 10) : null,
      clear: clearAttr !== null ? clearAttr === 'true' : true,
      pill: pillAttr === 'true',
      badgeStyle: styleAttr || 'soft', // 'soft', 'solid', 'outline'
      color: colorAttr || 'primary',
      placeholder: placeholderAttr,
      separators: separators,
      addOnBlur: true,
      searchMinChars: 0,
      suggestions: [],
      onTagAdd: null,
      onTagRemove: null,
      onChange: null
    }, options || {});

    this.tags = [];
    this.suggestions = [];
    this.activeIndex = -1;

    this._init();
    element._dexterTagsInstance = this;
  }

  DexterTags.prototype._init = function () {
    var self = this;

    // 1. Oculta o elemento nativo preservando formulário
    this.el.style.display = 'none';
    this.el.setAttribute('aria-hidden', 'true');
    this.el.tabIndex = -1;

    // 2. Cria a estrutura do componente
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'form-tags-wrapper';

    this.container = document.createElement('div');
    this.container.className = 'form-tags';
    if (this.options.color) {
      this.container.classList.add('form-tags-' + this.options.color);
    }
    if (this.options.badgeStyle === 'solid') {
      this.container.classList.add('tags-solid');
    } else if (this.options.badgeStyle === 'outline') {
      this.container.classList.add('tags-outline');
    }

    // Copia classes de tamanho ou validação do elemento original
    if (this.el.classList.contains('form-tags-sm') || this.el.classList.contains('form-control-sm') || this.el.classList.contains('input-sm')) {
      this.container.classList.add('form-tags-sm');
    }
    if (this.el.classList.contains('form-tags-lg') || this.el.classList.contains('form-control-lg') || this.el.classList.contains('input-lg')) {
      this.container.classList.add('form-tags-lg');
    }
    if (this.el.classList.contains('is-valid')) this.container.classList.add('is-valid');
    if (this.el.classList.contains('is-invalid')) this.container.classList.add('is-invalid');
    if (this.el.disabled) this.container.classList.add('is-disabled');

    // 3. Input de busca / inserção inline
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.className = 'form-tags-input';
    this.input.autocomplete = 'off';
    this.input.placeholder = this.options.placeholder || 'Adicionar tags...';
    if (this.el.disabled) this.input.disabled = true;

    // 4. Menu de sugestões dropdown
    this.menu = document.createElement('ul');
    this.menu.className = 'form-tags-menu';
    this.menu.setAttribute('role', 'listbox');

    // 5. Botão de limpar tudo
    if (this.options.clear) {
      this.clearBtn = document.createElement('button');
      this.clearBtn.type = 'button';
      this.clearBtn.className = 'form-tags-clear';
      this.clearBtn.title = 'Limpar tags';
      this.clearBtn.innerHTML = ICON_CLEAR;
      this.clearBtn.style.display = 'none';
      this.clearBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        self.clear();
        self.input.focus();
      });
    }

    // 6. Contador se limite max estiver definido
    if (this.options.max) {
      this.countBadge = document.createElement('span');
      this.countBadge.className = 'form-tags-count';
      this._updateCount();
    }

    // Monta no DOM
    this.container.appendChild(this.input);
    if (this.clearBtn) this.container.appendChild(this.clearBtn);
    if (this.countBadge) this.container.appendChild(this.countBadge);

    this.wrapper.appendChild(this.container);
    this.wrapper.appendChild(this.menu);

    this.el.parentNode.insertBefore(this.wrapper, this.el.nextSibling);

    // 7. Extrai tags iniciais e sugestões
    this._loadInitialData();

    // 8. Event listeners
    this._bindEvents();
  };

  /**
   * Carrega dados iniciais do select ou input
   */
  DexterTags.prototype._loadInitialData = function () {
    var self = this;

    if (this.isSelect) {
      var options = Array.from(this.el.options);
      options.forEach(function (opt) {
        var val = opt.value;
        var text = opt.text;
        var color = opt.getAttribute('data-color') || opt.getAttribute('data-dx-color') || null;

        // Guarda em sugestões se tiver valor
        if (val) {
          self.suggestions.push({
            value: val,
            label: text || val,
            color: color
          });
        }

        // Se estiver selecionado, adiciona como tag
        if (opt.selected && val) {
          self.addTag(val, text || val, color, true);
        }
      });
    } else {
      // Input textual ou hidden
      var initialVal = this.el.value || this.el.getAttribute('data-initial-value') || '';
      if (initialVal) {
        var parts = initialVal.split(',');
        parts.forEach(function (part) {
          var clean = part.trim();
          if (clean) self.addTag(clean, clean, null, true);
        });
      }

      // Sugestões passadas via atributo data-suggestions='["A", "B"]'
      var dataSug = this.el.getAttribute('data-suggestions');
      if (dataSug) {
        try {
          var parsed = JSON.parse(dataSug);
          if (Array.isArray(parsed)) {
            parsed.forEach(function (item) {
              if (typeof item === 'string') {
                self.suggestions.push({ value: item, label: item });
              } else if (item && item.value) {
                self.suggestions.push(item);
              }
            });
          }
        } catch (e) {
          // parse silently
        }
      }
    }

    // Sugestões passadas via opções JavaScript
    if (Array.isArray(this.options.suggestions) && this.options.suggestions.length) {
      this.options.suggestions.forEach(function (item) {
        if (typeof item === 'string') {
          self.suggestions.push({ value: item, label: item });
        } else if (item && item.value) {
          self.suggestions.push(item);
        }
      });
    }

    this._updateClearBtn();
  };

  /**
   * Vincula eventos de teclado, foco, clique e redimensionamento
   */
  DexterTags.prototype._bindEvents = function () {
    var self = this;

    // Foco no container transfere foco para o input
    this.container.addEventListener('click', function (e) {
      if (e.target !== self.input && !e.target.closest('.form-tag-remove') && !e.target.closest('.form-tags-clear')) {
        self.input.focus();
      }
    });

    // Foco e desfoque do input
    this.input.addEventListener('focus', function () {
      self.container.classList.add('is-focused');
      self._filterSuggestions();
    });

    this.input.addEventListener('blur', function () {
      // Timeout para permitir clique nas sugestões
      setTimeout(function () {
        self.container.classList.remove('is-focused');
        self._hideMenu();
        if (self.options.addOnBlur && self.input.value.trim() && self.options.allowNew) {
          self.addTag(self.input.value.trim());
          self.input.value = '';
        }
      }, 200);
    });

    // Digitação e busca
    this.input.addEventListener('input', function () {
      self._filterSuggestions();
    });

    // Colagem múltipla (paste) inspirada no tagin
    this.input.addEventListener('paste', function (e) {
      var pasteData = (e.clipboardData || window.clipboardData).getData('text');
      if (!pasteData) return;

      var hasSpaceSep = self.options.separators.indexOf(' ') !== -1;
      var sepRegex = hasSpaceSep ? /[\s,;\n\t\r]+/ : /[,;\n\t\r]+/;

      if (sepRegex.test(pasteData)) {
        e.preventDefault();
        var parts = pasteData.split(sepRegex);
        parts.forEach(function (part) {
          var clean = part.trim();
          if (clean) self.addTag(clean);
        });
        self.input.value = '';
        self._filterSuggestions();
      }
    });

    // Navegação por teclado
    this.input.addEventListener('keydown', function (e) {
      var key = e.key;

      // 1. Backspace remove a última tag se o input estiver vazio
      if (key === 'Backspace' && !self.input.value && self.tags.length > 0) {
        var lastTag = self.tags[self.tags.length - 1];
        self.removeTag(lastTag.value);
        self._filterSuggestions();
        return;
      }

      // 2. Seta para baixo / para cima no menu de sugestões
      if (key === 'ArrowDown') {
        e.preventDefault();
        self._navigateSuggestions(1);
        return;
      }
      if (key === 'ArrowUp') {
        e.preventDefault();
        self._navigateSuggestions(-1);
        return;
      }

      // 3. Escape fecha o menu
      if (key === 'Escape') {
        self._hideMenu();
        return;
      }

      // 4. Enter ou separadores para adicionar tag ou selecionar sugestão
      var isSeparator = self.options.separators.indexOf(key) !== -1 || (key === ',' && self.options.separators.indexOf(',') !== -1);
      if (isSeparator || key === 'Enter') {
        // Se houver uma sugestão ativa destacada
        if (self.activeIndex >= 0 && self.filteredSuggestions && self.filteredSuggestions[self.activeIndex]) {
          e.preventDefault();
          var selectedSug = self.filteredSuggestions[self.activeIndex];
          self.addTag(selectedSug.value, selectedSug.label, selectedSug.color);
          self.input.value = '';
          self._filterSuggestions();
          return;
        }

        // Se permitir novas tags livres e houver texto digitado
        if (self.input.value.trim()) {
          e.preventDefault();
          if (self.options.allowNew) {
            self.addTag(self.input.value.trim());
            self.input.value = '';
            self._filterSuggestions();
          }
        }
      }
    });

    // Clique fora fecha o menu
    document.addEventListener('click', function (e) {
      if (!self.wrapper.contains(e.target)) {
        self._hideMenu();
      }
    });
  };

  /**
   * Adiciona uma tag
   */
  DexterTags.prototype.addTag = function (value, label, color, isSilent) {
    var cleanVal = String(value).trim();
    if (!cleanVal) return false;

    // Aplica função de transformação (lowercase, uppercase, hashtag, slug, etc.)
    if (typeof this.transformFn === 'function') {
      cleanVal = this.transformFn(cleanVal);
    }

    label = label ? String(label).trim() : cleanVal;
    if (typeof this.transformFn === 'function' && label === value) {
      label = cleanVal;
    }

    // Checa duplicação se não permitido
    if (!this.options.allowDuplicates) {
      var exists = this.tags.some(function (t) { return t.value.toLowerCase() === cleanVal.toLowerCase(); });
      if (exists) {
        this._flashTag(cleanVal);
        return false;
      }
    }

    // Checa limite máximo
    if (this.options.max && this.tags.length >= this.options.max) {
      if (this.countBadge) {
        this.countBadge.classList.add('is-full');
      }
      return false;
    }

    var tagData = {
      value: cleanVal,
      label: label,
      color: color || null
    };

    this.tags.push(tagData);

    // Cria elemento no DOM
    var tagEl = document.createElement('span');
    tagEl.className = 'form-tag-item';
    tagEl.setAttribute('data-value', cleanVal);
    tagEl.setAttribute('title', 'Clique duplo para editar');
    if (this.options.pill) tagEl.classList.add('tag-pill');

    if (color) {
      tagEl.classList.add('badge-' + color);
    }

    var textSpan = document.createElement('span');
    textSpan.textContent = label;
    tagEl.appendChild(textSpan);

    var removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'form-tag-remove';
    removeBtn.setAttribute('aria-label', 'Remover tag ' + label);
    removeBtn.innerHTML = ICON_CLOSE;

    var self = this;
    removeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      self.removeTag(cleanVal);
      self.input.focus();
    });

    // Edição rápida com duplo clique (recoloca o texto no input)
    tagEl.addEventListener('dblclick', function (e) {
      if (self.el.disabled) return;
      e.preventDefault();
      e.stopPropagation();
      var oldVal = cleanVal;
      self.removeTag(oldVal);
      self.input.value = oldVal;
      self.input.focus();
    });

    tagEl.appendChild(removeBtn);

    // Insere antes do input
    this.container.insertBefore(tagEl, this.input);

    this._syncNative();
    this._updateClearBtn();
    this._updateCount();

    if (!isSilent) {
      if (typeof this.options.onTagAdd === 'function') {
        this.options.onTagAdd(tagData, this.tags);
      }
      if (typeof this.options.onChange === 'function') {
        this.options.onChange(this.tags);
      }
    }

    return true;
  };

  /**
   * Efeito visual caso tente inserir duplicata
   */
  DexterTags.prototype._flashTag = function (value) {
    var tagEl = this.container.querySelector('.form-tag-item[data-value="' + CSS.escape(value) + '"]');
    if (tagEl) {
      tagEl.style.transform = 'scale(1.15)';
      tagEl.style.transition = 'transform 120ms ease';
      setTimeout(function () {
        tagEl.style.transform = 'scale(1)';
      }, 150);
    }
  };

  /**
   * Remove uma tag por valor
   */
  DexterTags.prototype.removeTag = function (value) {
    var cleanVal = String(value).trim();
    var idx = -1;
    for (var i = 0; i < this.tags.length; i++) {
      if (this.tags[i].value === cleanVal) {
        idx = i;
        break;
      }
    }

    if (idx === -1) return false;

    var removed = this.tags.splice(idx, 1)[0];

    // Remove do DOM
    var tagEl = this.container.querySelector('.form-tag-item[data-value="' + CSS.escape(cleanVal) + '"]');
    if (tagEl) {
      tagEl.parentNode.removeChild(tagEl);
    }

    this._syncNative();
    this._updateClearBtn();
    this._updateCount();

    if (typeof this.options.onTagRemove === 'function') {
      this.options.onTagRemove(removed, this.tags);
    }
    if (typeof this.options.onChange === 'function') {
      this.options.onChange(this.tags);
    }

    return true;
  };

  /**
   * Limpa todas as tags
   */
  DexterTags.prototype.clear = function () {
    var self = this;
    var allItems = this.container.querySelectorAll('.form-tag-item');
    allItems.forEach(function (el) {
      el.parentNode.removeChild(el);
    });

    this.tags = [];
    this.input.value = '';
    this._syncNative();
    this._updateClearBtn();
    this._updateCount();

    if (typeof this.options.onChange === 'function') {
      this.options.onChange(this.tags);
    }
  };

  /**
   * Atualiza a visibilidade do botão de limpar
   */
  DexterTags.prototype._updateClearBtn = function () {
    if (!this.clearBtn) return;
    this.clearBtn.style.display = this.tags.length > 0 ? 'inline-flex' : 'none';
  };

  /**
   * Atualiza badge de limite
   */
  DexterTags.prototype._updateCount = function () {
    if (!this.countBadge || !this.options.max) return;
    this.countBadge.textContent = this.tags.length + '/' + this.options.max;
    if (this.tags.length >= this.options.max) {
      this.countBadge.classList.add('is-full');
      this.input.placeholder = 'Limite atingido';
    } else {
      this.countBadge.classList.remove('is-full');
      this.input.placeholder = this.options.placeholder || 'Adicionar tags...';
    }
  };

  /**
   * Sincroniza estado com o elemento HTML nativo
   */
  DexterTags.prototype._syncNative = function () {
    var self = this;
    var currentValues = this.tags.map(function (t) { return t.value; });

    if (this.isSelect) {
      // Sincroniza options
      var existingOptions = Array.from(this.el.options);

      // Marca como selecionado ou desmarcado
      existingOptions.forEach(function (opt) {
        opt.selected = currentValues.indexOf(opt.value) !== -1;
      });

      // Se permitiu nova tag e ela não existe no select nativo, cria nova option
      currentValues.forEach(function (val) {
        var optExists = existingOptions.some(function (opt) { return opt.value === val; });
        if (!optExists) {
          var newOpt = new Option(val, val, true, true);
          self.el.add(newOpt);
        }
      });
    } else {
      // Input text ou hidden
      this.el.value = currentValues.join(',');
    }

    // Dispara eventos nativos para listeners externos
    var changeEvt = new Event('change', { bubbles: true });
    var inputEvt = new Event('input', { bubbles: true });
    this.el.dispatchEvent(changeEvt);
    this.el.dispatchEvent(inputEvt);
  };

  /**
   * Filtra e renderiza sugestões no dropdown
   */
  DexterTags.prototype._filterSuggestions = function () {
    var self = this;
    var query = this.input.value.trim().toLowerCase();

    // Se atingiu limite max, não abre
    if (this.options.max && this.tags.length >= this.options.max) {
      this._hideMenu();
      return;
    }

    var selectedVals = this.tags.map(function (t) { return t.value.toLowerCase(); });

    // Filtra sugestões que já não foram selecionadas
    var filtered = this.suggestions.filter(function (s) {
      if (selectedVals.indexOf(s.value.toLowerCase()) !== -1) {
        return false;
      }
      if (!query) return true;
      return s.label.toLowerCase().indexOf(query) !== -1 || s.value.toLowerCase().indexOf(query) !== -1;
    });

    this.filteredSuggestions = filtered;
    this.activeIndex = -1;
    this.menu.innerHTML = '';

    if (filtered.length === 0 && !query) {
      this._hideMenu();
      return;
    }

    if (filtered.length > 0) {
      filtered.forEach(function (item, index) {
        var li = document.createElement('li');
        li.className = 'form-tags-item';
        li.setAttribute('role', 'option');
        li.setAttribute('data-index', index);

        // Highlight do texto pesquisado
        var labelHtml = escapeHtml(item.label);
        if (query) {
          var reg = new RegExp('(' + query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + ')', 'gi');
          labelHtml = labelHtml.replace(reg, '<span class="form-tags-highlight">$1</span>');
        }

        var labelSpan = document.createElement('span');
        labelSpan.innerHTML = labelHtml;
        li.appendChild(labelSpan);

        if (item.badge) {
          var badgeSpan = document.createElement('span');
          badgeSpan.className = 'form-tags-item-badge';
          badgeSpan.textContent = item.badge;
          li.appendChild(badgeSpan);
        }

        li.addEventListener('mousedown', function (e) {
          e.preventDefault();
          self.addTag(item.value, item.label, item.color);
          self.input.value = '';
          self._filterSuggestions();
          self.input.focus();
        });

        self.menu.appendChild(li);
      });
    }

    // Se houver texto digitado e permitir nova tag que ainda não está nas sugestões
    if (query && self.options.allowNew) {
      var isExactMatch = filtered.some(function (f) { return f.label.toLowerCase() === query; });
      if (!isExactMatch) {
        var createLi = document.createElement('li');
        createLi.className = 'form-tags-item form-tags-create-new';
        createLi.setAttribute('role', 'option');
        createLi.innerHTML = '<span>Criar tag: <strong>' + escapeHtml(self.input.value.trim()) + '</strong></span>';

        createLi.addEventListener('mousedown', function (e) {
          e.preventDefault();
          self.addTag(self.input.value.trim());
          self.input.value = '';
          self._filterSuggestions();
          self.input.focus();
        });

        self.menu.appendChild(createLi);
      }
    }

    if (this.menu.children.length > 0) {
      this.menu.classList.add('show');
    } else {
      this._hideMenu();
    }
  };

  /**
   * Navega pelas opções com setas do teclado
   */
  DexterTags.prototype._navigateSuggestions = function (direction) {
    var items = this.menu.querySelectorAll('.form-tags-item');
    if (!items.length) return;

    items.forEach(function (el) { el.classList.remove('is-active'); });

    this.activeIndex += direction;
    if (this.activeIndex >= items.length) {
      this.activeIndex = 0;
    } else if (this.activeIndex < 0) {
      this.activeIndex = items.length - 1;
    }

    var activeEl = items[this.activeIndex];
    if (activeEl) {
      activeEl.classList.add('is-active');
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  };

  /**
   * Oculta o menu de sugestões
   */
  DexterTags.prototype._hideMenu = function () {
    this.menu.classList.remove('show');
    this.activeIndex = -1;
  };

  /**
   * Retorna os objetos de tags atuais
   */
  DexterTags.prototype.getTags = function () {
    return this.tags.slice();
  };

  /**
   * Retorna os valores em string ou array
   */
  DexterTags.prototype.getValues = function () {
    return this.tags.map(function (t) { return t.value; });
  };

  /**
   * Define nova lista de sugestões
   */
  DexterTags.prototype.setSuggestions = function (list) {
    if (Array.isArray(list)) {
      this.suggestions = list.map(function (item) {
        return typeof item === 'string' ? { value: item, label: item } : item;
      });
      this._filterSuggestions();
    }
  };

  /**
   * Destrói a instância e restaura o elemento original
   */
  DexterTags.prototype.destroy = function () {
    if (this.wrapper && this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
    this.el.style.display = '';
    this.el.removeAttribute('aria-hidden');
    this.el.tabIndex = 0;
    delete this.el._dexterTagsInstance;
  };

  /**
   * ---------------------------------------------------------------------------
   * Bootstrap Tag Input (More-Than-Solitaire/bootstrap-tag-input) Compatibility
   * ---------------------------------------------------------------------------
   * Inicializa elementos <div class="tags-input"> no DOM
   * @param {String[]} tagsList (opcional) Lista inicial de tags para adicionar
   * @returns {Object} Dicionário com instâncias e método .reset()
   */
  function initTags(tagsList) {
    tagsList = Array.isArray(tagsList) ? tagsList : [];
    var tagElements = {};

    if (typeof document === 'undefined') return tagElements;

    var allTagDivs = document.querySelectorAll('.tags-input');
    Array.prototype.forEach.call(allTagDivs, function (tagDiv) {
      if (tagDiv._tagsInputInitialized) {
        if (tagDiv.id) tagElements[tagDiv.id] = tagDiv;
        return;
      }
      tagDiv._tagsInputInitialized = true;

      var SplitChars = /[,;]/;
      if (tagDiv.dataset.splitchars != null) {
        try {
          SplitChars = new RegExp(tagDiv.dataset.splitchars);
        } catch (err) {
          SplitChars = /[,;]/;
        }
      }

      var tags = [];

      // Local onde o usuário digita
      var mainInput = tagDiv.querySelector('.main-input');
      if (!mainInput) {
        mainInput = document.createElement('span');
        mainInput.classList.add('main-input');
        mainInput.contentEditable = 'true';
        tagDiv.appendChild(mainInput);
      } else {
        mainInput.contentEditable = 'true';
      }

      // Input oculto onde os dados reais são armazenados
      var hiddenInput = tagDiv.querySelector('input[type="hidden"]');
      if (!hiddenInput) {
        hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        if (tagDiv.dataset.name) {
          hiddenInput.name = tagDiv.dataset.name;
        }
        tagDiv.appendChild(hiddenInput);
      }

      // Descobre a classe de cor da tag
      var tagColorClass = 'text-bg-secondary';
      var classes = tagDiv.className.split(/\s+/);
      for (var i = 0; i < classes.length; i++) {
        var cls = classes[i];
        if (cls.indexOf('tag-bg-') === 0) {
          tagColorClass = cls; // Suporta tag-bg-success, tag-bg-indigo, etc.
          break;
        }
      }

      tagDiv.filterTag = function (tag) {
        return (tag || '').replace(/[\n\t]/g, '').trim();
      };

      tagDiv.refreshTags = function () {
        var list = tags.map(function (t) { return t.text; });
        hiddenInput.value = list.join(',');
        tagDiv.dispatchEvent(new CustomEvent('change', { bubbles: true, detail: { tags: list } }));
        return tagDiv;
      };

      tagDiv.addTag = function (text) {
        text = tagDiv.filterTag(text);
        if (!text) return tagDiv;

        var tag = {
          text: text,
          element: document.createElement('span')
        };

        tag.element.className = 'tag badge ' + tagColorClass;
        tag.element.contentEditable = 'false';
        tag.element.textContent = tag.text;

        var closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>';

        closeBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          var idx = tags.indexOf(tag);
          if (idx !== -1) {
            tagDiv.removeTag(idx);
          }
        });

        tag.element.appendChild(closeBtn);
        tags.push(tag);
        tagDiv.insertBefore(tag.element, mainInput);
        tagDiv.refreshTags();
        return tagDiv;
      };

      tagDiv.addTags = function (list) {
        if (Array.isArray(list)) {
          list.forEach(function (item) { tagDiv.addTag(item); });
        }
        return tagDiv;
      };

      tagDiv.removeTag = function (index) {
        if (index >= 0 && index < tags.length) {
          var tag = tags[index];
          tags.splice(index, 1);
          if (tag.element && tag.element.parentNode) {
            tag.element.parentNode.removeChild(tag.element);
          }
          tagDiv.refreshTags();
        }
        return tagDiv;
      };

      tagDiv.resetTags = function () {
        tags.forEach(function (t) {
          if (t.element && t.element.parentNode) {
            t.element.parentNode.removeChild(t.element);
          }
        });
        tags = [];
        tagDiv.refreshTags();
        return tagDiv;
      };

      tagDiv.getValue = function () {
        return hiddenInput.value;
      };

      // Eventos de teclado e inserção
      tagDiv.addEventListener('click', function () {
        mainInput.focus();
      });

      tagDiv.addEventListener('paste', function (e) {
        e.preventDefault();
        var pasteText = (e.clipboardData || window.clipboardData).getData('text');
        var parts = pasteText.split(SplitChars);
        parts.forEach(function (part) {
          var filtered = tagDiv.filterTag(part);
          if (filtered) tagDiv.addTag(filtered);
        });
      });

      mainInput.addEventListener('input', function () {
        var text = mainInput.innerText;
        var parts = text.split(SplitChars);
        if (parts.length > 1) {
          var leftovers = parts.pop();
          parts.forEach(function (part) {
            var filtered = tagDiv.filterTag(part);
            if (filtered) tagDiv.addTag(filtered);
          });
          mainInput.innerText = leftovers;
        }
      });

      mainInput.addEventListener('keydown', function (e) {
        var keyCode = e.which || e.keyCode;
        if (keyCode === 8) { // Backspace
          if (!mainInput.innerText.trim() && tags.length > 0) {
            e.preventDefault();
            tagDiv.removeTag(tags.length - 1);
          }
        } else if (keyCode === 13) { // Enter
          e.preventDefault();
          var text = tagDiv.filterTag(mainInput.innerText);
          if (text) {
            tagDiv.addTag(text);
            mainInput.innerText = '';
          }
        }
      });

      // Se havia tags pré-existentes na lista inicial
      tagsList.forEach(function (item) {
        tagDiv.addTag(item);
      });

      if (tagDiv.id) {
        tagElements[tagDiv.id] = tagDiv;
      }
    });

    tagElements.reset = function () {
      for (var key in tagElements) {
        if (key !== 'reset' && typeof tagElements[key].resetTags === 'function') {
          tagElements[key].resetTags();
        }
      }
    };

    return tagElements;
  }

  /**
   * Inicialização automática (compatível com DexterTags, Tagin e Bootstrap Tag Input)
   */
  DexterTags.initAll = function () {
    initTags();
    var elements = document.querySelectorAll('select[data-dx-tags], input[data-dx-tags], select.form-tags, input.form-tags, input.tagin, .tagin, input[data-role="tagsinput"], [data-dx-tagsinput]');
    Array.prototype.forEach.call(elements, function (el) {
      if (!el._dexterTagsInstance && !el.classList.contains('tags-input')) {
        new DexterTags(el);
      }
    });
  };

  // Auto-init no DOMContentLoaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', DexterTags.initAll);
    } else {
      DexterTags.initAll();
    }
  }

  // Exportação UMD / Global (com alias Tagin e initTags para migração transparente)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DexterTags;
    module.exports.Tagin = DexterTags;
    module.exports.initTags = initTags;
  } else {
    global.DexterTags = DexterTags;
    global.Tagin = DexterTags;
    global.initTags = initTags;
    global.dexter = global.dexter || {};
    global.dexter.Tags = DexterTags;
    global.dexter.initTags = initTags;
  }

})(typeof window !== 'undefined' ? window : this);
