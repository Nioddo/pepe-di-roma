/**
 * Mensajes centralizados de la aplicacion.
 * Toda la app toma sus textos de aca: no se escriben strings sueltos
 * en services ni en controllers.
 */
const Messages = Object.freeze({
    // Genericos
    INVALID_DATA: 'Los datos enviados no son validos',
    INVALID_ID: 'El ID indicado no es valido',
    DUPLICATED_RESOURCE: 'El recurso ya existe',
    INTERNAL_ERROR: 'Ocurrio un error inesperado en el servidor',
    ROUTE_NOT_FOUND: 'La ruta solicitada no existe',

    // Plato
    PLATO_NOT_FOUND: 'El plato solicitado no existe',
    PLATO_DUPLICATED: 'Ya existe un plato con ese nombre',
    PLATO_NOMBRE_REQUIRED: 'El nombre del plato es obligatorio',
    PLATO_PRECIO_INVALID: 'El precio del plato debe ser un numero mayor a 0',
    PLATO_FLAG_INVALID: 'Los campos vegano y sinTacc deben ser booleanos',
    PLATO_IMAGE_INVALID: 'La imageUrl debe ser un texto',

    // Reserva
    RESERVA_NOT_FOUND: 'La reserva solicitada no existe',
    RESERVA_CLIENTE_REQUIRED: 'El clienteId es obligatorio',
    RESERVA_FECHA_INVALID: 'La fecha debe tener el formato YYYY-MM-DD',
    RESERVA_HORA_INVALID: 'La hora de inicio debe tener el formato HH:MM',
    RESERVA_INTEGRANTES_INVALID: 'La cantidad de integrantes debe ser un entero mayor a 0',
    RESERVA_ESTADO_INVALID: 'El estado de la reserva no es valido',
    RESERVA_MESA_OCUPADA: 'La mesa ya esta reservada en ese horario',

    // Mesa (entidad de soporte)
    MESA_NOT_FOUND: 'La mesa indicada no existe',
    MESA_CAPACIDAD_INSUFICIENTE: 'La mesa no tiene capacidad para esa cantidad de integrantes',

    // Pedido
    PEDIDO_NOT_FOUND: 'El pedido solicitado no existe',
    PEDIDO_CLIENTE_REQUIRED: 'El clienteId es obligatorio',
    PEDIDO_MODALIDAD_INVALID: 'La modalidad del pedido no es valida',
    PEDIDO_METODO_PAGO_INVALID: 'El metodo de pago no es valido',
    PEDIDO_ESTADO_INVALID: 'El estado del pedido no es valido',
    PEDIDO_DIRECCION_REQUIRED: 'La direccion es obligatoria para los pedidos con delivery',
    PEDIDO_ITEMS_REQUIRED: 'El pedido debe tener al menos un item',
    PEDIDO_ITEM_INVALID: 'Cada item debe tener un platoId valido y una cantidad mayor a 0',
    PEDIDO_PAGO_INVALID: 'El campo pagoRecibido debe ser booleano'
});

module.exports = Messages;
