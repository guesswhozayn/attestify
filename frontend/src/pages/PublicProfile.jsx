import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { publicAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getAvatarSrc } from '../utils/avatarUtils';
import {
    ShieldCheck,
    Building2,
    Wallet,
    Globe,
    Loader2,
    Award,
    Share2,
    CheckCircle,
    Shield,
    Settings,
    Copy,
    Mail,
    Hash,
} from 'lucide-react';
import CredentialBadge from '../components/credential/CredentialBadge';
import CredentialDetails from '../components/credential/CredentialDetails';
import Button from '../components/shared/Button';
import BackButton from '../components/shared/BackButton';
import Avatar from '../components/shared/Avatar';
import PoweredBy from '../components/shared/PoweredBy';

const Background = () => (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[20%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] mix-blend-screen" />
    </div>
);

const LoadingScreen = ({ isIssuer }) => (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative overflow-hidden font-sans">
        <Background />
        <div className="relative z-10 flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-6" />
            <p className="text-slate-400 animate-pulse font-medium tracking-wide uppercase text-sm">
                {isIssuer ? 'Verifying Issuer Identity...' : 'Verifying Identity on Blockchain...'}
            </p>
        </div>
    </div>
);

const CopyCard = ({ icon: Icon, title, subtitle, value, iconColor, iconBg }) => (
    <div className="bg-gray-900/30 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-gray-900/50 transition-colors group">
        <div className="flex items-center gap-4 mb-4">
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest">{subtitle}</p>
            </div>
        </div>
        <div className="p-3 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between">
            <span className="text-sm text-gray-300 font-mono truncate">{value}</span>
            <Button
                onClick={() => navigator.clipboard.writeText(value || '')}
                variant="ghost"
                size="sm"
                rounded="full"
                className="p-2! text-gray-500 hover:text-white"
            >
                <Copy className="w-4 h-4" />
            </Button>
        </div>
    </div>
);

const PublicProfile = ({ profileType }) => {
    const { walletAddress, id } = useParams();
    const navigate = useNavigate();
    const { user: authUser } = useAuth();

    const isIssuer = profileType === 'issuer';

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Student credential modal
    const [selectedCredential, setSelectedCredential] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (credential) => {
        setSelectedCredential(credential);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCredential(null);
    };

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                let response;
                if (isIssuer) {
                    response = id
                        ? await publicAPI.getIssuerProfile(id)
                        : await publicAPI.getIssuerProfileByWallet(walletAddress);
                    if (response.data.success) setData(response.data.issuer);
                } else {
                    response = await publicAPI.getStudentProfile(walletAddress);
                    setData(response.data); // { student, credentials }
                }
            } catch (err) {
                console.error('Error fetching public profile:', err);
                setError(err.response?.data?.error || 'Failed to load profile');
            } finally {
                setLoading(false);
            }
        };

        if (isIssuer ? (id || walletAddress) : walletAddress) {
            fetchProfile();
        }
    }, [isIssuer, id, walletAddress]);

    // Redirect on error
    useEffect(() => {
        if (error) {
            navigate('/search', {
                state: {
                    autoSearch: true,
                    query: id || walletAddress,
                    type: isIssuer ? 'issuer' : 'student',
                },
                replace: true,
            });
        }
    }, [error, navigate, id, walletAddress, isIssuer]);

    if (loading) return <LoadingScreen isIssuer={isIssuer} />;
    if (error || !data) return null;

    const student     = isIssuer ? null : data.student;
    const credentials = isIssuer ? null : data.credentials;
    const issuer      = isIssuer ? data : null;

    const displayName = isIssuer
        ? (issuer.details?.institutionName || issuer.name)
        : (student?.name || 'Unknown Student');

    const isOwnProfile = authUser?.walletAddress?.toLowerCase() === walletAddress?.toLowerCase();

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden flex flex-col">
            <Background />

            <BackButton fallbackPath="/search" />

            <main className="relative z-10 grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20 pb-20">

                <div className="relative mb-12">
                    <div className="absolute inset-0 bg-indigo-500/10 blur-[60px] -z-10 rounded-full" />

                    <div className="rounded-3xl p-8 md:p-10 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                            {/* Avatar */}
                            <div className="relative shrink-0 rounded-full">
                                <Avatar
                                    src={getAvatarSrc(isIssuer ? issuer.avatar : student?.avatar, displayName)}
                                    initials={displayName}
                                    size="lg"
                                />
                                <div className="absolute -bottom-1 -right-1 bg-gray-900 p-1 rounded-full border border-gray-800 z-20">
                                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
                                        <CheckCircle className="w-3.5 h-3.5 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 text-center md:text-left pt-1">
                                {/* Verified badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-widest mb-4">
                                    <ShieldCheck className="w-3 h-3" />
                                    {isIssuer ? 'Verified Issuer' : 'Identity Verified'}
                                </div>

                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                                    {displayName}
                                </h1>

                                {/* Role-specific meta */}
                                {isIssuer ? (
                                    <p className="text-gray-400 max-w-2xl mb-6 text-sm leading-relaxed mx-auto md:mx-0">
                                        {issuer.about || 'This issuer has been verified by the Attestify protocol and is authorized to issue on-chain credentials.'}
                                    </p>
                                ) : (
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
                                        <div className="flex items-center px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-gray-300 text-sm hover:bg-white/10 transition-colors">
                                            <Building2 className="w-4 h-4 mr-2 text-purple-400" />
                                            {student?.university || 'Unknown University'}
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-sm hover:bg-white/10 transition-colors cursor-pointer"
                                            title={walletAddress}
                                            onClick={() => navigator.clipboard.writeText(walletAddress)}>
                                            <Wallet className="w-4 h-4 text-emerald-400" />
                                            <span className="font-mono text-gray-400 hover:text-white transition-colors">
                                                {walletAddress.substring(0, 6)}...{walletAddress.slice(-4)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Action buttons */}
                                <div className="flex items-center justify-center md:justify-start gap-3 mb-8">
                                    {/* "Edit Profile" — only show to the profile owner (student) */}
                                    {!isIssuer && isOwnProfile && (
                                        <Button
                                            onClick={() => navigate('/profile')}
                                            icon={Settings}
                                            variant="white"
                                            rounded="full"
                                            size="sm"
                                            className="h-10 px-6 normal-case tracking-normal"
                                        >
                                            Edit Profile
                                        </Button>
                                    )}

                                    <Button
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert('Profile link copied!');
                                        }}
                                        variant="secondary"
                                        rounded="full"
                                        size="sm"
                                        className="h-10 w-10 px-0! py-0! group/share"
                                    >
                                        <Share2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    </Button>
                                </div>

                                {/* Stats bar — student only */}
                                {!isIssuer && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-white/5">
                                        <div>
                                            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Total Badges</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                                <span className="font-black text-2xl text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-purple-400">
                                                    {credentials?.length || 0}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Member Tier</span>
                                            <div className="flex items-center gap-2 text-white/70 font-bold text-sm uppercase tracking-tight">
                                                <Shield className="w-4 h-4 text-emerald-400" />
                                                Verified Entry
                                            </div>
                                        </div>
                                        <div className="hidden sm:block">
                                            <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/30 mb-2">Visibility</span>
                                            <div className="flex items-center gap-2 text-white/70 font-bold text-sm uppercase tracking-tight">
                                                <Globe className="w-4 h-4 text-indigo-400" />
                                                Public On-Chain
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Issuer Details Grid */}
                {isIssuer && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                        <CopyCard
                            icon={Mail}
                            title="Contact"
                            subtitle="Official Channel"
                            value={issuer.email}
                            iconColor="text-purple-400"
                            iconBg="bg-purple-500/10"
                        />
                        <CopyCard
                            icon={Hash}
                            title="Registry ID"
                            subtitle="On-Chain Identifier"
                            value={issuer._id}
                            iconColor="text-emerald-400"
                            iconBg="bg-emerald-500/10"
                        />
                    </div>
                )}

                {/* Student Credentials Grid */}
                {!isIssuer && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                        <div className="flex items-end justify-between mb-8 px-2">
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Verified Credentials</h2>
                                <p className="text-gray-400 text-sm">Blockchain-verified academic achievements and certifications.</p>
                            </div>
                            <div className="hidden sm:block">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-xs font-bold font-mono">
                                    <Award className="w-3.5 h-3.5" />
                                    {credentials?.length || 0} BADGES
                                </div>
                            </div>
                        </div>

                        {credentials && credentials.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                {credentials.map((cred, index) => (
                                    <CredentialBadge
                                        key={cred._id}
                                        credential={cred}
                                        index={index}
                                        onClick={() => openModal(cred)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="w-full bg-gray-900/40 border border-white/10 rounded-3xl p-16 text-center backdrop-blur-sm relative overflow-hidden group">
                                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 relative z-10 group-hover:scale-110 transition-transform duration-500">
                                    <Globe className="w-8 h-8 text-gray-600 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2 relative z-10">No Public Badges</h3>
                                <p className="text-gray-500 max-w-sm mx-auto text-sm relative z-10">
                                    This student hasn&apos;t added any achievements to their public achievement grid yet.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <PoweredBy className="pb-8" />

            {/* Credential modal — student only */}
            {!isIssuer && (
                <CredentialDetails
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    credential={selectedCredential}
                />
            )}
        </div>
    );
};

export default PublicProfile;
