// Graba la demo del flujo de reservas (pasos a–h) a 1920x1080.
// Requiere backend recién iniciado en :3000 y frontend en :5173.
// Uso: node scripts/grabar.mjs
import { chromium } from 'playwright';
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const FRONT = 'http://localhost:5173';
const API = 'http://localhost:3000/api';
const RAIZ = path.resolve(import.meta.dirname, '..');
const TMP = path.join(RAIZ, '.grabaciones-tmp');
const SALIDA = path.join(RAIZ, 'public', 'grabaciones');
const DATOS = path.join(RAIZ, 'src', 'datos');
const FFBIN = 'C:/Users/nicolas oddo/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-9.1-full_build/bin';
const FFMPEG = fs.existsSync(FFBIN) ? path.join(FFBIN, 'ffmpeg.exe') : 'ffmpeg';
const FFPROBE = fs.existsSync(FFBIN) ? path.join(FFBIN, 'ffprobe.exe') : 'ffprobe';
const FECHA = '2026-12-18';
const HORA = '21:00';

const CLIENTE = { email: 'cliente@pepediroma.com.ar', dni: '38123456' };
const MARTIN = { email: 'martin.perez@mail.com', dni: '40987654' };
const ADMIN = { email: 'admin@pepediroma.com.ar', dni: '30111222' };

fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(SALIDA, { recursive: true });
fs.mkdirSync(DATOS, { recursive: true });

const espera = (ms) => new Promise((r) => setTimeout(r, ms));

// A veces el dev server deja la página en skeleton: se recarga hasta que aparece el formulario
async function esperarCarga(page, loc) {
  for (let i = 0; i < 5; i++) {
    try { await loc.waitFor({ timeout: 8000 }); return; } catch { await page.reload(); }
  }
  throw new Error('La página no terminó de cargar');
}
const esperarFormulario = (page) => esperarCarga(page, page.getByLabel('Fecha'));

async function apiFetch(metodo, ruta, usuarioId, cuerpo) {
  const res = await fetch(API + ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(usuarioId ? { 'x-usuario-id': String(usuarioId) } : {}) },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  });
  return { status: res.status, body: await res.json() };
}

const login = async (c) => (await apiFetch('POST', '/usuarios/login', null, c)).body.data;

// Cursor visible + onda en cada clic (se reinyecta en cada navegación)
const CURSOR = () => {
  const montar = () => {
    if (document.getElementById('__cursor')) return;
    const st = document.createElement('style');
    st.textContent = `
      #__cursor{position:fixed;left:0;top:0;width:26px;height:26px;pointer-events:none;z-index:2147483647;
        transform:translate(-4px,-3px);filter:drop-shadow(0 2px 4px rgba(0,0,0,.35))}
      .__ripple{position:fixed;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
        background:rgba(206,19,32,.35);border:2px solid rgba(206,19,32,.8);pointer-events:none;z-index:2147483646;
        animation:__rip .5s ease-out forwards}
      @keyframes __rip{from{transform:scale(.3);opacity:1}to{transform:scale(1.8);opacity:0}}`;
    document.head.appendChild(st);
    const c = document.createElement('div');
    c.id = '__cursor';
    c.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24"><path d="M4 2l16 10-7 1.5L9.5 21z" fill="#fff" stroke="#1a1a1a" stroke-width="1.6" stroke-linejoin="round"/></svg>';
    const pos = JSON.parse(sessionStorage.getItem('__pos') || '[960,540]');
    c.style.left = pos[0] + 'px';
    c.style.top = pos[1] + 'px';
    document.body.appendChild(c);
    document.addEventListener('mousemove', (e) => {
      c.style.left = e.clientX + 'px';
      c.style.top = e.clientY + 'px';
      sessionStorage.setItem('__pos', JSON.stringify([e.clientX, e.clientY]));
    }, true);
    document.addEventListener('mousedown', (e) => {
      const r = document.createElement('div');
      r.className = '__ripple';
      r.style.left = e.clientX + 'px';
      r.style.top = e.clientY + 'px';
      document.body.appendChild(r);
      setTimeout(() => r.remove(), 600);
    }, true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', montar);
  else montar();
};

async function nuevaGrabacion(browser, nombre, sesion) {
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: path.join(TMP, nombre), size: { width: 1920, height: 1080 } }
  });
  if (sesion) await context.addInitScript((u) => {
    if (sessionStorage.getItem('__sesionPuesta')) return;
    sessionStorage.setItem('__sesionPuesta', '1');
    localStorage.setItem('pepediroma.sesion', u);
  }, JSON.stringify(sesion));
  await context.addInitScript(CURSOR);
  const page = await context.newPage();
  globalThis.__ultima = page;
  (globalThis.__todas ??= []).push(page);
  if (process.env.DEBUG_RED) { page.on('request', (r) => r.url().includes('/api/') && console.log('REQ', r.method(), r.url())); page.on('response', (r) => r.url().includes('/api/') && console.log('RES', r.status(), r.url())); page.on('requestfailed', (r) => console.log('FAIL', r.url(), r.failure()?.errorText)); page.on('pageerror', (e) => console.log('PAGEERR', e.message)); page.on('requestfinished', (r) => r.url().includes('/api/') && console.log('DONE', r.url())); page.on('console', (m) => console.log('CONSOLE', m.type(), m.text().slice(0, 300))); }
  const t0 = Date.now();
  const marcas = {};
  const marca = (k) => (marcas[k] = +((Date.now() - t0) / 1000).toFixed(2));
  const cur = { x: 960, y: 540 };
  const mover = async (loc, { dx = 0.5, dy = 0.5 } = {}) => {
    await loc.scrollIntoViewIfNeeded();
    const b = await loc.boundingBox();
    const x = b.x + b.width * dx;
    const y = b.y + b.height * dy;
    const pasos = Math.max(12, Math.round(Math.hypot(x - cur.x, y - cur.y) / 22));
    await page.mouse.move(x, y, { steps: pasos });
    cur.x = x;
    cur.y = y;
  };
  const clic = async (loc, opts) => {
    await mover(loc, opts);
    await espera(220);
    await page.mouse.down();
    await espera(90);
    await page.mouse.up();
    await espera(350);
  };
  const escribir = async (loc, texto) => {
    await clic(loc);
    await loc.press('Control+A');
    await loc.press('Backspace');
    await loc.pressSequentially(texto, { delay: 70 });
  };
  const elegir = async (loc, valor) => {
    await mover(loc);
    await espera(250);
    await loc.selectOption(valor);
    await espera(400);
  };
  const fecha = async (loc, valor) => {
    await mover(loc);
    await espera(250);
    await loc.fill(valor);
    await espera(400);
  };
  const scroll = async (y) => {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), y);
    await espera(900);
  };
  const scrollA = async (loc, bloque = 'center') => {
    await loc.evaluate((el, b) => el.scrollIntoView({ behavior: 'smooth', block: b }), bloque);
    await espera(900);
  };
  return { context, page, nombre, marcas, marca, mover, clic, escribir, elegir, fecha, scroll, scrollA };
}

async function cerrar(g) {
  const video = g.page.video();
  await g.context.close();
  const origen = await video.path();
  const destino = path.join(SALIDA, `${g.nombre}.mp4`);
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', origen, '-r', '30', '-c:v', 'libx264', '-crf', '18', '-preset', 'medium', '-pix_fmt', 'yuv420p', '-movflags', 'faststart', destino]);
  const dur = Number(execFileSync(FFPROBE, ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', destino]).toString().trim());
  return { archivo: `grabaciones/${g.nombre}.mp4`, duracion: +dur.toFixed(2), marcas: g.marcas };
}

const llenarFormulario = async (g, { mesa, nombre, telefono }) => {
  const p = g.page;
  await g.fecha(p.getByLabel('Fecha'), FECHA);
  await g.elegir(p.getByLabel('Horario'), HORA);
  if (nombre) await g.escribir(p.getByLabel('A nombre de'), nombre);
  if (telefono) await g.escribir(p.getByLabel('Teléfono'), telefono);
  await g.scrollA(p.locator('.salon'));
  await g.clic(p.getByRole('button', { name: new RegExp(`^Mesa ${mesa},`) }));
};

async function main() {
  // Backend propio y recién iniciado: estado en memoria limpio en cada grabación
  const backend = spawn(process.execPath, ['src/app.js'], { cwd: path.resolve(RAIZ, '..', 'backend'), stdio: 'ignore' });
  globalThis.__backend = backend;
  for (let i = 0; i < 50; i++) {
    try { await fetch(API + '/mesas'); break; } catch { await espera(200); }
  }

  // Estado inicial: Martín ya reservó la mesa 2 a las 21 h (para ver una mesa ocupada en el mapa)
  const martin = await login(MARTIN);
  const cliente = await login(CLIENTE);
  const admin = await login(ADMIN);
  const mesas = (await apiFetch('GET', '/mesas', cliente.id)).body.data;
  const idMesa = (n) => mesas.find((m) => m.numero === n).id;
  const seed = await apiFetch('POST', '/reservas', martin.id, {
    clienteId: martin.id, fecha: FECHA, horaInicio: HORA, cantidadIntegrantes: 2, mesaId: idMesa(2),
    nombre: 'Martín Pérez', telefono: '1140987654'
  });
  if (seed.status !== 201 && seed.status !== 409) throw new Error('No se pudo sembrar: ' + JSON.stringify(seed));

  const browser = await chromium.launch();
  const resultado = {};

  // ---------- a–d: login, mapa, validación, reserva exitosa ----------
  {
    const g = await nuevaGrabacion(browser, 'reserva');
    const p = g.page;
    await p.goto(FRONT + '/ingresar');
    await p.getByLabel('Email').waitFor({ timeout: 60000 });
    await espera(600);
    g.marca('login');
    await g.escribir(p.getByLabel('Email'), CLIENTE.email);
    await g.escribir(p.getByLabel('DNI'), CLIENTE.dni);
    await g.clic(p.getByRole('button', { name: 'Ingresar' }));
    await p.waitForURL(FRONT + '/');
    await espera(1500);
    await g.clic(p.locator('#nav-principal').getByRole('link', { name: 'Reservar' }));
    await esperarFormulario(p);
    await espera(1200);
    g.marca('mapa');
    await g.fecha(p.getByLabel('Fecha'), FECHA);
    await g.elegir(p.getByLabel('Horario'), HORA);
    await g.scrollA(p.locator('.salon'));
    await espera(600);
    await g.mover(p.getByRole('button', { name: /^Mesa 2,/ }));
    await espera(1800);
    await g.mover(p.getByRole('button', { name: /^Mesa 1,/ }));
    await espera(1200);
    await g.clic(p.getByRole('button', { name: /^Mesa 3,/ }));
    await espera(1500);
    g.marca('validacion');
    await g.scrollA(p.getByLabel('A nombre de'));
    await g.escribir(p.getByLabel('A nombre de'), 'Cliente Demo');
    await g.escribir(p.getByLabel('Teléfono'), '12-ab');
    await g.clic(p.getByRole('button', { name: 'Confirmar reserva' }));
    await espera(2600);
    g.marca('exito');
    await g.escribir(p.getByLabel('Teléfono'), '1145678901');
    await espera(500);
    await g.clic(p.getByRole('button', { name: 'Confirmar reserva' }));
    await p.waitForURL(FRONT + '/mis-reservas');
    await espera(4500);
    g.marca('fin');
    resultado.reserva = await cerrar(g);
  }

  // ---------- e: concurrencia, dos clientes y la misma mesa ----------
  {
    const a = await nuevaGrabacion(browser, 'concurrencia-a', cliente);
    const b = await nuevaGrabacion(browser, 'concurrencia-b', martin);
    let red409 = null;
    b.page.on('response', async (res) => {
      if (res.url().endsWith('/api/reservas') && res.request().method() === 'POST') {
        red409 = {
          metodo: 'POST', url: '/api/reservas', status: res.status(),
          headersPedido: { 'content-type': 'application/json', 'x-usuario-id': String(martin.id) },
          pedido: JSON.parse(res.request().postData()), respuesta: await res.json()
        };
      }
    });
    await Promise.all([a.page.goto(FRONT + '/reservar'), b.page.goto(FRONT + '/reservar')]);
    await Promise.all([esperarFormulario(a.page), esperarFormulario(b.page)]);
    await espera(800);
    a.marca('inicio');
    b.marca('inicio');
    await Promise.all([
      llenarFormulario(a, { mesa: 1, nombre: 'Cliente Demo', telefono: '1145678901' }),
      llenarFormulario(b, { mesa: 1, nombre: 'Martín Pérez', telefono: '1140987654' })
    ]);
    await espera(800);
    await Promise.all([a.scrollA(a.page.getByRole('button', { name: 'Confirmar reserva' })), b.scrollA(b.page.getByRole('button', { name: 'Confirmar reserva' }))]);
    a.marca('primero');
    b.marca('primero');
    await a.clic(a.page.getByRole('button', { name: 'Confirmar reserva' }));
    await a.page.waitForURL(FRONT + '/mis-reservas');
    await espera(700);
    b.marca('segundo');
    a.marca('segundo');
    await b.clic(b.page.getByRole('button', { name: 'Confirmar reserva' }));
    await b.page.locator('.toast[role="alert"]').waitFor({ timeout: 60000 });
    await espera(1200);
    await b.scrollA(b.page.locator('.salon'));
    await espera(3500);
    a.marca('fin');
    b.marca('fin');
    resultado.concurrenciaA = await cerrar(a);
    resultado.concurrenciaB = await cerrar(b);
    fs.writeFileSync(path.join(DATOS, 'red-409.json'), JSON.stringify(red409, null, 2));
  }

  // ---------- f: GET /api/reservas como cliente (datos de otros ocultos) ----------
  {
    const comoCliente = await apiFetch('GET', '/reservas', cliente.id);
    fs.writeFileSync(path.join(DATOS, 'red-get-reservas.json'), JSON.stringify({
      metodo: 'GET', url: '/api/reservas', status: comoCliente.status,
      headersPedido: { 'x-usuario-id': String(cliente.id) }, respuesta: comoCliente.body
    }, null, 2));
  }

  // ---------- g–h: cancelar, salir, admin confirma ----------
  {
    const g = await nuevaGrabacion(browser, 'cancelar-admin', cliente);
    const p = g.page;
    await p.goto(FRONT + '/mis-reservas');
    await esperarCarga(p, p.getByRole('button', { name: 'Cancelar', exact: true }).first());
    await espera(1000);
    g.marca('cancelar');
    const tarjeta = p.locator('article, li, .record-card').filter({ hasText: /mesa 3/i }).filter({ has: p.getByRole('button', { name: 'Cancelar' }) }).last();
    const boton = (await tarjeta.count()) ? tarjeta.getByRole('button', { name: 'Cancelar' }) : p.getByRole('button', { name: 'Cancelar' }).first();
    await g.scrollA(boton);
    await g.clic(boton);
    await p.locator('dialog[open]').waitFor({ timeout: 60000 });
    await espera(1800);
    await g.clic(p.locator('dialog[open]').getByRole('button', { name: 'Cancelar reserva' }));
    await espera(3200);
    g.marca('admin');
    await g.scroll(0);
    await g.clic(p.getByRole('button', { name: 'Salir' }));
    await espera(900);
    await p.goto(FRONT + '/ingresar');
    await p.getByLabel('Email').waitFor({ timeout: 60000 });
    await espera(500);
    await g.escribir(p.getByLabel('Email'), ADMIN.email);
    await g.escribir(p.getByLabel('DNI'), ADMIN.dni);
    await g.clic(p.getByRole('button', { name: 'Ingresar' }));
    const gestion = p.locator('#nav-principal').getByRole('link', { name: 'Gestión' });
    await gestion.waitFor({ timeout: 30000 });
    await espera(1200);
    if (!/\/admin/.test(p.url())) {
      await g.clic(gestion);
      await espera(1400);
    }
    await g.clic(p.locator('nav.admin-nav').getByRole('link', { name: 'Reservas' }));
    await esperarCarga(p, p.locator('tr').filter({ hasText: CLIENTE.email }).first());
    await espera(1500);
    g.marca('tabla');
    const fila = p.locator('tr').filter({ hasText: CLIENTE.email }).filter({ hasText: '18/12' }).filter({ has: p.getByRole('button', { name: 'Confirmar', exact: true }) }).first();
    await g.scrollA(fila);
    await g.mover(fila.getByText(CLIENTE.email).first());
    await espera(2200);
    g.marca('confirmar');
    await g.clic(fila.getByRole('button', { name: 'Confirmar', exact: true }));
    await espera(4000);
    g.marca('fin');
    resultado.cancelarAdmin = await cerrar(g);
  }

  await browser.close();
  fs.writeFileSync(path.join(DATOS, 'grabaciones.json'), JSON.stringify(resultado, null, 2));
  fs.rmSync(TMP, { recursive: true, force: true });
  console.log(JSON.stringify(resultado, null, 2));
  void admin;
  backend.kill();
}

main().catch(async (e) => {
  for (const [i, pg] of (globalThis.__todas ?? []).entries()) { await pg.screenshot({ path: path.join(TMP, `error-${i}.png`) }).catch(() => {}); console.log(i, pg.url()); }
  console.log("url", globalThis.__ultima?.url());
  console.error(e);
  globalThis.__backend?.kill();
  process.exit(1);
});
