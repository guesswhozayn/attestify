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
          body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #030712; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
          .container { max-width: 600px; margin: 20px auto; background-color: #111827; border-radius: 24px; overflow: hidden; border: 1px solid #1f2937; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
          .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px 30px; text-align: center; color: white; position: relative; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px; text-transform: uppercase; }
          .noise { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; pointer-events: none; }
          .content { padding: 40px 30px; color: #d1d5db; line-height: 1.6; }
          .button { display: inline-block; background: linear-gradient(to right, #4f46e5, #7c3aed); color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 12px; font-weight: 700; font-size: 15px; margin-top: 20px; box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.4); text-align: center; }
          .button-outline { display: inline-block; background-color: transparent; border: 2px solid #374151; color: #9ca3af !important; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px; margin-top: 10px; text-align: center; }
          .footer { background-color: #0f172a; padding: 30px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #1f2937; }
          .card { background-color: #1f2937; border-radius: 16px; padding: 24px; margin: 24px 0; border: 1px solid #374151; }
          .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #374151; }
          .detail-label { font-weight: 600; color: #9ca3af; font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; }
          .detail-value { color: #f3f4f6; font-weight: 500; font-size: 14px; text-align: right; }
          .hash-container { background-color: #030712; padding: 12px; border-radius: 8px; margin-top: 8px; border: 1px solid #1f2937; }
          .hash-text { font-family: 'ui-monospace', 'SFMono-Regular', Menlo, Monaco, Consolas, monospace; font-size: 11px; color: #6366f1; word-break: break-all; }
          .sbt-badge { display: inline-block; padding: 4px 12px; background: linear-gradient(to right, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1)); color: #818cf8; border-radius: 9999px; font-size: 11px; font-weight: 700; border: 1px solid rgba(129, 140, 248, 0.3); text-transform: uppercase; letter-spacing: 0.05em; }
          .institute-logo { max-width: 120px; max-height: 60px; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="noise"></div>
            <h1>Attestify</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Attestify Protocol. Decentralized Trust.</p>
            <p>This is a secure on-chain notification. No action is required unless specified.</p>
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
      ${data.instituteLogo ? `<img src="${data.instituteLogo}" alt="${data.university}" class="institute-logo">` : ''}
      
      <h2 style="color: #ffffff; margin-top: 0; text-align: center; font-size: 24px;">Credential Successfully Issued</h2>
      <p style="text-align: center; color: #9ca3af;">Dear <strong>${data.studentName}</strong>,</p>
      
      <p style="text-align: center;">We are pleased to inform you that <strong>${data.university}</strong> has issued a new digital credential. This represents a permanent, verifiable record of your achievement.</p>
      
      <div class="card">
        <div style="text-align: center, margin-bottom: 20px;">
            <div class="sbt-badge">Soulbound Token Minted</div>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">Status</span>
          <span class="detail-value" style="color: #10b981;">✓ On-Chain Verified</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Token ID</span>
          <span class="detail-value" style="font-family: monospace; color: #818cf8;">#${data.tokenId || data.id.substring(0, 8)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Institution</span>
          <span class="detail-value">${data.university}</span>
        </div>
        <div class="detail-row" style="border-bottom: none;">
          <span class="detail-label">Issue Date</span>
          <span class="detail-value">${new Date(data.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        <div style="margin-top: 20px;">
          <span class="detail-label">Blockchain Transaction</span>
          <div class="hash-container">
            <span class="hash-text">${data.transactionHash}</span>
          </div>
        </div>
      </div>

      <div style="text-align: center; display: grid; gap: 12px;">
        <a href="${data.certificateLink}" class="button">Access Certificate Dashboard</a>
        <a href="https://sepolia.etherscan.io/tx/${data.transactionHash}" class="button-outline">View On-Chain Proof (Etherscan)</a>
      </div>
      
      <p style="margin-top: 40px; font-size: 13px; color: #6b7280; text-align: center; padding: 0 20px;">
        This credential is stored as a <strong>Soulbound Token (SBT)</strong>. It is non-transferable and belongs exclusively to your wallet address.
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
