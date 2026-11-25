/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-cookie-consent.js
 * @description [PT-BR] Controlador nativo zero-dependência para Consentimento de Cookies
 *              em conformidade com LGPD / GDPR (inspirado e compatível drop-in com
 *              shaack/bootstrap-cookie-consent-settings). Suporta layouts Modal, Barra
 *              Inferior e Card Flutuante, i18n embutido (PT-BR, EN, ES, DE), armazenamento
 *              em Cookie Query String + LocalStorage, 28 cores da paleta oficial e
 *              ativação automática de scripts declarativos por categoria.
 *              [EN]    Zero-dependency native controller for Cookie Consent Settings
 *              compliant with LGPD / GDPR (inspired and drop-in compatible with
 *              shaack/bootstrap-cookie-consent-settings). Supports Modal, Bottom Bar and
 *              Floating Card layouts, built-in i18n (PT-BR, EN, ES, DE), Query String Cookie
 *              + LocalStorage persistence, 28 official palette colors and automatic
 *              declarative script activation per category.
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
    var ClassRef = factory();
    global.DexterCookieConsent = ClassRef;
    global.BootstrapCookieConsentSettings = ClassRef;
    global.dexter = global.dexter || {};
    global.dexter.CookieConsent = ClassRef;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var SHIELD_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>';

  var BUILTIN_I18N = {
    pt: {
      title: 'Configurações de Privacidade',
      lawBadge: 'LGPD / GDPR',
      body: 'Utilizamos cookies e tecnologias semelhantes essenciais para o funcionamento do site. Cookies opcionais só são ativados mediante o seu consentimento expresso. Você pode conceder, recusar ou revogar suas preferências a qualquer momento. Saiba mais em nossa --privacy-policy--.',
      privacyPolicy: 'Política de Privacidade',
      legalNotice: 'Aviso Legal',
      mySettings: 'Minhas Configurações',
      buttonNotAgree: 'Rejeitar opcionais',
      buttonAgree: 'Aceitar todos',
      buttonSaveSelection: 'Salvar seleção',
      buttonAgreeAll: 'Aceitar todos',
      requiredLabel: 'Obrigatório',
      optionalLabel: 'Opcional',
      categories: {
        necessary: {
          title: 'Essenciais',
          description: ['Necessários para o funcionamento técnico básico e segurança do site']
        },
        statistics: {
          title: 'Estatísticas e Análise',
          description: ['Medição anônima de acesso, desempenho e melhoria contínua da navegação']
        },
        marketing: {
          title: 'Marketing e Publicidade',
          description: ['Avaliação de eficácia de campanhas e anúncios segmentados']
        },
        personalization: {
          title: 'Personalização',
          description: [
            'Armazenamento de preferências de idioma e tema de visitas anteriores',
            'Exibição de conteúdo e recomendações adaptadas ao seu perfil'
          ]
        }
      }
    },
    en: {
      title: 'Privacy Settings',
      lawBadge: 'GDPR / LGPD',
      body: 'We use cookies and similar technologies that are necessary to operate the website. Additional cookies are only used with your consent. You are free to give, deny, or withdraw your consent at any time using the cookie settings link. For more details, please read our --privacy-policy--.',
      privacyPolicy: 'Data Protection Statement',
      legalNotice: 'Legal Notice',
      mySettings: 'My Settings',
      buttonNotAgree: 'I do not agree',
      buttonAgree: 'Agree',
      buttonSaveSelection: 'Save selection',
      buttonAgreeAll: 'Agree to all',
      requiredLabel: 'Required',
      optionalLabel: 'Optional',
      categories: {
        necessary: {
          title: 'Necessary',
          description: ['Required to run the website and keep core session security active']
        },
        statistics: {
          title: 'Statistics',
          description: ['Monitoring website usage and optimizing the user experience']
        },
        marketing: {
          title: 'Marketing',
          description: ['Evaluation of marketing actions and campaign attribution']
        },
        personalization: {
          title: 'Personalization',
          description: [
            'Storage of your preferences from previous visits',
            'Recording of your interests to provide customised content and offers'
          ]
        }
      }
    },
    es: {
      title: 'Configuración de Privacidad',
      lawBadge: 'GDPR / LGPD',
      body: 'Utilizamos cookies y tecnologías similares esenciales para el funcionamiento del sitio web. Las cookies opcionales solo se utilizan con su consentimiento. Puede aceptar, rechazar o modificar sus preferencias en cualquier momento. Más información en nuestra --privacy-policy--.',
      privacyPolicy: 'Política de Privacidad',
      legalNotice: 'Aviso Legal',
      mySettings: 'Mis Preferencias',
      buttonNotAgree: 'Rechazar opcionales',
      buttonAgree: 'Aceptar todo',
      buttonSaveSelection: 'Guardar selección',
      buttonAgreeAll: 'Aceptar todo',
      requiredLabel: 'Obligatorio',
      optionalLabel: 'Opcional',
      categories: {
        necessary: {
          title: 'Esenciales',
          description: ['Necesarias para la operación básica y seguridad del sitio web']
        },
        statistics: {
          title: 'Estadísticas',
          description: ['Medición de uso y optimización de la experiencia del usuario']
        },
        marketing: {
          title: 'Marketing',
          description: ['Evaluación de campañas publicitarias']
        },
        personalization: {
          title: 'Personalización',
          description: ['Almacenamiento de sus preferencias e idioma entre sesiones']
        }
      }
    },
    de: {
      title: 'Privatsphäre-Einstellungen',
      lawBadge: 'DSGVO / EU',
      body: 'Wir verwenden Cookies und ähnliche Technologien, die für den Betrieb der Website notwendig sind. Zusätzliche Cookies werden nur mit Ihrer Einwilligung verwendet. Weitere Informationen finden Sie in unserer --privacy-policy--.',
      privacyPolicy: 'Datenschutzerklärung',
      legalNotice: 'Impressum',
      mySettings: 'Meine Einstellungen',
      buttonNotAgree: 'Nicht einverstanden',
      buttonAgree: 'Alle akzeptieren',
      buttonSaveSelection: 'Auswahl speichern',
      buttonAgreeAll: 'Alle akzeptieren',
      requiredLabel: 'Erforderlich',
      optionalLabel: 'Optional',
      categories: {
        necessary: {
          title: 'Notwendig',
          description: ['Erforderlich für den technischen Betrieb der Website']
        },
        statistics: {
          title: 'Statistiken',
          description: ['Auswertung der Websitenutzung und Optimierung des Erlebnisses']
        },
        marketing: {
          title: 'Marketing',
          description: ['Auswertung von Marketingmaßnahmen']
        },
        personalization: {
          title: 'Personalisierung',
          description: ['Speicherung Ihrer Präferenzen aus früheren Besuchen']
        }
      }
    }
  };

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function dispatchEvent(name, detail) {
    if (typeof document === 'undefined') return;
    document.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail || {} }));
  }

  function DexterCookieConsent(props) {
    var self = this;
    var defaultNavLang = typeof navigator !== 'undefined' && navigator.language ? navigator.language : 'pt';

    this.props = Object.assign({
      privacyPolicyUrl: '#privacy-policy',
      legalNoticeUrl: '#legal-notice',
      contentURL: null,
      content: null,
      buttonAgreeClass: 'btn btn-primary',
      buttonDontAgreeClass: 'btn btn-outline-secondary',
      buttonSaveClass: 'btn btn-secondary',
      autoShowModal: true,
      alsoUseLocalStorage: true,
      postSelectionCallback: undefined,
      lang: defaultNavLang,
      defaultLang: 'pt',
      categories: ['necessary', 'statistics', 'marketing', 'personalization'],
      cookieName: 'cookie-consent-settings',
      cookieStorageDays: 365,
      modalId: 'bootstrapCookieConsentSettingsModal',
      layout: 'modal',
      color: 'primary',
      staticBackdrop: true,
      useSwitches: true,
      activateScripts: true
    }, props || {});

    this.detailedSettingsShown = false;
    this.isOpen = false;
    this.modalElement = null;
    this.backdropElement = null;
    this.content = null;

    this._normalizeLang();
    this._validateStoredCookie();
    this._loadContent(function () {
      self._buildMarkup();
      var existing = self.getSettings();
      if (existing) {
        if (self.props.activateScripts) {
          self._activatePendingScripts(existing);
        }
      } else if (self.props.autoShowModal) {
        self.showDialog();
      }
    });
  }

  DexterCookieConsent.prototype._normalizeLang = function () {
    var raw = String(this.props.lang || this.props.defaultLang || 'pt').toLowerCase();
    var shortLang = raw.indexOf('-') !== -1 ? raw.split('-')[0] : raw;
    this.lang = shortLang;
  };

  DexterCookieConsent.prototype._resolveBuiltinContent = function (langCode) {
    if (BUILTIN_I18N[langCode]) return BUILTIN_I18N[langCode];
    if (BUILTIN_I18N[this.props.defaultLang]) return BUILTIN_I18N[this.props.defaultLang];
    return BUILTIN_I18N.pt;
  };

  DexterCookieConsent.prototype._loadContent = function (done) {
    var self = this;
    if (this.props.content && typeof this.props.content === 'object') {
      this.content = Object.assign({}, this._resolveBuiltinContent(this.lang), this.props.content);
      done();
      return;
    }

    if (this.props.contentURL && typeof XMLHttpRequest !== 'undefined') {
      var xhr = new XMLHttpRequest();
      var url = this.props.contentURL.replace(/\/+$/, '') + '/' + this.lang + '.json';
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              var parsed = JSON.parse(xhr.responseText);
              self.content = Object.assign({}, self._resolveBuiltinContent(self.lang), parsed);
              done();
              return;
            } catch (e) { /* fallback below */ }
          }
          self.content = self._resolveBuiltinContent(self.lang);
          done();
        }
      };
      xhr.onerror = function () {
        self.content = self._resolveBuiltinContent(self.lang);
        done();
      };
      xhr.send(null);
      return;
    }

    this.content = this._resolveBuiltinContent(this.lang);
    done();
  };

  DexterCookieConsent.prototype._readRawCookie = function (name) {
    if (typeof document === 'undefined') return null;
    var prefix = name + '=';
    var parts = document.cookie.split(';');
    for (var i = 0; i < parts.length; i++) {
      var c = parts[i].trim();
      if (c.indexOf(prefix) === 0) {
        return c.substring(prefix.length);
      }
    }
    if (this.props.alsoUseLocalStorage && typeof localStorage !== 'undefined') {
      try {
        var stored = localStorage.getItem(name);
        if (stored) return stored;
      } catch (e) { /* ignore */ }
    }
    return null;
  };

  DexterCookieConsent.prototype._parseStoredString = function (raw) {
    if (!raw) return null;
    var params = new URLSearchParams(raw);
    var result = {};
    var hasAny = false;
    params.forEach(function (val, key) {
      hasAny = true;
      result[key] = (val === 'true' || val === true);
    });
    return hasAny ? result : null;
  };

  DexterCookieConsent.prototype._writeCookie = function (obj) {
    var payload = new URLSearchParams(obj).toString();
    var expires = '';
    if (this.props.cookieStorageDays) {
      var d = new Date();
      d.setTime(d.getTime() + this.props.cookieStorageDays * 24 * 60 * 60 * 1000);
      expires = '; expires=' + d.toUTCString();
    }
    if (typeof document !== 'undefined') {
      document.cookie = this.props.cookieName + '=' + payload + expires + '; Path=/; SameSite=Strict;';
    }
    if (this.props.alsoUseLocalStorage && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.props.cookieName, payload);
      } catch (e) { /* ignore */ }
    }
    return payload;
  };

  DexterCookieConsent.prototype._removeCookie = function () {
    if (typeof document !== 'undefined') {
      document.cookie = this.props.cookieName + '=; Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(this.props.cookieName);
      } catch (e) { /* ignore */ }
    }
  };

  DexterCookieConsent.prototype._validateStoredCookie = function () {
    var stored = this.getSettings();
    if (!stored) return;
    for (var i = 0; i < this.props.categories.length; i++) {
      var cat = this.props.categories[i];
      if (stored[cat] === undefined) {
        this._removeCookie();
        return;
      }
    }
  };

  DexterCookieConsent.prototype._getLayoutClass = function () {
    if (this.props.layout === 'bar-bottom') return 'dx-cc-bar';
    if (this.props.layout === 'floating-bottom-start') return 'dx-cc-floating-start';
    if (this.props.layout === 'floating-bottom-end') return 'dx-cc-floating-end';
    return 'dx-cc-modal';
  };

  DexterCookieConsent.prototype._buildMarkup = function () {
    var t = this.content || this._resolveBuiltinContent(this.lang);
    var linkPrivacy = '<a href="' + escapeHtml(this.props.privacyPolicyUrl || '#') + '">' + escapeHtml(t.privacyPolicy) + '</a>';
    var linkLegal = '<a href="' + escapeHtml(this.props.legalNoticeUrl || '#') + '">' + escapeHtml(t.legalNotice) + '</a>';
    var bodyText = String(t.body || '').replace(/--privacy-policy--/, linkPrivacy);
    var checkWrapperClass = this.props.useSwitches ? 'form-check form-switch' : 'form-check';
    var reqLabel = escapeHtml(t.requiredLabel || 'Obrigatório');
    var optLabel = escapeHtml(t.optionalLabel || 'Opcional');

    var optionsHtml = '';
    for (var i = 0; i < this.props.categories.length; i++) {
      var cat = this.props.categories[i];
      var catInfo = (t.categories && t.categories[cat]) || { title: cat, description: [] };
      var isNecessary = cat === 'necessary';
      var listItems = '';
      var descArr = Array.isArray(catInfo.description) ? catInfo.description : [];
      for (var j = 0; j < descArr.length; j++) {
        listItems += '<li>' + escapeHtml(descArr[j]) + '</li>';
      }

      optionsHtml +=
        '<div class="bccs-option dx-cc-option" data-name="' + escapeHtml(cat) + '">' +
          '<div class="dx-cc-option-header">' +
            '<div class="' + checkWrapperClass + '">' +
              '<input type="checkbox" class="form-check-input" id="bccs-checkbox-' + escapeHtml(cat) + '"' +
                (isNecessary ? ' checked disabled' : '') + '>' +
              '<label class="form-check-label" for="bccs-checkbox-' + escapeHtml(cat) + '"><strong>' + escapeHtml(catInfo.title) + '</strong></label>' +
            '</div>' +
            '<span class="' + (isNecessary ? 'dx-cc-badge-required' : 'dx-cc-badge-optional') + '">' +
              (isNecessary ? reqLabel : optLabel) +
            '</span>' +
          '</div>' +
          (listItems ? '<ul>' + listItems + '</ul>' : '') +
        '</div>';
    }

    this.modalContent =
      '<div class="dx-cc-dialog" role="document">' +
        '<div class="dx-cc-header">' +
          '<div class="dx-cc-title-wrap">' +
            '<span class="dx-cc-icon" aria-hidden="true">' + SHIELD_ICON + '</span>' +
            '<h4 class="dx-cc-title" id="' + escapeHtml(this.props.modalId) + '-title">' + escapeHtml(t.title) + '</h4>' +
          '</div>' +
          '<span class="dx-cc-law-badge">' + escapeHtml(t.lawBadge || 'LGPD / GDPR') + '</span>' +
        '</div>' +
        '<div class="dx-cc-body">' +
          '<div class="bccs-body-text"><p>' + bodyText + '</p></div>' +
          '<div class="dx-cc-links">' +
            linkLegal +
            '<button type="button" class="dx-cc-toggle-btn" id="bccs-toggle-options" aria-expanded="false" aria-controls="bccs-options">' +
              escapeHtml(t.mySettings) +
            '</button>' +
          '</div>' +
          '<div id="bccs-options" class="dx-cc-options">' + optionsHtml + '</div>' +
        '</div>' +
        '<div class="dx-cc-footer">' +
          '<button id="bccs-buttonDoNotAgree" type="button" class="' + escapeHtml(this.props.buttonDontAgreeClass) + '">' +
            escapeHtml(t.buttonNotAgree) +
          '</button>' +
          '<button id="bccs-buttonAgree" type="button" class="' + escapeHtml(this.props.buttonAgreeClass) + '">' +
            escapeHtml(t.buttonAgree) +
          '</button>' +
          '<button id="bccs-buttonSave" type="button" class="' + escapeHtml(this.props.buttonSaveClass) + '" style="display: none;">' +
            escapeHtml(t.buttonSaveSelection) +
          '</button>' +
          '<button id="bccs-buttonAgreeAll" type="button" class="' + escapeHtml(this.props.buttonAgreeClass) + '" style="display: none;">' +
            escapeHtml(t.buttonAgreeAll) +
          '</button>' +
        '</div>' +
      '</div>';
  };

  DexterCookieConsent.prototype._mountDialog = function () {
    if (typeof document === 'undefined') return;
    var self = this;

    if (!this.backdropElement) {
      this.backdropElement = document.createElement('div');
      this.backdropElement.className = 'dx-cc-backdrop';
      this.backdropElement.addEventListener('click', function () {
        if (!self.props.staticBackdrop) {
          self.hideDialog();
        }
      });
      document.body.appendChild(this.backdropElement);
    }

    var existing = document.getElementById(this.props.modalId);
    if (existing) {
      this.modalElement = existing;
    } else {
      this.modalElement = document.createElement('div');
      this.modalElement.id = this.props.modalId;
      document.body.appendChild(this.modalElement);
    }

    this.modalElement.className =
      'dx-cookie-consent ' + this._getLayoutClass() + ' cookie-consent-' + (this.props.color || 'primary');
    this.modalElement.setAttribute('role', 'dialog');
    this.modalElement.setAttribute('aria-modal', this.props.layout === 'modal' ? 'true' : 'false');
    this.modalElement.setAttribute('aria-labelledby', this.props.modalId + '-title');
    this.modalElement.setAttribute('tabindex', '-1');
    this.modalElement.innerHTML = this.modalContent;

    this.toggleBtn = this.modalElement.querySelector('#bccs-toggle-options');
    this.optionsEl = this.modalElement.querySelector('#bccs-options');
    this.buttonDoNotAgree = this.modalElement.querySelector('#bccs-buttonDoNotAgree');
    this.buttonAgree = this.modalElement.querySelector('#bccs-buttonAgree');
    this.buttonSave = this.modalElement.querySelector('#bccs-buttonSave');
    this.buttonAgreeAll = this.modalElement.querySelector('#bccs-buttonAgreeAll');

    this.toggleBtn.addEventListener('click', function () {
      self.detailedSettingsShown = !self.detailedSettingsShown;
      self._syncOptionsCollapse();
      self._updateButtons();
    });

    this.buttonDoNotAgree.addEventListener('click', function () { self.doNotAgree(); });
    this.buttonAgree.addEventListener('click', function () { self.agreeAll(); });
    this.buttonSave.addEventListener('click', function () { self.saveSettings(); });
    this.buttonAgreeAll.addEventListener('click', function () { self.agreeAll(); });

    if (!this._escHandler) {
      this._escHandler = function (e) {
        if (e.key === 'Escape' && self.isOpen && !self.props.staticBackdrop) {
          self.hideDialog();
        }
      };
      document.addEventListener('keydown', this._escHandler);
    }
  };

  DexterCookieConsent.prototype._syncOptionsCollapse = function () {
    if (!this.optionsEl || !this.toggleBtn) return;
    if (this.detailedSettingsShown) {
      this.optionsEl.classList.add('show');
      this.toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      this.optionsEl.classList.remove('show');
      this.toggleBtn.setAttribute('aria-expanded', 'false');
    }
  };

  DexterCookieConsent.prototype._updateButtons = function () {
    if (!this.buttonDoNotAgree) return;
    if (this.detailedSettingsShown) {
      this.buttonDoNotAgree.style.display = 'none';
      this.buttonAgree.style.display = 'none';
      this.buttonSave.style.removeProperty('display');
      this.buttonAgreeAll.style.removeProperty('display');
    } else {
      this.buttonDoNotAgree.style.removeProperty('display');
      this.buttonAgree.style.removeProperty('display');
      this.buttonSave.style.display = 'none';
      this.buttonAgreeAll.style.display = 'none';
    }
  };

  DexterCookieConsent.prototype._updateOptionsFromCookie = function () {
    if (!this.modalElement) return;
    var settings = this.getSettings();
    for (var i = 0; i < this.props.categories.length; i++) {
      var cat = this.props.categories[i];
      var cb = this.modalElement.querySelector('#bccs-checkbox-' + cat);
      if (!cb) continue;
      if (cat === 'necessary') {
        cb.checked = true;
        cb.disabled = true;
      } else if (settings && settings[cat] !== undefined) {
        cb.checked = Boolean(settings[cat]);
      } else {
        cb.checked = false;
      }
    }
  };

  DexterCookieConsent.prototype._gatherOptions = function (setAllTo) {
    var options = {};
    for (var i = 0; i < this.props.categories.length; i++) {
      var cat = this.props.categories[i];
      if (setAllTo === undefined && this.modalElement) {
        var cb = this.modalElement.querySelector('#bccs-checkbox-' + cat);
        options[cat] = cb ? Boolean(cb.checked) : false;
      } else {
        options[cat] = Boolean(setAllTo);
      }
    }
    options.necessary = true;
    return options;
  };

  DexterCookieConsent.prototype._activatePendingScripts = function (settings) {
    if (typeof document === 'undefined' || !settings) return;
    var placeholders = document.querySelectorAll('script[type="text/plain"][data-cookie-category]');
    Array.prototype.forEach.call(placeholders, function (node) {
      var cat = node.getAttribute('data-cookie-category');
      if (settings[cat] === true && node.getAttribute('data-dx-cookie-activated') !== 'true') {
        node.setAttribute('data-dx-cookie-activated', 'true');
        var live = document.createElement('script');
        if (node.src) {
          live.src = node.src;
          live.async = true;
        } else {
          live.textContent = node.textContent;
        }
        node.parentNode.insertBefore(live, node.nextSibling);
      }
    });
  };

  DexterCookieConsent.prototype._commitSelection = function (options, actionName) {
    var raw = this._writeCookie(options);
    if (this.props.activateScripts) {
      this._activatePendingScripts(options);
    }
    this.hideDialog();
    if (typeof this.props.postSelectionCallback === 'function') {
      this.props.postSelectionCallback(options, actionName);
    }
    dispatchEvent('dx:cookie-consent:change', {
      action: actionName,
      settings: options,
      raw: raw
    });
  };

  DexterCookieConsent.prototype.showDialog = function (options) {
    if (typeof document === 'undefined') return;
    if (options && options.layout) this.props.layout = options.layout;
    if (options && options.color) this.props.color = options.color;

    if (!this.content) {
      this.content = this._resolveBuiltinContent(this.lang);
      this._buildMarkup();
    }

    if (!this.modalElement) {
      this._mountDialog();
    } else {
      this.modalElement.className =
        'dx-cookie-consent ' + this._getLayoutClass() + ' cookie-consent-' + (this.props.color || 'primary');
      this.modalElement.setAttribute('aria-modal', this.props.layout === 'modal' ? 'true' : 'false');
    }

    this.detailedSettingsShown = Boolean(options && options.expanded);
    this._syncOptionsCollapse();
    this._updateButtons();
    this._updateOptionsFromCookie();

    if (this.props.layout === 'modal' && this.backdropElement) {
      this.backdropElement.classList.add('is-open', 'show');
    } else if (this.backdropElement) {
      this.backdropElement.classList.remove('is-open', 'show');
    }

    this.modalElement.classList.add('is-open', 'show');
    this.isOpen = true;
    dispatchEvent('dx:cookie-consent:show', { layout: this.props.layout, lang: this.lang });
  };

  DexterCookieConsent.prototype.hideDialog = function () {
    if (this.backdropElement) {
      this.backdropElement.classList.remove('is-open', 'show');
    }
    if (this.modalElement) {
      this.modalElement.classList.remove('is-open', 'show');
    }
    this.isOpen = false;
    dispatchEvent('dx:cookie-consent:hide', {});
  };

  DexterCookieConsent.prototype.agreeAll = function () {
    this._commitSelection(this._gatherOptions(true), 'agreeAll');
  };

  DexterCookieConsent.prototype.doNotAgree = function () {
    this._commitSelection(this._gatherOptions(false), 'doNotAgree');
  };

  DexterCookieConsent.prototype.saveSettings = function () {
    this._commitSelection(this._gatherOptions(), 'saveSelection');
  };

  DexterCookieConsent.prototype.getSettings = function (optionName) {
    var parsed = this._parseStoredString(this._readRawCookie(this.props.cookieName));
    if (!parsed) return undefined;
    if (optionName === undefined) return parsed;
    return parsed[optionName];
  };

  DexterCookieConsent.prototype.isAllowed = function (category) {
    return this.getSettings(category) === true;
  };

  DexterCookieConsent.prototype.setSetting = function (name, value) {
    var settings = this.getSettings() || {};
    for (var i = 0; i < this.props.categories.length; i++) {
      var cat = this.props.categories[i];
      if (settings[cat] === undefined) {
        settings[cat] = (cat === 'necessary');
      }
    }
    settings[name] = Boolean(value);
    settings.necessary = true;
    var raw = this._writeCookie(settings);
    if (this.props.activateScripts) {
      this._activatePendingScripts(settings);
    }
    dispatchEvent('dx:cookie-consent:change', { action: 'setSetting', settings: settings, raw: raw });
    return settings;
  };

  DexterCookieConsent.prototype.reset = function () {
    this._removeCookie();
    this._updateOptionsFromCookie();
    if (typeof this.props.postSelectionCallback === 'function') {
      this.props.postSelectionCallback(undefined, 'reset');
    }
    dispatchEvent('dx:cookie-consent:change', { action: 'reset', settings: undefined, raw: '' });
  };

  DexterCookieConsent.prototype.setLayout = function (layout) {
    this.props.layout = layout || 'modal';
    if (this.isOpen) {
      this.showDialog({ expanded: this.detailedSettingsShown });
    }
  };

  DexterCookieConsent.prototype.setThemeColor = function (color) {
    this.props.color = color || 'primary';
    if (this.modalElement) {
      this.modalElement.className =
        'dx-cookie-consent ' + this._getLayoutClass() + ' cookie-consent-' + this.props.color +
        (this.isOpen ? ' is-open show' : '');
    }
  };

  DexterCookieConsent.prototype.setLang = function (langCode, openAfter) {
    var self = this;
    this.props.lang = langCode;
    this._normalizeLang();
    this._loadContent(function () {
      self._buildMarkup();
      if (self.modalElement) {
        self._mountDialog();
      }
      if (openAfter || self.isOpen) {
        self.showDialog({ expanded: self.detailedSettingsShown });
      }
    });
  };

  DexterCookieConsent.prototype.destroy = function () {
    this.hideDialog();
    if (this._escHandler && typeof document !== 'undefined') {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
    if (this.modalElement && this.modalElement.parentNode) {
      this.modalElement.parentNode.removeChild(this.modalElement);
    }
    if (this.backdropElement && this.backdropElement.parentNode) {
      this.backdropElement.parentNode.removeChild(this.backdropElement);
    }
    this.modalElement = null;
    this.backdropElement = null;
  };

  DexterCookieConsent.bindTriggers = function (instance) {
    if (typeof document === 'undefined' || !instance) return;
    var btns = document.querySelectorAll('[data-dx-cookie-open]');
    Array.prototype.forEach.call(btns, function (btn) {
      if (btn.getAttribute('data-dx-cookie-bound') === 'true') return;
      btn.setAttribute('data-dx-cookie-bound', 'true');
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        instance.showDialog();
      });
    });
  };

  return DexterCookieConsent;
});
