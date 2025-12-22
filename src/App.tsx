import { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useInterviews } from './hooks/useInterviews';
import { Login } from './components/auth/Login';
import { TranscriptUpload } from './components/upload/TranscriptUpload';
import { AnalysisViewer } from './components/analysis/AnalysisViewer';
import { UploadResult } from './services/uploadService';
import { Interview } from './types/database';
import { FileText, LogOut, Plus, Trash2, Eye } from 'lucide-react';
import { formatDate, formatRelative } from './utils/dateFormatters';
import { Badge } from './components/analysis/Badge';

function App() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const {
    interviews,
    loading: interviewsLoading,
    createInterview,
    deleteInterview,
    analyzeInterview,
    updateInterview,
  } = useInterviews(user?.id);

  const [showUpload, setShowUpload] = useState(false);
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  // Show login if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return <Login />;
  }

  const handleUploadComplete = async (results: UploadResult[]) => {
    setShowUpload(false);

    for (const result of results) {
      if (result.error || !result.text) {
        console.error(`Failed to upload ${result.filename}:`, result.error);
        continue;
      }

      // Create interview in database
      const { data: interview } = await createInterview({
        user_id: user.id,
        title: result.filename.replace(/\.txt$/i, ''),
        transcript_text: result.text,
        analysis_status: 'pending',
      });

      // Start analysis
      if (interview) {
        setAnalyzing(prev => new Set(prev).add(interview.id));
        await analyzeInterview(interview.id, result.text);
        setAnalyzing(prev => {
          const next = new Set(prev);
          next.delete(interview.id);
          return next;
        });
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      await deleteInterview(id);
    }
  };

  const getStatusBadge = (status: string, interviewId: string) => {
    if (analyzing.has(interviewId)) {
      return <Badge variant="yellow">Analyzing...</Badge>;
    }

    switch (status) {
      case 'completed':
        return <Badge variant="green">Completed</Badge>;
      case 'analyzing':
        return <Badge variant="yellow">Analyzing...</Badge>;
      case 'failed':
        return <Badge variant="red">Failed</Badge>;
      case 'pending':
        return <Badge variant="gray">Pending</Badge>;
      default:
        return <Badge variant="gray">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 rounded-lg p-2">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">
              Consultant<span className="text-indigo-600">AI</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-slate-900">{profile.name}</p>
              <p className="text-xs text-slate-500">{profile.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Interview Transcripts</h2>
            <p className="text-slate-600 mt-1">
              Upload and analyze interview transcripts with AI
            </p>
          </div>

          <button
            onClick={() => setShowUpload(!showUpload)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Upload Transcripts
          </button>
        </div>

        {/* Upload Section */}
        {showUpload && (
          <div className="mb-6">
            <TranscriptUpload
              onUploadComplete={handleUploadComplete}
              maxFiles={10}
            />
          </div>
        )}

        {/* Interviews List */}
        {interviewsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
              >
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <FileText className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No interviews yet
            </h3>
            <p className="text-slate-600 mb-6">
              Upload your first interview transcript to get started with AI analysis
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              Upload Transcript
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {interviews.map(interview => (
              <div
                key={interview.id}
                className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 flex-1 line-clamp-2">
                    {interview.title}
                  </h3>
                  <button
                    onClick={() => handleDelete(interview.id)}
                    className="ml-2 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete interview"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Status:</span>
                    {getStatusBadge(interview.analysis_status, interview.id)}
                  </div>

                  <div className="text-xs text-slate-500">
                    Created {formatRelative(interview.created_at)}
                  </div>

                  {interview.analyzed_at && (
                    <div className="text-xs text-slate-500">
                      Analyzed {formatDate(interview.analyzed_at)}
                    </div>
                  )}

                  {interview.error_message && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                      {interview.error_message}
                    </div>
                  )}

                  {interview.analysis_status === 'completed' && (
                    <>
                      <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-600">Workflows:</span>{' '}
                          <span className="font-semibold text-slate-900">
                            {Array.isArray(interview.workflows) ? interview.workflows.length : 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Pain Points:</span>{' '}
                          <span className="font-semibold text-slate-900">
                            {Array.isArray(interview.pain_points) ? interview.pain_points.length : 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Tools:</span>{' '}
                          <span className="font-semibold text-slate-900">
                            {Array.isArray(interview.tools) ? interview.tools.length : 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Roles:</span>{' '}
                          <span className="font-semibold text-slate-900">
                            {Array.isArray(interview.roles) ? interview.roles.length : 0}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedInterview(interview)}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View Analysis
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {interviews.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Total Interviews</p>
              <p className="text-2xl font-bold text-slate-900">{interviews.length}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {interviews.filter(i => i.analysis_status === 'completed').length}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Analyzing</p>
              <p className="text-2xl font-bold text-yellow-600">
                {interviews.filter(i => i.analysis_status === 'analyzing').length + analyzing.size}
              </p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {interviews.filter(i => i.analysis_status === 'failed').length}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Analysis Viewer Modal */}
      {selectedInterview && (
        <AnalysisViewer
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
          onUpdate={async (updates) => {
            await updateInterview(selectedInterview.id, updates);
            // Update local state
            setSelectedInterview({ ...selectedInterview, ...updates });
          }}
        />
      )}
    </div>
  );
}

export default App;
