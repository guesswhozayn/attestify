const fs = require('fs');
const path = require('path');
const emailService = require('../src/services/emailService');

// Mock environment variables if needed
process.env.EMAIL_USER = 'test@example.com';
process.env.EMAIL_PASS = 'password';
process.env.FRONTEND_URL = 'http://localhost:5173';

// Mock transporter to capture HTML instead of sending
emailService.transporter = {
    sendMail: async (mailOptions) => {
        const filename = `email-preview-${mailOptions.subject.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
        const filepath = path.join(__dirname, filename);
        fs.writeFileSync(filepath, mailOptions.html);
        console.log(`Generated preview: ${filepath}`);
        return true;
    }
};

async function generatePreviews() {
    console.log('Generating email previews...');

    // 1. Certificate Issued Email
    await emailService.sendCertificateIssued('student@example.com', {
        studentName: 'Alex Doe',
        university: 'Standford University',
        instituteLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Stanford_Cardinal_logo.svg/1200px-Stanford_Cardinal_logo.svg.png',
        tokenId: '12345678',
        issueDate: new Date(),
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        certificateLink: 'http://localhost:5173/certificate/123'
    });

    // 2. Welcome Email
    await emailService.sendWelcomeEmail('newuser@example.com', 'Jane Smith');

    console.log('Done!');
}

generatePreviews().catch(console.error);
