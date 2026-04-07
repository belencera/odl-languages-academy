/**
 * NAVBAR.JS - Academia de Idiomas
 * Funcionalidad del navbar responsive
 */

import { $, addClass, removeClass, hasClass, toggleClass, throttle } from './utils.js';

/**
 * Inicializa el navbar
 */
export const initNavbar = () => {
  const navbar = $('#navbar');
  const toggle = $('#navbarToggle');
  const mobileMenu = $('#mobileMenu');
  
  if (!navbar || !toggle || !mobileMenu) return;
  
  // Toggle mobile menu
  toggle.addEventListener('click', () => {
    const isOpen = hasClass(toggle, 'navbar__toggle--active');
    toggleClass(toggle, 'navbar__toggle--active', !isOpen);
    toggleClass(mobileMenu, 'navbar__mobile-menu--open', !isOpen);
    document.body.style.overflow = isOpen ? '' : 'hidden';
  });
  
  // Close menu when clicking a link
  const mobileLinks = mobileMenu.querySelectorAll('.navbar__link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      removeClass(toggle, 'navbar__toggle--active');
      removeClass(mobileMenu, 'navbar__mobile-menu--open');
      document.body.style.overflow = '';
    });
  });
  
  // Scroll effect
  const handleScroll = throttle(() => {
    if (window.scrollY > 10) {
      addClass(navbar, 'navbar--scrolled');
    } else {
      removeClass(navbar, 'navbar--scrolled');
    }
  }, 100);
  
  window.addEventListener('scroll', handleScroll);
  
  // Active link based on scroll position
  initScrollSpy();
};

/**
 * Inicializa el scroll spy para resaltar el enlace activo
 */
const initScrollSpy = () => {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link[href^="#"]');
  
  if (!sections.length || !navLinks.length) return;
  
  const handleScrollSpy = throttle(() => {
    const scrollPos = window.scrollY + 100;
    
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('navbar__link--active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('navbar__link--active');
          }
        });
      }
    });
  }, 100);
  
  window.addEventListener('scroll', handleScrollSpy);
};

/**
 * Cierra el menú móvil
 */
export const closeMobileMenu = () => {
  const toggle = $('#navbarToggle');
  const mobileMenu = $('#mobileMenu');
  
  if (toggle && mobileMenu) {
    removeClass(toggle, 'navbar__toggle--active');
    removeClass(mobileMenu, 'navbar__mobile-menu--open');
    document.body.style.overflow = '';
  }
};
