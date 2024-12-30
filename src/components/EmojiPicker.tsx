import React, { useEffect, useRef } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: any) => void;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement>;
}

export function EmojiPicker({ onEmojiSelect, onClose, triggerRef }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, triggerRef]);

  return (
    <div className="absolute bottom-full mb-2" ref={pickerRef}>
      <div className="relative z-50">
        <Picker 
          data={data} 
          onEmojiSelect={onEmojiSelect}
          theme="light"
          previewPosition="none"
          skinTonePosition="none"
        />
      </div>
    </div>
  );
}