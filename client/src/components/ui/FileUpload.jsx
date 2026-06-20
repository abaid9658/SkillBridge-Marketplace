import React, { useState, useRef } from 'react';
import { Upload, FileImage, X } from 'lucide-react';

const FileUpload = ({ onFileSelect, label = 'Upload Image', accept = 'image/*', multiple = false }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState([]);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    const validFiles = Array.from(files);
    
    // Create preview URLs
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => (multiple ? [...prev, ...newPreviews] : newPreviews));

    if (onFileSelect) {
      onFileSelect(multiple ? validFiles : validFiles[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const removeImage = (index) => {
    const updated = [...previews];
    URL.revokeObjectURL(updated[index]);
    updated.splice(index, 1);
    setPreviews(updated);
    if (onFileSelect) {
      onFileSelect(multiple ? [] : null); // simplify reset for simplicity
    }
  };

  return (
    <div style={{ width: '100%' }}>
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        style={{
          border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border-color)'}`,
          borderRadius: 'var(--border-radius-sm)',
          padding: '24px',
          textAlign: 'center',
          background: dragActive ? 'var(--primary-glow)' : 'var(--glass-bg)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <Upload size={32} color={dragActive ? 'var(--primary)' : 'var(--text-muted)'} />
        <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-secondary)' }}>
          {label} (Drag & Drop or Click)
        </span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Supports JPEG, PNG, WebP (Max 5MB)
        </span>
      </div>

      {previews.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          {previews.map((preview, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
              }}
            >
              <img
                src={preview}
                alt="preview"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(index);
                }}
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  background: 'rgba(0, 0, 0, 0.6)',
                  color: 'white',
                  borderRadius: '50%',
                  padding: '2px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
