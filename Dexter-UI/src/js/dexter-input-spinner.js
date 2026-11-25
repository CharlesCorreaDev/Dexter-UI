/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-input-spinner.js
 * @description [PT-BR] Controlador nativo zero-dependência para Seletores Numéricos e
 *              Steppers (Input Spinner), inspirado e aprimorado a partir do
 *              bootstrap-input-spinner (github.com/shaack/bootstrap-input-spinner).
 *              Converte nativamente campos <input type="number"> em botões de incremento/decremento
 *              com aceleração contínua por clique longo, formatação internacional localizada,
 *              prefixos/sufixos, layout empilhado vertical (.spinner-stacked), validação,
 *              integração às 28 cores oficiais e Dark Mode.
 *              [EN]    Zero-dependency native controller for Input Spinners and Steppers,
 *              inspired and enhanced from bootstrap-input-spinner (github.com/shaack/bootstrap-input-spinner).
 *              Transforms numeric inputs into increment/decrement stepper controls with
 *              continuous hold-to-accelerate stepping, localized international formatting,
 *              prefixes/suffixes, stacked vertical layouts, 28 official colors, and Dark Mode.
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

  // Ícones SVG vetorizados
  var ICON_MINUS = '<svg viewBox="0 0 16 16"><path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/></svg>';
  var ICON_PLUS = '<svg viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>';
  var ICON_CHEVRON_UP = '<svg viewBox="0 0 16 16"><path d="M3.204 11 8 6.204 12.796 11l.707-.707L8 4.79l-5.503 5.503z"/></svg>';
  var ICON_CHEVRON_DOWN = '<svg viewBox="0 0 16 16"><path d="M3.204 5 8 9.796 12.796 5l.707.707L8 11.21 2.497 5.707z"/></svg>';

  /**
   * Construtor principal do DexterInputSpinner
   */
  function DexterInputSpinner(element, options) {
    if (!element) return;
    if (element._dexterInputSpinnerInstance) {
      return element._dexterInputSpinnerInstance;
    }

    this.el = element;

    // Resgata configurações de atributos HTML
    var minAttr = element.getAttribute('min');
    var maxAttr = element.getAttribute('max');
    var stepAttr = element.getAttribute('step');
    var prefixAttr = element.getAttribute('data-prefix');
    var suffixAttr = element.getAttribute('data-suffix');
    var colorAttr = element.getAttribute('data-dx-color') || element.getAttribute('data-color');
    var stackedAttr = element.getAttribute('data-stacked') === 'true';
    var localeAttr = element.getAttribute('data-locale');
    var decimalsAttr = element.getAttribute('data-decimals');

    // Calcula casas decimais a partir de step (ex: 0.01 -> 2 casas)
    var stepVal = stepAttr !== null && stepAttr !== 'any' ? parseFloat(stepAttr) : 1;
    var decimals = 0;
    if (decimalsAttr !== null) {
      decimals = parseInt(decimalsAttr, 10);
    } else if (stepAttr && stepAttr.indexOf('.') !== -1) {
      decimals = stepAttr.split('.')[1].length;
    }

    this.options = Object.assign({
      min: minAttr !== null ? parseFloat(minAttr) : -Infinity,
      max: maxAttr !== null ? parseFloat(maxAttr) : Infinity,
      step: stepVal,
      decimals: decimals,
      prefix: prefixAttr || '',
      suffix: suffixAttr || '',
      color: colorAttr || 'primary',
      stacked: stackedAttr,
      locale: localeAttr || (typeof navigator !== 'undefined' ? navigator.language : 'pt-BR'),
      autoDelay: 400, // delay inicial antes da aceleração (ms)
      autoInterval: 80, // intervalo do loop contínuo (ms)
      onChange: null
    }, options || {});

    // Valor inicial
    var val = parseFloat(element.value);
    this.value = isNaN(val) ? (isFinite(this.options.min) ? this.options.min : 0) : val;

    this.stepTimeout = null;
    this.stepInterval = null;

    this._init();
    element._dexterInputSpinnerInstance = this;
  }

  DexterInputSpinner.prototype._init = function () {
    var self = this;

    // 1. Oculta o input nativo preservando valor e envio de formulário
    this.el.style.display = 'none';
    this.el.setAttribute('aria-hidden', 'true');
    this.el.tabIndex = -1;

    // 2. Contêiner principal
    this.container = document.createElement('div');
    this.container.className = 'input-spinner-group';
    if (this.options.stacked) {
      this.container.classList.add('spinner-stacked');
    }
    if (this.options.color) {
      this.container.classList.add('input-spinner-' + this.options.color);
    }

    // Copia classes de tamanho e validação
    if (this.el.classList.contains('input-sm') || this.el.classList.contains('form-control-sm')) {
      this.container.classList.add('input-spinner-sm');
    }
    if (this.el.classList.contains('input-lg') || this.el.classList.contains('form-control-lg')) {
      this.container.classList.add('input-spinner-lg');
    }
    if (this.el.classList.contains('is-valid')) this.container.classList.add('is-valid');
    if (this.el.classList.contains('is-invalid')) this.container.classList.add('is-invalid');
    if (this.el.disabled) this.container.classList.add('is-disabled');

    // 3. Botão de decremento (-)
    this.btnDecrement = document.createElement('button');
    this.btnDecrement.type = 'button';
    this.btnDecrement.className = 'spinner-btn spinner-btn-decrement';
    this.btnDecrement.setAttribute('aria-label', 'Diminuir valor');
    this.btnDecrement.innerHTML = this.options.stacked ? ICON_CHEVRON_DOWN : ICON_MINUS;
    if (this.el.disabled || this.el.readOnly) this.btnDecrement.disabled = true;

    // 4. Prefixo opcional
    if (this.options.prefix) {
      this.prefixSpan = document.createElement('span');
      this.prefixSpan.className = 'spinner-prefix';
      this.prefixSpan.textContent = this.options.prefix;
    }

    // 5. Input de exibição e edição
    this.displayInput = document.createElement('input');
    this.displayInput.type = 'text';
    this.displayInput.className = 'spinner-input';
    this.displayInput.inputMode = this.options.decimals > 0 ? 'decimal' : 'numeric';
    this.displayInput.value = this._format(this.value);
    if (this.el.disabled) this.displayInput.disabled = true;
    if (this.el.readOnly) this.displayInput.readOnly = true;

    // 6. Sufixo opcional
    if (this.options.suffix) {
      this.suffixSpan = document.createElement('span');
      this.suffixSpan.className = 'spinner-suffix';
      this.suffixSpan.textContent = this.options.suffix;
    }

    // 7. Botão de incremento (+)
    this.btnIncrement = document.createElement('button');
    this.btnIncrement.type = 'button';
    this.btnIncrement.className = 'spinner-btn spinner-btn-increment';
    this.btnIncrement.setAttribute('aria-label', 'Aumentar valor');
    this.btnIncrement.innerHTML = this.options.stacked ? ICON_CHEVRON_UP : ICON_PLUS;
    if (this.el.disabled || this.el.readOnly) this.btnIncrement.disabled = true;

    // Monta no DOM conforme o layout
    if (this.options.stacked) {
      // Layout vertical empilhado
      if (this.prefixSpan) this.container.appendChild(this.prefixSpan);
      this.container.appendChild(this.displayInput);
      if (this.suffixSpan) this.container.appendChild(this.suffixSpan);

      var stackedBtns = document.createElement('div');
      stackedBtns.className = 'spinner-stacked-btns';
      stackedBtns.appendChild(this.btnIncrement);
      stackedBtns.appendChild(this.btnDecrement);
      this.container.appendChild(stackedBtns);
    } else {
      // Layout horizontal padrão: [-] [prefix] [input] [suffix] [+]
      this.container.appendChild(this.btnDecrement);
      if (this.prefixSpan) this.container.appendChild(this.prefixSpan);
      this.container.appendChild(this.displayInput);
      if (this.suffixSpan) this.container.appendChild(this.suffixSpan);
      this.container.appendChild(this.btnIncrement);
    }

    this.el.parentNode.insertBefore(this.container, this.el.nextSibling);

    // 8. Event listeners
    this._bindEvents();
    this._updateButtonsState();
  };

  /**
   * Formata número conforme precisão decimal
   */
  DexterInputSpinner.prototype._format = function (val) {
    if (isNaN(val)) return '0';
    return val.toFixed(this.options.decimals);
  };

  /**
   * Converte texto digitado pelo usuário em número válido
   */
  DexterInputSpinner.prototype._parse = function (str) {
    if (typeof str !== 'string') str = String(str);
    // Substitui vírgula por ponto para suportar pt-BR
    var cleanStr = str.replace(',', '.').replace(/[^0-9.-]/g, '');
    var num = parseFloat(cleanStr);
    return isNaN(num) ? this.value : num;
  };

  /**
   * Atualiza estado disabled dos botões se atingir min ou max
   */
  DexterInputSpinner.prototype._updateButtonsState = function () {
    if (this.el.disabled || this.el.readOnly) {
      this.btnDecrement.disabled = true;
      this.btnIncrement.disabled = true;
      return;
    }
    this.btnDecrement.disabled = isFinite(this.options.min) && this.value <= this.options.min;
    this.btnIncrement.disabled = isFinite(this.options.max) && this.value >= this.options.max;
  };

  /**
   * Define novo valor
   */
  DexterInputSpinner.prototype.setValue = function (newVal, isSilent) {
    var num = parseFloat(newVal);
    if (isNaN(num)) num = 0;

    // Limites min e max
    num = Math.min(this.options.max, Math.max(this.options.min, num));

    // Corrige imprecisão de ponto flutuante
    num = parseFloat(num.toFixed(this.options.decimals));

    this.value = num;
    this.el.value = num;
    this.displayInput.value = this._format(num);

    this._updateButtonsState();

    if (!isSilent) {
      var changeEvt = new Event('change', { bubbles: true });
      var inputEvt = new Event('input', { bubbles: true });
      this.el.dispatchEvent(changeEvt);
      this.el.dispatchEvent(inputEvt);

      if (typeof this.options.onChange === 'function') {
        this.options.onChange(num, this.el);
      }
    }
  };

  /**
   * Incrementa valor pelo step
   */
  DexterInputSpinner.prototype.stepUp = function (multiplier) {
    multiplier = multiplier || 1;
    this.setValue(this.value + (this.options.step * multiplier));
  };

  /**
   * Decrementa valor pelo step
   */
  DexterInputSpinner.prototype.stepDown = function (multiplier) {
    multiplier = multiplier || 1;
    this.setValue(this.value - (this.options.step * multiplier));
  };

  /**
   * Inicia aceleração contínua ao manter pressionado
   */
  DexterInputSpinner.prototype._startContinuous = function (isIncrement) {
    var self = this;
    this._stopContinuous();

    // Primeiro step imediato
    if (isIncrement) self.stepUp();
    else self.stepDown();

    // Timer inicial
    this.stepTimeout = setTimeout(function () {
      var intervalMs = self.options.autoInterval;
      self.stepInterval = setInterval(function () {
        if (isIncrement) self.stepUp();
        else self.stepDown();
      }, intervalMs);
    }, this.options.autoDelay);
  };

  /**
   * Interrompe aceleração contínua
   */
  DexterInputSpinner.prototype._stopContinuous = function () {
    if (this.stepTimeout) {
      clearTimeout(this.stepTimeout);
      this.stepTimeout = null;
    }
    if (this.stepInterval) {
      clearInterval(this.stepInterval);
      this.stepInterval = null;
    }
  };

  /**
   * Vincula eventos de mouse, touch e teclado
   */
  DexterInputSpinner.prototype._bindEvents = function () {
    var self = this;

    // Foco visual no container
    this.displayInput.addEventListener('focus', function () {
      self.container.classList.add('is-focused');
    });

    this.displayInput.addEventListener('blur', function () {
      self.container.classList.remove('is-focused');
      // Normaliza ao desfalcar
      var parsed = self._parse(self.displayInput.value);
      self.setValue(parsed);
    });

    // Edição manual por teclado
    this.displayInput.addEventListener('keydown', function (e) {
      var key = e.key;

      if (key === 'ArrowUp') {
        e.preventDefault();
        self.stepUp(e.shiftKey ? 10 : 1);
      } else if (key === 'ArrowDown') {
        e.preventDefault();
        self.stepDown(e.shiftKey ? 10 : 1);
      } else if (key === 'PageUp') {
        e.preventDefault();
        self.stepUp(10);
      } else if (key === 'PageDown') {
        e.preventDefault();
        self.stepDown(10);
      } else if (key === 'Home' && isFinite(self.options.min)) {
        e.preventDefault();
        self.setValue(self.options.min);
      } else if (key === 'End' && isFinite(self.options.max)) {
        e.preventDefault();
        self.setValue(self.options.max);
      } else if (key === 'Enter') {
        self.displayInput.blur();
      }
    });

    // Eventos de clique e clique contínuo (Incremento)
    var startInc = function (e) {
      e.preventDefault();
      self._startContinuous(true);
    };
    var stopAction = function () {
      self._stopContinuous();
    };

    this.btnIncrement.addEventListener('mousedown', startInc);
    this.btnIncrement.addEventListener('touchstart', startInc, { passive: false });
    this.btnIncrement.addEventListener('mouseup', stopAction);
    this.btnIncrement.addEventListener('mouseleave', stopAction);
    this.btnIncrement.addEventListener('touchend', stopAction);

    // Eventos de clique e clique contínuo (Decremento)
    var startDec = function (e) {
      e.preventDefault();
      self._startContinuous(false);
    };

    this.btnDecrement.addEventListener('mousedown', startDec);
    this.btnDecrement.addEventListener('touchstart', startDec, { passive: false });
    this.btnDecrement.addEventListener('mouseup', stopAction);
    this.btnDecrement.addEventListener('mouseleave', stopAction);
    this.btnDecrement.addEventListener('touchend', stopAction);

    // Cancelamento global ao soltar botão fora
    window.addEventListener('mouseup', stopAction);
    window.addEventListener('touchend', stopAction);
  };

  /**
   * Retorna valor atual
   */
  DexterInputSpinner.prototype.getValue = function () {
    return this.value;
  };

  /**
   * Destrói instância
   */
  DexterInputSpinner.prototype.destroy = function () {
    this._stopContinuous();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.el.style.display = '';
    this.el.removeAttribute('aria-hidden');
    this.el.tabIndex = 0;
    delete this.el._dexterInputSpinnerInstance;
  };

  /**
   * Inicialização automática
   */
  DexterInputSpinner.initAll = function () {
    var elements = document.querySelectorAll('input[type="number"][data-dx-spinner], input.input-spinner, [data-dx-input-spinner]');
    Array.prototype.forEach.call(elements, function (el) {
      if (!el._dexterInputSpinnerInstance) {
        new DexterInputSpinner(el);
      }
    });
  };

  // Auto-init no DOMContentLoaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', DexterInputSpinner.initAll);
    } else {
      DexterInputSpinner.initAll();
    }
  }

  // Exportação UMD / Global (com alias InputSpinner para compatibilidade total)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DexterInputSpinner;
    module.exports.InputSpinner = DexterInputSpinner;
  } else {
    global.DexterInputSpinner = DexterInputSpinner;
    global.InputSpinner = DexterInputSpinner;
  }

})(typeof window !== 'undefined' ? window : this);
