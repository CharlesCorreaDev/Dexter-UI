/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-rating.js
 * @description [PT-BR] Controlador nativo zero-dependência para Avaliação por Estrelas
 *              (Star Rating & Fractional Reviews), inspirado e aprimorado a partir do
 *              Krajee Bootstrap Star Rating (github.com/kartik-v/bootstrap-star-rating).
 *              Converte nativamente campos <input> numéricos em widgets de avaliação visual
 *              com suporte a frações (meias estrelas ou precisão contínua), símbolos vetoriais
 *              (estrelas, corações, polegares), botão de limpeza, legendas reativas, navegação
 *              completa por teclado, todas as 28 cores oficiais e Dark Mode.
 *              [EN]    Zero-dependency native controller for Star Rating & Fractional Reviews,
 *              inspired and enhanced from Krajee Bootstrap Star Rating (github.com/kartik-v/bootstrap-star-rating).
 *              Transforms numeric <input> elements into interactive rating widgets with
 *              fractional stars, vector SVG symbols (stars, hearts, thumbs), clear button,
 *              dynamic captions, full keyboard accessibility, 28 official colors, and Dark Mode.
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

  // Símbolos SVG vetorizados
  var ICONS = {
    star: '<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
    thumb: '<svg viewBox="0 0 24 24"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>',
    circle: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>',
    clear: '<svg viewBox="0 0 16 16"><path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/></svg>'
  };

  // Legendas padrão correspondentes a notas de 1 a 5
  var DEFAULT_CAPTIONS = {
    0.5: 'Péssimo',
    1: 'Péssimo',
    1.5: 'Muito Ruim',
    2: 'Ruim',
    2.5: 'Regular',
    3: 'Regular',
    3.5: 'Bom',
    4: 'Muito Bom',
    4.5: 'Excelente',
    5: 'Espetacular'
  };

  /**
   * Construtor do componente DexterRating
   */
  function DexterRating(element, options) {
    if (!element) return;
    if (element._dexterRatingInstance) {
      return element._dexterRatingInstance;
    }

    this.el = element;

    // Resgata configurações de atributos HTML
    var minAttr = element.getAttribute('min');
    var maxAttr = element.getAttribute('max');
    var stepAttr = element.getAttribute('step');
    var starsAttr = element.getAttribute('data-stars');
    var colorAttr = element.getAttribute('data-dx-color') || element.getAttribute('data-color');
    var sizeAttr = element.getAttribute('data-size');
    var symbolAttr = element.getAttribute('data-symbol');
    var showClearAttr = element.getAttribute('data-show-clear');
    var showCaptionAttr = element.getAttribute('data-show-caption');
    var readonlyAttr = element.hasAttribute('readonly') || element.getAttribute('data-readonly') === 'true';
    var disabledAttr = element.disabled;

    this.options = Object.assign({
      min: minAttr !== null ? parseFloat(minAttr) : 0,
      max: maxAttr !== null ? parseFloat(maxAttr) : 5,
      step: stepAttr !== null ? parseFloat(stepAttr) : 0.5,
      stars: starsAttr !== null ? parseInt(starsAttr, 10) : 5,
      symbol: symbolAttr || 'star', // 'star', 'heart', 'thumb', 'circle'
      color: colorAttr || 'gold',
      size: sizeAttr || 'md', // 'xs', 'sm', 'md', 'lg', 'xl'
      showClear: showClearAttr !== null ? showClearAttr === 'true' : true,
      showCaption: showCaptionAttr !== null ? showCaptionAttr === 'true' : true,
      readonly: readonlyAttr,
      disabled: disabledAttr,
      starCaptions: DEFAULT_CAPTIONS,
      clearCaption: 'Sem avaliação',
      onRate: null,
      onClear: null,
      onChange: null
    }, options || {});

    // Valor inicial
    var val = parseFloat(element.value);
    this.value = isNaN(val) ? this.options.min : Math.min(this.options.max, Math.max(this.options.min, val));

    this._init();
    element._dexterRatingInstance = this;
  }

  DexterRating.prototype._init = function () {
    var self = this;

    // 1. Oculta o input nativo preservando valor e envio de formulário
    this.el.style.display = 'none';
    this.el.setAttribute('aria-hidden', 'true');
    this.el.tabIndex = -1;

    // 2. Contêiner principal
    this.container = document.createElement('div');
    this.container.className = 'rating-container rating-' + this.options.size;
    if (this.options.color) {
      this.container.classList.add('rating-' + this.options.color);
    }
    if (this.options.readonly) {
      this.container.classList.add('rating-readonly');
    }
    if (this.options.disabled) {
      this.container.classList.add('rating-disabled');
    }

    // 3. Botão de limpeza
    if (this.options.showClear && !this.options.readonly) {
      this.clearBtn = document.createElement('button');
      this.clearBtn.type = 'button';
      this.clearBtn.className = 'rating-clear';
      this.clearBtn.title = 'Limpar avaliação';
      this.clearBtn.innerHTML = ICONS.clear;
      this.clearBtn.addEventListener('click', function (e) {
        e.preventDefault();
        self.clear();
      });
      this.container.appendChild(this.clearBtn);
    }

    // 4. Estrutura de estrelas (Vazias + Preenchidas)
    this.starsWrapper = document.createElement('div');
    this.starsWrapper.className = 'rating-stars';
    this.starsWrapper.tabIndex = this.options.readonly || this.options.disabled ? -1 : 0;
    this.starsWrapper.setAttribute('role', 'slider');
    this.starsWrapper.setAttribute('aria-valuemin', this.options.min);
    this.starsWrapper.setAttribute('aria-valuemax', this.options.max);
    this.starsWrapper.setAttribute('aria-valuenow', this.value);

    // Camada vazia
    this.emptyLayer = document.createElement('div');
    this.emptyLayer.className = 'rating-empty';

    // Camada preenchida (com overflow hidden)
    this.filledLayer = document.createElement('div');
    this.filledLayer.className = 'rating-filled';

    var symbolSvg = ICONS[this.options.symbol] || ICONS.star;

    for (var i = 0; i < this.options.stars; i++) {
      var starEmpty = document.createElement('span');
      starEmpty.className = 'rating-star';
      starEmpty.innerHTML = symbolSvg;
      this.emptyLayer.appendChild(starEmpty);

      var starFilled = document.createElement('span');
      starFilled.className = 'rating-star';
      starFilled.innerHTML = symbolSvg;
      this.filledLayer.appendChild(starFilled);
    }

    this.starsWrapper.appendChild(this.emptyLayer);
    this.starsWrapper.appendChild(this.filledLayer);
    this.container.appendChild(this.starsWrapper);

    // 5. Legenda de avaliação
    if (this.options.showCaption) {
      this.caption = document.createElement('span');
      this.caption.className = 'rating-caption';
      this.container.appendChild(this.caption);
    }

    // Insere no DOM após o input original
    this.el.parentNode.insertBefore(this.container, this.el.nextSibling);

    // Renderiza o preenchimento inicial
    this._renderFill(this.value);

    // 6. Vincula eventos interativos
    if (!this.options.readonly && !this.options.disabled) {
      this._bindEvents();
    }
  };

  /**
   * Vincula eventos de mouse e teclado
   */
  DexterRating.prototype._bindEvents = function () {
    var self = this;

    // Movimento do mouse para hover em tempo real
    this.starsWrapper.addEventListener('mousemove', function (e) {
      var hoverVal = self._calculateValueFromEvent(e);
      self._renderFill(hoverVal, true);
    });

    // Saída do mouse restaura o valor fixado
    this.starsWrapper.addEventListener('mouseleave', function () {
      self._renderFill(self.value, false);
    });

    // Clique fixa a nova nota
    this.starsWrapper.addEventListener('click', function (e) {
      var newVal = self._calculateValueFromEvent(e);
      self.rate(newVal);
    });

    // Acessibilidade por teclado
    this.starsWrapper.addEventListener('keydown', function (e) {
      var key = e.key;
      var step = self.options.step;

      if (key === 'ArrowRight' || key === 'ArrowUp') {
        e.preventDefault();
        self.rate(Math.min(self.options.max, self.value + step));
      } else if (key === 'ArrowLeft' || key === 'ArrowDown') {
        e.preventDefault();
        self.rate(Math.max(self.options.min, self.value - step));
      } else if (key === 'Home') {
        e.preventDefault();
        self.rate(self.options.min);
      } else if (key === 'End') {
        e.preventDefault();
        self.rate(self.options.max);
      } else if (key === 'Delete' || key === 'Backspace') {
        e.preventDefault();
        self.clear();
      }
    });
  };

  /**
   * Calcula a nota fracionada a partir da posição do ponteiro
   */
  DexterRating.prototype._calculateValueFromEvent = function (e) {
    var rect = this.starsWrapper.getBoundingClientRect();
    var width = rect.width;
    if (width <= 0) return this.value;

    var offsetX = Math.max(0, Math.min(width, e.clientX - rect.left));
    var percent = offsetX / width;

    var rawValue = this.options.min + percent * (this.options.max - this.options.min);
    var step = this.options.step;

    // Arredonda para o degrau (step) mais próximo
    var steppedValue = Math.round(rawValue / step) * step;
    steppedValue = Math.min(this.options.max, Math.max(this.options.min, steppedValue));

    // Corrige imprecisões de ponto flutuante (ex: 2.5000000001)
    return parseFloat(steppedValue.toFixed(2));
  };

  /**
   * Renderiza a largura da camada preenchida e a legenda
   */
  DexterRating.prototype._renderFill = function (val, isPreview) {
    var range = this.options.max - this.options.min;
    var percent = range > 0 ? ((val - this.options.min) / range) * 100 : 0;
    percent = Math.max(0, Math.min(100, percent));

    this.filledLayer.style.width = percent + '%';

    // Atualiza a legenda
    if (this.caption) {
      var text = '';
      if (val === this.options.min && this.options.clearCaption) {
        text = this.options.clearCaption;
      } else if (typeof this.options.starCaptions === 'function') {
        text = this.options.starCaptions(val, this.options.max);
      } else if (typeof this.options.starCaptions === 'object' && this.options.starCaptions[val]) {
        text = this.options.starCaptions[val];
      } else {
        text = val + ' / ' + this.options.max;
      }
      this.caption.textContent = text;
    }

    if (!isPreview) {
      this.starsWrapper.setAttribute('aria-valuenow', val);
    }
  };

  /**
   * Aplica uma nova avaliação
   */
  DexterRating.prototype.rate = function (val) {
    var cleanVal = parseFloat(val);
    if (isNaN(cleanVal)) cleanVal = this.options.min;
    cleanVal = Math.min(this.options.max, Math.max(this.options.min, cleanVal));

    this.value = cleanVal;
    this.el.value = cleanVal;
    this._renderFill(cleanVal, false);

    // Dispara eventos nativos
    var changeEvt = new Event('change', { bubbles: true });
    var inputEvt = new Event('input', { bubbles: true });
    this.el.dispatchEvent(changeEvt);
    this.el.dispatchEvent(inputEvt);

    if (typeof this.options.onRate === 'function') {
      this.options.onRate(cleanVal, this);
    }
    if (typeof this.options.onChange === 'function') {
      this.options.onChange(cleanVal, this);
    }
  };

  /**
   * Limpa / reseta a avaliação
   */
  DexterRating.prototype.clear = function () {
    this.value = this.options.min;
    this.el.value = this.options.min;
    this._renderFill(this.options.min, false);

    var changeEvt = new Event('change', { bubbles: true });
    this.el.dispatchEvent(changeEvt);

    if (typeof this.options.onClear === 'function') {
      this.options.onClear(this);
    }
    if (typeof this.options.onChange === 'function') {
      this.options.onChange(this.options.min, this);
    }
  };

  /**
   * Retorna o valor atual
   */
  DexterRating.prototype.getValue = function () {
    return this.value;
  };

  /**
   * Desabilita a avaliação
   */
  DexterRating.prototype.disable = function () {
    this.options.disabled = true;
    this.container.classList.add('rating-disabled');
    this.el.disabled = true;
  };

  /**
   * Habilita a avaliação
   */
  DexterRating.prototype.enable = function () {
    this.options.disabled = false;
    this.container.classList.remove('rating-disabled');
    this.el.disabled = false;
  };

  /**
   * Destrói a instância
   */
  DexterRating.prototype.destroy = function () {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.el.style.display = '';
    this.el.removeAttribute('aria-hidden');
    this.el.tabIndex = 0;
    delete this.el._dexterRatingInstance;
  };

  /**
   * Inicialização automática
   */
  DexterRating.initAll = function () {
    var elements = document.querySelectorAll('input[data-dx-rating], input.rating, [data-dx-star-rating]');
    Array.prototype.forEach.call(elements, function (el) {
      if (!el._dexterRatingInstance) {
        new DexterRating(el);
      }
    });
  };

  // Auto-init no DOMContentLoaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', DexterRating.initAll);
    } else {
      DexterRating.initAll();
    }
  }

  // Exportação UMD / Global
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DexterRating;
  } else {
    global.DexterRating = DexterRating;
  }

})(typeof window !== 'undefined' ? window : this);
