class Pedido {
    constructor(id, clienteId, modalidad, metodoPago, direccion, items, estado, precioTotal, tiempoEstimadoMin, pagoRecibido, telefono = null, indicaciones = null, creadoEn = null) {
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
        this.telefono = telefono;
        this.indicaciones = indicaciones;
        this.creadoEn = creadoEn;
    }
}

module.exports = Pedido;
