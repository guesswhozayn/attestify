import { useState, useRef } from 'react';
import { Upload, Search, RefreshCw, X, CheckCircle2 } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Button from '../shared/Button';
import { verifyAPI } from '../../services/api';
import { generateFileHash } from '../../utils/hash';
import { extractMetadata } from '../../utils/pdf';
import VerificationResult from './VerificationResult';

const VerificationPortal = () => {
  const location = useLocation();
  const { id: urlId } = useParams();

  const getInitialWalletAddress = () => {
    if (urlId) return urlId;
    if (location.search) {
      const params = new URLSearchParams(location.search);
      return params.get('walletAddress') || params.get('credentialId') || params.get('registrationNumber') || '';
    }
    return '';
  };

  const [activeTab, setActiveTab] = useState(urlId ? 'id' : 'file');
  const [file, setFile] = useState(null);
  const [walletAddress, setWalletAddress] = useState(getInitialWalletAddress);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf'))) {
      setFile(selectedFile);
      try {
        const extractedId = await extractMetadata(selectedFile);
        if (extractedId) {
          setWalletAddress(extractedId);
        }
      } catch {
        // Fallback to manual entry or direct hash
      }
    }
  };

  const clearFile = (e) => {
    e?.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleVerify = async () => {
    if (!file && !walletAddress) return;

    setVerifying(true);
    setResult(null);

    try {
      let response;
      if (activeTab === 'file' && file && walletAddress) {
        const fileHash = await generateFileHash(file);
        response = await verifyAPI.verifyByHash(walletAddress, fileHash);
      } else if (activeTab === 'id' && walletAddress) {
        response = await verifyAPI.checkExists(walletAddress);
      } else if (file) {
        const fileHash = await generateFileHash(file);
        response = await verifyAPI.verifyByHash('credential', fileHash);
      } else if (walletAddress) {
        response = await verifyAPI.checkExists(walletAddress);
      }

      setResult(response.data);
    } catch {
      setResult({
        valid: false,
        message: 'Could not confirm validity. No matching blockchain record found.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setWalletAddress('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full flex flex-col items-center space-y-6">
      <div className="flex flex-col items-center text-center space-y-1.5 max-w-lg">
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
          Verify Credential
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 leading-relaxed font-normal">
          Validate certificate authenticity directly against the Ethereum Sepolia ledger.
        </p>
      </div>

      <div className="w-full bg-white border border-[#EAECF0] rounded-3xl p-6 sm:p-9 shadow-[0_1px_3px_rgba(16,24,40,0.02),0_8px_24px_-4px_rgba(16,24,40,0.04)]">
        {result ? (
          <div className="space-y-6">
            <VerificationResult result={result} />

            <div className="flex justify-center pt-4 border-t border-stone-100">
              <Button
                onClick={handleReset}
                variant="secondary"
                size="md"
                icon={RefreshCw}
              >
                Verify another
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex bg-stone-100/80 p-1.5 rounded-2xl border border-stone-200/60 text-xs font-semibold text-stone-600">
              <button
                type="button"
                onClick={() => setActiveTab('file')}
                className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'file'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'hover:text-stone-900 text-stone-500'
                }`}
              >
                Upload Document
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('id')}
                className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'id'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'hover:text-stone-900 text-stone-500'
                }`}
              >
                ID / Address
              </button>
            </div>

            {activeTab === 'file' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`group border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer select-none ${
                  file
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-stone-200 bg-stone-50/70 hover:bg-stone-50 hover:border-stone-400'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />

                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3.5 transition-transform group-hover:scale-105 shadow-2xs ${
                      file ? 'bg-emerald-600 text-white' : 'bg-white border border-stone-200 text-stone-600'
                    }`}
                  >
                    {file ? <CheckCircle2 className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  </div>

                  {file ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-xs font-semibold text-stone-900 truncate max-w-xs">
                          {file.name}
                        </span>
                        <button
                          type="button"
                          onClick={clearFile}
                          className="p-1 text-stone-400 hover:text-stone-800 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
                          title="Remove file"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium">Ready for verification</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-stone-900">
                        Drop credential PDF here
                      </h3>
                      <p className="text-xs text-stone-400 font-normal">
                        or click to browse from device
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-left">
                <label className="text-xs font-semibold text-stone-700">
                  Credential ID or Wallet Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-stone-400 group-focus-within:text-stone-700 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder="0x... or certificate reference ID"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="block w-full pl-10 pr-9 py-2.5 bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-stone-400 rounded-xl text-stone-900 placeholder-stone-400 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-stone-400 transition-all shadow-2xs"
                  />
                  {walletAddress && (
                    <button
                      type="button"
                      onClick={() => setWalletAddress('')}
                      className="absolute inset-y-0 right-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <Button
              onClick={handleVerify}
              loading={verifying}
              disabled={verifying || (activeTab === 'file' ? !file : !walletAddress)}
              variant="primary"
              size="lg"
              className="w-full justify-center"
            >
              {verifying ? 'Checking ledger...' : 'Verify'}
            </Button>

            <p className="text-[11px] text-stone-400 text-center leading-relaxed font-normal">
              Verified locally via cryptographic hash. Document content is never stored or uploaded.
            </p>
          </div>
        )}
      </div>
      <div className="flex items-center justify-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity pt-2">
        <span className="text-[11px] font-medium text-stone-500">powered by</span>
        <Link to="/" className="inline-flex items-center font-mono text-xs font-bold lowercase text-stone-700 hover:text-stone-950">
          attestify<span className="text-indigo-600">.</span>
        </Link>
      </div>
    </div>
  );
};

export default VerificationPortal;
