import React from 'react';
import { useMessages } from '../hooks/useMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChannelProps {
  channelId: string;
}

export const Channel: React.FC<ChannelProps> = ({ channelId }) => {
  const { messages, addMessage } = useMessages(channelId);

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto min-h-0">
        <MessageList messages={messages} />
      </div>
      <div className="flex-shrink-0 w-full bg-white border-t border-gray-200">
        <MessageInput onSendMessage={addMessage} />
      </div>
    </div>
  );
}; 