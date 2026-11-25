/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-media-tools.js
 * @description [PT-BR] Suíte 100% Vanilla JS para utilitários de entrada e mídia
 *              inspirados em Jack Moore: DexterAutosize (autosize.js), DexterZoom
 *              (jquery-zoom com modos mouseover/grab/click/toggle e ponte jQuery
 *              opcional $.fn.zoom) e DexterWheelzoom (wheelzoom.js via scroll e pan).
 *              [EN]    Zero-dependency Vanilla JS suite for input & media tools
 *              inspired by Jack Moore: DexterAutosize, DexterZoom (hover/grab/
 *              click/toggle magnifier + optional $.fn.zoom bridge) & DexterWheelzoom.
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
    global.DexterMediaTools = api;
    global.DexterAutosize = api.Autosize;
    global.autosize = api.Autosize;
    global.DexterZoom = api.Zoom;
    global.zoom = api.Zoom;
    global.DexterWheelzoom = api.Wheelzoom;
    global.wheelzoom = api.Wheelzoom;

    if (global.dexter && typeof global.dexter === 'object') {
      global.dexter.autosize = api.Autosize;
      global.dexter.zoom = api.Zoom;
      global.dexter.wheelzoom = api.Wheelzoom;
    }
    if (global.jQuery) {
      global.jQuery.fn.zoom = function (opts) {
        api.Zoom(this, opts);
        return this;
      };
    }
  }
})(typeof window !== 'undefined' ? window : this, function (global) {
  'use strict';

  function toElements(target) {
    if (!target || typeof document === 'undefined') return [];
    if (typeof target === 'string') {
      return Array.prototype.slice.call(document.querySelectorAll(target));
    }
    if (target.nodeType) return [target];
    if (target.length !== undefined) return Array.prototype.slice.call(target);
    return [];
  }

  // =========================================================================
  // 1. DexterAutosize (autosize.js drop-in)
  // =========================================================================
  var autosizeMap = typeof WeakMap === 'function' ? new WeakMap() : null;

  function assignAutosize(ta) {
    if (!ta || ta.nodeName !== 'TEXTAREA') return;
    if (autosizeMap && autosizeMap.has(ta)) return;
    if (ta.__dxAutosizeBound) return;

    var cs = global.getComputedStyle(ta);
    var heightOffset = 0;
    if (cs.boxSizing === 'border-box') {
      heightOffset = (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.borderBottomWidth) || 0);
    } else if (cs.boxSizing === 'content-box') {
      heightOffset = -((parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0));
    }

    var savedInline = {
      height: ta.style.height,
      overflowY: ta.style.overflowY,
      resize: ta.style.resize
    };

    ta.style.resize = 'none';
    ta.style.overflowY = 'hidden';

    var prevHeight = null;

    function getParentScrolls() {
      var list = [];
      var node = ta.parentNode;
      while (node && node.nodeType === 1) {
        list.push([node, node.scrollTop, node.scrollLeft]);
        node = node.parentNode;
      }
      return list;
    }

    function update() {
      var scrolls = getParentScrolls();
      var winX = global.pageXOffset || 0;
      var winY = global.pageYOffset || 0;

      ta.style.height = '';
      var computedMin = parseFloat(global.getComputedStyle(ta).minHeight) || 0;
      var nextHeight = Math.max(computedMin, ta.scrollHeight + heightOffset);
      ta.style.height = Math.round(nextHeight) + 'px';

      scrolls.forEach(function (item) {
        item[0].scrollTop = item[1];
        item[0].scrollLeft = item[2];
      });
      if (typeof global.scrollTo === 'function') {
        global.scrollTo(winX, winY);
      }

      if (prevHeight !== Math.round(nextHeight)) {
        prevHeight = Math.round(nextHeight);
        try {
          ta.dispatchEvent(new CustomEvent('autosize:resized', {
            bubbles: true,
            detail: { height: prevHeight }
          }));
        } catch (e) { /* ignore */ }
      }
    }

    function onInput() { update(); }
    function onWindowResize() { update(); }
    function onForceUpdate() { update(); }
    function destroy() {
      ta.removeEventListener('input', onInput);
      ta.removeEventListener('autosize:update', onForceUpdate);
      ta.removeEventListener('autosize:destroy', destroy);
      global.removeEventListener('resize', onWindowResize);
      ta.style.height = savedInline.height;
      ta.style.overflowY = savedInline.overflowY;
      ta.style.resize = savedInline.resize;
      if (autosizeMap) autosizeMap.delete(ta);
      delete ta.__dxAutosizeBound;
    }

    ta.addEventListener('input', onInput);
    ta.addEventListener('autosize:update', onForceUpdate);
    ta.addEventListener('autosize:destroy', destroy);
    global.addEventListener('resize', onWindowResize);

    var rec = { update: update, destroy: destroy };
    if (autosizeMap) autosizeMap.set(ta, rec);
    ta.__dxAutosizeBound = rec;

    update();
  }

  function autosize(elements) {
    var list = toElements(elements);
    list.forEach(assignAutosize);
    return elements;
  }

  autosize.update = function (elements) {
    toElements(elements).forEach(function (ta) {
      if (ta && ta.nodeName === 'TEXTAREA') {
        if (ta.__dxAutosizeBound) {
          ta.__dxAutosizeBound.update();
        } else {
          ta.dispatchEvent(new CustomEvent('autosize:update'));
        }
      }
    });
    return elements;
  };

  autosize.destroy = function (elements) {
    toElements(elements).forEach(function (ta) {
      if (ta && ta.nodeName === 'TEXTAREA') {
        if (ta.__dxAutosizeBound) {
          ta.__dxAutosizeBound.destroy();
        } else {
          ta.dispatchEvent(new CustomEvent('autosize:destroy'));
        }
      }
    });
    return elements;
  };

  // =========================================================================
  // 2. DexterZoom (jquery-zoom 4-mode magnifier: mouseover, grab, click, toggle)
  // =========================================================================
  function setupZoomTarget(target, options) {
    if (!target || typeof document === 'undefined') return null;

    var cfg = Object.assign({
      url: false,
      on: 'mouseover',
      duration: 120,
      magnify: 1.8,
      touch: true,
      target: false,
      callback: null,
      onZoomIn: null,
      onZoomOut: null
    }, options || {});

    // Se passou diretamente uma <img>, envolve automaticamente em <span class="dx-zoom">
    var container = target;
    var baseImg = null;
    if (target.nodeName === 'IMG') {
      baseImg = target;
      if (target.parentNode && target.parentNode.classList && target.parentNode.classList.contains('dx-zoom')) {
        container = target.parentNode;
      } else {
        container = document.createElement('span');
        container.className = 'dx-zoom';
        if (target.parentNode) {
          target.parentNode.insertBefore(container, target);
        }
        container.appendChild(target);
      }
    } else {
      baseImg = container.querySelector('img:not(.zoomImg)');
    }

    if (!baseImg) return null;
    if (container.__dxZoomCtrl) {
      container.__dxZoomCtrl.destroy();
    }

    var mode = container.getAttribute('data-zoom-on') || cfg.on || 'mouseover';
    var url = container.getAttribute('data-zoom-url') || baseImg.getAttribute('data-zoom-url') || cfg.url || baseImg.currentSrc || baseImg.src;
    var magnify = parseFloat(container.getAttribute('data-zoom-magnify')) || Number(cfg.magnify) || 1.8;

    container.classList.add('dx-zoom', 'dx-zoom-' + mode);

    var zoomImg = document.createElement('img');
    zoomImg.className = 'zoomImg';
    zoomImg.alt = '';
    zoomImg.setAttribute('aria-hidden', 'true');
    zoomImg.src = url;
    container.appendChild(zoomImg);

    var zooming = false;
    var clicked = false;

    function measureAndMove(clientX, clientY) {
      var rect = container.getBoundingClientRect();
      var cw = rect.width || baseImg.offsetWidth || 300;
      var ch = rect.height || baseImg.offsetHeight || 200;

      var effW = Math.max(Math.round(cw * magnify), zoomImg.naturalWidth || 0);
      var effH = (zoomImg.naturalWidth && zoomImg.naturalHeight)
        ? Math.max(Math.round(ch * magnify), Math.round(effW * (zoomImg.naturalHeight / zoomImg.naturalWidth)))
        : Math.round(ch * magnify);

      zoomImg.style.width = effW + 'px';
      zoomImg.style.height = effH + 'px';

      var rx = rect.width ? (clientX - rect.left) / rect.width : 0.5;
      var ry = rect.height ? (clientY - rect.top) / rect.height : 0.5;
      rx = Math.max(0, Math.min(1, rx));
      ry = Math.max(0, Math.min(1, ry));

      var left = -rx * Math.max(0, effW - cw);
      var top = -ry * Math.max(0, effH - ch);
      zoomImg.style.left = Math.round(left) + 'px';
      zoomImg.style.top = Math.round(top) + 'px';
    }

    function zoomIn(e) {
      var rect = container.getBoundingClientRect();
      var cx = (e && typeof e.clientX === 'number') ? e.clientX : rect.left + rect.width / 2;
      var cy = (e && typeof e.clientY === 'number') ? e.clientY : rect.top + rect.height / 2;
      measureAndMove(cx, cy);
      if (!zooming) {
        zooming = true;
        container.classList.add('is-zooming');
        if (typeof cfg.onZoomIn === 'function') cfg.onZoomIn.call(zoomImg);
        try {
          container.dispatchEvent(new CustomEvent('zoom:in', { bubbles: true }));
        } catch (err) { /* ignore */ }
      }
    }

    function zoomOut() {
      if (!zooming) return;
      zooming = false;
      clicked = false;
      container.classList.remove('is-zooming');
      if (typeof cfg.onZoomOut === 'function') cfg.onZoomOut.call(zoomImg);
      try {
        container.dispatchEvent(new CustomEvent('zoom:out', { bubbles: true }));
      } catch (err) { /* ignore */ }
    }

    function onMouseMove(e) {
      if (zooming) {
        measureAndMove(e.clientX, e.clientY);
      }
    }

    function onMouseEnter(e) { zoomIn(e); }
    function onMouseLeave() { zoomOut(); }
    function onMouseDown(e) {
      if (e.button !== 0) return;
      e.preventDefault();
      zoomIn(e);
    }
    function onMouseUp() { zoomOut(); }
    function onClick(e) {
      if (clicked) {
        zoomOut();
      } else {
        clicked = true;
        zoomIn(e);
      }
    }

    var listeners = [];
    function bind(el, evt, fn, opts) {
      el.addEventListener(evt, fn, opts);
      listeners.push([el, evt, fn, opts]);
    }

    if (mode === 'grab') {
      bind(container, 'mousedown', onMouseDown);
      bind(document, 'mouseup', onMouseUp);
      bind(container, 'mousemove', onMouseMove);
      bind(container, 'mouseleave', onMouseLeave);
    } else if (mode === 'click') {
      bind(container, 'click', onClick);
      bind(container, 'mousemove', onMouseMove);
      bind(container, 'mouseleave', onMouseLeave);
    } else if (mode === 'toggle') {
      bind(container, 'click', onClick);
      bind(container, 'mousemove', onMouseMove);
    } else {
      bind(container, 'mouseenter', onMouseEnter);
      bind(container, 'mousemove', onMouseMove);
      bind(container, 'mouseleave', onMouseLeave);
    }

    if (typeof cfg.callback === 'function') {
      if (zoomImg.complete) cfg.callback.call(zoomImg);
      else zoomImg.addEventListener('load', function () { cfg.callback.call(zoomImg); });
    }

    var ctrl = {
      container: container,
      zoomImg: zoomImg,
      zoomIn: zoomIn,
      zoomOut: zoomOut,
      isZooming: function () { return zooming; },
      destroy: function () {
        zoomOut();
        listeners.forEach(function (item) {
          item[0].removeEventListener(item[1], item[2], item[3]);
        });
        if (zoomImg.parentNode) zoomImg.parentNode.removeChild(zoomImg);
        container.classList.remove('dx-zoom-' + mode, 'is-zooming');
        delete container.__dxZoomCtrl;
      }
    };
    container.__dxZoomCtrl = ctrl;
    return ctrl;
  }

  function zoom(targets, options) {
    var list = toElements(targets);
    var ctrls = list.map(function (el) { return setupZoomTarget(el, options); }).filter(Boolean);
    return ctrls.length === 1 ? ctrls[0] : ctrls;
  }

  // =========================================================================
  // 3. DexterWheelzoom (wheelzoom.js via scroll + pointer pan)
  // =========================================================================
  function createSvgPlaceholder(w, h) {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"></svg>'
    );
  }

  function setupWheelzoom(img, options) {
    if (!img || img.nodeName !== 'IMG' || typeof document === 'undefined') return null;
    if (img.__dxWheelzoomCtrl) return img.__dxWheelzoomCtrl;

    var cfg = Object.assign({
      zoom: parseFloat(img.getAttribute('data-wheelzoom-step')) || 0.15,
      maxZoom: parseFloat(img.getAttribute('data-wheelzoom-max')) || 4,
      initialZoom: parseFloat(img.getAttribute('data-wheelzoom-initial')) || 1,
      initialX: 0.5,
      initialY: 0.5
    }, options || {});

    var origSrc = img.currentSrc || img.src;
    var natW = 800;
    var natH = 500;
    var width = 0;
    var height = 0;
    var bgWidth = 0;
    var bgHeight = 0;
    var bgPosX = 0;
    var bgPosY = 0;
    var scale = 1;
    var initialized = false;
    var destroyed = false;

    function syncStageBadge() {
      var levelText = scale.toFixed(2).replace(/\.00$/, '.0') + 'x';
      img.setAttribute('data-wheelzoom-level', levelText);
      var stage = img.closest('.dx-wheelzoom-stage');
      if (stage) {
        var badge = stage.querySelector('.dx-wheelzoom-level');
        if (badge) badge.textContent = levelText;
      }
      try {
        img.dispatchEvent(new CustomEvent('wheelzoom:change', {
          bubbles: true,
          detail: { scale: scale, levelText: levelText }
        }));
      } catch (e) { /* ignore */ }
    }

    function updateBgStyle() {
      if (bgPosX > 0) bgPosX = 0;
      else if (bgPosX < width - bgWidth) bgPosX = width - bgWidth;

      if (bgPosY > 0) bgPosY = 0;
      else if (bgPosY < height - bgHeight) bgPosY = height - bgHeight;

      img.style.backgroundSize = Math.round(bgWidth) + 'px ' + Math.round(bgHeight) + 'px';
      img.style.backgroundPosition = Math.round(bgPosX) + 'px ' + Math.round(bgPosY) + 'px';
      scale = width > 0 ? (bgWidth / width) : 1;
      syncStageBadge();
    }

    function reset() {
      if (!initialized) return;
      width = img.clientWidth || natW;
      height = img.clientHeight || natH;
      bgWidth = width;
      bgHeight = height;
      bgPosX = 0;
      bgPosY = 0;
      updateBgStyle();
    }

    function applyZoomAt(deltaFactor, clientX, clientY) {
      if (!initialized || destroyed) return;
      width = img.clientWidth || width;
      height = img.clientHeight || height;
      if (!width || !height) return;

      var rect = img.getBoundingClientRect();
      var offsetX = (typeof clientX === 'number') ? (clientX - rect.left) : width / 2;
      var offsetY = (typeof clientY === 'number') ? (clientY - rect.top) : height / 2;

      var bgCursorX = offsetX - bgPosX;
      var bgCursorY = offsetY - bgPosY;
      var bgRatioX = bgWidth ? bgCursorX / bgWidth : 0.5;
      var bgRatioY = bgHeight ? bgCursorY / bgHeight : 0.5;

      var nextScale = Math.max(1, Math.min(cfg.maxZoom, scale + deltaFactor));
      bgWidth = width * nextScale;
      bgHeight = height * nextScale;

      if (nextScale <= 1.001) {
        bgWidth = width;
        bgHeight = height;
        bgPosX = 0;
        bgPosY = 0;
      } else {
        bgPosX = offsetX - (bgWidth * bgRatioX);
        bgPosY = offsetY - (bgHeight * bgRatioY);
      }

      updateBgStyle();
    }

    function onWheel(e) {
      if (!initialized) return;
      e.preventDefault();
      var step = e.deltaY < 0 ? cfg.zoom : -cfg.zoom;
      applyZoomAt(step, e.clientX, e.clientY);
    }

    var dragging = false;
    var prevX = 0;
    var prevY = 0;

    function onPointerDown(e) {
      if (e.button !== 0 || scale <= 1.001) return;
      e.preventDefault();
      dragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
      img.classList.add('is-dragging');
    }

    function onPointerMove(e) {
      if (!dragging) return;
      bgPosX += (e.clientX - prevX);
      bgPosY += (e.clientY - prevY);
      prevX = e.clientX;
      prevY = e.clientY;
      updateBgStyle();
    }

    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      img.classList.remove('is-dragging');
    }

    function onDblClick() {
      reset();
    }

    function activate() {
      if (initialized || destroyed) return;
      natW = img.naturalWidth || img.clientWidth || 800;
      natH = img.naturalHeight || img.clientHeight || 500;
      width = img.clientWidth || natW;
      height = img.clientHeight || natH;

      var safeBgUrl = origSrc.replace(/"/g, '%22').replace(/\n/g, '');
      img.classList.add('dx-wheelzoom');
      img.style.backgroundImage = 'url("' + safeBgUrl + '")';
      img.style.backgroundRepeat = 'no-repeat';
      img.src = createSvgPlaceholder(natW, natH);

      initialized = true;
      var initScale = Math.max(1, Math.min(cfg.maxZoom, cfg.initialZoom));
      bgWidth = width * initScale;
      bgHeight = height * initScale;
      bgPosX = -(bgWidth - width) * cfg.initialX;
      bgPosY = -(bgHeight - height) * cfg.initialY;
      updateBgStyle();

      img.addEventListener('wheel', onWheel, { passive: false });
      img.addEventListener('pointerdown', onPointerDown);
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      img.addEventListener('dblclick', onDblClick);
      img.addEventListener('wheelzoom.reset', reset);
      img.addEventListener('wheelzoom.destroy', destroy);
    }

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      img.removeEventListener('wheel', onWheel);
      img.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      img.removeEventListener('dblclick', onDblClick);
      img.removeEventListener('wheelzoom.reset', reset);
      img.removeEventListener('wheelzoom.destroy', destroy);
      img.style.backgroundImage = '';
      img.style.backgroundRepeat = '';
      img.style.backgroundPosition = '';
      img.style.backgroundSize = '';
      img.classList.remove('dx-wheelzoom', 'is-dragging');
      img.src = origSrc;
      delete img.__dxWheelzoomCtrl;
    }

    if (img.complete && img.naturalWidth) {
      activate();
    } else {
      img.addEventListener('load', activate, { once: true });
    }

    var ctrl = {
      zoomIn: function (factor) { applyZoomAt(factor || cfg.zoom); },
      zoomOut: function (factor) { applyZoomAt(-(factor || cfg.zoom)); },
      reset: reset,
      destroy: destroy,
      getScale: function () { return scale; }
    };
    img.__dxWheelzoomCtrl = ctrl;
    return ctrl;
  }

  function wheelzoom(images, options) {
    var list = toElements(images);
    var ctrls = list.map(function (img) { return setupWheelzoom(img, options); }).filter(Boolean);
    return ctrls.length === 1 ? ctrls[0] : ctrls;
  }

  wheelzoom.zoomIn = function (imgOrSel, factor) {
    toElements(imgOrSel).forEach(function (img) {
      if (img.__dxWheelzoomCtrl) img.__dxWheelzoomCtrl.zoomIn(factor);
    });
  };
  wheelzoom.zoomOut = function (imgOrSel, factor) {
    toElements(imgOrSel).forEach(function (img) {
      if (img.__dxWheelzoomCtrl) img.__dxWheelzoomCtrl.zoomOut(factor);
    });
  };
  wheelzoom.reset = function (imgOrSel) {
    toElements(imgOrSel).forEach(function (img) {
      if (img.__dxWheelzoomCtrl) img.__dxWheelzoomCtrl.reset();
    });
  };
  wheelzoom.destroy = function (imgOrSel) {
    toElements(imgOrSel).forEach(function (img) {
      if (img.__dxWheelzoomCtrl) img.__dxWheelzoomCtrl.destroy();
    });
  };

  // Delegação para botões opcionais dentro de .dx-wheelzoom-stage
  var controlsBound = false;
  function bindStageControls() {
    if (controlsBound || typeof document === 'undefined') return;
    controlsBound = true;
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-wz-action]');
      if (!btn) return;
      var stage = btn.closest('.dx-wheelzoom-stage');
      var img = stage ? stage.querySelector('img') : null;
      if (!img) return;
      var action = btn.getAttribute('data-wz-action');
      if (action === 'in') wheelzoom.zoomIn(img);
      else if (action === 'out') wheelzoom.zoomOut(img);
      else if (action === 'reset') wheelzoom.reset(img);
    });
  }

  function initAll(root) {
    var scope = root || document;
    autosize(scope.querySelectorAll('[data-dx-autosize], textarea.dx-autosize'));
    zoom(scope.querySelectorAll('[data-dx-zoom]'));
    wheelzoom(scope.querySelectorAll('img[data-dx-wheelzoom]'));
    bindStageControls();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { initAll(document); });
    } else {
      initAll(document);
    }
  }

  return {
    initAll: initAll,
    Autosize: autosize,
    Zoom: zoom,
    Wheelzoom: wheelzoom
  };
});
