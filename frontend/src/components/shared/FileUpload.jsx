import React, { useRef } from 'react';
import { Upload, File, X } from 'lucide-react';
import Button from './Button';

const FileUpload = ({ 
  onFileSelect, 
  selectedFile, 
  onClear, 
  accept = ".pdf",
  label = "Upload File",
  description = "Click to browse or drag and drop"
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-gray-400 text-sm">{label}</label>
      )}
      
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-green-500 transition cursor-pointer bg-gray-800 hover:bg-gray-750"
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300 mb-2">{description}</p>
          <p className="text-gray-500 text-sm">Accepted formats: {accept}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 bg-opacity-20 rounded flex items-center justify-center">
              <File className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-white font-medium">{selectedFile.name}</p>
              <p className="text-gray-400 text-sm">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            className="text-gray-400 hover:text-red-400 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
