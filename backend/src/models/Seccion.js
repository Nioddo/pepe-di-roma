class Seccion {
    constructor(id, titulo, orden, platos, carta, grupo = null, subtitulo = null, nota = null) {
        this.id = id;
        this.titulo = titulo;
        this.orden = orden;
        this.platos = platos;
        this.carta = carta;
        this.grupo = grupo;
        this.subtitulo = subtitulo;
        this.nota = nota;
    }
}

module.exports = Seccion;
