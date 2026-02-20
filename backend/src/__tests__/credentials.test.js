// Set dummy environment variables for tests
process.env.SEPOLIA_RPC_URL = 'http://localhost:8545';
process.env.ADMIN_PRIVATE_KEY = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';
process.env.JWT_SECRET = 'test-secret';
process.env.FRONTEND_URL = 'http://localhost:3000';

const credentialController = require('../controllers/credentialController');
const Credential = require('../models/Credential');
const User = require('../models/User');
const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const pdfService = require('../services/pdfService');
const hashService = require('../services/hashService');
const emailService = require('../services/emailService');
const fs = require('fs');

// Mock dependencies
jest.mock('../models/Credential');
jest.mock('../models/User');
jest.mock('../services/blockchainService');
jest.mock('../services/ipfsService');
jest.mock('../services/pdfService');
jest.mock('../services/hashService');
jest.mock('../services/emailService');
jest.mock('fs');

describe('Credential Issuance Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            user: { _id: 'issuer123', role: 'ISSUER', walletAddress: '0xissuer', issuerDetails: { institutionName: 'Test Uni', registrationNumber: 'REG123' } },
            files: {},
            query: {},
            params: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
        
        // Setup default path/fs mocks
        fs.existsSync.mockReturnValue(true);
        fs.mkdirSync.mockImplementation(() => {});
        fs.unlinkSync.mockImplementation(() => {});
        fs.statSync.mockReturnValue({ size: 1024 });
    });

    describe('issueCredential', () => {
        it('should issue a single credential successfully', async () => {
            req.body = {
                studentWalletAddress: '0xstudent',
                studentName: 'Student Name',
                university: 'Test Uni',
                issueDate: '2026-02-20',
                type: 'CERTIFICATION'
            };

            const mockCredential = {
                _id: 'cred123',
                save: jest.fn().mockResolvedValue(true)
            };
            Credential.mockImplementation(() => mockCredential);

            pdfService.generateCredentialPDF.mockResolvedValue(true);
            hashService.generateSHA256.mockResolvedValue('hash123');
            ipfsService.uploadFile.mockResolvedValue({ ipfsHash: 'cid123' });
            ipfsService.uploadJSON.mockResolvedValue({ ipfsHash: 'metadata-cid' });
            ipfsService.getIPFSUrl.mockReturnValue('https://ipfs.io/ipfs/cid123');
            blockchainService.issueCertificate.mockResolvedValue({ transactionHash: 'tx123', blockNumber: 100, gasUsed: '21000', gasPrice: '10', totalCost: '210000' });
            blockchainService.issueSoulboundCredential.mockResolvedValue({ tokenId: 'token123' });
            User.findOne.mockResolvedValue({ email: 'student@test.com' });
            emailService.sendCertificateIssued.mockResolvedValue({ success: true });

            await credentialController.issueCredential(req, res);

            expect(Credential).toHaveBeenCalled();
            expect(pdfService.generateCredentialPDF).toHaveBeenCalled();
            expect(blockchainService.issueCertificate).toHaveBeenCalledWith('cred123', 'hash123', 'cid123');
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Credential issued successfully'
            }));
        });
    });

    describe('revokeCredential', () => {
        it('should revoke a credential successfully', async () => {
            const credId = 'cred123';
            req.params = { id: credId };
            req.body = { reason: 'Academic Fraud' };

            const mockCredential = {
                _id: credId,
                isRevoked: false,
                tokenId: 'token123',
                save: jest.fn().mockResolvedValue(true)
            };

            Credential.findById.mockResolvedValue(mockCredential);
            blockchainService.revokeCertificate.mockResolvedValue({ transactionHash: 'txRevoke', blockNumber: 101, gasUsed: '15000', gasPrice: '10', totalCost: '150000' });
            blockchainService.revokeSoulboundCredential.mockResolvedValue(true);

            await credentialController.revokeCredential(req, res);

            expect(mockCredential.isRevoked).toBe(true);
            expect(mockCredential.revocationReason).toBe('Academic Fraud');
            expect(blockchainService.revokeCertificate).toHaveBeenCalledWith(credId);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                message: 'Credential revoked successfully'
            }));
        });

        it('should return 404 if credential not found', async () => {
            req.params = { id: 'notfound' };
            Credential.findById.mockResolvedValue(null);

            await credentialController.revokeCredential(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Credential not found' });
        });

        it('should return 400 if already revoked', async () => {
            req.params = { id: 'cred123' };
            Credential.findById.mockResolvedValue({ isRevoked: true });

            await credentialController.revokeCredential(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Credential already revoked' });
        });
    });

    describe('getCredentials', () => {
        it('should return credentials for issuer', async () => {
            req.user.role = 'ISSUER';
            const mockCredentials = [{ studentName: 'S1' }, { studentName: 'S2' }];
            
            Credential.countDocuments.mockResolvedValue(2);
            Credential.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(mockCredentials)
            });

            await credentialController.getCredentials(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                credentials: mockCredentials
            }));
        });
    });

    describe('getStats', () => {
        it('should return correct stats for issuer', async () => {
            req.user.role = 'ISSUER';
            Credential.countDocuments.mockResolvedValue(10);
            Credential.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                select: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue([{ studentName: 'S1' }])
            });
            Credential.aggregate.mockResolvedValue([{ total: 5 }]);
            blockchainService.getBalance.mockResolvedValue('1.5');
            blockchainService.getNetworkStats.mockResolvedValue({ connected: true });

            await credentialController.getStats(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                stats: expect.objectContaining({
                    total: 10,
                    gasBalance: '1.5000'
                })
            }));
        });
    });

    describe('batchIssueCredentials', () => {
        it('should process a batch of credentials from CSV', async () => {
            const csvContent = 'studentName,studentWalletAddress,university,type\nStudent A,0x111,Uni A,CERTIFICATION\nStudent B,0x222,Uni B,CERTIFICATION';
            req.files = { file: [{ path: 'temp.csv' }] };
            
            // Mock CSV stream
            const Readable = require('stream').Readable;
            const s = new Readable();
            s.push(csvContent);
            s.push(null);
            fs.createReadStream.mockReturnValue(s);

            const mockCredential = {
                _id: 'batch1',
                save: jest.fn().mockResolvedValue(true),
                studentName: 'Student A',
                university: 'Uni A',
                issueDate: new Date(),
                tokenId: 'token1'
            };
            Credential.mockImplementation(() => mockCredential);

            pdfService.generateCredentialPDF.mockResolvedValue(true);
            hashService.generateSHA256.mockResolvedValue('hash');
            ipfsService.uploadFile.mockResolvedValue({ ipfsHash: 'cid' });
            ipfsService.uploadJSON.mockResolvedValue({ ipfsHash: 'metadata' });
            blockchainService.issueCertificateBatch.mockResolvedValue({ status: 'success', transactionHash: 'txBatch', blockNumber: 200, gasPrice: '10', totalCost: '500000' });
            blockchainService.issueSoulboundCredentialBatch.mockResolvedValue({ tokenIds: ['token1', 'token2'] });
            User.findOne.mockResolvedValue({ email: 's@test.com' });
            emailService.sendCertificateIssued.mockResolvedValue({ success: true });

            await credentialController.batchIssueCredentials(req, res);

            expect(blockchainService.issueCertificateBatch).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                summary: expect.objectContaining({ total: 2, success: 2 })
            }));
        });
    });
});
