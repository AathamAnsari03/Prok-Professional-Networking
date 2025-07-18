import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

interface LoginProps {
  onLogin: (user: any, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/login', { email, password });
      onLogin(res.data.user, res.data.token);
      toast.success('Logged in!');
    } catch (err) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass p-8 max-w-sm w-full mx-auto mt-20 flex flex-col gap-4">
      <h2 className="text-2xl font-bold mb-2">Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="p-2 rounded bg-glass text-white"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="p-2 rounded bg-glass text-white"
        required
      />
      <button
        type="submit"
        className="mt-4 px-6 py-2 bg-neonPurple text-white rounded-full shadow-neon font-bold transition hover:bg-neonBlue hover:text-black w-full flex items-center justify-center"
        disabled={loading}
      >
        {loading ? <span className="loader mr-2"></span> : 'Login'}
      </button>
    </form>
  );
};

export default Login; 