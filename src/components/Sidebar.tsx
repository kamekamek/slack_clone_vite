import React, { useState } from 'react';
import { Hash, Plus, LogOut, User } from 'lucide-react';
import { CreateChannelModal } from './CreateChannelModal';

interface Channel {
  id: string;
  name: string;
  displayName: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  isGuest: boolean;
}

interface SidebarProps {
  channels: Channel[];
  currentChannel: string;
  onChannelSelect: (channelId: string) => void;
  onCreateChannel: (name: string) => void;
  user: User;
  onProfileClick: () => void;
  onLogout: () => void;
}

export function Sidebar({
  channels,
  currentChannel,
  onChannelSelect,
  onCreateChannel,
  user,
  onProfileClick,
  onLogout,
}: SidebarProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="bg-[#1a1d21] w-60 flex-shrink-0 h-screen p-3 flex flex-col">
      <div className="px-4 py-2">
        <h1 className="text-white font-bold text-xl">Slack Clone</h1>
      </div>
      
      <div className="mt-6 flex-1">
        <div className="flex items-center justify-between px-4 mb-2">
          <span className="text-gray-400 text-sm font-medium">Channels</span>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-gray-400 hover:text-white transition-colors"
            title="Create Channel"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1">
          {channels.map(channel => (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel.id)}
              className={`w-full text-left px-4 py-1.5 rounded flex items-center space-x-2 hover:bg-gray-700/50 transition-colors ${
                currentChannel === channel.id ? 'bg-blue-600 text-white' : 'text-gray-300'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span>{channel.displayName}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-700">
        <div className="px-4 py-2 space-y-2">
          <button
            onClick={onProfileClick}
            className="w-full text-left px-3 py-2 rounded flex items-center space-x-2 text-gray-300 hover:bg-gray-700/50 transition-colors"
          >
            <User className="w-4 h-4" />
            <span>{user.username}</span>
            {user.isGuest && (
              <span className="ml-auto text-xs bg-gray-700 px-2 py-0.5 rounded">
                ゲスト
              </span>
            )}
          </button>
          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2 rounded flex items-center space-x-2 text-gray-300 hover:bg-gray-700/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>ログアウト</span>
          </button>
        </div>
      </div>

      {showCreateModal && (
        <CreateChannelModal
          onClose={() => setShowCreateModal(false)}
          onCreateChannel={onCreateChannel}
        />
      )}
    </div>
  );
}