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
        const queued = response.data.summary.queued ?? response.data.summary.success;
        const failed = response.data.summary.failed;
        showNotification(`Batch processed: ${queued} queued for issuance, ${failed} rejected`, failed > 0 ? 'warning' : 'success');
        setBatchSummary(response.data.summary);

        if (response.data.summary.failed === 0) {
          setTimeout(() => {
            onSuccess();
            onClose();
            setBatchFile(null);
            setBatchSummary(null);
          }, 2000);
        } else {
          onSuccess();
        }
      }
    } catch (error) {
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
    const example1 = 'John Doe,0x1234567890123456789012345678901234567890,Tech University,2024-01-01,CERTIFICATION,,,,,,,,Advanced React,Expert,20 Hours,98,React mastery';
    const example2 = 'Jane Smith,0x0987654321098765432109876543210987654321,Tech University,2024-01-01,TRANSCRIPT,B.Sc CS,Engineering,2020,2024,3.85,CS101;Intro;A;4,,,,,,';

    const csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n' + example1 + '\n' + example2;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'credential_upload_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClose = () => {
    setBatchFile(null);
    setBatchSummary(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Bulk issue credentials" size="lg">
      {loading && (
        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs flex flex-col items-center justify-center z-50 rounded-2xl">
          <div data-modal-panel className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xl flex flex-col items-center max-w-sm w-full mx-4">
            <Loader2 className="w-8 h-8 text-stone-900 animate-spin mb-3" />
            <h3 className="text-stone-900 text-sm font-semibold mb-1">Processing batch</h3>
            <p className="text-stone-500 text-center text-xs">Queuing credentials for background issuance...</p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
            batchFile ? 'border-emerald-300 bg-emerald-50/50' : 'border-stone-200 bg-stone-50 hover:border-stone-300'
          }`}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 bg-white border border-stone-200 text-stone-600">
            {batchFile ? <CheckCircle className="w-6 h-6 text-emerald-600" /> : <FileText className="w-6 h-6" />}
          </div>

          <h3 className="text-sm font-semibold text-stone-900 mb-1">
            {batchFile ? 'CSV file selected' : 'Upload student records'}
          </h3>
          <p className="text-xs text-stone-500 mb-4 max-w-sm mx-auto">
            {batchFile ? (
              <span className="font-mono text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-200">
                {batchFile.name}
              </span>
            ) : (
              'Upload a CSV file containing student names, addresses, and credential details.'
            )}
          </p>

          <input
            type="file"
            accept=".csv"
            onChange={(e) => setBatchFile(e.target.files[0])}
            className="hidden"
            id="batch-file-upload"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            icon={Upload}
            onClick={() => document.getElementById('batch-file-upload').click()}
          >
            {batchFile ? 'Change file' : 'Select CSV'}
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-stone-400" />
            <span>CSV template</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleBatchUpload}
              disabled={!batchFile || loading}
              size="sm"
            >
              Upload
            </Button>
          </div>
        </div>

        {batchSummary && (
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="text-xs font-semibold text-stone-900">Batch summary</div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="text-lg font-bold text-emerald-800">{batchSummary.success}</div>
                <div className="text-[10px] text-emerald-600">Succeeded</div>
              </div>
              <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200">
                <div className="text-lg font-bold text-rose-800">{batchSummary.failed}</div>
                <div className="text-[10px] text-rose-600">Failed</div>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-stone-200">
                <div className="text-lg font-bold text-stone-900">{batchSummary.total}</div>
                <div className="text-[10px] text-stone-500">Total</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BulkIssueModal;
