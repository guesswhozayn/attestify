import React, { useState, useEffect, useRef, useCallback } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import TypeSelectionCard from './TypeSelectionCard';
import { Loader2, Calendar, User, Building, Image, Plus, Trash2, BookOpen, Award, Shield, Activity } from 'lucide-react';
import { credentialAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const getInitialFormData = (user) => ({
  studentName: '',
  studentWalletAddress: '',
  university: user?.issuerDetails?.institutionName || user?.name || '',
  issueDate: '',
  studentImage: '',
});

const INITIAL_TRANSCRIPT = {
  program: '',
  department: '',
  admissionYear: '',
  graduationYear: '',
  cgpa: '',
  courses: []
};

const INITIAL_CERTIFICATION = {
  title: '',
  description: '',
  level: '',
  duration: '',
  score: ''
};

const IssueCredentialModal = ({ isOpen, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => getInitialFormData(user));
  const [credentialType, setCredentialType] = useState('CERTIFICATION');
  const [transcriptData, setTranscriptData] = useState({ ...INITIAL_TRANSCRIPT });
  const [certificationData, setCertificationData] = useState({ ...INITIAL_CERTIFICATION });
  const [quotaError, setQuotaError] = useState(false);

  // Track object URL to prevent memory leaks
  const imagePreviewUrl = useRef(null);

  // Create/revoke object URLs properly
  useEffect(() => {
    // Revoke previous URL to free memory
    if (imagePreviewUrl.current) {
      URL.revokeObjectURL(imagePreviewUrl.current);
      imagePreviewUrl.current = null;
    }

    // Create new URL if we have a file
    if (formData.studentImage && formData.studentImage instanceof File) {
      imagePreviewUrl.current = URL.createObjectURL(formData.studentImage);
    }

    return () => {
      if (imagePreviewUrl.current) {
        URL.revokeObjectURL(imagePreviewUrl.current);
        imagePreviewUrl.current = null;
      }
    };
  }, [formData.studentImage]);

  // Reset all form state when modal closes
  const resetForm = useCallback(() => {
    setFormData(getInitialFormData(user));
    setCredentialType('CERTIFICATION');
    setTranscriptData({ ...INITIAL_TRANSCRIPT });
    setCertificationData({ ...INITIAL_CERTIFICATION });
    setQuotaError(false);
  }, [user]);

  // Reset form when modal closes (user cancels or after success)
  useEffect(() => {
    if (!isOpen) {
      // Small delay to let the close animation play before resetting
      const timer = setTimeout(resetForm, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, resetForm]);

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

    setQuotaError(false);
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('studentName', formData.studentName);
      formDataToSend.append('studentWalletAddress', formData.studentWalletAddress);
      formDataToSend.append('university', formData.university);
      formDataToSend.append('issueDate', formData.issueDate);
      formDataToSend.append('type', credentialType);
      
      if (formData.studentImage && formData.studentImage instanceof File) {
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

    } catch (error) {
       console.error(error);
       if (error.response?.status === 403 && error.response?.data?.error?.includes('limit reached')) {
          setQuotaError(error.response.data.error);
       } else {
          showNotification(error.response?.data?.error || 'Failed to issue credential', 'error');
       }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue New Credential" size="xl">
      {/* Loading Overlay — positioned relative to modal body */}
      {loading && (
        <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-50 transition-all rounded-2xl">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl flex flex-col items-center max-w-sm w-full">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                <h3 className="text-white text-lg font-bold mb-2">Processing Transaction</h3>
                <p className="text-gray-400 text-center text-sm">
                    Please wait while we mint the credential on the blockchain...
                </p>
            </div>
        </div>
      )}

      {quotaError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 mb-6 flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-3">
                  <Shield className="w-6 h-6 text-red-400" />
              </div>
              <h4 className="text-red-400 font-bold mb-2 text-lg">Issuance Limit Reached</h4>
              <p className="text-red-400/80 text-sm mb-4">
                 Your institution has reached the maximum number of credentials allowed on your current plan.
              </p>
              <Button 
                onClick={() => window.location.assign('/pricing')} 
                variant="white"
                className="w-full justify-center text-red-600 font-bold shadow-lg"
              >
                  Upgrade Plan to Issue More
              </Button>
          </div>
      )}

      <div className="relative group flex flex-col">
        <div className="relative z-10 space-y-8 pb-4">
          <div className="space-y-8">
        {/* Credential Type Selector */}
        <div>
           <label className="block text-xs font-bold text-gray-400 ml-4 uppercase tracking-wider mb-4">Credential Type</label>
           <div className="grid grid-cols-2 gap-4">
             <TypeSelectionCard 
               active={credentialType === 'CERTIFICATION'}
               onClick={() => setCredentialType('CERTIFICATION')}
               icon={Award}
               title="Certification"
               description="For courses, workshops, and skills verification."
               variant="emerald"
             />
             <TypeSelectionCard 
               active={credentialType === 'TRANSCRIPT'}
               onClick={() => setCredentialType('TRANSCRIPT')}
               icon={BookOpen}
               title="Transcript"
               description="For degrees, diplomas, and comprehensive records."
               variant="indigo"
             />
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
                  {formData.studentImage && formData.studentImage instanceof File ? (
                     <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-500 shadow-md shadow-indigo-500/20">
                        <img 
                          src={imagePreviewUrl.current} 
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
                    icon={BookOpen}
                  />
                 <Input
                   label="Department"
                   value={transcriptData.department}
                   onChange={(e) => setTranscriptData({...transcriptData, department: e.target.value})}
                   placeholder="e.g. Engineering"
                   icon={Building}
                 />
                 <Input
                   label="Admission Year"
                   value={transcriptData.admissionYear}
                   onChange={(e) => setTranscriptData({...transcriptData, admissionYear: e.target.value})}
                   placeholder="Year"
                   icon={Calendar}
                 />
                 <Input
                   label="Graduation Year"
                   value={transcriptData.graduationYear}
                   onChange={(e) => setTranscriptData({...transcriptData, graduationYear: e.target.value})}
                   placeholder="Year"
                   icon={Calendar}
                 />
                 <Input
                   label="CGPA / Grade"
                   value={transcriptData.cgpa}
                   onChange={(e) => setTranscriptData({...transcriptData, cgpa: e.target.value})}
                   placeholder="e.g. 3.85"
                   icon={Award}
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
                          variant="danger"
                          rounded="xl"
                          size="sm"
                          icon={Trash2}
                          className="!p-2.5 opacity-60 group-hover:opacity-100"
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={addCourse}
                    variant="secondary"
                    size="sm"
                    icon={Plus}
                    className="mt-4"
                  >
                    Add Course Record
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
                 icon={Award}
               />
               <div className="grid grid-cols-2 gap-5">
                 <Input
                   label="Level"
                   value={certificationData.level}
                   onChange={(e) => setCertificationData({...certificationData, level: e.target.value})}
                   placeholder="e.g. Expert"
                   icon={Shield}
                 />
                 <Input
                   label="Duration"
                   value={certificationData.duration}
                   onChange={(e) => setCertificationData({...certificationData, duration: e.target.value})}
                   placeholder="e.g. 20 Hours"
                   icon={Calendar}
                 />
                 <Input
                   label="Score"
                   value={certificationData.score}
                   onChange={(e) => setCertificationData({...certificationData, score: e.target.value})}
                   placeholder="e.g. 98/100"
                   icon={Activity}
                 />
               </div>
               <div>
                 <label className="block text-xs font-bold text-gray-400 ml-4 uppercase tracking-wider mb-2">Description</label>
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
