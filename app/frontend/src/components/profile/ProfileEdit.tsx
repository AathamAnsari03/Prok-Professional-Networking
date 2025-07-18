import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { profileApi } from './api';
import { FaUserEdit, FaUpload } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import type { Profile } from '../../types';

const defaultProfile: Profile = {
  id: 0,
  user_id: 0,
  avatar: '',
  banner: '',
  name: '',
  title: '',
  bio: '',
  location: '',
  address: '',
  skills: [],
  socials: {},
  experiences: [],
  education: [],
};

const ProfileEdit = () => {
  const { profile, updateProfile, refreshProfile, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Profile>({
    ...defaultProfile,
    ...profile,
    name: profile?.name || '',
    title: profile?.title || '',
    bio: profile?.bio || '',
    location: profile?.location || '',
    address: profile?.address || '',
    avatar: profile?.avatar || '',
    banner: profile?.banner || '',
    skills: profile?.skills || [],
    socials: { 
      linkedin: profile?.socials?.linkedin || '',
      github: profile?.socials?.github || '',
      phone: profile?.socials?.phone || '',
      email: profile?.socials?.email || '',
      ...defaultProfile.socials, 
      ...(profile?.socials || {}) 
    },
    experiences: profile?.experiences || [],
    education: profile?.education || [],
  });
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle'|'success'|'error'>('idle');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatar || null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Remove 'banner' and 'bannerPreview' state and all related handlers (handleBannerChange, handleBannerDrop, etc.)
  // 2. Remove 'banner' from defaultProfile and form state.
  // 3. Remove all banner upload UI and references in the JSX.
  // 4. Ensure handleSubmit and updateProfile only send valid fields (no banner).

  useEffect(() => {
    if (profile) {
      setForm({
        ...defaultProfile,
        ...profile,
        name: profile.name || '',
        title: profile.title || '',
        bio: profile.bio || '',
        location: profile.location || '',
        address: profile.address || '',
        avatar: profile.avatar || '',
        banner: profile.banner || '',
        skills: profile.skills || [],
        socials: { 
          linkedin: profile.socials?.linkedin || '',
          github: profile.socials?.github || '',
          phone: profile.socials?.phone || '',
          email: profile.socials?.email || '',
          ...defaultProfile.socials, 
          ...(profile.socials || {}) 
        },
        experiences: profile.experiences || [],
        education: profile.education || [],
      });
      setAvatarPreview(profile.avatar || null);
    }
  }, [profile]);

  // Real-time validation
  const validate = (field: string, value: string) => {
    let err = '';
    if (field === 'title' && !value.trim()) err = 'Title is required.';
    if (field === 'skills' && !value.trim()) err = 'At least one skill required.';
    setErrors((prev: any) => ({ ...prev, [field]: err }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: Profile) => ({ ...prev, [name]: value }));
    setTouched((prev: any) => ({ ...prev, [name]: true }));
    validate(name, value);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file)); // Preview
      if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
        setError('Only JPG/PNG images allowed.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Max file size is 5MB.');
        return;
      }
      setUploadProgress(10);
      try {
        const res = await profileApi.uploadAvatar(file, token!);
        if (res.success && res.url) {
          setAvatarPreview(res.url);
          setForm((prev: Profile) => ({ ...prev, avatar: res.url }));
          setUploadProgress(100);
        } else {
          setError(res.message || 'Upload failed.');
          setUploadProgress(0);
        }
      } catch (err) {
        setError('Upload failed.');
        setUploadProgress(0);
      }
    }
  };

  // Dropzone for image upload
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Only JPG/PNG images allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Max file size is 5MB.');
      return;
    }
    setUploadProgress(10);
    try {
      const res = await profileApi.uploadAvatar(file, token!);
      if (res.success && res.url) {
        setAvatarPreview(res.url);
        setForm((prev: Profile) => ({ ...prev, avatar: res.url }));
        setUploadProgress(100);
      } else {
        setError(res.message || 'Upload failed.');
        setUploadProgress(0);
      }
    } catch (err) {
      setError('Upload failed.');
      setUploadProgress(0);
    }
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/jpeg': [], 'image/png': [] } });

  // Dynamic fields for experience/education
  const addExperience = () => setForm((prev: Profile) => ({ ...prev, experiences: [...(prev.experiences || []), { title: '', company: '', start_date: '', end_date: '', description: '' }] }));
  const removeExperience = (idx: number) => setForm((prev: Profile) => ({ ...prev, experiences: prev.experiences.filter((_: any, i: number) => i !== idx) }));
  const updateExperience = (idx: number, field: string, value: string) => setForm((prev: Profile) => ({ ...prev, experiences: prev.experiences.map((exp: any, i: number) => i === idx ? { ...exp, [field]: value } : exp) }));

  const addEducation = () => setForm((prev: Profile) => ({ ...prev, education: [...(prev.education || []), { school: '', degree: '', field: '', start_date: '', end_date: '' }] }));
  const removeEducation = (idx: number) => setForm((prev: Profile) => ({ ...prev, education: prev.education.filter((_: any, i: number) => i !== idx) }));
  const updateEducation = (idx: number, field: string, value: string) => setForm((prev: Profile) => ({ ...prev, education: prev.education.map((edu: any, i: number) => i === idx ? { ...edu, [field]: value } : edu) }));

  // Multi-tag input for skills
  const [skillInput, setSkillInput] = useState('');
  const addSkill = () => {
    if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
      setForm((prev) => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      setSkillInput('');
    }
  };
  const removeSkill = (idx: number) => setForm((prev: Profile) => ({ ...prev, skills: prev.skills.filter((_: any, i: number) => i !== idx) }));

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev: Profile) => ({ ...prev, socials: { ...prev.socials, [name]: value } }));
  };

  // Enhanced validation for all required fields
  const validateAll = () => {
    const errs: any = {};
    if (!form.name || !form.name.trim()) errs.name = 'Name is required.';
    if (!form.title || !form.title.trim()) errs.title = 'Title is required.';
    if (!form.skills || !form.skills.length) errs.skills = 'At least one skill is required.';
    if (!form.address || !form.address.trim()) errs.address = 'Address is required.';
    return errs;
  };
  const isFormValid = () => {
    const errs = validateAll();
    return Object.keys(errs).length === 0;
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus('idle');
    setError('');
    const errs = validateAll();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setSubmitStatus('error');
      setSubmitting(false);
      return;
    }
    try {
      const payload = {
        ...form,
        name: form.name || '',
        title: form.title || '',
        bio: form.bio || '',
        location: form.location || '',
        address: form.address || '',
        avatar: form.avatar || '',
        skills: Array.isArray(form.skills) ? form.skills : (typeof form.skills === 'string' ? form.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        socials: typeof form.socials === 'object' && form.socials !== null ? form.socials : {},
        experiences: Array.isArray(form.experiences) ? form.experiences : [],
        education: Array.isArray(form.education) ? form.education : [],
      };
      const res = await updateProfile(payload);
      if (res.success) {
        setSubmitStatus('success');
        toast.success('Profile updated!');
        await refreshProfile();
        setTimeout(() => { navigate('/profile'); }, 1000);
      } else {
        setSubmitStatus('error');
        if ('errors' in res && res.errors) setErrors(res.errors);
        setError(res.message || 'Update failed.');
        toast.error(res.message || 'Update failed.');
      }
    } catch (err) {
      setSubmitStatus('error');
      setError('Update failed.');
      toast.error('Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to get full backend URL for images
  const backendUrl = "http://localhost:5000";
  const getImageUrl = (url: string | null | undefined) => {
    if (!url) return '';
    return url.startsWith('http') ? url : backendUrl + url;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white/10 rounded-2xl shadow-2xl p-8 border border-white/20 relative overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white"><FaUserEdit className="text-cyan-400" /> Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Show all backend errors at the top */}
          {submitStatus === 'error' && errors && typeof errors === 'object' && Object.keys(errors).length > 0 && (
            <div className="mb-4 p-3 bg-pink-500/10 border border-pink-400/30 rounded-lg text-pink-400 text-center">
              {Object.entries(errors).map(([field, msg]) => (
                <div key={field}>{field}: {msg}</div>
              ))}
            </div>
          )}
          {/* Avatar Upload */}
          <div {...getRootProps()} className={`mb-4 flex items-center gap-6 cursor-pointer group ${isDragActive ? 'ring-2 ring-cyan-400' : ''}`}>
            <div
              className="w-28 h-28 rounded-full border-4 border-cyan-400/30 shadow-lg bg-gradient-to-tr from-cyan-200 to-blue-200 flex items-center justify-center relative overflow-hidden"
              onClick={() => fileInputRef.current?.click()}
              title="Click or drag to upload"
            >
              {avatarPreview ? (
                <img src={getImageUrl(avatarPreview)} alt="avatar preview" className="w-full h-full object-cover" />
              ) : (
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=User`} alt="avatar" className="w-full h-full object-cover" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleAvatarChange}
              />
              <div className="absolute bottom-0 left-0 w-full bg-black/70 text-cyan-400 text-xs py-1 flex items-center justify-center gap-1"><FaUpload /> Upload</div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute top-0 left-0 w-full h-full bg-black/60 flex items-center justify-center text-cyan-400 text-xs">Uploading... {uploadProgress}%</div>
              )}
            </div>
          </div>
          {/* Full Name, Title, Location, Bio */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1 text-white">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                placeholder="Your name"
              />
              {errors.name && <div className="text-pink-400 text-xs mt-1">{errors.name}</div>}
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-semibold mb-1 text-white">Title *</label>
              <input
                id="title"
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                onBlur={() => setTouched((prev: any) => ({ ...prev, title: true }))}
                maxLength={100}
                className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white ${errors.title && touched.title ? 'border-pink-500' : 'border-white/20'}`}
                placeholder="Your title"
              />
              {errors.title && touched.title && <div className="text-pink-400 text-xs mt-1">{errors.title}</div>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-white">Location</label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                placeholder="City, Country"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold mb-1 text-white">Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white min-h-[60px]"
                placeholder="Tell us about yourself"
              />
            </div>
          </div>
          {/* Skills (multi-tag) */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1 text-white">Skills *</label>
            <input
              type="text"
              name="skills"
              value={Array.isArray(form.skills) ? form.skills.join(', ') : ''}
              onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean) }))}
              onBlur={() => setTouched((prev: any) => ({ ...prev, skills: true }))}
              className={`w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white ${errors.skills && touched.skills ? 'border-pink-500' : 'border-white/20'}`}
              placeholder="Comma separated (e.g. React, Node.js)"
            />
            {errors.skills && touched.skills && <div className="text-pink-400 text-xs mt-1">{errors.skills}</div>}
          </div>
          {/* Work Experience (dynamic) */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1 text-white">Work Experience</label>
            {form.experiences.map((exp: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 mb-2">
                <input
                  type="text"
                  name={`experiences.${idx}.title`}
                  value={exp.title}
                  onChange={(e) => updateExperience(idx, 'title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                  placeholder="Title"
                />
                <input
                  type="text"
                  name={`experiences.${idx}.company`}
                  value={exp.company}
                  onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                  placeholder="Company"
                />
                <input
                  type="text"
                  name={`experiences.${idx}.start_date`}
                  value={exp.start_date}
                  onChange={(e) => updateExperience(idx, 'start_date', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                  placeholder="Start Date"
                />
                <input
                  type="text"
                  name={`experiences.${idx}.end_date`}
                  value={exp.end_date}
                  onChange={(e) => updateExperience(idx, 'end_date', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                  placeholder="End Date"
                />
                <textarea
                  name={`experiences.${idx}.description`}
                  value={exp.description}
                  onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white min-h-[60px]"
                  placeholder="Description"
                />
                <button type="button" onClick={() => removeExperience(idx)} className="text-red-400">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addExperience} className="text-cyan-400">Add Experience</button>
          </div>
          {/* Education (dynamic) */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1 text-white">Education</label>
            {form.education.map((edu: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4 mb-2">
                <input
                  type="text"
                  name={`education.${idx}.school`}
                  value={edu.school}
                  onChange={(e) => updateEducation(idx, 'school', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                  placeholder="School"
                />
                <input
                  type="text"
                  name={`education.${idx}.degree`}
                  value={edu.degree}
                  onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                  placeholder="Degree"
                />
                <input
                  type="text"
                  name={`education.${idx}.field`}
                  value={edu.field}
                  onChange={(e) => updateEducation(idx, 'field', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                  placeholder="Field of Study"
                />
                <input
                  type="text"
                  name={`education.${idx}.start_date`}
                  value={edu.start_date}
                  onChange={(e) => updateEducation(idx, 'start_date', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                  placeholder="Start Date"
                />
                <input
                  type="text"
                  name={`education.${idx}.end_date`}
                  value={edu.end_date}
                  onChange={(e) => updateEducation(idx, 'end_date', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                  placeholder="End Date"
                />
                <button type="button" onClick={() => removeEducation(idx)} className="text-red-400">Remove</button>
              </div>
            ))}
            <button type="button" onClick={addEducation} className="text-cyan-400">Add Education</button>
          </div>
          {/* Address Field (replaces Contact) */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="address" className="block text-sm font-semibold mb-1 text-white">Address</label>
              <input
                id="address"
                name="address"
                type="text"
                value={form.address}
                onChange={handleChange}
                onBlur={() => setTouched((prev: any) => ({ ...prev, address: true }))}
                placeholder="Enter your address"
                className={`w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white ${errors.address && touched.address ? 'border-pink-500' : 'border-white/20'}`}
              />
              {errors.address && touched.address && <div className="text-pink-400 text-xs mt-1">{errors.address}</div>}
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-white">LinkedIn</label>
              <input
                type="text"
                name="linkedin"
                value={form.socials?.linkedin || ''}
                onChange={handleSocialChange}
                className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                placeholder="LinkedIn URL"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-white">GitHub</label>
              <input
                type="text"
                name="github"
                value={form.socials?.github || ''}
                onChange={handleSocialChange}
                className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                placeholder="GitHub URL"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-white">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.socials?.phone || ''}
                onChange={handleSocialChange}
                className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                placeholder="Phone number"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1 text-white">Email</label>
              <input
                type="text"
                name="email"
                value={form.socials?.email || ''}
                onChange={handleSocialChange}
                className="w-full px-3 py-2 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 bg-black/60 text-white"
                placeholder="Email"
              />
            </div>
          </div>
          {/* Submit Status & Button */}
          {submitStatus === 'success' && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg text-green-400 text-center">
              Profile updated successfully!
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mb-4 p-3 bg-pink-500/20 border border-pink-400/30 rounded-lg text-pink-400 text-center">
              Please fix the errors above. {error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting || !isFormValid()}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit; 