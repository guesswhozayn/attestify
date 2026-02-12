import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Shield, User, Mail, Lock, Building, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Button from '../components/shared/Button';
import GoogleLoginButton from '../components/shared/GoogleLoginButton';

// Helper component for cleaner inputs
const FormInput = ({ label, icon: Icon, type = "text", ...props }) => (
  <div className="space-y-1.5">
     <label className="text-sm font-medium text-gray-300 ml-1">{label} <span className="text-red-500/70 text-xs">*</span></label>
     <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
           <Icon className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
        </div>
        <input
           type={type}
           className="block w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
           {...props}
        />
     </div>
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: '',
    registrationNumber: '', // Required for Institute
    walletAddress: '', // Initialize for student
    authorizedWalletAddress: '', // Initialize for institute
    officialEmailDomain: '', // Initialize for institute
    institutionName: '', // Initialize for institute
    role: 'INSTITUTE', // Default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register } = useAuth();
  const { showNotification } = useNotification();
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
      showNotification('Registration successful! Please login to continue.', 'success');
      navigate('/login');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };



  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-950 py-12">
       {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/10 rounded-full blur-[130px]" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl mb-4 shadow-lg shadow-purple-500/20 transform hover:scale-105 transition-transform">
            <Shield className="w-7 h-7 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Create Account</h1>
          <p className="text-gray-400">Join the decentralized credential verification network</p>
        </div>

        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 md:p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
           
           {/* Role Toggle */}
           <div className="bg-gray-800/50 p-1.5 rounded-xl mb-8 flex relative max-w-md mx-auto">
             <div 
               className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-indigo-500 rounded-lg shadow-lg transition-all duration-300 ease-out ${formData.role === 'INSTITUTE' ? 'left-1.5' : 'left-[calc(50%+4px)]'}`}
             ></div>
             <button
               className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300 ${formData.role === 'INSTITUTE' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
               onClick={() => setFormData({ ...formData, role: 'INSTITUTE' })}
               type="button"
             >
               Institute
             </button>
             <button
               className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300 ${formData.role === 'STUDENT' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
               onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
               type="button"
             >
               Student
             </button>
           </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in shake">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {formData.role !== 'INSTITUTE' && (
                  <FormInput
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alex Johnson"
                    icon={User}
                    required
                  />
               )}
               
               <FormInput
                 label="Email Address"
                 type="email"
                 name="email"
                 value={formData.email}
                 onChange={handleChange}
                 placeholder={formData.role === 'INSTITUTE' ? "institute@university.edu" : "student@university.edu"}
                 icon={Mail}
                 required
               />

               {formData.role === 'INSTITUTE' ? (
                 <>
                   <FormInput
                     label="Institution Name"
                     name="institutionName"
                     value={formData.institutionName}
                     onChange={handleChange}
                     placeholder="e.g. University of Tech"
                     icon={Building}
                     required
                   />
                   <div className="md:col-span-2">
                     <FormInput
                       label="Registration / License No"
                       name="registrationNumber"
                       value={formData.registrationNumber}
                       onChange={handleChange}
                       placeholder="e.g. REG-2024-X89"
                       icon={Shield}
                       required
                     />
                   </div>
                   <FormInput
                     label="Authorized Wallet Address"
                     name="authorizedWalletAddress"
                     value={formData.authorizedWalletAddress}
                     onChange={handleChange}
                     placeholder="0x..."
                     icon={Lock}
                     required
                   />
                   <FormInput
                     label="Official Email Domain"
                     name="officialEmailDomain"
                     value={formData.officialEmailDomain}
                     onChange={handleChange}
                     placeholder="@university.edu"
                     icon={Mail}
                     required
                   />
                 </>
               ) : (
                 <>
                   <FormInput
                     label="University / Institute"
                     name="university"
                     value={formData.university}
                     onChange={handleChange}
                     placeholder="Select your institute"
                     icon={Building}
                     required
                   />
                   <div className="md:col-span-2">
                     <FormInput
                       label="Wallet Address"
                       name="walletAddress"
                       value={formData.walletAddress}
                       onChange={handleChange}
                       placeholder="0x..."
                       icon={Lock}
                       required
                     />
                   </div>
                 </>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300 ml-1">Password <span className="text-red-500/70">*</span></label>
                  <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                     </div>
                     <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                        placeholder="••••••••"
                        required
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors focus:outline-none"
                     >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                     </button>
                  </div>
               </div>

               <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-300 ml-1">Confirm Password <span className="text-red-500/70">*</span></label>
                  <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                     </div>
                     <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                        placeholder="••••••••"
                        required
                     />
                  </div>
               </div>
            </div>

            <div className="pt-4">
               <Button
                 type="submit"
                 loading={loading}
                 disabled={loading}
                 className="w-full justify-center py-4 text-base font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300"
               >
                 {loading ? 'Creating Account...' : 'Create Account'}
                 {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
               </Button>
            </div>
          </form>

          <div className="my-8 flex items-center gap-4">
             <div className="h-px bg-gray-800 flex-1"></div>
             <span className="text-gray-500 text-sm font-medium">Or continue with</span>
             <div className="h-px bg-gray-800 flex-1"></div>
          </div>

          <GoogleLoginButton text="signup_with" />

          <p className="mt-8 text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
