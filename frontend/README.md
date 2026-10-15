# Pepe Di Roma — Frontend

Interfaz del sistema de Pepe Di Roma (fábrica de pastas artesanales, Villa Devoto) hecha con **React + TypeScript + Vite**. Consume la API de la Entrega 2 (`../backend`).

## Cómo correrlo

Necesita Node 18 o superior. El backend tiene que estar levantado primero.

```bash
# 1. Backend (puerto 3000)
cd backend
npm install
npm start

# 2. Frontend (puerto 5173), en otra terminal
cd frontend
npm install
npm run dev
```

Abrir http://localhost:5173.

El backend no habilita CORS, así que Vite reenvía todo lo que empieza con `/api` a `http://localhost:3000` (ver `vite.config.ts`). Para apuntar a otra URL, definir `VITE_API_URL`.

### Cuentas de prueba (vienen en el backend)

| Rol | Email | DNI |
| --- | --- | --- |
| Cliente | cliente@pepediroma.com.ar | 38123456 |
| Admin | admin@pepediroma.com.ar | 30111222 |

El backend no guarda contraseñas: se ingresa con email y DNI.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Chequeo de tipos (TypeScript estricto) y build de producción |
| `npm run preview` | Sirve el build (también con el proxy a la API) |
| `npm run lint` | Linter (oxlint) |
| `npm run diseno` | Regenera `diseño/v2/Mockup_v2…html` y `Wireframe_v2…html` desde esta misma app |

## Estructura

```
src/
├── assets/        Fotos reales de la marca y logo
├── components/    Componentes reutilizables (cada uno con su CSS)
├── content/       Lo fijo de las cartas (ids y siluetas de "Tempo di cottura")
├── context/       Sesión, notificaciones (toast), confirmación (modal) y textos del sitio
├── hooks/         useApi (carga + errores), useReveal, useSitio y useSalon
├── pages/         Una carpeta por pantalla
├── services/      Toda la comunicación con la API
├── styles/        Tokens del sistema de diseño, base y layout compartido
├── types/         Tipos del dominio, iguales a los modelos del backend
├── utils/         Formato, validaciones, reglas de reserva, imágenes, sesión
├── App.tsx        Proveedores y navegación entre pantallas
└── main.tsx       Punto de entrada
```

### Servicios

`services/api.ts` es el único lugar donde se usa `fetch`: arma la URL, procesa la respuesta `{ success, data | message }` del backend y lanza un `ApiError` con el mensaje cuando algo falla. Cada recurso tiene su archivo (`platosService`, `seccionesService`, `mesasService`, `reservasService`, `pedidosService`, `usuariosService`, `contenidoService`, `calificacionesService`) y las páginas solo llaman a esas funciones.

### Nada escrito a mano en los componentes

Los textos y las fotos del sitio (portada, cards, contacto, nombres y pies de las cartas, "Tempo di cottura", tamaño del plano del salón) vienen de `/api/contenido`. `context/ContenidoContext` los carga al abrir el sitio (con su pantalla de carga y de error) y los componentes los leen con `useContenido()` o con los hooks de `hooks/useSitio.ts`. Al guardar en "Textos y fotos", todo el sitio se actualiza.

### Experiencia de usuario

- **Carga:** skeletons con la forma del contenido mientras llegan los datos (`hooks/useApi`).
- **Éxito y error:** un solo sistema de notificaciones laterales (`context/ToastContext`). No se usa `alert()`.
- **Validaciones:** cada formulario valida antes de enviar, muestra el error debajo del campo y lleva el foco al primero con error.
- **Eliminar o cancelar:** siempre pasa por un modal de confirmación (`context/ConfirmContext`).
- **Vacíos:** cada listado tiene su mensaje cuando no hay datos.

### Accesibilidad

Labels visibles asociados a cada input, errores vinculados con `aria-describedby`, botones para las acciones y enlaces para la navegación, `alt` en todas las imágenes, foco visible, enlace para saltar al contenido, el foco va al título al cambiar de pantalla, modal nativo (`<dialog>`) que atrapa el foco y lo devuelve, y animaciones que se apagan con `prefers-reduced-motion`.

### La carta

El menú reproduce las tres cartas impresas del local (`diseño/cartas`): Il Ristorante, Per portare via y Colazione e merenda. Los platos, precios, descripciones y secciones vienen de la API; el componente `components/Carta` los dibuja como la hoja impresa (con la letra Baumans, solo ahí) y lo reutiliza "Hacer pedido" con un + / − en cada línea. En "Hacer pedido" la carta tiene su propio scroll, así que la caja y su botón de confirmar quedan siempre a mano.

### Encuesta y calificaciones

Cualquiera puede opinar en `/opinar`, con o sin cuenta: puntaje general de 1 a 5 con los arcos del logotipo, y opcionalmente atención, platos, el lugar y quién lo atendió (como la encuesta del local). La portada muestra el promedio y un carrusel con las mejores opiniones en "Nuestras calificaciones". El admin las responde, las oculta o las corrige en Gestión → Opiniones.

### Datos de prueba

El backend arranca con un historial de prueba (474 reservas y 352 pedidos entre el 1/8 y el 31/10/2026, generados siempre igual en `backend/src/data/historialSeed.js`) para que Métricas e Historial muestren algo. Los clientes y teléfonos son ficticios. Las opiniones arrancan vacías.

### Qué pide iniciar sesión

Solo **Reservar** y **Hacer pedido** (y sus listados, Mis reservas y Mis pedidos). El menú, la portada y la encuesta son abiertos. La gestión es del personal del local, que **no puede hacer pedidos** (la pantalla lo explica y la API responde 403). Reservar pide nombre y teléfono; Hacer pedido pide teléfono y acepta indicaciones.

### Gestión (personal del local)

| Pantalla | Qué se edita |
| --- | --- |
| Pedidos | En curso o de hoy. Estado (desde la tabla, los cinco), modalidad, pago, dirección, teléfono, indicaciones, pagado e ítems |
| Reservas | Próximas, de hoy o sin confirmar. Nombre, teléfono, cliente, fecha, horario, personas, mesa y estado |
| Historial | Calendario del mes; cada día con sus reservas y pedidos y el detalle de cada uno |
| Métricas | Ventas, platos más pedidos, días y horarios con más reservas, plato con peor y mejor opinión, cómo compran y clientes frecuentes, por mes |
| Carta | Platos (todo, incluida la foto y si es producto estrella), secciones, orden, altas y bajas |
| Salón | Mesas (número, capacidad, lugar) arrastrándolas en el plano o con el teclado; tamaño del plano |
| Textos y fotos | Todos los textos y fotos del sitio |
| Opiniones | Responder, ocultar, corregir, eliminar |
| Usuarios (solo ADMIN) | Crear, editar email, DNI y rol, eliminar |

### Reglas de reserva

- Hasta 4 personas: eligen la mesa en el mapa del salón (armado con `posicionX` / `posicionY` de la API).
- De 5 a 12: no eligen mesa; la reserva se guarda sin mesa y el local la asigna desde Gestión de reservas.
- Más de 12: no pueden reservar online; se ofrece el WhatsApp del local.
- Horarios: turnos cada 30 minutos desde las 8:30; como la reserva dura 2 horas y el local cierra a las 00 h (a la 1 los viernes y sábados), el último turno es 22:00 (23:00 viernes y sábados).

## Diseño

Respeta la identidad del boceto (`../diseño`): blanco de base, rosa salsa `#FCE8E8` de acompañamiento, rojo tomate `#CE1320` para las acciones; Anton para títulos y Poppins para texto. El motivo del sistema es el arco de medio punto con el que está dibujado cada letra del logotipo: aparece en las fotos, las mesas, los avisos y el pie. El mockup y el wireframe están en `../diseño/v2/` y el detalle de cada decisión en `../diseño/v2/CAMBIOS.md`.

`mockup/` no es parte de la app: es la herramienta que arma esos dos HTML con la misma interfaz y una API simulada.
