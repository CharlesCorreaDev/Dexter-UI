/**
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-toast.js
 * @description [PT-BR] Controlador nativo zero-dependência para Notificações Toast
 *              e Snackbars do Dexter UI. Inspirado e aprimorado a partir do
 *              chrisgo/bootstrap5-toast e Script47/Toast. Oferece grid de 9 posições,
 *              barra de progresso temporal animada (countdown), pausa ao passar o mouse,
 *              avatares/ícones SVG integrados, botões de ação com callbacks, snacks compactos,
 *              gerenciamento de empilhamento (stackable/maxToasts) e integração opcional com jQuery.
 *              [EN]    Zero-dependency native controller for Dexter UI Toast and
 *              Snackbar notifications. Inspired and enhanced from chrisgo/bootstrap5-toast
 *              and Script47/Toast. Features a 9-position grid, animated countdown progress bar,
 *              pause-on-hover, integrated SVG icons/avatars, action buttons with callbacks,
 *              compact snacks, stacking management and optional jQuery bridge.
 *
 * @author      Charles Corrêa
 * @contact     E-mail: charlescorreaweb@gmail.com
 * @website     https://charlescorrea.com.br
 * @github      https://github.com/CharlesCorreaDev
 *
 * @repository  https://github.com/CharlesCorreaDev/Dexter-UI
 * @copyright   2026 Charles Corrêa. Todos os direitos reservados / All rights reserved.
 * @license     MIT
 * =============================================================================
 */

(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    var instance = factory();
    global.DexterToast = instance;
    global.dxToast = instance;

    // Ponte opcional de retrocompatibilidade para projetos com jQuery
    if (global.jQuery) {
      global.jQuery.toast = function (opts) {
        return instance.show(opts);
      };
      global.jQuery.snack = function (content, type, delay) {
        return instance.snack(content, { type: type, duration: delay });
      };
      global.jQuery.toastDefaults = instance.defaults;
    }
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var toastCount = 0;

  // Ícones SVG oficiais dos tipos semânticos
  var ICONS = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>'
  };

  var CLOSE_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

  // Posições válidas no grid de 9 quadrantes
  var VALID_POSITIONS = [
    'top-right', 'top-left', 'top-center',
    'middle-left', 'middle-center', 'middle-right',
    'bottom-right', 'bottom-left', 'bottom-center'
  ];

  /**
   * Converte nomes ou aliases de posição
   */
  function normalizePosition(pos) {
    if (!pos) return 'top-right';
    var p = pos.toLowerCase().trim().replace('_', '-');
    if (VALID_POSITIONS.indexOf(p) !== -1) return p;
    if (p.includes('top') && p.includes('end')) return 'top-right';
    if (p.includes('top') && p.includes('start')) return 'top-left';
    if (p.includes('bottom') && p.includes('end')) return 'bottom-right';
    if (p.includes('bottom') && p.includes('start')) return 'bottom-left';
    return 'top-right';
  }

  /**
   * Obtém ou cria o contêiner de toasts para a posição especificada
   */
  function getContainer(position) {
    var pos = normalizePosition(position);
    var selector = '.toast-container.' + pos;
    var container = document.querySelector(selector);

    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container ' + pos;
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }

    return container;
  }

  var DexterToast = {
    defaults: {
      position: 'top-right',
      duration: 5000, // milissegundos (0 = persistente)
      dismissible: true,
      stackable: true,
      maxToasts: 5,
      pauseDelayOnHover: true,
      progressBar: true,
      theme: 'default', // 'default' | 'soft' | 'glass' | 'solid'
      color: null,      // 'primary', 'coral', 'green', etc. (28 cores)
      type: null,       // 'info', 'success', 'warning', 'error', 'danger'
      icon: true,       // true (usa preset) | false | string (HTML/SVG customizado)
      subtitle: null,
      actions: null,    // [{ text: 'Texto', class: 'btn...', onClick: fn }]
      onShow: null,
      onHide: null
    },

    /**
     * Exibe um Toast completo com título, corpo, barra de progresso e ações
     * @param {Object} options Configurações do Toast
     * @returns {HTMLElement} Elemento Toast criado
     */
    show: function (options) {
      var opts = Object.assign({}, this.defaults, options);
      toastCount++;
      var id = opts.id || 'dx-toast-' + toastCount;

      var container = getContainer(opts.position);

      // Limita quantidade de toasts na tela se stackable
      if (!opts.stackable) {
        var existing = container.querySelectorAll('.toast');
        existing.forEach(function (t) {
          DexterToast.hide(t);
        });
      } else if (opts.maxToasts > 0) {
        var activeToasts = container.querySelectorAll('.toast:not(.hide)');
        if (activeToasts.length >= opts.maxToasts) {
          DexterToast.hide(activeToasts[0]);
        }
      }

      // Criação do elemento Toast
      var toastEl = document.createElement('div');
      toastEl.id = id;
      toastEl.className = 'toast showing';
      toastEl.setAttribute('role', opts.type === 'error' || opts.type === 'danger' ? 'alert' : 'status');
      toastEl.setAttribute('aria-live', opts.type === 'error' || opts.type === 'danger' ? 'assertive' : 'polite');
      toastEl.setAttribute('aria-atomic', 'true');

      // Aplicação de temas e cores da paleta
      var semanticMap = { error: 'danger', danger: 'danger', success: 'success', warning: 'warning', info: 'info' };
      var colorName = opts.color || (opts.type && semanticMap[opts.type]) || null;
      if (opts.theme === 'glass') {
        toastEl.classList.add('toast-glass');
      } else if (opts.theme === 'soft' && colorName) {
        toastEl.classList.add('toast-soft-' + colorName);
      } else if (colorName) {
        toastEl.classList.add('toast-' + colorName);
      }

      if (opts.class) {
        toastEl.classList.add(opts.class);
      }

      // Montagem do Ícone
      var iconHtml = '';
      if (opts.icon === true) {
        var iconSvg = ICONS[opts.type] || ICONS[opts.color] || ICONS.info;
        iconHtml = '<span class="toast-icon">' + iconSvg + '</span>';
      } else if (typeof opts.icon === 'string') {
        iconHtml = '<span class="toast-icon">' + opts.icon + '</span>';
      }

      // Montagem do Cabeçalho
      var headerHtml = '';
      if (opts.title) {
        var subtitleHtml = opts.subtitle ? '<small class="toast-subtitle">' + opts.subtitle + '</small>' : '';
        var closeBtnHtml = opts.dismissible ? '<button type="button" class="btn-close" aria-label="Fechar">' + CLOSE_ICON + '</button>' : '';

        headerHtml = '<div class="toast-header">' +
          iconHtml +
          '<strong class="toast-title">' + opts.title + '</strong>' +
          subtitleHtml +
          closeBtnHtml +
          '</div>';
      }

      // Montagem do Corpo
      var bodyHtml = '';
      var contentText = opts.content || opts.message || '';
      var actionsHtml = '';

      if (opts.actions && Array.isArray(opts.actions)) {
        actionsHtml = '<div class="toast-actions">';
        opts.actions.forEach(function (act, actIndex) {
          var btnClass = act.class || 'btn btn-sm btn-primary';
          actionsHtml += '<button type="button" class="' + btnClass + '" data-action-index="' + actIndex + '">' + act.text + '</button>';
        });
        actionsHtml += '</div>';
      }

      // Se não houver cabeçalho, botão de fechar fica no corpo
      if (!opts.title && opts.dismissible) {
        bodyHtml = '<div class="toast-body d-flex align-items-center justify-content-between">' +
          '<div class="d-flex align-items-center gap-2">' +
          iconHtml +
          '<div>' + contentText + actionsHtml + '</div>' +
          '</div>' +
          '<button type="button" class="btn-close ms-2" aria-label="Fechar">' + CLOSE_ICON + '</button>' +
          '</div>';
      } else if (contentText || actionsHtml) {
        bodyHtml = '<div class="toast-body">' + contentText + actionsHtml + '</div>';
      }

      // Barra de Progresso
      var progressHtml = opts.progressBar && opts.duration > 0 ? '<div class="toast-progress"></div>' : '';

      toastEl.innerHTML = headerHtml + bodyHtml + progressHtml;

      // Inserção no contêiner
      container.appendChild(toastEl);

      // Evento dos botões de ação
      if (opts.actions && Array.isArray(opts.actions)) {
        var actBtns = toastEl.querySelectorAll('.toast-actions button');
        actBtns.forEach(function (btn) {
          btn.addEventListener('click', function (e) {
            var idx = parseInt(btn.getAttribute('data-action-index'), 10);
            if (opts.actions[idx] && typeof opts.actions[idx].onClick === 'function') {
              opts.actions[idx].onClick(toastEl, e);
            }
          });
        });
      }

      // Evento de fechar manual
      var closeBtn = toastEl.querySelector('.btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          DexterToast.hide(toastEl, opts);
        });
      }

      // Animação de entrada
      requestAnimationFrame(function () {
        toastEl.classList.remove('showing');
        toastEl.classList.add('show');
        if (typeof opts.onShow === 'function') {
          opts.onShow(toastEl);
        }
      });

      // Gerenciamento de Tempo e Pausa no Hover
      if (opts.duration > 0) {
        var remainingTime = opts.duration;
        var startTime = Date.now();
        var timerId = null;
        var progressBar = toastEl.querySelector('.toast-progress');

        if (progressBar) {
          progressBar.style.transition = 'width ' + opts.duration + 'ms linear';
          requestAnimationFrame(function () {
            progressBar.style.width = '0%';
          });
        }

        var startTimer = function () {
          startTime = Date.now();
          timerId = setTimeout(function () {
            DexterToast.hide(toastEl, opts);
          }, remainingTime);
        };

        var pauseTimer = function () {
          clearTimeout(timerId);
          var elapsed = Date.now() - startTime;
          remainingTime = Math.max(0, remainingTime - elapsed);
          if (progressBar) {
            var computedStyle = window.getComputedStyle(progressBar);
            progressBar.style.transition = 'none';
            progressBar.style.width = computedStyle.width;
          }
        };

        var resumeTimer = function () {
          if (progressBar) {
            progressBar.style.transition = 'width ' + remainingTime + 'ms linear';
            requestAnimationFrame(function () {
              progressBar.style.width = '0%';
            });
          }
          startTimer();
        };

        startTimer();

        if (opts.pauseDelayOnHover) {
          toastEl.addEventListener('mouseenter', pauseTimer);
          toastEl.addEventListener('mouseleave', resumeTimer);
        }
      }

      return toastEl;
    },

    /**
     * Exibe um Snackbar compacto / pílula
     * @param {string} message Mensagem do snackbar
     * @param {Object} options Configurações adicionais
     */
    snack: function (message, options) {
      var opts = Object.assign({}, this.defaults, {
        duration: 4000,
        progressBar: false,
        theme: 'default'
      }, options);

      var container = getContainer(opts.position);
      toastCount++;
      var id = opts.id || 'dx-snack-' + toastCount;

      var toastEl = document.createElement('div');
      toastEl.id = id;
      toastEl.className = 'toast toast-snack showing';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');

      var colorName = opts.color || (opts.type === 'error' ? 'danger' : opts.type);
      if (opts.theme === 'glass') {
        toastEl.classList.add('toast-glass');
      } else if (opts.theme === 'soft' && colorName) {
        toastEl.classList.add('toast-soft-' + colorName);
      } else if (colorName) {
        toastEl.classList.add('toast-' + colorName);
      }

      var iconSvg = ICONS[opts.type] || ICONS[opts.color] || ICONS.info;
      var iconHtml = opts.icon !== false ? '<span class="toast-snack-icon me-2">' + iconSvg + '</span>' : '';
      var closeHtml = opts.dismissible ? '<button type="button" class="btn-close" aria-label="Fechar">' + CLOSE_ICON + '</button>' : '';

      toastEl.innerHTML = '<div class="toast-content-wrapper">' +
        '<div class="d-flex align-items-center">' +
        iconHtml +
        '<span class="toast-snack-text">' + message + '</span>' +
        '</div>' +
        closeHtml +
        '</div>';

      container.appendChild(toastEl);

      var closeBtn = toastEl.querySelector('.btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          DexterToast.hide(toastEl, opts);
        });
      }

      requestAnimationFrame(function () {
        toastEl.classList.remove('showing');
        toastEl.classList.add('show');
      });

      if (opts.duration > 0) {
        setTimeout(function () {
          DexterToast.hide(toastEl, opts);
        }, opts.duration);
      }

      return toastEl;
    },

    /**
     * Oculta e remove suavemente um Toast do DOM
     * @param {HTMLElement} toastEl Elemento do toast
     * @param {Object} opts Configurações opcionais
     */
    hide: function (toastEl, opts) {
      if (!toastEl || toastEl.classList.contains('hide')) return;

      toastEl.classList.remove('show');
      toastEl.classList.add('hide');

      if (opts && typeof opts.onHide === 'function') {
        opts.onHide(toastEl);
      }

      setTimeout(function () {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      }, 300);
    },

    /**
     * Atalhos de conveniência semânticos
     */
    success: function (title, content, options) {
      return this.show(Object.assign({ type: 'success', title: title, content: content }, options));
    },

    error: function (title, content, options) {
      return this.show(Object.assign({ type: 'error', title: title, content: content }, options));
    },

    warning: function (title, content, options) {
      return this.show(Object.assign({ type: 'warning', title: title, content: content }, options));
    },

    info: function (title, content, options) {
      return this.show(Object.assign({ type: 'info', title: title, content: content }, options));
    },

    /**
     * Limpa todos os toasts de uma posição ou da página inteira
     * @param {string} [position] Posição opcional
     */
    clear: function (position) {
      var selector = position ? '.toast-container.' + normalizePosition(position) + ' .toast' : '.toast-container .toast';
      document.querySelectorAll(selector).forEach(function (t) {
        DexterToast.hide(t);
      });
    }
  };

  return DexterToast;
});
