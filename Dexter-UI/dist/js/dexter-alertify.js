/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-alertify.js
 * @description [PT-BR] Motor completo de diálogos (Alert, Confirm, Prompt),
 *              Notificador flutuante (6 posições) e Dialog Factory customizável
 *              100% Vanilla JS, inspirado e compatível drop-in com AlertifyJS.
 *              Suporta drag-and-drop, maximização, redimensionamento, frameless,
 *              basic, tema Bootstrap, 28 cores oficiais + semânticas e Dark Mode.
 *              [EN]    Complete zero-dependency Vanilla JS Dialog engine (Alert,
 *              Confirm, Prompt), floating Notifier (6 positions) and custom
 *              Dialog Factory inspired and drop-in compatible with AlertifyJS.
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
    module.exports = factory(global);
  } else if (typeof define === 'function' && define.amd) {
    define([], function () { return factory(global); });
  } else {
    var api = factory(global);
    global.DexterAlertify = api;
    global.alertify = api;
    if (global.dexter && typeof global.dexter === 'object') {
      global.dexter.alertify = api;
    }
  }
})(typeof window !== 'undefined' ? window : this, function (global) {
  'use strict';

  var TRANSITIONS = ['pulse', 'zoom', 'fade', 'slide'];
  var POSITIONS = ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'];

  var defaults = {
    autoReset: true,
    basic: false,
    closable: true,
    closableByDimmer: true,
    frameless: false,
    maintainFocus: true,
    maximizable: true,
    modal: true,
    movable: true,
    moveBounded: false,
    overflow: true,
    padding: true,
    pinnable: true,
    pinned: true,
    resizable: false,
    startMaximized: false,
    transition: 'pulse',
    accent: 'primary',
    glossary: {
      title: 'Dexter UI',
      ok: 'OK',
      cancel: 'Cancelar',
      aok: 'OK',
      acancel: 'Cancelar'
    },
    theme: {
      input: 'ajs-input',
      ok: 'ajs-ok',
      cancel: 'ajs-cancel'
    },
    notifier: {
      delay: 5,
      position: 'bottom-right',
      closeButton: false
    }
  };

  function cloneDefaults(extra) {
    return {
      autoReset: defaults.autoReset,
      basic: defaults.basic,
      closable: defaults.closable,
      closableByDimmer: defaults.closableByDimmer,
      frameless: defaults.frameless,
      maintainFocus: defaults.maintainFocus,
      maximizable: defaults.maximizable,
      modal: defaults.modal,
      movable: defaults.movable,
      moveBounded: defaults.moveBounded,
      overflow: defaults.overflow,
      padding: defaults.padding,
      pinnable: defaults.pinnable,
      pinned: defaults.pinned,
      resizable: defaults.resizable,
      startMaximized: defaults.startMaximized,
      transition: defaults.transition,
      accent: defaults.accent,
      glossary: Object.assign({}, defaults.glossary),
      theme: Object.assign({}, defaults.theme),
      label: null,
      labels: null,
      reverseButtons: false,
      defaultFocus: 'ok',
      type: 'text',
      placeholder: '',
      value: '',
      onok: null,
      oncancel: null,
      onshow: null,
      onclose: null,
      onmaximize: null,
      onrestore: null,
      message: '',
      title: defaults.glossary.title
    };
  }

  function assignExtra(target, extra) {
    if (!extra || typeof extra !== 'object') return target;
    Object.keys(extra).forEach(function (k) {
      if (k === 'glossary' || k === 'theme' || k === 'labels') {
        target[k] = Object.assign({}, target[k] || {}, extra[k]);
      } else {
        target[k] = extra[k];
      }
    });
    return target;
  }

  function setHtmlOrNode(el, value) {
    if (!el) return;
    if (value && typeof value === 'object' && value.nodeType) {
      el.innerHTML = '';
      el.appendChild(value);
    } else {
      el.innerHTML = value == null ? '' : String(value);
    }
  }

  var openDialogs = [];
  var registry = {};
  var singletons = {};

  function DialogInstance(name, descriptor) {
    this.__name = name;
    this.__descriptor = descriptor || {};
    this.__settings = cloneDefaults();
    this.__internal = {
      isOpen: false,
      isMaximized: false,
      built: false,
      buttons: [],
      tx: 0,
      ty: 0,
      closeTimer: null,
      prevFocus: null,
      hooks: this.__descriptor.hooks || {}
    };
    this.elements = {};

    if (typeof this.__descriptor.setup === 'function') {
      var setupCfg = this.__descriptor.setup.call(this) || {};
      this.__setup = setupCfg;
      if (setupCfg.options) {
        assignExtra(this.__settings, setupCfg.options);
      }
      if (Array.isArray(setupCfg.buttons)) {
        this.__internal.buttons = setupCfg.buttons.slice();
      }
    } else {
      this.__setup = {};
    }

    if (this.__descriptor.settings && typeof this.__descriptor.settings === 'object') {
      assignExtra(this.__settings, this.__descriptor.settings);
    }
  }

  DialogInstance.prototype._build = function () {
    if (this.__internal.built || typeof document === 'undefined') return;
    var root = document.createElement('div');
    root.className = 'alertify ajs-hidden';
    root.setAttribute('data-ajs-dialog', this.__name);

    var dimmer = document.createElement('div');
    dimmer.className = 'ajs-dimmer';

    var modal = document.createElement('div');
    modal.className = 'ajs-modal';
    modal.setAttribute('tabindex', '-1');

    var dialog = document.createElement('div');
    dialog.className = 'ajs-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('tabindex', '-1');

    var commands = document.createElement('div');
    commands.className = 'ajs-commands';

    var btnPin = document.createElement('button');
    btnPin.type = 'button';
    btnPin.className = 'ajs-pin';
    btnPin.setAttribute('aria-label', 'Fixar diálogo');
    btnPin.setAttribute('title', 'Fixar');
    btnPin.innerHTML = '&#128204;';

    var btnMax = document.createElement('button');
    btnMax.type = 'button';
    btnMax.className = 'ajs-maximize';
    btnMax.setAttribute('aria-label', 'Maximizar');
    btnMax.setAttribute('title', 'Maximizar / Restaurar');
    btnMax.innerHTML = '&#9744;';

    var btnClose = document.createElement('button');
    btnClose.type = 'button';
    btnClose.className = 'ajs-close';
    btnClose.setAttribute('aria-label', 'Fechar');
    btnClose.setAttribute('title', 'Fechar');
    btnClose.innerHTML = '&times;';

    commands.appendChild(btnPin);
    commands.appendChild(btnMax);
    commands.appendChild(btnClose);

    var header = document.createElement('div');
    header.className = 'ajs-header';

    var body = document.createElement('div');
    body.className = 'ajs-body';

    var content = document.createElement('div');
    content.className = 'ajs-content';
    body.appendChild(content);

    var footer = document.createElement('div');
    footer.className = 'ajs-footer';

    var auxBtns = document.createElement('div');
    auxBtns.className = 'ajs-auxiliary';

    var primBtns = document.createElement('div');
    primBtns.className = 'ajs-primary';

    footer.appendChild(auxBtns);
    footer.appendChild(primBtns);

    var handle = document.createElement('div');
    handle.className = 'ajs-handle';
    handle.setAttribute('aria-hidden', 'true');

    dialog.appendChild(commands);
    dialog.appendChild(header);
    dialog.appendChild(body);
    dialog.appendChild(footer);
    dialog.appendChild(handle);
    modal.appendChild(dialog);
    root.appendChild(dimmer);
    root.appendChild(modal);
    document.body.appendChild(root);

    this.elements = {
      root: root,
      dimmer: dimmer,
      modal: modal,
      dialog: dialog,
      header: header,
      body: body,
      content: content,
      footer: footer,
      handle: handle,
      buttons: {
        auxiliary: auxBtns,
        primary: primBtns
      },
      commands: {
        container: commands,
        pin: btnPin,
        maximize: btnMax,
        close: btnClose
      }
    };

    this._bindEvents();
    if (typeof this.__descriptor.build === 'function') {
      this.__descriptor.build.call(this);
    }
    this.__internal.built = true;
  };

  DialogInstance.prototype._bindEvents = function () {
    var self = this;
    var els = this.elements;

    els.dimmer.addEventListener('click', function () {
      if (self.__settings.closable && self.__settings.closableByDimmer) {
        self._triggerCloseButton(null, -1);
      } else {
        els.root.classList.remove('ajs-shake');
        void els.root.offsetWidth;
        els.root.classList.add('ajs-shake');
      }
    });

    els.commands.close.addEventListener('click', function () {
      if (self.__settings.closable) {
        self._triggerCloseButton(null, -1);
      }
    });

    els.commands.maximize.addEventListener('click', function () {
      if (!self.__settings.maximizable) return;
      if (self.__internal.isMaximized) {
        self.restore();
      } else {
        self.maximize();
      }
    });

    els.commands.pin.addEventListener('click', function () {
      self.__settings.pinned = !self.__settings.pinned;
      self._syncVisualState();
    });

    els.header.addEventListener('dblclick', function (e) {
      if (e.target && e.target.closest('.ajs-commands')) return;
      if (self.__settings.maximizable) {
        if (self.__internal.isMaximized) self.restore();
        else self.maximize();
      }
    });

    // Arrastar pelo cabeçalho (Movable) | Header drag support
    els.header.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || !self.__settings.movable || self.__internal.isMaximized) return;
      if (e.target && e.target.closest('button, a, input')) return;
      e.preventDefault();
      var startX = e.clientX;
      var startY = e.clientY;
      var baseTx = self.__internal.tx;
      var baseTy = self.__internal.ty;

      function onMove(ev) {
        var nextTx = baseTx + (ev.clientX - startX);
        var nextTy = baseTy + (ev.clientY - startY);
        self.moveTo(nextTx, nextTy);
      }
      function onUp() {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      }
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });

    // Redimensionar pela alça (Resizable) | Corner resize handle
    els.handle.addEventListener('pointerdown', function (e) {
      if (e.button !== 0 || !self.__settings.resizable || self.__internal.isMaximized) return;
      e.preventDefault();
      var rect = els.dialog.getBoundingClientRect();
      var startX = e.clientX;
      var startY = e.clientY;
      var startW = rect.width;
      var startH = rect.height;

      function onMove(ev) {
        var w = Math.max(280, Math.min(window.innerWidth - 24, startW + (ev.clientX - startX)));
        var h = Math.max(170, Math.min(window.innerHeight - 24, startH + (ev.clientY - startY)));
        self.resizeTo(Math.round(w) + 'px', Math.round(h) + 'px');
      }
      function onUp() {
        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      }
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);
    });
  };

  DialogInstance.prototype._renderButtons = function () {
    var self = this;
    var els = this.elements;
    els.buttons.primary.innerHTML = '';
    els.buttons.auxiliary.innerHTML = '';

    var list = (this.__setup && typeof this.__descriptor.setup === 'function')
      ? (this.__descriptor.setup.call(this).buttons || [])
      : this.__internal.buttons.slice();

    if (this.__settings.reverseButtons && list.length > 1) {
      list = list.slice().reverse();
    }

    this.__renderedButtons = list.map(function (btnCfg, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      var themeClass = btnCfg.scope === 'auxiliary' ? '' : (btnCfg.className || '');
      if (btnCfg.themeKey && defaults.theme[btnCfg.themeKey]) {
        themeClass = defaults.theme[btnCfg.themeKey] + (btnCfg.extraClass ? ' ' + btnCfg.extraClass : '');
      }
      btn.className = ('ajs-button ' + themeClass).trim();
      btn.textContent = btnCfg.text != null ? btnCfg.text : '';
      if (btnCfg.attrs && typeof btnCfg.attrs === 'object') {
        Object.keys(btnCfg.attrs).forEach(function (attr) {
          btn.setAttribute(attr, btnCfg.attrs[attr]);
        });
      }
      btn.addEventListener('click', function () {
        self._triggerCloseButton(btnCfg, idx, btn);
      });

      if (btnCfg.scope === 'auxiliary') {
        els.buttons.auxiliary.appendChild(btn);
      } else {
        els.buttons.primary.appendChild(btn);
      }
      return { cfg: btnCfg, element: btn };
    });
  };

  DialogInstance.prototype._triggerCloseButton = function (btnCfg, idx, btnEl) {
    var cancelFallback = {
      text: this.__settings.glossary.cancel || 'Cancelar',
      scope: 'primary'
    };
    var closeEvent = {
      index: idx,
      button: btnCfg || cancelFallback,
      element: btnEl || null,
      cancel: false
    };

    if (typeof this.__descriptor.callback === 'function') {
      this.__descriptor.callback.call(this, closeEvent);
    }

    if (idx === -1 && typeof this.__settings.oncancel === 'function') {
      this.__settings.oncancel.call(this, closeEvent);
    }

    if (!closeEvent.cancel) {
      this.close();
    }
  };

  DialogInstance.prototype._syncVisualState = function () {
    if (!this.__internal.built) return;
    var els = this.elements;
    var s = this.__settings;
    var root = els.root;

    // Resetar modificadores dinâmicos
    TRANSITIONS.forEach(function (t) { root.classList.remove('ajs-' + t); });
    var trans = TRANSITIONS.indexOf(s.transition) !== -1 ? s.transition : 'pulse';
    root.classList.add('ajs-' + trans);

    Array.prototype.slice.call(root.classList).forEach(function (cls) {
      if (cls.indexOf('ajs-accent-') === 0) root.classList.remove(cls);
    });
    if (s.accent) {
      root.classList.add('ajs-accent-' + s.accent);
    }

    var isBsTheme = defaults.theme && defaults.theme.ok && defaults.theme.ok.indexOf('btn') !== -1;
    root.classList.toggle('ajs-theme-bootstrap', Boolean(isBsTheme));

    root.classList.toggle('ajs-basic', Boolean(s.basic));
    root.classList.toggle('ajs-frameless', Boolean(s.frameless));
    root.classList.toggle('ajs-movable', Boolean(s.movable));
    root.classList.toggle('ajs-resizable', Boolean(s.resizable));
    root.classList.toggle('ajs-no-dimmer', !s.modal);
    root.classList.toggle('ajs-maximized', this.__internal.isMaximized);
    els.dialog.classList.toggle('ajs-maximized', this.__internal.isMaximized);
    els.body.classList.toggle('ajs-no-padding', !s.padding);

    els.commands.pin.style.display = s.pinnable ? '' : 'none';
    els.commands.pin.setAttribute('aria-pressed', s.pinned ? 'true' : 'false');
    els.commands.maximize.style.display = s.maximizable ? '' : 'none';
    els.commands.close.style.display = s.closable ? '' : 'none';
  };

  DialogInstance.prototype.setHeader = function (htmlOrNode) {
    this.__settings.title = htmlOrNode;
    this._build();
    setHtmlOrNode(this.elements.header, htmlOrNode);
    return this;
  };

  DialogInstance.prototype.setContent = function (htmlOrNode) {
    this.__settings.message = htmlOrNode;
    this._build();
    setHtmlOrNode(this.elements.content, htmlOrNode);
    return this;
  };

  DialogInstance.prototype.set = function (keyOrObj, value) {
    if (typeof keyOrObj === 'string') {
      if (keyOrObj === 'title') {
        this.setHeader(value);
      } else if (keyOrObj === 'message') {
        this.setContent(value);
      } else if (keyOrObj === 'labels' && typeof value === 'object') {
        this.__settings.labels = Object.assign({}, this.__settings.labels || {}, value);
      } else {
        this.__settings[keyOrObj] = value;
      }
    } else if (keyOrObj && typeof keyOrObj === 'object') {
      assignExtra(this.__settings, keyOrObj);
      if ('title' in keyOrObj && this.__internal.built) {
        setHtmlOrNode(this.elements.header, keyOrObj.title);
      }
      if ('message' in keyOrObj && this.__internal.built) {
        setHtmlOrNode(this.elements.content, keyOrObj.message);
      }
    }
    if (this.__internal.built) {
      if (typeof this.__descriptor.prepare === 'function') {
        this.__descriptor.prepare.call(this);
      }
      this._renderButtons();
      this._syncVisualState();
    }
    return this;
  };

  DialogInstance.prototype.setting = DialogInstance.prototype.set;

  DialogInstance.prototype.get = function (key) {
    return key ? this.__settings[key] : Object.assign({}, this.__settings);
  };

  DialogInstance.prototype.moveTo = function (x, y) {
    this.__internal.tx = x;
    this.__internal.ty = y;
    if (this.elements.dialog) {
      this.elements.dialog.style.setProperty('--dx-ajs-tx', x + 'px');
      this.elements.dialog.style.setProperty('--dx-ajs-ty', y + 'px');
    }
    return this;
  };

  DialogInstance.prototype.resizeTo = function (w, h) {
    if (this.elements.dialog) {
      if (w) this.elements.dialog.style.width = w;
      if (h) this.elements.dialog.style.height = h;
    }
    return this;
  };

  DialogInstance.prototype.resetSize = function () {
    this.moveTo(0, 0);
    if (this.elements.dialog) {
      this.elements.dialog.style.width = '';
      this.elements.dialog.style.height = '';
    }
    return this;
  };

  DialogInstance.prototype.maximize = function () {
    if (!this.__internal.built) return this;
    this.__internal.isMaximized = true;
    this._syncVisualState();
    if (typeof this.__settings.onmaximize === 'function') {
      this.__settings.onmaximize.call(this);
    }
    return this;
  };

  DialogInstance.prototype.restore = function () {
    if (!this.__internal.built) return this;
    this.__internal.isMaximized = false;
    this._syncVisualState();
    if (typeof this.__settings.onrestore === 'function') {
      this.__settings.onrestore.call(this);
    }
    return this;
  };

  DialogInstance.prototype.isMaximized = function () {
    return Boolean(this.__internal.isMaximized);
  };

  DialogInstance.prototype.isOpen = function () {
    return Boolean(this.__internal.isOpen);
  };

  DialogInstance.prototype.show = function (modal, className) {
    var self = this;
    this._build();
    if (this.__internal.closeTimer) {
      clearTimeout(this.__internal.closeTimer);
      this.__internal.closeTimer = null;
    }
    if (typeof modal === 'boolean') this.__settings.modal = modal;
    if (className) this.elements.root.classList.add(className);

    if (this.__settings.autoReset) {
      this.resetSize();
      this.__internal.isMaximized = false;
    }
    if (this.__settings.startMaximized) {
      this.__internal.isMaximized = true;
    }

    if (typeof this.__descriptor.prepare === 'function') {
      this.__descriptor.prepare.call(this);
    }
    this._renderButtons();
    this._syncVisualState();

    this.__internal.prevFocus = document.activeElement;
    this.__internal.isOpen = true;
    if (openDialogs.indexOf(this) === -1) {
      openDialogs.push(this);
    }

    this.elements.root.classList.remove('ajs-hidden');
    requestAnimationFrame(function () {
      if (self.elements.root) {
        self.elements.root.classList.add('ajs-in');
      }
      if (self.__settings.maintainFocus) {
        var focusTarget = null;
        if (self.__setup && self.__setup.focus && typeof self.__setup.focus.element === 'function') {
          focusTarget = self.__setup.focus.element.call(self);
        } else if (self.__renderedButtons && self.__renderedButtons.length) {
          focusTarget = self.__renderedButtons[0].element;
        } else {
          focusTarget = self.elements.dialog;
        }
        if (focusTarget && typeof focusTarget.focus === 'function') {
          try {
            focusTarget.focus({ preventScroll: true });
            if (self.__setup && self.__setup.focus && self.__setup.focus.select && typeof focusTarget.select === 'function') {
              focusTarget.select();
            }
          } catch (err) { /* ignore */ }
        }
      }
    });

    if (typeof this.__settings.onshow === 'function') {
      this.__settings.onshow.call(this);
    }
    return this;
  };

  DialogInstance.prototype.close = function () {
    var self = this;
    if (!this.__internal.built || !this.__internal.isOpen) return this;
    this.__internal.isOpen = false;
    var idx = openDialogs.indexOf(this);
    if (idx !== -1) openDialogs.splice(idx, 1);

    this.elements.root.classList.remove('ajs-in');
    this.__internal.closeTimer = setTimeout(function () {
      if (!self.__internal.isOpen && self.elements.root) {
        self.elements.root.classList.add('ajs-hidden');
      }
    }, 220);

    if (this.__internal.prevFocus && typeof this.__internal.prevFocus.focus === 'function') {
      try { this.__internal.prevFocus.focus({ preventScroll: true }); } catch (err) { /* ignore */ }
    }
    if (typeof this.__settings.onclose === 'function') {
      this.__settings.onclose.call(this);
    }
    return this;
  };

  DialogInstance.prototype.destroy = function () {
    this.close();
    if (this.elements.root && this.elements.root.parentNode) {
      this.elements.root.parentNode.removeChild(this.elements.root);
    }
    this.__internal.built = false;
    this.elements = {};
  };

  // Listener global de Escape para o diálogo no topo da pilha
  if (typeof document !== 'undefined') {
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !openDialogs.length) return;
      var top = openDialogs[openDialogs.length - 1];
      if (top && top.__settings.closable) {
        e.preventDefault();
        top._triggerCloseButton(null, -1);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Dialog Factory (alertify.dialog(name, factory, singleton, baseName))
  // ---------------------------------------------------------------------------
  function composeDescriptor(factoryFn, baseName) {
    var child = factoryFn();
    if (!baseName || !registry[baseName]) {
      return child;
    }
    var base = registry[baseName]();
    return {
      settings: Object.assign({}, base.settings || {}, child.settings || {}),
      hooks: Object.assign({}, base.hooks || {}, child.hooks || {}),
      setup: function () {
        var bSetup = typeof base.setup === 'function' ? base.setup.call(this) : {};
        var cSetup = typeof child.setup === 'function' ? child.setup.call(this) : {};
        return Object.assign({}, bSetup, cSetup, {
          options: Object.assign({}, bSetup.options || {}, cSetup.options || {})
        });
      },
      build: function () {
        if (typeof base.build === 'function') base.build.call(this);
        if (typeof child.build === 'function') child.build.call(this);
      },
      main: child.main || base.main,
      prepare: function () {
        if (typeof base.prepare === 'function') base.prepare.call(this);
        if (typeof child.prepare === 'function') child.prepare.call(this);
      },
      callback: function (closeEvent) {
        if (typeof child.callback === 'function') {
          child.callback.call(this, closeEvent);
        } else if (typeof base.callback === 'function') {
          base.callback.call(this, closeEvent);
        }
      }
    };
  }

  function registerDialog(name, factoryFn, singleton, baseName) {
    if (typeof factoryFn !== 'function') {
      return singletons[name] || registry[name] || null;
    }
    var useSingleton = singleton !== false;
    var composedFactory = function () {
      return composeDescriptor(factoryFn, baseName);
    };
    registry[name] = composedFactory;

    api[name] = function () {
      var instance;
      if (useSingleton) {
        if (!singletons[name]) {
          singletons[name] = new DialogInstance(name, composedFactory());
        }
        instance = singletons[name];
      } else {
        instance = new DialogInstance(name, composedFactory());
      }
      if (instance.__settings.autoReset) {
        instance.__settings = cloneDefaults();
        if (instance.__setup && instance.__setup.options) {
          assignExtra(instance.__settings, instance.__setup.options);
        }
        if (instance.__descriptor.settings && typeof instance.__descriptor.settings === 'object') {
          assignExtra(instance.__settings, instance.__descriptor.settings);
        }
      } else {
        assignExtra(instance.__settings, {
          accent: defaults.accent,
          transition: defaults.transition,
          glossary: Object.assign({}, defaults.glossary),
          theme: Object.assign({}, defaults.theme)
        });
      }
      if (typeof instance.__descriptor.main === 'function') {
        instance.__descriptor.main.apply(instance, arguments);
      }
      instance.show();
      return instance;
    };
    return api[name];
  }

  // ---------------------------------------------------------------------------
  // Built-in Factories: alert, confirm, prompt
  // ---------------------------------------------------------------------------
  function alertFactory() {
    return {
      main: function (titleOrMsg, msgOrCb, maybeCb) {
        var title = defaults.glossary.title;
        var message = '';
        var onok = null;
        if (arguments.length === 1) {
          message = titleOrMsg;
        } else if (arguments.length === 2) {
          if (typeof msgOrCb === 'function') {
            message = titleOrMsg;
            onok = msgOrCb;
          } else {
            title = titleOrMsg;
            message = msgOrCb;
          }
        } else if (arguments.length >= 3) {
          title = titleOrMsg;
          message = msgOrCb;
          onok = maybeCb;
        }
        this.__settings.label = null;
        this.__settings.title = title;
        this.__settings.message = message;
        this.__settings.onok = typeof onok === 'function' ? onok : null;
      },
      setup: function () {
        var okLabel = this.__settings.label ||
          (this.__settings.glossary && (this.__settings.glossary.ok || this.__settings.glossary.aok)) ||
          defaults.glossary.ok;
        return {
          buttons: [
            { text: okLabel, key: 13, themeKey: 'ok', attrs: { 'data-ajs-action': 'ok' } }
          ],
          focus: {
            element: function () {
              return this.elements.buttons.primary.querySelector('button');
            }
          }
        };
      },
      prepare: function () {
        setHtmlOrNode(this.elements.header, this.__settings.title);
        setHtmlOrNode(this.elements.content, this.__settings.message);
      },
      callback: function (closeEvent) {
        if (closeEvent.index === 0 && typeof this.__settings.onok === 'function') {
          this.__settings.onok.call(this, closeEvent);
        }
      }
    };
  }

  function confirmFactory() {
    return {
      main: function (titleOrMsg, msgOrOk, okOrCancel, maybeCancel) {
        var title = defaults.glossary.title;
        var message = '';
        var onok = null;
        var oncancel = null;

        if (arguments.length === 1) {
          message = titleOrMsg;
        } else if (arguments.length === 2) {
          if (typeof msgOrOk === 'function') {
            message = titleOrMsg;
            onok = msgOrOk;
          } else {
            title = titleOrMsg;
            message = msgOrOk;
          }
        } else if (arguments.length === 3) {
          if (typeof msgOrOk === 'function') {
            message = titleOrMsg;
            onok = msgOrOk;
            oncancel = okOrCancel;
          } else {
            title = titleOrMsg;
            message = msgOrOk;
            onok = okOrCancel;
          }
        } else if (arguments.length >= 4) {
          title = titleOrMsg;
          message = msgOrOk;
          onok = okOrCancel;
          oncancel = maybeCancel;
        }

        this.__settings.labels = null;
        this.__settings.title = title;
        this.__settings.message = message;
        this.__settings.onok = typeof onok === 'function' ? onok : null;
        this.__settings.oncancel = typeof oncancel === 'function' ? oncancel : null;
      },
      setup: function () {
        var labels = this.__settings.labels || {};
        var okLabel = labels.ok || this.__settings.glossary.ok || defaults.glossary.ok;
        var cancelLabel = labels.cancel || this.__settings.glossary.cancel || defaults.glossary.cancel;
        return {
          buttons: [
            { text: cancelLabel, key: 27, themeKey: 'cancel', attrs: { 'data-ajs-action': 'cancel' } },
            { text: okLabel, key: 13, themeKey: 'ok', attrs: { 'data-ajs-action': 'ok' } }
          ],
          focus: {
            element: function () {
              var idx = this.__settings.defaultFocus === 'cancel' ? 0 : 1;
              return this.elements.buttons.primary.querySelectorAll('button')[idx] ||
                this.elements.buttons.primary.querySelector('button');
            }
          }
        };
      },
      prepare: function () {
        setHtmlOrNode(this.elements.header, this.__settings.title);
        setHtmlOrNode(this.elements.content, this.__settings.message);
      },
      callback: function (closeEvent) {
        var action = closeEvent.button && closeEvent.button.attrs && closeEvent.button.attrs['data-ajs-action'];
        if (action === 'ok' && typeof this.__settings.onok === 'function') {
          this.__settings.onok.call(this, closeEvent);
        } else if (action === 'cancel' && typeof this.__settings.oncancel === 'function') {
          this.__settings.oncancel.call(this, closeEvent);
        }
      }
    };
  }

  function promptFactory() {
    return {
      build: function () {
        var self = this;
        var pMsg = document.createElement('div');
        pMsg.className = 'ajs-prompt-message';
        var input = document.createElement('input');
        input.type = 'text';
        input.className = defaults.theme.input || 'ajs-input';
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            var okBtn = self.elements.buttons.primary.querySelector('[data-ajs-action="ok"]');
            if (okBtn) okBtn.click();
          }
        });
        this.elements.content.appendChild(pMsg);
        this.elements.content.appendChild(input);
        this.__promptMessage = pMsg;
        this.__promptInput = input;
      },
      main: function (a0, a1, a2, a3, a4) {
        var title = defaults.glossary.title;
        var message = '';
        var value = '';
        var onok = null;
        var oncancel = null;

        if (arguments.length === 1) {
          message = a0;
        } else if (arguments.length === 2) {
          if (typeof a1 === 'function') {
            message = a0;
            onok = a1;
          } else {
            title = a0;
            message = a1;
          }
        } else if (arguments.length === 3) {
          if (typeof a1 === 'function') {
            message = a0;
            onok = a1;
            oncancel = a2;
          } else if (typeof a2 === 'function') {
            message = a0;
            value = a1;
            onok = a2;
          } else {
            title = a0;
            message = a1;
            value = a2;
          }
        } else if (arguments.length === 4) {
          if (typeof a2 === 'function') {
            message = a0;
            value = a1;
            onok = a2;
            oncancel = a3;
          } else {
            title = a0;
            message = a1;
            value = a2;
            onok = a3;
          }
        } else if (arguments.length >= 5) {
          title = a0;
          message = a1;
          value = a2;
          onok = a3;
          oncancel = a4;
        }

        this.__settings.labels = null;
        this.__settings.type = 'text';
        this.__settings.placeholder = '';
        this.__settings.title = title;
        this.__settings.message = message;
        this.__settings.value = value == null ? '' : String(value);
        this.__settings.onok = typeof onok === 'function' ? onok : null;
        this.__settings.oncancel = typeof oncancel === 'function' ? oncancel : null;
      },
      setup: function () {
        var labels = this.__settings.labels || {};
        var okLabel = labels.ok || this.__settings.glossary.ok || defaults.glossary.ok;
        var cancelLabel = labels.cancel || this.__settings.glossary.cancel || defaults.glossary.cancel;
        return {
          buttons: [
            { text: cancelLabel, key: 27, themeKey: 'cancel', attrs: { 'data-ajs-action': 'cancel' } },
            { text: okLabel, key: 13, themeKey: 'ok', attrs: { 'data-ajs-action': 'ok' } }
          ],
          focus: {
            element: function () { return this.__promptInput; },
            select: true
          }
        };
      },
      prepare: function () {
        setHtmlOrNode(this.elements.header, this.__settings.title);
        if (this.__promptMessage) {
          setHtmlOrNode(this.__promptMessage, this.__settings.message);
        }
        if (this.__promptInput) {
          this.__promptInput.className = (defaults.theme && defaults.theme.input) ? defaults.theme.input + ' ajs-input' : 'ajs-input';
          this.__promptInput.type = this.__settings.type || 'text';
          this.__promptInput.placeholder = this.__settings.placeholder || '';
          this.__promptInput.value = this.__settings.value || '';
        }
      },
      callback: function (closeEvent) {
        var action = closeEvent.button && closeEvent.button.attrs && closeEvent.button.attrs['data-ajs-action'];
        if (action === 'ok' && typeof this.__settings.onok === 'function') {
          var val = this.__promptInput ? this.__promptInput.value : '';
          this.__settings.onok.call(this, closeEvent, val);
        } else if (action === 'cancel' && typeof this.__settings.oncancel === 'function') {
          this.__settings.oncancel.call(this, closeEvent);
        }
      }
    };
  }

  // ---------------------------------------------------------------------------
  // Notifier Engine (6 posições + 28 cores + dismissAll)
  // ---------------------------------------------------------------------------
  var notifierContainer = null;
  var activeToasts = [];

  function syncNotifierPosition() {
    if (!notifierContainer) return;
    var pos = POSITIONS.indexOf(defaults.notifier.position) !== -1 ? defaults.notifier.position : 'bottom-right';
    var parts = pos.split('-');
    notifierContainer.className = 'alertify-notifier ajs-' + parts[0] + ' ajs-' + parts[1];
  }

  function ensureNotifier() {
    if (typeof document === 'undefined') return null;
    if (!notifierContainer) {
      notifierContainer = document.createElement('div');
      notifierContainer.setAttribute('aria-live', 'polite');
      document.body.appendChild(notifierContainer);
    }
    syncNotifierPosition();
    return notifierContainer;
  }

  function notify(message, type, wait, callback) {
    if (typeof wait === 'function') {
      callback = wait;
      wait = undefined;
    }
    var container = ensureNotifier();
    if (!container) return null;

    var delaySec = (wait === undefined || wait === null) ? defaults.notifier.delay : Number(wait);
    var msgEl = document.createElement('div');
    msgEl.className = 'ajs-message' + (type ? ' ajs-' + type : '');
    msgEl.setAttribute('role', type === 'error' || type === 'danger' ? 'alert' : 'status');

    var textEl = document.createElement('span');
    textEl.className = 'ajs-msg-text';
    setHtmlOrNode(textEl, message);
    msgEl.appendChild(textEl);

    if (defaults.notifier.closeButton) {
      var dismissBtn = document.createElement('button');
      dismissBtn.type = 'button';
      dismissBtn.className = 'ajs-dismiss-btn';
      dismissBtn.setAttribute('aria-label', 'Fechar notificação');
      dismissBtn.innerHTML = '&times;';
      dismissBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        handle.dismiss();
      });
      msgEl.appendChild(dismissBtn);
    }

    var timer = null;
    var dismissed = false;

    function finishDismiss() {
      if (dismissed) return;
      dismissed = true;
      if (timer) clearTimeout(timer);
      msgEl.classList.remove('ajs-visible');
      msgEl.classList.add('ajs-closing');
      var idx = activeToasts.indexOf(handle);
      if (idx !== -1) activeToasts.splice(idx, 1);
      setTimeout(function () {
        if (msgEl.parentNode) msgEl.parentNode.removeChild(msgEl);
      }, 220);
      if (typeof handle.ondismiss === 'function') handle.ondismiss();
      if (typeof callback === 'function') callback();
    }

    var handle = {
      element: msgEl,
      ondismiss: null,
      dismiss: finishDismiss,
      setContent: function (newMsg) {
        setHtmlOrNode(textEl, newMsg);
        return handle;
      },
      delay: function (sec) {
        if (timer) clearTimeout(timer);
        if (sec > 0) {
          timer = setTimeout(finishDismiss, sec * 1000);
        }
        return handle;
      }
    };

    msgEl.addEventListener('click', function () {
      if (defaults.notifier.closeButton) return;
      finishDismiss();
    });

    if (defaults.notifier.position.indexOf('top-') === 0) {
      container.insertBefore(msgEl, container.firstChild);
    } else {
      container.appendChild(msgEl);
    }

    activeToasts.push(handle);
    requestAnimationFrame(function () {
      msgEl.classList.add('ajs-visible');
    });

    if (delaySec > 0) {
      timer = setTimeout(finishDismiss, delaySec * 1000);
    }

    return handle;
  }

  function dismissAll() {
    activeToasts.slice().forEach(function (h) { h.dismiss(); });
  }

  function closeAll(except) {
    openDialogs.slice().forEach(function (dlg) {
      if (dlg !== except) dlg.close();
    });
  }

  // ---------------------------------------------------------------------------
  // API Pública Unificada (alertify / DexterAlertify)
  // ---------------------------------------------------------------------------
  var api = {
    defaults: defaults,
    dialog: registerDialog,
    closeAll: closeAll,
    notify: notify,
    dismissAll: dismissAll,
    success: function (msg, wait, cb) { return notify(msg, 'success', wait, cb); },
    error: function (msg, wait, cb) { return notify(msg, 'error', wait, cb); },
    warning: function (msg, wait, cb) { return notify(msg, 'warning', wait, cb); },
    message: function (msg, wait, cb) { return notify(msg, 'message', wait, cb); },
    set: function (group, prop, val) {
      if (group === 'notifier') {
        defaults.notifier[prop] = val;
        if (prop === 'position') syncNotifierPosition();
      } else if (group === 'theme') {
        if (typeof prop === 'object') Object.assign(defaults.theme, prop);
        else defaults.theme[prop] = val;
      } else if (group === 'glossary') {
        if (typeof prop === 'object') Object.assign(defaults.glossary, prop);
        else defaults.glossary[prop] = val;
      } else if (typeof group === 'string' && typeof prop !== 'undefined') {
        defaults[group] = prop;
      }
      return api;
    },
    get: function (group, prop) {
      if (group === 'notifier') return prop ? defaults.notifier[prop] : Object.assign({}, defaults.notifier);
      if (group === 'theme') return prop ? defaults.theme[prop] : Object.assign({}, defaults.theme);
      if (group === 'glossary') return prop ? defaults.glossary[prop] : Object.assign({}, defaults.glossary);
      return defaults[group];
    }
  };

  registerDialog('alert', alertFactory, true);
  registerDialog('confirm', confirmFactory, true);
  registerDialog('prompt', promptFactory, true);

  return api;
});
