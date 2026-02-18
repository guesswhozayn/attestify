const pdfService = require('../src/services/pdfService');
const fs = require('fs');
const path = require('path');

// Mock Data
const mockTranscriptData = {
    type: 'TRANSCRIPT',
    studentName: 'John Doe',
    studentWalletAddress: '0x1234567890abcdef1234567890abcdef12345678',
    university: 'Attestify University',
    issueDate: new Date(),
    credentialId: 'CRED-1234567890',
    verificationUrl: 'https://attestify.io/verify/CRED-1234567890',
    verificationUrl: 'https://attestify.io/verify/CRED-1234567890',
    institutionName: 'Attestify University',
    issuerWalletAddress: '0xIssuerWalletAddress123456',
    issuerRegistration: 'REG-2024-001',
    transcriptData: {
        program: 'Bachelor of Science in Computer Science',
        department: 'School of Engineering',
        admissionYear: '2020',
        graduationYear: '2024',
        cgpa: '3.85',
        courses: [
            { code: 'CS101', name: 'Intro to Programming', grade: 'A', credits: '4' },
            { code: 'CS102', name: 'Data Structures', grade: 'A-', credits: '4' },
            { code: 'MA101', name: 'Calculus I', grade: 'B+', credits: '3' },
            { code: 'PH101', name: 'Physics I', grade: 'B', credits: '4' },
            { code: 'CS201', name: 'Algorithms', grade: 'A', credits: '4' },
            { code: 'CS202', name: 'Operating Systems', grade: 'B+', credits: '4' },
            { code: 'MA201', name: 'Linear Algebra', grade: 'A', credits: '3' },
            { code: 'CS301', name: 'Database Systems', grade: 'A-', credits: '4' },
            { code: 'CS302', name: 'Software Engineering', grade: 'A', credits: '4' },
            { code: 'CS401', name: 'Artificial Intelligence', grade: 'A', credits: '4' },
            { code: 'CS402', name: 'Computer Networks', grade: 'B+', credits: '4' },
            { code: 'HU101', name: 'Technical Writing', grade: 'A', credits: '2' },
        ]
    }
};

const mockCertificateData = {
    type: 'CERTIFICATION',
    studentName: 'Jane Smith',
    studentWalletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    university: 'Attestify Academy',
    issueDate: new Date(),
    credentialId: 'CERT-0987654321',
    verificationUrl: 'https://attestify.io/verify/CERT-0987654321',
    verificationUrl: 'https://attestify.io/verify/CERT-0987654321',
    institutionName: 'Attestify Academy',
    issuerWalletAddress: '0xIssuerWalletAddress123456',
    issuerRegistration: 'REG-2024-001',
    certificationData: {
        title: 'Certified Blockchain Developer',
        level: 'Advanced',
        description: 'Demonstrated mastery in smart contract development and dApp architecture.'
    }
};



async function runTests() {
    const outputDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log('Generating Transcript...');
    try {
        await pdfService.generateCredentialPDF(
            mockTranscriptData, 
            path.join(outputDir, 'test-transcript.pdf')
        );
        console.log('Transcript generated at temp/test-transcript.pdf');
    } catch (err) {
        console.error('Transcript generation failed:', err);
    }

    console.log('Generating Certificate...');
    try {
        await pdfService.generateCredentialPDF(
            mockCertificateData, 
            path.join(outputDir, 'test-certificate.pdf')
        );
        console.log('Certificate generated at temp/test-certificate.pdf');
    } catch (err) {
        console.error('Certificate generation failed:', err);
    }
}

runTests();
