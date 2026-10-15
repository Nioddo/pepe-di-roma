# Pepe Di Roma — Diseño v2: qué cambió y por qué

Este documento acompaña al **Mockup v2**, al **Wireframe v2**, al archivo de **Figma** y al **frontend React** (`frontend/`). Explica cada mejora sobre el boceto original (`diseño/mockup` y `diseño/wireframe`) y qué criterio la guió.

Las decisiones se tomaron con tres guías de diseño:

| Guía | Para qué se usó |
| --- | --- |
| **taste** (design-taste-frontend) | Composición, jerarquía y la idea que ordena el sistema. Se usó su inspector, que mide el sitio en un navegador real. |
| **impeccable** | Calidad mínima: estados completos, espaciado, contraste, accesibilidad y la diferencia entre pantallas públicas y de gestión. Se usó su detector automático de defectos. |
| **Emil Kowalski** (emil-design-eng) | Microinteracciones: qué se anima, con qué curva y cuánto dura. |

---

## 1. Lo que se respetó

- **Colores de la identidad**, sin cambios: blanco `#FFFFFF` de base, rosa salsa `#FCE8E8` de acompañamiento y rojo tomate `#CE1320` reservado para las acciones importantes.
- **Tipografías**: Anton en los títulos y Poppins en el texto.
- **Las 11 pantallas del boceto**, con su contenido y su estructura general: Inicio, Menú, Ingresar, Registrarse, Reservar, Mis reservas, Hacer pedido, Mis pedidos, Gestión de menú, Gestión de reservas y Gestión de pedidos.
- **La navegación por rol**: el visitante, el cliente y el personal del local ven menús distintos.
- **Los textos institucionales** del boceto. La carta es la del local, transcripta de sus tres cartas impresas.

## 2. El diagnóstico del boceto original

El inspector de *taste* midió el mockup original en Chrome: **11 errores y 4 advertencias**. Los principales:

- Etiquetas chiquitas en mayúsculas encima de cada título ("SPECIALITÀ DELLA CASA", "LA NOSTRA STORIA"). Es el rasgo más típico de una página genérica.
- El titular de portada bajaba a 5 renglones en el teléfono, y en mobile había texto tapado.
- 11 tamaños de letra distintos (lo sano son unos 5) y 3 familias tipográficas, contando una monoespaciada que se colaba.
- Degradados, sombras en elementos quietos y líneas finas de separación.
- Cuatro tarjetas iguales en fila.
- Ningún elemento con movimiento.

**Resultado de la v2: 0 errores.** Quedan 2 advertencias, ambas justificadas:
1. **Texto blanco sobre el rojo de marca**, con contraste 5,62:1. Es el par fijo de la identidad y pasa AA.
2. **No hay video.** No existe un clip real del local, y uno de banco de imágenes lo falsearía.

## 3. La idea que ordena todo: el arco

**Guía: taste.** Una página genérica se arma con decisiones por defecto. Esta se arma con una forma tomada del propio local: **el arco de medio punto**. Cada letra del logotipo de Pepe Di Roma está dibujada con arcos sobre astas rectas, y el monograma "DI" es literalmente un pórtico.

Ese arco aparece en:

- el **hero**, a escala enorme, recortado por el borde de la pantalla, con un arco rojo plano detrás (el par blanco/rojo de la marca);
- las **fotos** (recortadas con forma de arco), el **logo** del encabezado, las **mesas** del mapa del salón y el **carrito**;
- la **viñeta** de cada título de sección y la marca de los **avisos**;
- el **papel de la caja**: el arco repetido tono sobre tono, como el papel que forra las cajas de pasta (`diseño/referencias`);
- el **pie de página**, que arma "PEPE DI ROMA" con bloques en arco, como cajas blancas sobre el rojo del packaging.

## 4. Diferenciación entre bloques

En la primera versión del rediseño todo quedaba en un mismo plano blanco y no se distinguía dónde terminaba un bloque y empezaba otro. **Guías: impeccable (agrupar por significado y separar grupos distintos con un cambio de superficie, no con más cajas) y taste (cada sección puede cambiar el color de todo su fondo).**

- **Cada pantalla abre con una banda propia** sobre el papel de la caja, con el título y la bajada, separada del contenido. En las pantallas de gestión la banda es más baja y lisa, porque ahí manda la tarea.
- **Inicio alterna suelos**: hero blanco, "Productos estrella" sobre papel rosa, "Nuestras cartas" en blanco, "Sobre nosotros" en un panel rojo, la banda "Reservar" en rosa y el pie en rojo. Ningún bloque se confunde con el de al lado.
- **Menú**: la hoja blanca de la carta apoyada sobre el **rojo plano del packaging**, como en las fotos de la caja sobre la mesa roja.
- **Hacer pedido**: la carta en blanco a la izquierda y el carrito como **la caja roja** del packaging a la derecha.
- **Reservar**: el formulario en una hoja blanca con borde y el mapa del salón en un panel rosa.
- **Gestión**: maestro–detalle. La lista de secciones es una segunda capa (rosa) y el detalle va en blanco.

## 5. Pantalla por pantalla

### Inicio
- **Titular** de 8 palabras en 5 renglones → "Pastas hechas / a la vista", siempre en 2 renglones. "Todos los días" y "Villa Devoto" pasaron a la bajada. *taste*
- **Etiquetas sobre los títulos**: eliminadas, porque el título se sostiene solo. *taste, impeccable*
- **Productos estrella**: de 4 tarjetas iguales a un **índice con vista previa**. Al pasar el mouse por un plato (o enfocarlo con el teclado) cambia la foto y se ven el precio y la descripción. Son los platos que tienen foto real en la API. *taste* (es el movimiento firma de la dirección elegida)
- **Bloque nuevo, "Nuestras cartas"**: las tres cartas como enlaces grandes, cada uno abre su pestaña en el menú. Ayuda a entender que el local tiene tres cartas. *impeccable* (que todo lo importante se encuentre en segundos)
- **Sobre nosotros**: sobre el rojo plano del packaging, con la bajada real de la marca, "Amore eterno per la pasta", que aparece impresa en las cajas. El carrusel avanza solo, se pausa con el mouse o el foco, y respeta "reducir movimiento".
- **Banda final**: "RESERVAR" ocupa todo el ancho y toda la banda es el enlace. Va en rosa para separarse del pie rojo.

### Menú
- **Es la carta impresa del local.** Rojo sobre blanco, el logotipo arriba y títulos con su aclaración ("PASTE RIPIENE -pastas rellenas-"). Cada plato lleva la descripción debajo, la medida al lado ("-pocillo-", "x505ml") y el precio en su columna con el "$" alineado. Los íconos de ají (picante) y hoja (vegano) son los mismos de la carta.
- **Tipografía de la carta**: la letra geométrica de las cartas impresas es propia de la marca y no existe como fuente web. **Baumans** (Google Fonts) es la más parecida: N y M en arco, R con la pata curva. Se usa **solo dentro de la carta**; el resto del sitio sigue con Anton y Poppins.
- **"Tempo di cottura"**, igual que en la carta para llevar: las **15 siluetas reales** de las pastas, recortadas de la carta, con sus tiempos de cocción y los bloques Istruzioni, Come ti piace, Conservazione y Porzione. Las etiquetas son texto HTML, no parte de la imagen, para que se lean con lector de pantalla.
- **Mejoras propias de la web**:
  - pestañas para las tres cartas (se recorren con las flechas del teclado);
  - la carta elegida queda en la dirección (`/menu?carta=colazione`), así se puede compartir;
  - índice "En esta carta" para saltar a cada sección;
  - referencia de los íconos;
  - acceso directo a "Hacer pedido".

### Ingresar y Registrarse
- **Label visible** en cada campo y error debajo de cada uno. El foco va al primer campo con error. *impeccable*
- **Ingreso con email y DNI**: el backend no guarda contraseñas, así que pedir una habría sido engañoso. El DNI se valida contra el de la cuenta.
- **Al venir de una pantalla protegida**, aparece el aviso "Necesitás iniciar sesión para continuar" y, después de ingresar, vuelve a la pantalla que se quería abrir.

### Reservar
- **Regla nueva**, que reemplaza el viejo "5–6 / más de 6":
  - **hasta 4 personas** eligen la mesa en el mapa;
  - **de 5 a 12** no eligen: la reserva se guarda sin mesa y el local la asigna desde Gestión de reservas (puede unir mesas);
  - **más de 12** no pueden reservar online: se muestra el email y el teléfono del local, y el botón queda deshabilitado.
- **Mapa del salón** armado con las posiciones de las mesas de la API. Cada mesa es un arco con cuatro estados: disponible, ocupada en ese horario, elegida y no disponible para este grupo. Las bloqueadas siguen siendo enfocables, para que el lector de pantalla explique por qué no se pueden elegir.
- **La misma pantalla sirve para modificar** una reserva existente.

### Mis reservas y Mis pedidos
- **Un solo patrón**, tarjeta + estado + acciones. La fecha (o el número de pedido) va dentro de un arco.
- **Cancelar siempre pasa por un modal** ("¿Seguro que querés cancelar…?"). El foco arranca en "Volver", que es la opción segura.
- **Estados vacíos que enseñan** qué hacer y llevan a la acción ("Reservá una mesa", "Hacé tu primer pedido").

### Hacer pedido
- **Se arma desde la carta misma**: cada línea suma un `+` / `−`. Es el mismo componente que el menú, reutilizado.
- **El carrito es la caja roja**, con el total en grande. Si el envío es a domicilio, la dirección es obligatoria y el error aparece debajo del campo.
- **Los cuatro medios de pago que acepta el backend**: efectivo, débito, crédito y transferencia.

### Encuesta: "¿Qué te pareció?" (nueva)
- **No hace falta cuenta para opinar.** Solo Reservar y Hacer pedido piden iniciar sesión; el resto del sitio, la encuesta incluida, es abierto.
- **El puntaje se da con los arcos del logotipo, no con estrellas.** Cinco arcos que se llenan de rojo en cascada (35 ms entre uno y otro) al elegir, y todos juntos al bajar el puntaje. *taste (la idea sale del sujeto; test del competidor) + Emil (formulario de uso ocasional: se permite un detalle de placer)*
- Son **radios nativos**: se eligen con el mouse, con el dedo o con las flechas del teclado, y el lector de pantalla dice "4 de 5, muy bien".
- **Como la encuesta real del local** (el relevamiento muestra que hoy usan un Google Forms con atención, mozo, platos, espacio y sugerencia): además del puntaje general, se puede puntuar **atención, platos y el lugar** con arcos chicos y decir **quién te atendió**. Todo opcional.
- **"¿Qué comiste?"** ofrece primero los platos de los pedidos del cliente (si tiene cuenta) y después cada carta.
- **Mensaje** con contador de caracteres y **firma** (sugerida desde el email si hay sesión). El email nunca se publica.
- Al publicar, el formulario se reemplaza por un agradecimiento en el rojo del packaging.
- Al costado: con sesión, **"Tus opiniones"** (con la respuesta del local y la opción de borrarlas); sin sesión, **"Lo que dicen otros"** con las mejores.

### Nuestras calificaciones (portada, nueva)
- **Arriba, el promedio como un precio de la carta** (grande, rojo, en Anton) con los arcos y la cantidad de opiniones, y debajo el **dato público de Google** (4,5 con 1.507 reseñas, octubre de 2026) con enlace a la ficha, para que se pueda verificar.
- **Abajo, un carrusel horizontal con las mejores opiniones** (las de más puntaje y, entre iguales, las más nuevas). Cada tarjeta es un arco del logotipo en rosa salsa.
  - Corre hasta el borde de la pantalla: la tarjeta cortada a la derecha avisa que hay más. *taste*
  - Se desliza con el dedo, la rueda, las flechas del teclado (la pista es enfocable) o los botones, que se apagan en los extremos. En el teléfono los botones se ocultan: se desliza con el dedo. *impeccable (adapt)*
  - Encaje por tarjeta (scroll-snap) y desplazamiento suave, salvo con "reducir movimiento". *Emil*
- **Sin opiniones inventadas.** El sistema arranca vacío: la sección muestra "Todavía nadie opinó" y cinco arcos de altura creciente que abren la encuesta con ese puntaje ya elegido.
- Las opiniones ocultas por el local no se muestran ni cuentan para el promedio.

### Lo que pasa en Pepe (portada, nueva)
- Las costumbres reales de la casa, sacadas del relevamiento: **Gnocchi del 29**, **Ragù napoletano** los domingos al mediodía, la **focaccia de 72 horas** con manteca del día y la **pasta para llevar** en porciones de 200 g y 180 g.
- Cada una empieza por **cuándo pasa**, en rojo y grande, porque es lo que el cliente necesita saber. *taste (la idea sale de los rituales del lugar)*
- Banda rosa de punta a punta, columnas a distinta altura para que no se lean como tarjetas iguales; en el teléfono pasa a una lista con la foto chica al costado.
- Todo se edita en Textos y fotos.

### Dónde estamos (portada, nueva)
- **La dirección real en grande**: Av. Francisco Beiró 3701, Villa Devoto, a pasos de la estación Devoto y a unas cuadras de Plaza Arenales.
- **El mapa de Google embebido** es la imagen dominante, recortado con el arco; el botón **"Cómo llegar"** abre la ruta en Google Maps.
- Horario real, WhatsApp, accesibilidad (entrada y baño para silla de ruedas) y la foto de la puerta roja en arco.
- En tablet el mapa pasa abajo a todo el ancho; en el teléfono la foto sale y queda el mapa. *impeccable (adapt)*

### Gestión: el admin edita todo
Todas las pantallas de gestión comparten una **franja en tinta** con siete pestañas (Pedidos, Reservas, Carta, Salón, Textos y fotos, Opiniones, Usuarios): marca que se está en la trastienda y permite saltar de una a otra. En el teléfono se desliza de costado.

La edición se hace **en el lugar**: "Editar" abre el formulario debajo de la misma fila, lleva el foco a su título y se cierra con Escape o Cancelar. No hay modales para editar: el modal queda solo para confirmar borrados. *impeccable (modo Operate: el modal como primera opción suele ser pereza)*

Para el personal, cada bloque de la portada tiene un atajo **"Editar"** (en tinta, chico, para no competir con las acciones del cliente) que lleva directo al lugar donde se cambia.

#### Carta
- **Maestro–detalle**: a la izquierda las secciones de la carta elegida, a la derecha la sección con su tabla. *impeccable*
- **Editar un plato**: nombre, precio, medida, descripción, foto (del catálogo real o un enlace, con vista previa en arco), etiquetas, si es **producto estrella** y en qué sección va (puede pasar a otra carta).
- **Etiquetas como interruptores** en la tabla: vegano, sin TACC, picante y **Estrella**. La Estrella decide qué platos salen en "Productos estrella" de la portada.
- **Orden**: flechas para subir y bajar cada plato dentro de su sección y cada sección dentro de la carta.
- **Editar una sección**: título, aclaración, grupo, nota al pie y carta.
- Alta y baja de platos y secciones, siempre con confirmación al borrar.

#### Pedidos
- **El estado se cambia desde su propia columna**, con un selector que tiene los cinco estados y toma el color del estado. También quedan los botones rápidos (Confirmar → Enviar o "Listo para retirar" → Entregado).
- **Editar**: estado, modalidad, forma de pago, dirección, si está pagado y **qué lleva** (sumar, quitar o cambiar cantidades); el total se recalcula con los precios del día.

#### Reservas
- Asignar mesa desde la fila, confirmar, cancelar y eliminar.
- **Editar**: cliente, fecha, horario, personas, mesa (avisa si está ocupada a esa hora) y estado. Respeta la regla: hasta 4 personas la reserva necesita mesa.

#### Salón (nueva)
- **El plano se edita a mano**: cada mesa se **arrastra** a otra baldosa (mouse, lápiz o dedo, con captura del puntero; un segundo dedo no roba el arrastre). Si se suelta sobre otra mesa, cambian de lugar. *Emil (el transform se aplica directo al elemento, sin re-renderizar el plano en cada cuadro)*
- **Con teclado**: se enfoca la mesa y las flechas la mueven de a una baldosa. Cada movimiento se anuncia al lector de pantalla.
- **Panel lateral**: número, capacidad, columna y fila de la mesa elegida; agregar mesa (va al primer lugar libre) y eliminar (con confirmación; el backend no deja borrar una mesa con reservas activas).
- **Tamaño del plano** (columnas y filas): no deja achicar si quedaría una mesa afuera. El mapa de Reservar usa este mismo plano.

#### Textos y fotos (nueva)
- **Todo lo que dice el sitio fuera de la carta**: portada, "Productos estrella", Nuestras cartas, Sobre nosotros y su carrusel, la banda Reservar, las fotos de Ingresar y Registrarse, contacto, pie, nombres y pies de las tres cartas, y el cuadro "Tempo di cottura" con el tiempo de cada pasta.
- Agrupado **por la pantalla donde aparece**, con un índice al costado. Cada bloque se guarda por separado y avisa "N cambios sin guardar" en un pie que queda pegado abajo.
- Las fotos se eligen del catálogo o con un enlace, con vista previa.
- Una clave que se agregue por la API y no tenga lugar propio aparece en "Otros": nada queda sin poder editarse.

#### Opiniones (nueva)
- Responder ("Pepe responde"), ocultar o volver a mostrar en la portada, corregir puntaje, mensaje, firma, plato o fecha, y eliminar (con confirmación).

#### Pedidos y reservas: datos de contacto
- **Reservar** pide **a nombre de quién** va la reserva y un **teléfono** (se sugieren los de la última reserva del cliente, para no volver a escribirlos).
- **Hacer pedido** pide un **teléfono** y suma **indicaciones** opcionales (timbre, piso, a qué hora pasa, algo del pedido). Cada pedido guarda además **fecha y hora**.
- **El personal no hace pedidos**: no ve "Hacer pedido", la pantalla le explica por qué y lo lleva a Gestión de pedidos, y la API lo rechaza (403).
- Gestión de pedidos y de reservas muestran nombre, teléfono (se puede tocar para llamar) e indicaciones, y se editan desde la fila.
- Como ahora hay meses de movimiento, las tablas arrancan en lo que necesita atención (**pedidos en curso / de hoy**; **reservas próximas / de hoy / sin confirmar**) y lo anterior se consulta en el Historial.

#### Métricas (nueva)
*Guía dataviz: elegir la forma antes que el color, una sola escala de un tono validada con su script, marcas finas, tooltip y tabla en cada gráfico.*
- **Un filtro de período arriba** (mes o todo el historial) que afecta a todo el panel. El mes en curso se compara con **los mismos días** del mes anterior, para no comparar medio mes contra un mes entero.
- **Indicadores**: ventas, pedidos, ticket promedio, reservas, personas que vinieron y porcentaje de reservas canceladas, cada uno con su variación (con flecha y texto, no solo color; en cancelaciones subir es malo).
- **Platos más pedidos**: ranking por unidades con el primero en rojo y el resto en gris (énfasis: la noticia es cuál gana).
- **Cuándo se reserva**: mapa de calor día de la semana × hora, en una escala de un solo tono. El primer intento falló el validador (el escalón más claro casi no se distinguía del fondo); la escala final pasa los cuatro controles. Arriba dice en palabras el día y la hora pico.
- **Ventas día por día** del mes, con el mejor día marcado.
- **Cómo compran**: retiro o envío y medio de pago (con el recordatorio del 10 % en efectivo).
- **Lo que dicen las opiniones**: el **plato con peor opinión** y el mejor (si eligieron qué comieron, se usa el puntaje de "Platos"), y los promedios de atención, platos y el lugar.
- **Clientes que más vuelven**: pedidos, reservas y cuánto gastaron.
- Cada gráfico tiene **"Ver como tabla"** y un tooltip que aparece igual con el mouse que con el foco del teclado.

#### Historial (nueva)
- **El mes en un calendario**: cada día dice cuántas reservas y pedidos tuvo (sin contar cancelados); el día de hoy va subrayado. Arriba, el resumen del mes.
- **Al elegir un día**, al costado aparecen sus reservas (por hora) y sus pedidos, y cada uno **se abre en el lugar** con todo el detalle: teléfono, mesa, cuenta, qué llevó, pago, envío e indicaciones.
- Se navega con los botones de mes o con el **teclado**: flechas para cambiar de día, arriba y abajo para cambiar de semana. El día elegido queda en la dirección (`?dia=2026-10-10`), así se puede compartir.
- En el teléfono cada día muestra puntos en vez de texto, y el detalle pasa abajo del calendario.

#### Usuarios (nueva, solo ADMIN)
- Crear cuentas (por ejemplo, empleados), corregir email y DNI, cambiar el rol y eliminar (con confirmación).
- El admin no puede borrarse a sí mismo ni quitarse el rol de administrador.

## 5 bis. Datos reales del local (Informe de relevamiento)

El informe de `diseño/identidad` reemplazó datos que el boceto no tenía o que había que suponer:

| Antes | Ahora (fuente: relevamiento del 14/10/2026) |
| --- | --- |
| Martes a domingo, 12 a 15 h y 20 a 24 h | Todos los días de 8:30 a 00 h; viernes, sábados y vísperas de feriado hasta la 1 |
| Turnos de reserva de mediodía y noche | Turnos cada 30 min desde las 8:30; el último, 2 h antes del cierre (hasta las 23 h los viernes y sábados) |
| Teléfono de ejemplo | WhatsApp real +54 9 11 6113-8175 (con enlace directo) |
| Un email que no figura en ninguna fuente | Se quitó; el campo queda en Textos y fotos por si el local lo quiere cargar |
| Un texto genérico en "Sobre nosotros" | La historia real: Pepe llegó de Roma a los 8 años, abrieron en diciembre de 2024, el tiramisù es la receta de Reggina, su hermana |
| Sin ubicación | Dirección, estación Devoto, Plaza Arenales, accesibilidad y mapa |
| — | Instagram y PedidosYa enlazados en el pie |

Además se sumaron las **37 fotos nuevas** del local que no son flyers con texto (platos, cocina, la nonna, el cocinero y la fachada), achicadas para la web. Las 12 que son piezas con texto o fechas (pop-ups, "29", promociones) quedaron afuera del catálogo.

## 5 ter. Teléfono y tablet

Se revisó cada pantalla a 390, 768, 1024 y 1440 px, con un control automático de desborde horizontal. *impeccable (adapt)*

- **Header**: el logotipo en letras (el de las cartas, en rojo y más grande) reemplaza al logo chico. En el teléfono queda en una sola fila con el menú; los botones de cuenta viajan adentro del menú desplegable.
- **Pestañas de las cartas**: en el teléfono pasan a una fila que se desliza, solo con los nombres.
- **Menú**: el índice de secciones queda **pegado arriba** mientras se baja por 260 platos, marca la sección que se está leyendo y se desliza solo para mostrarla. Las referencias (picante, vegano) quedan arriba de la hoja.
- **Hacer pedido**: en el teléfono la caja queda al final de 100 platos, así que una **barra fija abajo**, al alcance del pulgar, muestra cuántos platos y el total, con "Ver pedido". Se oculta cuando la caja ya está a la vista.
- **Tablas de gestión**: en el teléfono cada fila pasa a ser una tarjeta con el nombre de cada dato arriba.
- **Grids**: todas las columnas únicas usan `minmax(0, 1fr)`, para que un contenido que se desliza (pestañas, índice) no ensanche la página.

## 6. Sistema de componentes

Todos están en `frontend/src/components`, cada uno con su CSS:

| Componente | Variantes y estados |
| --- | --- |
| Botón (y botón-enlace para navegar) | primario, secundario, peligro, peligro discreto, fantasma, inverso · normal, hover, presionado, foco, deshabilitado, cargando |
| Campo de texto / selector | label visible, ayuda, error debajo del campo, deshabilitado |
| Selector segmentado (toggle) | una opción activa |
| Casilla | marcada, desmarcada |
| Badge | vegano, sin TACC, estados de reserva y pedido |
| Carta (hoja, ítem, pestañas, Tempo di cottura) | con o sin `+` / `−` |
| Mapa del salón | disponible, ocupada, elegida, bloqueada |
| Editor del salón | baldosa libre, destino del arrastre, mesa elegida, mesa arrastrándose |
| Puntaje con arcos | selector (vacío, vista previa al pasar el mouse, elegido, error) y solo lectura (chico, grande, sobre rojo, medio arco) |
| Editor en el lugar | se abre debajo de una fila, foco en el título, cierra con Escape |
| Área de texto | con contador de caracteres |
| Barra de gestión | siete pestañas, la activa en rojo |
| Atajo "Editar" | solo para el personal |
| Tabla de gestión | filas, acciones, vacía, cargando |
| Tarjeta de registro | activa, apagada |
| Modal de confirmación | uno solo para toda la app |
| Notificación lateral (toast) | **un único componente** para éxito y error; cambia el ícono y el color. Nunca `alert()`. |
| Aviso en línea | marca, información, bloqueo |
| Estado vacío | con mensaje y acción |
| Skeleton | lista, bloque, hoja de carta |
| Encabezado de pantalla | banda con papel, banda de gestión, en línea |
| Header y footer | navegación por rol; en el teléfono la navegación se pliega detrás de un botón |

## 7. Movimiento

**Guía: Emil Kowalski.** Solo se anima lo que comunica algo, siempre rápido y siempre interrumpible:

- **Botones**: se encogen a 0,97 al presionarlos (160 ms) para confirmar que la interfaz escuchó.
- **Curvas**: fuertes y de salida rápida (`cubic-bezier(.23, 1, .32, 1)`). Nunca `ease-in`, nunca duraciones de más de 300 ms en la interfaz.
- **Modal**: escala desde 0,95, nunca desde 0, y desde el centro, porque no tiene un disparador fijo.
- **Notificaciones**: entran y salen por el mismo lado, con transiciones (no keyframes) para que varias seguidas se acomoden sin saltos. Se pausan con el mouse.
- **Entradas escalonadas** (70 ms entre elementos) solo en Inicio. Las pantallas de gestión no se animan al cargar: el que trabaja no quiere mirar una coreografía. *impeccable*
- **Hover** solo en dispositivos con mouse, y todo respeta "reducir movimiento".
- **Puntaje**: los arcos se llenan en cascada al subir el puntaje y se vacían todos juntos al bajarlo (lento donde el usuario decide, rápido donde el sistema responde).
- **Arrastrar mesas**: la mesa se levanta (escala 1,04 y una sombra, porque de verdad flota) y la baldosa de destino se marca mientras se arrastra.
- **Editor en el lugar**: entra en 200 ms desde 6 px más arriba; sin animación con "reducir movimiento".

## 8. Accesibilidad

| Par de colores | Contraste |
| --- | --- |
| Rojo tomate sobre blanco | 5,62:1 (AA) |
| Rojo tomate sobre rosa salsa | 4,77:1 (AA) |
| Blanco sobre rojo tomate | 5,62:1 (AA) |
| Rojo de la carta sobre blanco | 5,95:1 (AA) |
| Rojo oscuro (errores, precios) sobre rosa | 6,51:1 (AA) |
| Gris de apoyo sobre blanco | 7,73:1 (AA) |

Además:
- **Formularios**: cada campo tiene label visible asociado, y el error queda vinculado al campo con `aria-describedby`.
- **Semántica**: botones para las acciones y enlaces para la navegación.
- **Imágenes**: texto alternativo en todas; las decorativas se ocultan al lector.
- **Navegación con teclado**: foco visible en todo, enlace "Saltar al contenido", y al cambiar de pantalla el foco va al título.
- **Modal**: nativo (`<dialog>`), atrapa el foco, cierra con Escape y devuelve el foco al botón que lo abrió.
- **Superficies del navegador**: scrollbar, cursor de texto, controles nativos y subrayados con los colores de la marca. *impeccable*

## 9. Cambios en el backend

Hicieron falta para que la carta y la regla de reservas se guarden de verdad:

- **`Plato`**: suma `descripcion`, `medida` y `picante`.
- **`Seccion`**: suma `carta` (RISTORANTE, PER_PORTARE_VIA o COLAZIONE), `grupo` (I Vini, Dolce, Salato), `subtitulo` y `nota`.
- **Nombre de plato**: ya no tiene que ser único en todo el sistema, porque el mismo vino o el mismo café figura en dos cartas con precios distintos.
- **Reservas**: hasta 4 personas exigen mesa con capacidad suficiente; de 5 a 12 se aceptan sin mesa (el local la asigna después y puede unir mesas); más de 12 se rechazan.
- **Edición total por el admin**:
  - **`Contenido`** (nuevo, `/api/contenido`): cada texto y foto del sitio es un par clave–valor (90 claves: portada, cards, contacto, cartas, Tempo di cottura, tamaño del plano del salón…). CRUD completo.
  - **`Calificacion`** (nuevo, `/api/calificaciones`): `usuarioId`, `firma`, `puntaje` (1 a 5), `mensaje` (hasta 500 caracteres), `fecha`, `platoId` opcional, `visible` y `respuesta` del local. CRUD completo con validaciones. No se puede eliminar un usuario que tenga opiniones.
  - **`Plato.destacado`**: marca los productos estrella de la portada (seis vienen marcados, los mismos que mostraba la portada).
  - Las calificaciones **arrancan vacías**: no se inventan opiniones. Se pueden dejar **sin cuenta** (`usuarioId` opcional) y guardan también **atención, comida y espacio** (1 a 5, opcionales) y **quién atendió**, como la encuesta real del local.
  - **Reserva** suma `nombre` y `telefono` (obligatorios); **Pedido** suma `telefono` (obligatorio), `indicaciones` (opcional) y `creadoEn` (fecha y hora en que se hizo). Los pedidos de cuentas que no son de cliente se rechazan con **403**.
  - **Historial de prueba** (`data/historialSeed.js`): para que Métricas e Historial tengan algo que mostrar, el backend arranca con 474 reservas y 352 pedidos del 1/8 al 31/10/2026, generados con una semilla fija (siempre los mismos). Los pedidos usan platos reales de la carta para llevar con más peso en los más vendidos según el relevamiento; las reservas cargan más los viernes, sábados y domingos y nunca se superponen en una mesa. Son **datos de prueba**: los clientes y teléfonos son ficticios. Las opiniones no se generan: siguen arrancando vacías.
  - **Contenido** suma la ubicación, los rituales, el dato de Google, el WhatsApp, Instagram, PedidosYa y el horario extendido (132 claves).
- **Datos semilla**:
  - las tres cartas reales (259 platos en 39 secciones);
  - las 6 mesas del boceto (cuatro de 4 y dos de 6);
  - las cuentas de prueba del boceto: `cliente@pepediroma.com.ar` (DNI 38123456) y `admin@pepediroma.com.ar` (DNI 30111222);
  - reservas y pedidos hechos con platos reales.

## 10. Correcciones sobre las cartas impresas

Al transcribir se corrigieron errores de tipeo evidentes: Facaccia → Focaccia, Agnollotti → Agnolotti, Capelletti Osobuco → Cappelletti Ossobuco, Mezze Manicche → Mezze Maniche, Amatricciana → Amatriciana, "rayado" → "rallado", "meremlada" → "mermelada", "a la planca" → "a la plancha" y "guancciale" → "guanciale".

En la carta para llevar, el segundo bloque titulado "Ottima conservazione" (el de los gramos por porción) pasó a llamarse "Porzione".

## 11. Cómo ver cada entregable

- **Mockup v2** (`Mockup_v2_Pepe_Di_Roma.html`) y **Wireframe v2** (`Wireframe_v2_Pepe_Di_Roma.html`): se abren con doble clic.
  - Son la misma app React del frontend, con una API simulada adentro, así que se comportan igual que el producto real.
  - El botón de abajo a la izquierda abre un **panel de revisión**: cambiar de rol (visitante, cliente, admin) y forzar carga lenta, listas vacías o servidor caído, para ver todos los estados.
  - **"Opiniones de ejemplo"** carga tres opiniones rotuladas como ejemplo para revisar la portada con calificaciones. Solo existen en el mockup; la app real arranca sin opiniones.
  - Se regeneran con `npm run diseno` dentro de `frontend/`.
- **Figma** (https://www.figma.com/design/C9SEG21XR03MDt558atnom):
  - **Componentes**: variables de color, radio y espaciado (con su `var(--…)` del código), estilos de texto Anton, Poppins y Baumans, y los componentes con variantes: botón, badge, campo, puntaje con arcos (selector y lectura), mesa, toast, barra de gestión, ítem de carta, opinión, header por rol, encabezado de pantalla, footer, logo, íconos y las 13 fotos reales.
  - **Mockup**: Inicio (con "Nuestras calificaciones") y Menú, armados con instancias editables.
  - **Pendiente**: el resto de las pantallas y la página Wireframe. El plan gratuito de Figma permite 20 operaciones por mes desde la integración y se agotaron; mientras tanto, el mockup y el wireframe completos son los dos HTML de esta carpeta.
- **Frontend real**: ver `frontend/README.md`.
