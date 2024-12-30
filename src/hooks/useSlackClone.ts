import { useState, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  user: string;
  timestamp: Date;
  channelId: string;
  isEdited?: boolean;
  editHistory?: Array<{
    text: string;
    editedAt: Date;
  }>;
}

interface Channel {
  id: string;
  name: string;
  displayName: string;
}

export function useSlackClone() {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('slack-clone-messages');
    return saved ? JSON.parse(saved) : [{
      id: '1',
      text: 'Welcome to the channel! 👋',
      user: 'System',
      timestamp: new Date(),
      channelId: 'general'
    }];
  });
  
  const [channels, setChannels] = useState<Channel[]>([
    { id: 'general', name: 'general', displayName: 'general' },
    { id: 'random', name: 'random', displayName: 'random' },
    { id: 'help', name: 'help', displayName: 'help' }
  ]);
  
  const [currentChannel, setCurrentChannel] = useState<string>('general');

  useEffect(() => {
    localStorage.setItem('slack-clone-messages', JSON.stringify(messages));
  }, [messages]);

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

  const editMessage = (messageId: string, newText: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          text: newText,
          isEdited: true,
          editHistory: [...(msg.editHistory || []), {
            text: msg.text,
            editedAt: new Date()
          }]
        };
      }
      return msg;
    }));
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  };

  const getMessageHistory = (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    return message?.editHistory || [];
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
    createChannel,
    editMessage,
    deleteMessage,
    getMessageHistory
  };
}