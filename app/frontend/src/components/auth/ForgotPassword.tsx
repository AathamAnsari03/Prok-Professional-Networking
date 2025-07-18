import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from './api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string; api?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean }>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const errs: { email?: string } = {};
    if (!email) errs.email = 'Required';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = 'Invalid email';
    return errs;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
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
    setTouched({ email: true });
    
    if (Object.keys(errs).length === 0) {
      setLoading(true);
      setErrors({});
      
      try {
        const response = await authApi.forgotPassword(email);
        
        if (response.success) {
          setSuccess(true);
        } else {
          setErrors({ api: response.message || 'Failed to send reset email' });
        }
      } catch (err: any) {
        console.error('Forgot password error:', err);
        setErrors({ api: err.message || 'Network error. Please try again.' });
      } finally {
        setLoading(false);
      }
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-md bg-white/5 border border-white/10 relative"
          style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 drop-shadow-lg">Check Your Email</h2>
            <p className="text-gray-300 mb-6">
              We've sent a password reset link to <span className="text-cyan-400 font-semibold">{email}</span>
            </p>
            <p className="text-gray-400 text-sm mb-8">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                  setErrors({});
                  setTouched({});
                }}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
              >
                Send Another Email
              </button>
              <Link
                to="/login"
                className="block w-full py-3 rounded-lg border-2 border-white/20 text-white font-bold text-lg hover:border-cyan-400 hover:text-cyan-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-md bg-white/5 border border-white/10 relative"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}>
        <h2 className="text-3xl font-bold text-center text-white mb-2 drop-shadow-lg">Forgot Password</h2>
        <p className="text-gray-400 text-center mb-8">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div className="relative">
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="email"
              value={email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`block w-full px-4 pt-6 pb-2 bg-black/60 text-white rounded-lg border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400
                ${errors.email && touched.email ? 'border-pink-500 ring-pink-500' : 'border-white/20'} shadow-[0_0_12px_0_rgba(0,255,255,0.15)]`}
              placeholder=" "
            />
            <label htmlFor="email" className="absolute left-4 top-2 text-cyan-300 text-sm pointer-events-none transition-all duration-200 origin-left
              ${email ? 'scale-90 -translate-y-2' : 'scale-100 translate-y-0'}">
              Email Address
            </label>
            {errors.email && touched.email && (
              <span className="text-pink-400 text-xs mt-1 block">{errors.email}</span>
            )}
          </div>
          {errors.api && <div className="text-pink-400 text-sm text-center mb-2">{errors.api}</div>}
          <button
            type="submit"
            className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg shadow-lg hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <span className="text-gray-400">Remember your password? </span>
          <Link to="/login" className="text-cyan-400 hover:underline font-semibold">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 