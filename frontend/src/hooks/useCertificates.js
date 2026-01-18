import { useState, useEffect } from 'react';
import { credentialAPI } from '../services/api';

export const useCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const response = await credentialAPI.getAll();
      setCertificates(response.data.credentials);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const addCertificate = (certificate) => {
    setCertificates(prev => [certificate, ...prev]);
  };

  const updateCertificate = (id, updates) => {
    setCertificates(prev =>
      prev.map(cert => (cert._id === id ? { ...cert, ...updates } : cert))
    );
  };

  const removeCertificate = (id) => {
    setCertificates(prev => prev.filter(cert => cert._id !== id));
  };

  return {
    certificates,
    loading,
    error,
    fetchCertificates,
    addCertificate,
    updateCertificate,
    removeCertificate,
  };
};
