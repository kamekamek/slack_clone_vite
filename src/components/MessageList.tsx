import React, { useEffect, useRef } from 'react';

interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  currentChannel: string;
}

export function MessageList({ messages, currentChannel }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getCurrentChannel = () => {
    return currentChannel;
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
              <div className="flex items-baseline">
                <span className="font-medium">{message.user}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1 text-gray-900">{message.text}</p>
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}