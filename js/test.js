import { TESTS } from './config.js';

const testError = document.querySelector('#testError');
const startView = document.querySelector('#startView');
const quizView = document.querySelector('#quizView');
const startForm = document.querySelector('#testStartForm');
const testTitle = document.querySelector('#testTitle');
const testDescription = document.querySelector('#testDescription');

const showError = (message) => {
  testError.textContent = message;
  testError.hidden = false;
};

const clearFieldErrors = () => {
  document.querySelectorAll('.odl-test-field-error').forEach((element) => {
    element.textContent = '';
    element.hidden = true;
  });
};

const showFieldError = (name, message) => {
  const element = document.querySelector(`[data-error-for="${name}"]`);
  if (!element) return;
  element.textContent = message;
  element.hidden = false;
};

const getSelectedTest = () => {
  const testId = new URLSearchParams(window.location.search).get('test');
  return testId ? TESTS[testId] : null;
};

const selectedTest = getSelectedTest();

if (!selectedTest) {
  showError('No se ha encontrado el test solicitado. Comprueba el enlace e inténtalo de nuevo.');
  startView.hidden = true;
} else {
  document.title = `${selectedTest.nombre} | On Demand Languages`;
  testTitle.textContent = selectedTest.nombre;
  testDescription.textContent = `Evaluación de ${selectedTest.idioma.toLowerCase()} en modalidad ${selectedTest.tipo.toLowerCase()}. Completa el test para obtener una estimación orientativa de tu nivel.`;
}

startForm.addEventListener('submit', (event) => {
  event.preventDefault();
  clearFieldErrors();

  if (!selectedTest) return;

  const formData = new FormData(startForm);
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const privacyAccepted = formData.get('privacyConsent') === 'on';
  let isValid = true;

  if (!name) {
    showFieldError('name', 'Introduce tu nombre.');
    isValid = false;
  }

  if (!email || !startForm.elements.email.checkValidity()) {
    showFieldError('email', 'Introduce un email válido.');
    isValid = false;
  }

  if (!privacyAccepted) {
    showFieldError('privacy', 'Debes aceptar el uso de los datos para continuar.');
    isValid = false;
  }

  if (!isValid) return;

  startView.hidden = true;
  quizView.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
