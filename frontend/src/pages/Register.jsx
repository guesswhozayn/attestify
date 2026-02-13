import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Shield, User, Mail, Lock, Building, AlertCircle, ArrowRight, Eye, EyeOff, Wallet } from 'lucide-react';
import Button from '../components/shared/Button';
import GoogleLoginButton from '../components/shared/GoogleLoginButton';
import blockchainService from '../services/blockchain';

// Helper component for cleaner inputs
const FormInput = ({ label, icon: Icon, type = "text", ...props }) => (
  <div className="space-y-1.5">
     <label className="text-xs font-bold text-gray-400 ml-4 uppercase tracking-wider">{label} <span className="text-red-500/70 text-[10px] align-top">*</span></label>
     <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
           <Icon className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
        </div>
        <input
           type={type}
           className="block w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200"
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

  const handleConnectWallet = async (field) => {
    try {
      const address = await blockchainService.connectWallet();
      setFormData(prev => ({ ...prev, [field]: address }));
      showNotification('Wallet connected successfully!', 'success');
    } catch (error) {
      console.error(error);
      showNotification(error.message || 'Failed to connect wallet', 'error');
    }
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
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans flex items-center justify-center relative overflow-hidden p-4 md:p-8">
      
       {/* Background Elements */}
       <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-700"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
       </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative z-10 items-center">
          
        {/* Left Side: Branding (Free Floating) */}
        <div className="flex flex-col space-y-8 animate-in slide-in-from-left-8 duration-700 order-last lg:order-first"> 
           {/* Order change for mobile: Form first, Branding last on small screens, Branding first on large */}
             
             {/* Logo */}
             <div className="hidden lg:block">
                <Link to="/" className="inline-flex items-center gap-3 group">
                   <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                      <Shield className="w-7 h-7 text-white" />
                   </div>
                   <span className="text-3xl font-bold tracking-tight text-white">Attestify</span>
                </Link>
             </div>

             {/* Slogan */}
             <div className="max-w-lg hidden lg:block">
                <h1 className="text-5xl font-bold text-white tracking-tighter leading-[1.1] mb-6">
                  The Future of <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                    Academic Trust.
                  </span>
                </h1>
                <p className="text-gray-400 text-xl leading-relaxed">
                  Join the network. Issue or verify credentials instantly upon Ethereum.
                </p>
             </div>

             {/* Trusted By */}
             <div className="pt-4 hidden lg:block">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Trusted by innovative teams</p>
                <div className="flex gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                        <Building className="w-6 h-6" />
                        <span className="font-bold text-lg">MIT</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                        <Building className="w-6 h-6" />
                        <span className="font-bold text-lg">Stanford</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                        <Building className="w-6 h-6" />
                        <span className="font-bold text-lg">Oxford</span>
                    </div>
                </div>
             </div>
        </div>

        {/* Right Side: Form (Glass Card) */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl animate-in slide-in-from-right-8 duration-700">
            {/* Mobile Logo */}
           <div className="lg:hidden pb-8 text-center">
              <Link to="/" className="inline-flex items-center gap-2 group">
                 <Shield className="w-8 h-8 text-indigo-400" />
                 <span className="text-xl font-bold tracking-tight">Attestify</span>
              </Link>
           </div>
           
           <div className="mb-8">
             <h2 className="text-2xl font-bold tracking-tight mb-2">Create Account</h2>
             <p className="text-gray-400">Join the decentralized trust network.</p>
           </div>
            
           {/* Role Toggle */}
           <div className="bg-black/40 p-1 rounded-full mb-8 flex relative border border-white/5">
             <div 
               className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-full shadow-lg transition-all duration-300 ease-out ${formData.role === 'INSTITUTE' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
             ></div>
             <button
               className={`flex-1 relative z-10 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 ${formData.role === 'INSTITUTE' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
               onClick={() => setFormData({ ...formData, role: 'INSTITUTE' })}
               type="button"
             >
               Institute
             </button>
             <button
               className={`flex-1 relative z-10 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 ${formData.role === 'STUDENT' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
               onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
               type="button"
             >
               Student
             </button>
           </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in shake">
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
                   <div className="md:col-span-2 space-y-2">
                     <div className="flex items-end gap-3">
                        <div className="flex-1">
                           <FormInput
                             label="Authorized Wallet Address"
                             name="authorizedWalletAddress"
                             value={formData.authorizedWalletAddress}
                             onChange={handleChange}
                             placeholder="0x..."
                             icon={Lock}
                             required
                           />
                        </div>
                        <Button
                           type="button"
                           variant="secondary"
                           onClick={() => handleConnectWallet('authorizedWalletAddress')}
                           icon={Wallet}
                           className="mb-[1px] h-[52px] whitespace-nowrap rounded-xl"
                        >
                           Connect
                        </Button>
                     </div>
                   </div>
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
                   <div className="md:col-span-2 space-y-2">
                     <div className="flex items-end gap-3">
                        <div className="flex-1">
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
                        <Button
                           type="button"
                           variant="secondary"
                           onClick={() => handleConnectWallet('walletAddress')}
                           icon={Wallet}
                           className="mb-[1px] h-[52px] whitespace-nowrap rounded-xl"
                        >
                           Connect
                        </Button>
                     </div>
                   </div>
                 </>
               )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
               <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-400 ml-4 uppercase tracking-wider">Password <span className="text-red-500/70 text-[10px] align-top">*</span></label>
                  <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                     </div>
                     <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-12 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200"
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
                  <label className="text-xs font-bold text-gray-400 ml-4 uppercase tracking-wider">Confirm Password <span className="text-red-500/70 text-[10px] align-top">*</span></label>
                  <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                     </div>
                     <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200"
                        placeholder="••••••••"
                        required
                     />
                  </div>
               </div>
            </div>

            <div className="pt-2">
               <Button
                 type="submit"
                 loading={loading}
                 disabled={loading}
                 className="w-full justify-center py-3.5 text-base font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300 rounded-xl"
               >
                 {loading ? 'Creating Account...' : 'Create Account'}
                 {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
               </Button>
            </div>
          </form>

          <div className="my-6 flex items-center gap-4">
             <div className="h-px bg-white/5 flex-1"></div>
             <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">Or continue with</span>
             <div className="h-px bg-white/5 flex-1"></div>
          </div>

          <GoogleLoginButton text="signup_with" className="w-full justify-center py-3.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all" />

          <p className="mt-8 text-center text-gray-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
              Sign In
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;
