import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface MediaUploadProps {
  onMediaChange: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
}

const MediaUpload: React.FC<MediaUploadProps> = ({
  onMediaChange,
  maxFiles = 5,
  maxFileSize = 10, // 10MB
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const maxSize = maxFileSize * 1024 * 1024; // Convert MB to bytes

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    const newErrors: string[] = [];
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-too-large') {
          newErrors.push(`${file.name} is too large. Max size is ${maxFileSize}MB`);
        } else if (error.code === 'file-invalid-type') {
          newErrors.push(`${file.name} has an invalid file type`);
        } else if (error.code === 'too-many-files') {
          newErrors.push(`Too many files. Max is ${maxFiles}`);
        }
      });
    });

    setErrors(newErrors);

    // Add accepted files
    const updatedFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    setFiles(updatedFiles);
    onMediaChange(updatedFiles);
  }, [files, onMediaChange, maxFiles, maxFileSize]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': []
    },
    maxFiles,
    maxSize,
  });

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_: File, i: number) => i !== index);
    setFiles(updatedFiles);
    onMediaChange(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (file: File) => file.type.startsWith('image/');
  const isVideo = (file: File) => file.type.startsWith('video/');

  return (
    <div className="space-y-4 border-2 border-red-300 bg-red-50 p-4 rounded-lg">
      <h3 className="text-lg font-semibold text-red-800">Media Upload Section</h3>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="text-sm text-gray-600">
            {isDragActive ? (
              <p>Drop the files here...</p>
            ) : (
              <div>
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">
                  Images and videos up to {maxFileSize}MB (max {maxFiles} files)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="text-sm text-red-600">
            {errors.map((error, index) => (
              <div key={index} className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Selected Files ({files.length}/{maxFiles})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file: File, index: number) => (
              <div
                key={index}
                className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50"
              >
                {/* Preview */}
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {isImage(file) ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : isVideo(file) ? (
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    <div className="text-gray-400">
                      <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="p-2">
                  <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="Remove file"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUpload; 