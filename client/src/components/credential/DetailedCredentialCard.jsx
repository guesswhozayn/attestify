import React from 'react';
import { Award, ShieldAlert, CheckCircle, GraduationCap, ChevronRight, Box, Activity, ExternalLink, Database } from 'lucide-react';
import { getCredentialMeta } from '../../utils/credential';

const DetailedCredentialCard = ({ credential, metadata, minimalist = false, onClick }) => {

    if (!credential) return null;

    const meta = getCredentialMeta(credential);
    const displayMetadata = metadata || meta.metadata;
    const isTranscript = meta.isTranscript;
    const formattedDate = new Date(credential.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const title = displayMetadata?.program || displayMetadata?.title || 'Credential Title';
    const recipient = displayMetadata?.studentName || credential.studentName;
    const issuer = displayMetadata?.university || credential.university;
    const isSBT = !!credential.tokenId;

    if (minimalist) {
        return (
            <div
                onClick={onClick}
                className="group p-5 bg-white border border-[#E8E4DC] rounded-2xl hover:border-stone-400 transition-all cursor-pointer flex items-center justify-between shadow-xs hover:shadow-sm"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl border border-stone-200 bg-[#FAF8F5] text-stone-700 group-hover:scale-105 transition-transform">
                        {isTranscript ? <GraduationCap className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="text-stone-900 font-bold text-sm mb-0.5 tracking-tight">{title}</h3>
                        <p className="text-[11px] text-stone-500 font-medium">
                            {recipient} <span className="mx-2 text-stone-300">|</span> {formattedDate}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isSBT && (
                        <div className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border bg-stone-100 text-stone-700 border-stone-200">
                            SBT
                        </div>
                    )}
                    <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                        credential.isRevoked
                            ? 'bg-[#FDF0EE] text-[#9E2D2D] border-[#F7D4CF]'
                            : 'bg-[#EDF5EE] text-[#25562C] border-[#CFE6D3]'
                    }`}>
                        {credential.isRevoked ? 'Revoked' : 'Valid'}
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-stone-800 transition-colors" />
                </div>
            </div>
        );
    }

    return (
        <div className="py-4">
            <div
                onClick={onClick}
                className="hidden md:block group relative w-full aspect-[1.6/1] bg-white border-2 border-[#E8E4DC] rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(28,25,23,0.06)] cursor-pointer transition-all duration-300 hover:shadow-[0_12px_40px_rgba(28,25,23,0.1)] hover:-translate-y-0.5"
            >
                {/* Classic diploma inner border */}
                <div className="absolute inset-3.5 rounded-2xl border border-[#ECE7DE] pointer-events-none"></div>

                {/* Corner architectural marks */}
                <div className="absolute top-6 left-6 w-5 h-5 border-t-2 border-l-2 border-stone-300 rounded-tl-xs pointer-events-none group-hover:border-stone-500 transition-colors"></div>
                <div className="absolute top-6 right-6 w-5 h-5 border-t-2 border-r-2 border-stone-300 rounded-tr-xs pointer-events-none group-hover:border-stone-500 transition-colors"></div>
                <div className="absolute bottom-6 left-6 w-5 h-5 border-b-2 border-l-2 border-stone-300 rounded-bl-xs pointer-events-none group-hover:border-stone-500 transition-colors"></div>
                <div className="absolute bottom-6 right-6 w-5 h-5 border-b-2 border-r-2 border-stone-300 rounded-br-xs pointer-events-none group-hover:border-stone-500 transition-colors"></div>

                {/* Top micro identifier */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[9px] font-semibold tracking-[0.25em] text-stone-400 uppercase pointer-events-none">
                    <span>Credential ID // 0x{credential.certificateHash?.substring(0, 8)}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>
                    <span>Status // Verified</span>
                </div>

                <div className="relative h-full p-10 lg:p-14 flex flex-col justify-between z-10 w-full">
                    {/* Header */}
                    <div className="flex justify-between items-start">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E4DC] rounded-2xl shadow-xs text-stone-800">
                                    {isTranscript ? <GraduationCap className="w-6 h-6" /> : <Award className="w-6 h-6" />}
                                </div>
                                <div>
                                    <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 mb-0.5">Verified credential</span>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-600"></div>
                                        <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">{credential.type} {isSBT ? 'SBT' : 'NFT'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                            credential.isRevoked
                                ? 'bg-[#FDF0EE] border-[#F7D4CF] text-[#9E2D2D]'
                                : 'bg-[#EDF5EE] border-[#CFE6D3] text-[#25562C]'
                        }`}>
                            {credential.isRevoked ? <ShieldAlert className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            {credential.isRevoked ? 'Status: Revoked' : 'Status: Verified'}
                        </div>
                    </div>

                    {/* Middle title and institution */}
                    <div className="space-y-6 mt-auto w-full">
                        <div>
                            <h2 className="font-serif text-3xl lg:text-5xl font-semibold text-stone-900 leading-tight tracking-tight mb-3 break-words">
                                {title}
                            </h2>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                                    <span className="text-stone-400">Institution:</span>
                                    <span className="text-stone-800 font-semibold">{issuer}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-medium text-stone-500">
                                    <span className="text-stone-400">Date issued:</span>
                                    <span className="text-stone-800 font-semibold">{formattedDate}</span>
                                </div>
                            </div>
                        </div>

                        {/* Attribute grid */}
                        <div className="grid grid-cols-4 gap-6 pt-6 border-t border-[#E8E4DC] w-full">
                            <div className="space-y-1">
                                <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Student name</label>
                                <p className="text-base lg:text-lg text-stone-900 font-bold tracking-tight break-words">{recipient}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Academic grade</label>
                                <p className="text-base lg:text-lg font-bold tracking-tight font-mono text-stone-900">{displayMetadata?.cgpa || displayMetadata?.gpa || displayMetadata?.score || 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Specialization</label>
                                <p className="text-base lg:text-lg text-stone-700 font-semibold tracking-tight truncate max-w-full" title={displayMetadata?.major || displayMetadata?.department || 'N/A'}>{displayMetadata?.major || displayMetadata?.department || 'N/A'}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <label className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">Student ID</label>
                                <p className="text-sm lg:text-base text-stone-500 font-mono">#{credential.studentWalletAddress?.substring(2, 8).toUpperCase() || 'IDENTITY_000'}</p>
                            </div>
                        </div>

                        {isSBT && (
                            <div className="pt-4 border-t border-[#E8E4DC] flex items-center justify-between gap-6 w-full">
                                <div className="flex items-center gap-3 bg-[#FAF8F5] border border-[#E8E4DC] px-3.5 py-2 rounded-xl">
                                    <Database className="w-4 h-4 text-stone-600" />
                                    <span className="text-xs font-mono font-semibold text-stone-700">Token #{credential.tokenId}</span>
                                </div>
                                <a
                                    href={`https://sepolia.etherscan.io/token/${import.meta.env.VITE_CONTRACT_ADDRESS}?a=${credential.tokenId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors"
                                >
                                    <span>View on Etherscan</span>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop micro footer */}
            <div className="hidden md:flex mt-4 justify-between items-center px-4 text-[11px] font-medium text-stone-500">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><Box className="w-3.5 h-3.5 text-stone-400" /> Security: Verified</span>
                    <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-600" /> Status: Active</span>
                </div>
                <div className="flex items-center gap-4 text-stone-400">
                    <span>Archival standard</span>
                    <span>Immutable cryptographic record</span>
                </div>
            </div>

            {/* Mobile Card */}
            <div
                onClick={onClick}
                className="block md:hidden flex flex-col w-full bg-white border border-[#E8E4DC] rounded-2xl overflow-hidden shadow-xs cursor-pointer"
            >
                <div className="w-full py-3.5 px-4 flex items-center justify-between border-b border-[#E8E4DC] bg-[#FAF8F5]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-white border border-stone-200 text-stone-700">
                            {isTranscript ? <GraduationCap className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                        </div>
                        <div>
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-500">Verified credential</span>
                            <span className="text-xs font-bold text-stone-800 uppercase">{credential.type} {isSBT ? 'SBT' : 'NFT'}</span>
                        </div>
                    </div>

                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center gap-1 ${
                        credential.isRevoked
                            ? 'bg-[#FDF0EE] border-[#F7D4CF] text-[#9E2D2D]'
                            : 'bg-[#EDF5EE] border-[#CFE6D3] text-[#25562C]'
                    }`}>
                        {credential.isRevoked ? <ShieldAlert className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                        {credential.isRevoked ? 'Revoked' : 'Verified'}
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    <div>
                        <h2 className="font-serif text-2xl font-semibold text-stone-900 leading-tight mb-2">
                            {title}
                        </h2>
                        <div className="text-xs text-stone-500">
                            <span className="text-stone-700 font-medium">{issuer}</span> &bull; {formattedDate}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 py-3 border-y border-[#E8E4DC] text-xs">
                        <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#E8E4DC]">
                            <span className="text-[10px] text-stone-400 font-bold uppercase block">Student</span>
                            <span className="font-bold text-stone-800 truncate block">{recipient}</span>
                        </div>
                        <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#E8E4DC]">
                            <span className="text-[10px] text-stone-400 font-bold uppercase block">Grade</span>
                            <span className="font-bold font-mono text-stone-800 block">{displayMetadata?.cgpa || displayMetadata?.gpa || displayMetadata?.score || 'N/A'}</span>
                        </div>
                    </div>

                    {isSBT && (
                        <div className="bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl p-3 flex justify-between items-center text-xs">
                            <span className="font-mono font-semibold text-stone-700">Token #{credential.tokenId}</span>
                            <a
                                href={`https://sepolia.etherscan.io/token/${import.meta.env.VITE_CONTRACT_ADDRESS}?a=${credential.tokenId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 font-semibold text-stone-800 hover:text-stone-900"
                            >
                                <span>Etherscan</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default React.memo(DetailedCredentialCard);
