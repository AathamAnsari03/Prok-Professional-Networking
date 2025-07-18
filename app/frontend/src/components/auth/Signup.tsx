import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Signup: React.FC = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string; confirmPassword?: string; api?: string }>({});
  const [touched, setTouched] = useState<{ username?: boolean; email?: boolean; password?: boolean; confirmPassword?: boolean }>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const validate = () => {
    const errs: { username?: string; email?: string; password?: string; confirmPassword?: string } = {};
    if (!form.username) errs.username = 'Required';
    if (!form.email) errs.email = 'Required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Required';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear API error when user starts typing
    if (errors.api) {
      setErrors({ ...errors, api: undefined });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched({ ...touched, [e.target.name]: true });
    setErrors(validate());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    setTouched({ username: true, email: true, password: true, confirmPassword: true });
    
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      setErrors({});
      
      try {
        const success = await signup(form.username, form.email, form.password);
        
        if (success) {
          // Navigate to login page after successful signup
          navigate('/login');
        } else {
          setErrors({ api: 'Signup failed. Please try again.' });
        }
      } catch (err: any) {
        console.error('Signup error:', err);
        setErrors({ api: err.message || 'Network error. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-md bg-white/5 border border-white/10 relative"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
        <h2 className="text-3xl font-bold text-center text-white mb-8 drop-shadow-lg">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="relative">
            <input
              type="text"
              name="username"
              id="username"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-4 pt-6 pb-2 bg-black/60 text-white rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400
                ${errors.username && touched.username ? 'border-pink-500 ring-pink-500' : 'border-white/20'} shadow-[0_0_12px_0_rgba(0,255,255,0.15)]`}
              placeholder=" "
            />
            <label htmlFor="username" className="absolute left-4 top-2 text-cyan-300 text-sm pointer-events-none transition-all duration-200 origin-left
              ${form.username ? 'scale-90 -translate-y-2' : 'scale-100 translate-y-0'}">
              Username
            </label>
            {errors.username && touched.username && (
              <span className="text-pink-400 text-xs mt-1 block">{errors.username}</span>
            )}
          </div>
          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-4 pt-6 pb-2 bg-black/60 text-white rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400
                ${errors.email && touched.email ? 'border-pink-500 ring-pink-500' : 'border-white/20'} shadow-[0_0_12px_0_rgba(0,255,255,0.15)]`}
              placeholder=" "
            />
            <label htmlFor="email" className="absolute left-4 top-2 text-cyan-300 text-sm pointer-events-none transition-all duration-200 origin-left
              ${form.email ? 'scale-90 -translate-y-2' : 'scale-100 translate-y-0'}">
              Email
            </label>
            {errors.email && touched.email && (
              <span className="text-pink-400 text-xs mt-1 block">{errors.email}</span>
            )}
          </div>
          {/* Password */}
          <div className="relative">
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-4 pt-6 pb-2 bg-black/60 text-white rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400
                ${errors.password && touched.password ? 'border-pink-500 ring-pink-500' : 'border-white/20'} shadow-[0_0_12px_0_rgba(0,255,255,0.15)]`}
              placeholder=" "
            />
            <label htmlFor="password" className="absolute left-4 top-2 text-cyan-300 text-sm pointer-events-none transition-all duration-200 origin-left
              ${form.password ? 'scale-90 -translate-y-2' : 'scale-100 translate-y-0'}">
              Password
            </label>
            {errors.password && touched.password && (
              <span className="text-pink-400 text-xs mt-1 block">{errors.password}</span>
            )}
          </div>
          {/* Confirm Password */}
          <div className="relative">
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-4 pt-6 pb-2 bg-black/60 text-white rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400
                ${errors.confirmPassword && touched.confirmPassword ? 'border-pink-500 ring-pink-500' : 'border-white/20'} shadow-[0_0_12px_0_rgba(0,255,255,0.15)]`}
              placeholder=" "
            />
            <label htmlFor="confirmPassword" className="absolute left-4 top-2 text-cyan-300 text-sm pointer-events-none transition-all duration-200 origin-left
              ${form.confirmPassword ? 'scale-90 -translate-y-2' : 'scale-100 translate-y-0'}">
              Confirm Password
            </label>
            {errors.confirmPassword && touched.confirmPassword && (
              <span className="text-pink-400 text-xs mt-1 block">{errors.confirmPassword}</span>
            )}
          </div>
          {errors.api && <div className="text-pink-400 text-sm text-center mb-2">{errors.api}</div>}
          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-400">Already have an account? </span>
          <Link to="/login" className="text-cyan-400 hover:underline font-semibold">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup; 