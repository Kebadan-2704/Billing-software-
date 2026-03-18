import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html, attachments, smtpConfig } = await req.json()

    if (!to || !subject || !html || !smtpConfig) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // SMTP Configuration from payload
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port),
      secure: smtpConfig.port === '465', // true for 465, false for other ports
      auth: {
        user: smtpConfig.user,
        pass: smtpConfig.pass,
      },
    })

    // Send mail with defined transport object
    const info = await transporter.sendMail({
      from: `"MD Billing Intelligence" <${smtpConfig.user}>`,
      to,
      subject,
      html,
      attachments: attachments || [],
    })

    console.log("Message sent: %s", info.messageId)
    return NextResponse.json({ success: true, messageId: info.messageId })
  } catch (error: any) {
    console.error("SMTP Error:", error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
