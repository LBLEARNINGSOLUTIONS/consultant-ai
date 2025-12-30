import { useState, useRef } from 'react';
import { Upload, FileText, X, Type } from 'lucide-react';
import { uploadMultipleTranscripts, UploadResult } from '../../services/uploadService';
import { cn } from '../../utils/cn';

interface TranscriptUploadProps {
  onUploadComplete: (results: UploadResult[]) => void;
  maxFiles?: number;
}

type UploadMode = 'files' | 'paste';

export function TranscriptUpload({ onUploadComplete, maxFiles = 10 }: TranscriptUploadProps) {
  const [mode, setMode] = useState<UploadMode>('files');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [pastedText, setPastedText] = useState('');
  const [transcriptTitle, setTranscriptTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [_progress, setProgress] = useState<Map<string, number>>(new Map());
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Interview metadata state
  const [interviewDate, setInterviewDate] = useState('');
  const [intervieweeName, setIntervieweeName] = useState('');
  const [intervieweeRole, setIntervieweeRole] = useState('');
  const [department, setDepartment] = useState('');

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

  const resetMetadataFields = () => {
    setInterviewDate('');
    setIntervieweeName('');
    setIntervieweeRole('');
    setDepartment('');
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

      // Add metadata to all results (applies same metadata to all files in batch)
      const resultsWithMetadata = results.map(result => ({
        ...result,
        interviewDate: interviewDate || undefined,
        intervieweeName: intervieweeName || undefined,
        intervieweeRole: intervieweeRole || undefined,
        department: department || undefined,
      }));

      onUploadComplete(resultsWithMetadata);
      setSelectedFiles([]);
      setProgress(new Map());
      resetMetadataFields();
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handlePasteUpload = async () => {
    if (!pastedText.trim()) {
      alert('Please paste a transcript first.');
      return;
    }

    const title = transcriptTitle.trim() || `Pasted Transcript ${new Date().toLocaleDateString()}`;

    setUploading(true);

    try {
      // Create a result object for pasted text with metadata
      const result: UploadResult = {
        fileId: `paste-${Date.now()}`,
        filename: title,
        text: pastedText,
        interviewDate: interviewDate || undefined,
        intervieweeName: intervieweeName || undefined,
        intervieweeRole: intervieweeRole || undefined,
        department: department || undefined,
      };

      onUploadComplete([result]);
      setPastedText('');
      setTranscriptTitle('');
      resetMetadataFields();
    } catch (error) {
      console.error('Paste upload error:', error);
      alert('Failed to process pasted transcript.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Mode Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex space-x-4 -mb-px">
          <button
            onClick={() => setMode('files')}
            className={cn(
              'py-3 px-4 border-b-2 font-medium text-sm transition-colors flex items-center gap-2',
              mode === 'files'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            )}
          >
            <Upload className="w-4 h-4" />
            Upload Files
          </button>
          <button
            onClick={() => setMode('paste')}
            className={cn(
              'py-3 px-4 border-b-2 font-medium text-sm transition-colors flex items-center gap-2',
              mode === 'paste'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            )}
          >
            <Type className="w-4 h-4" />
            Paste Text
          </button>
        </div>
      </div>

      {/* File Upload Mode */}
      {mode === 'files' && (
        <>
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
        </>
      )}

      {/* Paste Text Mode */}
      {mode === 'paste' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <label htmlFor="transcript-title" className="block text-sm font-medium text-slate-700 mb-2">
                Interview Title (Optional)
              </label>
              <input
                id="transcript-title"
                type="text"
                value={transcriptTitle}
                onChange={(e) => setTranscriptTitle(e.target.value)}
                placeholder="e.g., Interview with Sarah - Customer Success"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                disabled={uploading}
              />
            </div>

            {/* Interview Metadata Section */}
            <div className="border-t border-slate-200 pt-4">
              <h4 className="text-sm font-medium text-slate-700 mb-3">Interview Details (Optional)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="interview-date" className="block text-xs text-slate-500 mb-1">
                    Interview Date
                  </label>
                  <input
                    id="interview-date"
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={uploading}
                  />
                </div>
                <div>
                  <label htmlFor="interviewee-name" className="block text-xs text-slate-500 mb-1">
                    Interviewee Name
                  </label>
                  <input
                    id="interviewee-name"
                    type="text"
                    value={intervieweeName}
                    onChange={(e) => setIntervieweeName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={uploading}
                  />
                </div>
                <div>
                  <label htmlFor="interviewee-role" className="block text-xs text-slate-500 mb-1">
                    Interviewee Role
                  </label>
                  <input
                    id="interviewee-role"
                    type="text"
                    value={intervieweeRole}
                    onChange={(e) => setIntervieweeRole(e.target.value)}
                    placeholder="Operations Manager"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={uploading}
                  />
                </div>
                <div>
                  <label htmlFor="department" className="block text-xs text-slate-500 mb-1">
                    Department
                  </label>
                  <input
                    id="department"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Operations"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    disabled={uploading}
                  />
                </div>
              </div>
            </div>

            {/* Text Area */}
            <div>
              <label htmlFor="transcript-text" className="block text-sm font-medium text-slate-700 mb-2">
                Paste Transcript
              </label>
              <textarea
                id="transcript-text"
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your interview transcript here..."
                rows={12}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm resize-y"
                disabled={uploading}
              />
              <p className="text-xs text-slate-500 mt-2">
                {pastedText.length > 0 ? `${pastedText.length.toLocaleString()} characters` : 'Minimum 100 characters recommended'}
              </p>
            </div>

            {/* Upload Button */}
            <button
              onClick={handlePasteUpload}
              disabled={uploading || pastedText.trim().length === 0}
              className={cn(
                'w-full py-3 px-4 rounded-lg font-medium text-sm transition-colors',
                uploading || pastedText.trim().length === 0
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              )}
            >
              {uploading ? 'Processing...' : 'Analyze Transcript'}
            </button>
          </div>
        </div>
      )}

      {/* Selected Files List */}
      {mode === 'files' && selectedFiles.length > 0 && (
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

          {/* Interview Metadata Section for File Upload */}
          <div className="border-t border-slate-200 pt-4 mt-4">
            <h4 className="text-sm font-medium text-slate-700 mb-3">
              Interview Details (Optional)
              {selectedFiles.length > 1 && (
                <span className="text-xs font-normal text-slate-500 ml-2">
                  — applies to all files
                </span>
              )}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="file-interview-date" className="block text-xs text-slate-500 mb-1">
                  Interview Date
                </label>
                <input
                  id="file-interview-date"
                  type="date"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={uploading}
                />
              </div>
              <div>
                <label htmlFor="file-interviewee-name" className="block text-xs text-slate-500 mb-1">
                  Interviewee Name
                </label>
                <input
                  id="file-interviewee-name"
                  type="text"
                  value={intervieweeName}
                  onChange={(e) => setIntervieweeName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={uploading}
                />
              </div>
              <div>
                <label htmlFor="file-interviewee-role" className="block text-xs text-slate-500 mb-1">
                  Interviewee Role
                </label>
                <input
                  id="file-interviewee-role"
                  type="text"
                  value={intervieweeRole}
                  onChange={(e) => setIntervieweeRole(e.target.value)}
                  placeholder="Operations Manager"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={uploading}
                />
              </div>
              <div>
                <label htmlFor="file-department" className="block text-xs text-slate-500 mb-1">
                  Department
                </label>
                <input
                  id="file-department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Operations"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={uploading}
                />
              </div>
            </div>
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
