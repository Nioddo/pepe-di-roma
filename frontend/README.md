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
├── content/       Textos institucionales del local
├── context/       Sesión, notificaciones (toast) y confirmación (modal)
├── hooks/         useApi (carga + errores) y useReveal (entradas animadas)
├── pages/         Una carpeta por pantalla
├── services/      Toda la comunicación con la API
├── styles/        Tokens del sistema de diseño, base y layout compartido
├── types/         Tipos del dominio, iguales a los modelos del backend
├── utils/         Formato, validaciones, reglas de reserva, imágenes, sesión
├── App.tsx        Proveedores y navegación entre pantallas
└── main.tsx       Punto de entrada
```

### Servicios

`services/api.ts` es el único lugar donde se usa `fetch`: arma la URL, procesa la respuesta `{ success, data | message }` del backend y lanza un `ApiError` con el mensaje cuando algo falla. Cada recurso tiene su archivo (`platosService`, `seccionesService`, `mesasService`, `reservasService`, `pedidosService`, `usuariosService`) y las páginas solo llaman a esas funciones.

### Experiencia de usuario

- **Carga:** skeletons con la forma del contenido mientras llegan los datos (`hooks/useApi`).
- **Éxito y error:** un solo sistema de notificaciones laterales (`context/ToastContext`). No se usa `alert()`.
- **Validaciones:** cada formulario valida antes de enviar, muestra el error debajo del campo y lleva el foco al primero con error.
- **Eliminar o cancelar:** siempre pasa por un modal de confirmación (`context/ConfirmContext`).
- **Vacíos:** cada listado tiene su mensaje cuando no hay datos.

### Accesibilidad

Labels visibles asociados a cada input, errores vinculados con `aria-describedby`, botones para las acciones y enlaces para la navegación, `alt` en todas las imágenes, foco visible, enlace para saltar al contenido, el foco va al título al cambiar de pantalla, modal nativo (`<dialog>`) que atrapa el foco y lo devuelve, y animaciones que se apagan con `prefers-reduced-motion`.

### La carta

El menú reproduce las tres cartas impresas del local (`diseño/cartas`): Il Ristorante, Per portare via y Colazione e merenda. Los platos, precios, descripciones y secciones vienen de la API; el componente `components/Carta` los dibuja como la hoja impresa (con la letra Baumans, solo ahí) y lo reutiliza "Hacer pedido" con un + / − en cada línea.

### Reglas de reserva

- Hasta 4 personas: eligen la mesa en el mapa del salón (armado con `posicionX` / `posicionY` de la API).
- De 5 a 12: no eligen mesa; la reserva se guarda sin mesa y el local la asigna desde Gestión de reservas.
- Más de 12: no pueden reservar online; se muestra cómo contactar al local.

## Diseño

Respeta la identidad del boceto (`../diseño`): blanco de base, rosa salsa `#FCE8E8` de acompañamiento, rojo tomate `#CE1320` para las acciones; Anton para títulos y Poppins para texto. El motivo del sistema es el arco de medio punto con el que está dibujado cada letra del logotipo: aparece en las fotos, las mesas, los avisos y el pie. El mockup y el wireframe están en `../diseño/v2/` y el detalle de cada decisión en `../diseño/v2/CAMBIOS.md`.

`mockup/` no es parte de la app: es la herramienta que arma esos dos HTML con la misma interfaz y una API simulada.
