/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-waiting.js
 * @description [PT-BR] Controlador nativo zero-dependência para Diálogo Modal de Espera
 *              e Progresso Assíncrono (inspirado e compatível drop-in com
 *              ehpc/bootstrap-waitingfor / waitingDialog). Suporta mensagens dinâmicas,
 *              progresso determinado (0..100%), execução automática com Promises (run()),
 *              loaders integrados, modo cancelável, 28 cores + semânticas e Dark Mode.
 *              [EN]    Zero-dependency native controller for Waiting & Async Progress Modal
 *              Dialog (inspired and drop-in compatible with ehpc/bootstrap-waitingfor /
 *              waitingDialog). Features live message/header updates, determinate progress
 *              (0..100%), Promise runner (run()), integrated CSS loaders, cancellable mode,
 *              28 official + semantic colors and native Dark Mode support.
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
    global.DexterWaiting = api;
    global.waitingDialog = api;
    global.dexter = global.dexter || {};
    global.dexter.Waiting = api;
    global.dexter.waitingDialog = api;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var modalEl = null;
  var backdropEl = null;
  var headerEl = null;
  var headingEl = null;
  var contentEl = null;
  var barEl = null;
  var percentEl = null;
  var currentSettings = null;
  var openState = false;
  var hideFired = false;
  var escListener = null;

  function dispatch(name, detail) {
    if (typeof document === 'undefined') return;
    document.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail || {} }));
  }

  function clampHeaderSize(size) {
    var num = parseInt(size, 10);
    if (isNaN(num) || num < 1) return 3;
    if (num > 6) return 6;
    return num;
  }

  function normalizeSizeClass(size) {
    var s = String(size || 'm').toLowerCase();
    if (s === 'sm' || s === 's') return 'dx-wf-sm';
    if (s === 'lg' || s === 'l') return 'dx-wf-lg';
    if (s === 'xl') return 'dx-wf-xl';
    if (s === 'md' || s === 'm') return 'dx-wf-m';
    return 'dx-wf-m';
  }

  function clampPercent(val) {
    var num = Number(val);
    if (isNaN(num)) return 0;
    return Math.max(0, Math.min(100, num));
  }

  function removeDomNodes() {
    if (escListener && typeof document !== 'undefined') {
      document.removeEventListener('keydown', escListener);
      escListener = null;
    }
    if (modalEl && modalEl.parentNode) {
      modalEl.parentNode.removeChild(modalEl);
    }
    if (backdropEl && backdropEl.parentNode) {
      backdropEl.parentNode.removeChild(backdropEl);
    }
    var stale = typeof document !== 'undefined' && currentSettings && currentSettings.modalId
      ? document.getElementById(currentSettings.modalId)
      : (typeof document !== 'undefined' ? document.getElementById('bootstrapWaitingforModal') : null);
    if (stale && stale !== modalEl && stale.parentNode) {
      stale.parentNode.removeChild(stale);
    }
    modalEl = null;
    backdropEl = null;
    headerEl = null;
    headingEl = null;
    contentEl = null;
    barEl = null;
    percentEl = null;
  }

  var DexterWaiting = {
    /**
     * Exibe o diálogo modal de espera / progresso
     */
    show: function (message, options) {
      if (typeof document === 'undefined') return null;
      if (typeof message === 'undefined') {
        message = 'Carregando...';
      }

      var settings = Object.assign({
        headerText: '',
        headerSize: 3,
        headerClass: '',
        dialogSize: 'm',
        progressType: '',
        contentElement: 'p',
        contentClass: 'content',
        onHide: null,
        onShow: null,
        nonce: null,
        progress: null,
        showPercent: false,
        loader: null,
        striped: true,
        animated: true,
        cancellable: false,
        cancelText: 'Cancelar',
        onCancel: null,
        backdrop: 'static',
        modalId: 'bootstrapWaitingforModal'
      }, options || {});

      currentSettings = settings;
      hideFired = false;
      removeDomNodes();

      var accentName = settings.progressType ? String(settings.progressType).toLowerCase() : 'primary';
      var headingTag = 'h' + clampHeaderSize(settings.headerSize);

      // Backdrop
      backdropEl = document.createElement('div');
      backdropEl.className = 'dx-waiting-backdrop';
      if (settings.backdrop !== 'static' && settings.backdrop !== false) {
        backdropEl.addEventListener('click', function () {
          DexterWaiting.hide();
        });
      }
      document.body.appendChild(backdropEl);

      // Modal Overlay
      modalEl = document.createElement('div');
      modalEl.id = settings.modalId;
      modalEl.className = 'dx-waiting-modal dx-wf-accent-' + accentName;
      modalEl.setAttribute('role', 'dialog');
      modalEl.setAttribute('aria-modal', 'true');
      modalEl.setAttribute('tabindex', '-1');
      if (settings.nonce) {
        modalEl.setAttribute('nonce', settings.nonce);
      }

      // Dialog card
      var dialog = document.createElement('div');
      dialog.className = 'dx-wf-dialog ' + normalizeSizeClass(settings.dialogSize);

      // Header
      headerEl = document.createElement('div');
      headerEl.className = 'dx-wf-header';
      if (settings.nonce) headerEl.setAttribute('nonce', settings.nonce);

      var headerStart = document.createElement('div');
      headerStart.className = 'dx-wf-header-start';

      if (settings.loader) {
        var loaderWrap = document.createElement('div');
        loaderWrap.className = 'dx-wf-loader-wrap';
        var loaderEl = document.createElement('span');
        var loaderCls = String(settings.loader);
        loaderEl.className = loaderCls.indexOf('loader') === 0 || loaderCls.indexOf('lds-') === 0
          ? (loaderCls === 'loader' || loaderCls.indexOf('lds-') === 0 ? loaderCls : 'loader ' + loaderCls)
          : 'loader ' + loaderCls;
        loaderWrap.appendChild(loaderEl);
        headerStart.appendChild(loaderWrap);
      }

      headingEl = document.createElement(headingTag);
      headingEl.id = settings.modalId + '-title';
      if (settings.headerClass) {
        headingEl.className = settings.headerClass;
      }
      headerStart.appendChild(headingEl);
      headerEl.appendChild(headerStart);

      if (settings.showPercent) {
        percentEl = document.createElement('span');
        percentEl.className = 'dx-wf-percent';
        var initialPct = settings.progress !== null && settings.progress !== undefined
          ? Math.round(clampPercent(settings.progress))
          : 0;
        percentEl.textContent = initialPct + '%';
        headerEl.appendChild(percentEl);
      }

      modalEl.setAttribute('aria-labelledby', headingEl.id);

      // Body
      var bodyEl = document.createElement('div');
      bodyEl.className = 'dx-wf-body';

      contentEl = document.createElement(settings.contentElement || 'p');
      if (settings.contentClass) {
        contentEl.className = settings.contentClass;
      }

      if (settings.headerText === false) {
        headerEl.style.display = 'none';
        contentEl.innerHTML = message;
        bodyEl.appendChild(contentEl);
      } else if (settings.headerText) {
        headingEl.innerHTML = settings.headerText;
        contentEl.innerHTML = message;
        bodyEl.appendChild(contentEl);
      } else {
        headingEl.innerHTML = message;
      }

      // Progress bar
      var progressTrack = document.createElement('div');
      progressTrack.className = 'dx-wf-progress';
      if (settings.nonce) progressTrack.setAttribute('nonce', settings.nonce);

      barEl = document.createElement('div');
      var barClasses = ['dx-wf-bar'];
      if (settings.striped) barClasses.push('is-striped');
      if (settings.animated) barClasses.push('is-animated');
      barEl.className = barClasses.join(' ');
      barEl.setAttribute('role', 'progressbar');
      barEl.setAttribute('aria-valuemin', '0');
      barEl.setAttribute('aria-valuemax', '100');

      var hasDeterminate = settings.progress !== null && settings.progress !== undefined;
      var pct = hasDeterminate ? clampPercent(settings.progress) : 100;
      barEl.style.width = pct + '%';
      barEl.setAttribute('aria-valuenow', String(hasDeterminate ? Math.round(pct) : 100));
      if (settings.nonce) barEl.setAttribute('nonce', settings.nonce);

      progressTrack.appendChild(barEl);
      bodyEl.appendChild(progressTrack);

      dialog.appendChild(headerEl);
      dialog.appendChild(bodyEl);

      // Optional Cancellable Footer
      if (settings.cancellable) {
        var footerEl = document.createElement('div');
        footerEl.className = 'dx-wf-footer';
        var cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn btn-sm btn-outline-secondary dx-wf-cancel-btn';
        cancelBtn.textContent = settings.cancelText || 'Cancelar';
        cancelBtn.addEventListener('click', function () {
          if (typeof settings.onCancel === 'function') {
            settings.onCancel(modalEl);
          }
          dispatch('dx:waiting:cancel', { element: modalEl });
          DexterWaiting.hide();
        });
        footerEl.appendChild(cancelBtn);
        dialog.appendChild(footerEl);
      }

      modalEl.appendChild(dialog);
      document.body.appendChild(modalEl);

      if (settings.backdrop !== 'static' && settings.backdrop !== false) {
        escListener = function (e) {
          if (e.key === 'Escape' && openState) {
            DexterWaiting.hide();
          }
        };
        document.addEventListener('keydown', escListener);
      }

      backdropEl.classList.add('is-open', 'show');
      modalEl.classList.add('is-open', 'show');
      modalEl.setAttribute('aria-hidden', 'false');
      openState = true;

      if (typeof settings.onShow === 'function') {
        settings.onShow(modalEl);
      }
      dispatch('dx:waiting:show', { element: modalEl, settings: settings });

      return modalEl;
    },

    /**
     * Fecha o diálogo modal
     */
    hide: function (cb) {
      if (escListener && typeof document !== 'undefined') {
        document.removeEventListener('keydown', escListener);
        escListener = null;
      }

      if (backdropEl) {
        backdropEl.classList.remove('is-open', 'show');
      }
      if (modalEl) {
        modalEl.classList.remove('is-open', 'show');
        modalEl.setAttribute('aria-hidden', 'true');
      }

      openState = false;

      if (!hideFired) {
        hideFired = true;
        if (currentSettings && typeof currentSettings.onHide === 'function') {
          currentSettings.onHide(modalEl);
        }
        dispatch('dx:waiting:hide', { element: modalEl });
      }

      if (typeof cb === 'function') {
        cb(modalEl);
      }
    },

    /**
     * Lê ou atualiza dinamicamente a mensagem principal exibida no diálogo
     */
    message: function (newMessage) {
      if (!modalEl || !currentSettings) return undefined;
      var targetEl = (currentSettings.headerText === false || currentSettings.headerText)
        ? contentEl
        : headingEl;
      if (!targetEl) return undefined;

      if (typeof newMessage === 'undefined') {
        return targetEl.innerHTML;
      }
      targetEl.innerHTML = newMessage;
      return targetEl;
    },

    /**
     * Atualiza dinamicamente o título do cabeçalho
     */
    header: function (newHeaderText) {
      if (!headingEl || !headerEl) return undefined;
      if (typeof newHeaderText === 'undefined') {
        return headingEl.innerHTML;
      }
      if (newHeaderText === false) {
        headerEl.style.display = 'none';
      } else {
        headerEl.style.removeProperty('display');
        headingEl.innerHTML = newHeaderText;
      }
      return headingEl;
    },

    /**
     * Atualiza dinamicamente o percentual (0..100) da barra de progresso
     */
    progress: function (percent, optionalMessage) {
      var val = clampPercent(percent);
      if (barEl) {
        barEl.style.width = val + '%';
        barEl.setAttribute('aria-valuenow', String(Math.round(val)));
      }
      if (percentEl) {
        percentEl.textContent = Math.round(val) + '%';
      }
      if (typeof optionalMessage !== 'undefined') {
        DexterWaiting.message(optionalMessage);
      }
      return val;
    },

    /**
     * Retorna se o diálogo está visível no momento
     */
    isVisible: function () {
      return Boolean(openState);
    },

    /**
     * Executa uma Promise ou função assíncrona exibindo o diálogo e fechando ao concluir
     */
    run: function (promiseOrFn, message, options) {
      DexterWaiting.show(message, options);
      var task;
      try {
        task = typeof promiseOrFn === 'function'
          ? promiseOrFn(DexterWaiting)
          : Promise.resolve(promiseOrFn);
      } catch (err) {
        DexterWaiting.hide();
        return Promise.reject(err);
      }

      return Promise.resolve(task).then(
        function (res) {
          DexterWaiting.hide();
          return res;
        },
        function (err) {
          DexterWaiting.hide();
          throw err;
        }
      );
    },

    /**
     * Encerra e remove completamente os nós DOM da instância
     */
    destroy: function () {
      DexterWaiting.hide();
      removeDomNodes();
      currentSettings = null;
    }
  };

  return DexterWaiting;
});
