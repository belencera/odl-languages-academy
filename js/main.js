/**
 * MAIN.JS - Academia de Idiomas
 * Punto de entrada principal de la aplicación
 */

import { initNavbar } from './navbar.js';
import { initAuth } from './auth.js';
import { initDashboard } from './dashboard.js';
import { initClassPage } from './class.js';
import { $, getStorage, smoothScroll } from './utils.js';

/**
 * Inicializa la aplicación
 */
const initApp = () => {
  // Inicializar navbar en todas las páginas
  initNavbar();
  
  // Inicializar funcionalidad específica según la página
  initPageSpecific();
  
  // Inicializar utilidades globales
  initGlobalUtils();
};

/**
 * Inicializa funcionalidad específica según la página actual
 */
const initPageSpecific = () => {
  const path = window.location.pathname;
  const page = path.split('/').pop() || 'index.html';
  
  switch (page) {
    case 'index.html':
    case '':
      initLandingPage();
      break;
      
    case 'login.html':
    case 'register.html':
      initAuth();
      break;
      
    case 'dashboard.html':
      initDashboard();
      break;
      
    case 'class.html':
      initClassPage();
      break;
  }
};

/**
 * Inicializa funcionalidades de la landing page
 */
const initLandingPage = () => {
  // Smooth scroll para enlaces de ancla
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href.startsWith('#')) {
        e.preventDefault();
        smoothScroll(href);
      }
    });
  });
  
  // Formulario de contacto
  const contactForm = $('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Mostrar mensaje de éxito (simulado)
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      
      btn.textContent = '¡Mensaje enviado!';
      btn.disabled = true;
      btn.classList.add('btn--success');
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.classList.remove('btn--success');
        contactForm.reset();
      }, 3000);
    });
  }
  
  // Animación de entrada para elementos
  initScrollAnimations();
};

/**
 * Inicializa animaciones al hacer scroll
 */
const initScrollAnimations = () => {
  const animatedElements = document.querySelectorAll('.course-card, .advantage-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });
  
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(el);
  });
};

/**
 * Inicializa utilidades globales
 */
const initGlobalUtils = () => {
  // Cerrar menús al hacer click fuera
  document.addEventListener('click', (e) => {
    const navbar = $('#navbar');
    const mobileMenu = $('#mobileMenu');
    const toggle = $('#navbarToggle');
    
    if (navbar && mobileMenu && toggle) {
      const isClickInside = navbar.contains(e.target);
      if (!isClickInside && mobileMenu.classList.contains('navbar__mobile-menu--open')) {
        toggle.classList.remove('navbar__toggle--active');
        mobileMenu.classList.remove('navbar__mobile-menu--open');
        document.body.style.overflow = '';
      }
    }
  });
  
  // Manejar errores de imágenes
  document.addEventListener('error', (e) => {
    if (e.target.tagName === 'IMG') {
      e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23f3f4f6" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
    }
  }, true);
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Exportar funciones globales para uso en HTML inline
window.LinguaPro = {
  getStorage,
  smoothScroll
};
