import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight, Building, ArrowLeft } from 'lucide-react';
import Button from '../components/shared/Button';
import GoogleLoginButton from '../components/shared/GoogleLoginButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('ISSUER');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    const result = await login(email, password, selectedRole);
    
    if (result.success) {
      if (selectedRole === 'STUDENT') {
        navigate('/student-dashboard');
      } else {
        navigate('/issuer-dashboard');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans flex items-center justify-center relative overflow-hidden p-6 md:p-12">
      
      {/* Back to Home */}
      <Link to="/" className="absolute top-6 left-6 sm:top-10 sm:left-10 z-50 flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
        <div className="w-10 h-10 rounded-full bg-black/40 border border-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/20 transition-all">
            <ArrowLeft className="w-5 h-5" />
        </div>
        <span className="font-bold text-sm hidden sm:block">Back</span>
      </Link>
      
      {/* Background Elements */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-700"></div>
          <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 relative z-10 items-center">
        
        {/* Left Side: Branding (Free Floating) */}
        <div className="flex flex-col space-y-8 animate-in slide-in-from-left-8 duration-700">
             
             {/* Logo */}
             <div>
                <Link to="/" className="inline-flex items-center gap-4 group">
                   <div className="relative w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm">
                      <Shield className="w-10 h-10 text-indigo-400" />
                   </div>
                   <span className="text-4xl font-bold tracking-tight text-white">Attestify</span>
                </Link>
             </div>

             {/* Slogan */}
             <div className="max-w-xl">
                <h1 className="text-7xl font-bold text-white tracking-tighter leading-[1.1] mb-8">
                  Trust is <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-purple-300 drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    Programmable.
                  </span>
                </h1>
                <p className="text-gray-400 text-2xl leading-relaxed">
                  Issue tamper-proof academic credentials on Ethereum. Verifiable instantly, owned forever.
                </p>
             </div>

             {/* Trusted By */}
             <div className="pt-4">
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
           <div className="mb-8">
             <h2 className="text-2xl font-bold tracking-tight mb-2">Welcome Back</h2>
             <p className="text-gray-400">Sign in to manage your credentials.</p>
           </div>

            {/* Role Toggle Switch */}
            <div className="bg-black/40 p-1 rounded-full mb-8 flex relative border border-white/5">
              <div 
                 className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-full shadow-lg transition-all duration-300 ease-out ${selectedRole === 'ISSUER' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
              ></div>
              <button
                 className={`flex-1 relative z-10 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 ${selectedRole === 'ISSUER' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                 onClick={() => setSelectedRole('ISSUER')}
                 type="button"
              >
                 Issuer
              </button>
              <button
                 className={`flex-1 relative z-10 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 ${selectedRole === 'STUDENT' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                 onClick={() => setSelectedRole('STUDENT')}
                 type="button"
              >
                 Student
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in shake">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <span className="text-red-200 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 ml-4 uppercase tracking-wider">Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200"
                    placeholder={selectedRole === 'ISSUER' ? "admin@university.edu" : "student@university.edu"}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-4">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                   <Link to="/forgot-password" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                     Forgot?
                   </Link>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              <div className="pt-2">
                 <Button
                   type="submit"
                   loading={loading}
                   disabled={loading}
                   className="w-full justify-center py-3.5 text-base font-bold bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.5)] transition-all duration-300 rounded-xl"
                 >
                   {loading ? 'Signing in...' : 'Sign In'}
                   {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
                 </Button>
              </div>
            </form>

            <div className="my-6 flex items-center gap-4">
               <div className="h-px bg-white/5 flex-1"></div>
               <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">Or</span>
               <div className="h-px bg-white/5 flex-1"></div>
            </div>

            <GoogleLoginButton text="signin_with" className="w-full justify-center py-3.5 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all" />
            
            <p className="mt-8 text-center text-gray-400 text-sm">
              New to Attestify?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                Create an account
              </Link>
            </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
