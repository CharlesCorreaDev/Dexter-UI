/*!
 * =============================================================================
 * Dexter UI Framework
 * =============================================================================
 *
 * @file        dexter-dropdown.js
 * @description [PT-BR] Controlador nativo zero-dependência para Menus Suspensos
 *              Multiníveis (Multi-Level Dropdowns). Baseado e aprimorado a partir
 *              de dallaslu/bootstrap-5-multi-level-dropdown, com suporte a aninhamento
 *              infinito, submenus laterais (.dropend / .dropstart), abertura por clique
 *              ou hover suave (.dropdown-hover), fechamento inteligente e compatibilidade.
 *              [EN]    Zero-dependency native controller for Multi-Level Dropdowns.
 *              Based on and enhanced from dallaslu/bootstrap-5-multi-level-dropdown,
 *              supporting infinite nesting, lateral submenus (.dropend / .dropstart),
 *              click or smooth hover triggers (.dropdown-hover), smart dismiss and compatibility.
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

  var initialized = false;
  var ROOT_TOGGLE_SELECTOR =
    '.dropdown > .dropdown-toggle, .dropup > .dropdown-toggle, .dropend > .dropdown-toggle, .dropstart > .dropdown-toggle, ' +
    '.dropdown > [data-bs-toggle="dropdown"], .dropdown > [data-dx-toggle="dropdown"], ' +
    '.dropup > [data-bs-toggle="dropdown"], .dropup > [data-dx-toggle="dropdown"], ' +
    '.dropend > [data-bs-toggle="dropdown"], .dropend > [data-dx-toggle="dropdown"], ' +
    '.dropstart > [data-bs-toggle="dropdown"], .dropstart > [data-dx-toggle="dropdown"]';

  /**
   * Verifica se o Bootstrap Dropdown JS real está carregado (evita falso positivo
   * quando global.bootstrap contém apenas Modal ou Collapse do Dexter UI).
   */
  function hasNativeBootstrapDropdown() {
    return Boolean(global.bootstrap && typeof global.bootstrap.Dropdown === 'function');
  }

  /**
   * Atualiza aria-expanded do gatilho associado a um menu
   */
  function setMenuToggleExpanded(menu, expanded) {
    if (!menu || !menu.parentElement) return;
    var toggle = menu.parentElement.querySelector(
      ':scope > .dropdown-toggle, :scope > [data-bs-toggle="dropdown"], :scope > [data-dx-toggle="dropdown"]'
    );
    if (toggle) {
      toggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    }
  }

  /**
   * Fecha apenas os submenus aninhados (.dropdown-menu .dropdown-menu.show)
   */
  function closeAllSubmenus(container) {
    var root = container || document;
    var openMenus = root.querySelectorAll('.dropdown-menu .dropdown-menu.show');
    Array.prototype.forEach.call(openMenus, function (menu) {
      menu.classList.remove('show');
      setMenuToggleExpanded(menu, false);
    });
  }

  /**
   * Fecha todos os menus suspensos (raiz e submenus) no container ou documento
   */
  function closeAllDropdowns(container) {
    var root = container || document;
    var openMenus = root.querySelectorAll('.dropdown-menu.show');
    Array.prototype.forEach.call(openMenus, function (menu) {
      menu.classList.remove('show');
      setMenuToggleExpanded(menu, false);
    });
  }

  /**
   * Fecha submenus irmãos de um mesmo nível
   */
  function closeSiblingSubmenus(currentMenu) {
    if (!currentMenu || !currentMenu.parentElement) return;
    var parentList = currentMenu.parentElement.parentElement;
    if (!parentList) return;

    var siblingMenus = parentList.querySelectorAll(
      ':scope > li > .dropdown > .dropdown-menu.show, ' +
      ':scope > li > .dropdown-menu.show, ' +
      ':scope > .dropend > .dropdown-menu.show, ' +
      ':scope > .dropstart > .dropdown-menu.show'
    );
    Array.prototype.forEach.call(siblingMenus, function (menu) {
      if (menu !== currentMenu) {
        menu.classList.remove('show');
        setMenuToggleExpanded(menu, false);
        closeAllSubmenus(menu);
      }
    });
  }

  /**
   * Alterna a visibilidade de um submenu
   */
  function toggleSubmenu(toggleBtn, forceOpen) {
    var parent = toggleBtn.closest('.dropend, .dropstart, .dropdown, .dropdown-submenu');
    if (!parent) return;

    var submenu = parent.querySelector(':scope > .dropdown-menu');
    if (!submenu) return;

    var isOpen = typeof forceOpen === 'boolean' ? forceOpen : !submenu.classList.contains('show');

    if (isOpen) {
      closeSiblingSubmenus(submenu);
      submenu.classList.add('show');
      toggleBtn.setAttribute('aria-expanded', 'true');
    } else {
      submenu.classList.remove('show');
      toggleBtn.setAttribute('aria-expanded', 'false');
      closeAllSubmenus(submenu);
    }
  }

  /**
   * Vincula gatilhos de hover (.dropdown-hover) de forma idempotente
   */
  function bindHoverDropdowns(containerRoot) {
    var hoverDropdowns = (containerRoot || document).querySelectorAll('.dropdown-hover');
    Array.prototype.forEach.call(hoverDropdowns, function (container) {
      if (container.getAttribute('data-dx-hover-bound') === 'true') return;
      container.setAttribute('data-dx-hover-bound', 'true');

      var timeoutId = null;

      container.addEventListener('mouseenter', function () {
        clearTimeout(timeoutId);
        var menu = container.querySelector(':scope > .dropdown-menu');
        if (menu) {
          menu.classList.add('show');
          setMenuToggleExpanded(menu, true);
        }
      });

      container.addEventListener('mouseleave', function () {
        timeoutId = setTimeout(function () {
          var menu = container.querySelector(':scope > .dropdown-menu');
          if (menu) {
            menu.classList.remove('show');
            closeAllSubmenus(menu);
            setMenuToggleExpanded(menu, false);
          }
        }, 180);
      });
    });
  }

  /**
   * Inicializa ouvintes de eventos para dropdowns multiníveis
   */
  function initMultiLevelDropdowns() {
    bindHoverDropdowns(document);

    if (initialized) return;
    initialized = true;

    // 1. Tratamento de cliques nos menus e submenus aninhados
    document.addEventListener('click', function (e) {
      var toggle = e.target.closest('.dropdown-menu .dropdown-toggle');

      if (toggle) {
        e.preventDefault();
        e.stopPropagation();

        var parent = toggle.closest('.dropend, .dropstart, .dropdown, .dropdown-submenu');
        if (!parent) return;

        var submenu = parent.querySelector(':scope > .dropdown-menu');
        if (submenu) {
          toggleSubmenu(toggle);
        }
        return;
      }

      // Se for o botão principal de abertura do dropdown (nível 1)
      var rootToggle = e.target.closest(ROOT_TOGGLE_SELECTOR);
      if (rootToggle && !rootToggle.closest('.dropdown-menu')) {
        var rootContainer = rootToggle.closest('.dropdown, .dropup, .dropend, .dropstart');
        var rootMenu = rootContainer ? rootContainer.querySelector(':scope > .dropdown-menu') : null;

        if (rootMenu) {
          if (!hasNativeBootstrapDropdown()) {
            e.preventDefault();
            var isRootOpen = rootMenu.classList.contains('show');

            // Fecha todos os outros dropdowns raiz abertos
            var allRootMenus = document.querySelectorAll(
              '.dropdown > .dropdown-menu.show, .dropup > .dropdown-menu.show, .dropend > .dropdown-menu.show, .dropstart > .dropdown-menu.show'
            );
            Array.prototype.forEach.call(allRootMenus, function (m) {
              if (m !== rootMenu && !m.contains(rootMenu)) {
                m.classList.remove('show');
                setMenuToggleExpanded(m, false);
                closeAllSubmenus(m);
              }
            });

            if (!isRootOpen) {
              rootMenu.classList.add('show');
              rootToggle.setAttribute('aria-expanded', 'true');
            } else {
              rootMenu.classList.remove('show');
              rootToggle.setAttribute('aria-expanded', 'false');
              closeAllSubmenus(rootMenu);
            }
          }
        }
        return;
      }

      // Se clicou em um link terminal (.dropdown-item sem submenu), fecha todos os menus
      var terminalItem = e.target.closest('.dropdown-menu .dropdown-item:not(.dropdown-toggle)');
      if (terminalItem) {
        closeAllDropdowns();
        return;
      }

      // Se clicou fora de qualquer dropdown, fecha tudo
      if (!e.target.closest('.dropdown, .dropup, .dropend, .dropstart')) {
        if (hasNativeBootstrapDropdown()) {
          closeAllSubmenus();
        } else {
          closeAllDropdowns();
        }
      }
    });

    // 2. Fechar com a tecla Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (hasNativeBootstrapDropdown()) {
          closeAllSubmenus();
        } else {
          closeAllDropdowns();
        }
      }
    });
  }

  // API Pública
  var DexterDropdown = {
    init: initMultiLevelDropdowns,
    closeAll: closeAllDropdowns,
    closeAllDropdowns: closeAllDropdowns,
    closeSubmenus: closeAllSubmenus,
    toggle: toggleSubmenu
  };

  // Auto-inicialização quando o DOM estiver pronto
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initMultiLevelDropdowns);
    } else {
      initMultiLevelDropdowns();
    }
  }

  // Exportação UMD / Global
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = DexterDropdown;
  } else {
    global.DexterDropdown = DexterDropdown;
  }

})(typeof window !== 'undefined' ? window : this);
