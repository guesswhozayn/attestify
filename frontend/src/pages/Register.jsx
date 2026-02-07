import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Mail, Lock, Building, AlertCircle } from 'lucide-react';
import Input from '../components/shared/Input';
import Button from '../components/shared/Button';
import GoogleLoginButton from '../components/GoogleLoginButton';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    registrationNumber: '',
    walletAddress: '', // Initialize for student
    authorizedWalletAddress: '', // Initialize for institute
    officialEmailDomain: '', // Initialize for institute
    institutionName: '', // Initialize for institute
    role: 'INSTITUTE', // Default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    const result = await register(formData);
    
    if (result.success) {
      if (formData.role === 'STUDENT') {
        navigate('/student-dashboard');
      } else {
        navigate('/admin-dashboard');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">Join Attestify to start issuing credentials</p>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl p-8">
           {/* Role Toggle */}
           <div className="flex p-1 bg-gray-700 rounded-lg mb-6">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  formData.role === 'INSTITUTE'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setFormData({ ...formData, role: 'INSTITUTE' })}
                type="button"
              >
                Institute
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  formData.role === 'STUDENT'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
                onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                type="button"
              >
                Student
              </button>
           </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              icon={User}
              required
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={formData.role === 'INSTITUTE' ? "admin@university.com" : "student@university.com"}
              icon={Mail}
              required
            />
            {formData.role === 'INSTITUTE' ? (
              <>
                <Input
                  label="Institution Name"
                  name="institutionName"
                  value={formData.institutionName}
                  onChange={handleChange}
                  placeholder="University of Chakwal"
                  icon={Building}
                  required
                />
                <Input
                  label="Registration / License Number"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="REG-12345"
                  icon={Shield}
                  required
                />
                 <Input
                  label="Authorized Wallet Address"
                  name="authorizedWalletAddress"
                  value={formData.authorizedWalletAddress}
                  onChange={handleChange}
                  placeholder="0x..."
                  icon={Lock}
                  required
                />
                 <Input
                  label="Official Email Domain"
                  name="officialEmailDomain"
                  value={formData.officialEmailDomain}
                  onChange={handleChange}
                  placeholder="@uoc.edu.pk"
                  icon={Mail}
                  required
                />
              </>
            ) : (
              <>
                <Input
                  label="University"
                  name="university"
                  value={formData.university}
                  onChange={handleChange}
                  placeholder="Your University"
                  icon={Building}
                  required
                />
                <Input
                  label="Registration Number (Roll No)"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  placeholder="2024-CS-001"
                  icon={User}
                  required
                />
                <Input
                  label="Wallet Address"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleChange}
                  placeholder="0x..."
                  icon={Lock}
                  required
                />
              </>
            )}
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              required
            />

            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              Create Account
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
              </div>
            </div>

            <GoogleLoginButton text="signup_with" />
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-purple-400 hover:text-purple-300">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
