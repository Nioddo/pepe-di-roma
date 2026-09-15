const EstadoPedido = Object.freeze({
    PENDIENTE: 'PENDIENTE',
    EN_PREPARACION: 'EN_PREPARACION',
    EN_CAMINO: 'EN_CAMINO',
    ENTREGADO: 'ENTREGADO',
    CANCELADO: 'CANCELADO'
});

module.exports = EstadoPedido;
