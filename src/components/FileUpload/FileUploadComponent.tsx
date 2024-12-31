import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FilePreview } from './FilePreview';
import { Upload, X, PlusCircle } from 'lucide-react';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((newFiles: File[]) => {
    setFiles(prev => [...prev, ...newFiles]);
    onFileUpload(newFiles);
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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    handleFiles(acceptedFiles);
  }, [handleFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: acceptedTypes.reduce((acc, curr) => ({ ...acc, [curr]: [] }), {}),
  });

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    handleFiles(selectedFiles);
    // ファイル選択後にinput要素をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full space-y-4">
      {/* 通常のファイルアップロードボタン */}
      <div className="flex justify-center">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <PlusCircle className="h-5 w-5 mr-2" />
          ファイルを選択
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />
      </div>

      {/* ドラッグ&ドロップエリア */}
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
            : 'またはドラッグ&ドロップでファイルをアップロード'}
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