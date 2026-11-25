/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-calendar.js
 * @description [PT-BR] Controlador nativo zero-dependência para Calendário de Eventos
 *              (DexterCalendar / BsCalendar), inspirado e aprimorado a partir do
 *              jquery-bs-calendar (ThomasDev-de/jquery-bs-calendar).
 *              Suporta localização automática via Intl.DateTimeFormat, fontes de eventos
 *              estáticas, remotas (fetch URL com from/to + queryParams) ou por função,
 *              contêiner externo de compromissos (eventListContainer), popover flutuante ao
 *              passar o cursor, delegação de eventos customizados, ponte jQuery opcional
 *              ($.fn.bsCalendar / $.bsCalendar) e ciclo completo de eventos.
 *              [EN]    Zero-dependency native controller for Event Calendar
 *              (DexterCalendar / BsCalendar), inspired and enhanced from
 *              jquery-bs-calendar (ThomasDev-de/jquery-bs-calendar).
 *              Supports automatic localization via Intl.DateTimeFormat, static, remote
 *              (fetch URL with from/to + queryParams) or function event sources, external
 *              eventListContainer, hover summary popover, delegated custom handlers,
 *              optional jQuery bridge ($.fn.bsCalendar / $.bsCalendar) and full lifecycle events.
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
    var CalClass = factory();
    global.DexterCalendar = CalClass;
    global.BsCalendar = CalClass;
    global.dexter = global.dexter || {};
    global.dexter.Calendar = CalClass;

    // Ponte jQuery opcional (drop-in compatibility com jquery-bs-calendar)
    if (global.jQuery) {
      global.jQuery.bsCalendar = {
        setDefault: function (prop, val) {
          CalClass.setDefault(prop, val);
        },
        setDefaults: function (obj) {
          CalClass.setDefaults(obj);
        }
      };

      global.jQuery.fn.bsCalendar = function (optionOrMethod) {
        var args = Array.prototype.slice.call(arguments, 1);
        return this.each(function () {
          var inst = CalClass.getOrCreateInstance(this, typeof optionOrMethod === 'object' ? optionOrMethod : {});
          if (typeof optionOrMethod === 'string' && typeof inst[optionOrMethod] === 'function') {
            inst[optionOrMethod].apply(inst, args);
          }
        });
      };
    }
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var INSTANCE_MAP = new WeakMap();

  var DEFAULT_OPTIONS = {
    locale: 'pt-BR',
    url: null, // null | string | function(params) | Array
    events: null, // Atalho para array estático de eventos
    queryParams: function (params) { return params; },
    width: '310px',
    icons: {
      prev: '<svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>',
      next: '<svg viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>'
    },
    showTodayHeader: true,
    eventListContainer: null,
    classes: {
      table: 'dx-cal-table',
      tableHeaderCell: '',
      tableHeaderCellActive: 'is-today-col',
      tableData: {
        all: '',
        today: 'is-today',
        hover: '',
        active: 'is-active',
        inMonth: 'is-in-month',
        notInMonth: 'is-outside',
        eventCounter: 'dx-cal-counter'
      }
    },
    event: {
      formatter: null,
      events: {}
    },
    popoverConfig: {
      enabled: true,
      html: true,
      delay: 180,
      placement: 'top',
      trigger: 'hover'
    },
    formatPopoverContent: null,
    formatNoEvent: null,
    weekStartsOn: 0 // 0 = Domingo, 1 = Segunda
  };

  function pad2(n) {
    return n < 10 ? '0' + n : String(n);
  }

  function toYmd(date) {
    return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
  }

  function parseEventDate(str) {
    if (!str) return null;
    if (str instanceof Date) return str;
    var clean = String(str).replace(' ', 'T');
    var d = new Date(clean);
    return isNaN(d.getTime()) ? null : d;
  }

  function escapeHtml(text) {
    return String(text || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function dispatchEventCompat(el, name, detail) {
    el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail }));
    el.dispatchEvent(new CustomEvent('dx:calendar:' + name, { bubbles: true, detail: detail }));
    if (typeof window !== 'undefined' && window.jQuery) {
      window.jQuery(el).trigger(name, detail && detail.args ? detail.args : [detail]);
    }
  }

  function DexterCalendar(element, options) {
    this.el = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.el) {
      throw new Error('[DexterCalendar] Elemento container não encontrado.');
    }

    if (INSTANCE_MAP.has(this.el)) {
      return INSTANCE_MAP.get(this.el);
    }

    this.options = this._mergeOptions(DEFAULT_OPTIONS, this._readDataOptions(), options || {});
    var now = new Date();
    this.today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    this.viewDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    this.selectedDate = new Date(this.today.getTime());
    this.eventsCache = Array.isArray(this.options.events) ? this.options.events.slice() : [];
    this._popoverEl = null;
    this._popoverTimer = null;

    this._init();
    INSTANCE_MAP.set(this.el, this);
  }

  DexterCalendar.prototype._mergeOptions = function () {
    var result = {};
    for (var i = 0; i < arguments.length; i++) {
      var src = arguments[i];
      if (!src || typeof src !== 'object') continue;
      Object.keys(src).forEach(function (key) {
        if (src[key] && typeof src[key] === 'object' && !Array.isArray(src[key]) && !(src[key] instanceof HTMLElement)) {
          result[key] = Object.assign({}, result[key] || {}, src[key]);
        } else {
          result[key] = src[key];
        }
      });
    }
    return result;
  };

  DexterCalendar.prototype._readDataOptions = function () {
    var ds = this.el.dataset || {};
    var opts = {};
    if (ds.locale) opts.locale = ds.locale;
    if (ds.width) opts.width = ds.width;
    if (ds.url) opts.url = ds.url;
    if (ds.eventListContainer) opts.eventListContainer = ds.eventListContainer;
    if (ds.showTodayHeader !== undefined) opts.showTodayHeader = ds.showTodayHeader !== 'false';
    if (ds.events) {
      try {
        opts.events = JSON.parse(ds.events);
      } catch (e) { /* ignora JSON inválido */ }
    }
    return opts;
  };

  DexterCalendar.prototype._init = function () {
    this.el.classList.add('dx-calendar', 'bs-calendar');
    if (this.options.width && !this.el.classList.contains('calendar-fluid')) {
      this.el.style.setProperty('--dx-cal-width', this.options.width);
    }

    this._bindDelegatedEvents();
    this.refresh();

    dispatchEventCompat(this.el, 'init', { calendar: this });
  };

  DexterCalendar.prototype._bindDelegatedEvents = function () {
    var self = this;

    // Bloqueia propagação quando dentro de .dropdown-menu para não fechar o dropdown ao trocar de mês/dia
    this.el.addEventListener('click', function (e) {
      if (self.el.closest('.dropdown-menu')) {
        e.stopPropagation();
      }
    });
  };

  DexterCalendar.prototype._getVisibleRange = function () {
    var firstOfMonth = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth(), 1);
    var startOffset = (firstOfMonth.getDay() - (this.options.weekStartsOn || 0) + 7) % 7;
    var gridStart = new Date(firstOfMonth.getFullYear(), firstOfMonth.getMonth(), 1 - startOffset);
    var gridEnd = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + 41);
    return {
      from: toYmd(gridStart),
      to: toYmd(gridEnd),
      gridStart: gridStart
    };
  };

  DexterCalendar.prototype._loadEvents = function () {
    var self = this;
    var range = this._getVisibleRange();
    var params = this.options.queryParams ? this.options.queryParams({ from: range.from, to: range.to }) : { from: range.from, to: range.to };

    if (Array.isArray(this.options.events) && !this.options.url) {
      this.eventsCache = this.options.events.slice();
      dispatchEventCompat(this.el, 'events-loaded', { events: this.eventsCache, args: [this.eventsCache] });
      return Promise.resolve(this.eventsCache);
    }

    if (typeof this.options.url === 'function') {
      return Promise.resolve(this.options.url(params)).then(function (data) {
        self.eventsCache = Array.isArray(data) ? data : [];
        dispatchEventCompat(self.el, 'events-loaded', { events: self.eventsCache, args: [self.eventsCache] });
        return self.eventsCache;
      });
    }

    if (typeof this.options.url === 'string' && this.options.url) {
      var qs = Object.keys(params).map(function (k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]);
      }).join('&');
      var sep = this.options.url.indexOf('?') === -1 ? '?' : '&';
      return fetch(this.options.url + sep + qs)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          self.eventsCache = Array.isArray(data) ? data : [];
          dispatchEventCompat(self.el, 'events-loaded', { events: self.eventsCache, args: [self.eventsCache] });
          return self.eventsCache;
        })
        .catch(function () {
          self.eventsCache = Array.isArray(self.options.events) ? self.options.events.slice() : [];
          return self.eventsCache;
        });
    }

    return Promise.resolve(this.eventsCache);
  };

  DexterCalendar.prototype._getEventsForDate = function (ymd) {
    return this.eventsCache.filter(function (ev) {
      var start = parseEventDate(ev.start);
      var end = parseEventDate(ev.end || ev.start);
      if (!start) return false;
      var sYmd = toYmd(start);
      var eYmd = end ? toYmd(end) : sYmd;
      return ymd >= sYmd && ymd <= eYmd;
    });
  };

  DexterCalendar.prototype.refresh = function () {
    var self = this;
    return this._loadEvents().then(function () {
      self._render();
      self._renderEventList(toYmd(self.selectedDate));
    });
  };

  DexterCalendar.prototype._render = function () {
    var self = this;
    var locale = this.options.locale || 'pt-BR';
    var range = this._getVisibleRange();
    var todayYmd = toYmd(this.today);
    var activeYmd = toYmd(this.selectedDate);

    this._hidePopover();
    this.el.innerHTML = '';

    // 1. Hoje Header
    if (this.options.showTodayHeader) {
      var todayBtn = document.createElement('button');
      todayBtn.type = 'button';
      todayBtn.className = 'dx-cal-today-header';
      var todayLabel = new Intl.DateTimeFormat(locale, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }).format(this.today);
      var prefix = locale.toLowerCase().indexOf('pt') === 0 ? 'Hoje: ' : (locale.toLowerCase().indexOf('de') === 0 ? 'Heute: ' : 'Today: ');
      todayBtn.innerHTML = '<span>' + escapeHtml(prefix + todayLabel) + '</span><span>●</span>';
      todayBtn.addEventListener('click', function () {
        self.goToToday();
      });
      this.el.appendChild(todayBtn);
    }

    // 2. Barra de Navegação Mensal
    var nav = document.createElement('div');
    nav.className = 'dx-cal-nav';

    var monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(this.viewDate);
    var monthBtn = document.createElement('button');
    monthBtn.type = 'button';
    monthBtn.className = 'dx-cal-month-btn';
    monthBtn.textContent = monthLabel;
    monthBtn.addEventListener('click', function () {
      dispatchEventCompat(self.el, 'click-current-month', { date: new Date(self.viewDate) });
      self.goToToday();
    });

    var actions = document.createElement('div');
    actions.className = 'dx-cal-nav-actions';

    var prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.className = 'dx-cal-nav-btn';
    prevBtn.setAttribute('aria-label', 'Mês anterior');
    prevBtn.innerHTML = this._renderIcon(this.options.icons.prev);
    prevBtn.addEventListener('click', function () {
      dispatchEventCompat(self.el, 'click-prev-month', { date: new Date(self.viewDate) });
      self.prevMonth();
    });

    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'dx-cal-nav-btn';
    nextBtn.setAttribute('aria-label', 'Próximo mês');
    nextBtn.innerHTML = this._renderIcon(this.options.icons.next);
    nextBtn.addEventListener('click', function () {
      dispatchEventCompat(self.el, 'click-next-month', { date: new Date(self.viewDate) });
      self.nextMonth();
    });

    actions.appendChild(prevBtn);
    actions.appendChild(nextBtn);
    nav.appendChild(monthBtn);
    nav.appendChild(actions);
    this.el.appendChild(nav);

    // 3. Tabela de Dias
    var table = document.createElement('table');
    table.className = (this.options.classes && this.options.classes.table) || 'dx-cal-table';

    var thead = document.createElement('thead');
    var headRow = document.createElement('tr');
    var weekdayFmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    var baseSunday = new Date(2024, 0, 7 + (this.options.weekStartsOn || 0)); // Domingo

    for (var w = 0; w < 7; w++) {
      var wd = new Date(baseSunday.getFullYear(), baseSunday.getMonth(), baseSunday.getDate() + w);
      var th = document.createElement('th');
      th.textContent = weekdayFmt.format(wd).replace('.', '').slice(0, 3);
      if (wd.getDay() === this.today.getDay() &&
          this.viewDate.getMonth() === this.today.getMonth() &&
          this.viewDate.getFullYear() === this.today.getFullYear()) {
        th.className = (this.options.classes && this.options.classes.tableHeaderCellActive) || 'is-today-col';
      } else if (this.options.classes && this.options.classes.tableHeaderCell) {
        th.className = this.options.classes.tableHeaderCell;
      }
      headRow.appendChild(th);
    }
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    var cursor = new Date(range.gridStart.getTime());

    for (var row = 0; row < 6; row++) {
      var tr = document.createElement('tr');
      for (var col = 0; col < 7; col++) {
        (function (cellDate) {
          var ymd = toYmd(cellDate);
          var inMonth = cellDate.getMonth() === self.viewDate.getMonth();
          var isToday = ymd === todayYmd;
          var isActive = ymd === activeYmd;
          var dayEvents = self._getEventsForDate(ymd);

          var td = document.createElement('td');
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'dx-cal-day';
          btn.setAttribute('data-date', ymd);
          btn.textContent = String(cellDate.getDate());

          if (inMonth) btn.classList.add('is-in-month');
          else btn.classList.add('is-outside');
          if (isToday) btn.classList.add('is-today');
          if (isActive) btn.classList.add('is-active');

          if (dayEvents.length > 0) {
            btn.classList.add('has-events');
            var counter = document.createElement('span');
            counter.className = 'dx-cal-counter';
            counter.textContent = String(dayEvents.length);
            btn.appendChild(counter);

            if (self.options.popoverConfig) {
              btn.addEventListener('mouseenter', function () {
                self._schedulePopover(btn, dayEvents, cellDate);
              });
              btn.addEventListener('mouseleave', function () {
                self._hidePopover();
              });
            }
          }

          btn.addEventListener('click', function () {
            self.selectedDate = new Date(cellDate.getTime());
            if (!inMonth) {
              self.viewDate = new Date(cellDate.getFullYear(), cellDate.getMonth(), 1);
              self._render();
            } else {
              var allDays = self.el.querySelectorAll('.dx-cal-day');
              allDays.forEach(function (d) { d.classList.remove('is-active'); });
              btn.classList.add('is-active');
            }
            self._renderEventList(ymd);
            dispatchEventCompat(self.el, 'change-day', { date: ymd, events: dayEvents, args: [ymd, dayEvents] });
          });

          td.appendChild(btn);
          tr.appendChild(td);
        })(new Date(cursor.getTime()));

        cursor.setDate(cursor.getDate() + 1);
      }
      tbody.appendChild(tr);
    }

    table.appendChild(tbody);
    this.el.appendChild(table);

    // 4. Container interno de eventos (se não houver container externo)
    if (!this.options.eventListContainer) {
      var listBox = document.createElement('div');
      listBox.className = 'dx-cal-events';
      this.el.appendChild(listBox);
      this._internalListEl = listBox;
    } else {
      this._internalListEl = null;
    }
  };

  DexterCalendar.prototype._renderIcon = function (val) {
    if (!val) return '';
    if (String(val).trim().charAt(0) === '<') return val;
    return '<i class="' + escapeHtml(val) + '" aria-hidden="true"></i>';
  };

  DexterCalendar.prototype._getListTargetEl = function () {
    if (this.options.eventListContainer) {
      return typeof this.options.eventListContainer === 'string'
        ? document.querySelector(this.options.eventListContainer)
        : this.options.eventListContainer;
    }
    return this._internalListEl;
  };

  DexterCalendar.prototype._renderEventList = function (ymd) {
    var self = this;
    var container = this._getListTargetEl();
    if (!container) return;

    var dayEvents = this._getEventsForDate(ymd);
    dispatchEventCompat(this.el, 'show-event-list', { date: ymd, events: dayEvents, args: [dayEvents] });

    container.innerHTML = '';

    if (dayEvents.length === 0) {
      var emptyDiv = document.createElement('div');
      emptyDiv.className = 'dx-cal-empty';
      if (typeof this.options.formatNoEvent === 'function') {
        emptyDiv.innerHTML = this.options.formatNoEvent(ymd);
      } else {
        emptyDiv.textContent = this.options.locale.toLowerCase().indexOf('pt') === 0
          ? 'Nenhum compromisso para ' + ymd
          : 'No appointments on ' + ymd;
      }
      container.appendChild(emptyDiv);
      dispatchEventCompat(this.el, 'shown-event-list', { date: ymd, events: dayEvents, args: [dayEvents] });
      return;
    }

    dayEvents.forEach(function (ev) {
      var itemEl;
      if (self.options.event && typeof self.options.event.formatter === 'function') {
        var wrap = document.createElement('div');
        wrap.innerHTML = self.options.event.formatter(ev);
        itemEl = wrap.firstElementChild || wrap;
      } else {
        itemEl = document.createElement('div');
        itemEl.className = 'dx-cal-event-item';
        var startTime = ev.start && String(ev.start).length >= 16 ? String(ev.start).slice(11, 16) : '';
        var endTime = ev.end && String(ev.end).length >= 16 ? String(ev.end).slice(11, 16) : '';
        var timeHtml = startTime ? '<div class="dx-cal-event-time">' + escapeHtml(startTime + (endTime ? ' – ' + endTime : '')) + '</div>' : '';
        var titleHtml = '<div class="dx-cal-event-title">' +
          (ev.link ? '<a href="' + escapeHtml(ev.link) + '" target="_blank" rel="noopener">' + escapeHtml(ev.title) + '</a>' : escapeHtml(ev.title)) +
          '</div>';
        var descHtml = ev.description ? '<div class="dx-cal-event-desc">' + escapeHtml(ev.description) + '</div>' : '';
        itemEl.innerHTML = timeHtml + titleHtml + descHtml;
      }

      // Eventos delegados configurados via options.event.events
      if (self.options.event && self.options.event.events) {
        Object.keys(self.options.event.events).forEach(function (spec) {
          var fn = self.options.event.events[spec];
          if (typeof fn !== 'function') return;
          var parts = spec.trim().split(/\s+/);
          var evtName = parts.shift();
          var selector = parts.join(' ');
          itemEl.addEventListener(evtName, function (e) {
            var matched = selector ? e.target.closest(selector) : itemEl;
            if (matched && itemEl.contains(matched)) {
              fn.call(matched, e, ev, typeof window !== 'undefined' && window.jQuery ? window.jQuery(matched) : matched);
            }
          });
        });
      }

      container.appendChild(itemEl);
    });

    dispatchEventCompat(this.el, 'shown-event-list', { date: ymd, events: dayEvents, args: [dayEvents] });
  };

  DexterCalendar.prototype._schedulePopover = function (targetBtn, events, dateObj) {
    var self = this;
    this._hidePopover();
    var delay = (this.options.popoverConfig && this.options.popoverConfig.delay) || 180;

    this._popoverTimer = setTimeout(function () {
      var html = '';
      if (typeof self.options.formatPopoverContent === 'function') {
        html = self.options.formatPopoverContent(events, dateObj);
      } else {
        html = '<div class="fw-bold mb-1">' + events.length + (events.length === 1 ? ' evento' : ' eventos') + '</div>' +
          events.slice(0, 3).map(function (ev) {
            return '<div class="text-truncate">• ' + escapeHtml(ev.title) + '</div>';
          }).join('');
      }
      if (!html) return;

      var pop = document.createElement('div');
      pop.className = 'dx-cal-popover';
      pop.innerHTML = html;
      document.body.appendChild(pop);

      var rect = targetBtn.getBoundingClientRect();
      var pw = pop.offsetWidth || 180;
      var ph = pop.offsetHeight || 60;
      var top = rect.top - ph - 8;
      if (top < 8) top = rect.bottom + 8;
      var left = Math.max(8, Math.min(rect.left + rect.width / 2 - pw / 2, window.innerWidth - pw - 8));

      pop.style.top = Math.round(top) + 'px';
      pop.style.left = Math.round(left) + 'px';
      self._popoverEl = pop;
    }, delay);
  };

  DexterCalendar.prototype._hidePopover = function () {
    if (this._popoverTimer) {
      clearTimeout(this._popoverTimer);
      this._popoverTimer = null;
    }
    if (this._popoverEl && this._popoverEl.parentNode) {
      this._popoverEl.parentNode.removeChild(this._popoverEl);
    }
    this._popoverEl = null;
  };

  DexterCalendar.prototype.nextMonth = function () {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() + 1, 1);
    dispatchEventCompat(this.el, 'change-month', { date: new Date(this.viewDate) });
    return this.refresh();
  };

  DexterCalendar.prototype.prevMonth = function () {
    this.viewDate = new Date(this.viewDate.getFullYear(), this.viewDate.getMonth() - 1, 1);
    dispatchEventCompat(this.el, 'change-month', { date: new Date(this.viewDate) });
    return this.refresh();
  };

  DexterCalendar.prototype.goToToday = function () {
    this.viewDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    this.selectedDate = new Date(this.today.getTime());
    dispatchEventCompat(this.el, 'change-month', { date: new Date(this.viewDate) });
    return this.refresh();
  };

  DexterCalendar.prototype.setDate = function (dateStr) {
    var d = parseEventDate(dateStr);
    if (!d) return;
    this.viewDate = new Date(d.getFullYear(), d.getMonth(), 1);
    this.selectedDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    dispatchEventCompat(this.el, 'change-month', { date: new Date(this.viewDate) });
    return this.refresh();
  };

  DexterCalendar.prototype.setEvents = function (arr) {
    this.options.events = Array.isArray(arr) ? arr.slice() : [];
    this.eventsCache = this.options.events.slice();
    return this.refresh();
  };

  DexterCalendar.prototype.updateOptions = function (newOpts) {
    this.options = this._mergeOptions(this.options, newOpts || {});
    if (this.options.width && !this.el.classList.contains('calendar-fluid')) {
      this.el.style.setProperty('--dx-cal-width', this.options.width);
    }
    return this.refresh();
  };

  DexterCalendar.prototype.destroy = function () {
    this._hidePopover();
    this.el.innerHTML = '';
    INSTANCE_MAP.delete(this.el);
  };

  DexterCalendar.setDefault = function (prop, value) {
    DEFAULT_OPTIONS[prop] = value;
  };

  DexterCalendar.setDefaults = function (obj) {
    if (obj && typeof obj === 'object') {
      Object.assign(DEFAULT_OPTIONS, obj);
    }
  };

  DexterCalendar.getInstance = function (el) {
    var node = typeof el === 'string' ? document.querySelector(el) : el;
    return node ? INSTANCE_MAP.get(node) || null : null;
  };

  DexterCalendar.getOrCreateInstance = function (el, opts) {
    var node = typeof el === 'string' ? document.querySelector(el) : el;
    if (!node) return null;
    return INSTANCE_MAP.get(node) || new DexterCalendar(node, opts);
  };

  DexterCalendar.initAll = function (root) {
    var els = (root || document).querySelectorAll('[data-dx-calendar], [data-bs-calendar], .dx-calendar:not([data-dx-manual])');
    els.forEach(function (el) {
      DexterCalendar.getOrCreateInstance(el);
    });
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { DexterCalendar.initAll(); });
    } else {
      DexterCalendar.initAll();
    }
  }

  return DexterCalendar;
});
