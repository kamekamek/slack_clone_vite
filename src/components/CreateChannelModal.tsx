import React, { useState } from 'react';
import { X } from 'lucide-react';

interface CreateChannelModalProps {
  onClose: () => void;
  onCreateChannel: (name: string) => void;
}

export function CreateChannelModal({ onClose, onCreateChannel }: CreateChannelModalProps) {
  const [channelName, setChannelName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!channelName.trim()) {
      setError('チャンネル名を入力してください');
      return;
    }

    try {
      onCreateChannel(channelName);
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
          <h2 className="text-xl font-bold">チャンネルを作成</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="channelName" className="block text-sm font-medium text-gray-700 mb-1">
              チャンネル名
            </label>
            <input
              type="text"
              id="channelName"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例：プロジェクト更新"
            />
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>

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
              作成
            </button>
          </div>
        </form>
      </div>
    </>
  );
}