import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import TypeSelectionCard from './TypeSelectionCard';
import { Loader2, Calendar, User, Building, Image, Plus, Trash2, BookOpen, Award, Shield, Activity, Wallet } from 'lucide-react';
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
  const [loadingMessage, setLoadingMessage] = useState('');
  const [formData, setFormData] = useState(() => getInitialFormData(user));
  const [credentialType, setCredentialType] = useState('CERTIFICATION');
  const [transcriptData, setTranscriptData] = useState({ ...INITIAL_TRANSCRIPT });
  const [certificationData, setCertificationData] = useState({ ...INITIAL_CERTIFICATION });

  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  useEffect(() => {
    if (formData.studentImage instanceof File) {
      const url = URL.createObjectURL(formData.studentImage);
      Promise.resolve().then(() => setImagePreviewUrl(url));
      return () => URL.revokeObjectURL(url);
    }
    Promise.resolve().then(() => setImagePreviewUrl(null));
  }, [formData.studentImage]);

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData(user));
    setCredentialType('CERTIFICATION');
    setTranscriptData({ ...INITIAL_TRANSCRIPT });
    setCertificationData({ ...INITIAL_CERTIFICATION });
  }, [user]);

  useEffect(() => {
    if (!isOpen) {

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

    setLoading(true);
    setLoadingMessage('Preparing credential...');

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
      const { credentialId } = response.data;

      setLoadingMessage('Queued. Processing credential...');

      const pollStatus = () => {
        return new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
            try {
              const statusRes = await credentialAPI.getStatus(credentialId);
              const { status, credential } = statusRes.data;

              if (status === 'PENDING') {
                setLoadingMessage('Generating PDF and storing file...');
              } else if (status === 'PROCESSING') {
                setLoadingMessage('Issuing credential on the blockchain...');
              } else if (status === 'COMPLETED') {
                clearInterval(interval);
                resolve(credential);
              } else if (status === 'FAILED') {
                clearInterval(interval);
                reject(new Error(credential.error || 'Issuance failed'));
              }
            } catch (err) {
              clearInterval(interval);
              reject(err);
            }
          }, 2500);
        });
      };

      const finalCredential = await pollStatus();

      showNotification('Credential issued successfully', 'success');
      onSuccess(finalCredential);
      onClose();

    } catch (error) {
       console.error(error);
       showNotification(error.response?.data?.error || error.message || 'Failed to issue credential', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue credential" size="xl">

      {loading && (
        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs flex flex-col items-center justify-center z-50 transition-all rounded-3xl">
            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-2xl flex flex-col items-center max-w-sm w-full">
                <Loader2 className="w-10 h-10 text-stone-900 animate-spin mb-3" />
                <h3 className="text-stone-900 text-base font-bold mb-1">Issuing credential</h3>
                <p className="text-stone-500 text-center text-xs">
                    {loadingMessage}
                </p>
            </div>
        </div>
      )}

      <div className="relative group flex flex-col">
        <div className="relative z-10 space-y-6 pb-2">
          <div className="space-y-6">

        <div>
           <label className="block text-xs font-bold text-stone-500 ml-1 uppercase tracking-wider mb-3">Credential type</label>
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

        <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8E4DC] space-y-5">
           <h3 className="text-xs font-bold text-stone-600 flex items-center gap-2 ml-1 uppercase tracking-wider">
              <User className="w-4 h-4 text-stone-700" />
              Recipient details
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
             <Input
               label="Student name"
               name="studentName"
               value={formData.studentName}
               onChange={handleChange}
               placeholder="e.g. Alex Johnson"
               icon={User}
               required
             />
             <Input
               label="Student wallet address"
               name="studentWalletAddress"
               value={formData.studentWalletAddress}
               onChange={handleChange}
               placeholder="e.g. 0x..."
               icon={Wallet}
               required
             />
             <Input
               label="Institution"
               name="university"
               value={formData.university}
               onChange={handleChange}
               placeholder="e.g. Tech Issuer"
               icon={Building}
               required
               disabled={true}
               className="opacity-70 cursor-not-allowed"
             />
             <Input
               label="Issue date"
               type="date"
               name="issueDate"
               value={formData.issueDate}
               onChange={handleChange}
               icon={Calendar}
               required
             />
           </div>

           <div className="border-t border-[#E8E4DC] pt-5">
             <label className="block text-xs font-bold text-stone-500 ml-1 uppercase tracking-wider mb-2">Student photo</label>
             <div className="flex items-center space-x-4 p-4 bg-white border border-[#E8E4DC] rounded-xl border-dashed hover:border-stone-400 transition-colors">
               <div className="shrink-0">
                  {formData.studentImage && formData.studentImage instanceof File ? (
                     <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-stone-300">
                        <img
                          src={imagePreviewUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                     </div>
                  ) : (
                     <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
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
                    className="cursor-pointer text-sm font-semibold text-stone-900 hover:text-stone-700 transition-colors"
                  >
                    Upload student photo
                  </label>
                  <p className="text-xs text-stone-400 mt-0.5">Square JPG/PNG, max 2MB</p>
               </div>
             </div>
           </div>
        </div>

        <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8E4DC] space-y-5">
           <h3 className="text-xs font-bold text-stone-600 flex items-center gap-2 ml-1 uppercase tracking-wider">
             {credentialType === 'TRANSCRIPT' ? <BookOpen className="w-4 h-4 text-stone-700" /> : <Award className="w-4 h-4 text-stone-700" />}
             {credentialType === 'TRANSCRIPT' ? 'Academic record' : 'Certification details'}
           </h3>

           {credentialType === 'TRANSCRIPT' ? (
              <div className="space-y-5">
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
                   label="Admission year"
                   value={transcriptData.admissionYear}
                   onChange={(e) => setTranscriptData({...transcriptData, admissionYear: e.target.value})}
                   placeholder="Year"
                   icon={Calendar}
                 />
                 <Input
                   label="Graduation year"
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
                  <div className="border-t border-[#E8E4DC] pt-5">
                  <label className="block text-xs font-bold text-stone-500 ml-1 uppercase tracking-wider mb-3">Courses</label>
                  <div className="space-y-2.5">
                    {transcriptData.courses.map((course, index) => (
                      <div key={index} className="flex gap-2.5 items-center">
                        <input
                          placeholder="Code"
                          value={course.code}
                          onChange={(e) => updateCourse(index, 'code', e.target.value)}
                          className="w-24 bg-white border border-[#E8E4DC] text-stone-900 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-stone-400 placeholder-stone-400"
                        />
                        <input
                          placeholder="Subject Name"
                          value={course.name}
                          onChange={(e) => updateCourse(index, 'name', e.target.value)}
                          className="flex-1 bg-white border border-[#E8E4DC] text-stone-900 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-stone-400 placeholder-stone-400"
                        />
                        <input
                          placeholder="Credits"
                          value={course.credits}
                          onChange={(e) => updateCourse(index, 'credits', e.target.value)}
                          className="w-20 bg-white border border-[#E8E4DC] text-stone-900 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-stone-400 placeholder-stone-400"
                        />
                        <input
                          placeholder="Grade"
                          value={course.grade}
                          onChange={(e) => updateCourse(index, 'grade', e.target.value)}
                          className="w-20 bg-white border border-[#E8E4DC] text-stone-900 px-3 py-2 rounded-xl text-sm focus:outline-none focus:border-stone-400 placeholder-stone-400"
                        />
                        <Button
                          onClick={() => removeCourse(index)}
                          variant="danger"
                          rounded="xl"
                          size="sm"
                          icon={Trash2}
                          className="!p-2 text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100"
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={addCourse}
                    variant="outline"
                    size="sm"
                    icon={Plus}
                    className="mt-3 bg-white text-stone-700 border-stone-200 hover:bg-stone-50"
                  >
                    Add course
                  </Button>
                </div>
              </div>
           ) : (
             <div className="space-y-4">
               <Input
                 label="Certification title"
                 value={certificationData.title}
                 onChange={(e) => setCertificationData({...certificationData, title: e.target.value})}
                 placeholder="e.g. Advanced React Patterns"
                 icon={Award}
               />
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                 <label className="block text-xs font-bold text-stone-500 ml-1 uppercase tracking-wider mb-2">Description</label>
                 <textarea
                   value={certificationData.description}
                   onChange={(e) => setCertificationData({...certificationData, description: e.target.value})}
                   className="w-full bg-white border border-[#E8E4DC] text-stone-900 px-4 py-3 rounded-xl focus:outline-none focus:border-stone-400 h-28 resize-none text-sm placeholder-stone-400"
                   placeholder="Briefly describe the skills validated by this certification..."
                 />
               </div>
             </div>
           )}
        </div>

        <div className="pt-4 border-t border-[#E8E4DC]">
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
            variant="primary"
            size="lg"
            className="w-full justify-center bg-stone-900 hover:bg-stone-800 text-white rounded-xl py-4 font-semibold text-sm shadow-sm cursor-pointer"
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
