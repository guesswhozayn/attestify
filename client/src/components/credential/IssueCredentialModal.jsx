import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Button from '../shared/Button';
import TypeSelectionCard from './TypeSelectionCard';
import { Loader2, Calendar, User, Building, Plus, Trash2, BookOpen, Award, Wallet } from 'lucide-react';
import { credentialAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

const getInitialFormData = (user) => ({
  studentName: '',
  studentWalletAddress: '',
  university: user?.issuerDetails?.institutionName || user?.name || '',
  issueDate: new Date().toISOString().split('T')[0]
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
  level: 'Intermediate',
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

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData(user));
    setCredentialType('CERTIFICATION');
    setTranscriptData({ ...INITIAL_TRANSCRIPT });
    setCertificationData({ ...INITIAL_CERTIFICATION });
  }, [user]);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(resetForm, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, resetForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    if (!formData.studentName || !formData.studentWalletAddress || !formData.university || !formData.issueDate) {
      showNotification('Please fill in all required recipient details', 'error');
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

      if (credentialType === 'TRANSCRIPT') {
        formDataToSend.append('transcriptData', JSON.stringify(transcriptData));
      } else {
        formDataToSend.append('certificationData', JSON.stringify(certificationData));
      }

      const response = await credentialAPI.issue(formDataToSend);
      const { credentialId } = response.data;

      setLoadingMessage('Recording credential on blockchain...');

      const pollStatus = () => {
        return new Promise((resolve, reject) => {
          const interval = setInterval(async () => {
            try {
              const statusRes = await credentialAPI.getStatus(credentialId);
              const { status, credential } = statusRes.data;

              if (status === 'COMPLETED') {
                clearInterval(interval);
                resolve(credential);
              } else if (status === 'FAILED') {
                clearInterval(interval);
                reject(new Error(statusRes.data.error || 'Failed to issue credential'));
              }
            } catch (err) {
              clearInterval(interval);
              reject(err);
            }
          }, 2000);
        });
      };

      await pollStatus();
      showNotification('Credential issued successfully', 'success');
      onSuccess?.();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.error || error.message || 'Issuance failed', 'error');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Issue credential" size="2xl">
      {loading && (
        <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs flex flex-col items-center justify-center z-50 rounded-2xl">
          <div data-modal-panel className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xl flex flex-col items-center max-w-sm w-full mx-4">
            <Loader2 className="w-8 h-8 text-stone-900 animate-spin mb-3" />
            <h3 className="text-stone-900 text-sm font-semibold mb-1">Issuing credential</h3>
            <p className="text-stone-500 text-center text-xs">{loadingMessage}</p>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Credential type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <TypeSelectionCard
              active={credentialType === 'CERTIFICATION'}
              onClick={() => setCredentialType('CERTIFICATION')}
              icon={Award}
              title="Certification"
              description="Courses, certifications, or workshops."
            />
            <TypeSelectionCard
              active={credentialType === 'TRANSCRIPT'}
              onClick={() => setCredentialType('TRANSCRIPT')}
              icon={BookOpen}
              title="Transcript"
              description="Academic degrees and coursework."
            />
          </div>
        </div>

        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 space-y-4">
          <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
            Recipient details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Student name"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              placeholder="e.g. Alex Johnson"
              required
            />
            <Input
              label="Student wallet address"
              name="studentWalletAddress"
              value={formData.studentWalletAddress}
              onChange={handleChange}
              placeholder="0x..."
              required
            />
            <Input
              label="Institution"
              name="university"
              value={formData.university}
              onChange={handleChange}
              disabled
              className="opacity-75 cursor-not-allowed"
            />
            <Input
              label="Issue date"
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200/80 space-y-4">
          <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
            {credentialType === 'TRANSCRIPT' ? 'Academic details' : 'Certification details'}
          </h3>

          {credentialType === 'TRANSCRIPT' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Program"
                  value={transcriptData.program}
                  onChange={(e) => setTranscriptData({ ...transcriptData, program: e.target.value })}
                  placeholder="e.g. B.Sc Computer Science"
                />
                <Input
                  label="Department"
                  value={transcriptData.department}
                  onChange={(e) => setTranscriptData({ ...transcriptData, department: e.target.value })}
                  placeholder="e.g. Engineering"
                />
                <Input
                  label="Admission year"
                  value={transcriptData.admissionYear}
                  onChange={(e) => setTranscriptData({ ...transcriptData, admissionYear: e.target.value })}
                  placeholder="e.g. 2021"
                />
                <Input
                  label="Graduation year"
                  value={transcriptData.graduationYear}
                  onChange={(e) => setTranscriptData({ ...transcriptData, graduationYear: e.target.value })}
                  placeholder="e.g. 2025"
                />
                <Input
                  label="CGPA / Grade"
                  value={transcriptData.cgpa}
                  onChange={(e) => setTranscriptData({ ...transcriptData, cgpa: e.target.value })}
                  placeholder="e.g. 3.85"
                />
              </div>

              <div className="pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-stone-700">Courses (Optional)</span>
                  <button
                    type="button"
                    onClick={addCourse}
                    className="flex items-center gap-1 text-xs font-medium text-stone-800 hover:text-stone-950"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add course</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {transcriptData.courses.map((course, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        placeholder="Code"
                        value={course.code}
                        onChange={(e) => updateCourse(index, 'code', e.target.value)}
                        className="w-20 bg-white border border-stone-200 text-stone-900 px-2.5 py-1.5 rounded-lg text-xs"
                      />
                      <input
                        placeholder="Course title"
                        value={course.name}
                        onChange={(e) => updateCourse(index, 'name', e.target.value)}
                        className="flex-1 bg-white border border-stone-200 text-stone-900 px-2.5 py-1.5 rounded-lg text-xs"
                      />
                      <input
                        placeholder="Credits"
                        value={course.credits}
                        onChange={(e) => updateCourse(index, 'credits', e.target.value)}
                        className="w-16 bg-white border border-stone-200 text-stone-900 px-2.5 py-1.5 rounded-lg text-xs"
                      />
                      <input
                        placeholder="Grade"
                        value={course.grade}
                        onChange={(e) => updateCourse(index, 'grade', e.target.value)}
                        className="w-16 bg-white border border-stone-200 text-stone-900 px-2.5 py-1.5 rounded-lg text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeCourse(index)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Certificate title"
                  value={certificationData.title}
                  onChange={(e) => setCertificationData({ ...certificationData, title: e.target.value })}
                  placeholder="e.g. Full Stack Web Development"
                  required
                />
              </div>
              <Input
                label="Level"
                value={certificationData.level}
                onChange={(e) => setCertificationData({ ...certificationData, level: e.target.value })}
                placeholder="e.g. Beginner, Advanced"
              />
              <Input
                label="Duration"
                value={certificationData.duration}
                onChange={(e) => setCertificationData({ ...certificationData, duration: e.target.value })}
                placeholder="e.g. 40 Hours"
              />
              <Input
                label="Score / Grade"
                value={certificationData.score}
                onChange={(e) => setCertificationData({ ...certificationData, score: e.target.value })}
                placeholder="e.g. 95% or Pass"
              />
              <div className="md:col-span-2">
                <Input
                  label="Description"
                  value={certificationData.description}
                  onChange={(e) => setCertificationData({ ...certificationData, description: e.target.value })}
                  placeholder="Short summary of skills acquired"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            size="sm"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={loading}
            size="sm"
          >
            Issue
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default IssueCredentialModal;
