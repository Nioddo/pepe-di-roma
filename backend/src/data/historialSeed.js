const Carta = require('../enums/Carta');
const Rol = require('../enums/Rol');
const Modalidad = require('../enums/Modalidad');
const MetodoPago = require('../enums/MetodoPago');
const EstadoPedido = require('../enums/EstadoPedido');
const EstadoReserva = require('../enums/EstadoReserva');
const { platoDeCarta } = require('./cartaSeed');

const HOY = '2026-10-14';
const DESDE = '2026-08-01';
const HASTA_RESERVAS = '2026-10-31';
const DURACION_MIN = 120;

function generador(semilla) {
    let estado = semilla;
    return function azar() {
        estado = (estado + 0x6d2b79f5) | 0;
        let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const azar = generador(2910);
const entre = (min, max) => min + Math.floor(azar() * (max - min + 1));
const elegir = (lista) => lista[Math.floor(azar() * lista.length)];
const elegirPesado = (pares) => {
    const total = pares.reduce((suma, [, peso]) => suma + peso, 0);
    let tiro = azar() * total;
    for (const [valor, peso] of pares) {
        tiro -= peso;
        if (tiro <= 0) {
            return valor;
        }
    }
    return pares[pares.length - 1][0];
};

const dos = (n) => String(n).padStart(2, '0');
const aMinutos = (hora) => Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));
const deMinutos = (min) => `${dos(Math.floor(min / 60))}:${dos(min % 60)}`;

function* dias(desde, hasta) {
    const dia = new Date(`${desde}T12:00:00`);
    const fin = new Date(`${hasta}T12:00:00`);
    while (dia <= fin) {
        yield { fecha: `${dia.getFullYear()}-${dos(dia.getMonth() + 1)}-${dos(dia.getDate())}`, semana: dia.getDay() };
        dia.setDate(dia.getDate() + 1);
    }
}

const CLIENTES_DEMO = [
    ['martin.perez@mail.com', '40987654', 'Martín Pérez', '+54 9 11 6021-7788'],
    ['sofia.romano@mail.com', '38455120', 'Sofía Romano', '+54 9 11 4433-1290'],
    ['diego.ferrari@mail.com', '33210984', 'Diego Ferrari', '+54 9 11 5877-0021'],
    ['valentina.russo@mail.com', '41009876', 'Valentina Russo', '+54 9 11 6390-4512'],
    ['juan.bianchi@mail.com', '29876543', 'Juan Bianchi', '+54 9 11 4789-3365'],
    ['carla.esposito@mail.com', '37654321', 'Carla Esposito', '+54 9 11 5560-9087'],
    ['tomas.colombo@mail.com', '42345678', 'Tomás Colombo', '+54 9 11 6612-2240'],
    ['julieta.ricci@mail.com', '36789012', 'Julieta Ricci', '+54 9 11 4120-7731'],
    ['nicolas.marino@mail.com', '34567890', 'Nicolás Marino', '+54 9 11 5098-6653'],
    ['agustina.greco@mail.com', '39876012', 'Agustina Greco', '+54 9 11 6745-1180']
];

const usuarios = CLIENTES_DEMO.slice(1).map(([email, dni], indice) => ({ id: 4 + indice, email, dni, rol: Rol.CLIENTE }));

const personas = [
    { usuarioId: 1, nombre: 'Cliente de prueba', telefono: '+54 9 11 5000-1234' },
    { usuarioId: 2, nombre: CLIENTES_DEMO[0][2], telefono: CLIENTES_DEMO[0][3] },
    ...usuarios.map((u, indice) => ({ usuarioId: u.id, nombre: CLIENTES_DEMO[indice + 1][2], telefono: CLIENTES_DEMO[indice + 1][3] }))
];

const PLATOS_PEDIDO = [
    ['Anolini', 10], ['Cappelacci', 9], ['Tortelloni', 8], ['Agnolotti ai funghi', 8], ['Casoncelli Patate Dolce', 7],
    ['Casoncelli', 5], ['Caramelle', 4], ['Cappelletti Ossobuco', 4], ['Anolini Gamberi', 3], ['Tortelli', 3],
    ['Lasagna Bolognese', 4], ['Gnocchi di Patate', 4], ['Spaghetti', 3], ['Mafaldine', 2], ['Maccheroni', 2],
    ['Pomodoro', 7], ['Fonduta de queso', 4], ['Pesto', 3], ['Amatriciana', 3], ['Parmigiano grattugiato', 3],
    ['Tiramisù', 5], ['Tiramisù al pistacchio', 3], ['Focaccia Clásica', 2], ['Schiacciata di Mortadella', 2],
    ['Cornetto', 2], ['Sfogliatella', 2]
].map(([nombre, peso]) => [platoDeCarta(Carta.PER_PORTARE_VIA, nombre), peso]);

const DIRECCIONES = ['Pedro Morán 3240', 'Av. Lincoln 4120, 2° B', 'Nueva York 3850', 'Habana 3410', 'José Pedro Varela 4455', 'Bahía Blanca 3920', 'Cervantes 2210', 'Desaguadero 2890'];
const INDICACIONES = ['Tocar timbre 4B', 'Dejar en portería', 'Sin parmesano, por favor', 'Es para regalo', 'Llamar al llegar', 'Paso a retirar después de las 20 h'];

const pedidos = [];
const items = [];
let idPedido = 3;
let idItem = 5;

for (const { fecha, semana } of dias(DESDE, HOY)) {
    const finDeSemana = semana === 0 || semana === 6;
    const cantidad = fecha === HOY ? 3 : finDeSemana ? entre(5, 8) : entre(3, 5);
    for (let n = 0; n < cantidad; n++) {
        const persona = elegir(personas);
        const modalidad = azar() < 0.55 ? Modalidad.TAKEAWAY : Modalidad.DELIVERY;
        const minuto = elegirPesado([[entre(9 * 60, 11 * 60), 2], [entre(11 * 60 + 30, 14 * 60), 4], [entre(17 * 60, 19 * 60), 2], [entre(19 * 60, 22 * 60 + 30), 5]]);
        const lineas = new Map();
        const cantidadLineas = elegirPesado([[1, 3], [2, 5], [3, 3], [4, 1]]);
        for (let l = 0; l < cantidadLineas; l++) {
            const plato = elegirPesado(PLATOS_PEDIDO);
            lineas.set(plato.id, { plato, cantidad: (lineas.get(plato.id)?.cantidad || 0) + elegirPesado([[1, 5], [2, 4], [3, 1]]) });
        }
        const lista = [...lineas.values()];
        const unidades = lista.reduce((suma, l) => suma + l.cantidad, 0);
        let estado = azar() < 0.07 ? EstadoPedido.CANCELADO : EstadoPedido.ENTREGADO;
        if (fecha === HOY) {
            estado = [EstadoPedido.ENTREGADO, EstadoPedido.EN_PREPARACION, EstadoPedido.PENDIENTE][n];
        }
        pedidos.push({
            id: idPedido,
            clienteId: persona.usuarioId,
            modalidad,
            metodoPago: elegirPesado([[MetodoPago.EFECTIVO, 30], [MetodoPago.DEBITO, 25], [MetodoPago.CREDITO, 20], [MetodoPago.TRANSFERENCIA, 25]]),
            direccion: modalidad === Modalidad.DELIVERY ? elegir(DIRECCIONES) : null,
            estado,
            precioTotal: lista.reduce((suma, l) => suma + l.plato.precio * l.cantidad, 0),
            tiempoEstimadoMin: 15 + unidades * 5 + (modalidad === Modalidad.DELIVERY ? 20 : 0),
            pagoRecibido: estado === EstadoPedido.ENTREGADO,
            telefono: persona.telefono,
            indicaciones: azar() < 0.25 ? elegir(INDICACIONES) : null,
            creadoEn: `${fecha}T${deMinutos(minuto)}`
        });
        for (const l of lista) {
            items.push({ id: idItem++, pedidoId: idPedido, platoId: l.plato.id, nombre: l.plato.nombre, precioUnitario: l.plato.precio, cantidad: l.cantidad });
        }
        idPedido++;
    }
}

const MESAS = [
    { id: 1, capacidad: 4 }, { id: 2, capacidad: 4 }, { id: 3, capacidad: 4 },
    { id: 4, capacidad: 4 }, { id: 5, capacidad: 6 }, { id: 6, capacidad: 6 }
];
const OCUPADAS_BASE = [
    { mesaId: 1, fecha: '2026-10-24', inicio: aMinutos('21:00') },
    { mesaId: 2, fecha: '2026-10-24', inicio: aMinutos('21:00') }
];

const reservas = [];
const ocupadas = [...OCUPADAS_BASE];
let idReserva = 4;

const libre = (mesaId, fecha, inicio) =>
    !ocupadas.some((o) => o.mesaId === mesaId && o.fecha === fecha && Math.abs(o.inicio - inicio) < DURACION_MIN);

function horarioPara(semana) {
    if (semana === 0) {
        return elegirPesado([['10:30', 2], ['11:00', 2], ['12:30', 4], ['13:00', 5], ['13:30', 3], ['20:30', 2], ['21:00', 2]]);
    }
    if (semana === 6) {
        return elegirPesado([['10:00', 2], ['11:00', 2], ['13:00', 3], ['13:30', 2], ['20:30', 4], ['21:00', 5], ['21:30', 4], ['22:00', 2]]);
    }
    if (semana === 5) {
        return elegirPesado([['13:00', 2], ['13:30', 2], ['20:30', 4], ['21:00', 5], ['21:30', 4], ['22:00', 2]]);
    }
    return elegirPesado([['09:00', 1], ['12:30', 2], ['13:00', 3], ['13:30', 2], ['17:00', 1], ['20:30', 3], ['21:00', 3], ['21:30', 1]]);
}

for (const { fecha, semana } of dias(DESDE, HASTA_RESERVAS)) {
    const futura = fecha > HOY;
    const base = semana === 5 || semana === 6 ? entre(8, 11) : semana === 0 ? entre(6, 9) : entre(2, 5);
    const cantidad = futura ? Math.round(base * (fecha <= '2026-10-21' ? 0.6 : 0.3)) : base;
    for (let n = 0; n < cantidad; n++) {
        const persona = elegir(personas);
        const integrantes = elegirPesado([[1, 1], [2, 8], [3, 3], [4, 4], [5, 1], [6, 2], [8, 1], [10, 1]]);
        let horaInicio = null;
        let mesaId = null;
        for (let intento = 0; intento < 6 && horaInicio === null; intento++) {
            const hora = horarioPara(semana);
            const inicio = aMinutos(hora);
            if (integrantes > 6) {
                horaInicio = hora;
                break;
            }
            const mesa = MESAS.filter((m) => m.capacidad >= integrantes)
                .sort((a, b) => a.capacidad - b.capacidad)
                .find((m) => libre(m.id, fecha, inicio));
            if (mesa) {
                horaInicio = hora;
                mesaId = mesa.id;
                ocupadas.push({ mesaId: mesa.id, fecha, inicio });
            }
        }
        if (horaInicio === null) {
            continue;
        }
        let estado;
        if (fecha < HOY) {
            estado = azar() < 0.13 ? EstadoReserva.CANCELADA : EstadoReserva.FINALIZADA;
        } else if (fecha === HOY) {
            estado = EstadoReserva.CONFIRMADA;
        } else {
            estado = azar() < 0.6 ? EstadoReserva.CONFIRMADA : EstadoReserva.PENDIENTE;
        }
        reservas.push({
            id: idReserva++,
            clienteId: persona.usuarioId,
            fecha,
            horaInicio,
            cantidadIntegrantes: integrantes,
            mesaId,
            estado,
            nombre: persona.nombre,
            telefono: persona.telefono
        });
    }
}

module.exports = { usuarios, pedidos, items, reservas, personas, HOY };
