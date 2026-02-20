const userController = require('../controllers/userController');
const User = require('../models/User');
const Credential = require('../models/Credential');

// Mock User & Credential models
jest.mock('../models/User');
jest.mock('../models/Credential');

describe('Public Profile Search Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            query: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('searchIssuers', () => {
        it('should return 400 if query is missing', async () => {
            req.query = {};
            await userController.searchIssuers(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Search query is required' });
        });

        it('should return matched issuers based on name or institutionName', async () => {
            req.query = { query: 'Test' };
            const mockIssuers = [
                { _id: '1', name: 'Test University', avatar: 'url1', issuerDetails: { institutionName: 'Test UI' } },
                { _id: '2', name: 'Other', avatar: 'url2', issuerDetails: { institutionName: 'Test Inst' } }
            ];

            User.find.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockIssuers)
            });

            await userController.searchIssuers(req, res);

            expect(User.find).toHaveBeenCalledWith(expect.objectContaining({
                role: 'ISSUER',
                $or: expect.any(Array)
            }));
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                count: 2,
                issuers: [
                    { _id: '1', name: 'Test UI', avatar: 'url1' },
                    { _id: '2', name: 'Test Inst', avatar: 'url2' }
                ]
            }));
        });
    });

    describe('getPublicIssuerProfileByWallet', () => {
        it('should return 400 if walletAddress is missing', async () => {
            req.params = {};
            await userController.getPublicIssuerProfileByWallet(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Wallet address is required' });
        });

        it('should return issuer profile if found', async () => {
            const wallet = '0x123...';
            req.params = { walletAddress: wallet };
            const mockIssuer = {
                _id: 'issuer1',
                name: 'Issuer Name',
                avatar: 'avatar-url',
                university: 'Uni Name',
                about: 'About Issuer',
                email: 'issuer@test.com',
                role: 'ISSUER',
                createdAt: new Date(),
                issuerDetails: { officialEmailDomain: 'test.com' }
            };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockIssuer)
            });

            await userController.getPublicIssuerProfileByWallet(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                issuer: expect.objectContaining({
                    name: 'Issuer Name',
                    email: 'contact@test.com'
                })
            }));
        });

        it('should return 404 if issuer not found', async () => {
            req.params = { walletAddress: '0xnotfound' };
            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await userController.getPublicIssuerProfileByWallet(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Issuer not found' });
        });
    });

    describe('getPublicStudentProfile', () => {
        it('should return 404 if student not found', async () => {
            req.params = { walletAddress: '0xnonexistent' };
            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await userController.getPublicStudentProfile(req, res);
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Student not found' });
        });

        it('should return 403 if profile is private', async () => {
            req.params = { walletAddress: '0xprivate' };
            const mockStudent = {
                preferences: { visibility: false }
            };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockStudent)
            });

            await userController.getPublicStudentProfile(req, res);
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'This profile is private' });
        });

        it('should return student profile and credentials if public', async () => {
            const wallet = '0xstudent';
            req.params = { walletAddress: wallet };
            const mockStudent = {
                name: 'Student Name',
                avatar: 'student-avatar',
                university: 'Student Uni',
                preferences: { visibility: true }
            };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockStudent)
            });

            const mockCredentials = [
                { studentName: 'Student Name', type: 'Degree' }
            ];

            Credential.find.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockCredentials)
            });

            await userController.getPublicStudentProfile(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                student: expect.objectContaining({
                    name: 'Student Name'
                }),
                credentials: mockCredentials
            }));
        });
    });
});
