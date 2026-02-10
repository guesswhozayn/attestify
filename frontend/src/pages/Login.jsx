import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Button from '../components/shared/Button';
import GoogleLoginButton from '../components/GoogleLoginButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('INSTITUTE');
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
        navigate('/admin-dashboard');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gray-950">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-purple-500/20 mb-6 transform hover:scale-105 transition-transform duration-300">
              <Shield className="w-8 h-8 text-white" />
           </div>
           <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
           <p className="text-gray-400 text-lg">Sign in to your Attestify account</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          
          {/* Role Toggle Switch */}
          <div className="bg-gray-800/50 p-1.5 rounded-xl mb-8 flex relative">
            <div 
               className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-indigo-500 rounded-lg shadow-lg transition-all duration-300 ease-out ${selectedRole === 'INSTITUTE' ? 'left-1.5' : 'left-[calc(50%+4px)]'}`}
            ></div>
            <button
               className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300 ${selectedRole === 'INSTITUTE' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
               onClick={() => setSelectedRole('INSTITUTE')}
               type="button"
            >
               Institute
            </button>
            <button
               className={`flex-1 relative z-10 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300 ${selectedRole === 'STUDENT' ? 'text-white' : 'text-gray-400 hover:text-white'}`}
               onClick={() => setSelectedRole('STUDENT')}
               type="button"
            >
               Student
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-in shake">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <span className="text-red-200 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
                  placeholder={selectedRole === 'INSTITUTE' ? "admin@university.edu" : "student@university.edu"}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                 <label className="text-sm font-medium text-gray-300">Password</label>
                 <Link to="/forgot-password" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                   Forgot Password?
                 </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3.5 bg-gray-800/50 border border-gray-700 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200"
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
                 className="w-full justify-center py-4 text-base font-semibold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-300"
               >
                 {loading ? 'Signing in...' : 'Sign In'}
                 {!loading && <ArrowRight className="ml-2 w-5 h-5" />}
               </Button>
            </div>
          </form>

          <div className="my-8 flex items-center gap-4">
             <div className="h-px bg-gray-800 flex-1"></div>
             <span className="text-gray-500 text-sm font-medium">Or continue with</span>
             <div className="h-px bg-gray-800 flex-1"></div>
          </div>

          <GoogleLoginButton text="signin_with" />

          <p className="mt-8 text-center text-gray-400 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
