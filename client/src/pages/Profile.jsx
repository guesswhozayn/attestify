import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { userAPI } from '../services/api';
import {
    User,
    Mail,
    Building,
    Wallet,
    Shield,
    Activity,
    Edit2,
    Save,
    X,
    Copy,
    Award,
    Globe,
    Phone,
    MapPin,
    CheckCircle2,
    Link2,
    GraduationCap,
    Calendar,
    Hash,
    ExternalLink
} from 'lucide-react';
import Button from '../components/shared/Button';
import Input from '../components/shared/Input';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const { showNotification } = useNotification();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [linkingWallet, setLinkingWallet] = useState(false);
    const [connectedAddress, setConnectedAddress] = useState('');
    const [isCopied, setIsCopied] = useState(false);

    const isIssuer = user?.role === 'ISSUER';

    const registeredWallet =
        user?.issuerDetails?.authorizedWalletAddress ||
        user?.issuerDetails?.walletAddress ||
        user?.walletAddress ||
        user?.studentDetails?.walletAddress ||
        '';

    useEffect(() => {
        const detectWallet = async () => {
            if (typeof window.ethereum !== 'undefined') {
                try {
                    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                    if (accounts && accounts.length > 0) {
                        setConnectedAddress(accounts[0]);
                    }
                } catch (err) {
                    console.error('Error detecting wallet:', err);
                }

                const handleAccountsChanged = (accounts) => {
                    setConnectedAddress(accounts?.[0] || '');
                };
                window.ethereum.on('accountsChanged', handleAccountsChanged);
                return () => window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
        detectWallet();
    }, []);

    const studentData = user?.preferences?.studentDetails || user?.studentDetails || {};

    const [formData, setFormData] = useState(() => ({
        name: user?.name || '',
        title: user?.title || '',
        university: user?.university || '',
        about: user?.about || '',
        studentId: studentData.studentId || '',
        graduationYear: studentData.graduationYear || '',
        degreeLevel: studentData.degreeLevel || '',
        enrollmentStatus: studentData.enrollmentStatus || 'Active',
        linkedin: studentData.linkedin || '',
        github: studentData.github || '',
        institutionName: user?.issuerDetails?.institutionName || user?.name || '',
        registrationNumber: user?.issuerDetails?.registrationNumber || '',
        website: user?.issuerDetails?.website || '',
        contactEmail: user?.issuerDetails?.contactEmail || '',
        phone: user?.issuerDetails?.phone || '',
        address: user?.issuerDetails?.address || '',
        accreditation: user?.issuerDetails?.accreditation || ''
    }));
    const [prevUser, setPrevUser] = useState(user);

    if (user !== prevUser) {
        setPrevUser(user);
        const currentStudentData = user?.preferences?.studentDetails || user?.studentDetails || {};
        setFormData({
            name: user?.name || '',
            title: user?.title || '',
            university: user?.university || '',
            about: user?.about || '',
            studentId: currentStudentData.studentId || '',
            graduationYear: currentStudentData.graduationYear || '',
            degreeLevel: currentStudentData.degreeLevel || '',
            enrollmentStatus: currentStudentData.enrollmentStatus || 'Active',
            linkedin: currentStudentData.linkedin || '',
            github: currentStudentData.github || '',
            institutionName: user?.issuerDetails?.institutionName || user?.name || '',
            registrationNumber: user?.issuerDetails?.registrationNumber || '',
            website: user?.issuerDetails?.website || '',
            contactEmail: user?.issuerDetails?.contactEmail || '',
            phone: user?.issuerDetails?.phone || '',
            address: user?.issuerDetails?.address || '',
            accreditation: user?.issuerDetails?.accreditation || ''
        });
    }

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                about: formData.about
            };

            if (isIssuer) {
                payload.issuerDetails = {
                    ...user?.issuerDetails,
                    institutionName: formData.institutionName || formData.name,
                    registrationNumber: formData.registrationNumber,
                    website: formData.website,
                    contactEmail: formData.contactEmail,
                    phone: formData.phone,
                    address: formData.address,
                    accreditation: formData.accreditation
                };
            } else {
                payload.title = formData.title;
                payload.university = formData.university;
                payload.studentDetails = {
                    studentId: formData.studentId,
                    graduationYear: formData.graduationYear,
                    degreeLevel: formData.degreeLevel,
                    enrollmentStatus: formData.enrollmentStatus,
                    linkedin: formData.linkedin,
                    github: formData.github
                };
            }

            const response = await userAPI.updateProfile(payload);
            if (response.data.success) {
                updateUser(response.data.user);
                setIsEditing(false);
                showNotification('Profile updated successfully', 'success');
            }
        } catch (error) {
            console.error('Update failed', error);
            showNotification(error.response?.data?.error || 'Failed to update profile', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleLinkConnectedWallet = async () => {
        let target = connectedAddress;
        if (!target && typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                target = accounts?.[0] || '';
                setConnectedAddress(target);
            } catch {
                showNotification('Please authorize wallet connection in your browser extension', 'error');
                return;
            }
        }

        if (!target) {
            showNotification('No Ethereum wallet detected in browser', 'error');
            return;
        }

        setLinkingWallet(true);
        try {
            const response = await userAPI.updateProfile({ walletAddress: target });
            if (response.data.success) {
                updateUser(response.data.user);
                showNotification('Wallet linked to profile successfully', 'success');
            }
        } catch (error) {
            showNotification(error.response?.data?.error || 'Could not link wallet', 'error');
        } finally {
            setLinkingWallet(false);
        }
    };

    const copyAddress = (address) => {
        if (!address) return;
        navigator.clipboard.writeText(address);
        setIsCopied(true);
        showNotification('Address copied to clipboard', 'success');
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="w-full bg-[#F8F9FA] text-stone-900 pb-20 px-4 sm:px-6 lg:px-8 pt-8 max-w-[1400px] mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#EAECF0]">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                        {isIssuer ? 'Institution Profile' : 'Student Profile'}
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-500 mt-1">
                        {isIssuer
                            ? 'Official academic registry details and cryptographic signing credentials.'
                            : 'Personal academic identity and registered student wallet.'}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <Button
                                onClick={() => setIsEditing(false)}
                                variant="outline"
                                icon={X}
                                size="sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                loading={loading}
                                variant="primary"
                                icon={Save}
                                size="sm"
                            >
                                Save
                            </Button>
                        </>
                    ) : (
                        <Button
                            onClick={() => setIsEditing(true)}
                            variant="outline"
                            icon={Edit2}
                            size="sm"
                        >
                            Edit
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-[#EAECF0] shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-100">
                        <div>
                            <span className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block">
                                {isIssuer ? 'Accredited Institution' : 'Enrolled Student'}
                            </span>
                            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight mt-0.5">
                                {user?.issuerDetails?.institutionName || user?.name || (isIssuer ? 'Institution' : 'Student')}
                            </h2>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 border border-stone-200/60 text-stone-700 text-xs font-medium self-start sm:self-auto">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {isIssuer ? 'Verified Registry Identity' : 'Verified Student'}
                        </span>
                    </div>

                    {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                                label={isIssuer ? "Institution Name" : "Full Name"}
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                icon={isIssuer ? Building : User}
                            />
                            {!isIssuer && (
                                <>
                                    <Input
                                        label="University / Institution"
                                        value={formData.university}
                                        onChange={(e) => setFormData({...formData, university: e.target.value})}
                                        placeholder="e.g. Stanford University"
                                        icon={Building}
                                    />
                                    <Input
                                        label="Degree Program / Major"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        placeholder="e.g. B.S. in Computer Science"
                                        icon={Award}
                                    />
                                    <Input
                                        label="Student ID / Roll Number"
                                        value={formData.studentId}
                                        onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                                        placeholder="e.g. STU-2024-8842"
                                        icon={Hash}
                                    />
                                    <Input
                                        label="Degree Level"
                                        value={formData.degreeLevel}
                                        onChange={(e) => setFormData({...formData, degreeLevel: e.target.value})}
                                        placeholder="e.g. Undergraduate, Master's"
                                        icon={GraduationCap}
                                    />
                                    <Input
                                        label="Graduation / Completion Year"
                                        value={formData.graduationYear}
                                        onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}
                                        placeholder="e.g. 2026"
                                        icon={Calendar}
                                    />
                                    <Input
                                        label="Enrollment Status"
                                        value={formData.enrollmentStatus}
                                        onChange={(e) => setFormData({...formData, enrollmentStatus: e.target.value})}
                                        placeholder="Active, Graduated, Alum"
                                        icon={CheckCircle2}
                                    />
                                    <Input
                                        label="LinkedIn Profile URL"
                                        value={formData.linkedin}
                                        onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
                                        placeholder="https://linkedin.com/in/username"
                                        icon={Globe}
                                    />
                                    <Input
                                        label="GitHub / Portfolio URL"
                                        value={formData.github}
                                        onChange={(e) => setFormData({...formData, github: e.target.value})}
                                        placeholder="https://github.com/username"
                                        icon={ExternalLink}
                                    />
                                </>
                            )}
                            {isIssuer && (
                                <>
                                    <Input
                                        label="Registration / License Number"
                                        value={formData.registrationNumber}
                                        onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                                        icon={Shield}
                                    />
                                    <Input
                                        label="Official Website"
                                        value={formData.website}
                                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                                        placeholder="https://university.edu"
                                        icon={Globe}
                                    />
                                    <Input
                                        label="Accreditation / Governing Body"
                                        value={formData.accreditation}
                                        onChange={(e) => setFormData({...formData, accreditation: e.target.value})}
                                        placeholder="e.g. Higher Education Commission, ABET"
                                        icon={Award}
                                    />
                                    <Input
                                        label="Official Contact Email"
                                        value={formData.contactEmail}
                                        onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                                        placeholder="credentials@university.edu"
                                        icon={Mail}
                                    />
                                    <Input
                                        label="Official Contact Phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        placeholder="+1 (555) 000-0000"
                                        icon={Phone}
                                    />
                                    <div className="sm:col-span-2">
                                        <Input
                                            label="Campus / Headquarters Address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            placeholder="123 University Ave, City, Country"
                                            icon={MapPin}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <dl className="text-xs">
                            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                <dt className="text-stone-500 font-medium">Account Email</dt>
                                <dd className="sm:col-span-2 text-stone-900 font-mono mt-1 sm:mt-0">{user?.email}</dd>
                            </div>
                            {isIssuer ? (
                                <>
                                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                        <dt className="text-stone-500 font-medium">License / Registration</dt>
                                        <dd className="sm:col-span-2 text-stone-900 font-medium mt-1 sm:mt-0">
                                            {user?.issuerDetails?.registrationNumber || 'Not recorded'}
                                        </dd>
                                    </div>
                                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                        <dt className="text-stone-500 font-medium">Accreditation Body</dt>
                                        <dd className="sm:col-span-2 text-stone-900 font-medium mt-1 sm:mt-0">
                                            {user?.issuerDetails?.accreditation || 'Not recorded'}
                                        </dd>
                                    </div>
                                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                        <dt className="text-stone-500 font-medium">Official Website</dt>
                                        <dd className="sm:col-span-2 text-stone-900 font-medium mt-1 sm:mt-0">
                                            {user?.issuerDetails?.website ? (
                                                <a
                                                    href={user.issuerDetails.website}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 hover:text-indigo-500 underline transition-colors"
                                                >
                                                    {user.issuerDetails.website}
                                                </a>
                                            ) : (
                                                'Not recorded'
                                            )}
                                        </dd>
                                    </div>
                                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                        <dt className="text-stone-500 font-medium">Contact Email</dt>
                                        <dd className="sm:col-span-2 text-stone-900 font-mono mt-1 sm:mt-0">
                                            {user?.issuerDetails?.contactEmail || user?.email}
                                        </dd>
                                    </div>
                                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                        <dt className="text-stone-500 font-medium">Phone</dt>
                                        <dd className="sm:col-span-2 text-stone-900 font-medium mt-1 sm:mt-0">
                                            {user?.issuerDetails?.phone || 'Not recorded'}
                                        </dd>
                                    </div>
                                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                        <dt className="text-stone-500 font-medium">Headquarters</dt>
                                        <dd className="sm:col-span-2 text-stone-900 font-medium mt-1 sm:mt-0">
                                            {user?.issuerDetails?.address || 'Not recorded'}
                                        </dd>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                        <dt className="text-stone-500 font-medium">University / Institution</dt>
                                        <dd className="sm:col-span-2 text-stone-900 font-medium mt-1 sm:mt-0">
                                            {user?.university || 'Not specified'}
                                        </dd>
                                    </div>
                                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                        <dt className="text-stone-500 font-medium">Program / Major</dt>
                                        <dd className="sm:col-span-2 text-stone-900 font-medium mt-1 sm:mt-0">
                                            {user?.title || 'Student'}
                                        </dd>
                                    </div>
                                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                        <dt className="text-stone-500 font-medium">Student ID</dt>
                                        <dd className="sm:col-span-2 text-stone-900 font-mono mt-1 sm:mt-0">
                                            {studentData.studentId || 'Not recorded'}
                                        </dd>
                                    </div>
                                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                        <dt className="text-stone-500 font-medium">Degree Level</dt>
                                        <dd className="sm:col-span-2 text-stone-900 font-medium mt-1 sm:mt-0">
                                            {studentData.degreeLevel || 'Not recorded'}
                                        </dd>
                                    </div>
                                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                        <dt className="text-stone-500 font-medium">Graduation Year</dt>
                                        <dd className="sm:col-span-2 text-stone-900 font-medium mt-1 sm:mt-0">
                                            {studentData.graduationYear || 'Not recorded'}
                                        </dd>
                                    </div>
                                    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                        <dt className="text-stone-500 font-medium">Enrollment Status</dt>
                                        <dd className="sm:col-span-2 text-stone-900 font-medium mt-1 sm:mt-0">
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[11px] font-medium border border-stone-200/60">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                {studentData.enrollmentStatus || 'Active'}
                                            </span>
                                        </dd>
                                    </div>
                                    {studentData.linkedin && (
                                        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                            <dt className="text-stone-500 font-medium">LinkedIn</dt>
                                            <dd className="sm:col-span-2 text-stone-900 font-medium mt-1 sm:mt-0">
                                                <a
                                                    href={studentData.linkedin.startsWith('http') ? studentData.linkedin : `https://${studentData.linkedin}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 hover:text-indigo-500 underline transition-colors"
                                                >
                                                    {studentData.linkedin}
                                                </a>
                                            </dd>
                                        </div>
                                    )}
                                    {studentData.github && (
                                        <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 items-center">
                                            <dt className="text-stone-500 font-medium">GitHub / Portfolio</dt>
                                            <dd className="sm:col-span-2 text-stone-900 font-medium mt-1 sm:mt-0">
                                                <a
                                                    href={studentData.github.startsWith('http') ? studentData.github : `https://${studentData.github}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 hover:text-indigo-500 underline transition-colors"
                                                >
                                                    {studentData.github}
                                                </a>
                                            </dd>
                                        </div>
                                    )}
                                </>
                            )}
                        </dl>
                    )}

                    <div className="space-y-2 pt-2">
                        <label className="text-xs font-semibold text-stone-700 block">
                            {isIssuer ? 'Institutional Overview' : 'Student Overview'}
                        </label>
                        {isEditing ? (
                            <textarea
                                value={formData.about}
                                onChange={(e) => setFormData({...formData, about: e.target.value})}
                                placeholder={isIssuer ? "Describe the institution, departments, or issuing authority..." : "Brief academic bio or field of study..."}
                                rows={3}
                                className="w-full p-3 bg-stone-50 focus:bg-white border border-stone-200 focus:border-stone-400 rounded-xl text-xs font-medium text-stone-900 focus:outline-none transition-all"
                            />
                        ) : (
                            <p className="text-xs text-stone-600 leading-relaxed bg-stone-50 p-3.5 rounded-xl border border-stone-200/60">
                                {user?.about || (isIssuer ? 'No institutional description provided.' : 'No student bio provided.')}
                            </p>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-5">
                    <div className="bg-white rounded-2xl p-6 border border-[#EAECF0] shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                                <Wallet className="w-4 h-4 text-stone-500" />
                                {isIssuer ? 'Signing Wallet' : 'Account Wallet'}
                            </span>
                            {registeredWallet && (
                                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Authorized
                                </span>
                            )}
                        </div>

                        <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                                <span className="text-[10px] text-stone-400 uppercase font-mono block">Registered address</span>
                                <span className="font-mono text-xs text-stone-800 font-medium truncate block">
                                    {registeredWallet || 'No wallet registered'}
                                </span>
                            </div>
                            {registeredWallet && (
                                <button
                                    onClick={() => copyAddress(registeredWallet)}
                                    className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors cursor-pointer shrink-0"
                                    title="Copy address"
                                >
                                    {isCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            )}
                        </div>

                        {!registeredWallet && (
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
                                <p className="text-xs text-amber-800">
                                    {connectedAddress ? (
                                        <>Detected: <span className="font-mono font-bold">{connectedAddress.slice(0, 6)}...{connectedAddress.slice(-4)}</span></>
                                    ) : (
                                        'Connect MetaMask or browser wallet to link.'
                                    )}
                                </p>
                                <Button
                                    onClick={handleLinkConnectedWallet}
                                    loading={linkingWallet}
                                    variant="primary"
                                    size="sm"
                                    icon={Link2}
                                    className="w-full rounded-xl py-2 text-xs"
                                >
                                    Link wallet
                                </Button>
                            </div>
                        )}

                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                            <span>Network</span>
                            <span className="font-medium text-stone-900">Ethereum Sepolia</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-[#EAECF0] shadow-xs space-y-4">
                        <span className="text-xs font-semibold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="w-4 h-4 text-stone-500" />
                            Registry Details
                        </span>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between pt-1">
                                <span className="text-stone-500">Authority Type</span>
                                <span className="font-semibold text-stone-900">
                                    {isIssuer ? 'Academic Institution' : 'Student / Learner'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-3">
                                <span className="text-stone-500">Verification Status</span>
                                <span className="font-medium text-emerald-700 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Active on Protocol
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-3">
                                <span className="text-stone-500">Member Since</span>
                                <span className="font-medium text-stone-900">
                                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
