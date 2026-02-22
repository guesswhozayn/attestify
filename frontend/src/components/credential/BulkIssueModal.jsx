import { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { Upload, Loader2, FileText, Download, CheckCircle } from 'lucide-react';
import { credentialAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const BulkIssueModal = ({ isOpen, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [batchFile, setBatchFile] = useState(null);
  const [batchSummary, setBatchSummary] = useState(null);

  const handleBatchUpload = async () => {
    if (!batchFile) {
      showNotification('Please select a CSV file', 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', batchFile);

    try {
      const response = await credentialAPI.batchUpload(formData);
      if (response.data.success) {
        showNotification(`Batch processing complete. ${response.data.summary.success} successful, ${response.data.summary.failed} failed.`, 'success');
        setBatchSummary(response.data.summary);
        // Don't close immediately, let user see summary
        if (response.data.summary.failed === 0) {
           setTimeout(() => {
             onSuccess(); // Trigger refresh
             onClose();
             setBatchFile(null);
             setBatchSummary(null);
           }, 2000);
        } else {
           onSuccess();
        }
      }
    } catch (error) {
      console.error(error);
      showNotification('Batch upload failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'studentName', 'studentWalletAddress', 'university', 'issueDate', 'type', 
      'program', 'department', 'admissionYear', 'graduationYear', 'cgpa', 'courses', 
      'title', 'level', 'duration', 'score', 'description'
    ];
    const example1 = 'John Doe,0x1234567890123456789012345678901234567890,Tech University,2024-01-01,CERTIFICATION,,,,,,,,Advanced React Patterns,Expert,20 Hours,98,Mastering React hooks and patterns';
    const example2 = 'Jane Smith,0x0987654321098765432109876543210987654321,Tech University,2024-01-01,TRANSCRIPT,B.Sc CS,Engineering,2020,2024,3.85,CS101;Intro;A;4|CS102;Algo;B;3,,,,,,';
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + example1 + "\n" + example2;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "credential_upload_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
      setBatchFile(null);
      setBatchSummary(null);
      onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk Issue Credentials" size="xl">
      {loading && (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-all rounded-3xl">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl flex flex-col items-center max-w-sm w-full">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <h3 className="text-white text-lg font-bold mb-2">Processing Batch</h3>
                <p className="text-gray-400 text-center text-sm">
                    Minting multiple credentials on-chain. This may take a moment...
                </p>
            </div>
        </div>
      )}

      <div className="space-y-6">
          <div 
            className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 group ${
                batchFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 bg-white/[0.02] hover:border-indigo-500/30 hover:bg-indigo-500/5'
            }`}
          >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-300 ${
                  batchFile ? 'bg-emerald-500/20' : 'bg-white/[0.05] group-hover:scale-110 group-hover:bg-indigo-500/20'
              }`}>
                {batchFile ? (
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                ) : (
                    <FileText className="w-10 h-10 text-gray-400 group-hover:text-indigo-400 transition-colors" />
                )}
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">
                  {batchFile ? 'Wrapper File Selected' : 'Upload CSV File'}
              </h3>
              <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                {batchFile 
                    ? <span className="text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-lg">{batchFile.name}</span>
                    : 'Drag and drop your CSV file here, or click to browse. Ensure your file matches the template layout.'
                }
              </p>
              
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setBatchFile(e.target.files[0])}
                className="hidden"
                id="batch-file-upload"
              />
              <Button 
                onClick={() => document.getElementById('batch-file-upload').click()}
                variant="white"
                rounded="full"
                className="inline-flex items-center px-8 py-3.5 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
              >
                <Upload className="w-5 h-5 mr-2" />
                {batchFile ? 'Change File' : 'Select File'}
              </Button>
          </div>

          <div className="flex justify-between items-center border-t border-white/[0.06] pt-6">
              <Button
                onClick={downloadTemplate}
                variant="ghost"
                className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors group p-0 !bg-transparent border-none"
              >
                <div className="p-2 bg-white/[0.05] rounded-lg mr-2 group-hover:bg-white/[0.1] transition-colors">
                    <Download className="w-4 h-4" />
                </div>
                Download CSV Template
              </Button>
              
              <Button
                onClick={handleBatchUpload}
                loading={loading}
                disabled={!batchFile || loading}
                variant="white"
                size="lg"
                className="w-full justify-center"
              >
                Bulk Sync
              </Button>
          </div>

          {batchSummary && (
              <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/[0.08] animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h4 className="font-bold text-white mb-4 flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>
                    Processing Results
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                      <div className="text-2xl font-black text-emerald-400 mb-1">{batchSummary.success}</div>
                      <div className="text-xs font-bold text-emerald-500/70 uppercase tracking-wider">Success</div>
                    </div>
                    <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                      <div className="text-2xl font-black text-red-400 mb-1">{batchSummary.failed}</div>
                      <div className="text-xs font-bold text-red-500/70 uppercase tracking-wider">Failed</div>
                    </div>
                    <div className="bg-white/[0.05] p-4 rounded-xl border border-white/[0.05]">
                      <div className="text-2xl font-black text-white mb-1">{batchSummary.total}</div>
                      <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total</div>
                    </div>
                </div>
              </div>
          )}
      </div>
    </Modal>
  );
};

export default BulkIssueModal;
