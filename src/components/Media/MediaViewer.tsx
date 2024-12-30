import React, { useState, useEffect, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaViewerProps {
  files: { url: string; type: string }[];
  initialIndex?: number;
  onClose: () => void;
}

export const MediaViewer: React.FC<MediaViewerProps> = ({
  files,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentFile = files[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
          break;
        case 'ArrowRight':
          setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [files.length, onClose]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    setScale((prev) => {
      const newScale = direction === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.min(Math.max(0.5, newScale), 3);
    });
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const renderMedia = () => {
    if (currentFile.type.startsWith('image/')) {
      return (
        <img
          src={currentFile.url}
          alt=""
          className="max-h-full max-w-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${scale})` }}
        />
      );
    }
    if (currentFile.type.startsWith('video/')) {
      return (
        <video
          src={currentFile.url}
          controls
          className="max-h-full max-w-full"
          autoPlay
        />
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="absolute top-4 left-4 space-x-2">
        <button
          onClick={() => handleZoom('in')}
          className="text-white hover:text-gray-300"
        >
          <ZoomIn className="h-6 w-6" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="text-white hover:text-gray-300"
        >
          <ZoomOut className="h-6 w-6" />
        </button>
      </div>

      {currentIndex > 0 && (
        <button
          onClick={() => setCurrentIndex(currentIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      {currentIndex < files.length - 1 && (
        <button
          onClick={() => setCurrentIndex(currentIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      <div className="w-full h-full flex items-center justify-center p-4">
        {renderMedia()}
      </div>
    </div>
  );
}; 