const authController = require('../controllers/authController');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

// Mock dependencies
jest.mock('../models/User');
jest.mock('jsonwebtoken');
jest.mock('../services/emailService');

describe('Auth Workflow Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            protocol: 'http',
            get: jest.fn().mockReturnValue('localhost')
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test-secret';
    });

    describe('register', () => {
        it('should register a new STUDENT successfully', async () => {
            req.body = {
                name: 'Student User',
                email: 'student@test.com',
                password: 'password123',
                role: 'STUDENT',
                university: 'Test University',
                walletAddress: '0x1234567890123456789012345678901234567890'
            };

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({
                _id: 'user123',
                ...req.body,
                isActive: true
            });
            jwt.sign.mockReturnValue('mock-token');
            emailService.sendWelcomeEmail.mockResolvedValue({});

            await authController.register(req, res);

            expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Student User',
                email: 'student@test.com',
                role: 'STUDENT',
                walletAddress: '0x1234567890123456789012345678901234567890'
            }));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                token: 'mock-token',
                user: expect.objectContaining({
                    name: 'Student User',
                    role: 'STUDENT'
                })
            }));
        });

        it('should register a new ISSUER successfully with issuerDetails', async () => {
            req.body = {
                name: 'Contact Person',
                email: 'issuer@test.com',
                password: 'password123',
                role: 'ISSUER',
                university: 'Issuer Uni',
                institutionName: 'Official University Name',
                registrationNumber: 'REG123',
                authorizedWalletAddress: '0xauth...',
                officialEmailDomain: 'uni.edu',
                walletAddress: '0xissuer...'
            };

            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({
                _id: 'issuer123',
                ...req.body,
                name: 'Official University Name',
                issuerDetails: {
                    institutionName: 'Official University Name',
                    registrationNumber: 'REG123',
                    authorizedWalletAddress: '0xauth...',
                    officialEmailDomain: 'uni.edu'
                },
                isActive: true
            });
            jwt.sign.mockReturnValue('mock-token');

            await authController.register(req, res);

            expect(User.create).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Official University Name',
                role: 'ISSUER',
                issuerDetails: expect.objectContaining({
                    institutionName: 'Official University Name',
                    registrationNumber: 'REG123'
                })
            }));
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 400 if email is already registered', async () => {
            req.body = { email: 'existing@test.com' };
            User.findOne.mockResolvedValue({ email: 'existing@test.com' });

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Email already registered' });
        });

        it('should return 400 if wallet address is already registered', async () => {
            req.body = { email: 'new@test.com', walletAddress: '0xexisting' };
            User.findOne.mockImplementation(({ email, walletAddress }) => {
                if (email) return null;
                if (walletAddress) return { walletAddress: '0xexisting' };
            });

            await authController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Wallet address already registered' });
        });
    });

    describe('login', () => {
        it('should login successfully with correct credentials', async () => {
            req.body = {
                email: 'user@test.com',
                password: 'password123',
                selectedRole: 'STUDENT'
            };

            const mockUser = {
                _id: 'user123',
                email: 'user@test.com',
                role: 'STUDENT',
                isActive: true,
                comparePassword: jest.fn().mockResolvedValue(true),
                save: jest.fn().mockResolvedValue(true)
            };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });
            jwt.sign.mockReturnValue('mock-token');

            await authController.login(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                token: 'mock-token',
                user: expect.objectContaining({
                    email: 'user@test.com'
                })
            }));
        });

        it('should return 401 for invalid credentials', async () => {
            req.body = { email: 'user@test.com', password: 'wrong' };
            
            const mockUser = {
                role: 'STUDENT',
                isActive: true,
                comparePassword: jest.fn().mockResolvedValue(false)
            };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email or password' });
        });

        it('should return 403 if role does not match', async () => {
            req.body = { email: 'user@test.com', password: 'password123', selectedRole: 'ISSUER' };
            
            const mockUser = {
                role: 'STUDENT',
                isActive: true,
                comparePassword: jest.fn().mockResolvedValue(true)
            };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                error: expect.stringContaining('not registered as a issuer')
            }));
        });

        it('should return 403 if account is deactivated', async () => {
            req.body = { email: 'user@test.com', password: 'password123' };
            
            const mockUser = {
                isActive: false
            };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            await authController.login(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Account is deactivated' });
        });
    });
});
