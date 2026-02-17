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
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
          
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background-color: #000000; 
            margin: 0; 
            padding: 0; 
            -webkit-font-smoothing: antialiased; 
            color: #ffffff;
          }
          .container { 
            max-width: 600px; 
            margin: 40px auto; 
            background-color: #0a0a0a; 
            border-radius: 32px; 
            overflow: hidden; 
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.8);
          }
          .header { 
            padding: 50px 40px 30px 40px; 
            text-align: center; 
          }
          .logo-text {
            font-size: 28px;
            font-weight: 900;
            letter-spacing: -0.05em;
            color: #ffffff;
            margin: 0;
            text-transform: lowercase;
          }
          .logo-dot {
            color: #6366f1;
          }
          .content { 
            padding: 0 40px 50px 40px; 
            color: #94a3b8; 
            line-height: 1.7; 
            font-size: 16px;
          }
          .button { 
            display: inline-block; 
            background-color: #ffffff; 
            color: #000000 !important; 
            padding: 18px 36px; 
            text-decoration: none; 
            border-radius: 18px; 
            font-weight: 800; 
            font-size: 15px; 
            margin-top: 30px; 
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            transition: all 0.3s ease;
          }
          .button-secondary { 
            display: inline-block; 
            background-color: rgba(255, 255, 255, 0.05); 
            border: 1px solid rgba(255, 255, 255, 0.1); 
            color: #ffffff !important; 
            padding: 16px 32px; 
            text-decoration: none; 
            border-radius: 18px; 
            font-weight: 700; 
            font-size: 14px; 
            margin-top: 15px; 
            text-align: center; 
            backdrop-blur: 10px;
          }
          .footer { 
            padding: 40px; 
            text-align: center; 
            color: #475569; 
            font-size: 11px; 
            border-top: 1px solid rgba(255, 255, 255, 0.03); 
            background-color: #050505;
          }
          .card { 
            background-color: rgba(255, 255, 255, 0.03); 
            border-radius: 24px; 
            padding: 24px; 
            margin: 30px 0; 
            border: 1px solid rgba(255, 255, 255, 0.05); 
          }
          .detail-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 14px 0; 
            border-bottom: 1px solid rgba(255, 255, 255, 0.03); 
          }
          .detail-row:last-child {
            border-bottom: none;
          }
          .detail-label { 
            font-weight: 600; 
            color: #64748b; 
            font-size: 11px; 
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .detail-value { 
            color: #ffffff; 
            font-weight: 700; 
            font-size: 13px; 
          }
          .hash-container { 
            background-color: rgba(0, 0, 0, 0.3); 
            padding: 16px; 
            border-radius: 12px; 
            margin-top: 10px; 
            border: 1px solid rgba(255, 255, 255, 0.05); 
          }
          .hash-text { 
            font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; 
            font-size: 11px; 
            color: #818cf8; 
            word-break: break-all; 
            line-height: 1.5;
          }
          .badge { 
            display: inline-block; 
            padding: 6px 14px; 
            background: rgba(99, 102, 241, 0.1); 
            color: #818cf8; 
            border-radius: 10px; 
            font-size: 10px; 
            font-weight: 800; 
            border: 1px solid rgba(99, 102, 241, 0.2); 
            text-transform: uppercase; 
            letter-spacing: 0.15em; 
          }
          .info-box {
            background: rgba(255, 255, 255, 0.02);
            border-radius: 20px;
            padding: 24px;
            margin-top: 40px;
            border: 1px dotted rgba(255, 255, 255, 0.1);
          }
          .info-title {
            color: #ffffff;
            font-weight: 800;
            font-size: 12px;
            margin-bottom: 10px;
            display: block;
            text-transform: uppercase;
            letter-spacing: 0.1em;
          }
          .info-text {
            color: #64748b;
            font-size: 13px;
            margin: 0;
            line-height: 1.6;
          }
          h2 {
            color: #ffffff;
            font-weight: 800;
            font-size: 24px;
            letter-spacing: -0.02em;
            margin-top: 0;
          }
          p {
            margin-bottom: 20px;
          }
          strong {
            color: #ffffff;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="logo-text">attestify<span class="logo-dot">.</span></h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Attestify Protocol. Decentralized Truth System.</p>
            <p>This is an automated securely-issued notification from the Attestify blockchain network.</p>
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
      <div style="text-align: center; margin-bottom: 30px;">
        <div class="badge">Verified On-Chain</div>
      </div>
      
      <h2 style="text-align: center;">Credential Issued</h2>
      <p style="text-align: center; color: #64748b;">A permanent cryptographic record has been generated for <strong>${data.studentName}</strong>.</p>
      
      <div class="card">
        <div class="detail-row">
          <span class="detail-label">Institution</span>
          <span class="detail-value">${data.university}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Token ID</span>
          <span class="detail-value" style="font-family: monospace;">#${data.tokenId || data.id.substring(0, 8)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Issue Date</span>
          <span class="detail-value">${new Date(data.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        <div style="margin-top: 24px;">
          <span class="detail-label">Transaction Hash</span>
          <div class="hash-container">
            <span class="hash-text">${data.transactionHash}</span>
          </div>
        </div>
      </div>

      <div class="info-box">
        <span class="info-title">The Standard of Truth</span>
        <p class="info-text">
          This credential is anchored to the Ethereum blockchain as a Soulbound Token. It is non-transferable and provides a tamper-proof guarantee of authenticity that can be verified globally, forever.
        </p>
      </div>

      <div style="text-align: center; margin-top: 40px;">
        <a href="${data.certificateLink}" class="button">View Credential</a>
        <br>
        <a href="https://sepolia.etherscan.io/tx/${data.transactionHash}" class="button-secondary">Explore on Etherscan</a>
      </div>
    `;

    const html = this._wrapTemplate('Credential Issued', content);

    const mailOptions = {
      from: `"Attestify" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `New Credential Issued: ${data.university}`,
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
      <h2 style="text-align: center;">Welcome to the Network.</h2>
      <p style="text-align: center;">The future of decentralized credentialing is here. We're glad to have you, <strong>${name}</strong>.</p>
      
      <div class="card">
        <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #ffffff;">Your Account Capabilities:</p>
        <div class="detail-row">
          <span class="detail-label">Verification</span>
          <span class="detail-value">Instant On-Chain Proof</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Management</span>
          <span class="detail-value">Universal Dashboard</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Sharing</span>
          <span class="detail-value">Direct Credential Access</span>
        </div>
      </div>

      <div class="info-box">
        <span class="info-title">Secured by Cryptography</span>
        <p class="info-text">
          Attestify leverages decentralized identity protocols to ensure your academic records remain sovereign, private, and immutable. Welcome to the engine of truth.
        </p>
      </div>

      <div style="text-align: center; margin-top: 40px;">
        <a href="${process.env.FRONTEND_URL}/login" class="button">Access Dashboard</a>
      </div>
    `;

    const html = this._wrapTemplate('Welcome to Attestify', content);

    const mailOptions = {
      from: `"Attestify" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: 'Welcome to Attestify',
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
