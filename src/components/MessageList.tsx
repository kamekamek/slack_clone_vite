import React, { useEffect, useRef, useState } from 'react';

interface MessageEdit {
  text: string;
  timestamp: Date;
}

interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: Date;
  editHistory: MessageEdit[];
  lastEditedAt?: Date;
  canEdit: boolean;
  canDelete: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentChannel: string;
  onEditMessage: (messageId: string, newText: string) => void;
  onDeleteMessage: (messageId: string) => void;
}

export function MessageList({ messages, currentChannel, onEditMessage, onDeleteMessage }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showHistory, setShowHistory] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getCurrentChannel = () => {
    return currentChannel;
  };

  const handleEditClick = (message: Message) => {
    setEditingMessageId(message.id);
    setEditText(message.text);
  };

  const handleSaveEdit = (messageId: string) => {
    onEditMessage(messageId, editText);
    setEditingMessageId(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h2 className="text-2xl font-bold">#{getCurrentChannel()}</h2>
      </div>
      
      {messages.map(message => (
        <div key={message.id} className="group hover:bg-gray-50 p-2 rounded-lg transition-colors">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
              {message.user[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="font-medium">{message.user}</span>
                  <span className="ml-2 text-sm text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                  {message.lastEditedAt && (
                    <span className="ml-2 text-xs text-gray-400">(edited)</span>
                  )}
                </div>
                {(message.canEdit || message.canDelete) && (
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {message.canEdit && (
                      <button onClick={() => handleEditClick(message)} className="text-gray-500 hover:text-gray-700 mr-2">
                        Edit
                      </button>
                    )}
                    {message.canDelete && (
                      <button onClick={() => onDeleteMessage(message.id)} className="text-red-500 hover:text-red-700">
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
              {editingMessageId === message.id ? (
                <div className="mt-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <div className="mt-2">
                    <button onClick={() => handleSaveEdit(message.id)} className="text-green-500 hover:text-green-700 mr-2">
                      Save
                    </button>
                    <button onClick={() => setEditingMessageId(null)} className="text-gray-500 hover:text-gray-700">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-gray-900">{message.text}</p>
              )}
              {message.editHistory?.length > 0 && (
                <div className="mt-1">
                  <button
                    onClick={() => setShowHistory(showHistory === message.id ? null : message.id)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    {showHistory === message.id ? 'Hide history' : 'Show edit history'}
                  </button>
                  {showHistory === message.id && (
                    <div className="mt-2 text-sm text-gray-500">
                      {message.editHistory?.map((edit, index) => (
                        <div key={index} className="mt-1">
                          <span>{edit.text}</span>
                          <span className="ml-2 text-xs">
                            {new Date(edit.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}