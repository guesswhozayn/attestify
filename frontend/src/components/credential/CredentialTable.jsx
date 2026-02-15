import React from 'react';
import { 
    MoreHorizontal, 
    Eye, 
    ShieldAlert, 
    ExternalLink, 
    CheckCircle, 
    XCircle, 
    FileText, 
    Award,
    Calendar,
    Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CredentialTable = ({ credentials, onView, onRevoke, loading }) => {
    
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-gray-500 animate-pulse">Loading credentials...</div>
            </div>
        );
    }

    if (credentials.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white/[0.02] rounded-2xl border border-dashed border-white/10">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Credentials Found</h3>
                <p className="text-gray-500 max-w-sm">
                    Try adjusting your filters or issue a new credential to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-2xl border border-white/[0.05] bg-black/20 backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Credential</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Recipient</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Mint Type</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Issued Date</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                    <AnimatePresence>
                        {credentials.map((cred, idx) => (
                            <motion.tr 
                                key={cred._id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group hover:bg-white/[0.02] transition-colors"
                            >
                                {/* Credential Info */}
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${cred.isRevoked ? 'bg-red-500/10 text-red-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                            {cred.type === 'TRANSCRIPT' ? <FileText className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <div className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                                                {cred.transcriptData?.program || cred.certificationData?.title || cred.courseName || cred.degreeName || 'Untitled Credential'}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono flex items-center gap-1 mt-1">
                                                <Hash className="w-3 h-3" />
                                                {cred._id ? `${cred._id.substring(0, 8)}...` : 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                {/* Recipient */}
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-300">{cred.studentName}</div>
                                    <div className="text-xs text-gray-500 font-mono mt-0.5">
                                        {cred.studentWalletAddress ? `${cred.studentWalletAddress.substring(0, 6)}...${cred.studentWalletAddress.substring(cred.studentWalletAddress.length - 4)}` : '-'}
                                    </div>
                                </td>

                                {/* Type */}
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                                        {cred.type}
                                    </span>
                                </td>

                                {/* Mint Type */}
                                <td className="px-6 py-4">
                                    {cred.tokenId ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                                            Soulbound (SBT)
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                            Standard NFT
                                        </span>
                                    )}
                                </td>

                                {/* Date */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center text-sm text-gray-400">
                                        <Calendar className="w-3.5 h-3.5 mr-2 opacity-70" />
                                        {new Date(cred.createdAt).toLocaleDateString()}
                                    </div>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-4">
                                    {cred.isRevoked ? (
                                        <div className="flex items-center gap-1.5 text-red-400 text-xs font-medium bg-red-500/10 w-fit px-2.5 py-1 rounded-lg border border-red-500/20">
                                            <XCircle className="w-3.5 h-3.5" />
                                            Revoked
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium bg-emerald-500/10 w-fit px-2.5 py-1 rounded-lg border border-emerald-500/20">
                                            <CheckCircle className="w-3.5 h-3.5" />
                                            Active
                                        </div>
                                    )}
                                </td>

                                {/* Actions */}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => onView(cred)}
                                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        
                                        {cred.transactionHash && (
                                            <a 
                                                href={`https://sepolia.etherscan.io/tx/${cred.transactionHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-gray-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                title="View on Blockchain"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        )}

                                        {!cred.isRevoked && (
                                            <button 
                                                onClick={() => onRevoke(cred)}
                                                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Revoke Credential"
                                            >
                                                <ShieldAlert className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </AnimatePresence>
                </tbody>
            </table>
        </div>
    );
};

export default CredentialTable;
