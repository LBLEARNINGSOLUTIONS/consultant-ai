import { useState, useRef } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { uploadMultipleTranscripts, UploadResult } from '../../services/uploadService';
import { cn } from '../../utils/cn';

interface TranscriptUploadProps {
  onUploadComplete: (results: UploadResult[]) => void;
  maxFiles?: number;
}

export function TranscriptUpload({ onUploadComplete, maxFiles = 10 }: TranscriptUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Map<string, number>>(new Map());
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles = files.slice(0, maxFiles - selectedFiles.length);
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setProgress(new Map());

    try {
      const results = await uploadMultipleTranscripts(
        selectedFiles,
        (fileId, prog) => {
          setProgress(prev => new Map(prev).set(fileId, prog));
        }
      );

      onUploadComplete(results);
      setSelectedFiles([]);
      setProgress(new Map());
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
          dragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-slate-300 bg-slate-50 hover:border-indigo-400'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className="bg-indigo-100 p-3 rounded-full">
            <Upload className="w-6 h-6 text-indigo-600" />
          </div>

          <div>
            <p className="text-sm font-medium text-slate-900">
              Drop interview transcripts here or{' '}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports .txt files up to 10MB • Max {maxFiles} files
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Selected Files ({selectedFiles.length})
            </h3>
            {!uploading && (
              <button
                onClick={() => setSelectedFiles([])}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                {!uploading && (
                  <button
                    onClick={() => removeFile(index)}
                    className="ml-2 p-1 hover:bg-slate-200 rounded transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className={cn(
              'w-full mt-4 py-2 px-4 rounded-lg font-medium text-sm transition-colors',
              uploading || selectedFiles.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            )}
          >
            {uploading ? 'Processing...' : `Upload & Analyze ${selectedFiles.length} File${selectedFiles.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
}
