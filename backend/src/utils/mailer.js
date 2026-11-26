const nodemailer = require('nodemailer');
const Messages = require('../enums/Messages');
const { ServiceUnavailableError } = require('../exceptions/AppError');

let transporte = null;

function obtenerTransporte() {
    if (transporte) {
        return transporte;
    }

    const { MAIL_HOST, MAIL_PORT, MAIL_SECURE, MAIL_USER, MAIL_PASS } = process.env;
    if (!MAIL_HOST || !MAIL_USER || !MAIL_PASS) {
        throw new ServiceUnavailableError(Messages.PROMOCION_MAIL_NO_CONFIGURADO);
    }

    transporte = nodemailer.createTransport({
        host: MAIL_HOST,
        port: Number(MAIL_PORT) || 465,
        secure: MAIL_SECURE !== 'false',
        auth: { user: MAIL_USER, pass: MAIL_PASS }
    });
    return transporte;
}

function remitente() {
    return process.env.MAIL_FROM || process.env.MAIL_USER;
}

function enviarMail({ para, asunto, texto, html }) {
    return obtenerTransporte().sendMail({ from: remitente(), to: para, subject: asunto, text: texto, html });
}

module.exports = { enviarMail, obtenerTransporte };
