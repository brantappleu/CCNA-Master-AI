import React, { useState } from 'react';
import { AUTH_CREDENTIALS } from '../constants';
import { Lock, Server, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === AUTH_CREDENTIALS.username && password === AUTH_CREDENTIALS.password) {
      onLogin();
    } else {
      setError('Invalid credentials. Hint: admin / Bing123456');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
        
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Server className="text-blue-600 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">CCNA Master AI</h1>
          <p className="text-slate-500 mt-2">Secure Learning Environment</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
              <ShieldCheck className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
              <Lock className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200"
          >
            Access Terminal
          </button>
        </form>
        
        <div className="mt-6 text-center text-xs text-slate-400">
          Deployed for Canada Region • Secure Access Only
        </div>
      </div>
    </div>
  );
};

export default Login;