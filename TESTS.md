# Pruebas manuales — Doctor en Economía

Estas pruebas se realizaron de forma manual en el navegador, comprobando el comportamiento esperado de cada funcionalidad principal de la aplicación.

---

## Autenticación

| # | Acción | Resultado esperado | Resultado obtenido |
|---|--------|-------------------|-------------------|
| 1 | Abrir la app sin sesión iniciada | Se muestra la pantalla de login; el dashboard está oculto | ✅ Correcto |
| 2 | Hacer clic en "Iniciar sesión" con campos vacíos | Aparece el mensaje "Introduce el correo y la contraseña" | ✅ Correcto |
| 3 | Introducir un correo que no existe | Aparece "No existe ninguna cuenta con ese correo" | ✅ Correcto |
| 4 | Introducir contraseña incorrecta | Aparece "Contraseña incorrecta. Inténtalo de nuevo" | ✅ Correcto |
| 5 | Iniciar sesión con credenciales correctas | Se oculta el login y se muestra el dashboard completo | ✅ Correcto |
| 6 | Crear una cuenta nueva con correo y contraseña válidos | Aparece "¡Cuenta creada correctamente!" y se accede al dashboard | ✅ Correcto |
| 7 | Intentar crear cuenta con un correo ya registrado | Aparece "Este correo ya está registrado. Inicia sesión" | ✅ Correcto |
| 8 | Intentar crear cuenta con contraseña de menos de 6 caracteres | Aparece "La contraseña debe tener al menos 6 caracteres" | ✅ Correcto |
| 9 | Recargar la página con sesión activa | La sesión se mantiene y se carga el dashboard directamente | ✅ Correcto |
| 10 | Hacer clic en "Cerrar sesión" | Se cierra la sesión y aparece la pantalla de login | ✅ Correcto |

---

## Gastos

| # | Acción | Resultado esperado | Resultado obtenido |
|---|--------|-------------------|-------------------|
| 11 | Añadir un gasto con descripción e importe válidos | El gasto aparece en la lista con el botón de eliminar | ✅ Correcto |
| 12 | Comprobar el gasto en Firebase | El documento aparece en la colección `expenses` del usuario en Firestore | ✅ Correcto |
| 13 | El total de gastos se actualiza | El total mostrado en pantalla aumenta con el importe añadido | ✅ Correcto |
| 14 | Intentar añadir un gasto sin descripción | Aparece "Introduce una descripción y un importe válidos" | ✅ Correcto |
| 15 | Intentar añadir un gasto con importe 0 o negativo | Aparece "Introduce una descripción y un importe válidos" | ✅ Correcto |
| 16 | Eliminar un gasto | El gasto desaparece de la lista y el total se actualiza | ✅ Correcto |
| 17 | Comprobar el gasto eliminado en Firebase | El documento ya no aparece en Firestore | ✅ Correcto |
| 18 | Recargar la página tras añadir gastos | Los gastos siguen apareciendo en la lista al volver a cargar | ✅ Correcto |

---

## Ingresos y balance

| # | Acción | Resultado esperado | Resultado obtenido |
|---|--------|-------------------|-------------------|
| 19 | Añadir un ingreso válido | Los ingresos totales aumentan y el balance se recalcula | ✅ Correcto |
| 20 | Comprobar el ingreso en Firebase | El documento aparece en la colección `income` del usuario | ✅ Correcto |
| 21 | Recargar la página tras añadir un ingreso | Los ingresos se mantienen al volver a cargar | ✅ Correcto |
| 22 | Intentar añadir un ingreso con importe 0 | Aparece "Introduce un importe válido" | ✅ Correcto |
| 23 | Verificar el cálculo del balance | Balance = Ingresos totales − Gastos totales | ✅ Correcto |

---

## Gráficos

| # | Acción | Resultado esperado | Resultado obtenido |
|---|--------|-------------------|-------------------|
| 24 | Añadir gastos de meses distintos | El gráfico de barras muestra los gastos agrupados por mes | ✅ Correcto |
| 25 | Añadir ingresos y gastos | El gráfico donut muestra la proporción entre gastos y ahorro | ✅ Correcto |
| 26 | Acceder sin ingresos añadidos | El gráfico donut aparece vacío, sin datos inventados | ✅ Correcto |
| 27 | Eliminar un gasto | El gráfico de barras se actualiza automáticamente | ✅ Correcto |

---

## Notas

| # | Acción | Resultado esperado | Resultado obtenido |
|---|--------|-------------------|-------------------|
| 28 | Escribir una nota y guardarla | La nota aparece con la fecha y el botón de eliminar | ✅ Correcto |
| 29 | Recargar la página | Las notas siguen apareciendo | ✅ Correcto |
| 30 | Eliminar una nota | La nota desaparece de la lista | ✅ Correcto |
| 31 | Intentar guardar una nota vacía | Aparece "Escribe algo antes de guardar" | ✅ Correcto |

---

## Día de cobro

| # | Acción | Resultado esperado | Resultado obtenido |
|---|--------|-------------------|-------------------|
| 32 | Cambiar el día de cobro a un número entre 1 y 31 | El contador de días hasta la nómina se actualiza | ✅ Correcto |
| 33 | Recargar la página | El día de cobro configurado se mantiene | ✅ Correcto |
| 34 | Intentar guardar un día fuera de rango (0 o 32) | Aparece "Introduce un día válido entre 1 y 31" | ✅ Correcto |

---

## Historial y exportación

| # | Acción | Resultado esperado | Resultado obtenido |
|---|--------|-------------------|-------------------|
| 35 | Guardar el mes actual con datos de ingresos y gastos | Aparece una fila en la tabla con los datos correctos | ✅ Correcto |
| 36 | Intentar guardar el mismo mes dos veces | Aparece "Los datos de este mes ya están guardados" | ✅ Correcto |
| 37 | Exportar el historial a CSV | Se descarga un archivo con las columnas correctas en español | ✅ Correcto |
| 38 | Intentar exportar sin historial guardado | Aparece "No hay datos para exportar todavía" | ✅ Correcto |

---

## Mercado y noticias

| # | Acción | Resultado esperado | Resultado obtenido |
|---|--------|-------------------|-------------------|
| 39 | Cargar la app con conexión a internet | Los precios de criptomonedas y ETFs aparecen en pantalla | ✅ Correcto |
| 40 | Hacer clic en "Actualizar noticias" | Aparecen artículos recientes del sector financiero | ✅ Correcto |
| 41 | Cargar la app sin conexión | Aparece un mensaje de error en la sección de mercado | ✅ Correcto |

---

## Resumen de resultados

| Total de pruebas | Superadas | Fallidas |
|---|---|---|
| 41 | 41 | 0 |
