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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} />
      </div>
      <MessageInput onSendMessage={addMessage} />
    </div>
  );
}; 