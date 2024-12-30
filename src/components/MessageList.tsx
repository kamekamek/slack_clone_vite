import React from 'react';
import { Message } from '../types/message';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map((message) => (
        <div key={message.id} className="bg-white rounded-lg p-4 shadow">
          <div className="text-gray-700">{message.content}</div>
          <div className="text-xs text-gray-500 mt-2">
            {new Date(message.createdAt).toLocaleString()}
            {message.isEdited && <span className="ml-2">(編集済み)</span>}
          </div>
        </div>
      ))}
    </div>
  );
};