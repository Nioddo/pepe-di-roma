class ItemPedido {
    constructor(id, pedidoId, platoId, nombre, precioUnitario, cantidad) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.platoId = platoId;
        this.nombre = nombre;
        this.precioUnitario = precioUnitario;
        this.cantidad = cantidad;
    }
}

module.exports = ItemPedido;
