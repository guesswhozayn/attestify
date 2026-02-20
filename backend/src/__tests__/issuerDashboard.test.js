const userController = require('../controllers/userController');
const User = require('../models/User');

// Mock dependencies
jest.mock('../models/User');

describe('Issuer Dashboard & Profile Tests', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            user: { _id: 'issuer123', role: 'ISSUER', preferences: { toObject: () => ({ visibility: true }) } },
            params: {},
            protocol: 'http',
            get: jest.fn().mockReturnValue('localhost:5000'),
            file: null
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('updateProfile', () => {
        it('should update issuer profile successfully', async () => {
            req.body = {
                name: 'Updated Uni',
                about: 'New description',
                issuerDetails: {
                    branding: {
                        primaryColor: '#6366f1'
                    }
                }
            };

            const mockUser = { _id: 'issuer123', ...req.body };
            User.findByIdAndUpdate.mockResolvedValue(mockUser);

            await userController.updateProfile(req, res);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                'issuer123',
                expect.objectContaining({
                    $set: expect.objectContaining({
                        name: 'Updated Uni',
                        about: 'New description',
                        'issuerDetails.branding.primaryColor': '#6366f1'
                    })
                }),
                expect.any(Object)
            );
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                user: mockUser
            });
        });

        it('should update institution details successfully', async () => {
             req.body = {
                 issuerDetails: {
                     institutionName: 'Global Tech Institute',
                     registrationNumber: 'GT-999'
                 }
             };

             const mockUser = { _id: 'issuer123', ...req.body };
             User.findByIdAndUpdate.mockResolvedValue(mockUser);

             await userController.updateProfile(req, res);

             expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                 'issuer123',
                 expect.objectContaining({
                     $set: expect.objectContaining({
                         'issuerDetails.institutionName': 'Global Tech Institute',
                         'issuerDetails.registrationNumber': 'GT-999'
                     })
                 }),
                 expect.any(Object)
             );
        });
    });

    describe('uploadAvatar', () => {
        it('should upload avatar and return URL', async () => {
            req.file = { filename: 'avatar.png' };
            const expectedUrl = 'http://localhost:5000/uploads/avatar.png';
            
            User.findByIdAndUpdate.mockResolvedValue({ _id: 'issuer123', avatar: expectedUrl });

            await userController.uploadAvatar(req, res);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                'issuer123',
                { avatar: expectedUrl },
                { new: true }
            );
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                avatar: expectedUrl,
                user: expect.any(Object)
            });
        });

        it('should return 400 if no file provided', async () => {
            req.file = null;

            await userController.uploadAvatar(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Please upload a file' });
        });
    });
});
