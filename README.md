# On Demand Languages Academy

Sitio web oficial de **On Demand Languages**. Incluye la página principal con información sobre cursos y un test interactivo para evaluar el nivel de idiomas (Inglés y Portugués).

---

## ¿Qué incluye este proyecto?

1. **Página principal (`index.html`)**:
   - Información de los cursos (Inglés, Portugués, clases individuales).
   - Formulario de contacto para solicitar información o inscribirse.
   - Acceso al test de nivel gratuito.

2. **Test de nivel (`pages/test.html`)**:
   - Tests disponibles para **Inglés** y **Portugués**.
   - Evalúa desde nivel principiante hasta avanzado (A1, A2, B1, B2 y C1).
   - Cada test tiene 25 preguntas elegidas al azar (5 por nivel).
   - Al terminar, muestra el nivel estimado del alumno, qué significa ese nivel y recomendaciones para seguir aprendiendo.
   - Guarda los resultados automáticamente en Google Sheets.

---

## Estructura de carpetas

```text
odl-languages-academy/
├── index.html              # Página principal
├── assets/                 # Imágenes, logos y banderas
├── css/                    # Estilos visuales del sitio y del test
├── js/                     # Funcionamiento de la web y del test
├── pages/
│   └── test.html           # Pantalla del test de nivel
├── questions/              # Preguntas del test
│   ├── ingles/general/     # Preguntas de inglés (A1 a C1)
│   └── portugues/general/  # Preguntas de portugués (A1 a C1)
└── README.md
```
