/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-wizard.js
 * @description [PT-BR] Controlador nativo e responsivo de Assistente de Passos e Formulários Multi-Step
 *              (Step Wizard) para Dexter UI, inspirado no jqueryBootstrapWizard e step-wizard-ui-bootstrap:
 *              círculos numerados, linha de progresso contínua, validação de campos por etapa,
 *              layouts horizontal e vertical (.wizard-vertical), navegação por botões (Anterior, Próximo, Finalizar)
 *              e suporte a 28 cores e Dark Mode, com zero dependências externas.
 *              [EN]    Native and responsive Step Wizard and Multi-Step Forms controller for Dexter UI,
 *              inspired by jqueryBootstrapWizard and step-wizard-ui-bootstrap:
 *              numbered circles, connecting progress bar, per-step input validation,
 *              horizontal and vertical (.wizard-vertical) layouts, navigation buttons (Previous, Next, Finish),
 *              28 official colors and Dark Mode, zero external dependencies.
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
    var instance = factory();
    global.DexterWizard = instance;
    global.BootstrapWizard = instance; // Alias de compatibilidade
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var instances = new WeakMap();

  var ICON_CHECK_SVG = '<svg class="step-icon-check" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M12.736 3.97a.75.75 0 0 1 1.028 1.06l-6.5 7.5a.75.75 0 0 1-1.08.02L2.22 8.53a.75.75 0 1 1 1.06-1.06l3.447 3.448 5.97-6.918a.04.04 0 0 1 .039-.03z"/></svg>';

  /**
   * Dispara evento customizado no elemento
   */
  function dispatchWizardEvent(element, eventName, detail) {
    var evt = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: true,
      detail: detail || {}
    });
    element.dispatchEvent(evt);
    return !evt.defaultPrevented;
  }

  /**
   * Construtor DexterWizard
   * @param {HTMLElement|string} element
   * @param {Object} options
   */
  function DexterWizard(element, options) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;

    if (instances.has(this.element)) {
      return instances.get(this.element);
    }

    this.options = Object.assign({
      linear: this.element.getAttribute('data-linear') !== 'false',
      validate: this.element.getAttribute('data-validate') !== 'false',
      autoScroll: this.element.getAttribute('data-auto-scroll') === 'true'
    }, options || {});

    this.steps = Array.from(this.element.querySelectorAll('.wizard-steps .wizard-step'));
    this.panes = Array.from(this.element.querySelectorAll('.wizard-body .wizard-pane'));
    this.progressBar = this.element.querySelector('.wizard-progress-bar');

    this.btnPrev = this.element.querySelector('[data-wizard-action="prev"], .wizard-btn-prev');
    this.btnNext = this.element.querySelector('[data-wizard-action="next"], .wizard-btn-next');
    this.btnFinish = this.element.querySelector('[data-wizard-action="finish"], .wizard-btn-finish');

    this.currentIndex = 0;

    this._init();
    instances.set(this.element, this);
  }

  /**
   * Inicialização e vinculação de elementos
   */
  DexterWizard.prototype._init = function () {
    var self = this;

    // Garante que cada círculo possua o ícone checkmark
    this.steps.forEach(function (step, index) {
      var circle = step.querySelector('.step-circle');
      if (circle && !circle.querySelector('.step-icon-check')) {
        circle.insertAdjacentHTML('beforeend', ICON_CHECK_SVG);
      }

      var trigger = step.querySelector('.step-trigger');
      if (trigger) {
        trigger.addEventListener('click', function (e) {
          e.preventDefault();
          if (!self.options.linear || index <= self.currentIndex || step.classList.contains('completed')) {
            self.goTo(index);
          }
        });
      }
    });

    // Botões de navegação
    if (this.btnPrev) {
      this.btnPrev.addEventListener('click', function (e) {
        e.preventDefault();
        self.prev();
      });
    }

    if (this.btnNext) {
      this.btnNext.addEventListener('click', function (e) {
        e.preventDefault();
        self.next();
      });
    }

    if (this.btnFinish) {
      this.btnFinish.addEventListener('click', function (e) {
        e.preventDefault();
        self.finish();
      });
    }

    // Identifica o passo inicial
    var activeIndex = this.steps.findIndex(function (s) { return s.classList.contains('active'); });
    if (activeIndex === -1) activeIndex = 0;

    this.goTo(activeIndex, true);
  };

  /**
   * Valida os campos da etapa atual
   */
  DexterWizard.prototype.validateStep = function (stepIndex) {
    if (!this.options.validate) return true;

    var pane = this.panes[stepIndex];
    if (!pane) return true;

    var inputs = Array.from(pane.querySelectorAll('input, select, textarea'));
    var isValid = true;
    var firstInvalid = null;

    inputs.forEach(function (input) {
      if (input.disabled) return;

      if (!input.checkValidity()) {
        isValid = false;
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
        if (!firstInvalid) firstInvalid = input;
      } else {
        input.classList.remove('is-invalid');
        if (input.value.trim() !== '') {
          input.classList.add('is-valid');
        }
      }
    });

    if (!isValid && firstInvalid) {
      firstInvalid.focus();
      dispatchWizardEvent(this.element, 'dexter:wizard:error', {
        stepIndex: stepIndex,
        invalidElement: firstInvalid
      });
    }

    return isValid;
  };

  /**
   * Avança para o próximo passo
   */
  DexterWizard.prototype.next = function () {
    if (this.currentIndex >= this.steps.length - 1) {
      this.finish();
      return;
    }

    // Se a validação do passo atual falhar, interrompe o avanço
    if (!this.validateStep(this.currentIndex)) {
      return;
    }

    // Marca o passo atual como concluído
    if (this.steps[this.currentIndex]) {
      this.steps[this.currentIndex].classList.add('completed');
    }

    this.goTo(this.currentIndex + 1);
  };

  /**
   * Retorna para o passo anterior
   */
  DexterWizard.prototype.prev = function () {
    if (this.currentIndex <= 0) return;
    this.goTo(this.currentIndex - 1);
  };

  /**
   * Navega diretamente para um passo específico
   */
  DexterWizard.prototype.goTo = function (targetIndex, isInit) {
    if (targetIndex < 0 || targetIndex >= this.steps.length) return;

    var fromIndex = this.currentIndex;

    if (!isInit) {
      // Dispara evento cancelável de mudança
      var allowed = dispatchWizardEvent(this.element, 'dexter:wizard:change', {
        fromStep: fromIndex,
        toStep: targetIndex
      });
      if (!allowed) return;
    }

    this.currentIndex = targetIndex;

    // Atualiza classes dos passos no cabeçalho
    var self = this;
    var isVertical = this.element.classList.contains('wizard-vertical');

    this.steps.forEach(function (step, idx) {
      step.classList.remove('active');
      if (idx === targetIndex) {
        step.classList.add('active');
      } else if (idx < targetIndex) {
        step.classList.add('completed');
      } else if (self.options.linear) {
        step.classList.remove('completed');
      }
    });

    // Atualiza painéis de conteúdo
    this.panes.forEach(function (pane, idx) {
      if (idx === targetIndex) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Atualiza a barra de progresso conectora
    if (this.progressBar) {
      var percent = this.steps.length > 1
        ? Math.round((targetIndex / (this.steps.length - 1)) * 100)
        : 100;

      if (isVertical) {
        this.progressBar.style.height = percent + '%';
        this.progressBar.style.width = '100%';
      } else {
        this.progressBar.style.width = percent + '%';
        this.progressBar.style.height = '100%';
      }
      this.progressBar.setAttribute('aria-valuenow', percent);
    }

    // Atualiza estado dos botões de controle
    this._updateButtons();

    if (!isInit) {
      dispatchWizardEvent(this.element, 'dexter:wizard:changed', {
        fromStep: fromIndex,
        currentStep: targetIndex
      });

      if (this.options.autoScroll) {
        this.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  /**
   * Atualiza a visibilidade e estado dos botões
   */
  DexterWizard.prototype._updateButtons = function () {
    var isFirst = this.currentIndex === 0;
    var isLast = this.currentIndex === this.steps.length - 1;

    if (this.btnPrev) {
      this.btnPrev.disabled = isFirst;
      this.btnPrev.classList.toggle('disabled', isFirst);
    }

    if (this.btnNext) {
      if (isLast) {
        this.btnNext.style.display = 'none';
      } else {
        this.btnNext.style.display = '';
      }
    }

    if (this.btnFinish) {
      if (isLast) {
        this.btnFinish.style.display = '';
      } else {
        this.btnFinish.style.display = 'none';
      }
    }
  };

  /**
   * Finaliza o assistente
   */
  DexterWizard.prototype.finish = function () {
    if (!this.validateStep(this.currentIndex)) return;

    if (this.steps[this.currentIndex]) {
      this.steps[this.currentIndex].classList.add('completed');
    }

    dispatchWizardEvent(this.element, 'dexter:wizard:finish', {
      currentStep: this.currentIndex
    });

    // Se o wizard estiver dentro de um formulário ou contiver um form, submete se desejado
    var form = this.element.closest('form') || this.element.querySelector('form');
    if (form && form.getAttribute('data-wizard-submit') === 'true') {
      form.submit();
    }
  };

  /**
   * Reinicia o assistente para a primeira etapa
   */
  DexterWizard.prototype.reset = function () {
    this.steps.forEach(function (step) {
      step.classList.remove('completed', 'active');
    });

    var inputs = this.element.querySelectorAll('input, select, textarea');
    inputs.forEach(function (input) {
      input.classList.remove('is-valid', 'is-invalid');
    });

    this.goTo(0);
  };

  /**
   * Retorna o passo atual (formato compativel com xonipatino/bootstrap-form-wizard)
   */
  DexterWizard.prototype.getCurrentStep = function () {
    return {
      step: this.currentIndex + 1,
      index: this.currentIndex,
      stepNav: this.steps[this.currentIndex] || null,
      stepPanel: this.panes[this.currentIndex] || null
    };
  };

  /**
   * Retorna instância existente
   */
  DexterWizard.getInstance = function (element) {
    var node = typeof element === 'string' ? document.querySelector(element) : element;
    return node ? instances.get(node) || null : null;
  };

  DexterWizard.forElement = DexterWizard.getInstance;

  /**
   * Retorna ou cria nova instância
   */
  DexterWizard.getOrCreateInstance = function (element, options) {
    var node = typeof element === 'string' ? document.querySelector(element) : element;
    if (!node) return null;
    return instances.get(node) || new DexterWizard(node, options);
  };

  /**
   * ---------------------------------------------------------------------------
   * BootstrapFormWizard (xonipatino/bootstrap-form-wizard) Drop-in Nativo Zero-Dep
   * ---------------------------------------------------------------------------
   */
  function BootstrapFormWizard(domOrSelector, opts) {
    this.element = typeof domOrSelector === 'string' ? document.querySelector(domOrSelector) : domOrSelector;
    if (!this.element || this.element.tagName.toLowerCase() !== 'form') {
      throw new Error('The form element is invalid.');
    }

    var wrapperSel = this.element.dataset ? this.element.dataset.bfwWrapper : null;
    this.elementWrapper = wrapperSel ? document.querySelector(wrapperSel) : this.element;
    if (!this.elementWrapper) {
      throw new Error('The wrapper element is invalid.');
    }

    this.id = this.element.id || ('bfw-' + Date.now() + '-' + Math.floor(Math.random() * 1000));
    this.element.id = this.id;

    var baseLang = Object.assign({}, BootstrapFormWizard.defaultOptions.lang, (opts && opts.lang) || {});
    this.options = Object.assign({}, BootstrapFormWizard.defaultOptions, opts || {}, { lang: baseLang });

    if (!this.options.backBtn) {
      this.options.backBtn = this.elementWrapper.querySelector('button[data-bfw-action="back"]') ||
        document.querySelector('button[data-bfw-action="back"][form="' + this.id + '"]');
    }
    if (!this.options.nextBtn) {
      this.options.nextBtn = this.elementWrapper.querySelector('button[data-bfw-action="next"]') ||
        document.querySelector('button[data-bfw-action="next"][form="' + this.id + '"]');
    }

    if (!this.options.backBtn || this.options.backBtn.tagName.toLowerCase() !== 'button' ||
        !this.options.nextBtn || this.options.nextBtn.tagName.toLowerCase() !== 'button') {
      throw new Error('The selector of the back or next button is invalid.');
    }

    this.options.backBtn.type = 'button';
    this.options.backBtn.innerHTML = this.options.lang.backBtn;
    this.options.nextBtn.type = 'button';
    this.options.backBtn.setAttribute('form', this.id);
    this.options.nextBtn.setAttribute('form', this.id);

    var self = this;
    this.options.backBtn.addEventListener('click', function () { self.back(); });
    this.options.nextBtn.addEventListener('click', function () { self.next(); });

    this.element.addEventListener('reset', function () {
      self.element.classList.remove('was-validated');
      self.goTo(1);
    });

    this.element.addEventListener('submit', function (event) {
      if (self.options.submitForm) {
        if (typeof self.options.onSubmit === 'function') {
          self.options.onSubmit(event);
        }
      } else {
        event.preventDefault();
      }
    });

    this.step = null;
    this.stepNavList = [];
    this.stepPanelList = [];

    this.loadListSteps();
    this.goTo(this.options.start || 1);

    // Substitui instância anterior no mesmo elemento se houver
    var existingIdx = BootstrapFormWizard.instances.findIndex(function (inst) { return inst.element === self.element; });
    if (existingIdx !== -1) BootstrapFormWizard.instances.splice(existingIdx, 1);
    BootstrapFormWizard.instances.push(this);
  }

  BootstrapFormWizard.instances = [];
  BootstrapFormWizard.defaultOptions = {
    lang: {
      backBtn: '< Voltar',
      nextBtn: 'Próximo >',
      nextBtnSubmit: 'Enviar',
      fieldReqNotFocusable: 'Um campo obrigatório do formulário não pode receber foco.'
    },
    start: 1,
    submitForm: true,
    useBootstrapValidation: false
  };

  BootstrapFormWizard.forElement = function (domOrSelector) {
    var node = typeof domOrSelector === 'string' ? document.querySelector(domOrSelector) : domOrSelector;
    return node ? BootstrapFormWizard.instances.find(function (inst) { return inst.element === node; }) : undefined;
  };

  BootstrapFormWizard.prototype.loadListSteps = function () {
    var self = this;
    this.stepNavList = Array.from(this.elementWrapper.querySelectorAll('[data-bs-toggle="step"], [data-dx-toggle="step"]'));
    if (this.stepNavList.length === 0) {
      throw new Error('No step elements were found in the list.');
    }

    var panels = [];
    this.stepNavList.forEach(function (stepElem, index) {
      var sel = (stepElem.dataset && (stepElem.dataset.bsTarget || stepElem.dataset.dxTarget)) || stepElem.getAttribute('href');
      var panelElem = sel ? self.elementWrapper.querySelector(sel) : null;
      if (!panelElem) {
        throw new Error('The step panel for one of the steps in the list was not found.');
      }

      var stepNum = String(index + 1);
      panelElem.setAttribute('role', 'steppanel');
      panelElem.setAttribute('panel', stepNum);
      panels.push(panelElem);

      stepElem.setAttribute('step', stepNum);
      stepElem.addEventListener('click', function (e) {
        e.preventDefault();
        var targetNum = index + 1;
        if (targetNum > self.step && !self.checkValidityForm()) {
          self.reportValidityForm();
          return;
        }
        self.goTo(targetNum);
      });
    });

    this.stepPanelList = panels;
  };

  BootstrapFormWizard.prototype.getCurrentStep = function () {
    return {
      step: this.step,
      stepNav: this.stepNavList[this.step - 1] || null,
      stepPanel: this.stepPanelList[this.step - 1] || null
    };
  };

  BootstrapFormWizard.prototype._getElementsUpToStep = function (maxStep) {
    var self = this;
    var arrPanels = this.stepPanelList;
    return Array.from(this.element.elements).filter(function (elem) {
      if (elem === self.options.backBtn || elem === self.options.nextBtn || elem.disabled) return false;
      var cur = elem.parentElement;
      while (cur) {
        var panelIdx = arrPanels.indexOf(cur);
        if (panelIdx !== -1) {
          return (panelIdx + 1) <= maxStep;
        }
        if (cur === self.elementWrapper) break;
        cur = cur.parentElement;
      }
      var inStep = Number((elem.dataset && elem.dataset.bfwInStep) || 1);
      return inStep <= maxStep;
    });
  };

  BootstrapFormWizard.prototype.checkValidityForm = function () {
    var isValid = true;
    var self = this;
    if (!this.element.noValidate || this.options.useBootstrapValidation) {
      var controls = this._getElementsUpToStep(this.step);
      controls.forEach(function (elem) {
        var ok = elem.checkValidity();
        if (!ok) isValid = false;
        if (self.options.useBootstrapValidation) {
          elem.classList.toggle('is-invalid', !ok);
          elem.classList.toggle('is-valid', ok);
        }
      });
      if (typeof this.options.onValidated === 'function') {
        isValid = this.options.onValidated(isValid);
      }
    }
    return isValid;
  };

  BootstrapFormWizard.prototype.reportValidityForm = function () {
    var controls = this._getElementsUpToStep(this.step);
    var invalidElem = controls.find(function (el) { return !el.checkValidity(); });
    if (!invalidElem) return;

    var arrPanels = this.stepPanelList;
    var cur = invalidElem.parentElement;
    var targetStep = null;
    while (cur) {
      var idx = arrPanels.indexOf(cur);
      if (idx !== -1) {
        targetStep = idx + 1;
        break;
      }
      if (cur === this.elementWrapper) break;
      cur = cur.parentElement;
    }
    if (!targetStep) {
      targetStep = Number((invalidElem.dataset && invalidElem.dataset.bfwInStep) || 1);
    }

    if (targetStep && targetStep !== this.step) {
      this.goTo(targetStep);
    }

    if (this.options.useBootstrapValidation) {
      this.element.classList.add('was-validated');
      invalidElem.classList.add('is-invalid');
    }

    if (!this.element.noValidate && typeof invalidElem.reportValidity === 'function') {
      invalidElem.reportValidity();
    }
    try {
      invalidElem.focus();
    } catch (err) {
      if (this.options.lang && this.options.lang.fieldReqNotFocusable) {
        console.warn(this.options.lang.fieldReqNotFocusable);
      }
    }
  };

  BootstrapFormWizard.prototype.goTo = function (stepNum) {
    var idx = Number(stepNum) - 1;
    if (idx < 0 || idx >= this.stepNavList.length) return;

    this.step = idx + 1;

    this.stepNavList.forEach(function (nav, i) {
      nav.classList.toggle('active', i === idx);
      nav.classList.toggle('completed', i < idx);
      nav.setAttribute('aria-selected', i === idx ? 'true' : 'false');
    });

    this.stepPanelList.forEach(function (panel, i) {
      var active = i === idx;
      panel.classList.toggle('active', active);
      panel.classList.toggle('show', active);
    });

    this.options.backBtn.disabled = this.step === 1;
    this.options.nextBtn.innerHTML = (this.step === this.stepNavList.length)
      ? this.options.lang.nextBtnSubmit
      : this.options.lang.nextBtn;
    this.options.nextBtn.type = 'button';

    dispatchWizardEvent(this.element, 'dexter:form-wizard:step', this.getCurrentStep());
  };

  BootstrapFormWizard.prototype.reset = function () {
    this.element.reset();
  };

  BootstrapFormWizard.prototype.back = function () {
    if (this.step > 1) {
      this.goTo(this.step - 1);
      if (typeof this.options.onBack === 'function') {
        this.options.onBack(this.step);
      }
    }
  };

  BootstrapFormWizard.prototype.next = function () {
    if (!this.checkValidityForm()) {
      this.reportValidityForm();
      return;
    }

    if (this.step === this.stepNavList.length) {
      this.options.nextBtn.type = 'submit';
      if (typeof this.element.requestSubmit === 'function') {
        this.element.requestSubmit(this.options.nextBtn);
      } else {
        this.element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    } else {
      this.goTo(this.step + 1);
      if (typeof this.options.onNext === 'function') {
        this.options.onNext(this.step);
      }
    }
  };

  DexterWizard.FormWizard = BootstrapFormWizard;
  if (typeof window !== 'undefined') {
    window.BootstrapFormWizard = BootstrapFormWizard;
  }

  /**
   * Inicialização estática universal
   */
  DexterWizard.initAll = function (root) {
    var container = root || document;
    var wizards = container.querySelectorAll('[data-dx-wizard], .wizard:not(.wizard-pills)');
    var list = [];
    wizards.forEach(function (w) {
      list.push(DexterWizard.getOrCreateInstance(w));
    });

    var formWizards = container.querySelectorAll('form[data-dx-form-wizard], form[data-bfw-auto]');
    formWizards.forEach(function (fw) {
      if (!BootstrapFormWizard.forElement(fw)) {
        try {
          new BootstrapFormWizard(fw);
        } catch (e) { /* aguarda configuração manual se faltarem botões */ }
      }
    });

    return list;
  };

  // Auto-init ao carregar o DOM
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        DexterWizard.initAll();
      });
    } else {
      DexterWizard.initAll();
    }
  }

  return DexterWizard;
});
