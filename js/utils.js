/**
 * UTILS.JS - Academia de Idiomas
 * Funciones utilitarias generales
 */

/**
 * Selecciona un elemento del DOM
 * @param {string} selector - Selector CSS
 * @param {HTMLElement} parent - Elemento padre (opcional)
 * @returns {HTMLElement|null}
 */
export const $ = (selector, parent = document) => parent.querySelector(selector);

/**
 * Selecciona múltiples elementos del DOM
 * @param {string} selector - Selector CSS
 * @param {HTMLElement} parent - Elemento padre (opcional)
 * @returns {NodeList}
 */
export const $$ = (selector, parent = document) => parent.querySelectorAll(selector);

/**
 * Añade o remueve una clase de un elemento
 * @param {HTMLElement} element - Elemento objetivo
 * @param {string} className - Nombre de la clase
 * @param {boolean} force - Forzar estado (opcional)
 */
export const toggleClass = (element, className, force) => {
  if (!element) return;
  element.classList.toggle(className, force);
};

/**
 * Añade una clase a un elemento
 * @param {HTMLElement} element - Elemento objetivo
 * @param {string} className - Nombre de la clase
 */
export const addClass = (element, className) => {
  if (!element) return;
  element.classList.add(className);
};

/**
 * Remueve una clase de un elemento
 * @param {HTMLElement} element - Elemento objetivo
 * @param {string} className - Nombre de la clase
 */
export const removeClass = (element, className) => {
  if (!element) return;
  element.classList.remove(className);
};

/**
 * Verifica si un elemento tiene una clase
 * @param {HTMLElement} element - Elemento objetivo
 * @param {string} className - Nombre de la clase
 * @returns {boolean}
 */
export const hasClass = (element, className) => {
  if (!element) return false;
  return element.classList.contains(className);
};

/**
 * Debounce - retrasa la ejecución de una función
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function}
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle - limita la ejecución de una función
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Límite de tiempo en ms
 * @returns {Function}
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Guarda datos en localStorage
 * @param {string} key - Clave
 * @param {*} value - Valor a guardar
 */
export const setStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

/**
 * Obtiene datos de localStorage
 * @param {string} key - Clave
 * @param {*} defaultValue - Valor por defecto
 * @returns {*}
 */
export const getStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error('Error reading from localStorage:', e);
    return defaultValue;
  }
};

/**
 * Elimina datos de localStorage
 * @param {string} key - Clave
 */
export const removeStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Error removing from localStorage:', e);
  }
};

/**
 * Formatea una fecha
 * @param {Date|string} date - Fecha
 * @param {Object} options - Opciones de formato
 * @returns {string}
 */
export const formatDate = (date, options = {}) => {
  const d = new Date(date);
  const defaultOptions = {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options
  };
  return d.toLocaleDateString('es-ES', defaultOptions);
};

/**
 * Formatea una hora
 * @param {Date|string} date - Fecha
 * @returns {string}
 */
export const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Capitaliza la primera letra de un string
 * @param {string} str - String
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Genera un ID único
 * @returns {string}
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Valida una contraseña (mínimo 8 caracteres)
 * @param {string} password - Contraseña a validar
 * @returns {boolean}
 */
export const isValidPassword = (password) => {
  return password && password.length >= 8;
};

/**
 * Calcula la fortaleza de una contraseña
 * @param {string} password - Contraseña
 * @returns {Object}
 */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '' };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  const labels = ['Muy débil', 'Débil', 'Media', 'Fuerte', 'Muy fuerte'];
  return {
    score,
    label: labels[Math.min(score, 4)]
  };
};

/**
 * Muestra un mensaje de alerta
 * @param {HTMLElement} element - Elemento de alerta
 * @param {string} message - Mensaje
 * @param {string} type - Tipo (success, error, warning, info)
 */
export const showAlert = (element, message, type = 'error') => {
  if (!element) return;
  
  const messageEl = element.querySelector('[id$="AlertMessage"]');
  if (messageEl) messageEl.textContent = message;
  
  element.className = `alert alert--${type}`;
  element.classList.remove('hidden');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    element.classList.add('hidden');
  }, 5000);
};

/**
 * Oculta un mensaje de alerta
 * @param {HTMLElement} element - Elemento de alerta
 */
export const hideAlert = (element) => {
  if (!element) return;
  element.classList.add('hidden');
};

/**
 * Muestra un spinner de carga
 * @param {HTMLElement} button - Botón
 * @param {HTMLElement} spinner - Spinner
 * @param {HTMLElement} text - Elemento de texto
 * @param {boolean} loading - Estado de carga
 */
export const setLoading = (button, spinner, text, loading = true) => {
  if (spinner) spinner.classList.toggle('hidden', !loading);
  if (text) text.classList.toggle('hidden', loading);
  if (button) button.disabled = loading;
};

/**
 * Realiza una petición fetch con manejo de errores
 * @param {string} url - URL
 * @param {Object} options - Opciones de fetch
 * @returns {Promise}
 */
export const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * Escapa HTML para prevenir XSS
 * @param {string} str - String a escapar
 * @returns {string}
 */
export const escapeHtml = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Obtiene las iniciales de un nombre
 * @param {string} name - Nombre completo
 * @returns {string}
 */
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Scroll suave a un elemento
 * @param {string|HTMLElement} target - Selector o elemento
 * @param {number} offset - Offset en píxeles
 */
export const smoothScroll = (target, offset = 80) => {
  const element = typeof target === 'string' ? $(target) : target;
  if (!element) return;
  
  const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({ top, behavior: 'smooth' });
};

/**
 * Detecta si es un dispositivo móvil
 * @returns {boolean}
 */
export const isMobile = () => {
  return window.innerWidth < 768;
};

/**
 * Detecta si es un dispositivo táctil
 * @returns {boolean}
 */
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};
