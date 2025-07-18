import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login: React.FC = () => {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; api?: string }>({});
  const [touched, setTouched] = useState<{ identifier?: boolean; password?: boolean }>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validate = () => {
    const errs: { identifier?: string; password?: string } = {};
    if (!form.identifier) errs.identifier = 'Required';
    if (!form.password) errs.password = 'Required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
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
    setTouched({ identifier: true, password: true });
    
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      setErrors({});
      
      try {
        const result = await login(form.identifier, form.password);
        if (result.success) {
          navigate('/profile');
        } else {
          setErrors({ api: result.message || 'Invalid credentials. Please try again.' });
        }
      } catch (err: any) {
        console.error('Login error:', err);
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
        <h2 className="text-3xl font-bold text-center text-white mb-8 drop-shadow-lg">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identifier (username/email) */}
          <div className="relative">
            <input
              type="text"
              name="identifier"
              id="identifier"
              autoComplete="username"
              value={form.identifier}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-4 pt-6 pb-2 bg-black/60 text-white rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400
                ${errors.identifier && touched.identifier ? 'border-pink-500 ring-pink-500' : 'border-white/20'} shadow-[0_0_12px_0_rgba(0,255,255,0.15)]`}
              placeholder=" "
            />
            <label htmlFor="identifier" className="absolute left-4 top-2 text-cyan-300 text-sm pointer-events-none transition-all duration-200 origin-left
              ${form.identifier ? 'scale-90 -translate-y-2' : 'scale-100 translate-y-0'}">
              Username or Email
            </label>
            {errors.identifier && touched.identifier && (
              <span className="text-pink-400 text-xs mt-1 block">{errors.identifier}</span>
            )}
          </div>
          {/* Password */}
          <div className="relative">
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="current-password"
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
          {errors.api && <div className="text-pink-400 text-sm text-center mb-2">{errors.api}</div>}
          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div className="text-center">
            <Link to="/forgot-password" className="text-cyan-400 hover:underline text-sm">
              Forgot your password?
            </Link>
          </div>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-400">Don't have an account? </span>
          <Link to="/signup" className="text-cyan-400 hover:underline font-semibold">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 