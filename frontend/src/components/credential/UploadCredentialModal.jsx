import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { Upload, Loader2, Calendar, User, Building, Image, Plus, Trash2, BookOpen, Award, CheckCircle, FileText, Download, Users } from 'lucide-react';
import { credentialAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const UploadCredentialModal = ({ isOpen, onClose, onSuccess }) => {
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
        <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/[0.08] backdrop-blur-md">
           <button
             onClick={() => setMode('single')}
             className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
               mode === 'single' 
                 ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10' 
                 : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
             }`}
           >
             <User className="w-4 h-4" />
             Single Issue
           </button>
           <button
             onClick={() => setMode('batch')}
             className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
               mode === 'batch' 
                 ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10' 
                 : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
             }`}
           >
             <Users className="w-4 h-4" />
             Batch Upload (CSV)
           </button>
        </div>

        {mode === 'batch' ? (
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
                 <label 
                   htmlFor="batch-file-upload"
                   className="inline-flex items-center px-8 py-3.5 bg-white text-black hover:bg-gray-200 rounded-full font-bold cursor-pointer transition-all hover:scale-105 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
                 >
                   <Upload className="w-5 h-5 mr-2" />
                   {batchFile ? 'Change File' : 'Select File'}
                 </label>
              </div>

              <div className="flex justify-between items-center border-t border-white/[0.06] pt-6">
                 <button
                   onClick={downloadTemplate}
                   className="flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors group"
                 >
                   <div className="p-2 bg-white/[0.05] rounded-lg mr-2 group-hover:bg-white/[0.1] transition-colors">
                        <Download className="w-4 h-4" />
                   </div>
                   Download CSV Template
                 </button>
                 
                 <Button
                    onClick={handleBatchUpload}
                    loading={loading}
                    disabled={!batchFile || loading}
                    size="lg"
                    className="shadow-lg shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8"
                 >
                    Process Batch
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
        ) : (
        <div className="space-y-8">
        {/* Credential Type Selector */}
        <div>
           <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-4 ml-1">Credential Type</label>
           <div className="grid grid-cols-2 gap-4">
             <button
               onClick={() => setCredentialType('CERTIFICATION')}
               className={`relative p-5 rounded-2xl border transition-all duration-300 text-left group overflow-hidden ${
                 credentialType === 'CERTIFICATION'
                   ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-900/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                   : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
               }`}
             >
               <div className="flex items-start justify-between mb-3 relative z-10">
                  <div className={`p-2.5 rounded-xl transition-colors duration-300 ${credentialType === 'CERTIFICATION' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-white/10 text-gray-400 group-hover:bg-white/20'}`}>
                     <Award className="w-5 h-5" />
                  </div>
                  {credentialType === 'CERTIFICATION' && <div className="bg-emerald-500/20 p-1 rounded-full"><CheckCircle className="w-5 h-5 text-emerald-400" /></div>}
               </div>
               <h4 className={`font-bold text-lg mb-1 relative z-10 ${credentialType === 'CERTIFICATION' ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>Certification</h4>
               <p className="text-xs text-gray-500 group-hover:text-gray-400 relative z-10 font-medium">For courses, workshops, and skills verification.</p>
               
               {/* Background Glow */}
               {credentialType === 'CERTIFICATION' && <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/20 blur-2xl rounded-full"></div>}
             </button>
             
             <button
               onClick={() => setCredentialType('TRANSCRIPT')}
               className={`relative p-5 rounded-2xl border transition-all duration-300 text-left group overflow-hidden ${
                 credentialType === 'TRANSCRIPT'
                   ? 'bg-gradient-to-br from-indigo-500/20 to-indigo-900/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                   : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
               }`}
             >
                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div className={`p-2.5 rounded-xl transition-colors duration-300 ${credentialType === 'TRANSCRIPT' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'bg-white/10 text-gray-400 group-hover:bg-white/20'}`}>
                     <BookOpen className="w-5 h-5" />
                  </div>
                  {credentialType === 'TRANSCRIPT' && <div className="bg-indigo-500/20 p-1 rounded-full"><CheckCircle className="w-5 h-5 text-indigo-400" /></div>}
               </div>
               <h4 className={`font-bold text-lg mb-1 relative z-10 ${credentialType === 'TRANSCRIPT' ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>Transcript</h4>
               <p className="text-xs text-gray-500 group-hover:text-gray-400 relative z-10 font-medium">For degrees, diplomas, and comprehensive records.</p>
               
               {/* Background Glow */}
               {credentialType === 'TRANSCRIPT' && <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full"></div>}
             </button>
           </div>
        </div>

        {/* Common Fields */}
        <div className="space-y-4">
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Recipient Details</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <Input
               label="Student Name"
               name="studentName"
               value={formData.studentName}
               onChange={handleChange}
               placeholder="e.g. Alex Johnson"
               icon={User}
               required
               className="bg-black/40 border-white/10 focus:border-indigo-500/50"
             />
             <Input
               label="Student Wallet Address"
               name="studentWalletAddress"
               value={formData.studentWalletAddress}
               onChange={handleChange}
               placeholder="e.g. 0x..."
               icon={User} 
               required
               className="bg-black/40 border-white/10 focus:border-indigo-500/50"
             />
             <Input
               label="University / Organization"
               name="university"
               value={formData.university}
               onChange={handleChange}
               placeholder="e.g. Tech Issuer"
               icon={Building}
               required
               className="bg-black/40 border-white/10 focus:border-indigo-500/50"
             />
             <Input
               label="Issue Date"
               type="date"
               name="issueDate"
               value={formData.issueDate}
               onChange={handleChange}
               icon={Calendar}
               required
               className="bg-black/40 border-white/10 focus:border-indigo-500/50"
             />
           </div>
           
           <div>
             <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 ml-1">Profile Image</label>
             <div className="flex items-center space-x-4 p-4 bg-black/20 border border-white/10 rounded-2xl border-dashed hover:border-indigo-500/30 transition-colors group">
               <div className="flex-shrink-0">
                  {formData.studentImage ? (
                     <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md shadow-indigo-500/20">
                        <img 
                          src={URL.createObjectURL(formData.studentImage)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                     </div>
                  ) : (
                     <div className="w-14 h-14 rounded-full bg-white/[0.05] flex items-center justify-center text-gray-500 group-hover:text-indigo-400 transition-colors">
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
                    className="cursor-pointer text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
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
           <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">
             {credentialType === 'TRANSCRIPT' ? 'Academic Records' : 'Certification Details'}
           </h3>
           
           {credentialType === 'TRANSCRIPT' ? (
              <div className="space-y-6 bg-black/20 p-6 rounded-2xl border border-white/[0.06] backdrop-blur-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="Program"
                    value={transcriptData.program}
                    onChange={(e) => setTranscriptData({...transcriptData, program: e.target.value})}
                    placeholder="e.g. B.Sc Computer Science"
                    className="bg-black/40 border-white/10 focus:border-indigo-500/50"
                  />
                 <Input
                   label="Department"
                   value={transcriptData.department}
                   onChange={(e) => setTranscriptData({...transcriptData, department: e.target.value})}
                   placeholder="e.g. Engineering"
                   className="bg-black/40 border-white/10 focus:border-indigo-500/50"
                 />
                 <Input
                   label="Admission Year"
                   value={transcriptData.admissionYear}
                   onChange={(e) => setTranscriptData({...transcriptData, admissionYear: e.target.value})}
                   placeholder="Year"
                   className="bg-black/40 border-white/10 focus:border-indigo-500/50"
                 />
                 <Input
                   label="Graduation Year"
                   value={transcriptData.graduationYear}
                   onChange={(e) => setTranscriptData({...transcriptData, graduationYear: e.target.value})}
                   placeholder="Year"
                   className="bg-black/40 border-white/10 focus:border-indigo-500/50"
                 />
                 <Input
                   label="CGPA / Grade"
                   value={transcriptData.cgpa}
                   onChange={(e) => setTranscriptData({...transcriptData, cgpa: e.target.value})}
                   placeholder="e.g. 3.85"
                   className="bg-black/40 border-white/10 focus:border-indigo-500/50"
                 />
               </div>
                  <div className="border-t border-white/[0.08] pt-6">
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Course Records</label>
                  <div className="space-y-3">
                    {transcriptData.courses.map((course, index) => (
                      <div key={index} className="flex gap-3 items-center group">
                        <input
                          placeholder="Code"
                          value={course.code}
                          onChange={(e) => updateCourse(index, 'code', e.target.value)}
                          className="w-24 bg-white/[0.03] border border-white/10 text-white px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 focus:outline-none transition-all placeholder-gray-600"
                        />
                        <input
                          placeholder="Subject Name"
                          value={course.name}
                          onChange={(e) => updateCourse(index, 'name', e.target.value)}
                          className="flex-1 bg-white/[0.03] border border-white/10 text-white px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 focus:outline-none transition-all placeholder-gray-600"
                        />
                        <input
                          placeholder="Credits"
                          value={course.credits}
                          onChange={(e) => updateCourse(index, 'credits', e.target.value)}
                          className="w-20 bg-white/[0.03] border border-white/10 text-white px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 focus:outline-none transition-all placeholder-gray-600"
                        />
                        <input
                          placeholder="Grade"
                          value={course.grade}
                          onChange={(e) => updateCourse(index, 'grade', e.target.value)}
                          className="w-20 bg-white/[0.03] border border-white/10 text-white px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 focus:outline-none transition-all placeholder-gray-600"
                        />
                        <button 
                          onClick={() => removeCourse(index)}
                          className="p-2.5 text-gray-500 hover:text-red-400 transition-colors rounded-xl hover:bg-red-500/10 opacity-60 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addCourse}
                    className="mt-4 flex items-center text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Course Record
                  </button>
                </div>
              </div>
           ) : (
             <div className="space-y-5 bg-black/20 p-6 rounded-2xl border border-white/[0.06] backdrop-blur-sm">
               <Input
                 label="Certification Title"
                 value={certificationData.title}
                 onChange={(e) => setCertificationData({...certificationData, title: e.target.value})}
                 placeholder="e.g. Advanced React Patterns"
                 className="bg-black/40 border-white/10 focus:border-indigo-500/50 font-bold"
               />
               <div className="grid grid-cols-2 gap-5">
                 <Input
                   label="Level"
                   value={certificationData.level}
                   onChange={(e) => setCertificationData({...certificationData, level: e.target.value})}
                   placeholder="e.g. Expert"
                   className="bg-black/40 border-white/10 focus:border-indigo-500/50"
                 />
                 <Input
                   label="Duration"
                   value={certificationData.duration}
                   onChange={(e) => setCertificationData({...certificationData, duration: e.target.value})}
                   placeholder="e.g. 20 Hours"
                   className="bg-black/40 border-white/10 focus:border-indigo-500/50"
                 />
                 <Input
                   label="Score"
                   value={certificationData.score}
                   onChange={(e) => setCertificationData({...certificationData, score: e.target.value})}
                   placeholder="e.g. 98/100"
                   className="bg-black/40 border-white/10 focus:border-indigo-500/50"
                 />
                 <Input
                   label="Expiry Date"
                   type="date"
                   value={certificationData.expiryDate}
                   onChange={(e) => setCertificationData({...certificationData, expiryDate: e.target.value})}
                   className="bg-black/40 border-white/10 focus:border-indigo-500/50"
                 />
               </div>
               <div>
                 <label className="block text-sm font-bold text-gray-400 mb-2 ml-1">Description</label>
                 <textarea
                   value={certificationData.description}
                   onChange={(e) => setCertificationData({...certificationData, description: e.target.value})}
                   className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 h-28 resize-none text-sm placeholder-gray-600 transition-all"
                   placeholder="Briefly describe the skills validated by this certification..."
                 />
               </div>
             </div>
           )}
        </div>

        <div className="pt-6 border-t border-white/[0.08]">
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
            size="lg"
            className="w-full justify-center text-lg font-bold py-4 shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-500 rounded-2xl"
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

export default UploadCredentialModal;
