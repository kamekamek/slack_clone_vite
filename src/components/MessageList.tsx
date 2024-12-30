import React, { useEffect, useRef } from 'react';
import { Message } from '../types/message';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map((message) => (
        <div key={message.id} className="group hover:bg-gray-50 rounded-lg transition-colors">
          <div className="p-4">
            <div className="flex items-baseline gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                {message.content?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-500">
                    {new Date(message.createdAt).toLocaleString()}
                  </span>
                  {message.isEdited && (
                    <span className="text-xs text-gray-400">(編集済み)</span>
                  )}
                </div>
                <div className="mt-1 text-gray-900">{message.content}</div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};