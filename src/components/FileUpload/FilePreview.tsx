import React, { useState, useEffect } from 'react';
import { FileText, Image, Video, Music, Download } from 'lucide-react';

interface FilePreviewProps {
  file: File;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file }) => {
  const [preview, setPreview] = useState<string>('');

  useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
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

  return (
    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0">
        {file.type.startsWith('image/') && preview ? (
          <img src={preview} alt={file.name} className="h-16 w-16 object-cover rounded" />
        ) : (
          getFileIcon()
        )}
      </div>
      <div className="ml-4 flex-grow">
        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
      </div>
      <button
        onClick={handleDownload}
        className="ml-4 p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-200"
      >
        <Download className="h-5 w-5" />
      </button>
    </div>
  );
}; 