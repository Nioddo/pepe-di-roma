const PedidoRepository = require('../repositories/PedidoRepository');
const ItemPedidoRepository = require('../repositories/ItemPedidoRepository');
const PlatoRepository = require('../repositories/PlatoRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const Messages = require('../enums/Messages');
const EstadoPedido = require('../enums/EstadoPedido');
const Modalidad = require('../enums/Modalidad');
const MetodoPago = require('../enums/MetodoPago');
const Rol = require('../enums/Rol');
const { telefonoValido } = require('../utils/telefono');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../exceptions/AppError');

const TIEMPO_BASE_MIN = 15;
const TIEMPO_POR_ITEM_MIN = 5;
const RECARGO_DELIVERY_MIN = 20;

function parsearId(id) {
    const numero = Number(id);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.INVALID_ID);
    }
    return numero;
}

function validarClienteId(clienteId) {
    const numero = Number(clienteId);
    if (!Number.isInteger(numero) || numero <= 0) {
        throw new BadRequestError(Messages.PEDIDO_CLIENTE_REQUIRED);
    }

    if (!UsuarioRepository.findById(numero)) {
        throw new NotFoundError(Messages.USUARIO_NOT_FOUND);
    }

    return numero;
}

function validarModalidad(modalidad) {
    if (!Object.values(Modalidad).includes(modalidad)) {
        throw new BadRequestError(Messages.PEDIDO_MODALIDAD_INVALID);
    }
    return modalidad;
}

function validarMetodoPago(metodoPago) {
    if (!Object.values(MetodoPago).includes(metodoPago)) {
        throw new BadRequestError(Messages.PEDIDO_METODO_PAGO_INVALID);
    }
    return metodoPago;
}

function validarEstado(estado) {
    if (!Object.values(EstadoPedido).includes(estado)) {
        throw new BadRequestError(Messages.PEDIDO_ESTADO_INVALID);
    }
    return estado;
}

function validarPagoRecibido(pagoRecibido) {
    if (typeof pagoRecibido !== 'boolean') {
        throw new BadRequestError(Messages.PEDIDO_PAGO_INVALID);
    }
    return pagoRecibido;
}

function validarDireccion(modalidad, direccion) {
    if (modalidad !== Modalidad.DELIVERY) {
        return null;
    }

    if (typeof direccion !== 'string' || direccion.trim() === '') {
        throw new BadRequestError(Messages.PEDIDO_DIRECCION_REQUIRED);
    }

    return direccion.trim();
}

function validarTelefono(telefono) {
    if (!telefonoValido(telefono)) {
        throw new BadRequestError(Messages.PEDIDO_TELEFONO_INVALID);
    }
    return telefono.trim();
}

function validarIndicaciones(indicaciones) {
    if (indicaciones === undefined || indicaciones === null) {
        return null;
    }
    if (typeof indicaciones !== 'string' || indicaciones.trim().length > 300) {
        throw new BadRequestError(Messages.PEDIDO_INDICACIONES_INVALID);
    }
    return indicaciones.trim() || null;
}

function validarNombre(nombre) {
    if (typeof nombre !== 'string' || nombre.trim() === '' || nombre.trim().length > 60) {
        throw new BadRequestError(Messages.PEDIDO_NOMBRE_REQUIRED);
    }
    return nombre.trim();
}

function validarHoraRetiro(hora) {
    if (typeof hora !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(hora)) {
        throw new BadRequestError(Messages.PEDIDO_HORA_RETIRO_INVALID);
    }
    return hora;
}

function validarQueSeaCliente(clienteId) {
    const usuario = UsuarioRepository.findById(clienteId);
    if (usuario && usuario.rol !== Rol.CLIENTE) {
        throw new ForbiddenError(Messages.PEDIDO_SOLO_CLIENTES);
    }
}

function ahora() {
    const d = new Date();
    const dos = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

function construirItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        throw new BadRequestError(Messages.PEDIDO_ITEMS_REQUIRED);
    }

    return items.map((item) => {
        if (!item || typeof item !== 'object') {
            throw new BadRequestError(Messages.PEDIDO_ITEM_INVALID);
        }

        const platoId = Number(item.platoId);
        const cantidad = Number(item.cantidad);

        if (!Number.isInteger(platoId) || platoId <= 0) {
            throw new BadRequestError(Messages.PEDIDO_ITEM_INVALID);
        }
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            throw new BadRequestError(Messages.PEDIDO_ITEM_INVALID);
        }

        const plato = PlatoRepository.findById(platoId);
        if (!plato) {
            throw new NotFoundError(Messages.PLATO_NOT_FOUND);
        }

        return {
            platoId: plato.id,
            nombre: plato.nombre,
            precioUnitario: plato.precio,
            cantidad
        };
    });
}

function calcularPrecioTotal(items) {
    return items.reduce((total, item) => total + item.precioUnitario * item.cantidad, 0);
}

function calcularTiempoEstimado(items, modalidad) {
    const unidades = items.reduce((total, item) => total + item.cantidad, 0);
    const preparacion = TIEMPO_BASE_MIN + unidades * TIEMPO_POR_ITEM_MIN;

    return modalidad === Modalidad.DELIVERY ? preparacion + RECARGO_DELIVERY_MIN : preparacion;
}

function conItems(pedido) {
    return { ...pedido, items: ItemPedidoRepository.findByPedidoId(pedido.id) };
}

function guardarItems(pedidoId, items) {
    items.forEach((item) => ItemPedidoRepository.create({ ...item, pedidoId }));
}

function buscarPedido(id) {
    const pedidoId = parsearId(id);
    const pedido = PedidoRepository.findById(pedidoId);

    if (!pedido) {
        throw new NotFoundError(Messages.PEDIDO_NOT_FOUND);
    }

    return pedido;
}

function recalcularTotales(pedidoId) {
    const pedido = buscarPedido(pedidoId);
    const items = ItemPedidoRepository.findByPedidoId(pedido.id);

    return PedidoRepository.update(pedido.id, {
        precioTotal: calcularPrecioTotal(items),
        tiempoEstimadoMin: calcularTiempoEstimado(items, pedido.modalidad)
    });
}

function obtenerTodos() {
    return PedidoRepository.findAll().map(conItems);
}

function obtenerPorId(id) {
    return conItems(buscarPedido(id));
}

function crear(body) {
    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const clienteId = validarClienteId(body.clienteId);
    validarQueSeaCliente(clienteId);
    // los pedidos web son para retirar: la modalidad y el teléfono quedan opcionales
    const modalidad = body.modalidad === undefined ? Modalidad.TAKEAWAY : validarModalidad(body.modalidad);
    const telefono = body.telefono === undefined || body.telefono === null ? null : validarTelefono(body.telefono);
    const nombre = validarNombre(body.nombre);
    const horaRetiro = validarHoraRetiro(body.horaRetiro);
    const indicaciones = validarIndicaciones(body.indicaciones);
    const metodoPago = validarMetodoPago(body.metodoPago);
    const direccion = validarDireccion(modalidad, body.direccion);
    const items = construirItems(body.items);
    const estado = body.estado === undefined ? EstadoPedido.PENDIENTE : validarEstado(body.estado);
    const pagoRecibido =
        body.pagoRecibido === undefined ? false : validarPagoRecibido(body.pagoRecibido);

    const pedido = PedidoRepository.create({
        clienteId,
        modalidad,
        metodoPago,
        direccion,
        estado,
        precioTotal: calcularPrecioTotal(items),
        tiempoEstimadoMin: calcularTiempoEstimado(items, modalidad),
        pagoRecibido,
        telefono,
        indicaciones,
        creadoEn: ahora(),
        nombre,
        horaRetiro
    });

    guardarItems(pedido.id, items);
    return conItems(pedido);
}

function modificar(id, body) {
    const pedido = buscarPedido(id);

    if (!body || typeof body !== 'object') {
        throw new BadRequestError(Messages.INVALID_DATA);
    }

    const cambios = {};

    if (body.clienteId !== undefined) {
        cambios.clienteId = validarClienteId(body.clienteId);
    }
    if (body.modalidad !== undefined) {
        cambios.modalidad = validarModalidad(body.modalidad);
    }
    if (body.metodoPago !== undefined) {
        cambios.metodoPago = validarMetodoPago(body.metodoPago);
    }
    if (body.estado !== undefined) {
        cambios.estado = validarEstado(body.estado);
    }
    if (body.pagoRecibido !== undefined) {
        cambios.pagoRecibido = validarPagoRecibido(body.pagoRecibido);
    }
    if (body.telefono !== undefined) {
        cambios.telefono = validarTelefono(body.telefono);
    }
    if (body.indicaciones !== undefined) {
        cambios.indicaciones = validarIndicaciones(body.indicaciones);
    }
    if (body.nombre !== undefined) {
        cambios.nombre = validarNombre(body.nombre);
    }
    if (body.horaRetiro !== undefined) {
        cambios.horaRetiro = validarHoraRetiro(body.horaRetiro);
    }

    const itemsNuevos = body.items !== undefined ? construirItems(body.items) : null;
    const modalidadFinal = cambios.modalidad || pedido.modalidad;

    if (body.direccion !== undefined || cambios.modalidad !== undefined) {
        const direccionCandidata =
            body.direccion !== undefined ? body.direccion : pedido.direccion;
        cambios.direccion = validarDireccion(modalidadFinal, direccionCandidata);
    }

    if (itemsNuevos) {
        ItemPedidoRepository.removeByPedidoId(pedido.id);
        guardarItems(pedido.id, itemsNuevos);
    }

    const itemsFinales = ItemPedidoRepository.findByPedidoId(pedido.id);
    cambios.precioTotal = calcularPrecioTotal(itemsFinales);
    cambios.tiempoEstimadoMin = calcularTiempoEstimado(itemsFinales, modalidadFinal);

    return conItems(PedidoRepository.update(pedido.id, cambios));
}

function eliminar(id) {
    const pedido = buscarPedido(id);
    const items = ItemPedidoRepository.removeByPedidoId(pedido.id);
    const eliminado = PedidoRepository.remove(pedido.id);

    return { ...eliminado, items };
}

module.exports = {
    obtenerTodos,
    obtenerPorId,
    crear,
    modificar,
    eliminar,
    recalcularTotales
};
