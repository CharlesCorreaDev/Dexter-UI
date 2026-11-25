/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-carousel.js
 * @description [PT-BR] Controlador nativo zero-dependência para Carrossel e Slider de
 *              Múltiplos Itens (Multi-Item Carousel & Card Slider), inspirado e aprimorado
 *              a partir do bootstrap5-carousel-multi (github.com/jibarradelgado/bootstrap5-carousel-multi).
 *              Permite deslizar suavemente 1 card por vez em vez de blocos rígidos,
 *              com suporte a múltiplos cards responsivos por tela, touch swipe em dispositivos móveis,
 *              autoplay com pausa automática no hover, botões circulares flutuantes e indicadores.
 *              [EN]    Zero-dependency native controller for Multi-Item Carousel & Card Slider,
 *              inspired and enhanced from bootstrap5-carousel-multi (github.com/jibarradelgado/bootstrap5-carousel-multi).
 *              Slides smoothly 1 card at a time with responsive multi-item display, mobile touch swipe,
 *              autoplay with hover pause, floating circular controls, and dynamic indicators.
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

  // Ícones SVG de navegação
  var ICON_PREV = '<svg viewBox="0 0 16 16"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>';
  var ICON_NEXT = '<svg viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>';

  /**
   * Construtor do DexterCarousel
   */
  function DexterCarousel(element, options) {
    if (typeof element === 'string' && typeof document !== 'undefined') {
      element = document.querySelector(element);
    }
    if (!element) return;
    if (element._dexterCarouselInstance) {
      return element._dexterCarouselInstance;
    }

    this.el = element;

    // Resgata configurações de atributos HTML (Dexter & Bootstrap)
    var autoplayAttr =
      element.getAttribute('data-autoplay') === 'true' ||
      element.getAttribute('data-ride') === 'carousel' ||
      element.getAttribute('data-bs-ride') === 'carousel';
    var intervalAttr = element.getAttribute('data-interval') || element.getAttribute('data-bs-interval');
    var loopAttr = element.getAttribute('data-loop');
    var scrollAttr = element.getAttribute('data-items-scroll');
    var pauseAttr =
      element.getAttribute('data-pause') ||
      element.getAttribute('data-bs-pause') ||
      element.getAttribute('data-pause-on-hover');
    var resolvedPause = true;
    if (pauseAttr !== null) {
      resolvedPause = pauseAttr !== 'false' && pauseAttr !== 'none';
    }

    this.options = Object.assign({
      itemsToScroll: scrollAttr ? parseInt(scrollAttr, 10) : 1,
      loop: loopAttr !== null ? loopAttr === 'true' : true,
      autoplay: autoplayAttr,
      interval: intervalAttr ? parseInt(intervalAttr, 10) : 3500,
      pauseOnHover: resolvedPause,
      touch: true,
      keyboard: true,
      onChange: null
    }, options || {});

    this.currentIndex = 0;
    this.timer = null;
    this._manuallyPaused = false;

    this._init();
    element._dexterCarouselInstance = this;
  }

  DexterCarousel.prototype._init = function () {
    var self = this;

    // 1. Localiza ou cria a estrutura interna (Track)
    this.inner = this.el.querySelector('.carousel-inner');
    if (!this.inner) {
      this.inner = document.createElement('div');
      this.inner.className = 'carousel-inner';
      while (this.el.firstChild) {
        this.inner.appendChild(this.el.firstChild);
      }
      this.el.appendChild(this.inner);
    }

    this.track = this.inner.querySelector('.carousel-track');
    if (!this.track) {
      this.track = document.createElement('div');
      this.track.className = 'carousel-track';
      var directItems = Array.from(this.inner.querySelectorAll('.carousel-item'));
      directItems.forEach(function (item) {
        self.track.appendChild(item);
      });
      this.inner.appendChild(this.track);
    }

    this.items = Array.from(this.track.querySelectorAll('.carousel-item'));
    if (!this.items.length) return;

    // 2. Botões de navegação Prev / Next
    this.btnPrev = this.el.querySelector('.carousel-control-prev');
    if (!this.btnPrev) {
      this.btnPrev = document.createElement('button');
      this.btnPrev.type = 'button';
      this.btnPrev.className = 'carousel-control-prev';
      this.btnPrev.setAttribute('aria-label', 'Slide anterior');
      this.btnPrev.innerHTML = ICON_PREV;
      this.el.appendChild(this.btnPrev);
    } else if (!this.btnPrev.querySelector('svg')) {
      this.btnPrev.innerHTML = ICON_PREV;
    }

    this.btnNext = this.el.querySelector('.carousel-control-next');
    if (!this.btnNext) {
      this.btnNext = document.createElement('button');
      this.btnNext.type = 'button';
      this.btnNext.className = 'carousel-control-next';
      this.btnNext.setAttribute('aria-label', 'Próximo slide');
      this.btnNext.innerHTML = ICON_NEXT;
      this.el.appendChild(this.btnNext);
    } else if (!this.btnNext.querySelector('svg')) {
      this.btnNext.innerHTML = ICON_NEXT;
    }

    // 3. Indicadores de página
    this.indicatorsContainer = this.el.querySelector('.carousel-indicators');
    this._setupIndicators();

    // 4. Calcula dimensões e posiciona
    this.update();

    // 5. Vincula eventos
    this._bindEvents();

    // 6. Inicia autoplay se configurado
    if (this.options.autoplay) {
      this.play('init');
    } else {
      this.el.setAttribute('data-dx-autoplay-state', 'stopped');
    }
  };

  /**
   * Configura indicadores numéricos / pílulas
   */
  DexterCarousel.prototype._setupIndicators = function () {
    var self = this;
    if (!this.indicatorsContainer) return;

    this.indicatorsContainer.innerHTML = '';
    var totalSteps = this._getMaxIndex() + 1;

    for (var i = 0; i < totalSteps; i++) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('data-index', i);
      dot.setAttribute('aria-label', 'Ir para o slide ' + (i + 1));
      if (i === this.currentIndex) dot.classList.add('active');

      (function (idx) {
        dot.addEventListener('click', function (e) {
          e.preventDefault();
          self.goTo(idx);
        });
      })(i);

      this.indicatorsContainer.appendChild(dot);
    }
  };

  /**
   * Retorna quantos itens estão visíveis no viewport atual
   */
  DexterCarousel.prototype._getItemsVisible = function () {
    if (!this.items.length) return 1;
    var innerWidth = this.inner.offsetWidth;
    var itemWidth = this.items[0].offsetWidth;
    if (itemWidth <= 0) return 1;

    var visible = Math.round(innerWidth / itemWidth);
    return Math.max(1, Math.min(this.items.length, visible));
  };

  /**
   * Índice máximo atingível
   */
  DexterCarousel.prototype._getMaxIndex = function () {
    var visible = this._getItemsVisible();
    return Math.max(0, this.items.length - visible);
  };

  /**
   * Atualiza dimensões e re-alinha trilho
   */
  DexterCarousel.prototype.update = function () {
    if (!this.items.length) return;

    var maxIdx = this._getMaxIndex();
    if (this.currentIndex > maxIdx) {
      this.currentIndex = maxIdx;
    }

    var item = this.items[this.currentIndex];
    var offset = item ? item.offsetLeft : 0;

    this.track.style.transform = 'translate3d(-' + offset + 'px, 0, 0)';

    // Atualiza classes ativas nos itens
    var visible = this._getItemsVisible();
    var self = this;
    this.items.forEach(function (it, idx) {
      if (idx >= self.currentIndex && idx < self.currentIndex + visible) {
        it.classList.add('is-visible');
      } else {
        it.classList.remove('is-visible');
      }
    });

    // Atualiza indicadores
    if (this.indicatorsContainer) {
      var dots = this.indicatorsContainer.querySelectorAll('button');
      dots.forEach(function (d, idx) {
        if (idx === self.currentIndex) d.classList.add('active');
        else d.classList.remove('active');
      });
    }

    // Atualiza botões nos limites (caso loop: false)
    if (!this.options.loop) {
      this.btnPrev.disabled = this.currentIndex <= 0;
      this.btnNext.disabled = this.currentIndex >= maxIdx;
      if (this.btnPrev.disabled) this.btnPrev.classList.add('is-disabled');
      else this.btnPrev.classList.remove('is-disabled');
      if (this.btnNext.disabled) this.btnNext.classList.add('is-disabled');
      else this.btnNext.classList.remove('is-disabled');
    } else {
      this.btnPrev.disabled = false;
      this.btnNext.disabled = false;
      this.btnPrev.classList.remove('is-disabled');
      this.btnNext.classList.remove('is-disabled');
    }
  };

  /**
   * Avança para o próximo slide
   */
  DexterCarousel.prototype.next = function () {
    var maxIdx = this._getMaxIndex();
    if (this.currentIndex < maxIdx) {
      this.currentIndex = Math.min(maxIdx, this.currentIndex + this.options.itemsToScroll);
    } else if (this.options.loop) {
      this.currentIndex = 0;
    }
    this.update();
    this._dispatchChange();
  };

  /**
   * Retrocede para o slide anterior
   */
  DexterCarousel.prototype.prev = function () {
    var maxIdx = this._getMaxIndex();
    if (this.currentIndex > 0) {
      this.currentIndex = Math.max(0, this.currentIndex - this.options.itemsToScroll);
    } else if (this.options.loop) {
      this.currentIndex = maxIdx;
    }
    this.update();
    this._dispatchChange();
  };

  /**
   * Vai para um índice específico
   */
  DexterCarousel.prototype.goTo = function (index) {
    var maxIdx = this._getMaxIndex();
    this.currentIndex = Math.max(0, Math.min(maxIdx, index));
    this.update();
    this._dispatchChange();
  };

  DexterCarousel.prototype.slideTo = DexterCarousel.prototype.goTo;

  /**
   * Inicia ou retoma autoplay
   */
  DexterCarousel.prototype.play = function (reason) {
    var self = this;
    if (reason !== 'hover') {
      this._manuallyPaused = false;
    }
    this.options.autoplay = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.timer = setInterval(function () {
      self.next();
    }, this.options.interval);
    this.el.classList.remove('is-paused');
    this.el.setAttribute('data-dx-autoplay-state', 'playing');
    this.el.dispatchEvent(new CustomEvent('dexter.carousel.play', {
      bubbles: true,
      detail: { reason: reason || 'manual', index: this.currentIndex }
    }));
  };

  DexterCarousel.prototype.cycle = DexterCarousel.prototype.play;

  /**
   * Pausa autoplay
   */
  DexterCarousel.prototype.pause = function (reason) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (reason !== 'hover') {
      this._manuallyPaused = true;
    }
    this.el.classList.add('is-paused');
    this.el.setAttribute('data-dx-autoplay-state', 'paused');
    this.el.dispatchEvent(new CustomEvent('dexter.carousel.pause', {
      bubbles: true,
      detail: { reason: reason || 'manual', index: this.currentIndex }
    }));
  };

  /**
   * Retorna se o autoplay está ativo no momento
   */
  DexterCarousel.prototype.isPlaying = function () {
    return Boolean(this.timer);
  };

  /**
   * Dispara evento de alteração de slide
   */
  DexterCarousel.prototype._dispatchChange = function () {
    var evt = new CustomEvent('dexter.carousel.slide', {
      detail: {
        index: this.currentIndex,
        visibleItems: this._getItemsVisible()
      },
      bubbles: true
    });
    this.el.dispatchEvent(evt);

    if (typeof this.options.onChange === 'function') {
      this.options.onChange(this.currentIndex, this);
    }
  };

  /**
   * Vincula eventos de clique, teclado, redimensionamento e touch swipe
   */
  DexterCarousel.prototype._bindEvents = function () {
    var self = this;

    this.btnPrev.addEventListener('click', function (e) {
      e.preventDefault();
      self.prev();
      if (self.isPlaying()) self.play('reset');
    });

    this.btnNext.addEventListener('click', function (e) {
      e.preventDefault();
      self.next();
      if (self.isPlaying()) self.play('reset');
    });

    // Pausa no hover
    if (this.options.pauseOnHover) {
      this.el.addEventListener('mouseenter', function () {
        if (self.timer) self.pause('hover');
      });
      this.el.addEventListener('mouseleave', function () {
        if (self.options.autoplay && !self._manuallyPaused) self.play('hover');
      });
    }

    // Redimensionamento de janela
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        self._setupIndicators();
        self.update();
      }, 100);
    });

    // Navegação por teclado
    if (this.options.keyboard) {
      this.el.setAttribute('tabindex', '0');
      this.el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          self.prev();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          self.next();
        }
      });
    }

    // Touch Swipe em dispositivos móveis
    if (this.options.touch) {
      var touchStartX = 0;
      var touchStartY = 0;
      var touchEndX = 0;

      this.inner.addEventListener('touchstart', function (e) {
        if (e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      this.inner.addEventListener('touchend', function (e) {
        if (e.changedTouches.length === 1) {
          touchEndX = e.changedTouches[0].clientX;
          var touchEndY = e.changedTouches[0].clientY;
          var diffX = touchEndX - touchStartX;
          var diffY = touchEndY - touchStartY;

          // Se o movimento horizontal for maior que o vertical e passar de 40px
          if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
            if (diffX < 0) {
              self.next();
            } else {
              self.prev();
            }
          }
        }
      }, { passive: true });
    }
  };

  /**
   * Destrói a instância
   */
  DexterCarousel.prototype.destroy = function () {
    this.pause();
    delete this.el._dexterCarouselInstance;
  };

  /**
   * Inicialização automática
   */
  DexterCarousel.initAll = function () {
    var elements = document.querySelectorAll('.carousel[data-dx-carousel], .carousel.carousel-multi, [data-bs-ride="carousel"]');
    Array.prototype.forEach.call(elements, function (el) {
      if (!el._dexterCarouselInstance) {
        new DexterCarousel(el);
      }
    });
  };

  // Auto-init no DOMContentLoaded
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', DexterCarousel.initAll);
    } else {
      DexterCarousel.initAll();
    }
  }

  // Exportação UMD / Global
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DexterCarousel;
    module.exports.Carousel = DexterCarousel;
  } else {
    global.DexterCarousel = DexterCarousel;
    global.Carousel = DexterCarousel;
  }

})(typeof window !== 'undefined' ? window : this);
