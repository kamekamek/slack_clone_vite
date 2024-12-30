import React, { useState, useRef } from 'react';
import { X, Upload, Circle } from 'lucide-react';

interface UserProfileModalProps {
  onClose: () => void;
  profile: {
    username: string;
    avatarUrl: string | null;
    status: string;
    isOnline: boolean;
  };
  onUpdateProfile: (updates: {
    username?: string;
    status?: string;
  }) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
  onUpdateOnlineStatus: (isOnline: boolean) => Promise<void>;
}

export function UserProfileModal({
  onClose,
  profile,
  onUpdateProfile,
  onUploadAvatar,
  onUpdateOnlineStatus,
}: UserProfileModalProps) {
  const [username, setUsername] = useState(profile.username);
  const [status, setStatus] = useState(profile.status);
  const [isOnline, setIsOnline] = useState(profile.isOnline);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await onUpdateProfile({ username, status });
      await onUpdateOnlineStatus(isOnline);
      onClose();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await onUploadAvatar(file);
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-lg shadow-xl z-50 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">プロフィール設定</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center mb-6">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 cursor-pointer group"
              onClick={handleAvatarClick}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-500">
                  {username.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

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

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              ステータスメッセージ
            </label>
            <input
              type="text"
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="今の気分や状態を共有しましょう"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsOnline(!isOnline)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Circle
                className={`w-4 h-4 ${
                  isOnline ? 'text-green-500 fill-green-500' : 'text-gray-400'
                }`}
              />
              <span>{isOnline ? 'オンライン' : 'オフライン'}</span>
            </button>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
