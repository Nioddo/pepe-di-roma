# Pepe Di Roma

Sistema web de la fábrica de pastas artesanales Pepe Di Roma (Villa Devoto): carta, reservas con mapa del salón, pedidos, opiniones y panel de administración.

| Carpeta | Qué tiene |
| --- | --- |
| `backend/` | API REST en Node + Express, organizada por capas (rutas → controladores → servicios → repositorios). Los datos viven en memoria. |
| `frontend/` | Interfaz en React + TypeScript + Vite. Detalle en [`frontend/README.md`](frontend/README.md). |
| `diseño/v2/` | Mockup y wireframe navegables, que se pueden abrir sin instalar nada. Los cambios respecto a la v1 están en [`CAMBIOS.md`](diseño/v2/CAMBIOS.md). |
| `video-defensa/` | Video de la defensa: [`video-defensa/out/defensa-pepe-di-roma.mp4`](video-defensa/out/defensa-pepe-di-roma.mp4). |

---

## Para explorar la página rápido: usar el mockup v2

> **Si solo quiere recorrer la página y probar todo, no hace falta levantar nada.**
> Abra con doble clic **[`diseño/v2/Mockup_v2_Pepe_Di_Roma.html`](diseño/v2/Mockup_v2_Pepe_Di_Roma.html)**. Funciona desde el navegador sin servidor ni internet.

Es la misma aplicación React, empaquetada en un solo archivo con una API simulada que tiene los mismos datos y las mismas reglas que el backend. Se pueden crear, modificar y cancelar reservas y pedidos, y los cambios se pierden al recargar.

Abajo a la izquierda está el botón **Mockup v2 · revisar estados**, que abre un panel para:

- **Cambiar de rol** en un clic (*Visitante*, *Cliente* o *Admin*) sin escribir credenciales. Así se ven las pantallas de cliente (reservar, mis reservas, pedidos) y las de administración (gestión de reservas, editor libre del salón, carta, usuarios, promociones).
- **Forzar estados de la API**: carga lenta (skeletons), listas vacías, servidor caído (pantallas de error) u opiniones de ejemplo.

El archivo `Wireframe_v2_Pepe_Di_Roma.html` es la misma app en escala de grises, para revisar la estructura sin el estilo visual.

---

## Cómo levantar el sistema real (backend + frontend)

Requisitos: **Node 18 o superior** y npm.

### 1. Backend (puerto 3000)

```bash
cd backend
npm install
npm start
```

La API queda en http://localhost:3000/api.

### 2. Frontend (puerto 5173), en otra terminal

```bash
cd frontend
npm install
npm run dev
```

Abrir **http://localhost:5173**. Vite reenvía las llamadas a `/api` al backend, así que **el backend tiene que estar levantado primero**. Si se abre la página mientras el backend todavía arranca, aparece un error de servidor: alcanza con recargar.

### Cuentas de prueba

El ingreso se hace con email y DNI. No hay contraseñas.

| Rol | Email | DNI |
| --- | --- | --- |
| Cliente | cliente@pepediroma.com.ar | 38123456 |
| Cliente | martin.perez@mail.com | 40987654 |
| Admin | admin@pepediroma.com.ar | 30111222 |

### Datos de ejemplo

El backend arranca con unos dos meses y medio de historial de reservas y pedidos, armado **alrededor de la fecha del día**. Así siempre hay reservas próximas para ver y probar. Como todo vive en memoria, reiniciar el backend vuelve a los datos iniciales.

### Reglas de reserva (para probar las validaciones)

- Los turnos son cada 30 minutos desde las 8:30. Se cierra a las 24:00, y a la 1:00 los viernes y sábados. Cada reserva dura 2 horas.
- De 1 a 4 personas, se elige la mesa en el mapa. De 5 a 12, la mesa la asigna el local. Con más de 12 no se puede reservar online.
- No se puede reservar en fechas u horarios que ya pasaron, ni una mesa que ya está ocupada en ese turno.

### Mails (opcional)

Sin configuración el sistema funciona igual, pero los mails (promociones y avisos) no se envían. Para activarlos, copiar `backend/.env.example` a `backend/.env` y completar `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER` y `MAIL_PASS`.
