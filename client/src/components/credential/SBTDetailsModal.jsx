import { ExternalLink, ShieldCheck, Hash, Database, Globe, Share2, Copy } from 'lucide-react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { useNotification } from '../../context/NotificationContext';

const SBTDetailsModal = ({ isOpen, onClose, credential }) => {
    const { showNotification } = useNotification();
    if (!isOpen || !credential) return null;

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || '0x...';
    const etherscanUrl = `https://sepolia.etherscan.io/token/${contractAddress}?a=${credential.tokenId}`;
    const ipfsUrl = credential.ipfsCID ? `https://gateway.pinata.cloud/ipfs/${credential.ipfsCID}` : null;

    const copyToClipboard = (text, label = 'Value') => {
        if (!text || text === 'N/A' || text === '0x...') return;
        navigator.clipboard.writeText(String(text))
            .then(() => showNotification(`${label} copied`, 'success'))
            .catch(() => showNotification(`Failed to copy ${label.toLowerCase()}`, 'error'));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Soulbound" size="md">
            <div className="space-y-6">
                <div className="flex justify-between items-center p-4 rounded-2xl bg-stone-50 border border-[#EAECF0]">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-stone-100 rounded-xl border border-stone-200 text-stone-800">
                            <ShieldCheck className="w-5 h-5 text-stone-800" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">Record type</span>
                            <span className="text-xs font-bold text-stone-900">Soulbound token</span>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${
                        credential.isRevoked ? 'text-rose-600' : 'text-emerald-700'
                    }`}>
                        <div className={`w-2 h-2 rounded-full ${credential.isRevoked ? 'bg-rose-600' : 'bg-emerald-600'}`}></div>
                        <span>{credential.isRevoked ? 'Revoked' : 'Active'}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3.5">
                    <DataField
                        label="Token ID"
                        value={credential.tokenId || 'N/A'}
                        icon={Hash}
                        onCopy={() => copyToClipboard(credential.tokenId, 'Token ID')}
                    />

                    <DataField
                        label="Contract"
                        value={contractAddress}
                        icon={Database}
                        isAddress
                        onCopy={() => copyToClipboard(contractAddress, 'Contract')}
                    />

                    <div className="bg-stone-50 rounded-2xl p-4 border border-[#EAECF0] flex items-center justify-between group transition-colors">
                        <div className="flex items-center gap-3.5">
                            <div className="p-2 bg-stone-100 rounded-xl border border-stone-200/80">
                                <Globe className="w-4 h-4 text-stone-600" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">Network</p>
                                <p className="text-xs font-semibold text-stone-900">Ethereum (Sepolia)</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-stone-500 uppercase tracking-wider px-1">Links</h4>
                    <div className={`grid ${ipfsUrl ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                        <a
                            href={etherscanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col items-center justify-center p-4 bg-stone-50 hover:bg-stone-100 border border-[#EAECF0] hover:border-stone-300 rounded-2xl transition-all group"
                        >
                            <ExternalLink className="w-5 h-5 text-stone-500 group-hover:text-stone-900 mb-2 transition-colors" />
                            <span className="text-xs font-semibold text-stone-700 group-hover:text-stone-900 text-center">Etherscan</span>
                        </a>
                        {ipfsUrl && (
                            <a
                                href={ipfsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col items-center justify-center p-4 bg-stone-50 hover:bg-stone-100 border border-[#EAECF0] hover:border-stone-300 rounded-2xl transition-all group"
                            >
                                <Share2 className="w-5 h-5 text-stone-500 group-hover:text-stone-900 mb-2 transition-colors" />
                                <span className="text-xs font-semibold text-stone-700 group-hover:text-stone-900 text-center">IPFS</span>
                            </a>
                        )}
                    </div>
                </div>

                <div className="pt-2 flex justify-end">
                    <Button onClick={onClose} variant="secondary" size="sm" className="w-full sm:w-auto px-6">
                        Close
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

const DataField = ({ label, value, icon: Icon, isAddress, onCopy }) => (
    <div className="bg-stone-50 rounded-2xl p-4 border border-[#EAECF0] flex items-center justify-between group hover:border-stone-400 transition-colors">
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
