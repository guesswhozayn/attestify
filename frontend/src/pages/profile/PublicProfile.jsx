import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import { User, Mail, Building, Calendar, Wallet, Shield, Share2, Award, GraduationCap, CheckCircle, ExternalLink, Globe, Loader } from 'lucide-react';
import DetailedCertificateCard from '../../components/certificate/DetailedCertificateCard';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Button from '../../components/shared/Button';

const PublicProfile = () => {
    const { walletAddress } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await publicAPI.getStudentProfile(walletAddress);
                setData(response.data);
            } catch (err) {
                console.error('Error fetching public profile:', err);
                setError(err.response?.data?.error || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (walletAddress) {
            fetchProfile();
        }
    }, [walletAddress]);

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Profile link copied to clipboard!');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
                <LoadingSpinner size="lg" text="Fetching public profile..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                    <Shield className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Profile Unreachable</h2>
                <p className="text-gray-400 max-w-md mb-8">{error}</p>
                <Link to="/">
                    <Button variant="primary">Return Home</Button>
                </Link>
            </div>
        );
    }

    const { student, credentials } = data;

    return (
        <div className="min-h-screen bg-gray-950 text-white pb-20">
            {/* Header / Navbar Replacement for Public View */}
            <nav className="border-b border-gray-800 bg-gray-950/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Attestify
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Button onClick={handleShare} icon={Share2} variant="outline" size="sm">
                            Share Profile
                        </Button>
                        <Link to="/login">
                            <Button variant="primary" size="sm">Sign In</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="p-6 lg:p-10 max-w-7xl mx-auto space-y-10">
                {/* Profile Header */}
                <div className="relative bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
                    <div className="h-48 bg-gradient-to-r from-indigo-900 via-purple-900 to-gray-900 relative">
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:30px_30px]"></div>
                        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-gray-900 to-transparent"></div>
                    </div>
            
                    <div className="px-8 pb-10 flex flex-col md:flex-row items-center md:items-end gap-8 -mt-16 relative z-10 text-center md:text-left">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-2xl">
                                <div className="w-full h-full bg-gray-900 rounded-[1.4rem] flex items-center justify-center overflow-hidden">
                                    {student?.avatar ? (
                                        <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl font-bold text-white">
                                            {student?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-gray-900 p-1.5 rounded-full shadow-lg">
                                <div className="bg-emerald-500 w-5 h-5 rounded-full border-4 border-gray-900"></div>
                            </div>
                        </div>
            
                        <div className="flex-1 space-y-4">
                            <div>
                                <h1 className="text-4xl font-extrabold text-white mb-2">{student?.name}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-sm">
                                    <span className="text-gray-400 flex items-center gap-1.5 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50">
                                        <Building className="w-4 h-4 text-indigo-400" />
                                        {student?.university}
                                    </span>
                                    <span className="text-gray-400 flex items-center gap-1.5 bg-gray-800/50 px-3 py-1 rounded-full border border-gray-700/50">
                                        <Wallet className="w-4 h-4 text-emerald-400" />
                                        {walletAddress?.substring(0, 6)}...{walletAddress?.substring(38)}
                                    </span>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase tracking-wider">
                                        Verified Professional
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements Section */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-800 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Award className="w-6 h-6 text-indigo-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Verified Achievements</h2>
                        </div>
                        <span className="text-gray-500 text-sm font-medium">
                            {credentials?.length || 0} Records Found
                        </span>
                    </div>

                    {credentials && credentials.length > 0 ? (
                        <div className="grid grid-cols-1 gap-8">
                            {credentials.map((cred) => (
                                <DetailedCertificateCard 
                                    key={cred._id} 
                                    credential={cred} 
                                    metadata={cred.type === 'TRANSCRIPT' ? cred.transcriptData : cred.certificationData} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-gray-900/30 rounded-3xl border border-dashed border-gray-800">
                            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award className="w-8 h-8 text-gray-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-400">No public achievements found</h3>
                            <p className="text-gray-600">This student hasn't listed any public credentials yet.</p>
                        </div>
                    )}
                </div>

                {/* Proof of Authenticity */}
                <div className="bg-indigo-900/10 rounded-3xl p-8 border border-indigo-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Globe className="w-32 h-32 text-indigo-500" />
                    </div>
                    <div className="relative z-10 max-w-2xl">
                        <h3 className="text-xl font-bold text-indigo-200 mb-3 flex items-center gap-2">
                             <CheckCircle className="w-5 h-5" /> 
                             Blockchain Verified Profile
                        </h3>
                        <p className="text-indigo-300/80 leading-relaxed mb-6">
                            Every achievement listed on this profile is cryptographically signed and stored on the blockchain. 
                            The authenticity of these records can be verified independently without any third-party intervention.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/verify" className="inline-flex items-center text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Verify a specific credential
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="text-center py-12 border-t border-gray-900">
                <p className="text-gray-600 text-sm">
                    © {new Date().getFullYear()} Attestify Protocol. Decentralized Academic Identity.
                </p>
            </footer>
        </div>
    );
};

export default PublicProfile;
