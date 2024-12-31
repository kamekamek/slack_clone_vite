import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Folder } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import { FileUploadComponent } from './FileUpload/FileUploadComponent';

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onFileUpload: (files: File[]) => void;
  currentChannel: string;
}

export function MessageInput({ onSendMessage, onFileUpload, currentChannel }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // ファイルの種類をフィルタリング
      const validFiles = files.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isPDF = file.type === 'application/pdf';
        return isImage || isVideo || isPDF;
      });

      if (validFiles.length > 0) {
        onFileUpload(validFiles);
      }
      
      // 入力をリセット
      e.target.value = '';
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message #${currentChannel} (Ctrl+Enter to send)`}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-32"
            rows={3}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="ファイルを添付"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => folderInputRef.current?.click()}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="フォルダを選択"
            >
              <Folder className="w-5 h-5" />
            </button>
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Add emoji (Ctrl+E)"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* 通常のファイル選択用input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            accept="image/*,video/*,application/pdf"
            className="hidden"
          />

          {/* フォルダ選択用input */}
          <input
            ref={folderInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            accept="image/*,video/*,application/pdf"
            {...{webkitdirectory: "", directory: ""} as any}
            className="hidden"
          />

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
          className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-[52px]"
          title="Send message (Ctrl+Enter)"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {showFileUpload && (
        <div className="mt-4">
          <FileUploadComponent
            onFileUpload={onFileUpload}
            maxSize={10 * 1024 * 1024} // 10MB
            acceptedTypes={['image/*', 'video/*', 'application/pdf']}
          />
        </div>
      )}
    </form>
  );
}
