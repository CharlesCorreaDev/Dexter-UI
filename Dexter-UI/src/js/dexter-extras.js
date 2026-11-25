/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-extras.js
 * @description [PT-BR] Controlador unificado zero-dependência para widgets interativos
 *              estendidos do Dexter UI (inspirados em Materialize CSS, daisyUI,
 *              Foundation Sites e UIkit 3): Material Ripple (DexterRipple), FAB Speed Dial
 *              (DexterFAB), Comparador Before/After (DexterDiff), Entrada OTP PIN (DexterOTP),
 *              Contador Regressivo (DexterCountdown), Galeria Lightbox (DexterLightbox),
 *              Filtro de Grid (DexterFilter), Menu Drilldown (DexterDrilldown), Botão
 *              Voltar ao Topo (DexterTotop) e Feature Discovery (DexterSpotlight).
 *              [EN]    Zero-dependency unified controller for extended Dexter UI interactive
 *              widgets: Material Ripple, FAB Speed Dial, Before/After Diff Comparator,
 *              OTP PIN Input, Live Countdown Timer, Lightbox Gallery, Filterable Grid,
 *              Drilldown Menu, Back-to-Top and Feature Discovery Spotlight.
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
    global.DexterExtras = api;
    global.DexterRipple = api.Ripple;
    global.DexterFAB = api.FAB;
    global.DexterDiff = api.Diff;
    global.DexterOTP = api.OTP;
    global.DexterCountdown = api.Countdown;
    global.DexterLightbox = api.Lightbox;
    global.BS5Lightbox = api.Lightbox;
    global.DexterFilter = api.Filter;
    global.DexterDrilldown = api.Drilldown;
    global.DexterTotop = api.Totop;
    global.DexterSpotlight = api.Spotlight;
    global.DexterCollection = api.Collection;
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  function reducedMotion() {
    return typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // 1. DexterRipple (Material Waves Ink)
  var DexterRipple = {
    _bound: false,
    init: function () {
      if (this._bound || typeof document === 'undefined') return;
      this._bound = true;
      document.addEventListener('pointerdown', function (e) {
        if (reducedMotion()) return;
        var host = e.target.closest('.waves-effect, [data-dx-ripple]');
        if (!host || host.disabled) return;
        var rect = host.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var ink = document.createElement('span');
        ink.className = 'dx-ripple-ink';
        ink.style.width = size + 'px';
        ink.style.height = size + 'px';
        ink.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ink.style.top = (e.clientY - rect.top - size / 2) + 'px';
        host.appendChild(ink);
        setTimeout(function () {
          if (ink.parentNode) ink.parentNode.removeChild(ink);
        }, 600);
      });
    }
  };

  // 2. DexterFAB (Floating Action Button Speed Dial)
  var DexterFAB = {
    _bound: false,
    init: function () {
      if (this._bound || typeof document === 'undefined') return;
      this._bound = true;
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('.dx-fab > .dx-fab-btn');
        if (btn) {
          var fab = btn.closest('.dx-fab');
          var isOpen = fab.classList.toggle('is-open');
          btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
          return;
        }
        if (!e.target.closest('.dx-fab')) {
          document.querySelectorAll('.dx-fab.is-open').forEach(function (fab) {
            fab.classList.remove('is-open');
            var b = fab.querySelector('.dx-fab-btn');
            if (b) b.setAttribute('aria-expanded', 'false');
          });
        }
      });
    }
  };

  // 3. DexterDiff (Before/After Comparator)
  var DexterDiff = {
    setPos: function (diffEl, pct) {
      var clamped = Math.max(0, Math.min(100, Number(pct) || 50));
      diffEl.style.setProperty('--dx-diff-pos', clamped + '%');
      diffEl.setAttribute('aria-valuenow', String(Math.round(clamped)));
      return clamped;
    },
    init: function (root) {
      (root || document).querySelectorAll('.dx-diff').forEach(function (diffEl) {
        if (diffEl.getAttribute('data-dx-diff-bound') === 'true') return;
        diffEl.setAttribute('data-dx-diff-bound', 'true');
        diffEl.setAttribute('tabindex', diffEl.getAttribute('tabindex') || '0');
        diffEl.setAttribute('role', 'slider');
        diffEl.setAttribute('aria-valuemin', '0');
        diffEl.setAttribute('aria-valuemax', '100');
        diffEl.setAttribute('aria-valuenow', '50');

        var dragging = false;
        var updateFromClientX = function (clientX) {
          var rect = diffEl.getBoundingClientRect();
          if (rect.width <= 0) return;
          var pct = ((clientX - rect.left) / rect.width) * 100;
          DexterDiff.setPos(diffEl, pct);
        };

        diffEl.addEventListener('pointerdown', function (e) {
          dragging = true;
          updateFromClientX(e.clientX);
        });
        window.addEventListener('pointermove', function (e) {
          if (dragging) updateFromClientX(e.clientX);
        });
        window.addEventListener('pointerup', function () {
          dragging = false;
        });
        diffEl.addEventListener('keydown', function (e) {
          var current = parseFloat(diffEl.getAttribute('aria-valuenow') || '50');
          if (e.key === 'ArrowLeft') { e.preventDefault(); DexterDiff.setPos(diffEl, current - 5); }
          if (e.key === 'ArrowRight') { e.preventDefault(); DexterDiff.setPos(diffEl, current + 5); }
        });
      });
    }
  };

  // 4. DexterOTP (PIN / OTP Auto-Advance & Paste)
  var DexterOTP = {
    getValue: function (otpEl) {
      return Array.prototype.map.call(otpEl.querySelectorAll('.dx-otp-field'), function (inp) {
        return inp.value || '';
      }).join('');
    },
    init: function (root) {
      (root || document).querySelectorAll('.dx-otp').forEach(function (otpEl) {
        if (otpEl.getAttribute('data-dx-otp-bound') === 'true') return;
        otpEl.setAttribute('data-dx-otp-bound', 'true');
        var fields = Array.prototype.slice.call(otpEl.querySelectorAll('.dx-otp-field'));

        var checkComplete = function () {
          var val = DexterOTP.getValue(otpEl);
          if (val.length === fields.length) {
            otpEl.dispatchEvent(new CustomEvent('dx:otp:complete', { bubbles: true, detail: { value: val } }));
          }
        };

        fields.forEach(function (inp, idx) {
          inp.setAttribute('maxlength', '1');
          inp.addEventListener('input', function () {
            if (inp.value && idx < fields.length - 1) {
              fields[idx + 1].focus();
            }
            checkComplete();
          });
          inp.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && !inp.value && idx > 0) {
              fields[idx - 1].focus();
            }
          });
          inp.addEventListener('paste', function (e) {
            var pasted = (e.clipboardData || window.clipboardData).getData('text') || '';
            var clean = pasted.replace(/\s+/g, '');
            if (!clean) return;
            e.preventDefault();
            for (var i = 0; i < fields.length; i++) {
              fields[i].value = clean.charAt(i) || '';
            }
            fields[Math.min(clean.length, fields.length - 1)].focus();
            checkComplete();
          });
        });
      });
    }
  };

  // 5. DexterCountdown (Live Countdown Timer)
  var DexterCountdown = {
    init: function (root) {
      (root || document).querySelectorAll('[data-dx-countdown]').forEach(function (el) {
        if (el.getAttribute('data-dx-cd-bound') === 'true') return;
        el.setAttribute('data-dx-cd-bound', 'true');

        var raw = el.getAttribute('data-dx-countdown');
        var remaining = /^\d+$/.test(raw) ? parseInt(raw, 10) : Math.max(0, Math.floor((Date.parse(raw) - Date.now()) / 1000));

        var render = function () {
          var s = Math.max(0, remaining);
          var days = Math.floor(s / 86400);
          var hours = Math.floor((s % 86400) / 3600);
          var mins = Math.floor((s % 3600) / 60);
          var secs = s % 60;
          var pad = function (n) { return (n < 10 ? '0' : '') + n; };
          var dEl = el.querySelector('[data-unit="days"]');
          var hEl = el.querySelector('[data-unit="hours"]');
          var mEl = el.querySelector('[data-unit="minutes"]');
          var sEl = el.querySelector('[data-unit="seconds"]');
          if (dEl) dEl.textContent = pad(days);
          if (hEl) hEl.textContent = pad(hours);
          if (mEl) mEl.textContent = pad(mins);
          if (sEl) sEl.textContent = pad(secs);
        };

        render();
        setInterval(function () {
          if (remaining > 0) remaining--;
          render();
        }, 1000);
      });
    }
  };

  // 6. DexterLightbox / BS5Lightbox (avalon-studio/Bootstrap-Lightbox + Gallery Modal)
  var DexterLightbox = {
    _backdrop: null,
    _items: [],
    _idx: 0,
    _zoomed: false,
    _bound: false,
    _ensureBackdrop: function () {
      if (this._backdrop) return this._backdrop;
      var bd = document.createElement('div');
      bd.id = 'lightboxModalFullscreen';
      bd.className = 'dx-lightbox-backdrop';
      bd.setAttribute('role', 'dialog');
      bd.setAttribute('aria-modal', 'true');
      bd.setAttribute('aria-label', 'Visualizador de Imagem');
      bd.innerHTML =
        '<div class="dx-lightbox-toolbar">' +
          '<span class="dx-lightbox-counter" style="display:none;"></span>' +
          '<div class="dx-lightbox-actions">' +
            '<button type="button" class="dx-lightbox-zoom" aria-label="Alternar zoom" title="Zoom (Z)">1x</button>' +
            '<button type="button" class="dx-lightbox-close" aria-label="Fechar" title="Fechar (Esc)">&times;</button>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="dx-lightbox-prev" aria-label="Anterior">&#8249;</button>' +
        '<img id="LightboxCanvas" class="dx-lightbox-img" alt="">' +
        '<div class="dx-lightbox-caption"></div>' +
        '<button type="button" class="dx-lightbox-next" aria-label="Próxima">&#8250;</button>';
      document.body.appendChild(bd);
      this._backdrop = bd;

      var self = this;
      bd.querySelector('.dx-lightbox-close').addEventListener('click', function () { self.close(); });
      bd.querySelector('.dx-lightbox-zoom').addEventListener('click', function (e) {
        e.stopPropagation();
        self.toggleZoom();
      });
      bd.querySelector('.dx-lightbox-prev').addEventListener('click', function (e) {
        e.stopPropagation();
        self.step(-1);
      });
      bd.querySelector('.dx-lightbox-next').addEventListener('click', function (e) {
        e.stopPropagation();
        self.step(1);
      });
      bd.querySelector('#LightboxCanvas').addEventListener('click', function (e) {
        e.stopPropagation();
        self.toggleZoom();
      });
      bd.addEventListener('click', function (e) {
        if (e.target === bd) self.close();
      });
      return bd;
    },
    open: function (triggerOrUrl, caption) {
      if (typeof triggerOrUrl === 'string') {
        this._items = [{
          src: triggerOrUrl,
          caption: caption || ''
        }];
        this._idx = 0;
      } else if (triggerOrUrl) {
        var group = triggerOrUrl.getAttribute('data-dx-lightbox-group') || triggerOrUrl.getAttribute('data-gallery');
        if (group) {
          this._items = Array.prototype.slice.call(
            document.querySelectorAll('[data-dx-lightbox-group="' + group + '"], [data-gallery="' + group + '"]')
          );
        } else {
          var galleryWrap = triggerOrUrl.closest('[data-bs-lightbox-gallery]');
          if (galleryWrap) {
            this._items = Array.prototype.slice.call(
              galleryWrap.querySelectorAll('[data-modal*="bs-lightbox"], [data-dx-lightbox]')
            );
          } else {
            this._items = [triggerOrUrl];
          }
        }
        this._idx = Math.max(0, this._items.indexOf(triggerOrUrl));
      } else {
        return;
      }

      this._ensureBackdrop();
      this._setZoom(false);
      this._render();
      this._backdrop.classList.add('is-open');
    },
    step: function (delta) {
      if (!this._items.length) return;
      this._idx = (this._idx + delta + this._items.length) % this._items.length;
      this._setZoom(false);
      this._render();
    },
    _setZoom: function (zoomed) {
      this._zoomed = Boolean(zoomed);
      if (!this._backdrop) return;
      var img = this._backdrop.querySelector('#LightboxCanvas');
      var zoomBtn = this._backdrop.querySelector('.dx-lightbox-zoom');
      if (img) img.classList.toggle('is-zoomed', this._zoomed);
      if (zoomBtn) {
        zoomBtn.textContent = this._zoomed ? '1.75x' : '1x';
        zoomBtn.setAttribute('aria-pressed', this._zoomed ? 'true' : 'false');
      }
    },
    toggleZoom: function () {
      this._setZoom(!this._zoomed);
    },
    _resolveItem: function (item) {
      if (!item) return { src: '', caption: '' };
      if (typeof item.src === 'string' && !item.getAttribute) {
        return { src: item.src, caption: item.caption || '' };
      }
      var dxAttr = item.getAttribute('data-dx-lightbox');
      var href = item.getAttribute('href');
      var childImg = item.querySelector('img');
      var src = '';
      if (dxAttr && dxAttr !== '#') {
        src = dxAttr;
      } else if (href && href !== '#') {
        src = href;
      } else if (childImg) {
        src = childImg.currentSrc || childImg.src || '';
      }
      var cap = item.getAttribute('data-dx-caption') ||
        item.getAttribute('data-caption') ||
        item.getAttribute('title') ||
        (childImg ? childImg.getAttribute('alt') : '') ||
        '';
      return { src: src, caption: cap };
    },
    _render: function () {
      var item = this._items[this._idx];
      if (!item || !this._backdrop) return;
      var resolved = this._resolveItem(item);
      var canvas = this._backdrop.querySelector('#LightboxCanvas');
      canvas.src = resolved.src;
      canvas.alt = resolved.caption || 'Imagem ampliada';
      this._backdrop.querySelector('.dx-lightbox-caption').textContent = resolved.caption;

      var total = this._items.length;
      var showNav = total > 1;
      var counter = this._backdrop.querySelector('.dx-lightbox-counter');
      if (counter) {
        counter.style.display = showNav ? 'inline-flex' : 'none';
        counter.textContent = showNav ? ((this._idx + 1) + ' / ' + total) : '';
      }
      this._backdrop.querySelector('.dx-lightbox-prev').style.display = showNav ? '' : 'none';
      this._backdrop.querySelector('.dx-lightbox-next').style.display = showNav ? '' : 'none';
    },
    close: function () {
      this._setZoom(false);
      if (this._backdrop) this._backdrop.classList.remove('is-open');
    },
    init: function () {
      if (this._bound || typeof document === 'undefined') return;
      this._bound = true;
      var self = this;
      document.addEventListener('click', function (e) {
        var trigger = e.target.closest('[data-dx-lightbox], [data-modal*="bs-lightbox"]');
        if (!trigger) return;
        e.preventDefault();
        self.open(trigger);
      });
      document.addEventListener('keydown', function (e) {
        if (!self._backdrop || !self._backdrop.classList.contains('is-open')) return;
        if (e.key === 'Escape') {
          self.close();
        } else if (e.key === 'ArrowLeft') {
          self.step(-1);
        } else if (e.key === 'ArrowRight') {
          self.step(1);
        } else if (e.key === 'z' || e.key === 'Z' || e.key === '+' || e.key === '=') {
          self.toggleZoom();
        } else if (e.key === '-') {
          self._setZoom(false);
        }
      });
    }
  };

  // 7. DexterFilter (UIkit Style Filter Grid)
  var DexterFilter = {
    _bound: false,
    init: function () {
      if (this._bound || typeof document === 'undefined') return;
      this._bound = true;
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-dx-filter]');
        if (!btn) return;
        var tag = btn.getAttribute('data-dx-filter');
        var container = btn.closest('[data-dx-filter-container]') || document;
        container.querySelectorAll('[data-dx-filter]').forEach(function (b) {
          b.classList.toggle('active', b === btn);
        });
        container.querySelectorAll('[data-dx-filter-tags]').forEach(function (item) {
          var tags = (item.getAttribute('data-dx-filter-tags') || '').split(/\s+/);
          var match = tag === 'all' || tags.indexOf(tag) !== -1;
          item.classList.toggle('is-hidden', !match);
        });
      });
    }
  };

  // 8. DexterDrilldown (Foundation Multi-Level Sliding Menu)
  var DexterDrilldown = {
    _bound: false,
    init: function () {
      if (this._bound || typeof document === 'undefined') return;
      this._bound = true;
      document.addEventListener('click', function (e) {
        var nextBtn = e.target.closest('[data-dx-drill-target]');
        if (nextBtn) {
          e.preventDefault();
          var wrap = nextBtn.closest('.dx-drilldown');
          var targetSel = nextBtn.getAttribute('data-dx-drill-target');
          var targetPanel = wrap ? wrap.querySelector(targetSel) : null;
          if (wrap && targetPanel) {
            wrap.querySelectorAll('.dx-drilldown-panel').forEach(function (p) { p.classList.remove('is-active'); });
            targetPanel.classList.add('is-active');
          }
          return;
        }
        var backBtn = e.target.closest('.dx-drilldown-back');
        if (backBtn) {
          e.preventDefault();
          var wrapB = backBtn.closest('.dx-drilldown');
          var backSel = backBtn.getAttribute('data-dx-drill-back') || '.dx-drilldown-root';
          var backPanel = wrapB ? wrapB.querySelector(backSel) : null;
          if (wrapB && backPanel) {
            wrapB.querySelectorAll('.dx-drilldown-panel').forEach(function (p) { p.classList.remove('is-active'); });
            backPanel.classList.add('is-active');
          }
        }
      });
    }
  };

  // 9. DexterTotop (Scroll Back-to-Top)
  var DexterTotop = {
    _bound: false,
    init: function () {
      if (this._bound || typeof window === 'undefined') return;
      this._bound = true;
      var sync = function () {
        var visible = window.scrollY > 240;
        document.querySelectorAll('.dx-totop').forEach(function (el) {
          el.classList.toggle('is-visible', visible);
        });
      };
      window.addEventListener('scroll', sync, { passive: true });
      sync();
      document.addEventListener('click', function (e) {
        var btn = e.target.closest('.dx-totop');
        if (!btn) return;
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reducedMotion() ? 'auto' : 'smooth' });
      });
    }
  };

  // 10. DexterSpotlight (Materialize Feature Discovery)
  var DexterSpotlight = {
    _overlay: null,
    _ring: null,
    _card: null,
    show: function (targetSelector, opts) {
      if (typeof document === 'undefined') return;
      var target = typeof targetSelector === 'string' ? document.querySelector(targetSelector) : targetSelector;
      if (!target) return;
      this.close();

      var cfg = Object.assign({
        title: 'Dica de Recurso',
        body: 'Explore esta funcionalidade interativa do Dexter UI.',
        buttonText: 'Entendi'
      }, opts || {});

      var rect = target.getBoundingClientRect();
      this._overlay = document.createElement('div');
      this._overlay.className = 'dx-spotlight-overlay is-open';
      this._ring = document.createElement('div');
      this._ring.className = 'dx-spotlight-ring';
      this._ring.style.top = (rect.top - 6) + 'px';
      this._ring.style.left = (rect.left - 6) + 'px';
      this._ring.style.width = (rect.width + 12) + 'px';
      this._ring.style.height = (rect.height + 12) + 'px';

      this._card = document.createElement('div');
      this._card.className = 'dx-spotlight-card';
      this._card.style.top = Math.min(window.innerHeight - 170, rect.bottom + 16) + 'px';
      this._card.style.left = Math.max(16, Math.min(window.innerWidth - 356, rect.left)) + 'px';
      this._card.innerHTML =
        '<h6 class="fw-bold mb-1" style="color:#fff;">' + cfg.title + '</h6>' +
        '<p class="small mb-3" style="color:rgba(255,255,255,0.9);">' + cfg.body + '</p>' +
        '<button type="button" class="btn btn-sm btn-light dx-spotlight-dismiss">' + cfg.buttonText + '</button>';

      document.body.appendChild(this._overlay);
      document.body.appendChild(this._ring);
      document.body.appendChild(this._card);

      var self = this;
      this._overlay.addEventListener('click', function () { self.close(); });
      this._card.querySelector('.dx-spotlight-dismiss').addEventListener('click', function () { self.close(); });
    },
    close: function () {
      [this._overlay, this._ring, this._card].forEach(function (n) {
        if (n && n.parentNode) n.parentNode.removeChild(n);
      });
      this._overlay = this._ring = this._card = null;
    }
  };

  // -------------------------------------------------------------------------
  // 11. Materialize Collections (Swipe-to-Dismiss, Botão e Seleção)
  // EN: Materialize Collections (Swipe-to-Dismiss, Button Dismiss & Selection)
  // -------------------------------------------------------------------------
  var DexterCollection = {
    _bound: false,

    dismiss: function (item, dir) {
      if (!item || item.dataset.dxDismissing === '1') return;
      item.dataset.dxDismissing = '1';
      var direction = dir >= 0 ? 1 : -1;
      var rm = reducedMotion();

      var detail = {
        item: item,
        collection: item.closest('.collection'),
        direction: direction
      };

      if (!rm) {
        item.classList.add('is-dismissed');
        item.style.transform = 'translateX(' + (direction * 110) + '%)';
      }

      window.setTimeout(function () {
        item.dispatchEvent(new CustomEvent('dexter.collection.dismiss', { bubbles: true, detail: detail }));
        if (item.parentNode) {
          item.parentNode.removeChild(item);
        }
      }, rm ? 0 : 240);
    },

    init: function (root) {
      var scope = root || document;

      // Garante aria-label acessível nos botões de descarte
      scope.querySelectorAll('.collection-dismiss-btn').forEach(function (btn) {
        if (!btn.getAttribute('aria-label')) {
          btn.setAttribute('aria-label', 'Remover item da lista');
        }
      });

      if (this._bound) return;
      this._bound = true;

      var dragState = null;

      // Seleção ativa em coleções [data-dx-collection-selectable] e botão de descarte
      document.addEventListener('click', function (e) {
        var dismissBtn = e.target.closest('.collection-dismiss-btn, [data-dx-dismiss="collection-item"]');
        if (dismissBtn) {
          e.preventDefault();
          var dismissItem = dismissBtn.closest('.collection-item');
          if (dismissItem) {
            DexterCollection.dismiss(dismissItem, 1);
          }
          return;
        }

        // Ignora se clicou na ação secundária
        if (e.target.closest('.secondary-content')) return;

        var selectableItem = e.target.closest('.collection[data-dx-collection-selectable] .collection-item');
        if (selectableItem && !selectableItem.classList.contains('collection-header')) {
          var parentCollection = selectableItem.closest('.collection');
          if (parentCollection) {
            parentCollection.querySelectorAll('.collection-item.active').forEach(function (el) {
              el.classList.remove('active');
              el.removeAttribute('aria-current');
            });
            selectableItem.classList.add('active');
            selectableItem.setAttribute('aria-current', 'true');
            if (selectableItem.tagName === 'A' && selectableItem.getAttribute('href') === '#!') {
              e.preventDefault();
            }
            selectableItem.dispatchEvent(new CustomEvent('dexter.collection.select', {
              bubbles: true,
              detail: { item: selectableItem, collection: parentCollection }
            }));
          }
        }
      });

      // Swipe horizontal via Pointer Events para itens .dismissable / .dismissible
      document.addEventListener('pointerdown', function (e) {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        if (e.target.closest('a, button, input, select, textarea, .secondary-content, .collection-dismiss-btn')) return;

        var item = e.target.closest('.collection-item.dismissable, .collection-item.dismissible');
        if (!item || item.dataset.dxDismissing === '1') return;

        dragState = {
          item: item,
          pointerId: e.pointerId,
          startX: e.clientX,
          dx: 0,
          moved: false
        };
        item.classList.add('is-dragging');
        if (item.setPointerCapture) {
          try { item.setPointerCapture(e.pointerId); } catch (err) {}
        }
      });

      document.addEventListener('pointermove', function (e) {
        if (!dragState || e.pointerId !== dragState.pointerId) return;
        var dx = e.clientX - dragState.startX;
        if (Math.abs(dx) > 6) dragState.moved = true;
        if (!dragState.moved) return;

        dragState.dx = dx;
        var width = dragState.item.offsetWidth || 300;
        var ratio = Math.min(1, Math.abs(dx) / (width * 0.75));
        dragState.item.style.transform = 'translateX(' + dx + 'px)';
        dragState.item.style.opacity = String(Math.max(0.15, 1 - ratio * 0.85));
      });

      var endDrag = function (e) {
        if (!dragState || (e.pointerId !== undefined && e.pointerId !== dragState.pointerId)) return;
        var state = dragState;
        dragState = null;

        state.item.classList.remove('is-dragging');
        if (Math.abs(state.dx) >= 90) {
          DexterCollection.dismiss(state.item, state.dx >= 0 ? 1 : -1);
        } else {
          state.item.style.transform = '';
          state.item.style.opacity = '';
        }
      };

      document.addEventListener('pointerup', endDrag);
      document.addEventListener('pointercancel', endDrag);
    }
  };

  function initAll(root) {
    DexterRipple.init();
    DexterFAB.init();
    DexterDiff.init(root);
    DexterOTP.init(root);
    DexterCountdown.init(root);
    DexterLightbox.init();
    DexterFilter.init();
    DexterDrilldown.init();
    DexterTotop.init();
    DexterCollection.init(root);
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { initAll(); });
    } else {
      initAll();
    }
  }

  return {
    initAll: initAll,
    Ripple: DexterRipple,
    FAB: DexterFAB,
    Diff: DexterDiff,
    OTP: DexterOTP,
    Countdown: DexterCountdown,
    Lightbox: DexterLightbox,
    Filter: DexterFilter,
    Drilldown: DexterDrilldown,
    Totop: DexterTotop,
    Spotlight: DexterSpotlight,
    Collection: DexterCollection
  };
});
