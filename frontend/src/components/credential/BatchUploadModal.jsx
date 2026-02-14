import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Button from '../shared/Button';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

const BatchUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { showNotification } = useNotification();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
    } else {
      showNotification('Please select a CSV file', 'error');
    }
  };

  const handleUpload = async () => {
    if (!csvFile) {
      showNotification('Please select a CSV file', 'error');
      return;
    }

    setLoading(true);
    setProgress(0);

    // Simulate batch upload progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setLoading(false);
      showNotification('Batch upload completed successfully!', 'success');
      onSuccess();
      onClose();
    }, 5000);
  };

  const downloadTemplate = () => {
    const csvContent = "studentName,studentId,university,issueDate,studentImage\n" +
                       "John Doe,12345,Harvard University,2024-01-15,https://example.com/john.jpg\n" +
                       "Jane Smith,12346,MIT,2024-01-16,https://example.com/jane.jpg";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'batch_upload_template.csv';
    a.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Batch Credential Upload" size="lg">
      <div className="space-y-6">
        <div className="bg-blue-500 bg-opacity-10 border border-blue-500 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Before uploading:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-400">
              <li>Download and fill the CSV template</li>
              <li>Ensure all required fields are filled</li>
              <li>Upload credential PDFs separately or provide URLs</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center">
          <Button
            onClick={downloadTemplate}
            variant="outline"
            icon={FileSpreadsheet}
          >
            Download CSV Template
          </Button>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">Upload CSV File</label>
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-green-500 transition">
            {!csvFile ? (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <label htmlFor="csv-upload">
                  <Button variant="primary" as="span">
                    Choose CSV File
                  </Button>
                </label>
              </>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <FileSpreadsheet className="w-8 h-8 text-green-400" />
                <span className="text-white font-medium">{csvFile.name}</span>
              </div>
            )}
          </div>
        </div>

        {loading && (
          <div>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Uploading certificates...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button onClick={onClose} variant="ghost" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            loading={loading}
            disabled={!csvFile || loading}
          >
            Upload Batch
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default BatchUploadModal;
