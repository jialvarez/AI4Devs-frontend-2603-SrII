Actúa como un Ingeniero Frontend Senior. Tu objetivo es implementar la vista de detalle de una posición ("position") dentro del contenido interno de la página (asume que el menú superior, el footer y el contenedor global ya existen).

Por favor, lee con atención los siguientes requerimientos e impleméntalos en el proyecto:

### 1. Requerimientos de UI/UX (Basados en Diseño)
- **Título y Navegación:** Muestra el título de la posición en la parte superior. Añade un botón/flecha a la izquierda del título que permita regresar al listado de posiciones (utiliza el sistema de enrutado del proyecto).
- **Tablero Kanban:** Muestra tantas columnas como fases devuelva el endpoint de flujo. Las tarjetas de los candidatos deben ubicarse en la columna correspondiente a su fase actual.
- **Tarjetas de Candidatos:** Cada tarjeta debe mostrar el nombre completo (`fullName`) y su puntuación media (`averageScore`) representada de forma visual (por ejemplo, con círculos/esferas verdes según la puntuación, imitando la imagen de referencia del diseño).
- **Responsividad (Mobile First):** En pantallas grandes, las columnas se muestran en horizontal (layout Kanban estándar). En dispositivos móviles, las fases deben apilarse en vertical ocupando todo el ancho de la pantalla.

### 2. Funcionalidad e Interacción (Drag and Drop)
- Implementa la funcionalidad de arrastrar y soltar (Drag and Drop) para mover las tarjetas de los candidatos entre las columnas (fases).
- Al soltar un candidato en una nueva columna, se debe actualizar la interfaz de manera optimista o tras la confirmación de la API.

### 3. Integración con la API (Endpoints)
Deberás consumir/conectar los siguientes endpoints (ajústalos a los servicios, axios, o fetch del proyecto):

- **GET `/positions/:id/interviewFlow`**: Para obtener el nombre de la posición y el listado de fases (`interviewSteps`).
- **GET `/positions/:id/candidates`**: Para obtener el listado de candidatos, su fase actual (`currentInterviewStep`) y su nota (`averageScore`).
- **PUT `/candidates/:id/stage`**: Se debe disparar al mover un candidato de columna. Envía en el body el `currentInterviewStep` (con el ID de la nueva fase).

### 4. Instrucciones para Claude Code
1. Analiza la estructura actual del proyecto para identificar dónde ubicar este componente/página, qué librería de estilos se usa (Tailwind, CSS Modules, etc.) y qué sistema de enrutado o estado global está implementado.
2. Si es necesario para el Drag and Drop, utiliza la API nativa de HTML5 o una librería ligera que ya esté instalada en el `package.json` (o propón su instalación si es un estándar del proyecto).
3. Asegúrate de manejar los estados de carga (Loading) y error al conectar con los endpoints.
4. Ejecuta los tests del proyecto si existen para asegurar que no rompes nada, y crea componentes limpios, modulares y tipados si el proyecto usa TypeScript.

Por favor, procede a revisar los archivos relevantes e implementa la solución paso a paso.