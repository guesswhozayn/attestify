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

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'certificate') {
      if (file.type === 'application/pdf') {
        setFormData(prev => ({ ...prev, certificateFile: file }));
      } else {
        showNotification('Please select a PDF file for the certificate', 'error');
      }
    } else if (type === 'studentImage') {
      if (file.type.startsWith('image/')) {
        setFormData(prev => ({ ...prev, studentImage: file }));
      } else {
        showNotification('Please select an image file', 'error');
      }
    }
  };

  const [credentialType, setCredentialType] = useState('CERTIFICATION'); // 'TRANSCRIPT' or 'CERTIFICATION'
  const [transcriptData, setTranscriptData] = useState({
    program: '',
    department: '',
    admissionYear: '',
    graduationYear: '',
    cgpa: '',
    courses: [] 
  });
  const [certificationData, setCertificationData] = useState({
    title: '',
    description: '',
    level: '',
    duration: '',
    expiryDate: '',
    score: ''
  });

  // Course management for transcripts
  const addCourse = () => {
    setTranscriptData(prev => ({
      ...prev,
      courses: [...prev.courses, { code: '', name: '', grade: '', credits: '' }]
    }));
  };

  const updateCourse = (index, field, value) => {
    const updatedCourses = [...transcriptData.courses];
    updatedCourses[index][field] = value;
    setTranscriptData(prev => ({ ...prev, courses: updatedCourses }));
  };

  const removeCourse = (index) => {
    setTranscriptData(prev => ({
      ...prev,
      courses: prev.courses.filter((_, i) => i !== index)
    }));
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
      formDataToSend.append('type', credentialType);
      
      if (formData.studentImage) {
        formDataToSend.append('studentImage', formData.studentImage);
      }
      
      formDataToSend.append('certificate', formData.certificateFile);

      if (credentialType === 'TRANSCRIPT') {
        formDataToSend.append('transcriptData', JSON.stringify(transcriptData));
      } else {
        formDataToSend.append('certificationData', JSON.stringify(certificationData));
      }

      const response = await credentialAPI.issue(formDataToSend);
      
      showNotification('Credential issued successfully! Transaction confirmed.', 'success');
      onSuccess(response.data.credential);
      onClose();
      
      // Reset form
      setFormData({
        studentName: '',
        studentId: '',
        university: '',
        issueDate: '',
        studentImage: null,
        certificateFile: null,
      });
      setCredentialType('CERTIFICATION');
      setTranscriptData({
        program: '',
        department: '',
        admissionYear: '',
        graduationYear: '',
        cgpa: '',
        courses: []
      });
      setCertificationData({
        title: '',
        description: '',
        level: '',
        duration: '',
        expiryDate: '',
        score: ''
      });

    } catch (error) {
      showNotification(error.response?.data?.error || 'Failed to issue credential', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue Credential" size="xl">
      {loading && (
        <div className="absolute inset-0 bg-gray-900 bg-opacity-90 flex items-center justify-center z-50 rounded-xl">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-white text-lg font-semibold">Transaction in progress</p>
            <p className="text-gray-400">Please wait...</p>
          </div>
        </div>
      )}

      <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Credential Type Selector */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setCredentialType('CERTIFICATION')}
            className={`flex-1 py-3 rounded-lg border text-sm font-medium transition ${
              credentialType === 'CERTIFICATION'
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Certification
          </button>
          <button
            onClick={() => setCredentialType('TRANSCRIPT')}
            className={`flex-1 py-3 rounded-lg border text-sm font-medium transition ${
              credentialType === 'TRANSCRIPT'
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Transcript (Academic)
          </button>
        </div>

        {/* Common Fields */}
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
            label="Student Registration Number"
            name="studentId"
            value={formData.studentId}
            onChange={handleChange}
            placeholder="2024-CS-001"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="University / Institution"
            name="university"
            value={formData.university}
            onChange={handleChange}
            placeholder="Enter institution name"
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

        {/* Dynamic Fields based on Type */}
        {credentialType === 'TRANSCRIPT' ? (
          <div className="space-y-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-white font-medium mb-2 border-b border-gray-700 pb-2">Academic Record Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Program / Course"
                value={transcriptData.program}
                onChange={(e) => setTranscriptData({...transcriptData, program: e.target.value})}
                placeholder="B.Sc Computer Science"
              />
              <Input
                label="Department"
                value={transcriptData.department}
                onChange={(e) => setTranscriptData({...transcriptData, department: e.target.value})}
                placeholder="Faculty of Engineering"
              />
              <Input
                label="Admission Year"
                value={transcriptData.admissionYear}
                onChange={(e) => setTranscriptData({...transcriptData, admissionYear: e.target.value})}
                placeholder="2020"
              />
              <Input
                label="Graduation Year"
                value={transcriptData.graduationYear}
                onChange={(e) => setTranscriptData({...transcriptData, graduationYear: e.target.value})}
                placeholder="2024"
              />
              <Input
                label="CGPA / GPA"
                value={transcriptData.cgpa}
                onChange={(e) => setTranscriptData({...transcriptData, cgpa: e.target.value})}
                placeholder="3.8"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-2">Courses / Subjects</label>
              {transcriptData.courses.map((course, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    placeholder="Code"
                    value={course.code}
                    onChange={(e) => updateCourse(index, 'code', e.target.value)}
                    className="w-1/4 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                  <input
                    placeholder="Course Name"
                    value={course.name}
                    onChange={(e) => updateCourse(index, 'name', e.target.value)}
                    className="w-1/2 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                  <input
                    placeholder="Grade"
                    value={course.grade}
                    onChange={(e) => updateCourse(index, 'grade', e.target.value)}
                    className="w-1/6 bg-gray-700 text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                  <button 
                    onClick={() => removeCourse(index)}
                    className="text-red-400 hover:text-red-300 px-2"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                onClick={addCourse}
                className="text-sm text-green-400 hover:text-green-300 mt-1"
              >
                + Add Course
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h3 className="text-white font-medium mb-2 border-b border-gray-700 pb-2">Certification Details</h3>
            <Input
              label="Certification Title"
              value={certificationData.title}
              onChange={(e) => setCertificationData({...certificationData, title: e.target.value})}
              placeholder="Full Stack Web Development"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Level"
                value={certificationData.level}
                onChange={(e) => setCertificationData({...certificationData, level: e.target.value})}
                placeholder="Intermediate"
              />
              <Input
                label="Duration"
                value={certificationData.duration}
                onChange={(e) => setCertificationData({...certificationData, duration: e.target.value})}
                placeholder="6 Months"
              />
              <Input
                label="Score / Grade"
                value={certificationData.score}
                onChange={(e) => setCertificationData({...certificationData, score: e.target.value})}
                placeholder="A+ / 95%"
              />
              <Input
                label="Expiry Date (Optional)"
                type="date"
                value={certificationData.expiryDate}
                onChange={(e) => setCertificationData({...certificationData, expiryDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
              <textarea
                value={certificationData.description}
                onChange={(e) => setCertificationData({...certificationData, description: e.target.value})}
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 h-24"
                placeholder="Describe the achievement..."
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-gray-400 text-sm mb-2">
            Student Image (Optional)
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'studentImage')}
              className="hidden"
              id="student-image-upload"
            />
            <label 
              htmlFor="student-image-upload"
              className="cursor-pointer bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 hover:bg-gray-700 transition flex items-center"
            >
              <Image className="w-4 h-4 mr-2" />
              Choose Image
            </label>
            {formData.studentImage && (
              <span className="text-gray-300 text-sm truncate max-w-[200px]">
                {formData.studentImage.name}
              </span>
            )}
          </div>
        </div>

        <div>
          <label className="block text-gray-400 text-sm mb-2">
            Evidence Document (PDF) <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileChange(e, 'certificate')}
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
            Issue Credential
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default UploadCertificateModal;
