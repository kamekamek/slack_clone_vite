import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { FilePreview } from '../FileUpload/FilePreview';
import { Upload, X, PlusCircle } from 'lucide-react';
import { MediaViewer } from '../Media/MediaViewer';

interface FileUploadProps {
  onFileUpload: (files: File[]) => void;
  maxSize?: number;
  acceptedTypes?: string[];
  onError?: (error: string) => void;
}

interface UploadProgress {
  [key: string]: number;
}

export const FileUploadComponent: React.FC<FileUploadProps> = ({
  onFileUpload,
  maxSize = 10 * 1024 * 1024, // デフォルト10MB
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf'],
  onError,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [error, setError] = useState<string>('');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((newFiles: File[]) => {
    try {
      // 重複チェック
      const uniqueFiles = newFiles.filter(newFile => 
        !files.some(existingFile => 
          existingFile.name === newFile.name && 
          existingFile.size === newFile.size
        )
      );

      if (uniqueFiles.length === 0) {
        throw new Error('選択されたファイルは既にアップロード済みです。');
      }

      // サイズチェック
      const oversizedFiles = uniqueFiles.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        throw new Error(`以下のファイルは最大サイズ(${Math.round(maxSize / 1024 / 1024)}MB)を超えています:\n${oversizedFiles.map(f => f.name).join('\n')}`);
      }

      // ファイルタイプチェック
      const invalidFiles = uniqueFiles.filter(file => 
        !acceptedTypes.some(type => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('/*', '/'));
          }
          return file.type === type;
        })
      );

      if (invalidFiles.length > 0) {
        throw new Error(`以下のファイルは許可されていない形式です:\n${invalidFiles.map(f => f.name).join('\n')}`);
      }

      // アップロードの進捗を初期化
      const newProgress = { ...uploadProgress };
      uniqueFiles.forEach(file => {
        newProgress[file.name] = 0;
      });
      setUploadProgress(newProgress);

      setFiles(prev => [...prev, ...uniqueFiles]);
      onFileUpload(uniqueFiles);
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました。';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [files, maxSize, acceptedTypes, onFileUpload, onError, uploadProgress]);

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
    const removedFile = files[index];
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[removedFile.name];
      return newProgress;
    });
  };

  // アップロードの進捗を更新する関数
  const updateProgress = (fileName: string, progress: number) => {
    setUploadProgress(prev => ({
      ...prev,
      [fileName]: progress,
    }));
  };

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}

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

      {/* アップロードされたファイルのプレビュー */}
      <div className="mt-4 space-y-2">
        {files.map((file, index) => (
          <div key={index} className="relative">
            <div className="relative">
              <FilePreview 
                file={file} 
                onPreviewClick={() => setPreviewFile(file)}
              />
              <button
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
              {uploadProgress[file.name] !== undefined && uploadProgress[file.name] < 100 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${uploadProgress[file.name]}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* プレビューモーダル */}
      {previewFile && (
        <MediaViewer
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  );
};
