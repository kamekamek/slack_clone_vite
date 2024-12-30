import React, { useEffect, useRef, useState } from 'react';

interface MessageEdit {
  text: string;
  timestamp: Date;
}

interface Message {
  id: string;
  text: string;
  user: string;
  userId: string;
  timestamp: Date;
  channelId: string;
  isEdited?: boolean;
  isPinned?: boolean;
  mentions?: string[];
  editHistory?: Array<{
    text: string;
    editedAt: Date;
  }>;
  canEdit?: boolean;
  canDelete?: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentChannel: string;
  currentUser: { id: string; username: string };
  onEditMessage: (messageId: string, newText: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onTogglePin: (messageId: string) => void;
  onMention: (messageId: string, userId: string) => void;
  pinnedMessages: Message[];
}

export function MessageList({
  messages,
  currentChannel,
  currentUser,
  onEditMessage,
  onDeleteMessage,
  onTogglePin,
  onMention,
  pinnedMessages
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [showMentionList, setShowMentionList] = useState(false);
  const [mentionAnchorEl, setMentionAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleEditClick = (message: Message) => {
    setEditingMessageId(message.id);
    setEditText(message.text);
  };

  const handleSaveEdit = (messageId: string) => {
    onEditMessage(messageId, editText);
    setEditingMessageId(null);
  };

  const handleMentionClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setMentionAnchorEl(event.currentTarget);
    setShowMentionList(true);
  };

  const handleMentionSelect = (messageId: string, userId: string) => {
    onMention(messageId, userId);
    setShowMentionList(false);
    setMentionAnchorEl(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6">
      {pinnedMessages.length > 0 && (
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            📌 ピン留めされたメッセージ ({pinnedMessages.length})
          </h3>
          <div className="space-y-2">
            {pinnedMessages.map(message => (
              <div key={message.id} className="text-sm text-gray-600 flex items-center space-x-2">
                <span className="font-medium">{message.user}:</span>
                <span>{message.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold">#{currentChannel}</h2>
      </div>
      
      <div className="space-y-4">
        {messages.map(message => (
          <div key={message.id} className="group hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                {message.user[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{message.user}</span>
                    <span className="text-sm text-gray-500">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    {message.isEdited && (
                      <span className="text-xs text-gray-400">(編集済み)</span>
                    )}
                    {message.isPinned && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        📌 ピン留め
                      </span>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-2">
                    <button
                      onClick={() => onTogglePin(message.id)}
                      className="text-gray-500 hover:text-gray-700"
                      title={message.isPinned ? "ピン留めを解除" : "ピン留め"}
                    >
                      📌
                    </button>
                    <button
                      onClick={handleMentionClick}
                      className="text-gray-500 hover:text-gray-700"
                      title="メンション"
                    >
                      @
                    </button>
                    {message.canEdit && (
                      <button
                        onClick={() => handleEditClick(message)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        編集
                      </button>
                    )}
                    {message.canDelete && (
                      <button
                        onClick={() => onDeleteMessage(message.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        削除
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-1">
                  {editingMessageId === message.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingMessageId(null)}
                          className="px-3 py-1 text-gray-600 hover:text-gray-800"
                        >
                          キャンセル
                        </button>
                        <button
                          onClick={() => handleSaveEdit(message.id)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-900 whitespace-pre-wrap">{message.text}</p>
                  )}
                </div>
                {message.mentions && message.mentions.length > 0 && (
                  <div className="mt-1 flex items-center space-x-1">
                    <span className="text-xs text-gray-500">メンション:</span>
                    {message.mentions.map(userId => (
                      <span key={userId} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        @{userId}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div ref={messagesEndRef} />

      {showMentionList && mentionAnchorEl && (
        <div
          className="absolute bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50"
          style={{
            top: mentionAnchorEl.getBoundingClientRect().bottom + window.scrollY + 5,
            left: mentionAnchorEl.getBoundingClientRect().left + window.scrollX,
          }}
        >
          <div className="space-y-1">
            <button
              onClick={() => handleMentionSelect(editingMessageId!, currentUser.id)}
              className="w-full text-left px-3 py-1 hover:bg-gray-100 rounded"
            >
              @{currentUser.username}
            </button>
            <button
              onClick={() => handleMentionSelect(editingMessageId!, 'channel')}
              className="w-full text-left px-3 py-1 hover:bg-gray-100 rounded"
            >
              @channel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}