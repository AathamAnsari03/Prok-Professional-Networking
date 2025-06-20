import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const Signup: React.FC = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm_password: '' });
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string; confirm_password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setFeedback(null);
  };

  const validate = () => {
    const newErrors: { username?: string; email?: string; password?: string; confirm_password?: string } = {};
    if (!form.username) newErrors.username = 'Username is required.';
    if (!form.email) newErrors.email = 'Email is required.';
    if (!form.password) newErrors.password = 'Password must be at least 8 characters.';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (!form.confirm_password) newErrors.confirm_password = 'Please confirm your password.';
    else if (form.password !== form.confirm_password) newErrors.confirm_password = 'Passwords do not match.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setFeedback(null);
    
    try {
      await api.signup({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      
      setFeedback('Signup successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (error: any) {
      setFeedback(error.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-2">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Signup</h2>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.username ? 'border-red-400' : 'border-gray-300'}`}
              value={form.username}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-400' : 'border-gray-300'}`}
              value={form.email}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
          <div>
            <label htmlFor="confirm_password" className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              id="confirm_password"
              name="confirm_password"
              type="password"
              autoComplete="new-password"
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.confirm_password ? 'border-red-400' : 'border-gray-300'}`}
              value={form.confirm_password}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded transition-colors mt-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Signup'}
          </button>
        </form>
        {feedback && <div className={`mt-4 text-center text-sm ${feedback.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{feedback}</div>}
        <div className="text-center mt-4 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup; 