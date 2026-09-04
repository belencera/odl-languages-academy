import {
  NIVELES,
  PREGUNTAS_DISPONIBLES_POR_NIVEL,
  PREGUNTAS_POR_NIVEL,
  TESTS
} from './config.js';

const TOTAL_PREGUNTAS = NIVELES.length * PREGUNTAS_POR_NIVEL;
const TOTAL_PAGINAS = Math.ceil(TOTAL_PREGUNTAS / PREGUNTAS_POR_NIVEL);
const testError = document.querySelector('#testError');
const quizError = document.querySelector('#quizError');
const selectionView = document.querySelector('#selectionView');
const testSelectionGrid = document.querySelector('#testSelectionGrid');
const startView = document.querySelector('#startView');
const instructionsView = document.querySelector('#instructionsView');
const quizView = document.querySelector('#quizView');
const resultView = document.querySelector('#resultView');
const startForm = document.querySelector('#testStartForm');
const startQuizButton = document.querySelector('#startQuizButton');
const testTitle = document.querySelector('#testTitle');
const testDescription = document.querySelector('#testDescription');
const quizDescription = document.querySelector('#quizDescription');
const questionList = document.querySelector('#questionList');
const quizTitle = document.querySelector('#quizTitle');
const quizProgress = document.querySelector('#quizProgress');
const quizProgressBar = document.querySelector('#quizProgressBar');
const previousButton = document.querySelector('#previousButton');
const nextButton = document.querySelector('#nextButton');

let selectedTest;
let quizQuestions = [];
let selectedAnswers = new Map();
let currentPage = 0;
let participant = { name: '', surname: '', email: '', phone: '' };

export const fisherYates = (items) => {
  const shuffledItems = [...items];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [shuffledItems[randomIndex], shuffledItems[index]];
  }

  return shuffledItems;
};

export const seleccionarPreguntas = (questions, amount = PREGUNTAS_POR_NIVEL) => {
  if (!Array.isArray(questions) || questions.length < amount) {
    throw new Error(`No hay suficientes preguntas disponibles. Se necesitan ${amount}.`);
  }

  return fisherYates(questions).slice(0, amount);
};

export const calcularNivel = (correctAnswers) => {
  if (correctAnswers >= 25) return 'C1';
  if (correctAnswers >= 20) return 'B2';
  if (correctAnswers >= 15) return 'B1';
  if (correctAnswers >= 10) return 'A2';
  if (correctAnswers >= 5) return 'A1';
  return 'Sin nivel / inferior a A1';
};

const showError = (message) => {
  testError.textContent = message;
  testError.hidden = false;
};

const showQuizError = (message) => {
  quizError.textContent = message;
  quizError.hidden = false;
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
  return testId && TESTS[testId] ? { id: testId, ...TESTS[testId] } : null;
};

const renderTestSelection = () => {
  Object.entries(TESTS).forEach(([testId, test]) => {
    const card = document.createElement('a');
    card.className = 'odl-test-selection-card';
    card.href = `test.html?test=${testId}`;

    const flag = document.createElement('img');
    flag.src = test.idioma === 'Portugués' ? '../assets/flags/BR.png' : '../assets/flags/GB.png';
    flag.alt = `Bandera de ${test.idioma}`;
    flag.className = 'odl-test-selection-flag';

    const content = document.createElement('span');
    content.className = 'odl-test-selection-content';

    const title = document.createElement('strong');
    title.textContent = test.nombre;

    const details = document.createElement('span');
    details.textContent = `${test.idioma} · ${test.tipo}`;

    const arrow = document.createElement('span');
    arrow.className = 'odl-test-selection-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';

    content.append(title, details);
    card.append(flag, content, arrow);
    testSelectionGrid.append(card);
  });
};

const loadQuestions = async () => {
  const questionsByLevel = await Promise.all(NIVELES.map(async (level) => {
    const questionsUrl = `../questions/${selectedTest.carpeta}/${level}.json`;
    let response;

    try {
      response = await fetch(questionsUrl);
    } catch {
      throw new Error(`No se pudo cargar el banco de preguntas ${level.toUpperCase()}.`);
    }

    if (!response.ok) {
      throw new Error(`No se encontró el archivo de preguntas ${level.toUpperCase()}.`);
    }

    let questions;
    try {
      questions = await response.json();
    } catch {
      throw new Error(`El archivo de preguntas ${level.toUpperCase()} no contiene JSON válido.`);
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error(`El banco de preguntas ${level.toUpperCase()} está vacío.`);
    }

    if (questions.length < PREGUNTAS_DISPONIBLES_POR_NIVEL) {
      throw new Error(`El banco ${level.toUpperCase()} tiene ${questions.length} preguntas; se necesitan ${PREGUNTAS_DISPONIBLES_POR_NIVEL}.`);
    }

    return seleccionarPreguntas(questions).map((question) => ({ ...question, level }));
  }));

  return questionsByLevel.flat();
};

const getCurrentPageQuestions = () => {
  const pageStart = currentPage * PREGUNTAS_POR_NIVEL;
  return quizQuestions.slice(pageStart, pageStart + PREGUNTAS_POR_NIVEL);
};

const renderQuestions = () => {
  const currentQuestions = getCurrentPageQuestions();
  const pageStart = currentPage * PREGUNTAS_POR_NIVEL;

  quizProgress.textContent = `Página ${currentPage + 1} de ${TOTAL_PAGINAS}`;
  quizProgressBar.style.width = `${((pageStart + currentQuestions.length) / TOTAL_PREGUNTAS) * 100}%`;
  questionList.replaceChildren();

  currentQuestions.forEach((question, questionIndex) => {
    const questionNumber = pageStart + questionIndex + 1;
    const questionElement = document.createElement('fieldset');
    questionElement.className = 'odl-test-question';

    const legend = document.createElement('legend');
    legend.textContent = `${questionNumber}. ${question.question}`;
    questionElement.append(legend);

    const options = document.createElement('div');
    options.className = 'odl-test-options';

    question.options.forEach((option, optionIndex) => {
      const label = document.createElement('label');
      label.className = 'odl-test-option';

      const input = document.createElement('input');
      input.type = 'radio';
      input.name = question.id;
      input.value = optionIndex;
      input.checked = selectedAnswers.get(question.id) === optionIndex;
      input.addEventListener('change', () => {
        selectedAnswers.set(question.id, optionIndex);
        quizError.hidden = true;
      });

      const optionText = document.createElement('span');
      optionText.textContent = option;
      label.append(input, optionText);
      options.append(label);
    });

    questionElement.append(options);
    questionList.append(questionElement);
  });

  previousButton.disabled = currentPage === 0;
  nextButton.textContent = currentPage === TOTAL_PAGINAS - 1 ? 'Finalizar test' : 'Siguiente';
};

const hasAnsweredCurrentPage = () => getCurrentPageQuestions().every((question) => selectedAnswers.has(question.id));

const calculateResult = () => {
  const correctAnswers = quizQuestions.reduce((total, question) => (
    total + (selectedAnswers.get(question.id) === question.correctAnswer ? 1 : 0)
  ), 0);
  const percentage = Math.round((correctAnswers / TOTAL_PREGUNTAS) * 100);

  return { correctAnswers, percentage, level: calcularNivel(correctAnswers) };
};

const showResults = () => {
  const result = calculateResult();
  document.querySelector('#resultName').textContent = `${participant.name} ${participant.surname}`;
  document.querySelector('#resultTest').textContent = selectedTest.nombre;
  document.querySelector('#resultScore').textContent = `${result.correctAnswers} / ${TOTAL_PREGUNTAS} aciertos`;
  document.querySelector('#resultPercentage').textContent = `${result.percentage}%`;
  document.querySelector('#resultLevel').textContent = result.level;
  quizView.hidden = true;
  resultView.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const startQuiz = async () => {
  quizError.hidden = true;
  nextButton.disabled = true;

  try {
    quizQuestions = await loadQuestions();
    currentPage = 0;
    selectedAnswers = new Map();
    document.activeElement?.blur();
    startView.hidden = true;
    quizView.hidden = false;
    renderQuestions();
    window.scrollTo({ top: 0, behavior: 'auto' });
  } catch (error) {
    showError(error.message || 'No se pudo preparar el test. Inténtalo de nuevo más tarde.');
  } finally {
    nextButton.disabled = false;
  }
};

selectedTest = getSelectedTest();

if (!selectedTest) {
  const hasTestParameter = new URLSearchParams(window.location.search).has('test');
  if (hasTestParameter) {
    showError('No se ha encontrado el test solicitado. Comprueba el enlace e inténtalo de nuevo.');
  } else {
    renderTestSelection();
    selectionView.hidden = false;
  }
  startView.hidden = true;
} else {
  selectionView.hidden = true;
  document.title = `${selectedTest.nombre} | On Demand Languages`;
  testTitle.textContent = selectedTest.nombre;
  quizTitle.textContent = selectedTest.nombre;
  quizDescription.textContent = 'Lee cada pregunta con atención, recuerda que sólo hay una respuesta correcta.';
  testDescription.textContent = `Evaluación de ${selectedTest.idioma.toLowerCase()}. Completa el test para obtener una estimación orientativa de tu nivel.`;
}

startForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearFieldErrors();

  if (!selectedTest) return;

  const formData = new FormData(startForm);
  const name = String(formData.get('name') || '').trim();
  const surname = String(formData.get('surname') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const phone = String(formData.get('phone') || '').trim();
  const privacyAccepted = formData.get('privacyConsent') === 'on';
  let isValid = true;

  if (!name) {
    showFieldError('name', 'Introduce tu nombre.');
    isValid = false;
  }

  if (!surname) {
    showFieldError('surname', 'Introduce tu apellido.');
    isValid = false;
  }

  if (!email || !startForm.elements.email.checkValidity()) {
    showFieldError('email', 'Introduce un email válido.');
    isValid = false;
  }

  if (!phone) {
    showFieldError('phone', 'Introduce tu número de teléfono.');
    isValid = false;
  }

  if (!privacyAccepted) {
    showFieldError('privacy', 'Debes aceptar el uso de los datos para continuar.');
    isValid = false;
  }

  if (!isValid) return;

  participant = { name, surname, email, phone };
  startView.hidden = true;
  instructionsView.hidden = false;
  document.querySelector('#instructionsDescription').textContent = `Estás a punto de comenzar el test de ${selectedTest.nombre}.`;
  window.scrollTo({ top: 0, behavior: 'auto' });
});

startQuizButton.addEventListener('click', async () => {
  instructionsView.hidden = true;
  await startQuiz();
});

previousButton.addEventListener('click', () => {
  if (currentPage === 0) return;
  currentPage -= 1;
  renderQuestions();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

nextButton.addEventListener('click', () => {
  if (!hasAnsweredCurrentPage()) {
    showQuizError('Selecciona una respuesta para cada pregunta antes de continuar.');
    return;
  }

  if (currentPage === TOTAL_PAGINAS - 1) {
    showResults();
    return;
  }

  currentPage += 1;
  renderQuestions();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
