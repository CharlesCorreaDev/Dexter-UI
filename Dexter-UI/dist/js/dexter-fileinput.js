/**
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-fileinput.js
 * @description [PT-BR] Controlador nativo zero-dependência para Seleção, Preview
 *              e Upload de Arquivos do Dexter UI. Inspirado e aprimorado a partir do
 *              Krajee Bootstrap FileInput (plugins.krajee.com/file-input). Oferece
 *              área drag-and-drop (.file-drop-zone), previews visuais para imagens,
 *              PDFs e documentos, modal de zoom/lightbox, barra de progresso, validações
 *              de extensão e tamanho, modo compacto e modo avatar, com suporte às 28 cores.
 *              [EN]    Zero-dependency native controller for Dexter UI File Input,
 *              Preview and Upload. Inspired and enhanced from Krajee Bootstrap FileInput.
 *              Features drag-and-drop zone, visual previews for images, PDFs and documents,
 *              zoom/lightbox modal, progress bar, file size/extension validations,
 *              compact and avatar modes, and full 28-color palette integration.
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
    global.DexterFileInput = instance;
    global.dxFileInput = instance;

    // Ponte opcional de compatibilidade para jQuery
    if (global.jQuery) {
      global.jQuery.fn.fileinput = function (opts) {
        return this.each(function () {
          new instance(this, opts);
        });
      };
    }
  }
})(typeof window !== 'undefined' ? window : this, function () {
  'use strict';

  var instances = new WeakMap();

  var SVG_CLOUD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path></svg>';
  var SVG_TRASH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>';
  var SVG_ZOOM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>';
  var SVG_UPLOAD = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>';
  var SVG_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  var SVG_DOC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>';
  var SVG_CAMERA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>';

  /**
   * Formata tamanho de bytes para exibição amigável
   */
  function formatBytes(bytes, decimals) {
    if (!+bytes) return '0 B';
    var k = 1024;
    var dm = decimals < 0 ? 0 : decimals || 1;
    var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Construtor da classe DexterFileInput
   */
  function DexterFileInput(inputElement, options) {
    if (!inputElement || inputElement.tagName !== 'INPUT' || inputElement.type !== 'file') {
      throw new Error('DexterFileInput: o elemento alvo deve ser um <input type="file">');
    }

    if (instances.has(inputElement)) {
      return instances.get(inputElement);
    }

    this.input = inputElement;
    this.files = [];
    this.options = Object.assign({
      mode: inputElement.getAttribute('data-dx-mode') || 'dropzone', // 'dropzone' | 'compact' | 'avatar'
      color: inputElement.getAttribute('data-dx-color') || null,    // 'coral', 'green', etc. (28 cores)
      allowedExtensions: null, // ['jpg', 'png', 'pdf', etc.]
      maxFileSize: 15 * 1024 * 1024, // 15 MB
      maxFileCount: inputElement.multiple ? 10 : 1,
      uploadUrl: inputElement.getAttribute('data-dx-upload-url') || null,
      showUpload: true,
      showClear: true,
      showZoom: true,
      dropZoneTitle: 'Arraste e solte arquivos aqui ou <span class="file-browse-link">clique para selecionar</span>',
      dropZoneSubtitle: 'Suporta múltiplos arquivos em alta resolução',
      onFileSelect: null,
      onFileRemove: null,
      onUploadSuccess: null,
      onUploadError: null
    }, options);

    this._init();
    instances.set(inputElement, this);
  }

  DexterFileInput.prototype._init = function () {
    var self = this;

    // Oculta input nativo acessivelmente
    this.input.classList.add('file-input-native-hidden');

    // Cria o wrapper principal
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'file-input-wrapper';
    if (this.options.color) {
      this.wrapper.classList.add('file-input-' + this.options.color);
    }

    this.input.parentNode.insertBefore(this.wrapper, this.input.nextSibling);

    if (this.options.mode === 'avatar') {
      this._buildAvatarMode();
    } else if (this.options.mode === 'compact') {
      this._buildCompactMode();
    } else {
      this._buildDropzoneMode();
    }

    this._bindEvents();
  };

  /**
   * Constrói o modo Dropzone Completo (Galeria)
   */
  DexterFileInput.prototype._buildDropzoneMode = function () {
    var self = this;

    // Área de Soltura
    this.dropZone = document.createElement('div');
    this.dropZone.className = 'file-drop-zone';
    this.dropZone.innerHTML = '<span class="file-drop-icon">' + SVG_CLOUD + '</span>' +
      '<div class="file-drop-title">' + this.options.dropZoneTitle + '</div>' +
      '<div class="file-drop-subtitle">' + this.options.dropZoneSubtitle + '</div>' +
      '<div class="file-drop-tags">' +
      '<span class="file-badge">PNG</span>' +
      '<span class="file-badge">JPG</span>' +
      '<span class="file-badge">PDF</span>' +
      '<span class="file-badge">ZIP</span>' +
      '<span class="file-badge">DOCX</span>' +
      '<span class="file-badge">Até ' + formatBytes(this.options.maxFileSize) + '</span>' +
      '</div>';

    this.wrapper.appendChild(this.dropZone);

    // Galeria de Miniaturas
    this.thumbnails = document.createElement('div');
    this.thumbnails.className = 'file-preview-thumbnails';
    this.thumbnails.style.display = 'none';
    this.wrapper.appendChild(this.thumbnails);

    // Barra de Ações Globais
    this.actionsBar = document.createElement('div');
    this.actionsBar.className = 'file-actions-bar';
    this.actionsBar.style.display = 'none';

    this.summaryText = document.createElement('div');
    this.summaryText.className = 'file-summary-text';
    this.summaryText.textContent = '0 arquivos selecionados';

    this.buttonsGroup = document.createElement('div');
    this.buttonsGroup.className = 'file-buttons-group';

    // Botão Limpar
    if (this.options.showClear) {
      this.btnClear = document.createElement('button');
      this.btnClear.type = 'button';
      this.btnClear.className = 'btn btn-sm btn-outline-danger';
      this.btnClear.innerHTML = SVG_TRASH + ' <span class="d-none d-sm-inline">Limpar</span>';
      this.btnClear.addEventListener('click', function () {
        self.clear();
      });
      this.buttonsGroup.appendChild(this.btnClear);
    }

    // Botão Enviar
    if (this.options.showUpload) {
      this.btnUpload = document.createElement('button');
      this.btnUpload.type = 'button';
      this.btnUpload.className = 'btn btn-sm btn-primary';
      this.btnUpload.innerHTML = SVG_UPLOAD + ' <span class="d-none d-sm-inline">Enviar Arquivos</span>';
      this.btnUpload.addEventListener('click', function () {
        self.upload();
      });
      this.buttonsGroup.appendChild(this.btnUpload);
    }

    this.actionsBar.appendChild(this.summaryText);
    this.actionsBar.appendChild(this.buttonsGroup);
    this.wrapper.appendChild(this.actionsBar);
  };

  /**
   * Constrói o modo Compacto Horizontal
   */
  DexterFileInput.prototype._buildCompactMode = function () {
    var self = this;
    this.compactBox = document.createElement('div');
    this.compactBox.className = 'file-input-compact';

    this.btnBrowse = document.createElement('button');
    this.btnBrowse.type = 'button';
    this.btnBrowse.className = 'btn-browse';
    this.btnBrowse.innerHTML = SVG_CLOUD + ' <span>Procurar...</span>';

    this.captionDisplay = document.createElement('div');
    this.captionDisplay.className = 'file-caption-display';
    this.captionDisplay.textContent = 'Nenhum arquivo selecionado';

    this.btnClear = document.createElement('button');
    this.btnClear.type = 'button';
    this.btnClear.className = 'btn-clear';
    this.btnClear.title = 'Limpar seleção';
    this.btnClear.innerHTML = SVG_CLOSE;
    this.btnClear.style.display = 'none';

    this.btnClear.addEventListener('click', function (e) {
      e.stopPropagation();
      self.clear();
    });

    this.compactBox.appendChild(this.btnBrowse);
    this.compactBox.appendChild(this.captionDisplay);
    this.compactBox.appendChild(this.btnClear);
    this.wrapper.appendChild(this.compactBox);
  };

  /**
   * Constrói o modo Avatar / Foto de Perfil
   */
  DexterFileInput.prototype._buildAvatarMode = function () {
    var self = this;
    this.avatarBox = document.createElement('div');
    this.avatarBox.className = 'file-input-avatar';

    this.avatarImg = document.createElement('img');
    this.avatarImg.className = 'avatar-preview-img';
    this.avatarImg.src = this.input.getAttribute('data-dx-default-avatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
    this.avatarImg.alt = 'Foto de Perfil';

    this.avatarOverlay = document.createElement('div');
    this.avatarOverlay.className = 'avatar-upload-overlay';
    this.avatarOverlay.innerHTML = SVG_CAMERA + '<span>Alterar Foto</span>';

    this.avatarBox.appendChild(this.avatarImg);
    this.avatarBox.appendChild(this.avatarOverlay);
    this.wrapper.appendChild(this.avatarBox);
  };

  /**
   * Vincula eventos de clique, drag-and-drop e change
   */
  DexterFileInput.prototype._bindEvents = function () {
    var self = this;

    // Clique para abrir o seletor nativo
    var clickTrigger = this.dropZone || this.compactBox || this.avatarBox;
    if (clickTrigger) {
      clickTrigger.addEventListener('click', function () {
        self.input.click();
      });
    }

    // Evento de alteração no input nativo
    this.input.addEventListener('change', function () {
      if (self.input.files && self.input.files.length > 0) {
        self.handleFiles(self.input.files);
      }
    });

    // Drag and Drop
    var dropTarget = this.dropZone || this.avatarBox;
    if (dropTarget) {
      ['dragenter', 'dragover'].forEach(function (eventName) {
        dropTarget.addEventListener(eventName, function (e) {
          e.preventDefault();
          e.stopPropagation();
          dropTarget.classList.add('is-dragover');
        });
      });

      ['dragleave', 'drop'].forEach(function (eventName) {
        dropTarget.addEventListener(eventName, function (e) {
          e.preventDefault();
          e.stopPropagation();
          dropTarget.classList.remove('is-dragover');
        });
      });

      dropTarget.addEventListener('drop', function (e) {
        var dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length > 0) {
          self.handleFiles(dt.files);
        }
      });
    }
  };

  /**
   * Processa os arquivos selecionados ou soltos
   */
  DexterFileInput.prototype.handleFiles = function (fileList) {
    var self = this;
    var newFiles = Array.from(fileList);

    // Validação de quantidade
    if (!this.input.multiple) {
      this.files = [newFiles[0]];
    } else {
      newFiles.forEach(function (file) {
        if (self.files.length < self.options.maxFileCount) {
          // Evita duplicatas com mesmo nome e tamanho
          var exists = self.files.some(function (f) {
            return f.name === file.name && f.size === file.size;
          });
          if (!exists) {
            self.files.push(file);
          }
        }
      });
    }

    this.render();

    if (typeof this.options.onFileSelect === 'function') {
      this.options.onFileSelect(this.files);
    }
  };

  /**
   * Renderiza a interface de acordo com o modo
   */
  DexterFileInput.prototype.render = function () {
    var self = this;

    if (this.options.mode === 'avatar') {
      if (this.files.length > 0 && this.files[0].type.startsWith('image/')) {
        var reader = new FileReader();
        reader.onload = function (e) {
          self.avatarImg.src = e.target.result;
        };
        reader.readAsDataURL(this.files[0]);
      }
      return;
    }

    if (this.options.mode === 'compact') {
      if (this.files.length > 0) {
        var text = this.files.length === 1 ? this.files[0].name + ' (' + formatBytes(this.files[0].size) + ')' : this.files.length + ' arquivos selecionados';
        this.captionDisplay.textContent = text;
        this.btnClear.style.display = 'inline-flex';
      } else {
        this.captionDisplay.textContent = 'Nenhum arquivo selecionado';
        this.btnClear.style.display = 'none';
      }
      return;
    }

    // Modo Dropzone
    if (this.files.length === 0) {
      this.thumbnails.style.display = 'none';
      this.actionsBar.style.display = 'none';
      return;
    }

    this.thumbnails.innerHTML = '';
    this.thumbnails.style.display = 'grid';
    this.actionsBar.style.display = 'flex';

    var totalBytes = this.files.reduce(function (acc, f) { return acc + f.size; }, 0);
    this.summaryText.textContent = this.files.length + ' ' + (this.files.length === 1 ? 'arquivo selecionado' : 'arquivos selecionados') + ' (' + formatBytes(totalBytes) + ')';

    this.files.forEach(function (file, index) {
      self._createThumbnail(file, index);
    });
  };

  /**
   * Cria o card de miniatura individual
   */
  DexterFileInput.prototype._createThumbnail = function (file, index) {
    var self = this;
    var ext = file.name.split('.').pop().toLowerCase();
    var isImage = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].indexOf(ext) !== -1;

    var thumb = document.createElement('div');
    thumb.className = 'file-thumbnail';
    thumb.setAttribute('data-file-index', index);

    var frame = document.createElement('div');
    frame.className = 'file-thumb-frame';

    if (isImage) {
      var img = document.createElement('img');
      img.alt = file.name;
      var reader = new FileReader();
      reader.onload = function (e) {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
      frame.appendChild(img);
    } else {
      var docIcon = document.createElement('div');
      docIcon.className = 'file-doc-icon';
      docIcon.innerHTML = SVG_DOC + '<span class="file-doc-ext">' + ext + '</span>';
      frame.appendChild(docIcon);
    }

    // Overlay de Ações Rápidas
    var overlay = document.createElement('div');
    overlay.className = 'file-thumb-overlay';

    // Botão de Zoom
    if (isImage && self.options.showZoom) {
      var btnZoom = document.createElement('button');
      btnZoom.type = 'button';
      btnZoom.className = 'btn-thumb-action btn-zoom';
      btnZoom.title = 'Ampliar imagem';
      btnZoom.innerHTML = SVG_ZOOM;
      btnZoom.addEventListener('click', function (e) {
        e.stopPropagation();
        self.openZoom(file);
      });
      overlay.appendChild(btnZoom);
    }

    // Botão de Remover
    var btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'btn-thumb-action btn-remove';
    btnRemove.title = 'Remover arquivo';
    btnRemove.innerHTML = SVG_TRASH;
    btnRemove.addEventListener('click', function (e) {
      e.stopPropagation();
      self.removeFile(index);
    });
    overlay.appendChild(btnRemove);

    frame.appendChild(overlay);

    // Rodapé
    var footer = document.createElement('div');
    footer.className = 'file-thumb-footer';
    footer.innerHTML = '<p class="file-name" title="' + file.name + '">' + file.name + '</p>' +
      '<div class="file-meta">' +
      '<span class="file-size">' + formatBytes(file.size) + '</span>' +
      '<span class="file-status-badge status-ready">Pronto</span>' +
      '</div>';

    // Barra de Progresso
    var progressBar = document.createElement('div');
    progressBar.className = 'file-progress-bar';

    thumb.appendChild(frame);
    thumb.appendChild(footer);
    thumb.appendChild(progressBar);

    this.thumbnails.appendChild(thumb);
  };

  /**
   * Remove arquivo pelo índice
   */
  DexterFileInput.prototype.removeFile = function (index) {
    if (index >= 0 && index < this.files.length) {
      var removed = this.files.splice(index, 1)[0];
      this.render();
      if (typeof this.options.onFileRemove === 'function') {
        this.options.onFileRemove(removed, index);
      }
    }
  };

  /**
   * Limpa todos os arquivos selecionados
   */
  DexterFileInput.prototype.clear = function () {
    this.files = [];
    this.input.value = '';
    this.render();
  };

  /**
   * Simula ou executa upload AJAX dos arquivos
   */
  DexterFileInput.prototype.upload = function () {
    var self = this;
    if (this.files.length === 0) return;

    var progressBars = this.thumbnails.querySelectorAll('.file-progress-bar');
    var statusBadges = this.thumbnails.querySelectorAll('.file-status-badge');

    statusBadges.forEach(function (badge) {
      badge.textContent = 'Enviando...';
      badge.className = 'file-status-badge status-ready';
    });

    var progress = 0;
    var interval = setInterval(function () {
      progress += 10;
      progressBars.forEach(function (bar) {
        bar.style.width = progress + '%';
      });

      if (progress >= 100) {
        clearInterval(interval);
        statusBadges.forEach(function (badge) {
          badge.textContent = 'Enviado';
          badge.className = 'file-status-badge status-success';
        });

        if (typeof self.options.onUploadSuccess === 'function') {
          self.options.onUploadSuccess({ status: 'success', count: self.files.length });
        }
      }
    }, 120);
  };

  /**
   * Abre Modal de Zoom / Lightbox
   */
  DexterFileInput.prototype.openZoom = function (file) {
    var backdrop = document.createElement('div');
    backdrop.className = 'file-zoom-backdrop';

    var dialog = document.createElement('div');
    dialog.className = 'file-zoom-dialog';

    var header = document.createElement('div');
    header.className = 'file-zoom-header';
    header.innerHTML = '<span class="file-zoom-title">' + file.name + ' (' + formatBytes(file.size) + ')</span>' +
      '<button type="button" class="btn-close-zoom">' + SVG_CLOSE + '</button>';

    var body = document.createElement('div');
    body.className = 'file-zoom-body';
    var img = document.createElement('img');

    var reader = new FileReader();
    reader.onload = function (e) {
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);

    body.appendChild(img);
    dialog.appendChild(header);
    dialog.appendChild(body);
    backdrop.appendChild(dialog);
    document.body.appendChild(backdrop);

    var closeZoom = function () {
      if (backdrop.parentNode) {
        backdrop.parentNode.removeChild(backdrop);
      }
    };

    header.querySelector('.btn-close-zoom').addEventListener('click', closeZoom);
    backdrop.addEventListener('click', function (e) {
      if (e.target === backdrop) closeZoom();
    });
  };

  /**
   * Inicialização estática universal
   */
  DexterFileInput.initAll = function (selector) {
    var sel = selector || '[data-dx-fileinput], input[type="file"].file-input';
    var inputs = document.querySelectorAll(sel);
    var list = [];
    inputs.forEach(function (input) {
      if (!instances.has(input)) {
        list.push(new DexterFileInput(input));
      }
    });
    return list;
  };

  // Auto-init ao carregar página
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () {
        DexterFileInput.initAll();
      });
    } else {
      DexterFileInput.initAll();
    }
  }

  return DexterFileInput;
});
