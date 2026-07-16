import nodemailer from 'nodemailer'

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000'

function getTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  }
  return null
}

function logToken(token: string, tipo: string, email: string) {
  console.log(`
╔══════════════════════════════════════════════════╗
║        CORREO NO CONFIGURADO (DEV)              ║
╠══════════════════════════════════════════════════╣
║  Tipo: ${tipo.padEnd(39)}║
║  Email: ${email.padEnd(38)}║
║  Token: ${token.padEnd(38)}║
║                                                  ║
║  Link: ${(FRONTEND_URL + '/verificar-correo?token=' + token).padEnd(26)}║
╚══════════════════════════════════════════════════╝
`)
}

export async function sendVerificationEmail(email: string, nombre: string, token: string) {
  const link = `${FRONTEND_URL}/verificar-correo?token=${token}`
  const transporter = getTransporter()

  if (!transporter) {
    logToken(token, 'VERIFICACION_EMAIL', email)
    return
  }

  try {
    await transporter.sendMail({
      from: `"GalaxyPos" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Bienvenido a GalaxyPos - Verifica tu correo',
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
          <div style="background:linear-gradient(135deg,#ff6b35,#e55a2b);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:24px;">🔥 GalaxyPos</h1>
          </div>
          <div style="background:#1a1a2e;padding:40px;border-radius:0 0 12px 12px;">
            <h2 style="color:white;margin-top:0;">Hola ${nombre},</h2>
            <p style="color:#a0aec0;line-height:1.6;">Gracias por registrarte en GalaxyPos. Para activar tu cuenta y comenzar a digitalizar tu restaurante, haz clic en el siguiente botón:</p>
            <div style="text-align:center;margin:30px 0;">
              <a href="${link}" style="background:linear-gradient(135deg,#ff6b35,#e55a2b);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">Verificar mi Cuenta</a>
            </div>
            <p style="color:#a0aec0;font-size:14px;">O copia este enlace en tu navegador:</p>
            <p style="color:#8892a0;font-size:12px;word-break:break-all;">${link}</p>
            <hr style="border-color:rgba(255,255,255,0.1);margin:30px 0;">
            <p style="color:#8892a0;font-size:12px;">Si no creaste esta cuenta, ignora este mensaje.</p>
          </div>
        </div>
      `
    })
    console.log(`Correo de verificación enviado a ${email}`)
  } catch (error) {
    console.error('Error enviando correo de verificación:', error)
    logToken(token, 'VERIFICACION_EMAIL', email)
  }
}

export async function sendRecoveryEmail(email: string, nombre: string, token: string) {
  const link = `${FRONTEND_URL}/restablecer-password?token=${token}`
  const transporter = getTransporter()

  if (!transporter) {
    logToken(token, 'RECUPERACION_PASSWORD', email)
    return
  }

  try {
    await transporter.sendMail({
      from: `"GalaxyPos" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'GalaxyPos - Recuperación de Contraseña',
      html: `
        <div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;">
          <div style="background:linear-gradient(135deg,#ff6b35,#e55a2b);padding:30px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:24px;">🔐 GalaxyPos</h1>
          </div>
          <div style="background:#1a1a2e;padding:40px;border-radius:0 0 12px 12px;">
            <h2 style="color:white;margin-top:0;">Recupera tu acceso</h2>
            <p style="color:#a0aec0;line-height:1.6;">Hola ${nombre}, hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente botón para crear una nueva:</p>
            <p style="color:#8892a0;font-size:13px;">Este enlace expira en 1 hora.</p>
            <div style="text-align:center;margin:30px 0;">
              <a href="${link}" style="background:linear-gradient(135deg,#ff6b35,#e55a2b);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:16px;">Restablecer Contraseña</a>
            </div>
            <p style="color:#a0aec0;font-size:14px;">O copia este enlace:</p>
            <p style="color:#8892a0;font-size:12px;word-break:break-all;">${link}</p>
            <hr style="border-color:rgba(255,255,255,0.1);margin:30px 0;">
            <p style="color:#8892a0;font-size:12px;">Si no solicitaste este cambio, ignora este mensaje.</p>
          </div>
        </div>
      `
    })
    console.log(`Correo de recuperación enviado a ${email}`)
  } catch (error) {
    console.error('Error enviando correo de recuperación:', error)
    logToken(token, 'RECUPERACION_PASSWORD', email)
  }
}
