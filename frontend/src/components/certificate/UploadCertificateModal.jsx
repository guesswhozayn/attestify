import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { Upload, Loader2, Calendar, User, Building, Image } from 'lucide-react';
import { credentialAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const UploadCertificateModal = ({ isOpen, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    studentId: '',
    university: '',
    issueDate: '',
    studentImage: '',
    certificateFile: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFormData(prev => ({ ...prev, certificateFile: file }));
    } else {
      showNotification('Please select a PDF file', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!formData.studentName || !formData.studentId || !formData.university || 
        !formData.issueDate || !formData.certificateFile) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('studentName', formData.studentName);
      formDataToSend.append('studentId', formData.studentId);
      formDataToSend.append('university', formData.university);
      formDataToSend.append('issueDate', formData.issueDate);
      formDataToSend.append('studentImage', formData.studentImage);
      formDataToSend.append('certificate', formData.certificateFile);

      const response = await credentialAPI.issue(formDataToSend);
      
      showNotification('Certificate issued successfully! Transaction confirmed.', 'success');
      onSuccess(response.data.credential);
      onClose();
      
      setFormData({
        studentName: '',
        studentId: '',
        university: '',
        issueDate: '',
        studentImage: '',
        certificateFile: null,
      });
    } catch (error) {
      showNotification(error.response?.data?.error || 'Failed to issue certificate', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a Certificate" size="lg">
      {loading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 rounded-xl">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg font-semibold">Transaction in progress</p>
            <p className="text-gray-400">Please wait...</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Student Name"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            placeholder="John Doe"
            icon={User}
            required
          />
          <Input
            label="Student ID"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            placeholder="123456"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="University"
            name="university"
            value={formData.university}
            onChange={handleChange}
            placeholder="Enter university name"
            icon={Building}
            required
          />
          <Input
            label="Issue Date"
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            icon={Calendar}
            required
          />
        </div>

        <Input
          label="Student Image URL"
          name="studentImage"
          value={formData.studentImage}
          onChange={handleChange}
          placeholder="https://example.com/student-photo.jpg"
          icon={Image}
        />

        <div>
          <label className="block text-gray-400 text-sm mb-2">
            Student Certificate <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700 cursor-pointer"
          />
          {formData.certificateFile && (
            <p className="text-green-400 text-sm mt-2 flex items-center">
              <Upload className="w-4 h-4 mr-2" />
              {formData.certificateFile.name}
            </p>
          )}
        </div>

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
            size="lg"
          >
            Submit new certificate
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadCertificateModal;
