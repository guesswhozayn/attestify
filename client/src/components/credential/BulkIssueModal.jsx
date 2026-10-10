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
        showNotification(`Import complete. ${response.data.summary.success} queued for issuance, ${response.data.summary.failed} failed.`, 'success');
        setBatchSummary(response.data.summary);

        if (response.data.summary.failed === 0) {
           setTimeout(() => {
             onSuccess();
             onClose();
             setBatchFile(null);
             setBatchSummary(null);
           }, 2500);
        } else {
           onSuccess();
        }
      }
    } catch (error) {
      console.error(error);
      showNotification(error.response?.data?.error || 'Batch upload failed', 'error');
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Issue credentials in bulk" size="xl">
      {loading && (
        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs flex flex-col items-center justify-center z-50 transition-all rounded-3xl">
            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-2xl flex flex-col items-center max-w-sm w-full">
                <Loader2 className="w-10 h-10 text-stone-900 animate-spin mb-3" />
                <h3 className="text-stone-900 text-base font-bold mb-1">Processing credentials</h3>
                <p className="text-stone-500 text-center text-xs">
                    Issuing credentials on the blockchain. This may take a moment...
                </p>
            </div>
        </div>
      )}

      <div className="space-y-6">
          <div
            className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-200 ${
                batchFile ? 'border-[#CFE6D3] bg-[#EDF5EE]' : 'border-[#E8E4DC] bg-[#FAF8F5] hover:border-stone-400'
            }`}
          >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-200 ${
                  batchFile ? 'bg-white text-[#25562C] border border-[#CFE6D3]' : 'bg-white text-stone-500 border border-[#E8E4DC]'
              }`}>
                {batchFile ? (
                    <CheckCircle className="w-8 h-8" />
                ) : (
                    <FileText className="w-8 h-8" />
                )}
              </div>

              <h3 className="text-lg font-bold text-stone-900 mb-1">
                  {batchFile ? 'File selected' : 'Upload CSV file'}
              </h3>
              <p className="text-stone-500 text-xs mb-6 max-w-sm mx-auto leading-relaxed">
                {batchFile
                    ? <span className="text-[#25562C] font-mono font-semibold bg-white px-3 py-1 rounded-lg border border-[#CFE6D3] inline-block">{batchFile.name}</span>
                    : 'Select a structured CSV file matching the schema template to batch issue credentials.'
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
                variant="outline"
                className="inline-flex items-center px-6 py-2.5 bg-white hover:bg-stone-50 text-stone-800 border-stone-200 rounded-xl text-xs font-semibold shadow-2xs"
              >
                <Upload className="w-4 h-4 mr-2" />
                {batchFile ? 'Change file' : 'Select file'}
              </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-[#E8E4DC] pt-5">
              <Button
                onClick={downloadTemplate}
                variant="ghost"
                className="flex items-center text-xs font-semibold text-stone-600 hover:text-stone-900 p-0 !bg-transparent border-none"
              >
                <div className="p-2 bg-stone-100 rounded-lg mr-2 text-stone-700">
                    <Download className="w-4 h-4" />
                </div>
                Download CSV template
              </Button>

              <Button
                onClick={handleBatchUpload}
                loading={loading}
                disabled={!batchFile || loading}
                variant="primary"
                size="md"
                className="w-full sm:w-auto px-7 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-semibold shadow-sm cursor-pointer"
              >
                Issue credentials
              </Button>
          </div>

          {batchSummary && (
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8E4DC]">
                <h4 className="font-bold text-stone-900 text-sm mb-3 flex items-center">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 mr-2"></span>
                    Import results
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-[#EDF5EE] p-3.5 rounded-xl border border-[#CFE6D3]">
                      <div className="text-xl font-bold text-[#25562C] mb-0.5">{batchSummary.success}</div>
                      <div className="text-[11px] font-semibold text-[#25562C]/80 uppercase tracking-wider">Queued</div>
                    </div>
                    <div className="bg-[#FDF0EE] p-3.5 rounded-xl border border-[#F7D4CF]">
                      <div className="text-xl font-bold text-[#9E2D2D] mb-0.5">{batchSummary.failed}</div>
                      <div className="text-[11px] font-semibold text-[#9E2D2D]/80 uppercase tracking-wider">Failed</div>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-[#E8E4DC]">
                      <div className="text-xl font-bold text-stone-900 mb-0.5">{batchSummary.total}</div>
                      <div className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Total</div>
                    </div>
                </div>
              </div>
          )}
      </div>
    </Modal>
  );
};

export default BulkIssueModal;
