const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email service: EMAIL_USER or EMAIL_PASS not set. Emails will not be sent.');
      this.transporter = null;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } catch (error) {
       console.error('Email service: Failed to create transporter', error);
       this.transporter = null;
    }
  }

  // Shared Email Template Wrapper
  _wrapTemplate(title, content) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin-top: 40px; margin-bottom: 40px; }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
          .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
          .button { display: inline-block; background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; transition: background-color 0.2s; }
          .button:hover { background-color: #4338ca; }
          .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
          .detail-label { font-weight: 600; color: #6b7280; font-size: 14px; }
          .detail-value { color: #111827; font-weight: 500; font-size: 14px; text-align: right; }
          .hash-text { font-family: 'Monaco', 'Consolas', monospace; font-size: 11px; color: #6b7280; word-break: break-all; }
          .status-badge { display: inline-block; padding: 4px 12px; background-color: #ecfdf5; color: #059669; border-radius: 9999px; font-size: 12px; font-weight: 600; border: 1px solid #d1fae5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Attestify</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Attestify. All rights reserved.</p>
            <p>This is an automated message. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendCertificateIssued(to, data) {
    if (!this.transporter) {
        console.warn('Email service: Transporter not initialized. Skipping email.');
        return false;
    }

    const content = `
      <h2 style="color: #111827; margin-top: 0;">Certificate Issued Successfully</h2>
      <p style="margin-bottom: 24px;">Dear ${data.studentName},</p>
      
      <p>We are pleased to inform you that <strong>${data.university}</strong> has issued a new digital credential to your wallet. This certificate has been permanently recorded on the blockchain.</p>
      
      <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 24px 0; border: 1px solid #e5e7eb;">
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value"><span class="status-badge">Blockchain Verified</span></span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Credential ID</span>
          <span class="detail-value" style="font-family: monospace;">${data.id}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">University</span>
          <span class="detail-value">${data.university}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Issue Date</span>
          <span class="detail-value">${new Date(data.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div class="detail-row" style="border-bottom: none; display: block;">
          <span class="detail-label" style="display: block; margin-bottom: 4px;">Transaction Hash</span>
          <span class="detail-value hash-text" style="display: block; text-align: left;">${data.transactionHash}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${data.certificateLink}" class="button">View Certificate</a>
      </div>
      
      <p style="margin-top: 30px; font-size: 13px; color: #6b7280; text-align: center;">
        You can also verify this transaction on <a href="https://sepolia.etherscan.io/tx/${data.transactionHash}" style="color: #4f46e5;">Etherscan</a>.
      </p>
    `;

    const html = this._wrapTemplate('Certificate Issued', content);

    const mailOptions = {
      from: `"Attestify Notification" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Certificate Issued: ${data.university}`,
      html: html
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  async sendWelcomeEmail(to, name) {
    if (!this.transporter) {
        console.warn('Email service: Transporter not initialized. Skipping email.');
        return false;
    }

    const content = `
      <h2 style="color: #111827; margin-top: 0;">Welcome to Attestify!</h2>
      <p>Dear ${name},</p>
      
      <p>Thank you for joining <strong>Attestify</strong>, the decentralized credential verification platform. Your account has been successfully created.</p>
      
      <p>With your new account, you can:</p>
      <ul style="color: #4b5563; padding-left: 20px;">
        <li style="margin-bottom: 8px;">View and manage your digital certificates</li>
        <li style="margin-bottom: 8px;">Share verifiable credentials with employers</li>
        <li style="margin-bottom: 8px;">Verify the authenticity of documents instantly</li>
      </ul>

      <div style="text-align: center;">
        <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Dashboard</a>
      </div>
    `;

    const html = this._wrapTemplate('Welcome to Attestify', content);

    const mailOptions = {
      from: `"Attestify Team" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Welcome to the Future of Credentials',
      html: html
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Welcome email error:', error);
      return false;
    }
  }
}

module.exports = new EmailService();
