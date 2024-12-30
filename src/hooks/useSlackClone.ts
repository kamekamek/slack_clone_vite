import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useUserProfile } from './useUserProfile';

interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
}

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  status?: string;
  isOnline?: boolean;
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
}

interface Channel {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isArchived?: boolean;
  isPrivate?: boolean;
  members?: string[];
  pinnedMessages?: string[];
  isFavorite?: boolean;
  createdBy?: string;
  createdAt: Date;
}

export function useSlackClone() {
  const { user, isAuthenticated } = useAuth();
  const { profile: userProfile } = useUserProfile(user?.id || null);
  
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
    {
      id: 'general',
      name: 'general',
      displayName: 'general',
      description: '一般的な議論のためのチャンネル',
      isPrivate: false,
      members: [],
      pinnedMessages: [],
      createdAt: new Date(),
      createdBy: 'system'
    },
    {
      id: 'random',
      name: 'random',
      displayName: 'random',
      description: 'カジュアルな会話のためのチャンネル',
      isPrivate: false,
      members: [],
      pinnedMessages: [],
      createdAt: new Date(),
      createdBy: 'system'
    }
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
      user: userProfile?.username || user.username || 'Anonymous',
      userId: user.id,
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
      if (msg.id === messageId && msg.userId === user.id) {
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
      !(msg.id === messageId && msg.userId === user.id)
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

  const createChannel = (displayName: string, description: string = '', isPrivate: boolean = false) => {
    if (!isAuthenticated || !user) {
      throw new Error('Must be authenticated to create channels');
    }
    
    validateChannelName(displayName);
    
    const id = Date.now().toString();
    const newChannel: Channel = {
      id,
      name: displayName,
      displayName,
      description,
      isArchived: false,
      isPrivate,
      members: [user.id],
      pinnedMessages: [],
      isFavorite: false,
      createdBy: user.id,
      createdAt: new Date()
    };
    
    setChannels(prev => [...prev, newChannel]);
    return newChannel;
  };

  const updateChannel = (channelId: string, updates: Partial<Channel>) => {
    if (!isAuthenticated || !user) {
      throw new Error('チャンネルを更新するには認証が必要です');
    }

    setChannels(prev => prev.map(channel => 
      channel.id === channelId ? { ...channel, ...updates } : channel
    ));
  };

  const archiveChannel = (channelId: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('チャンネルをアーカイブするには認証が必要です');
    }

    updateChannel(channelId, { isArchived: true });
  };

  const toggleChannelFavorite = (channelId: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('お気に入りを変更するには認証が必要です');
    }

    setChannels(prev => prev.map(channel => 
      channel.id === channelId
        ? { ...channel, isFavorite: !channel.isFavorite }
        : channel
    ));
  };

  const toggleMessagePin = (messageId: string) => {
    if (!isAuthenticated || !user) {
      throw new Error('メッセージをピン留めするには認証が必要です');
    }

    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    const channel = channels.find(c => c.id === message.channelId);
    if (!channel) return;

    const isPinned = channel.pinnedMessages?.includes(messageId);
    const updatedPinnedMessages = isPinned
      ? channel.pinnedMessages?.filter(id => id !== messageId) || []
      : [...(channel.pinnedMessages || []), messageId];

    updateChannel(message.channelId, { pinnedMessages: updatedPinnedMessages });
  };

  const searchMessages = (query: string, channelId?: string) => {
    const searchInChannel = channelId 
      ? messages.filter(m => m.channelId === channelId)
      : messages;

    return searchInChannel.filter(message => 
      message.text.toLowerCase().includes(query.toLowerCase()) ||
      message.mentions?.some(mention => mention.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const addMention = (messageId: string, userId: string) => {
    setMessages(prev => prev.map(message => 
      message.id === messageId
        ? { ...message, mentions: [...(message.mentions || []), userId] }
        : message
    ));
  };

  const getPinnedMessages = (channelId: string) => {
    const channel = channels.find(c => c.id === channelId);
    if (!channel || !channel.pinnedMessages) return [];

    return messages.filter(message => 
      channel.pinnedMessages?.includes(message.id)
    );
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
    currentUser: user,
    updateChannel,
    archiveChannel,
    toggleChannelFavorite,
    toggleMessagePin,
    searchMessages,
    addMention,
    getPinnedMessages
  };
}