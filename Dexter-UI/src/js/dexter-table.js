/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-table.js
 * @description [PT-BR] Controlador nativo de Data Tables e Suíte Bootstrap Table para Dexter UI:
 *                      ordenação client-side, busca ao vivo, paginação, seleção por checkbox,
 *                      linhas expansíveis (detail view), visualização em cartões (card view),
 *                      exportação para CSV e impressão, com zero dependências externas.
 *              [EN]    Native Data Table and Bootstrap Table Suite Controller for Dexter UI:
 *                      client-side sorting, live search, pagination, checkbox selection,
 *                      expandable detail view, card view, CSV export and print, zero external dependencies.
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
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    global.DexterTable = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  /**
   * Classe principal do DexterTable
   */
  class DexterTable {
    /**
     * @param {HTMLElement|string} element - Elemento ou seletor da tabela/wrapper
     * @param {Object} options - Opções de configuração
     */
    constructor(element, options = {}) {
      this.el = typeof element === 'string' ? document.querySelector(element) : element;
      if (!this.el) return;

      // Se o elemento for a <table> pura, identificamos ou criamos o wrapper .bootstrap-table
      this.table = this.el.tagName === 'TABLE' ? this.el : this.el.querySelector('table');
      this.wrapper = this.el.classList.contains('bootstrap-table')
        ? this.el
        : this.table.closest('.bootstrap-table');

      // Configurações padrão
      this.options = Object.assign({
        search: this._getBoolAttr('data-search', false),
        pagination: this._getBoolAttr('data-pagination', false),
        pageSize: parseInt(this.table.getAttribute('data-page-size') || 10, 10),
        pageList: [5, 10, 25, 50, 100],
        sortable: this._getBoolAttr('data-sortable', true),
        checkbox: this._getBoolAttr('data-checkbox', false),
        detailView: this._getBoolAttr('data-detail-view', false),
        cardView: this._getBoolAttr('data-card-view', false),
        showExport: this._getBoolAttr('data-show-export', false),
        showRefresh: this._getBoolAttr('data-show-refresh', false),
        showToggle: this._getBoolAttr('data-show-toggle', false),
        showColumns: this._getBoolAttr('data-show-columns', false),
        loadingText: 'Carregando dados...',
        formatShowingRows: (from, to, total) => `Exibindo ${from} a ${to} de ${total} registros`,
        formatRecordsPerPage: (size) => `${size} registros por página`,
        formatSearch: () => 'Buscar registros...'
      }, options);

      this.currentPage = 1;
      this.currentSort = { column: null, order: 'none' };
      this.searchQuery = '';
      this.allRows = [];
      this.filteredRows = [];

      this._init();
    }

    /**
     * Helper para ler atributos booleanos
     */
    _getBoolAttr(attr, fallback) {
      if (!this.table) return fallback;
      const val = this.table.getAttribute(attr);
      if (val === null) return fallback;
      return val === 'true' || val === '';
    }

    /**
     * Inicialização dos componentes e eventos
     */
    _init() {
      // Coletamos as linhas de dados originais
      const tbody = this.table.querySelector('tbody');
      if (!tbody) return;

      const rawRows = Array.from(tbody.querySelectorAll('tr:not(.detail-view)'));
      this.allRows = rawRows.map((tr, idx) => {
        const rowData = {
          element: tr,
          index: idx,
          detailViewElement: null,
          cells: Array.from(tr.children).map(td => td.textContent.trim())
        };

        // Verifica se há detail-view associada
        const next = tr.nextElementSibling;
        if (next && next.classList.contains('detail-view')) {
          rowData.detailViewElement = next;
        }

        return rowData;
      });

      this.filteredRows = [...this.allRows];

      // Inicializa cabeçalhos sortable
      this._initSortableHeaders();

      // Inicializa seleção por checkboxes
      this._initCheckboxes();

      // Inicializa detail view
      this._initDetailView();

      // Inicializa Card View se ativo
      if (this.options.cardView && this.wrapper) {
        this.wrapper.classList.add('card-view');
      }

      // Conecta Toolbar de busca e botões
      this._initToolbar();

      // Renderiza Paginação inicial
      this._renderPagination();

      // Renderiza primeira visualização
      this._render();
    }

    /**
     * Cabeçalhos ordenáveis
     */
    _initSortableHeaders() {
      const thead = this.table.querySelector('thead');
      if (!thead) return;

      const ths = thead.querySelectorAll('th');
      ths.forEach((th, colIdx) => {
        // Se a coluna for checkbox ou detail view, pula
        if (th.classList.contains('bs-checkbox') || th.classList.contains('detail-view-th')) return;

        const isSortable = th.getAttribute('data-sortable') !== 'false' && this.options.sortable;
        if (isSortable) {
          th.classList.add('sortable');
          if (!th.querySelector('.th-inner')) {
            const inner = document.createElement('div');
            inner.className = 'th-inner sortable';
            inner.innerHTML = th.innerHTML;
            th.innerHTML = '';
            th.appendChild(inner);
          }

          th.addEventListener('click', () => {
            this._toggleSort(colIdx, th);
          });
        }
      });
    }

    /**
     * Alternância de ordenação de coluna (Asc / Desc / None)
     */
    _toggleSort(colIdx, th) {
      let newOrder = 'asc';
      if (this.currentSort.column === colIdx) {
        if (this.currentSort.order === 'asc') newOrder = 'desc';
        else if (this.currentSort.order === 'desc') newOrder = 'none';
        else newOrder = 'asc';
      }

      // Limpa classes em todos os cabeçalhos
      this.table.querySelectorAll('thead th').forEach(h => {
        h.classList.remove('asc', 'desc');
        const inner = h.querySelector('.th-inner');
        if (inner) inner.classList.remove('asc', 'desc');
      });

      this.currentSort = { column: newOrder === 'none' ? null : colIdx, order: newOrder };

      if (newOrder !== 'none') {
        th.classList.add(newOrder);
        const inner = th.querySelector('.th-inner');
        if (inner) inner.classList.add(newOrder);
      }

      this._sortRows();
      this.currentPage = 1;
      this._render();
    }

    /**
     * Ordenação real das linhas
     */
    _sortRows() {
      const { column, order } = this.currentSort;
      if (column === null || order === 'none') {
        // Restaura ordem natural
        this.filteredRows.sort((a, b) => a.index - b.index);
        return;
      }

      this.filteredRows.sort((a, b) => {
        const valA = a.cells[column] || '';
        const valB = b.cells[column] || '';

        // Detecção de número ou moeda
        const numA = parseFloat(valA.replace(/[^\d.-]/g, ''));
        const numB = parseFloat(valB.replace(/[^\d.-]/g, ''));

        if (!isNaN(numA) && !isNaN(numB)) {
          return order === 'asc' ? numA - numB : numB - numA;
        }

        // Comparação de string local com acentuação pt-BR
        return order === 'asc'
          ? valA.localeCompare(valB, 'pt-BR')
          : valB.localeCompare(valA, 'pt-BR');
      });
    }

    /**
     * Checkboxes de seleção de linhas
     */
    _initCheckboxes() {
      const headerCb = this.table.querySelector('thead th.bs-checkbox input[type="checkbox"]');
      if (headerCb) {
        headerCb.addEventListener('change', () => {
          const checked = headerCb.checked;
          this.filteredRows.forEach(row => {
            const rowCb = row.element.querySelector('td.bs-checkbox input[type="checkbox"]');
            if (rowCb) {
              rowCb.checked = checked;
              if (checked) {
                row.element.classList.add('selected', 'table-active');
              } else {
                row.element.classList.remove('selected', 'table-active');
              }
            }
          });
          this._dispatch('check-all.dx.table', { checked, rows: this.getSelectedRows() });
        });
      }

      this.allRows.forEach(row => {
        const rowCb = row.element.querySelector('td.bs-checkbox input[type="checkbox"]');
        if (rowCb) {
          rowCb.addEventListener('change', () => {
            if (rowCb.checked) {
              row.element.classList.add('selected', 'table-active');
            } else {
              row.element.classList.remove('selected', 'table-active');
            }
            this._dispatch('check.dx.table', { row: row.element, checked: rowCb.checked });
          });
        }
      });
    }

    /**
     * Retorna elementos das linhas selecionadas
     */
    getSelectedRows() {
      return this.allRows.filter(r => {
        const cb = r.element.querySelector('td.bs-checkbox input[type="checkbox"]');
        return cb && cb.checked;
      }).map(r => r.element);
    }

    /**
     * Inicializa linhas expansíveis (Detail View)
     */
    _initDetailView() {
      if (!this.options.detailView) return;

      this.allRows.forEach(row => {
        const icon = row.element.querySelector('.detail-icon');
        if (icon && row.detailViewElement) {
          icon.addEventListener('click', (e) => {
            e.preventDefault();
            const isOpen = row.detailViewElement.style.display !== 'none';
            if (isOpen) {
              row.detailViewElement.style.display = 'none';
              icon.classList.remove('detail-expanded');
            } else {
              row.detailViewElement.style.display = 'table-row';
              icon.classList.add('detail-expanded');
            }
          });
        }
      });
    }

    /**
     * Toolbar de pesquisa, botões e controles
     */
    _initToolbar() {
      if (!this.wrapper) return;

      // Campo de busca
      const searchInput = this.wrapper.querySelector('.fixed-table-toolbar .search input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          this.searchQuery = e.target.value.toLowerCase().trim();
          this._filterRows();
          this.currentPage = 1;
          this._render();
        });

        const clearBtn = this.wrapper.querySelector('.fixed-table-toolbar .search .search-clear');
        if (clearBtn) {
          clearBtn.addEventListener('click', () => {
            searchInput.value = '';
            this.searchQuery = '';
            this._filterRows();
            this.currentPage = 1;
            this._render();
          });
        }
      }

      // Botão Toggle Card View
      const toggleViewBtn = this.wrapper.querySelector('[data-dx-action="toggle-view"]');
      if (toggleViewBtn) {
        toggleViewBtn.addEventListener('click', () => {
          this.wrapper.classList.toggle('card-view');
        });
      }

      // Botão Exportar CSV
      const exportCsvBtn = this.wrapper.querySelector('[data-dx-action="export-csv"]');
      if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
          this.exportCSV();
        });
      }

      // Botão Imprimir
      const printBtn = this.wrapper.querySelector('[data-dx-action="print"]');
      if (printBtn) {
        printBtn.addEventListener('click', () => {
          window.print();
        });
      }
    }

    /**
     * Filtro de busca textual
     */
    _filterRows() {
      if (!this.searchQuery) {
        this.filteredRows = [...this.allRows];
      } else {
        this.filteredRows = this.allRows.filter(row => {
          return row.cells.some(cellText => cellText.toLowerCase().includes(this.searchQuery));
        });
      }

      if (this.currentSort.column !== null) {
        this._sortRows();
      }
    }

    /**
     * Renderiza a paginação e controles inferiores
     */
    _renderPagination() {
      if (!this.wrapper || !this.options.pagination) return;

      let paginationWrapper = this.wrapper.querySelector('.fixed-table-pagination');
      if (!paginationWrapper) {
        paginationWrapper = document.createElement('div');
        paginationWrapper.className = 'fixed-table-pagination';
        this.wrapper.appendChild(paginationWrapper);
      }

      const totalRows = this.filteredRows.length;
      const totalPages = Math.max(1, Math.ceil(totalRows / this.options.pageSize));
      const from = totalRows === 0 ? 0 : (this.currentPage - 1) * this.options.pageSize + 1;
      const to = Math.min(this.currentPage * this.options.pageSize, totalRows);

      paginationWrapper.innerHTML = `
        <div class="pagination-detail">
          <span class="pagination-info">${this.options.formatShowingRows(from, to, totalRows)}</span>
          <span class="page-list">
            <select class="form-select form-select-sm page-size-select" data-dx-native="true" aria-label="Quantidade de linhas por página" style="min-width: 4.75rem; height: 2rem; appearance: none; -webkit-appearance: none; -moz-appearance: none; vertical-align: middle;">
              ${this.options.pageList.map(sz => `<option value="${sz}" ${sz === this.options.pageSize ? 'selected' : ''}>${sz}</option>`).join('')}
            </select>
            <span>linhas</span>
          </span>
        </div>
        <div class="pagination-container">
          <ul class="pagination">
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
              <a class="page-link" href="#" data-page="${this.currentPage - 1}" aria-label="Anterior">&lsaquo;</a>
            </li>
            ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
              <li class="page-item ${p === this.currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${p}">${p}</a>
              </li>
            `).join('')}
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
              <a class="page-link" href="#" data-page="${this.currentPage + 1}" aria-label="Próximo">&rsaquo;</a>
            </li>
          </ul>
        </div>
      `;

      // Evento de troca de quantidade por página
      const sizeSelect = paginationWrapper.querySelector('.page-size-select');
      if (sizeSelect) {
        sizeSelect.addEventListener('change', (e) => {
          this.options.pageSize = parseInt(e.target.value, 10);
          this.currentPage = 1;
          this._render();
        });
      }

      // Eventos de clique nas páginas
      paginationWrapper.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetPage = parseInt(link.getAttribute('data-page'), 10);
          if (targetPage >= 1 && targetPage <= totalPages && targetPage !== this.currentPage) {
            this.currentPage = targetPage;
            this._render();
          }
        });
      });
    }

    /**
     * Renderiza o estado atual das linhas no DOM
     */
    _render() {
      const tbody = this.table.querySelector('tbody');
      if (!tbody) return;

      const totalRows = this.filteredRows.length;
      const start = this.options.pagination ? (this.currentPage - 1) * this.options.pageSize : 0;
      const end = this.options.pagination ? start + this.options.pageSize : totalRows;

      // Oculta todas as linhas
      this.allRows.forEach(row => {
        row.element.style.display = 'none';
        if (row.detailViewElement) row.detailViewElement.style.display = 'none';
      });

      // Exibe apenas as linhas da página / filtro atual
      const visibleRows = this.filteredRows.slice(start, end);

      if (visibleRows.length === 0) {
        let noRecordRow = tbody.querySelector('.no-records-found');
        if (!noRecordRow) {
          noRecordRow = document.createElement('tr');
          noRecordRow.className = 'no-records-found text-center';
          const colCount = this.table.querySelectorAll('thead th').length || 1;
          noRecordRow.innerHTML = `<td colspan="${colCount}" class="py-4 text-muted">Nenhum registro encontrado.</td>`;
          tbody.appendChild(noRecordRow);
        }
        noRecordRow.style.display = 'table-row';
      } else {
        const noRecordRow = tbody.querySelector('.no-records-found');
        if (noRecordRow) noRecordRow.style.display = 'none';

        visibleRows.forEach(row => {
          row.element.style.display = '';
          tbody.appendChild(row.element); // Mantém ordem correta no DOM
          if (row.detailViewElement) {
            tbody.appendChild(row.detailViewElement);
          }
        });
      }

      // Atualiza paginação
      this._renderPagination();
    }

    /**
     * Exibe o overlay de carregamento
     */
    showLoading() {
      if (!this.wrapper) return;
      let loading = this.wrapper.querySelector('.fixed-table-loading');
      if (!loading) {
        loading = document.createElement('div');
        loading.className = 'fixed-table-loading';
        loading.innerHTML = `
          <span class="loader loader-ring loader-primary loader-md"></span>
          <div class="loading-text">${this.options.loadingText}</div>
        `;
        const container = this.wrapper.querySelector('.fixed-table-container') || this.wrapper;
        container.appendChild(loading);
      }
      loading.classList.add('open');
    }

    /**
     * Oculta o overlay de carregamento
     */
    hideLoading() {
      if (!this.wrapper) return;
      const loading = this.wrapper.querySelector('.fixed-table-loading');
      if (loading) loading.classList.remove('open');
    }

    /**
     * Exporta dados da tabela para arquivo CSV
     */
    exportCSV(filename = 'tabela-dexter.csv') {
      const headers = Array.from(this.table.querySelectorAll('thead th:not(.bs-checkbox):not(.detail-view-th)'))
        .map(th => `"${th.textContent.trim().replace(/"/g, '""')}"`);

      const rows = this.filteredRows.map(r => {
        return Array.from(r.element.querySelectorAll('td:not(.bs-checkbox):not(.detail-view-td)'))
          .map(td => `"${td.textContent.trim().replace(/"/g, '""')}"`)
          .join(';');
      });

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    /**
     * Dispara eventos customizados
     */
    _dispatch(eventName, detail) {
      const event = new CustomEvent(eventName, { detail, bubbles: true });
      this.table.dispatchEvent(event);
    }
  }

  // Inicialização automática para elementos com data-toggle="table" ou data-dx-table="true"
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('table[data-toggle="table"], table[data-dx-table="true"], .bootstrap-table').forEach(el => {
        if (!el._dxTableInitialized) {
          el._dxTable = new DexterTable(el);
          el._dxTableInitialized = true;
        }
      });
    });
  }

  return DexterTable;
});
