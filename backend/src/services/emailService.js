const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendCertificateIssued(to, data) {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Certificate Issued - Attestify',
      html: `
        <h2>Certificate Issued Successfully!</h2>
        <p>Dear ${data.studentName},</p>
        <p>Your certificate has been issued and recorded on the blockchain.</p>
        <ul>
          <li><strong>Registration Number:</strong> ${data.registrationNumber}</li>
          <li><strong>University:</strong> ${data.university}</li>
          <li><strong>Issue Date:</strong> ${new Date(data.issueDate).toLocaleDateString()}</li>
          <li><strong>Transaction Hash:</strong> ${data.transactionHash}</li>
        </ul>
        <p>You can view your certificate at: <a href="${process.env.FRONTEND_URL}/certificate/${data.id}">View Certificate</a></p>
        <p>Best regards,<br>Attestify Team</p>
      `
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
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: 'Welcome to Attestify',
      html: `
        <h2>Welcome to Attestify!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for registering with Attestify. Your account has been created successfully.</p>
        <p>You can now login and start managing your certificates.</p>
        <p>Best regards,<br>Attestify Team</p>
      `
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
