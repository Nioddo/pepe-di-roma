const PedidoRepository = require('../repositories/PedidoRepository');
const ItemPedidoRepository = require('../repositories/ItemPedidoRepository');
const PlatoRepository = require('../repositories/PlatoRepository');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const Messages = require('../enums/Messages');
const EstadoPedido = require('../enums/EstadoPedido');
const Modalidad = require('../enums/Modalidad');
const MetodoPago = require('../enums/MetodoPago');
const { BadRequestError, NotFoundError } = require('../exceptions/AppError');

/**
 * Logica de negocio de Pedidos.
 * Reglas que hace cumplir:
 *  - el cliente y los platos pedidos tienen que existir,
 *  - el precio total y el tiempo estimado los calcula el backend (no el cliente),
 *  - delivery exige direccion.
 *
 * Los items se guardan en ItemPedidoRepository; este service los adjunta a
 * cada pedido que devuelve, asi el cliente sigue viendo el pedido completo.
 */

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

/** Solo delivery necesita direccion; en salon o takeaway se guarda null. */
function validarDireccion(modalidad, direccion) {
    if (modalidad !== Modalidad.DELIVERY) {
        return null;
    }

    if (typeof direccion !== 'string' || direccion.trim() === '') {
        throw new BadRequestError(Messages.PEDIDO_DIRECCION_REQUIRED);
    }

    return direccion.trim();
}

/**
 * Convierte los items que manda el cliente ({ platoId, cantidad }) en los
 * datos completos de cada item, tomando nombre y precio del catalogo de
 * platos. Asi el precio nunca lo define el cliente.
 * Solo valida: la escritura en ItemPedidoRepository la hace quien la llama.
 */
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

/** Devuelve una copia del pedido con sus items actuales adjuntos. */
function conItems(pedido) {
    return { ...pedido, items: ItemPedidoRepository.findByPedidoId(pedido.id) };
}

/** Guarda los items de un pedido recien creado o con items reemplazados. */
function guardarItems(pedidoId, items) {
    items.forEach((item) => ItemPedidoRepository.create({ ...item, pedidoId }));
}

/** Pedido tal cual esta en el repository (sin items), o 404. */
function buscarPedido(id) {
    const pedidoId = parsearId(id);
    const pedido = PedidoRepository.findById(pedidoId);

    if (!pedido) {
        throw new NotFoundError(Messages.PEDIDO_NOT_FOUND);
    }

    return pedido;
}

/**
 * Recalcula precio total y tiempo estimado a partir de los items guardados.
 * La usa ItemPedidoService cada vez que agrega, cambia o borra un item.
 */
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
    const modalidad = validarModalidad(body.modalidad);
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
        pagoRecibido
    });

    guardarItems(pedido.id, items);
    return conItems(pedido);
}

/**
 * Modificacion parcial. Si cambian los items o la modalidad, se recalculan
 * precio total y tiempo estimado sobre el resultado final.
 */
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

    // Los items nuevos se validan todos antes de tocar nada guardado.
    const itemsNuevos = body.items !== undefined ? construirItems(body.items) : null;
    const modalidadFinal = cambios.modalidad || pedido.modalidad;

    // La direccion se revalida si cambio la modalidad o si la mandaron de nuevo:
    // pasar a delivery obliga a tener direccion, y salir de delivery la limpia.
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

/** Al borrar un pedido se borran tambien sus items. */
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
