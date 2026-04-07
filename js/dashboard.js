/**
 * DASHBOARD.JS - Academia de Idiomas
 * Funcionalidad del dashboard con soporte para múltiples roles
 */

import { 
  $, $$, addClass, removeClass, hasClass, toggleClass, 
  getStorage, getInitials
} from './utils.js';
import { logout, protectRoute } from './auth.js';

// Configuración de navegación por rol
const ROLE_NAV = {
  admin: 'adminNav',
  teacher: 'teacherNav',
  student: 'studentNav'
};

// Configuración de estadísticas por rol
const ROLE_STATS = {
  admin: [
    { icon: '👥', label: 'Total Usuarios', value: '1,234', change: '+12%', changeType: 'positive', iconClass: 'stat-card__icon--blue' },
    { icon: '📚', label: 'Cursos Activos', value: '48', change: '+5%', changeType: 'positive', iconClass: 'stat-card__icon--green' },
    { icon: '👨‍🎓', label: 'Estudiantes', value: '892', change: '+18%', changeType: 'positive', iconClass: 'stat-card__icon--orange' },
    { icon: '💰', label: 'Ingresos Mensuales', value: '€24.5K', change: '+8%', changeType: 'positive', iconClass: 'stat-card__icon--red' }
  ],
  teacher: [
    { icon: '📖', label: 'Mis Clases', value: '6', change: '', changeType: '', iconClass: 'stat-card__icon--blue' },
    { icon: '👨‍🎓', label: 'Mis Estudiantes', value: '72', change: '+3', changeType: 'positive', iconClass: 'stat-card__icon--green' },
    { icon: '📅', label: 'Clases Hoy', value: '3', change: '', changeType: '', iconClass: 'stat-card__icon--orange' },
    { icon: '✅', label: 'Tareas Pendientes', value: '12', change: '-2', changeType: 'positive', iconClass: 'stat-card__icon--red' }
  ],
  student: [
    { icon: '📚', label: 'Mis Cursos', value: '3', change: '', changeType: '', iconClass: 'stat-card__icon--blue' },
    { icon: '📅', label: 'Clases Esta Semana', value: '6', change: '', changeType: '', iconClass: 'stat-card__icon--green' },
    { icon: '📝', label: 'Tareas Pendientes', value: '4', change: '+1', changeType: 'negative', iconClass: 'stat-card__icon--orange' },
    { icon: '📊', label: 'Promedio General', value: '8.5', change: '+0.3', changeType: 'positive', iconClass: 'stat-card__icon--red' }
  ]
};

/**
 * Inicializa el dashboard
 */
export const initDashboard = () => {
  // Proteger ruta
  if (!protectRoute()) return;
  
  const user = getStorage('user');
  if (!user) return;
  
  // Inicializar componentes
  initSidebar(user);
  initHeader(user);
  initStats(user.role);
  initContent(user.role);
  initNavigation();
  initLogout();
};

/**
 * Inicializa el sidebar según el rol del usuario
 */
const initSidebar = (user) => {
  // Mostrar navegación correspondiente al rol
  Object.values(ROLE_NAV).forEach(navId => {
    const nav = $(`#${navId}`);
    if (nav) nav.style.display = 'none';
  });
  
  const userNav = $(`#${ROLE_NAV[user.role]}`);
  if (userNav) userNav.style.display = 'block';
  
  // Actualizar info del usuario
  const userAvatar = $('#userAvatar');
  const userName = $('#userName');
  const userRole = $('#userRole');
  
  if (userAvatar) userAvatar.textContent = getInitials(user.name);
  if (userName) userName.textContent = user.name;
  if (userRole) userRole.textContent = getRoleLabel(user.role);
};

/**
 * Inicializa el header
 */
const initHeader = (user) => {
  const welcomeName = $('#welcomeName');
  if (welcomeName) welcomeName.textContent = user.name.split(' ')[0];
  
  // Toggle sidebar en mobile
  const menuToggle = $('#menuToggle');
  const sidebar = $('#sidebar');
  const overlay = $('#sidebarOverlay');
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      const isOpen = hasClass(sidebar, 'dashboard__sidebar--open');
      toggleClass(sidebar, 'dashboard__sidebar--open', !isOpen);
      toggleClass(overlay, 'dashboard__overlay--visible', !isOpen);
    });
  }
  
  if (overlay && sidebar) {
    overlay.addEventListener('click', () => {
      removeClass(sidebar, 'dashboard__sidebar--open');
      removeClass(overlay, 'dashboard__overlay--visible');
    });
  }
};

/**
 * Inicializa las estadísticas según el rol
 */
const initStats = (role) => {
  const statsGrid = $('#statsGrid');
  if (!statsGrid) return;
  
  const stats = ROLE_STATS[role] || ROLE_STATS.student;
  
  statsGrid.innerHTML = stats.map(stat => `
    <div class="stat-card">
      <div class="stat-card__icon ${stat.iconClass}">${stat.icon}</div>
      <div class="stat-card__content">
        <p class="stat-card__value">${stat.value}</p>
        <p class="stat-card__label">${stat.label}</p>
        ${stat.change ? `
          <span class="stat-card__change stat-card__change--${stat.changeType}">
            ${stat.changeType === 'positive' ? '↑' : '↓'} ${stat.change} este mes
          </span>
        ` : ''}
      </div>
    </div>
  `).join('');
};

/**
 * Inicializa el contenido principal según el rol
 */
const initContent = (role) => {
  const mainGrid = $('#mainGrid');
  if (!mainGrid) return;
  
  const content = getRoleContent(role);
  mainGrid.innerHTML = content;
};

/**
 * Obtiene el contenido HTML según el rol
 */
const getRoleContent = (role) => {
  const contents = {
    admin: `
      <div class="panel">
        <div class="panel__header">
          <h2 class="panel__title">Últimos usuarios registrados</h2>
          <a href="#" class="panel__action">Ver todos</a>
        </div>
        <div class="panel__body panel__body--no-padding">
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Rol</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <div class="table__user">
                      <div class="table__avatar">JM</div>
                      <div class="table__user-info">
                        <p class="table__user-name">Juan Martínez</p>
                        <p class="table__user-email">juan@email.com</p>
                      </div>
                    </div>
                  </td>
                  <td>Estudiante</td>
                  <td>Hoy</td>
                  <td><span class="badge badge--success">Activo</span></td>
                </tr>
                <tr>
                  <td>
                    <div class="table__user">
                      <div class="table__avatar">PL</div>
                      <div class="table__user-info">
                        <p class="table__user-name">Patricia López</p>
                        <p class="table__user-email">patricia@email.com</p>
                      </div>
                    </div>
                  </td>
                  <td>Profesor</td>
                  <td>Ayer</td>
                  <td><span class="badge badge--success">Activo</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="panel">
        <div class="panel__header">
          <h2 class="panel__title">Actividad reciente</h2>
        </div>
        <div class="panel__body">
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-item__icon activity-item__icon--blue">👤</div>
              <div class="activity-item__content">
                <p class="activity-item__text"><strong>Nuevo estudiante</strong> registrado: Ana Martínez</p>
                <p class="activity-item__time">Hace 5 minutos</p>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-item__icon activity-item__icon--green">💰</div>
              <div class="activity-item__content">
                <p class="activity-item__text"><strong>Pago recibido</strong> de Carlos Gómez - €199</p>
                <p class="activity-item__time">Hace 1 hora</p>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-item__icon activity-item__icon--orange">📚</div>
              <div class="activity-item__content">
                <p class="activity-item__text"><strong>Nuevo curso</strong> creado: Alemán A1</p>
                <p class="activity-item__time">Hace 3 horas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    
    teacher: `
      <div class="panel">
        <div class="panel__header">
          <h2 class="panel__title">Mis próximas clases</h2>
          <a href="#" class="panel__action">Ver horario</a>
        </div>
        <div class="panel__body panel__body--no-padding">
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Clase</th>
                  <th>Horario</th>
                  <th>Estudiantes</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Inglés B2</strong></td>
                  <td>Hoy, 18:00</td>
                  <td>12</td>
                  <td><a href="class.html" class="btn btn--primary btn--sm">Entrar</a></td>
                </tr>
                <tr>
                  <td><strong>Inglés A2</strong></td>
                  <td>Mañana, 10:00</td>
                  <td>8</td>
                  <td><a href="#" class="btn btn--secondary btn--sm">Preparar</a></td>
                </tr>
                <tr>
                  <td><strong>Francés B1</strong></td>
                  <td>Mié, 16:00</td>
                  <td>6</td>
                  <td><a href="#" class="btn btn--secondary btn--sm">Preparar</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="panel">
        <div class="panel__header">
          <h2 class="panel__title">Acciones rápidas</h2>
        </div>
        <div class="panel__body">
          <div class="quick-actions">
            <div class="quick-action">
              <div class="quick-action__icon">📢</div>
              <span class="quick-action__label">Nuevo anuncio</span>
            </div>
            <div class="quick-action">
              <div class="quick-action__icon">📄</div>
              <span class="quick-action__label">Subir material</span>
            </div>
            <div class="quick-action">
              <div class="quick-action__icon">📝</div>
              <span class="quick-action__label">Crear tarea</span>
            </div>
            <div class="quick-action">
              <div class="quick-action__icon">📊</div>
              <span class="quick-action__label">Calificaciones</span>
            </div>
          </div>
        </div>
      </div>
    `,
    
    student: `
      <div class="panel">
        <div class="panel__header">
          <h2 class="panel__title">Mis cursos</h2>
          <a href="#" class="panel__action">Ver todos</a>
        </div>
        <div class="panel__body panel__body--no-padding">
          <div class="table-container">
            <table class="table">
              <thead>
                <tr>
                  <th>Curso</th>
                  <th>Profesor</th>
                  <th>Progreso</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Inglés B2</strong></td>
                  <td>Sarah Johnson</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="flex: 1; height: 6px; background: var(--color-neutral-200); border-radius: 3px;">
                        <div style="width: 75%; height: 100%; background: var(--color-primary-600); border-radius: 3px;"></div>
                      </div>
                      <span style="font-size: 12px;">75%</span>
                    </div>
                  </td>
                  <td><a href="class.html" class="btn btn--primary btn--sm">Continuar</a></td>
                </tr>
                <tr>
                  <td><strong>Español C1</strong></td>
                  <td>María García</td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="flex: 1; height: 6px; background: var(--color-neutral-200); border-radius: 3px;">
                        <div style="width: 45%; height: 100%; background: var(--color-primary-600); border-radius: 3px;"></div>
                      </div>
                      <span style="font-size: 12px;">45%</span>
                    </div>
                  </td>
                  <td><a href="#" class="btn btn--secondary btn--sm">Continuar</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div class="panel">
        <div class="panel__header">
          <h2 class="panel__title">Tareas pendientes</h2>
        </div>
        <div class="panel__body">
          <div class="activity-list">
            <div class="activity-item">
              <div class="activity-item__icon activity-item__icon--orange">📝</div>
              <div class="activity-item__content">
                <p class="activity-item__text"><strong>Ejercicios Past Perfect</strong> - Inglés B2</p>
                <p class="activity-item__time">Vence mañana</p>
              </div>
            </div>
            <div class="activity-item">
              <div class="activity-item__icon activity-item__icon--blue">📖</div>
              <div class="activity-item__content">
                <p class="activity-item__text"><strong>Lectura: Capítulo 5</strong> - Español C1</p>
                <p class="activity-item__time">Vence en 3 días</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  };
  
  return contents[role] || contents.student;
};

/**
 * Inicializa la navegación del sidebar
 */
const initNavigation = () => {
  const navItems = $$('.dashboard__nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remover clase activa de todos los items
      navItems.forEach(nav => removeClass(nav, 'dashboard__nav-item--active'));
      // Añadir clase activa al item clickeado
      addClass(item, 'dashboard__nav-item--active');
      
      // Actualizar título de la página
      const page = item.dataset.page;
      const pageTitle = $('#pageTitle');
      if (pageTitle && page) {
        pageTitle.textContent = getPageTitle(page);
      }
    });
  });
};

/**
 * Inicializa el botón de logout
 */
const initLogout = () => {
  const logoutBtn = $('#logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
  }
};

/**
 * Obtiene la etiqueta del rol
 */
const getRoleLabel = (role) => {
  const labels = {
    admin: 'Administrador',
    teacher: 'Profesor',
    student: 'Estudiante'
  };
  return labels[role] || role;
};

/**
 * Obtiene el título de la página según la sección
 */
const getPageTitle = (page) => {
  const titles = {
    overview: 'Resumen',
    users: 'Usuarios',
    courses: 'Cursos',
    classes: 'Clases',
    payments: 'Pagos',
    reports: 'Reportes',
    'my-classes': 'Mis Clases',
    students: 'Estudiantes',
    materials: 'Materiales',
    schedule: 'Horario',
    grades: 'Calificaciones',
    'my-courses': 'Mis Cursos',
    progress: 'Progreso',
    certificates: 'Certificados',
    messages: 'Mensajes',
    notifications: 'Notificaciones',
    settings: 'Configuración'
  };
  return titles[page] || 'Dashboard';
};
