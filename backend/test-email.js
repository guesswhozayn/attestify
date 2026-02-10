const nodemailer = require('nodemailer');
require('dotenv').config();

const testEmail = async () => {
  console.log('Testing Email Service...');
  
  if (!process.env.EMAIL_USER) console.error('MISSING: EMAIL_USER');
  if (!process.env.EMAIL_PASS) console.error('MISSING: EMAIL_PASS');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Environment variables check FAILED.');
      return;
  }
  
  console.log(`Using user: ${process.env.EMAIL_USER}`);
  // Do not log password for security

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.verify();
    console.log('Transporter verification SUCCESS.');
  } catch (error) {
    console.error('Transporter verification FAILED:', error.message);
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to self
    subject: 'Test Email from Attestify Debug Script',
    text: 'If you receive this, the email service configuration is correct.'
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Email sending FAILED:', error.message);
  }
};

testEmail();
