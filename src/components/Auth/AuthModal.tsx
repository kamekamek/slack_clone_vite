import React, { useState } from 'react';
import { X } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (email: string, password: string, username: string) => Promise<void>;
  onGuestLogin: () => void;
  onResetPassword: (email: string) => Promise<void>;
}

type AuthMode = 'login' | 'register' | 'reset';

export function AuthModal({
  onClose,
  onLogin,
  onRegister,
  onGuestLogin,
  onResetPassword,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      switch (mode) {
        case 'login':
          await onLogin(email, password);
          break;
        case 'register':
          await onRegister(email, password, username);
          break;
        case 'reset':
          await onResetPassword(email);
          setMode('login');
          break;
      }
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {mode === 'login'
              ? 'ログイン'
              : mode === 'register'
              ? 'アカウント作成'
              : 'パスワードリセット'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {mode !== 'reset' && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                パスワード
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                ユーザー名
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          )}

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex flex-col space-y-2">
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {mode === 'login'
                ? 'ログイン'
                : mode === 'register'
                ? 'アカウント作成'
                : 'パスワードリセット'}
            </button>

            {mode === 'login' && (
              <button
                type="button"
                onClick={onGuestLogin}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                ゲストとして参加
              </button>
            )}
          </div>

          <div className="text-center text-sm">
            {mode === 'login' ? (
              <>
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-blue-600 hover:underline"
                >
                  アカウントを作成
                </button>
                <span className="mx-2">|</span>
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-blue-600 hover:underline"
                >
                  パスワードを忘れた場合
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-blue-600 hover:underline"
              >
                ログインに戻る
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
