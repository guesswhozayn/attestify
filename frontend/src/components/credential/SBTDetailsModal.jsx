import React from 'react';
import { X, ExternalLink, ShieldCheck, Hash, Database, Globe, Share2, Copy} from 'lucide-react';
import Button from '../shared/Button';

const SBTDetailsModal = ({ isOpen, onClose, credential }) => {
    if (!isOpen || !credential) return null;

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x...';
    const networkName = 'Sepolia Testnet';
    const etherscanUrl = `https://sepolia.etherscan.io/token/${contractAddress}?a=${credential.tokenId}`;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${credential.ipfsCID}`;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
            <div className="bg-[#0a0a0a] border border-white/[0.08] rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.1)] animate-in zoom-in-95 duration-500">

                <div className="relative p-8 border-b border-white/[0.06] bg-gradient-to-br from-indigo-500/[0.05] to-transparent">
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-[1.25rem] border border-indigo-500/20">
                                <ShieldCheck className="w-7 h-7 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">SBT Registry</h3>
                                <p className="text-[11px] text-indigo-400/60 font-bold mt-1">Immutable Identity Proof</p>
                            </div>
                        </div>
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            rounded="full"
                            size="sm"
                            className="!p-3 text-zinc-500 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                </div>

                <div className="p-8 space-y-8">

                    <div className="flex justify-center">
                        <div className={`flex items-center gap-3 px-6 py-2.5 rounded-full border text-[11px] font-bold shadow-lg ${
                            credential.isRevoked
                                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 animate-pulse'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${credential.isRevoked ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
                            {credential.isRevoked ? 'Token Revoked' : 'Token Active'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5">

                        <DataField
                            label="Token Index"
                            value={credential.tokenId || 'N/A'}
                            icon={Hash}
                            onCopy={() => copyToClipboard(credential.tokenId, 'Token ID')}
                        />

                        <DataField
                            label="Contract Protocol"
                            value={contractAddress}
                            icon={Database}
                            isAddress
                            onCopy={() => copyToClipboard(contractAddress, 'Contract Address')}
                        />

                        <div className="bg-white/[0.02] rounded-[1.5rem] p-5 border border-white/[0.04] flex items-center justify-between group hover:border-white/10 transition-colors shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-white/[0.04] rounded-xl">
                                    <Globe className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-zinc-600">Global Network</p>
                                    <p className="text-sm font-bold text-zinc-200">{networkName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse"></div>
                                <span className="text-[11px] font-bold text-indigo-300">Live</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2">Extended Proofs</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                href={etherscanUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="ghost"
                                rounded="2xl"
                                className="flex-col items-center justify-center p-6 !bg-white/[0.02] hover:!bg-indigo-500/10 border border-white/[0.04] hover:border-indigo-500/30 transition-all !h-auto !shadow-none"
                            >
                                <ExternalLink className="w-6 h-6 text-zinc-500 group-hover:text-indigo-400 mb-3 transition-colors shrink-0" />
                                <span className="text-[11px] font-bold text-zinc-500 group-hover:text-white text-center truncate w-full">Explorer</span>
                            </Button>
                            <Button
                                href={ipfsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="ghost"
                                rounded="2xl"
                                className="flex-col items-center justify-center p-6 !bg-white/[0.02] hover:!bg-purple-500/10 border border-white/[0.04] hover:border-purple-500/30 transition-all !h-auto !shadow-none"
                            >
                                <Share2 className="w-6 h-6 text-zinc-500 group-hover:text-purple-400 mb-3 transition-colors shrink-0" />
                                <span className="text-[10px] font-black text-zinc-500 group-hover:text-white text-center uppercase tracking-widest truncate w-full">IPFS Hub</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-white/[0.02] flex justify-center border-t border-white/[0.04]">
                    <Button onClick={onClose} variant="secondary" className="w-full justify-center py-4">
                        Exit Registry
                    </Button>
                </div>
            </div>
        </div>
    );
};

const DataField = ({ label, value, icon: Icon, isAddress, onCopy }) => (
    <div className="bg-white/[0.02] rounded-[1.5rem] p-5 border border-white/[0.04] flex items-center justify-between group hover:border-indigo-500/20 transition-all shadow-inner">
        <div className="flex items-center gap-4 min-w-0">
            <div className="p-2.5 bg-white/[0.04] rounded-xl group-hover:bg-indigo-500/10 transition-colors">
                <Icon className="w-5 h-5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
            </div>
            <div className="min-w-0 space-y-1">
                <p className="text-[10px] font-bold text-zinc-600 truncate">{label}</p>
                <p className={`text-xs font-mono text-zinc-200 break-all leading-relaxed ${isAddress ? 'text-indigo-300/60' : ''}`}>
                    {value}
                </p>
            </div>
        </div>
        <Button
            onClick={onCopy}
            variant="ghost"
            rounded="xl"
            size="sm"
            className="p-3 text-zinc-600 hover:text-indigo-400 opacity-0 group-hover:opacity-100"
            title={`Copy ${label}`}
        >
            <Copy className="w-5 h-5" />
        </Button>
    </div>
);

export default SBTDetailsModal;
