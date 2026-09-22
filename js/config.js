export const TESTS = {
  ingles_general: {
    nombre: 'Inglés general',
    idioma: 'Inglés',
    tipo: 'General',
    carpeta: 'ingles/general'
  },
  portugues_general: {
    nombre: 'Portugués general',
    idioma: 'Portugués',
    tipo: 'General',
    carpeta: 'portugues/general'
  },
  ingles_business: {
    nombre: 'Inglés business',
    idioma: 'Inglés',
    tipo: 'Business',
    carpeta: 'ingles/business',
    esBusiness: true
  },
  portugues_business: {
    nombre: 'Portugués business',
    idioma: 'Portugués',
    tipo: 'Business',
    carpeta: 'portugues/business',
    esBusiness: true
  }
};

export const NIVELES = ['a1', 'a2', 'b1', 'b2', 'c1'];
export const PREGUNTAS_DISPONIBLES_POR_NIVEL = 25;
export const PREGUNTAS_POR_NIVEL = 5;

// URL de la Web App de Google Apps Script para guardar resultados en Google Sheets
export const GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzsxnLA7Q2qgX0W5DO_nVk08xh2ZA36P2A7tDpy8b3qeduJqJZiJJL7bx81GMVvhXBM/exec';

// URL de la Web App de Google Apps Script para tests business (empresas)
export const GOOGLE_SHEETS_BUSINESS_WEBHOOK_URL = GOOGLE_SHEETS_WEBHOOK_URL;
