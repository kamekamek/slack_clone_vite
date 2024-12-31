import React, { useState, useEffect } from 'react';
import { FileText, Image, Video, Music, Download, Eye } from 'lucide-react';

interface FilePreviewProps {
  file: File;
  onPreviewClick?: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, onPreviewClick }) => {
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      setLoading(true);
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setLoading(false);
      };
      
      reader.onerror = () => {
        setError('プレビューの読み込みに失敗しました');
        setLoading(false);
      };

      reader.readAsDataURL(file);
    }

    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [file]);

  const getFileIcon = () => {
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />;
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8 text-purple-500" />;
    if (file.type.startsWith('audio/')) return <Music className="h-8 w-8 text-green-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const getFileTypeLabel = () => {
    if (file.type.startsWith('image/')) return '画像';
    if (file.type.startsWith('video/')) return '動画';
    if (file.type.startsWith('audio/')) return '音声';
    if (file.type === 'application/pdf') return 'PDF';
    return 'ファイル';
  };

  const handleDownload = () => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePreviewClick = () => {
    if (onPreviewClick) {
      onPreviewClick();
    }
  };

  return (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors">
      <div className="flex-shrink-0 relative">
        {loading ? (
          <div className="h-16 w-16 flex items-center justify-center bg-gray-200 rounded animate-pulse">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="h-16 w-16 flex items-center justify-center bg-red-100 rounded">
            <span className="text-red-500 text-xs text-center">エラー</span>
          </div>
        ) : file.type.startsWith('image/') && preview ? (
          <div
            className="relative group cursor-pointer"
            onClick={handlePreviewClick}
          >
            <img
              src={preview}
              alt={file.name}
              className="h-16 w-16 object-cover rounded"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-opacity">
              <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ) : (
          <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded">
            {getFileIcon()}
          </div>
        )}
      </div>

      <div className="ml-4 flex-grow">
        <div className="flex items-center">
          <p className="text-sm font-medium text-gray-900 truncate flex-grow">
            {file.name}
          </p>
          <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
            {getFileTypeLabel()}
          </span>
        </div>
        <div className="flex items-center mt-1">
          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
          {file.type.startsWith('image/') && (
            <button
              onClick={handlePreviewClick}
              className="ml-2 text-xs text-blue-500 hover:text-blue-700 transition-colors"
            >
              プレビュー
            </button>
          )}
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="ml-4 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-200 transition-colors"
        title="ダウンロード"
      >
        <Download className="h-5 w-5" />
      </button>
    </div>
  );
}; 