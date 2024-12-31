import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

interface MediaViewerProps {
  file: File;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function MediaViewer({
  file,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}: MediaViewerProps) {
  const [url, setUrl] = useState<string>('');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious, hasNext, hasPrevious]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-8 h-8" />
        </button>

        {/* ズームコントロール */}
        <div className="absolute top-4 left-4 flex space-x-2">
          <button
            onClick={handleZoomOut}
            className="text-white hover:text-gray-300 transition-colors"
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-6 h-6" />
          </button>
          <button
            onClick={handleZoomIn}
            className="text-white hover:text-gray-300 transition-colors"
            disabled={zoom >= 3}
          >
            <ZoomIn className="w-6 h-6" />
          </button>
        </div>

        {/* 前へボタン */}
        {hasPrevious && onPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* メディアコンテンツ */}
        <div className="max-w-[90vw] max-h-[90vh] overflow-auto">
          {file.type.startsWith('image/') ? (
            <img
              src={url}
              alt={file.name}
              className="transition-transform duration-200"
              style={{ transform: `scale(${zoom})` }}
            />
          ) : file.type.startsWith('video/') ? (
            <video
              src={url}
              controls
              autoPlay
              className="max-w-full max-h-full"
            />
          ) : (
            <div className="bg-white p-4 rounded">
              <p>このファイル形式は表示できません</p>
              <p className="text-sm text-gray-600">{file.name}</p>
            </div>
          )}
        </div>

        {/* 次へボタン */}
        {hasNext && onNext && (
          <button
            onClick={onNext}
            className="absolute right-4 text-white hover:text-gray-300 transition-colors"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );
} 