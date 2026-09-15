class Pedido {
    constructor(id, clienteId, modalidad, metodoPago, direccion, items, estado, precioTotal, tiempoEstimadoMin, pagoRecibido) {
        this.id = id;
        this.clienteId = clienteId;
        this.modalidad = modalidad;
        this.metodoPago = metodoPago;
        this.direccion = direccion;
        this.items = items;
        this.estado = estado;
        this.precioTotal = precioTotal;
        this.tiempoEstimadoMin = tiempoEstimadoMin;
        this.pagoRecibido = pagoRecibido;
    }
}

module.exports = Pedido;
