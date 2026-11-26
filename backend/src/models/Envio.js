class Envio {
    constructor(id, asunto, fecha, enviados, fallidos) {
        this.id = id;
        this.asunto = asunto;
        this.fecha = fecha;
        this.enviados = enviados;
        this.fallidos = fallidos;
    }
}

module.exports = Envio;
