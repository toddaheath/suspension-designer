import { useState, useMemo } from 'react';
import { useAuthStore } from '../../stores/authStore';

function getPasswordStrength(pw: string): { score: number; label: string; color: string; hints: string[] } {
  const hints: string[] = [];
  if (pw.length < 8) hints.push('At least 8 characters');
  if (!/[A-Z]/.test(pw)) hints.push('One uppercase letter');
  if (!/[a-z]/.test(pw)) hints.push('One lowercase letter');
  if (!/[0-9]/.test(pw)) hints.push('One number');
  const score = 4 - hints.length;
  if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500', hints };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-yellow-500', hints };
  if (score <= 3) return { score, label: 'Good', color: 'bg-blue-500', hints };
  return { score, label: 'Strong', color: 'bg-green-500', hints };
}

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strength.score < 4) return;
    register({ name, email, password });
  };

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 bg-gray-800 rounded-lg border border-gray-700">
      <h2 className="text-lg font-semibold text-gray-200 mb-4">Register</h2>
      {error && (
        <div className="mb-3 p-2 bg-red-900/50 border border-red-700 rounded text-xs text-red-300">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="register-name" className="block text-xs text-gray-400 mb-1">Name</label>
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="register-email" className="block text-xs text-gray-400 mb-1">Email</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="register-password" className="block text-xs text-gray-400 mb-1">Password</label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:outline-none"
          />
          {password && (
            <div className="mt-1.5">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-gray-700 rounded overflow-hidden">
                  <div
                    className={`h-full ${strength.color} transition-all`}
                    style={{ width: `${(strength.score / 4) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-400">{strength.label}</span>
              </div>
              {strength.hints.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {strength.hints.map((h) => (
                    <li key={h} className="text-[10px] text-gray-500">{h}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || strength.score < 4}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded py-2 text-sm font-medium"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-xs text-gray-500 text-center">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-blue-400 hover:underline">
          Login
        </button>
      </p>
    </div>
  );
}
