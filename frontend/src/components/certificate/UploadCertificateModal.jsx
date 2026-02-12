import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { Upload, Loader2, Calendar, User, Building, Image, Plus, Trash2, BookOpen, Award, CheckCircle, FileText, Download, Users } from 'lucide-react';
import { credentialAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const UploadCertificateModal = ({ isOpen, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    studentWalletAddress: '',
    university: '',
    issueDate: '',
    studentImage: '',
  });

  const [mode, setMode] = useState('single'); // 'single' or 'batch'
  const [batchFile, setBatchFile] = useState(null);
  const [batchSummary, setBatchSummary] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'studentImage') {
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
    if (!formData.studentName || !formData.studentWalletAddress || !formData.university || 
        !formData.issueDate) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('studentName', formData.studentName);
      formDataToSend.append('studentWalletAddress', formData.studentWalletAddress);
      formDataToSend.append('university', formData.university);
      formDataToSend.append('issueDate', formData.issueDate);
      formDataToSend.append('type', credentialType);
      
      if (formData.studentImage) {
        formDataToSend.append('studentImage', formData.studentImage);
      }
      
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
        studentWalletAddress: '',
        university: '',
        issueDate: '',
        studentImage: null,
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
       console.error(error);
      showNotification(error.response?.data?.error || 'Failed to issue credential', 'error');
    } finally {
      setLoading(false);
    }
  };

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
           }, 2000);
        } else {
           // Maybe keep open to show errors?
           // For now just refresh
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
      'title', 'level', 'duration', 'score', 'expiryDate', 'description'
    ];
    const example1 = 'John Doe,0x1234567890123456789012345678901234567890,Tech University,2024-01-01,CERTIFICATION,,,,,,,,Advanced React Patterns,Expert,20 Hours,98,2025-01-01,Mastering React hooks and patterns';
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue New Credential" size="xl">
      {loading && (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl transition-all">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl flex flex-col items-center max-w-sm w-full">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <h3 className="text-white text-lg font-bold mb-2">Processing Transaction</h3>
                <p className="text-gray-400 text-center text-sm">
                    Please wait while we mint the credential on the blockchain...
                </p>
            </div>
        </div>
      )}

      <div className="space-y-6">
        
        {/* Mode Switcher */}
        <div className="flex bg-gray-900/50 p-1 rounded-xl border border-gray-800">
           <button
             onClick={() => setMode('single')}
             className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'single' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
           >
             Single Issue
           </button>
           <button
             onClick={() => setMode('batch')}
             className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${mode === 'batch' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
           >
             Batch Upload (CSV)
           </button>
        </div>

        {mode === 'batch' ? (
           <div className="space-y-6">
              <div className="bg-gray-800/30 border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors group">
                 <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-700 transition-colors">
                    <FileText className="w-8 h-8 text-indigo-400" />
                 </div>
                 <h3 className="text-lg font-semibold text-white mb-2">Upload CSV File</h3>
                 <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">
                    Upload a CSV file containing multiple credential records. Download the template below for the correct format.
                 </p>
                 
                 <input
                   type="file"
                   accept=".csv"
                   onChange={(e) => setBatchFile(e.target.files[0])}
                   className="hidden"
                   id="batch-file-upload"
                 />
                 <label 
                   htmlFor="batch-file-upload"
                   className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium cursor-pointer transition-colors shadow-lg shadow-indigo-500/20"
                 >
                   <Upload className="w-5 h-5 mr-2" />
                   {batchFile ? batchFile.name : 'Select CSV File'}
                 </label>
              </div>

              <div className="flex justify-between items-center border-t border-gray-800 pt-6">
                 <button
                   onClick={downloadTemplate}
                   className="flex items-center text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                 >
                   <Download className="w-4 h-4 mr-2" />
                   Download Template
                 </button>
                 
                 <Button
                    onClick={handleBatchUpload}
                    loading={loading}
                    disabled={!batchFile || loading}
                    size="lg"
                    className="shadow-xl shadow-indigo-500/10"
                 >
                    Process Batch
                 </Button>
              </div>

              {batchSummary && (
                 <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700">
                    <h4 className="font-semibold text-white mb-2">Results</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                       <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                          <div className="text-xl font-bold text-emerald-500">{batchSummary.success}</div>
                          <div className="text-xs text-gray-400">Success</div>
                       </div>
                       <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                          <div className="text-xl font-bold text-red-500">{batchSummary.failed}</div>
                          <div className="text-xs text-gray-400">Failed</div>
                       </div>
                       <div className="bg-gray-700/50 p-2 rounded-lg border border-gray-600">
                          <div className="text-xl font-bold text-white">{batchSummary.total}</div>
                          <div className="text-xs text-gray-400">Total</div>
                       </div>
                    </div>
                 </div>
              )}
           </div>
        ) : (
        <div className="space-y-8">
        {/* Credential Type Selector */}
        <div>
           <label className="block text-gray-400 text-sm font-medium mb-3">Credential Type</label>
           <div className="grid grid-cols-2 gap-4">
             <button
               onClick={() => setCredentialType('CERTIFICATION')}
               className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                 credentialType === 'CERTIFICATION'
                   ? 'bg-emerald-500/10 border-emerald-500'
                   : 'bg-gray-800 border-gray-700 hover:border-gray-600'
               }`}
             >
               <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${credentialType === 'CERTIFICATION' ? 'bg-emerald-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                     <Award className="w-5 h-5" />
                  </div>
                  {credentialType === 'CERTIFICATION' && <CheckCircle className="w-5 h-5 text-emerald-500" />}
               </div>
               <h4 className={`font-semibold ${credentialType === 'CERTIFICATION' ? 'text-white' : 'text-gray-300'}`}>Certification</h4>
               <p className="text-xs text-gray-500 mt-1">For courses, workshops, and skills.</p>
             </button>
             
             <button
               onClick={() => setCredentialType('TRANSCRIPT')}
               className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left group ${
                 credentialType === 'TRANSCRIPT'
                   ? 'bg-blue-500/10 border-blue-500'
                   : 'bg-gray-800 border-gray-700 hover:border-gray-600'
               }`}
             >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${credentialType === 'TRANSCRIPT' ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                     <BookOpen className="w-5 h-5" />
                  </div>
                  {credentialType === 'TRANSCRIPT' && <CheckCircle className="w-5 h-5 text-blue-500" />}
               </div>
               <h4 className={`font-semibold ${credentialType === 'TRANSCRIPT' ? 'text-white' : 'text-gray-300'}`}>Academic Transcript</h4>
               <p className="text-xs text-gray-500 mt-1">For degrees, diplomas, and detailed records.</p>
             </button>
           </div>
        </div>

        {/* Common Fields */}
        <div className="space-y-4">
           <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Recipient Details</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <Input
               label="Student Name"
               name="studentName"
               value={formData.studentName}
               onChange={handleChange}
               placeholder="e.g. Alex Johnson"
               icon={User}
               required
               className="bg-gray-800/50 border-gray-700"
             />
             <Input
               label="Student Wallet Address"
               name="studentWalletAddress"
               value={formData.studentWalletAddress}
               onChange={handleChange}
               placeholder="e.g. 0x..."
               icon={User} 
               required
               className="bg-gray-800/50 border-gray-700"
             />
             <Input
               label="University / Organization"
               name="university"
               value={formData.university}
               onChange={handleChange}
               placeholder="e.g. Tech Institute"
               icon={Building}
               required
               className="bg-gray-800/50 border-gray-700"
             />
             <Input
               label="Issue Date"
               type="date"
               name="issueDate"
               value={formData.issueDate}
               onChange={handleChange}
               icon={Calendar}
               required
               className="bg-gray-800/50 border-gray-700"
             />
           </div>
           
           <div>
             <label className="block text-gray-400 text-sm font-medium mb-2">Profile Image</label>
             <div className="flex items-center space-x-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl border-dashed">
               <div className="flex-shrink-0">
                  {formData.studentImage ? (
                     <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-500">
                        <img 
                          src={URL.createObjectURL(formData.studentImage)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                     </div>
                  ) : (
                     <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-500">
                        <Image className="w-6 h-6" />
                     </div>
                  )}
               </div>
               <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'studentImage')}
                    className="hidden"
                    id="student-image-upload"
                  />
                  <label 
                    htmlFor="student-image-upload"
                    className="cursor-pointer text-sm text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Upload Photo
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Recommended: Square JPG/PNG, max 2MB</p>
               </div>
             </div>
           </div>
        </div>

        {/* Dynamic Fields */}
        <div className="space-y-4">
           <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
             {credentialType === 'TRANSCRIPT' ? 'Academic Records' : 'Certification Details'}
           </h3>
           
           {credentialType === 'TRANSCRIPT' ? (
             <div className="space-y-5 bg-gray-800/30 p-5 rounded-xl border border-gray-700/50">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <Input
                   label="Program"
                   value={transcriptData.program}
                   onChange={(e) => setTranscriptData({...transcriptData, program: e.target.value})}
                   placeholder="e.g. B.Sc Computer Science"
                   className="bg-gray-800 border-gray-700"
                 />
                 <Input
                   label="Department"
                   value={transcriptData.department}
                   onChange={(e) => setTranscriptData({...transcriptData, department: e.target.value})}
                   placeholder="e.g. Engineering"
                   className="bg-gray-800 border-gray-700"
                 />
                 <Input
                   label="Admission Year"
                   value={transcriptData.admissionYear}
                   onChange={(e) => setTranscriptData({...transcriptData, admissionYear: e.target.value})}
                   placeholder="Year"
                   className="bg-gray-800 border-gray-700"
                 />
                 <Input
                   label="Graduation Year"
                   value={transcriptData.graduationYear}
                   onChange={(e) => setTranscriptData({...transcriptData, graduationYear: e.target.value})}
                   placeholder="Year"
                   className="bg-gray-800 border-gray-700"
                 />
                 <Input
                   label="CGPA / Grade"
                   value={transcriptData.cgpa}
                   onChange={(e) => setTranscriptData({...transcriptData, cgpa: e.target.value})}
                   placeholder="e.g. 3.85"
                   className="bg-gray-800 border-gray-700"
                 />
               </div>
   
               <div className="border-t border-gray-700/50 pt-4">
                 <label className="block text-gray-300 text-sm font-medium mb-3">Courses</label>
                 <div className="space-y-3">
                   {transcriptData.courses.map((course, index) => (
                     <div key={index} className="flex gap-3 items-center">
                       <input
                         placeholder="Code"
                         value={course.code}
                         onChange={(e) => updateCourse(index, 'code', e.target.value)}
                         className="w-24 bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                       />
                       <input
                         placeholder="Subject Name"
                         value={course.name}
                         onChange={(e) => updateCourse(index, 'name', e.target.value)}
                         className="flex-1 bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                       />
                       <input
                         placeholder="Credits"
                         value={course.credits}
                         onChange={(e) => updateCourse(index, 'credits', e.target.value)}
                         className="w-20 bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                       />
                       <input
                         placeholder="Grade"
                         value={course.grade}
                         onChange={(e) => updateCourse(index, 'grade', e.target.value)}
                         className="w-20 bg-gray-900 border border-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                       />
                       <button 
                         onClick={() => removeCourse(index)}
                         className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-700"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   ))}
                 </div>
                 <button
                   onClick={addCourse}
                   className="mt-3 flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                 >
                   <Plus className="w-4 h-4 mr-1" /> Add Course
                 </button>
               </div>
             </div>
           ) : (
             <div className="space-y-5 bg-gray-800/30 p-5 rounded-xl border border-gray-700/50">
               <Input
                 label="Certification Title"
                 value={certificationData.title}
                 onChange={(e) => setCertificationData({...certificationData, title: e.target.value})}
                 placeholder="e.g. Advanced React Patterns"
                 className="bg-gray-800 border-gray-700 font-medium"
               />
               <div className="grid grid-cols-2 gap-5">
                 <Input
                   label="Level"
                   value={certificationData.level}
                   onChange={(e) => setCertificationData({...certificationData, level: e.target.value})}
                   placeholder="e.g. Expert"
                   className="bg-gray-800 border-gray-700"
                 />
                 <Input
                   label="Duration"
                   value={certificationData.duration}
                   onChange={(e) => setCertificationData({...certificationData, duration: e.target.value})}
                   placeholder="e.g. 20 Hours"
                   className="bg-gray-800 border-gray-700"
                 />
                 <Input
                   label="Score"
                   value={certificationData.score}
                   onChange={(e) => setCertificationData({...certificationData, score: e.target.value})}
                   placeholder="e.g. 98/100"
                   className="bg-gray-800 border-gray-700"
                 />
                 <Input
                   label="Expiry Date"
                   type="date"
                   value={certificationData.expiryDate}
                   onChange={(e) => setCertificationData({...certificationData, expiryDate: e.target.value})}
                   className="bg-gray-800 border-gray-700"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                 <textarea
                   value={certificationData.description}
                   onChange={(e) => setCertificationData({...certificationData, description: e.target.value})}
                   className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 h-28 resize-none text-sm placeholder-gray-500"
                   placeholder="Briefly describe the skills validated by this certification..."
                 />
               </div>
             </div>
           )}
        </div>

        <div className="pt-4 border-t border-gray-800">
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
            size="lg"
            className="w-full justify-center text-lg font-semibold py-4 shadow-xl shadow-indigo-500/10"
          >
            Issue Credential
          </Button>
        </div>
      </div>
      )}
    </div>
    </Modal>
  );
};

export default UploadCertificateModal;
