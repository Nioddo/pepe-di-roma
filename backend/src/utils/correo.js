const nodemailer = require('nodemailer');

// La casilla desde la que sale el correo se configura en backend/.env (ver .env.example).
// Sin esos datos el resto del sistema funciona igual: solo queda apagado el envío.

function leerConfiguracion() {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return null;
    }

    const puerto = Number(SMTP_PORT) || 587;
    return {
        host: SMTP_HOST,
        port: puerto,
        // 465 habla TLS desde el primer byte; 587 arranca en claro y sube con STARTTLS
        secure: SMTP_SECURE ? SMTP_SECURE === 'true' : puerto === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
        remitente: MAIL_FROM || SMTP_USER
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
