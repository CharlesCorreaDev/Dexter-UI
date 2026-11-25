/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-modal.js
 * @description [PT-BR] Controlador nativo Vanilla JS de Modais e Diálogos Dinâmicos para Dexter UI:
 *              gerenciamento de modais estáticos via data attributes e geração dinâmica programática
 *              (showModal, showAlert, showConfirm, showPrompt) inspirada no bootstrap-show-modal (shaack),
 *              com suporte a Promises, callbacks, backdrop estático ou clicável, foco acessível,
 *              bloqueio de rolagem do body, transições suaves e zero dependências externas.
 *              [EN]    Native Vanilla JS Modal and Dynamic Dialog Controller for Dexter UI:
 *              manages static markup modals via data attributes and programmatic dynamic modals
 *              (showModal, showAlert, showConfirm, showPrompt) inspired by bootstrap-show-modal (shaack),
 *              featuring Promises, callbacks, static/clickable backdrops, accessible focus,
 *              body scroll lock, smooth transitions, and zero external dependencies.
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
    global.DexterModal = instance;
    global.Modal = instance; // Alias compatível com Bootstrap Modal

    // Extensões globais convenientes no namespace dexter e bootstrap
    global.dexter = global.dexter || {};
    global.dexter.showModal = instance.show;
    global.dexter.showAlert = instance.alert;
    global.dexter.showConfirm = instance.confirm;
    global.dexter.showPrompt = instance.prompt;

    global.bootstrap = global.bootstrap || {};
    global.bootstrap.showModal = instance.show;
    global.bootstrap.showAlert = instance.alert;
    global.bootstrap.showConfirm = instance.confirm;
    global.bootstrap.showPrompt = instance.prompt;
    global.bootstrap.Modal = instance;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var instances = new WeakMap();
  var openModals = [];

  /**
   * Dispara eventos customizados compatíveis
   */
  function dispatchModalEvent(element, eventName, relatedTarget) {
    var evt = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: true,
      detail: { relatedTarget: relatedTarget }
    });
    element.dispatchEvent(evt);
    return !evt.defaultPrevented;
  }

  /**
   * Construtor DexterModal para elementos estáticos ou gerados
   */
  function DexterModal(element, options) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) return;

    if (instances.has(this.element)) {
      return instances.get(this.element);
    }

    this.options = Object.assign({
      backdrop: true,     // true | false | 'static'
      keyboard: true,     // fechar via Escape
      focus: true,        // focar no modal ao abrir
      centered: true,     // modal-dialog-centered
      scrollable: false   // modal-dialog-scrollable
    }, options || {});

    this.isShown = false;
    this.dialog = this.element.querySelector('.modal-dialog');
    this.backdropElement = null;

    this._bindEvents();
    instances.set(this.element, this);
  }

  /**
   * Associa eventos do modal
   */
  DexterModal.prototype._bindEvents = function () {
    var self = this;

    // Fechar ao clicar em elementos com data-dx-dismiss="modal" ou data-bs-dismiss="modal"
    this.element.addEventListener('click', function (e) {
      var dismissBtn = e.target.closest('[data-dx-dismiss="modal"], [data-bs-dismiss="modal"], [data-dismiss="modal"]');
      if (dismissBtn) {
        e.preventDefault();
        self.hide();
        return;
      }

      // Clique fora no backdrop
      if (e.target === self.element) {
        if (self.options.backdrop === 'static') {
          self._triggerStaticAnimation();
        } else if (self.options.backdrop) {
          self.hide();
        }
      }
    });

    // Tecla Escape
    this._keydownHandler = function (e) {
      if (self.isShown && self.options.keyboard && e.key === 'Escape') {
        e.preventDefault();
        self.hide();
      }
    };
  };

  /**
   * Exibe o modal
   */
  DexterModal.prototype.show = function () {
    if (this.isShown) return;

    if (!dispatchModalEvent(this.element, 'dexter:modal:show')) return;
    dispatchModalEvent(this.element, 'show.bs.modal');

    this.isShown = true;
    openModals.push(this);
    document.body.classList.add('modal-open');

    // 1. Criar backdrop se habilitado
    if (this.options.backdrop) {
      this._createBackdrop();
    }

    // 2. Exibir elemento
    this.element.style.display = 'block';
    this.element.removeAttribute('aria-hidden');
    this.element.setAttribute('aria-modal', 'true');
    this.element.setAttribute('role', 'dialog');

    // Força reflow para transição CSS fade
    void this.element.offsetWidth;
    this.element.classList.add('show');

    document.addEventListener('keydown', this._keydownHandler);

    var self = this;
    setTimeout(function () {
      if (self.options.focus) {
        var focusable = self.element.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable) focusable.focus();
        else self.element.focus();
      }
      dispatchModalEvent(self.element, 'dexter:modal:shown');
      dispatchModalEvent(self.element, 'shown.bs.modal');
    }, 150);
  };

  /**
   * Oculta o modal
   */
  DexterModal.prototype.hide = function () {
    if (!this.isShown) return;

    if (!dispatchModalEvent(this.element, 'dexter:modal:hide')) return;
    dispatchModalEvent(this.element, 'hide.bs.modal');

    this.isShown = false;
    this.element.classList.remove('show');
    this.element.setAttribute('aria-hidden', 'true');
    this.element.removeAttribute('aria-modal');

    document.removeEventListener('keydown', this._keydownHandler);

    var self = this;
    setTimeout(function () {
      self.element.style.display = 'none';

      // Remove backdrop
      self._removeBackdrop();

      // Remove trava do body se nenhum outro modal estiver aberto
      var idx = openModals.indexOf(self);
      if (idx !== -1) openModals.splice(idx, 1);
      if (openModals.length === 0) {
        document.body.classList.remove('modal-open');
      }

      dispatchModalEvent(self.element, 'dexter:modal:hidden');
      dispatchModalEvent(self.element, 'hidden.bs.modal');

      // Auto-destruição para modais dinâmicos
      if (self.element.getAttribute('data-dx-dynamic') === 'true') {
        self.dispose();
        if (self.element.parentNode) {
          self.element.parentNode.removeChild(self.element);
        }
      }
    }, 200);
  };

  /**
   * Alterna exibição
   */
  DexterModal.prototype.toggle = function () {
    if (this.isShown) {
      this.hide();
    } else {
      this.show();
    }
  };

  /**
   * Destrói a instância
   */
  DexterModal.prototype.dispose = function () {
    document.removeEventListener('keydown', this._keydownHandler);
    this._removeBackdrop();
    instances.delete(this.element);
    this.element = null;
  };

  /**
   * Animação quando clica fora e o backdrop é 'static'
   */
  DexterModal.prototype._triggerStaticAnimation = function () {
    var self = this;
    this.element.classList.add('modal-static');
    setTimeout(function () {
      if (self.element) self.element.classList.remove('modal-static');
    }, 200);
  };

  /**
   * Cria o backdrop
   */
  DexterModal.prototype._createBackdrop = function () {
    if (this.backdropElement) return;

    this.backdropElement = document.createElement('div');
    this.backdropElement.className = 'modal-backdrop fade';
    document.body.appendChild(this.backdropElement);

    void this.backdropElement.offsetWidth;
    this.backdropElement.classList.add('show');
  };

  /**
   * Remove o backdrop
   */
  DexterModal.prototype._removeBackdrop = function () {
    if (!this.backdropElement) return;

    var backdrop = this.backdropElement;
    this.backdropElement = null;
    backdrop.classList.remove('show');
    setTimeout(function () {
      if (backdrop && backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
    }, 150);
  };

  /**
   * Retorna ou cria instância
   */
  DexterModal.getOrCreateInstance = function (element, options) {
    return instances.get(element) || new DexterModal(element, options);
  };

  DexterModal.getInstance = function (element) {
    return instances.get(element) || null;
  };

  // ---------------------------------------------------------------------------
  // API PROGRAMÁTICA DINÂMICA (Inspirada no bootstrap-show-modal de shaack)
  // ---------------------------------------------------------------------------

  /**
   * Cria e exibe um modal completo dinamicamente
   * @param {Object} options
   * @returns {Object} { modal, element, hide, dispose }
   */
  DexterModal.show = function (options) {
    options = Object.assign({
      title: '',
      body: '',
      footer: '',
      buttons: null,
      size: '',            // 'modal-sm', 'modal-lg', 'modal-xl', 'modal-fullscreen'
      centered: true,      // true | false
      scrollable: false,   // true | false
      backdrop: true,      // true | false | 'static'
      keyboard: true,
      headerClass: '',     // ex: 'modal-header-coral', 'modal-header-primary'
      onShown: null,
      onClose: null,
      onSubmit: null
    }, options || {});

    // Cria contêiner .modal
    var modalEl = document.createElement('div');
    modalEl.className = 'modal fade';
    modalEl.setAttribute('tabindex', '-1');
    modalEl.setAttribute('data-dx-dynamic', 'true');

    // Diálogo
    var dialogClasses = ['modal-dialog'];
    if (options.centered) dialogClasses.push('modal-dialog-centered');
    if (options.scrollable) dialogClasses.push('modal-dialog-scrollable');
    if (options.size) dialogClasses.push(options.size);

    var dialogEl = document.createElement('div');
    dialogEl.className = dialogClasses.join(' ');

    // Conteúdo
    var contentEl = document.createElement('div');
    contentEl.className = 'modal-content';

    // 1. Cabeçalho
    var headerEl = document.createElement('div');
    headerEl.className = 'modal-header' + (options.headerClass ? ' ' + options.headerClass : '');

    var titleEl = document.createElement('h5');
    titleEl.className = 'modal-title';
    titleEl.innerHTML = options.title || '';

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn-close';
    closeBtn.setAttribute('data-dx-dismiss', 'modal');
    closeBtn.setAttribute('aria-label', 'Fechar');

    headerEl.appendChild(titleEl);
    headerEl.appendChild(closeBtn);
    contentEl.appendChild(headerEl);

    // 2. Corpo
    var bodyEl = document.createElement('div');
    bodyEl.className = 'modal-body';
    if (typeof options.body === 'string') {
      bodyEl.innerHTML = options.body;
    } else if (options.body instanceof HTMLElement) {
      bodyEl.appendChild(options.body);
    }
    contentEl.appendChild(bodyEl);

    // 3. Rodapé
    var footerEl = document.createElement('div');
    footerEl.className = 'modal-footer';

    if (Array.isArray(options.buttons) && options.buttons.length > 0) {
      options.buttons.forEach(function (btnDef) {
        var btn = document.createElement('button');
        btn.type = btnDef.type || 'button';
        btn.className = 'btn ' + (btnDef.class || 'btn-secondary');
        btn.innerHTML = btnDef.label || 'Botão';
        if (btnDef.dismiss !== false) {
          btn.setAttribute('data-dx-dismiss', 'modal');
        }
        if (typeof btnDef.onClick === 'function') {
          btn.addEventListener('click', function (e) {
            btnDef.onClick(e, modalInstance);
          });
        }
        footerEl.appendChild(btn);
      });
      contentEl.appendChild(footerEl);
    } else if (typeof options.footer === 'string' && options.footer.trim() !== '') {
      footerEl.innerHTML = options.footer;
      contentEl.appendChild(footerEl);
    }

    dialogEl.appendChild(contentEl);
    modalEl.appendChild(dialogEl);
    document.body.appendChild(modalEl);

    // Cria instância DexterModal
    var modalInstance = new DexterModal(modalEl, {
      backdrop: options.backdrop,
      keyboard: options.keyboard,
      focus: true
    });

    if (typeof options.onShown === 'function') {
      modalEl.addEventListener('dexter:modal:shown', function () {
        options.onShown(modalInstance);
      });
    }

    if (typeof options.onClose === 'function') {
      modalEl.addEventListener('dexter:modal:hidden', function () {
        options.onClose(modalInstance);
      });
    }

    // Formulário interno
    var formEl = bodyEl.querySelector('form');
    if (formEl && typeof options.onSubmit === 'function') {
      formEl.addEventListener('submit', function (e) {
        e.preventDefault();
        options.onSubmit(e, modalInstance);
      });
    }

    modalInstance.show();

    return {
      modal: modalInstance,
      element: modalEl,
      hide: function () { modalInstance.hide(); },
      dispose: function () { modalInstance.dispose(); }
    };
  };

  /**
   * Alerta rápido programático (Alert Dialog)
   * @param {Object|string} options
   * @returns {Promise}
   */
  DexterModal.alert = function (options) {
    if (typeof options === 'string') {
      options = { body: options };
    }
    return new Promise(function (resolve) {
      DexterModal.show({
        title: options.title || 'Aviso',
        body: options.body || '',
        size: options.size || 'modal-sm',
        headerClass: options.headerClass || '',
        centered: options.centered !== false,
        buttons: [
          {
            label: options.labelOk || 'OK',
            class: options.classOk || 'btn-primary',
            onClick: function () {
              resolve(true);
            }
          }
        ],
        onClose: function () {
          if (typeof options.onClose === 'function') options.onClose();
          resolve(true);
        }
      });
    });
  };

  /**
   * Diálogo de confirmação com retorno booleano (Confirm Dialog)
   * @param {Object|string} options
   * @returns {Promise<boolean>}
   */
  DexterModal.confirm = function (options) {
    if (typeof options === 'string') {
      options = { body: options };
    }
    return new Promise(function (resolve) {
      var confirmed = false;

      DexterModal.show({
        title: options.title || 'Confirmação',
        body: options.body || 'Deseja realmente prosseguir?',
        size: options.size || '',
        headerClass: options.headerClass || '',
        centered: options.centered !== false,
        buttons: [
          {
            label: options.textCancel || options.textFalse || 'Cancelar',
            class: options.classCancel || 'btn-outline-secondary',
            onClick: function () {
              confirmed = false;
            }
          },
          {
            label: options.textConfirm || options.textTrue || 'Confirmar',
            class: options.classConfirm || 'btn-primary',
            onClick: function () {
              confirmed = true;
            }
          }
        ],
        onClose: function () {
          if (typeof options.onClose === 'function') options.onClose(confirmed);
          resolve(confirmed);
        }
      });
    });
  };

  /**
   * Diálogo de entrada de texto (Prompt Dialog)
   * @param {Object|string} options
   * @returns {Promise<string|null>}
   */
  DexterModal.prompt = function (options) {
    if (typeof options === 'string') {
      options = { body: options };
    }
    return new Promise(function (resolve) {
      var inputId = 'dx_prompt_input_' + Math.random().toString(36).substr(2, 9);
      var inputType = options.type || 'text';
      var defaultValue = options.value || '';
      var placeholder = options.placeholder || '';
      var submittedValue = null;

      var bodyHtml = '<div class="mb-3">' +
        (options.body ? '<p class="text-muted mb-2">' + options.body + '</p>' : '') +
        '<input type="' + inputType + '" id="' + inputId + '" class="form-control" value="' + defaultValue + '" placeholder="' + placeholder + '">' +
        '</div>';

      var modalRef = DexterModal.show({
        title: options.title || 'Informação Requerida',
        body: bodyHtml,
        size: options.size || '',
        headerClass: options.headerClass || '',
        centered: options.centered !== false,
        buttons: [
          {
            label: options.textCancel || 'Cancelar',
            class: 'btn-outline-secondary',
            onClick: function () {
              submittedValue = null;
            }
          },
          {
            label: options.textOk || 'Confirmar',
            class: options.classOk || 'btn-primary',
            onClick: function (e, instance) {
              var input = instance.element.querySelector('#' + inputId);
              submittedValue = input ? input.value : '';
            }
          }
        ],
        onShown: function (instance) {
          var input = instance.element.querySelector('#' + inputId);
          if (input) {
            input.focus();
            input.select();
            input.addEventListener('keydown', function (e) {
              if (e.key === 'Enter') {
                e.preventDefault();
                submittedValue = input.value;
                instance.hide();
              }
            });
          }
        },
        onClose: function () {
          if (typeof options.onClose === 'function') options.onClose(submittedValue);
          resolve(submittedValue);
        }
      });
    });
  };

  /**
   * Inicialização automática para elementos estáticos com data-dx-toggle="modal"
   */
  DexterModal.initAll = function (root) {
    var container = root || document;
    var triggers = container.querySelectorAll('[data-dx-toggle="modal"], [data-bs-toggle="modal"], [data-toggle="modal"]');

    triggers.forEach(function (btn) {
      if (!btn._dxModalBound) {
        btn._dxModalBound = true;
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var targetSelector = btn.getAttribute('data-dx-target') ||
                               btn.getAttribute('data-bs-target') ||
                               btn.getAttribute('data-target') ||
                               btn.getAttribute('href');

          if (targetSelector && targetSelector !== '#') {
            var targetModal = document.querySelector(targetSelector);
            if (targetModal) {
              var instance = DexterModal.getOrCreateInstance(targetModal);
              instance.show();
            }
          }
        });
      }
    });
  };

  // Auto-init no DOMContentLoaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        DexterModal.initAll();
      });
    } else {
      DexterModal.initAll();
    }
  }

  return DexterModal;
});
