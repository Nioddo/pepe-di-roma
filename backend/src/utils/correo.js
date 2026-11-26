const nodemailer = require('nodemailer');

// La casilla desde la que sale el correo se configura en backend/.env (ver .env.example);
// es la misma que usa utils/mailer.js para Promociones.
// Sin esos datos el resto del sistema funciona igual: solo queda apagado el envío.

function leerConfiguracion() {
    // las mismas variables que usa utils/mailer.js (Promociones); SMTP_* queda como nombre alternativo
    const env = process.env;
    const host = env.MAIL_HOST || env.SMTP_HOST;
    const usuario = env.MAIL_USER || env.SMTP_USER;
    const clave = env.MAIL_PASS || env.SMTP_PASS;
    const seguro = env.MAIL_SECURE || env.SMTP_SECURE;
    if (!host || !usuario || !clave) {
        return null;
    }

    const puerto = Number(env.MAIL_PORT || env.SMTP_PORT) || 465;
    return {
        host,
        port: puerto,
        // 465 habla TLS desde el primer byte; 587 arranca en claro y sube con STARTTLS
        secure: seguro ? seguro !== 'false' : puerto === 465,
        auth: { user: usuario, pass: clave },
        remitente: env.MAIL_FROM || usuario
    };
}

let transporte = null;

function obtenerTransporte() {
    const configuracion = leerConfiguracion();
    if (!configuracion) {
        return null;
    }
    if (!transporte) {
        const { remitente, ...smtp } = configuracion;
        // pool: una sola conexión para toda la tanda, en vez de una por destinatario
        transporte = nodemailer.createTransport({ ...smtp, pool: true, maxConnections: 1 });
    }
    return transporte;
}

function estaConfigurado() {
    return leerConfiguracion() !== null;
}

function remitente() {
    const configuracion = leerConfiguracion();
    return configuracion ? configuracion.remitente : null;
}

/** Comprueba usuario y contraseña contra el servidor antes de empezar a mandar. */
function verificar() {
    return obtenerTransporte().verify();
}

/** Un mail a una sola persona: nadie ve la dirección de los demás. */
function enviar({ para, asunto, html, texto }) {
    return obtenerTransporte().sendMail({
        from: remitente(),
        to: para,
        subject: asunto,
        html,
        text: texto,
        // las fotos llegan embebidas como data: y salen adjuntas al cuerpo (Gmail no muestra data:)
        attachDataUrls: true
    });
}

module.exports = {
    estaConfigurado,
    remitente,
    verificar,
    enviar
};
