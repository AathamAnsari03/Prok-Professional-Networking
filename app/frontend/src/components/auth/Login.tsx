import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setFeedback(null);
  };

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!form.email) newErrors.email = 'Username or Email is required.';
    if (!form.password) newErrors.password = 'Password is required.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setFeedback(null);
    
    try {
      await login({
        username: form.email, // allow login with either username or email
        password: form.password,
      });
      
      setFeedback('Login successful! Redirecting...');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err: any) {
      setFeedback(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-2">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">Login</h2>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Username or Email</label>
            <input
              id="email"
              name="email"
              type="text"
              autoComplete="username"
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
              autoComplete="current-password"
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-400' : 'border-gray-300'}`}
              value={form.password}
              onChange={handleChange}
              disabled={loading}
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded transition-colors mt-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {feedback && <div className={`mt-4 text-center text-sm ${feedback.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{feedback}</div>}
        <div className="text-center mt-4 text-sm">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">Signup</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 