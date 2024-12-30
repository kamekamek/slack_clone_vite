import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Code } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  currentChannel: string;
}

export function MessageInput({ onSendMessage, currentChannel }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Enter to send
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (message.trim()) {
          onSendMessage(message);
          setMessage('');
        }
      }
      // Ctrl/Cmd + E to toggle emoji picker
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowEmojiPicker(prev => !prev);
      }
    };

    inputRef.current?.addEventListener('keydown', handleKeyDown);
    return () => inputRef.current?.removeEventListener('keydown', handleKeyDown);
  }, [message, onSendMessage]);

  const processMessage = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const processedText = text.replace(urlRegex, '[$1]($1)');
    return processedText;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const processedMessage = processMessage(message);
      onSendMessage(processedMessage);
      setMessage('');
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Toggle Preview"
          >
            <Code className="w-5 h-5" />
          </button>
        </div>
        
        <div className="relative flex-1">
          {isPreviewMode ? (
            <div className="w-full rounded-lg border border-gray-300 px-4 py-2 min-h-[100px] markdown-preview">
              <ReactMarkdown
                components={{
                  code: ({node, inline, className, children, ...props}) => {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={materialDark}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {message}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Message #${currentChannel} (Ctrl+Enter to send, supports Markdown)`}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 min-h-[100px]"
            />
          )}
          
          <button
            ref={emojiButtonRef}
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Add emoji (Ctrl+E)"
          >
            <Smile className="w-5 h-5" />
          </button>
          {showEmojiPicker && (
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
              triggerRef={emojiButtonRef}
            />
          )}
        </div>
        
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Send message (Ctrl+Enter)"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
}