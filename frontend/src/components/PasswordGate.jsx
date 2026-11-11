import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

// Pre-set static verification password (change this value before deploying)
export const ACCESS_PASSWORD = 'generalstore@khushi';

export default function PasswordGate({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please enter the password');
      return;
    }
    if (password !== ACCESS_PASSWORD) {
      setError('Incorrect password. Please try again.');
      return;
    }
    setError('');
    onUnlock();
  };

  return (
    <div className="h-app w-full bg-[#f0f2f5] flex items-center justify-center px-4 overflow-y-auto">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-slide-up">
        <div className="bg-[#075e54] text-white px-6 py-6 text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/15 flex items-center justify-center">
            <Lock size={26} className="text-white" />
          </div>
          <h1 className="text-lg font-semibold tracking-wide">Khushi General Store</h1>
          <p className="text-xs text-white/75 mt-1">Enter password</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="store-access-password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="store-access-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter access password"
                autoComplete="off"
                autoFocus
                className="w-full bg-gray-50 border border-gray-300 rounded-xl pl-4 pr-11 py-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#075e54] focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#25D366] hover:bg-[#20b558] text-white rounded-xl font-semibold text-sm transition-colors active:scale-95"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

