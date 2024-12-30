import React, { useState } from 'react';
import { Hash, Plus, LogOut, User, Lock, Star, Archive } from 'lucide-react';
import { CreateChannelModal } from './CreateChannelModal';

interface Channel {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isArchived?: boolean;
  isPrivate?: boolean;
  members?: string[];
  pinnedMessages?: string[];
  isFavorite?: boolean;
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
  onCreateChannel: (name: string, description: string, isPrivate: boolean) => void;
  onArchiveChannel: (channelId: string) => void;
  onToggleFavorite: (channelId: string) => void;
  user: User;
  onProfileClick: () => void;
  onLogout: () => void;
}

export function Sidebar({
  channels,
  currentChannel,
  onChannelSelect,
  onCreateChannel,
  onArchiveChannel,
  onToggleFavorite,
  user,
  onProfileClick,
  onLogout,
}: SidebarProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const favoriteChannels = channels.filter(c => c.isFavorite && !c.isArchived);
  const activeChannels = channels.filter(c => !c.isFavorite && !c.isArchived);
  const archivedChannels = channels.filter(c => c.isArchived);

  const renderChannelButton = (channel: Channel) => (
    <div key={channel.id} className="group relative">
      <button
        onClick={() => onChannelSelect(channel.id)}
        className={`w-full text-left px-4 py-1.5 rounded flex items-center space-x-2 hover:bg-gray-700/50 transition-colors ${
          currentChannel === channel.id ? 'bg-blue-600 text-white' : 'text-gray-300'
        }`}
      >
        {channel.isPrivate ? (
          <Lock className="w-4 h-4" />
        ) : (
          <Hash className="w-4 h-4" />
        )}
        <span>{channel.displayName}</span>
        {channel.description && (
          <span className="text-xs text-gray-400 truncate">
            {channel.description}
          </span>
        )}
      </button>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(channel.id);
          }}
          className="p-1 text-gray-400 hover:text-yellow-400 transition-colors"
          title={channel.isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
        >
          <Star className="w-4 h-4" fill={channel.isFavorite ? "currentColor" : "none"} />
        </button>
        {!channel.isArchived && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onArchiveChannel(channel.id);
            }}
            className="p-1 text-gray-400 hover:text-gray-200 transition-colors"
            title="アーカイブ"
          >
            <Archive className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-[#1a1d21] w-60 flex-shrink-0 h-screen p-3 flex flex-col">
      <div className="px-4 py-2">
        <h1 className="text-white font-bold text-xl">Slack Clone</h1>
      </div>
      
      <div className="mt-6 flex-1 overflow-y-auto">
        {favoriteChannels.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between px-4 mb-2">
              <span className="text-gray-400 text-sm font-medium">
                ⭐️ お気に入り
              </span>
            </div>
            <div className="space-y-1">
              {favoriteChannels.map(renderChannelButton)}
            </div>
          </div>
        )}

        <div className="mb-4">
          <div className="flex items-center justify-between px-4 mb-2">
            <span className="text-gray-400 text-sm font-medium">チャンネル</span>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-gray-400 hover:text-white transition-colors"
              title="チャンネルを作成"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1">
            {activeChannels.map(renderChannelButton)}
          </div>
        </div>

        <div>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="w-full text-left px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors text-sm flex items-center space-x-2"
          >
            <Archive className="w-4 h-4" />
            <span>アーカイブされたチャンネル</span>
          </button>
          {showArchived && (
            <div className="mt-2 space-y-1">
              {archivedChannels.map(renderChannelButton)}
            </div>
          )}
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