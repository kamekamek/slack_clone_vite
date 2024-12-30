import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useUserProfile } from './useUserProfile';

interface Message {
  id: string;
  text: string;
  user: string;
  userId: string;
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
  const { user, isAuthenticated } = useAuth();
  const { userProfile } = useUserProfile();
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('slack-clone-messages');
    return saved ? JSON.parse(saved) : [{
      id: '1',
      text: 'Welcome to the channel! 👋',
      user: 'System',
      userId: 'system',
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
    if (!isAuthenticated || !user) {
      throw new Error('Must be authenticated to send messages');
    }
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      user: userProfile?.displayName || user.email || 'Anonymous',
      userId: user.uid,
      timestamp: new Date(),
      channelId: currentChannel
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const editMessage = (messageId: string, newText: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('Must be authenticated to edit messages');
    }
    
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.userId === user.uid) {
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
    if (!isAuthenticated || !user) {
      throw new Error('Must be authenticated to delete messages');
    }
    
    setMessages(prev => prev.filter(msg => 
      !(msg.id === messageId && msg.userId === user.uid)
    ));
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
    if (!isAuthenticated) {
      throw new Error('Must be authenticated to create channels');
    }
    
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
    getMessageHistory,
    isAuthenticated,
    currentUser: user
  };
}