import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FilePreview } from './FilePreview';
import { Upload, X } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  maxSize?: number;
  acceptedTypes?: string[];
}

export const FileUploadComponent: React.FC<FileUploadProps> = ({
  onFileUpload,
  maxSize = 10 * 1024 * 1024, // デフォルト10MB
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf'],
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
    onFileUpload(acceptedFiles);
    // アップロードの進捗をシミュレート
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: acceptedTypes.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400" />
        <p className="mt-2 text-sm text-gray-600">
          {isDragActive
            ? 'ファイルをドロップしてください'
            : 'クリックまたはドラッグ&ドロップでファイルをアップロード'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          最大サイズ: {Math.round(maxSize / 1024 / 1024)}MB
        </p>
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {files.map((file, index) => (
          <div key={index} className="relative">
            <FilePreview file={file} />
            <button
              onClick={() => removeFile(index)}
              className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}; 