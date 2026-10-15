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

### Gestión de menú
- **Maestro–detalle**: con 259 platos, una sola tabla no se puede recorrer. A la izquierda van las secciones de la carta elegida, a la derecha la sección con su tabla. *impeccable (pantallas de gestión: densidad y estructura predecibles)*
- **Alta de plato** con nombre, precio, medida, descripción, foto (del catálogo real) y etiquetas.
- **Etiquetas como interruptores**: vegano, sin TACC y picante. Apagadas se ven grises y tachadas.
- **Eliminar plato o sección siempre pide confirmación.**

### Gestión de reservas y de pedidos
- **Tablas reales**, con encabezados para lectores de pantalla y desplazamiento lateral en el teléfono.
- **Reservas**: confirmar, cancelar, eliminar y asignar o cambiar mesa desde la propia fila.
- **Pedidos**: avanzar el estado (Confirmar → Enviar o "Listo para retirar" → Entregado), marcar como pagado, cancelar y eliminar.

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
  - Se regeneran con `npm run diseno` dentro de `frontend/`.
- **Frontend real**: ver `frontend/README.md`.
