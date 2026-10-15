class Calificacion {
    constructor(id, usuarioId, firma, puntaje, mensaje, fecha, platoId = null, visible = true, respuesta = null, aspectos = {}, mozo = null) {
        this.id = id;
        this.usuarioId = usuarioId;
        this.firma = firma;
        this.puntaje = puntaje;
        this.mensaje = mensaje;
        this.fecha = fecha;
        this.platoId = platoId;
        this.visible = visible;
        this.respuesta = respuesta;
        this.atencion = aspectos.atencion ?? null;
        this.comida = aspectos.comida ?? null;
        this.espacio = aspectos.espacio ?? null;
        this.mozo = mozo;
    }
}

module.exports = Calificacion;
