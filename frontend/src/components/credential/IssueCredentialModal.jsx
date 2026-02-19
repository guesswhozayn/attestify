import React, { useState } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import { Loader2, Calendar, User, Building, Image, Plus, Trash2, BookOpen, Award, CheckCircle } from 'lucide-react';
import { credentialAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const IssueCredentialModal = ({ isOpen, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentName: '',
    studentWalletAddress: '',
    university: user?.issuerDetails?.institutionName || user?.name || '',
    issueDate: '',
    studentImage: '',
  });

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
    score: ''
  });

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
        university: user?.issuerDetails?.institutionName || user?.name || '',
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
        score: ''
      });

    } catch (error) {
       console.error(error);
      showNotification(error.response?.data?.error || 'Failed to issue credential', 'error');
    } finally {
      setLoading(false);
    }
  };




  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue New Credential" size="xl">
      {loading && (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-all rounded-3xl">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl flex flex-col items-center max-w-sm w-full">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <h3 className="text-white text-lg font-bold mb-2">Processing Transaction</h3>
                <p className="text-gray-400 text-center text-sm">
                    Please wait while we mint the credential on the blockchain...
                </p>
            </div>
        </div>
      )}

      <div className="relative group flex flex-col">
        <div className="relative z-10 space-y-8 pb-4">
          <div className="space-y-8">
        {/* Credential Type Selector */}
        <div>
           <label className="block text-xs font-bold text-gray-400 ml-4 uppercase tracking-wider mb-4">Credential Type</label>
           <div className="grid grid-cols-2 gap-4">
             <Button
               onClick={() => setCredentialType('CERTIFICATION')}
               variant="ghost"
               rounded="2xl"
               className={`relative p-5 !justify-start !shadow-none h-auto transition-all duration-300 text-left group overflow-hidden ${
                 credentialType === 'CERTIFICATION'
                   ? 'bg-gradient-to-br from-emerald-900/50 via-teal-900/40 to-gray-900/50 border-emerald-500/50 shadow-emerald-500/10'
                   : 'bg-white/[0.03] border-white/10'
               }`}
             >
               <div className="flex items-start justify-between mb-3 relative z-10 w-full">
                  <div className={`p-2.5 rounded-xl transition-colors duration-300 ${credentialType === 'CERTIFICATION' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'bg-white/10 text-emerald-400 group-hover:bg-white/20'}`}>
                     <Award className="w-5 h-5" />
                  </div>
                  {credentialType === 'CERTIFICATION' && <div className="bg-emerald-500/20 p-1 rounded-full"><CheckCircle className="w-5 h-5 text-emerald-400" /></div>}
               </div>
               <h4 className={`font-bold text-lg mb-1 relative z-10 normal-case tracking-normal ${credentialType === 'CERTIFICATION' ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>Certification</h4>
               <p className="text-xs text-gray-500 group-hover:text-gray-400 relative z-10 font-medium normal-case tracking-normal">For courses, workshops, and skills verification.</p>
               
               {/* Background Glow */}
               {credentialType === 'CERTIFICATION' && <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/20 blur-2xl rounded-full"></div>}
             </Button>
             
             <Button
               onClick={() => setCredentialType('TRANSCRIPT')}
               variant="ghost"
               rounded="2xl"
               className={`relative p-5 !justify-start !shadow-none h-auto transition-all duration-300 text-left group overflow-hidden ${
                 credentialType === 'TRANSCRIPT'
                   ? 'bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-gray-900/50 border-indigo-500/50 shadow-indigo-500/10'
                   : 'bg-white/[0.03] border-white/10'
               }`}
             >
                <div className="flex items-start justify-between mb-3 relative z-10 w-full">
                  <div className={`p-2.5 rounded-xl transition-colors duration-300 ${credentialType === 'TRANSCRIPT' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'bg-white/10 text-indigo-400 group-hover:bg-white/20'}`}>
                     <BookOpen className="w-5 h-5" />
                  </div>
                  {credentialType === 'TRANSCRIPT' && <div className="bg-indigo-500/20 p-1 rounded-full"><CheckCircle className="w-5 h-5 text-indigo-400" /></div>}
               </div>
               <h4 className={`font-bold text-lg mb-1 relative z-10 normal-case tracking-normal ${credentialType === 'TRANSCRIPT' ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>Transcript</h4>
               <p className="text-xs text-gray-500 group-hover:text-gray-400 relative z-10 font-medium normal-case tracking-normal">For degrees, diplomas, and comprehensive records.</p>
               
               {/* Background Glow */}
               {credentialType === 'TRANSCRIPT' && <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-indigo-500/20 blur-2xl rounded-full"></div>}
             </Button>
           </div>
        </div>

        {/* Common Fields */}
        <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/[0.06] space-y-6">
           <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2 ml-4 uppercase tracking-wider">
              <User className="w-4 h-4 text-indigo-400" />
              Recipient Details
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <Input
               label="Student Name"
               name="studentName"
               value={formData.studentName}
               onChange={handleChange}
               placeholder="e.g. Alex Johnson"
               icon={User}
               required
             />
             <Input
               label="Student Wallet Address"
               name="studentWalletAddress"
               value={formData.studentWalletAddress}
               onChange={handleChange}
               placeholder="e.g. 0x..."
               icon={User} 
               required
             />
             <Input
               label="University / Organization"
               name="university"
               value={formData.university}
               onChange={handleChange}
               placeholder="e.g. Tech Issuer"
               icon={Building}
               required
               disabled={true}
               className="opacity-60 cursor-not-allowed"
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
           
           <div className="border-t border-white/[0.06] pt-6">
             <label className="block text-xs font-bold text-gray-400 ml-4 uppercase tracking-wider mb-3">Profile Image</label>
             <div className="flex items-center space-x-4 p-4 bg-black/20 border border-white/10 rounded-2xl border-dashed hover:border-indigo-500/30 transition-colors group">
               <div className="flex-shrink-0">
                  {formData.studentImage ? (
                     <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md shadow-indigo-500/20">
                        <img 
                          src={URL.createObjectURL(formData.studentImage)} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                     </div>
                  ) : (
                     <div className="w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center text-gray-500 group-hover:text-indigo-400 transition-colors">
                        <Image className="w-7 h-7" />
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
                    Upload Student Photo
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Recommended: Square JPG/PNG, max 2MB</p>
               </div>
             </div>
           </div>
        </div>

        {/* Dynamic Fields */}
        <div className="bg-white/[0.02] p-6 rounded-3xl border border-white/[0.06] space-y-6">
           <h3 className="text-xs font-bold text-gray-400 flex items-center gap-2 ml-4 uppercase tracking-wider">
             {credentialType === 'TRANSCRIPT' ? <BookOpen className="w-4 h-4 text-indigo-400" /> : <Award className="w-4 h-4 text-emerald-400" />}
             {credentialType === 'TRANSCRIPT' ? 'Academic Records' : 'Certification Details'}
           </h3>
           
           {credentialType === 'TRANSCRIPT' ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Input
                    label="Program"
                    value={transcriptData.program}
                    onChange={(e) => setTranscriptData({...transcriptData, program: e.target.value})}
                    placeholder="e.g. B.Sc Computer Science"
                  />
                 <Input
                   label="Department"
                   value={transcriptData.department}
                   onChange={(e) => setTranscriptData({...transcriptData, department: e.target.value})}
                   placeholder="e.g. Engineering"
                 />
                 <Input
                   label="Admission Year"
                   value={transcriptData.admissionYear}
                   onChange={(e) => setTranscriptData({...transcriptData, admissionYear: e.target.value})}
                   placeholder="Year"
                 />
                 <Input
                   label="Graduation Year"
                   value={transcriptData.graduationYear}
                   onChange={(e) => setTranscriptData({...transcriptData, graduationYear: e.target.value})}
                   placeholder="Year"
                 />
                 <Input
                   label="CGPA / Grade"
                   value={transcriptData.cgpa}
                   onChange={(e) => setTranscriptData({...transcriptData, cgpa: e.target.value})}
                   placeholder="e.g. 3.85"
                 />
               </div>
                  <div className="border-t border-white/[0.06] pt-6">
                  <label className="block text-xs font-bold text-gray-400 ml-4 uppercase tracking-wider mb-4">Course Records</label>
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
                        <Button 
                          onClick={() => removeCourse(index)}
                          variant="ghost"
                          rounded="xl"
                          size="sm"
                          className="!p-2.5 text-gray-500 hover:text-red-400 opacity-60 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={addCourse}
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Course Record
                  </Button>
                </div>
              </div>
           ) : (
             <div className="space-y-5">
               <Input
                 label="Certification Title"
                 value={certificationData.title}
                 onChange={(e) => setCertificationData({...certificationData, title: e.target.value})}
                 placeholder="e.g. Advanced React Patterns"
               />
               <div className="grid grid-cols-2 gap-5">
                 <Input
                   label="Level"
                   value={certificationData.level}
                   onChange={(e) => setCertificationData({...certificationData, level: e.target.value})}
                   placeholder="e.g. Expert"
                 />
                 <Input
                   label="Duration"
                   value={certificationData.duration}
                   onChange={(e) => setCertificationData({...certificationData, duration: e.target.value})}
                   placeholder="e.g. 20 Hours"
                 />
                 <Input
                   label="Score"
                   value={certificationData.score}
                   onChange={(e) => setCertificationData({...certificationData, score: e.target.value})}
                   placeholder="e.g. 98/100"
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-400 ml-4 uppercase tracking-wider mb-2">Description</label>
                 <textarea
                   value={certificationData.description}
                   onChange={(e) => setCertificationData({...certificationData, description: e.target.value})}
                   className="w-full bg-black/40 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50 h-28 resize-none text-sm placeholder-gray-600 transition-all text-base"
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
            variant={credentialType === 'TRANSCRIPT' ? 'primary' : 'success'}
            size="lg"
            className="w-full justify-center shadow-xl py-5 gap-4"
          >
            Issue {credentialType === 'TRANSCRIPT' ? 'Transcript' : 'Certification'}
          </Button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
  );
};

export default IssueCredentialModal;
