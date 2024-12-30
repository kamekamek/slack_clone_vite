import { useState } from 'react';

interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: Date;
  channelId: string;
}

interface Channel {
  id: string;
  name: string;
  displayName: string;
}

export function useSlackClone() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Welcome to the channel! 👋',
      user: 'System',
      timestamp: new Date(),
      channelId: 'general'
    }
  ]);
  
  const [channels, setChannels] = useState<Channel[]>([
    { id: 'general', name: 'general', displayName: 'general' },
    { id: 'random', name: 'random', displayName: 'random' },
    { id: 'help', name: 'help', displayName: 'help' }
  ]);
  
  const [currentChannel, setCurrentChannel] = useState<string>('general');

  const sendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      user: 'You',
      timestamp: new Date(),
      channelId: currentChannel
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const validateChannelName = (name: string): boolean => {
    if (name.length < 2 || name.length > 80) {
      throw new Error('チャンネル名は2文字以上80文字以下にしてください');
    }
    if (channels.some(channel => channel.displayName.toLowerCase() === name.toLowerCase())) {
      throw new Error('このチャンネル名は既に使用されています');
    }
    return true;
  };

  const createChannel = (displayName: string) => {
    validateChannelName(displayName);
    
    const id = Date.now().toString();
    const newChannel: Channel = {
      id,
      name: displayName,
      displayName
    };
    
    setChannels(prev => [...prev, newChannel]);
    return newChannel;
  };

  const filteredMessages = messages.filter(msg => msg.channelId === currentChannel);

  return {
    messages: filteredMessages,
    channels,
    currentChannel,
    setCurrentChannel,
    sendMessage,
    createChannel
  };
}