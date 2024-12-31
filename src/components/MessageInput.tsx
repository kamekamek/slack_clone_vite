import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, X } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import { FileUploadComponent } from './FileUpload/FileUploadComponent';
import { MediaViewer } from '../Media/MediaViewer';

interface MessageInputProps {
  onSendMessage: (text: string, files?: File[]) => void;
  onFileUpload: (files: File[]) => void;
  currentChannel: string;
}

export function MessageInput({ onSendMessage, onFileUpload, currentChannel }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [selectedPreviewIndex, setSelectedPreviewIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (message.trim() || attachedFiles.length > 0) {
          handleSubmit(e as any);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        setShowEmojiPicker(prev => !prev);
      }
    };

    inputRef.current?.addEventListener('keydown', handleKeyDown);
    return () => inputRef.current?.removeEventListener('keydown', handleKeyDown);
  }, [message, attachedFiles]);

  // プレビューURLのクリーンアップ
  useEffect(() => {
    return () => {
      previewFiles.forEach(file => {
        if (file.type.startsWith('image/')) {
          URL.revokeObjectURL(URL.createObjectURL(file));
        }
      });
    };
  }, [previewFiles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachedFiles.length > 0) {
      onSendMessage(message, attachedFiles);
      setMessage('');
      setAttachedFiles([]);
      setPreviewFiles([]);
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
      const validFiles = files.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const isPDF = file.type === 'application/pdf';
        const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB制限
        return (isImage || isVideo || isPDF) && isValidSize;
      });

      if (validFiles.length > 0) {
        setPreviewFiles(prev => [...prev, ...validFiles]);
        setAttachedFiles(prev => [...prev, ...validFiles]);
      }
      
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setPreviewFiles(prev => prev.filter((_, i) => i !== index));
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreviewClick = (index: number) => {
    setSelectedPreviewIndex(index);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
      {previewFiles.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {previewFiles.map((file, index) => (
            <div key={index} className="relative group">
              {file.type.startsWith('image/') ? (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="h-20 w-20 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => handlePreviewClick(index)}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="h-20 w-20 flex items-center justify-center bg-gray-100 rounded">
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message #${currentChannel} (Ctrl+Enter to send)`}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-24"
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
              ref={emojiButtonRef}
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Add emoji (Ctrl+E)"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            accept="image/*,video/*,application/pdf"
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
          disabled={!message.trim() && attachedFiles.length === 0}
          className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-[52px]"
          title="Send message (Ctrl+Enter)"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {selectedPreviewIndex !== null && (
        <MediaViewer
          file={previewFiles[selectedPreviewIndex]}
          onClose={() => setSelectedPreviewIndex(null)}
          onNext={() => setSelectedPreviewIndex(prev => 
            prev !== null && prev < previewFiles.length - 1 ? prev + 1 : prev
          )}
          onPrevious={() => setSelectedPreviewIndex(prev => 
            prev !== null && prev > 0 ? prev - 1 : prev
          )}
          hasNext={selectedPreviewIndex < previewFiles.length - 1}
          hasPrevious={selectedPreviewIndex > 0}
        />
      )}
    </form>
  );
}
