import { useLocalStorage } from './useLocalStorage';
import { Message } from '../types/message';
import { v4 as uuidv4 } from 'uuid';

export function useMessages(channelId: string) {
  const [messages, setMessages] = useLocalStorage<Message[]>(`messages-${channelId}`, []);

  const addMessage = (content: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      content,
      channelId,
      createdAt: new Date().toISOString(),
      updatedAt: null,
      isEdited: false
    };
    setMessages([...messages, newMessage]);
  };

  const getChannelMessages = () => {
    return messages.filter(message => message.channelId === channelId);
  };

  return {
    messages: getChannelMessages(),
    addMessage
  };
} 