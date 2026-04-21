# 🌍 Doctor en Economía

**Doctor en Economía** es una aplicación web de finanzas personales orientada a personas sin formación financiera previa. El objetivo es ayudar al usuario a entender en qué gasta su dinero, controlar su balance mensual y dar los primeros pasos hacia el ahorro y la inversión responsable.

---

## 🧠 Descripción del proyecto

La aplicación permite al usuario:

- 🔐 **Registrarse e iniciar sesión** con correo y contraseña (Firebase Auth)
- 💸 **Registrar, editar y eliminar gastos diarios**, sincronizados en la nube
- 💰 **Añadir ingresos mensuales**, también guardados en la nube
- 💎 **Ver el balance real** (ingresos − gastos) actualizado automáticamente
- 🥧 **Visualizar la distribución del presupuesto** mediante un gráfico donut (gastos vs ahorro)
- 📊 **Ver los gastos agrupados por mes** en un gráfico de barras
- 🧾 **Guardar notas personales** sobre finanzas
- 📈 **Consultar precios en tiempo real** de criptomonedas y ETFs mediante APIs externas
- 📰 **Leer noticias del mercado financiero**
- 📅 **Guardar el historial mensual** de ingresos, gastos y balance
- 🧠 **Recibir un resumen inteligente** con consejos financieros adaptados al estado del usuario

---

## ⚙️ Tecnologías utilizadas

- **HTML5 / CSS3 / JavaScript** — sin frameworks
- **Firebase Auth** — autenticación de usuarios
- **Firebase Firestore** — base de datos en la nube
- **Chart.js** — gráficos de barras y donut
- **CoinGecko API** — precios de criptomonedas
- **TwelveData API** — precios de ETFs e índices bursátiles
- **NewsData.io API** — noticias del mercado financiero
- **localStorage** — almacenamiento local para preferencias de configuración (día de cobro) y caché de datos de sesión

---

## 🚀 Cómo ejecutar el proyecto

1. Clona o descarga este repositorio.
2. Abre la carpeta en **Visual Studio Code**.
3. Instala la extensión **Live Server** (si no la tienes).
4. Haz clic derecho en `index.html` → **Open with Live Server**.
5. Crea una cuenta o inicia sesión con un correo y contraseña.
6. Espera unos segundos a que se carguen los datos de mercado en tiempo real.

---

## 📖 Cómo usar la aplicación

Una vez dentro de la app, la barra de navegación superior te permite saltar directamente a cualquier sección.

### 1. Registro e inicio de sesión
Al abrir la app aparece la pantalla de login. Si es la primera vez, pulsa **"¿No tienes cuenta? Créala aquí"**, introduce tu correo y una contraseña de al menos 6 caracteres. Una vez registrado, inicias sesión automáticamente. Tus datos quedan vinculados a tu cuenta y se recuperan desde cualquier dispositivo.

### 2. Configurar tu día de cobro
En la sección **Contexto actual** puedes indicar el día del mes en que cobras la nómina. La app calculará automáticamente cuántos días faltan para el próximo ingreso y lo usará en el análisis financiero.

### 3. Registrar gastos
En **Control de gastos** escribe una descripción (ej. "Supermercado") y el importe en DKK. Pulsa **Añadir gasto**. Cada gasto se guarda en la nube (Firestore) y aparece en la lista con botones para **editarlo** o **eliminarlo**. El total se actualiza en tiempo real.

### 4. Registrar ingresos
En la sección **Balance real**, introduce el importe de tu nómina o cualquier otro ingreso y pulsa **Añadir**. El balance (ingresos − gastos) se recalcula al instante.

### 5. Ver la distribución del presupuesto
El gráfico donut de **Distribución del presupuesto** muestra visualmente qué porcentaje de tus ingresos ha ido a gastos y cuánto queda como ahorro. Se actualiza automáticamente al añadir datos.

### 6. Leer el resumen inteligente
La sección **Resumen inteligente** analiza tu situación financiera del mes: porcentaje gastado, días restantes hasta la nómina, gasto diario disponible y un consejo financiero personalizado según tu estado (ahorro excelente, aceptable o en rojo).

### 7. Consultar datos de mercado
En **Visión del mercado** encontrarás:
- Precios y variación en 24h de las principales **criptomonedas** (Bitcoin, Ethereum, Solana…)
- Cotización de **ETFs** (S&P 500, NASDAQ 100, Semiconductores, IA)
- Datos actualizados cada 5-10 minutos automáticamente

### 8. Leer noticias financieras
En **Noticias del mercado** pulsa **Actualizar noticias** para cargar los últimos artículos relacionados con los activos que sigue la app. Cada noticia incluye un enlace directo a la fuente.

### 9. Guardar el historial mensual
Al final del mes, ve a **Historial mensual** y pulsa **Guardar mes actual**. Se registrará una fila con ingresos, gastos y balance de ese mes. Así puedes comparar tu evolución mes a mes.

### 10. Tomar notas
En **Notas** puedes escribir y guardar apuntes personales sobre tus finanzas (objetivos, recordatorios, reflexiones). Cada nota se guarda con su fecha y se puede eliminar individualmente.

### Cerrar sesión
El botón **Cerrar sesión** aparece al final de la página, en el pie. Tus datos permanecen guardados en la nube para la próxima vez que entres.

---

## 📁 Estructura del proyecto

```
doctor-en-economia/
├── index.html      — Estructura HTML de la aplicación
├── style.css       — Estilos visuales
├── script.js       — Lógica JavaScript completa
└── README.md       — Documentación del proyecto
```

---

## 🔧 DECISIONES TÉCNICAS

### ¿Por qué Firebase?

Al empezar el proyecto necesitaba una forma de guardar los datos del usuario de manera que no se perdieran al cerrar el navegador y que funcionaran desde cualquier dispositivo. Las opciones principales eran crear un backend propio (por ejemplo con Node.js) o usar un servicio que ya lo gestionara.

Elegí Firebase por varias razones:

- **Autenticación lista para usar.** Firebase Auth permite crear un sistema de login y registro completo sin tener que programar la gestión de contraseñas, sesiones ni tokens desde cero.
- **Base de datos en la nube.** Firestore guarda y sincroniza los datos automáticamente. Cuando el usuario añade un gasto, queda guardado al instante.
- **Gratuito para proyectos pequeños.** El nivel gratuito de Firebase cubre perfectamente las necesidades de este proyecto.
- **Sin necesidad de servidor propio.** Firebase actúa como backend gestionado (BaaS — Backend as a Service).

La desventaja es que las claves de las APIs externas son visibles en el código cliente. En un proyecto de producción esto se resolvería con un backend intermedio.

---

### ¿Por qué una SPA (Single Page Application)?

La aplicación está construida en un único archivo HTML con todas las secciones cargadas desde el principio. La navegación consiste en mostrar u ocultar secciones según el estado del usuario.

Motivos:

- **Simplicidad técnica.** Al trabajar con HTML, CSS y JavaScript puro, sin frameworks ni herramientas de compilación, una SPA es la solución más directa.
- **Coherencia con el stack.** No hay que gestionar rutas ni comunicación entre páginas distintas.
- **Experiencia de usuario más fluida.** Al no recargar la página, la app responde más rápido y se comporta como una aplicación real.

La limitación principal es que la URL no cambia al navegar entre secciones y el botón de "atrás" del navegador no tiene el comportamiento esperado en una app multipágina.

---

### ¿Por qué localStorage en algunas partes?

El proyecto usa Firestore para todos los datos del usuario (gastos, ingresos, notas e historial mensual) y localStorage únicamente para preferencias de configuración y caché de sesión.

- **El día de cobro es una preferencia local** que no necesita sincronización entre dispositivos.
- **localStorage actúa como caché de rendimiento.** Al cargar los gastos desde Firestore, se guardan también en localStorage para que los gráficos puedan acceder a ellos de forma inmediata sin esperar nuevas llamadas a la base de datos.
- **Notas e historial mensual están en Firestore**, lo que garantiza que el usuario accede a sus datos desde cualquier dispositivo.

---

## ⚠️ DIFICULTADES ENCONTRADAS

### Error de inicialización: variable no disponible al arrancar (TDZ)

Uno de los errores más difíciles de identificar fue una regresión que impidió que la app arrancara después de añadir el gráfico de portfolio.

La variable `portfolioChartInstance` estaba declarada con `let` más abajo en el archivo que la función que la usaba. En JavaScript, las variables declaradas con `let` no pueden usarse antes de que su declaración sea evaluada (Temporal Dead Zone). Si el usuario tenía ingresos en localStorage, el script intentaba acceder a la variable antes de que existiera y se detenía por completo.

La solución fue mover la declaración de `portfolioChartInstance` al principio del archivo, antes de la primera llamada a la función que la necesitaba.

---

### Pérdida de datos de ingresos al recargar la página

Al añadir la funcionalidad de guardar los ingresos en Firestore, se introdujo un error de lógica: cada vez que el usuario iniciaba sesión, el código cargaba los ingresos desde Firestore y sobreescribía localStorage. Si el usuario tenía ingresos guardados solo en localStorage (antes de que se implementara Firebase para ingresos), al recargar se ponían a cero.

La solución fue añadir una condición: solo se actualiza localStorage con los datos de Firestore si la colección de ingresos en Firestore no está vacía.

---

### Error silencioso con Chart.js al actualizar los gráficos

Cuando `updateExpensesChart()` se llamaba varias veces seguidas, Chart.js lanzaba un error porque intentaba crear un nuevo gráfico sobre un canvas que ya tenía uno activo. El error no bloqueaba la app pero el gráfico dejaba de actualizarse correctamente.

La solución fue guardar la instancia del gráfico en una variable y destruirla antes de crear una nueva cada vez que se actualiza.

---

### Funcionalidades en HTML sin lógica en JavaScript

La sección de notas existía en el HTML con su textarea y su botón, y tenía estilos en el CSS, pero no había ninguna línea de JavaScript que guardara o mostrara notas. El usuario podía escribir y pulsar guardar, pero al recargar no quedaba nada.

Se resolvió añadiendo la lógica completa de notas con localStorage.

---

### API keys expuestas en el código cliente

Las claves de TwelveData y NewsData.io están escritas directamente en el archivo JavaScript, visible para cualquiera que abra las herramientas de desarrollador del navegador.

La solución correcta sería un backend propio que hiciera las llamadas a las APIs. En este proyecto no se ha podido resolver completamente por las limitaciones del stack elegido (sin servidor).

---

## ✅ CONCLUSIONES

### Qué he aprendido

- **Cómo funciona la autenticación real.** Entender cómo Firebase gestiona sesiones, cómo persiste el estado del usuario entre recargas y cómo se protege el acceso mediante el UID.
- **Diferencia entre código síncrono y asíncrono.** Aprendí a usar `async/await` de forma real al trabajar con llamadas a Firestore y a APIs externas.
- **Cómo el orden del código importa.** El error de la Temporal Dead Zone enseñó que JavaScript ejecuta el código de arriba abajo y que declarar una variable en el sitio equivocado puede romper toda la aplicación de forma silenciosa.
- **Cómo depurar errores reales.** Gran parte del desarrollo fue identificar por qué algo no funcionaba, leer el error en la consola, entender la causa y aplicar un fix concreto.
- **Que las decisiones de arquitectura tienen consecuencias.** Mezclar Firestore y localStorage para distintas partes de los datos creó problemas de sincronización que no habrían existido con un único sistema desde el principio.

---

### Qué haría diferente si empezara de nuevo

- **Centralizar el almacenamiento desde el principio.** El proyecto comenzó mezclando Firestore y localStorage para distintos tipos de datos. Durante el desarrollo se migró todo a Firestore, dejando localStorage solo como caché de rendimiento y preferencias de configuración.
- **Dividiría el JavaScript en varios archivos desde el principio.** Un archivo por módulo (Firebase, gastos, gráficos, etc.) en lugar de más de 700 líneas en un único archivo.
- **Plantearía la seguridad desde el diseño.** Las API keys expuestas son difíciles de resolver cuando la arquitectura ya está construida sin backend propio.

---

## 🚀 MEJORAS FUTURAS

### Formulario inicial de usuario
Al registrarse por primera vez, el usuario respondería preguntas sobre su situación financiera: ingresos, tipo de gastos habituales, objetivos de ahorro. Con esas respuestas, la app personalizaría los mensajes del resumen inteligente.

### Chatbot de orientación financiera
Un asistente dentro de la app con respuestas predefinidas según el estado financiero del usuario. No sería un chatbot libre, sino guiado: "¿cuánto debería ahorrar este mes?", "¿qué es un ETF?".

### Backend propio
Sustituir Firebase por un servidor propio con Node.js y Express. Esto permitiría gestionar las llamadas a las APIs externas desde el servidor (resolviendo el problema de las claves expuestas) y añadir validaciones del lado del servidor.

### Mayor seguridad
- Mover las claves de las APIs a variables de entorno en un servidor
- Configurar reglas de Firestore más estrictas con validación de formato
- Añadir límite de intentos de login

### Personalización
- Opción de cambiar la divisa (actualmente todo es DKK)
- Categorías de gastos (alimentación, transporte, ocio) con desglose visual
- Modo claro / modo oscuro

---

## 📚 BIBLIOGRAFÍA Y FUENTES

| Recurso | Uso en el proyecto |
|---|---|
| [Firebase Documentation](https://firebase.google.com/docs) | Autenticación de usuarios y base de datos Firestore |
| [Chart.js Documentation](https://www.chartjs.org/docs/) | Gráfico de barras mensual y gráfico donut de presupuesto |
| [CoinGecko API](https://www.coingecko.com/en/api/documentation) | Precios y variación en 24h de criptomonedas |
| [TwelveData API](https://twelvedata.com/docs) | Precios de ETFs e índices bursátiles |
| [NewsData.io API](https://newsdata.io/documentation) | Noticias del mercado financiero |
| [MDN Web Docs](https://developer.mozilla.org/) | `fetch`, `localStorage`, manipulación del DOM, `async/await` |
| [Google Fonts — Poppins](https://fonts.google.com/specimen/Poppins) | Tipografía del proyecto |

---

## 👨‍💻 Autor

**Gerard Vasquez Suing**
Estudiante de Desarrollo de Aplicaciones Multiplataforma (DAM) — CESUR
📧 gerard.startups@gmail.com
🌐 [github.com/GERI1004](https://github.com/GERI1004)
