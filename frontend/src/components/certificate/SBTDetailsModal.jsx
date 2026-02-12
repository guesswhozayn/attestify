import React from 'react';
import { X, ExternalLink, ShieldCheck, Hash, Database, Globe, Share2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '../shared/Button';

const SBTDetailsModal = ({ isOpen, onClose, credential }) => {
    if (!isOpen || !credential) return null;

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x...';
    const networkName = 'Sepolia Testnet';
    const etherscanUrl = `https://sepolia.etherscan.io/token/${contractAddress}?a=${credential.tokenId}`;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${credential.ipfsCID}`;

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        // We could use a toast here if available, but for now simple feedback
        // showNotification(`${label} copied!`, 'success');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-indigo-500/10 animate-in zoom-in-95 duration-300">
                
                {/* Header */}
                <div className="relative p-6 border-b border-gray-800 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/20 rounded-xl">
                                <ShieldCheck className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white uppercase tracking-tight">SBT Proof of Ownership</h3>
                                <p className="text-xs text-indigo-300/60 font-medium">Non-Transferable Blockchain Identity</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    
                    {/* Status Badge */}
                    <div className="flex justify-center">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${
                            credential.isRevoked 
                                ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        }`}>
                            {credential.isRevoked ? (
                                <><AlertCircle className="w-5 h-5" /> <span className="font-bold uppercase tracking-wider">Token Revoked</span></>
                            ) : (
                                <><CheckCircle className="w-5 h-5" /> <span className="font-bold uppercase tracking-wider">Token Active</span></>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {/* Token ID */}
                        <DataField 
                            label="Token ID" 
                            value={credential.tokenId || 'N/A'} 
                            icon={Hash} 
                            onCopy={() => copyToClipboard(credential.tokenId, 'Token ID')}
                        />
                        
                        {/* Contract */}
                        <DataField 
                            label="Contract Address" 
                            value={contractAddress} 
                            icon={Database} 
                            isAddress
                            onCopy={() => copyToClipboard(contractAddress, 'Contract Address')}
                        />

                        {/* Network */}
                        <div className="bg-gray-800/30 rounded-2xl p-4 border border-gray-800/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-700/30 rounded-lg">
                                    <Globe className="w-4 h-4 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Network</p>
                                    <p className="text-sm font-medium text-gray-200">{networkName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-indigo-300 uppercase">Live</span>
                            </div>
                        </div>
                    </div>

                    {/* Metadata Section */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-1">Proof Resources</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <a 
                                href={etherscanUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-4 bg-gray-800/50 hover:bg-indigo-500/10 border border-gray-700/50 hover:border-indigo-500/30 rounded-2xl transition-all group"
                            >
                                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-indigo-400 mb-2" />
                                <span className="text-xs font-semibold text-gray-300 group-hover:text-white">View on Explorer</span>
                            </a>
                            <a 
                                href={ipfsUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-4 bg-gray-800/50 hover:bg-purple-500/10 border border-gray-700/50 hover:border-purple-500/30 rounded-2xl transition-all group"
                            >
                                <Share2 className="w-5 h-5 text-gray-400 group-hover:text-purple-400 mb-2" />
                                <span className="text-xs font-semibold text-gray-300 group-hover:text-white">IPFS Metadata</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-800/30 flex justify-center">
                    <Button onClick={onClose} variant="secondary" className="w-full justify-center py-3">
                        Close Details
                    </Button>
                </div>
            </div>
        </div>
    );
};

const DataField = ({ label, value, icon: Icon, isAddress, onCopy }) => (
    <div className="bg-gray-800/30 rounded-2xl p-4 border border-gray-800/50 flex items-center justify-between group hover:border-indigo-500/20 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-gray-700/30 rounded-lg">
                <Icon className="w-4 h-4 text-gray-400" />
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
                <p className={`text-sm font-mono text-gray-200 truncate ${isAddress ? 'text-indigo-200/70' : ''}`}>
                    {value}
                </p>
            </div>
        </div>
        <button 
            onClick={onCopy}
            className="p-2 hover:bg-gray-700/50 rounded-lg text-gray-500 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
            title={`Copy ${label}`}
        >
            <Copy className="w-4 h-4" />
        </button>
    </div>
);

export default SBTDetailsModal;
