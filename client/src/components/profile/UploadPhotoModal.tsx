import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface UploadPhotoModalProps {
  onClose: () => void;
  onUploaded: (url: string) => void;
}

const UploadPhotoModal: React.FC<UploadPhotoModalProps> = ({ onClose, onUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await axios.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onUploaded(res.data.url);
      toast.success('Photo uploaded!');
      onClose();
    } catch (err) {
      toast.error('Failed to upload photo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="glass p-8 max-w-md w-full relative">
        <button
          className="absolute top-2 right-2 text-neonBlue font-bold text-xl"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4">Upload Profile Photo</h2>
        <input type="file" accept="image/*" onChange={handleFile} className="mb-4" />
        {preview && <img src={preview} alt="Preview" className="w-32 h-32 rounded-full mx-auto mb-4" />}
        <button
          className="mt-2 px-6 py-2 bg-neonPurple text-white rounded-full shadow-neon font-bold transition hover:bg-neonBlue hover:text-black w-full flex items-center justify-center"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? <span className="loader mr-2"></span> : 'Upload'}
        </button>
      </div>
    </div>
  );
};

export default UploadPhotoModal; 