// Set dummy environment variables for tests
process.env.SEPOLIA_RPC_URL = 'http://localhost:8545';
process.env.ADMIN_PRIVATE_KEY = '0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
process.env.CONTRACT_ADDRESS = '0x0000000000000000000000000000000000000000';
process.env.JWT_SECRET = 'test-secret';

const credentialController = require('../controllers/credentialController');
const userController = require('../controllers/userController');
const verifyController = require('../controllers/verifyController');
const fileController = require('../controllers/fileController');
const Credential = require('../models/Credential');
const User = require('../models/User');

// Mock dependencies
jest.mock('../models/Credential');
jest.mock('../models/User');
jest.mock('../services/blockchainService');
jest.mock('../services/ipfsService');

describe('Security Loophole Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            user: { _id: 'user123', role: 'STUDENT', walletAddress: '0xstudent1' },
            params: {},
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
            setHeader: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('Credential Access Protection', () => {
        it('should prevent student from fetching credentials of another wallet', async () => {
            req.params.walletAddress = '0xvictim_wallet';
            
            await credentialController.getCredentialsByStudentWallet(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized access to credentials' });
            expect(Credential.find).not.toHaveBeenCalled();
        });

        it('should allow issuer to fetch credentials of any wallet', async () => {
            req.user.role = 'ISSUER';
            req.params.walletAddress = '0xstudent_wallet';
            
            Credential.find.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockResolvedValue([])
            });

            await credentialController.getCredentialsByStudentWallet(req, res);

            expect(res.status).not.toHaveBeenCalledWith(403);
            expect(Credential.find).toHaveBeenCalledWith({ studentWalletAddress: '0xstudent_wallet' });
        });
    });

    describe('IDOR Prevention in Revocation', () => {
        it('should prevent an issuer from revoking a credential they did not issue', async () => {
            req.user = { _id: 'issuerA', role: 'ISSUER' };
            req.params.id = 'cred123';
            
            Credential.findById.mockResolvedValue({
                _id: 'cred123',
                issuedBy: 'issuerB', // Different issuer
                isRevoked: false
            });

            await credentialController.revokeCredential(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.stringContaining('Only the original issuer can revoke')
            }));
        });

        it('should allow the original issuer to revoke', async () => {
            req.user = { _id: 'issuerA', role: 'ISSUER' };
            req.params.id = 'cred123';
            
            Credential.findById.mockResolvedValue({
                _id: 'cred123',
                issuedBy: 'issuerA',
                isRevoked: false,
                save: jest.fn().mockResolvedValue(true)
            });

            const blockchainService = require('../services/blockchainService');
            blockchainService.revokeCertificate.mockResolvedValue({ 
                transactionHash: '0xhash',
                blockNumber: 123
            });

            await credentialController.revokeCredential(req, res);

            expect(res.status).not.toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true
            }));
        });
    });

    describe('NoSQL ReDoS Protection', () => {
        it('should escape regex characters in search query', async () => {
            req.query.search = '.*?'; // Potential ReDoS payload
            
            Credential.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue([])
            });
            Credential.countDocuments.mockResolvedValue(0);

            await credentialController.getCredentials(req, res);

            // Verify that the query contains escaped characters
            const searchCall = Credential.find.mock.calls[0][0];
            expect(searchCall.$or[0].studentName.toString()).toContain('\\.\\*\\?');
        });
    });

    describe('Secure File Access', () => {
        it('should prevent downloading certificate of a private profile if not authorized', async () => {
            req.user = { _id: 'stranger', walletAddress: '0xstranger' };
            req.params.id = 'cred123';
            
            Credential.findById.mockResolvedValue({
                _id: 'cred123',
                studentWalletAddress: '0xprivate',
                ipfsCID: 'QmHash',
                issuedBy: 'issuerA'
            });

            User.findOne.mockResolvedValue({
                preferences: { visibility: false }
            });

            await fileController.downloadCertificate(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.stringContaining('private profile')
            }));
        });

        it('should allow owner to download certificate even if private', async () => {
            req.user = { _id: 'owner', walletAddress: '0xowner' };
            req.params.id = 'cred123';
            
            Credential.findById.mockResolvedValue({
                _id: 'cred123',
                studentWalletAddress: '0xowner',
                studentName: 'Test Student',
                ipfsCID: 'QmHash',
                issuedBy: 'issuerA'
            });

            const ipfsService = require('../services/ipfsService');
            ipfsService.getIPFSUrl.mockReturnValue('http://ipfs/hash');

            // Mock axios to avoid network call
            const axios = require('axios');
            jest.mock('axios');
            axios.mockResolvedValue({ data: { pipe: jest.fn() } });

            await fileController.downloadCertificate(req, res);

            expect(res.status).not.toHaveBeenCalledWith(403);
        });
    });

    describe('Restricted IPFS Proxy', () => {
        it('should reject unauthenticated requests to IPFS proxy', async () => {
            req.user = null;
            req.params.cid = 'QmHash';

            await fileController.getIPFSFile(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required to access IPFS proxy.' });
        });
    });

    describe('Token Revocation', () => {
        const { authenticate } = require('../middleware/auth');

        it('should reject a token with an old version', async () => {
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ userId: 'user123', tokenVersion: 0 }, process.env.JWT_SECRET);
            
            req.headers = { authorization: `Bearer ${token}` };
            User.findById.mockResolvedValue({ _id: 'user123', tokenVersion: 1, isActive: true });

            const next = jest.fn();
            await authenticate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: expect.stringContaining('revoked') });
            expect(next).not.toHaveBeenCalled();
        });

        it('should allow a token with the current version', async () => {
            const jwt = require('jsonwebtoken');
            const token = jwt.sign({ userId: 'user123', tokenVersion: 1 }, process.env.JWT_SECRET);
            
            req.headers = { authorization: `Bearer ${token}` };
            User.findById.mockResolvedValue({ _id: 'user123', tokenVersion: 1, isActive: true });

            const next = jest.fn();
            await authenticate(req, res, next);

            expect(next).toHaveBeenCalled();
        });
    });

    describe('Global Stats Privacy', () => {
        const networkController = require('../controllers/networkController');

        it('should not disclose student wallet addresses in network stats', async () => {
            const blockchainService = require('../services/blockchainService');
            blockchainService.getNetworkStats.mockResolvedValue({ blockNumber: 100, gasPrice: '1', connected: true });
            
            Credential.aggregate.mockResolvedValue([{
                counts: [{
                    totalIssued: 1,
                    totalRevoked: 0,
                    totalGasUsed: "100",
                    totalCostWei: "1000000000000000"
                }],
                recent: [{
                    transactionHash: '0x123',
                    studentWalletAddress: '0xSECRET' // This should be removed by the controller
                }]
            }]);

            await networkController.getNetworkStats(req, res);

            await networkController.getNetworkStats(req, res);

            // Verify that the aggregation pipeline includes a projection that excludes sensitive fields
            const aggregateCall = Credential.aggregate.mock.calls[0][0];
            const recentFacet = aggregateCall[0].$facet.recent;
            const projection = recentFacet.find(stage => stage.$project).$project;
            
            expect(projection).not.toHaveProperty('studentWalletAddress');
            expect(projection.transactionHash).toBe(1);
        });
    });
});
