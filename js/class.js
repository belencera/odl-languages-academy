/**
 * CLASS.JS - Academia de Idiomas
 * Funcionalidad de la página de clase (tablón, materiales, videoclase)
 */

import { $, $$, addClass, removeClass, hasClass, toggleClass } from './utils.js';
import { protectRoute } from './auth.js';

/**
 * Inicializa la página de clase
 */
export const initClassPage = () => {
  // Proteger ruta
  if (!protectRoute()) return;
  
  // Inicializar tabs
  initTabs();
  
  // Inicializar anuncios
  initAnnouncements();
  
  // Inicializar materiales
  initMaterials();
};

/**
 * Inicializa el sistema de tabs
 */
const initTabs = () => {
  const tabItems = $$('.class-nav__item');
  const tabContents = $$('.tab-content');
  
  tabItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetTab = item.dataset.tab;
      if (!targetTab) return;
      
      // Actualizar navegación
      tabItems.forEach(tab => removeClass(tab, 'class-nav__item--active'));
      addClass(item, 'class-nav__item--active');
      
      // Mostrar contenido correspondiente
      tabContents.forEach(content => {
        removeClass(content, 'tab-content--active');
        if (content.id === `${targetTab}Tab`) {
          addClass(content, 'tab-content--active');
        }
      });
      
      // Actualizar URL hash
      window.history.pushState(null, null, `#${targetTab}`);
    });
  });
  
  // Activar tab según hash de URL
  const hash = window.location.hash.slice(1);
  if (hash) {
    const targetTab = $(`.class-nav__item[data-tab="${hash}"]`);
    if (targetTab) targetTab.click();
  }
};

/**
 * Inicializa la funcionalidad de anuncios
 */
const initAnnouncements = () => {
  const composer = $('.announcement-composer__input');
  
  if (composer) {
    composer.addEventListener('focus', () => {
      // Expandir composer al hacer focus
      // Aquí se podría abrir un modal para crear anuncios
      console.log('Abrir modal de nuevo anuncio');
    });
  }
  
  // Acciones de anuncios (like, comment)
  const announcementActions = $$('.announcement__action');
  
  announcementActions.forEach(action => {
    action.addEventListener('click', () => {
      // Toggle active state
      if (hasClass(action, 'announcement__action--active')) {
        removeClass(action, 'announcement__action--active');
      } else {
        addClass(action, 'announcement__action--active');
      }
    });
  });
};

/**
 * Inicializa la funcionalidad de materiales
 */
const initMaterials = () => {
  const materialCards = $$('.material-card');
  
  materialCards.forEach(card => {
    const viewBtn = card.querySelector('.material-card__btn');
    const downloadBtn = card.querySelectorAll('.material-card__btn')[1];
    
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        const title = card.querySelector('.material-card__title')?.textContent;
        showNotification(`Abriendo: ${title}`, 'info');
      });
    }
    
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const title = card.querySelector('.material-card__title')?.textContent;
        showNotification(`Descargando: ${title}`, 'success');
      });
    }
  });
};

/**
 * Muestra una notificación temporal
 * @param {string} message - Mensaje
 * @param {string} type - Tipo (success, error, info, warning)
 */
const showNotification = (message, type = 'info') => {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `alert alert--${type}`;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    max-width: 400px;
    animation: slideInRight 0.3s ease-out;
  `;
  notification.innerHTML = `
    <span>${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

/**
 * Inicializa la funcionalidad de miembros
 */
const initMembers = () => {
  const memberItems = $$('.member-item');
  
  memberItems.forEach(item => {
    item.addEventListener('click', () => {
      const name = item.querySelector('.member-item__name')?.textContent;
      showNotification(`Ver perfil de: ${name}`, 'info');
    });
  });
};

/**
 * Inicializa la funcionalidad de próximas clases
 */
const initUpcomingClasses = () => {
  const upcomingItems = $$('.upcoming-item');
  
  upcomingItems.forEach(item => {
    item.addEventListener('click', () => {
      const title = item.querySelector('.upcoming-item__title')?.textContent;
      showNotification(`Ver detalles: ${title}`, 'info');
    });
  });
};

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  initMembers();
  initUpcomingClasses();
});
