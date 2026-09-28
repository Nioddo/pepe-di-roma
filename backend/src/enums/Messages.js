const Messages = Object.freeze({
    INVALID_DATA: 'Los datos enviados no son validos',
    INVALID_ID: 'El ID indicado no es valido',
    DUPLICATED_RESOURCE: 'El recurso ya existe',
    INTERNAL_ERROR: 'Ocurrio un error inesperado en el servidor',
    ROUTE_NOT_FOUND: 'La ruta solicitada no existe',

    USUARIO_NOT_FOUND: 'El usuario solicitado no existe',
    USUARIO_EMAIL_INVALID: 'El email del usuario no es valido',
    USUARIO_EMAIL_DUPLICATED: 'Ya existe un usuario con ese email',
    USUARIO_DNI_INVALID: 'El DNI debe tener 7 u 8 digitos numericos',
    USUARIO_DNI_DUPLICATED: 'Ya existe un usuario con ese DNI',
    USUARIO_ROL_INVALID: 'El rol del usuario no es valido',
    USUARIO_CON_REFERENCIAS: 'No se puede eliminar un usuario con reservas o pedidos asociados',

    SECCION_NOT_FOUND: 'La seccion solicitada no existe',
    SECCION_TITULO_REQUIRED: 'El titulo de la seccion es obligatorio',
    SECCION_DUPLICATED: 'Ya existe una seccion con ese titulo',
    SECCION_ORDEN_INVALID: 'El orden de la seccion debe ser un entero mayor a 0',
    SECCION_PLATOS_INVALID: 'Los platos de la seccion deben ser una lista de IDs sin repetir',

    PLATO_NOT_FOUND: 'El plato solicitado no existe',
    PLATO_DUPLICATED: 'Ya existe un plato con ese nombre',
    PLATO_NOMBRE_REQUIRED: 'El nombre del plato es obligatorio',
    PLATO_PRECIO_INVALID: 'El precio del plato debe ser un numero mayor a 0',
    PLATO_FLAG_INVALID: 'Los campos vegano y sinTacc deben ser booleanos',
    PLATO_IMAGE_INVALID: 'La imageUrl debe ser un texto',
    PLATO_EN_SECCION: 'No se puede eliminar un plato que pertenece a una seccion',

    MESA_NOT_FOUND: 'La mesa indicada no existe',
    MESA_NUMERO_INVALID: 'El numero de mesa debe ser un entero mayor a 0',
    MESA_DUPLICATED: 'Ya existe una mesa con ese numero',
    MESA_CAPACIDAD_INVALID: 'La capacidad de la mesa debe ser un entero mayor a 0',
    MESA_POSICION_INVALID: 'Las posiciones X e Y de la mesa deben ser numeros',
    MESA_CAPACIDAD_INSUFICIENTE: 'La mesa no tiene capacidad para esa cantidad de integrantes',
    MESA_CON_RESERVAS: 'No se puede eliminar una mesa con reservas activas',

    RESERVA_NOT_FOUND: 'La reserva solicitada no existe',
    RESERVA_CLIENTE_REQUIRED: 'El clienteId es obligatorio',
    RESERVA_FECHA_INVALID: 'La fecha debe tener el formato YYYY-MM-DD',
    RESERVA_HORA_INVALID: 'La hora de inicio debe tener el formato HH:MM',
    RESERVA_INTEGRANTES_INVALID: 'La cantidad de integrantes debe ser un entero mayor a 0',
    RESERVA_ESTADO_INVALID: 'El estado de la reserva no es valido',
    RESERVA_MESA_OCUPADA: 'La mesa ya esta reservada en ese horario',

    PEDIDO_NOT_FOUND: 'El pedido solicitado no existe',
    PEDIDO_CLIENTE_REQUIRED: 'El clienteId es obligatorio',
    PEDIDO_MODALIDAD_INVALID: 'La modalidad del pedido no es valida',
    PEDIDO_METODO_PAGO_INVALID: 'El metodo de pago no es valido',
    PEDIDO_ESTADO_INVALID: 'El estado del pedido no es valido',
    PEDIDO_DIRECCION_REQUIRED: 'La direccion es obligatoria para los pedidos con delivery',
    PEDIDO_ITEMS_REQUIRED: 'El pedido debe tener al menos un item',
    PEDIDO_ITEM_INVALID: 'Cada item debe tener un platoId valido y una cantidad mayor a 0',
    PEDIDO_PAGO_INVALID: 'El campo pagoRecibido debe ser booleano',

    ITEM_PEDIDO_NOT_FOUND: 'El item de pedido solicitado no existe',
    ITEM_PEDIDO_PEDIDO_REQUIRED: 'El pedidoId es obligatorio',
    ITEM_PEDIDO_PEDIDO_INMUTABLE: 'Un item no se puede mover a otro pedido',
    ITEM_PEDIDO_CANTIDAD_INVALID: 'La cantidad del item debe ser un entero mayor a 0',
    ITEM_PEDIDO_ULTIMO: 'No se puede eliminar el unico item de un pedido'
});

module.exports = Messages;
