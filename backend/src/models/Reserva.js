class Reserva {
    constructor(id, clienteId, fecha, horaInicio, cantidadIntegrantes, mesaId, estado, nombre = null, telefono = null) {
        this.id = id;
        this.clienteId = clienteId;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.duracionMin = 120;
        this.cantidadIntegrantes = cantidadIntegrantes;
        this.mesaId = mesaId;
        this.estado = estado;
        this.nombre = nombre;
        this.telefono = telefono;
    }
}

module.exports = Reserva;
