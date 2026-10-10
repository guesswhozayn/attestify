import React from 'react';
import { X, ExternalLink, ShieldCheck, Hash, Database, Globe, Share2, Copy } from 'lucide-react';
import Button from '../shared/Button';

const SBTDetailsModal = ({ isOpen, onClose, credential }) => {
    if (!isOpen || !credential) return null;

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x...';
    const etherscanUrl = `https://sepolia.etherscan.io/token/${contractAddress}?a=${credential.tokenId}`;
    const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${credential.ipfsCID}`;

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border border-[#E8E4DC] rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_20px_50px_-15px_rgba(28,25,23,0.15)] animate-in zoom-in-95 duration-200">

                <div className="relative p-6 sm:p-7 border-b border-[#E8E4DC] bg-[#FAF8F5]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="p-3 bg-stone-100 rounded-2xl border border-stone-200 text-stone-800">
                                <ShieldCheck className="w-6 h-6 text-stone-800" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-stone-900 tracking-tight">Soulbound token</h3>
                                <p className="text-xs text-stone-500 font-medium">Non-transferable blockchain credential</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-stone-400 hover:text-stone-800 hover:bg-stone-200/60 rounded-xl transition-colors cursor-pointer"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 sm:p-7 space-y-6">

                    <div className="flex justify-center">
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-semibold ${
                            credential.isRevoked
                                ? 'bg-[#FDF0EE] border-[#F8D0CD] text-[#9E2D2D]'
                                : 'bg-[#EDF5EE] border-[#CFE6D3] text-[#25562C]'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${credential.isRevoked ? 'bg-rose-600' : 'bg-emerald-600'}`}></div>
                            {credential.isRevoked ? 'Revoked' : 'Active on-chain'}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5">

                        <DataField
                            label="Token ID"
                            value={credential.tokenId || 'N/A'}
                            icon={Hash}
                            onCopy={() => copyToClipboard(credential.tokenId)}
                        />

                        <DataField
                            label="Smart contract address"
                            value={contractAddress}
                            icon={Database}
                            isAddress
                            onCopy={() => copyToClipboard(contractAddress)}
                        />

                        <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] flex items-center justify-between group transition-colors">
                            <div className="flex items-center gap-3.5">
                                <div className="p-2 bg-stone-100 rounded-xl border border-stone-200/80">
                                    <Globe className="w-4 h-4 text-stone-600" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Network</p>
                                    <p className="text-xs font-semibold text-stone-900">Ethereum (Sepolia)</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#EDF5EE] rounded-full border border-[#CFE6D3]">
                                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse"></div>
                                <span className="text-[11px] font-semibold text-[#25562C]">Online</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider px-1">Explorer & Proofs</h4>
                        <div className="grid grid-cols-2 gap-3">
                            <a
                                href={etherscanUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-4 bg-[#FAF8F5] hover:bg-stone-100 border border-[#ECE7DE] hover:border-stone-300 rounded-2xl transition-all group"
                            >
                                <ExternalLink className="w-5 h-5 text-stone-500 group-hover:text-stone-900 mb-2 transition-colors" />
                                <span className="text-xs font-semibold text-stone-700 group-hover:text-stone-900 text-center">Etherscan</span>
                            </a>
                            <a
                                href={ipfsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-4 bg-[#FAF8F5] hover:bg-stone-100 border border-[#ECE7DE] hover:border-stone-300 rounded-2xl transition-all group"
                            >
                                <Share2 className="w-5 h-5 text-stone-500 group-hover:text-stone-900 mb-2 transition-colors" />
                                <span className="text-xs font-semibold text-stone-700 group-hover:text-stone-900 text-center">IPFS Gateway</span>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="p-5 bg-[#FAF8F5] flex justify-center border-t border-[#ECE7DE]">
                    <Button onClick={onClose} variant="secondary" className="w-full justify-center py-3 text-xs font-semibold uppercase tracking-wider">
                        Close
                    </Button>
                </div>
            </div>
        </div>
    );
};

const DataField = ({ label, value, icon: Icon, isAddress, onCopy }) => (
    <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#ECE7DE] flex items-center justify-between group hover:border-stone-400 transition-colors">
        <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2 bg-stone-100 rounded-xl border border-stone-200/80 group-hover:bg-stone-200/60 transition-colors shrink-0">
                <Icon className="w-4 h-4 text-stone-600" />
            </div>
            <div className="min-w-0 space-y-0.5">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider truncate">{label}</p>
                <p className={`text-xs font-mono text-stone-800 break-all select-all ${isAddress ? 'text-stone-900 font-semibold' : ''}`}>
                    {value}
                </p>
            </div>
        </div>
        <button
            onClick={onCopy}
            className="p-2 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-stone-200/60 transition-all opacity-0 group-hover:opacity-100 shrink-0 cursor-pointer"
            title={`Copy ${label}`}
        >
            <Copy className="w-4 h-4" />
        </button>
    </div>
);

export default SBTDetailsModal;
