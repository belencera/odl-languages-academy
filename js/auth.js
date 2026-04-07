/**
 * AUTH.JS - Academia de Idiomas
 * Funcionalidad de autenticación (login y registro)
 */

import { 
  $, $$, addClass, removeClass, setLoading, showAlert, hideAlert,
  isValidEmail, isValidPassword, getPasswordStrength, setStorage, getStorage
} from './utils.js';

// Demo users para testing
const DEMO_USERS = [
  { email: 'admin@linguapro.es', password: 'admin123', role: 'admin', name: 'Admin User' },
  { email: 'teacher@linguapro.es', password: 'teacher123', role: 'teacher', name: 'Profesor Demo' },
  { email: 'student@linguapro.es', password: 'student123', role: 'student', name: 'Estudiante Demo' }
];

/**
 * Inicializa la funcionalidad de autenticación
 */
export const initAuth = () => {
  initLoginForm();
  initRegisterForm();
  initRoleSelector();
  initPasswordStrength();
};

/**
 * Inicializa el formulario de login
 */
const initLoginForm = () => {
  const form = $('#loginForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = $('#email')?.value.trim();
    const password = $('#password')?.value;
    const alertEl = $('#loginAlert');
    const btn = $('#loginBtn');
    const spinner = $('#loginSpinner');
    const btnText = $('#loginBtnText');
    
    // Validación
    if (!email || !password) {
      showAlert(alertEl, 'Por favor completa todos los campos', 'error');
      return;
    }
    
    if (!isValidEmail(email)) {
      showAlert(alertEl, 'Por favor ingresa un email válido', 'error');
      return;
    }
    
    // Mostrar loading
    setLoading(btn, spinner, btnText, true);
    hideAlert(alertEl);
    
    // Simular petición al servidor (reemplazar con fetch real)
    try {
      await simulateLogin(email, password);
    } catch (error) {
      showAlert(alertEl, error.message, 'error');
    } finally {
      setLoading(btn, spinner, btnText, false);
    }
  });
};

/**
 * Simula el proceso de login (reemplazar con API real)
 */
const simulateLogin = async (email, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Buscar usuario demo
      const user = DEMO_USERS.find(u => u.email === email && u.password === password);
      
      if (user) {
        // Guardar sesión
        setStorage('user', {
          email: user.email,
          name: user.name,
          role: user.role,
          isLoggedIn: true
        });
        
        // Redirigir al dashboard
        window.location.href = 'dashboard.html';
        resolve();
      } else {
        reject(new Error('Email o contraseña incorrectos'));
      }
    }, 1000);
  });
};

/**
 * Inicializa el formulario de registro
 */
const initRegisterForm = () => {
  const form = $('#registerForm');
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const firstName = $('#firstName')?.value.trim();
    const lastName = $('#lastName')?.value.trim();
    const email = $('#email')?.value.trim();
    const password = $('#password')?.value;
    const confirmPassword = $('#confirmPassword')?.value;
    const role = form.querySelector('input[name="role"]:checked')?.value;
    const terms = form.querySelector('input[name="terms"]')?.checked;
    
    const alertEl = $('#registerAlert');
    const btn = $('#registerBtn');
    const spinner = $('#registerSpinner');
    const btnText = $('#registerBtnText');
    
    // Validaciones
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showAlert(alertEl, 'Por favor completa todos los campos', 'error');
      return;
    }
    
    if (!isValidEmail(email)) {
      showAlert(alertEl, 'Por favor ingresa un email válido', 'error');
      return;
    }
    
    if (!isValidPassword(password)) {
      showAlert(alertEl, 'La contraseña debe tener al menos 8 caracteres', 'error');
      return;
    }
    
    if (password !== confirmPassword) {
      showAlert(alertEl, 'Las contraseñas no coinciden', 'error');
      return;
    }
    
    if (!terms) {
      showAlert(alertEl, 'Debes aceptar los términos de servicio', 'error');
      return;
    }
    
    // Mostrar loading
    setLoading(btn, spinner, btnText, true);
    hideAlert(alertEl);
    
    // Simular registro (reemplazar con API real)
    try {
      await simulateRegister({ firstName, lastName, email, password, role });
    } catch (error) {
      showAlert(alertEl, error.message, 'error');
    } finally {
      setLoading(btn, spinner, btnText, false);
    }
  });
};

/**
 * Simula el proceso de registro (reemplazar con API real)
 */
const simulateRegister = async (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Verificar si el email ya existe
      const existingUser = DEMO_USERS.find(u => u.email === userData.email);
      
      if (existingUser) {
        reject(new Error('Este email ya está registrado'));
      } else {
        // Guardar sesión
        setStorage('user', {
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          role: userData.role,
          isLoggedIn: true
        });
        
        // Redirigir al dashboard
        window.location.href = 'dashboard.html';
        resolve();
      }
    }, 1000);
  });
};

/**
 * Inicializa el selector de roles
 */
const initRoleSelector = () => {
  const roleOptions = $$('.role-option');
  
  roleOptions.forEach(option => {
    option.addEventListener('click', () => {
      // Remover selección de todas las opciones
      roleOptions.forEach(opt => removeClass(opt, 'role-option--selected'));
      // Añadir selección a la opción clickeada
      addClass(option, 'role-option--selected');
      // Seleccionar el radio button
      const radio = option.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });
};

/**
 * Inicializa el indicador de fortaleza de contraseña
 */
const initPasswordStrength = () => {
  const passwordInput = $('#password');
  const strengthFill = $('#passwordStrength');
  const strengthText = $('#passwordStrengthText');
  
  if (!passwordInput || !strengthFill || !strengthText) return;
  
  passwordInput.addEventListener('input', (e) => {
    const password = e.target.value;
    const strength = getPasswordStrength(password);
    
    // Actualizar barra de fortaleza
    strengthFill.className = 'password-strength__fill';
    
    if (password.length > 0) {
      if (strength.score <= 2) {
        strengthFill.classList.add('password-strength__fill--weak');
      } else if (strength.score <= 3) {
        strengthFill.classList.add('password-strength__fill--medium');
      } else {
        strengthFill.classList.add('password-strength__fill--strong');
      }
    }
    
    // Actualizar texto
    strengthText.textContent = password.length > 0 
      ? `Fortaleza: ${strength.label}` 
      : 'La contraseña debe tener al menos 8 caracteres';
  });
};

/**
 * Verifica si el usuario está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const user = getStorage('user');
  return user && user.isLoggedIn;
};

/**
 * Obtiene el usuario actual
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  return getStorage('user');
};

/**
 * Cierra la sesión del usuario
 */
export const logout = () => {
  setStorage('user', null);
  window.location.href = 'login.html';
};

/**
 * Protege una ruta (redirige al login si no está autenticado)
 */
export const protectRoute = () => {
  if (!isAuthenticated()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
};
