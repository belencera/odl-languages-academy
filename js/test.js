import {
  NIVELES,
  PREGUNTAS_DISPONIBLES_POR_NIVEL,
  PREGUNTAS_POR_NIVEL,
  TESTS,
  GOOGLE_SHEETS_WEBHOOK_URL
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
  if (correctAnswers >= 22) return 'C1';
  if (correctAnswers >= 20) return 'B2+';
  if (correctAnswers >= 17) return 'B2';
  if (correctAnswers >= 15) return 'B1+';
  if (correctAnswers >= 12) return 'B1';
  if (correctAnswers >= 10) return 'A2+';
  if (correctAnswers >= 7) return 'A2';
  if (correctAnswers >= 5) return 'A1+';
  if (correctAnswers >= 3) return 'A1';
  return 'A1 inicial';
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


const getExplicacionNivel = (level) => {
  const explicaciones = {
    'A1 inicial': 'Estás dando tus primeros pasos en el idioma. Podés reconocer algunas palabras básicas y expresiones muy sencillas, pero todavía necesitás construir una base sólida de vocabulario y gramática fundamental.',
    'A1': 'Podés comprender y utilizar expresiones cotidianas muy básicas. Sos capaz de presentarte y responder preguntas sencillas sobre datos personales como dónde vivís o qué cosas tenés.',
    'A1+': 'Tenés una base sólida del nivel inicial. Manejás bien las expresiones básicas y empezás a comunicarte en situaciones sencillas del día a día con mayor confianza.',
    'A2': 'Podés comunicarte en tareas simples y cotidianas. Entendés frases y expresiones frecuentes relacionadas con tu entorno inmediato: información personal, compras, lugares de interés y trabajo.',
    'A2+': 'Dominás bien las situaciones cotidianas y empezás a desenvolverte con mayor soltura. Podés describir aspectos de tu pasado y tu entorno, y comunicar necesidades inmediatas con cierta fluidez.',
    'B1': 'Podés desenvolverte en la mayoría de las situaciones que surgen durante un viaje. Sos capaz de producir textos sencillos y coherentes sobre temas que te resultan familiares o de interés personal.',
    'B1+': 'Tenés un nivel intermedio consolidado. Podés participar en conversaciones sobre temas cotidianos con bastante fluidez y expresar opiniones y planes de forma clara.',
    'B2': 'Podés entender las ideas principales de textos complejos. Te relacionás con hablantes nativos con un grado suficiente de fluidez y naturalidad, de modo que la comunicación se realiza sin esfuerzo por ambas partes.',
    'B2+': 'Tu nivel es intermedio-alto avanzado. Comprendés textos extensos y exigentes, y podés expresarte de forma fluida y espontánea. Estás muy cerca del nivel avanzado.',
    'C1': 'Podés comprender una amplia variedad de textos extensos y exigentes, y reconocer significados implícitos. Te expresás de forma fluida y espontánea sin muestras evidentes de esfuerzo para encontrar la expresión adecuada.'
  };
  return explicaciones[level] || '';
};

const getRecomendacion = (idioma, tipo, level, score) => {
  const idiomaLower = idioma.toLowerCase();
  const recomendaciones = [];

  if (score <= 6) {
    recomendaciones.push(`Te recomendamos comenzar con un curso de ${idiomaLower} desde nivel inicial para construir una base sólida.`);
    recomendaciones.push(`Enfocate en vocabulario esencial, gramática básica y práctica de comprensión auditiva.`);
    recomendaciones.push(`Nuestros cursos de ${idiomaLower} ${tipo.toLowerCase()} incluyen material diseñado específicamente para este nivel.`);
  } else if (score <= 11) {
    recomendaciones.push(`Tenés una base que podés fortalecer. Te sugerimos un curso de ${idiomaLower} nivel pre-intermedio.`);
    recomendaciones.push(`Trabajá en ampliar tu vocabulario, mejorar la fluidez oral y practicar estructuras gramaticales intermedias.`);
    recomendaciones.push(`La práctica regular de conversación te va a ayudar a ganar confianza rápidamente.`);
  } else if (score <= 16) {
    recomendaciones.push(`Tenés un buen nivel intermedio. Te recomendamos un curso de ${idiomaLower} de nivel B1-B2 para seguir progresando.`);
    recomendaciones.push(`Enfocate en mejorar tu expresión escrita, comprensión de textos más complejos y fluidez en debates.`);
    recomendaciones.push(`Considerá prepararte para una certificación oficial de nivel intermedio-alto.`);
  } else if (score <= 21) {
    recomendaciones.push(`Tu nivel es avanzado. Te sugerimos un curso de ${idiomaLower} enfocado en perfeccionamiento y especialización.`);
    recomendaciones.push(`Trabajá en matices del idioma, expresiones idiomáticas y habilidades de comunicación profesional.`);
    recomendaciones.push(`Es un excelente momento para preparar una certificación oficial de nivel B2 o superior.`);
  } else {
    recomendaciones.push(`¡Felicitaciones! Tenés un nivel avanzado de ${idiomaLower}. Te recomendamos un curso de perfeccionamiento C1.`);
    recomendaciones.push(`Enfocate en el uso sofisticado del idioma: registro formal, redacción académica y comprensión de textos especializados.`);
    recomendaciones.push(`Considerá prepararte para la certificación oficial C1 o C2.`);
  }

  return recomendaciones;
};



const calculateResult = () => {
  const correctAnswers = quizQuestions.reduce((total, question) => (
    total + (selectedAnswers.get(question.id) === question.correctAnswer ? 1 : 0)
  ), 0);

  return { correctAnswers, level: calcularNivel(correctAnswers) };
};

const saveTestResultToGoogleSheets = async (result, explicacion, recomendaciones) => {
  if (!GOOGLE_SHEETS_WEBHOOK_URL) {
    console.info('Google Sheets: URL no configurada en js/config.js. Se omite el guardado.');
    return;
  }

  try {
    // 1. Desglose de aciertos por nivel
    const breakdown = {};
    NIVELES.forEach((lvl) => {
      breakdown[lvl] = { total: 0, correct: 0 };
    });

    // 2. Detalle de preguntas y respuestas
    const detailLines = [];

    quizQuestions.forEach((q) => {
      const chosenIndex = selectedAnswers.get(q.id);
      const isCorrect = chosenIndex === q.correctAnswer;
      const chosenText = (chosenIndex !== undefined && q.options && q.options[chosenIndex] !== undefined)
        ? q.options[chosenIndex]
        : 'Sin respuesta';
      const correctText = (q.options && q.options[q.correctAnswer] !== undefined)
        ? q.options[q.correctAnswer]
        : '';

      if (q.level && breakdown[q.level]) {
        breakdown[q.level].total += 1;
        if (isCorrect) breakdown[q.level].correct += 1;
      }

      if (isCorrect) {
        detailLines.push(`${q.id}: ✓`);
      } else {
        detailLines.push(`${q.id}: ✗ ("${chosenText}" → "${correctText}")`);
      }
    });

    const desgloseTexto = NIVELES.map((lvl) => (
      `${lvl.toUpperCase()}: ${breakdown[lvl]?.correct || 0}/${breakdown[lvl]?.total || 0}`
    )).join(' | ');

    const now = new Date();
    const fechaHora = now.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const payload = {
      fecha: fechaHora,
      nombre: participant.name,
      apellidos: participant.surname,
      email: participant.email,
      telefono: participant.phone,
      idioma: selectedTest.idioma,
      tipo: selectedTest.tipo,
      testNombre: selectedTest.nombre, // Define el nombre de la pestaña en Google Sheets
      puntuacion: `${result.correctAnswers} / ${TOTAL_PREGUNTAS}`,
      nivel: result.level,
      desglose: desgloseTexto,
      detalleRespuestas: detailLines.join(' | '),
      explicacion: explicacion || '',
      recomendaciones: recomendaciones || []
    };

    await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    console.info('Google Sheets: resultado enviado exitosamente.');
  } catch (error) {
    console.warn('Google Sheets: no se pudo guardar el resultado.', error);
  }
};

const showResults = () => {
  const result = calculateResult();
  const explicacion = getExplicacionNivel(result.level);
  const recomendaciones = getRecomendacion(
    selectedTest.idioma,
    selectedTest.tipo,
    result.level,
    result.correctAnswers
  );

  resultView.replaceChildren();

  // — Header —
  const eyebrow = document.createElement('span');
  eyebrow.className = 'odl-test-eyebrow';
  eyebrow.textContent = 'Resultado de la evaluación';

  const heading = document.createElement('h1');
  heading.id = 'resultTitle';
  heading.textContent = '¡Test completado!';

  const participantInfo = document.createElement('p');
  participantInfo.className = 'odl-test-result-participant';
  participantInfo.textContent = `${participant.name} ${participant.surname} · ${selectedTest.nombre}`;

  // — Level Card —
  const levelCard = document.createElement('div');
  levelCard.className = 'odl-test-result-level-card';

  const levelLabel = document.createElement('span');
  levelLabel.className = 'odl-test-result-level-label';
  levelLabel.textContent = 'Tu nivel estimado';

  const levelValue = document.createElement('strong');
  levelValue.className = 'odl-test-result-level-value';
  levelValue.textContent = result.level;

  const scoreText = document.createElement('span');
  scoreText.className = 'odl-test-result-score-text';
  scoreText.textContent = `${result.correctAnswers} / ${TOTAL_PREGUNTAS} aciertos`;

  const scoreBar = document.createElement('div');
  scoreBar.className = 'odl-test-result-score-bar';
  const scoreBarFill = document.createElement('div');
  scoreBarFill.className = 'odl-test-result-score-bar-fill';
  scoreBarFill.style.width = '0%';
  scoreBar.append(scoreBarFill);

  levelCard.append(levelLabel, levelValue, scoreText, scoreBar);



  // — Level Explanation —
  const explainSection = document.createElement('div');
  explainSection.className = 'odl-test-result-section odl-test-result-explain-card';

  const explainTitle = document.createElement('h2');
  explainTitle.className = 'odl-test-result-section-title';
  explainTitle.innerHTML = '<span class="odl-test-result-icon">📖</span> ¿Qué significa tu nivel?';

  const explainText = document.createElement('p');
  explainText.className = 'odl-test-result-explain';
  explainText.textContent = explicacion;

  explainSection.append(explainTitle, explainText);

  // — Recommendations —
  const recoSection = document.createElement('div');
  recoSection.className = 'odl-test-result-section odl-test-result-reco-card';

  const recoTitle = document.createElement('h2');
  recoTitle.className = 'odl-test-result-section-title';
  recoTitle.innerHTML = '<span class="odl-test-result-icon">🚀</span> Próximos pasos recomendados';

  const recoList = document.createElement('ul');
  recoList.className = 'odl-test-result-reco-list';
  recomendaciones.forEach((reco) => {
    const li = document.createElement('li');
    li.textContent = reco;
    recoList.append(li);
  });

  recoSection.append(recoTitle, recoList);

  // — Disclaimer —
  const disclaimer = document.createElement('div');
  disclaimer.className = 'odl-test-result-disclaimer';
  disclaimer.innerHTML = '<strong>⚠️ Aviso importante</strong><p>Este resultado es orientativo. No constituye una certificación oficial ni reemplaza una evaluación docente integral.</p>';

  // — Action Buttons —
  const actions = document.createElement('div');
  actions.className = 'odl-test-result-actions';

  const homeButton = document.createElement('a');
  homeButton.className = 'odl-test-button';
  homeButton.href = '../index.html';
  homeButton.textContent = 'Volver a la web';

  actions.append(homeButton);

  // — Assemble —
  resultView.append(
    eyebrow, heading, participantInfo,
    levelCard, explainSection, recoSection, disclaimer, actions
  );

  quizView.hidden = true;
  resultView.hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // — Animate score bar —
  requestAnimationFrame(() => {
    setTimeout(() => {
      scoreBarFill.style.width = `${(result.correctAnswers / TOTAL_PREGUNTAS) * 100}%`;
    }, 200);
  });

  // — Enviar resultados a Google Sheets en segundo plano —
  saveTestResultToGoogleSheets(result, explicacion, recomendaciones);
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
    showError(error.message || 'No se pudo preparar el test. Intentá de nuevo más tarde.');
  } finally {
    nextButton.disabled = false;
  }
};

selectedTest = getSelectedTest();

if (!selectedTest) {
  const hasTestParameter = new URLSearchParams(window.location.search).has('test');
  if (hasTestParameter) {
    showError('No se encontró el test solicitado. Revisá el enlace e intentá de nuevo.');
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
  quizDescription.textContent = 'Leé cada pregunta con atención, recordá que solo hay una respuesta correcta.';
  testDescription.textContent = `Evaluación de ${selectedTest.idioma.toLowerCase()}. Completá el test para obtener una estimación orientativa de tu nivel.`;
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
    showFieldError('name', 'Ingresá tu nombre.');
    isValid = false;
  }

  if (!surname) {
    showFieldError('surname', 'Ingresá tu apellido.');
    isValid = false;
  }

  if (!email || !startForm.elements.email.checkValidity()) {
    showFieldError('email', 'Ingresá un email válido.');
    isValid = false;
  }

  if (!phone) {
    showFieldError('phone', 'Ingresá tu número de teléfono.');
    isValid = false;
  }

  if (!privacyAccepted) {
    showFieldError('privacy', 'Tenés que aceptar el uso de los datos para continuar.');
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
    showQuizError('Seleccioná una respuesta para cada pregunta antes de continuar.');
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
