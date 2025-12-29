import { useState, useMemo } from 'react';
import { DndContext, DragEndEvent, useDraggable } from '@dnd-kit/core';
import { useAuth } from './hooks/useAuth';
import { useInterviews } from './hooks/useInterviews';
import { useCompanySummary } from './hooks/useCompanySummary';
import { useCompanies } from './hooks/useCompanies';
import { Login } from './components/auth/Login';
import { TranscriptUpload } from './components/upload/TranscriptUpload';
import { AnalysisViewer } from './components/analysis/AnalysisViewer';
import { CompanySummaryView } from './components/summary/CompanySummaryView';
import { CompanySidebar, CompanyFilter } from './components/companies/CompanySidebar';
import { CreateCompanyModal } from './components/companies/CreateCompanyModal';
import { UploadResult } from './services/uploadService';
import { Interview, CompanySummary, Company } from './types/database';
import { FileText, LogOut, Plus, Trash2, Eye, BarChart3, CheckSquare, Square, PieChart, GripVertical } from 'lucide-react';
import { formatDate, formatRelative } from './utils/dateFormatters';
import { Badge } from './components/analysis/Badge';
import { AnalyticsDashboard } from './components/dashboard/AnalyticsDashboard';

// Draggable interview card wrapper
function DraggableCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag handle */}
      <div
        {...listeners}
        {...attributes}
        className="absolute top-2 left-2 p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded z-10"
        title="Drag to move to a company folder"
      >
        <GripVertical className="w-4 h-4" />
      </div>
      {children}
    </div>
  );
}

function App() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const {
    interviews,
    loading: interviewsLoading,
    createInterview,
    deleteInterview,
    analyzeInterview,
    updateInterview,
    assignToCompany,
  } = useInterviews(user?.id);

  const {
    summaries,
    loading: summariesLoading,
    generateSummary,
    deleteSummary,
  } = useCompanySummary(user?.id);

  const {
    companies,
    createCompany,
    updateCompany,
    deleteCompany,
  } = useCompanies(user?.id);

  const [showUpload, setShowUpload] = useState(false);
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<CompanyFilter>(null);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [analyzing, setAnalyzing] = useState<Set<string>>(new Set());
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [viewMode, setViewMode] = useState<'interviews' | 'summaries' | 'analytics'>('interviews');
  const [selectedInterviewIds, setSelectedInterviewIds] = useState<Set<string>>(new Set());
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [selectedSummary, setSelectedSummary] = useState<CompanySummary | null>(null);

  // Debug logging
  console.log('App render:', { authLoading, user: user?.email, profile: profile?.name });

  // Show login if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-slate-600">Loading authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user, showing login');
    return <Login />;
  }

  console.log('User authenticated, rendering main app');

  // If user exists but profile doesn't, we can still show the app
  // (profile is optional for basic functionality)

  const handleUploadComplete = async (results: UploadResult[]) => {
    setShowUpload(false);

    for (const result of results) {
      if (result.error || !result.text) {
        console.error(`Failed to upload ${result.filename}:`, result.error);
        continue;
      }

      // Create interview in database
      const { data: interview, error: createError } = await createInterview({
        user_id: user.id,
        title: result.filename.replace(/\.txt$/i, ''),
        transcript_text: result.text,
        analysis_status: 'pending',
      });

      // Start analysis
      if (interview && !createError) {
        setAnalyzing(prev => new Set(prev).add(interview.id));
        await analyzeInterview(interview.id, result.text);
        setAnalyzing(prev => {
          const next = new Set(prev);
          next.delete(interview.id);
          return next;
        });
      } else if (createError) {
        console.error('Failed to create interview:', createError);
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

  const handleToggleInterviewSelection = (interviewId: string) => {
    setSelectedInterviewIds(prev => {
      const next = new Set(prev);
      if (next.has(interviewId)) {
        next.delete(interviewId);
      } else {
        next.add(interviewId);
      }
      return next;
    });
  };

  const handleGenerateSummary = async () => {
    if (selectedInterviewIds.size === 0) {
      alert('Please select at least one interview to generate a summary.');
      return;
    }

    const title = prompt('Enter a title for this company summary:');
    if (!title) return;

    setIsGeneratingSummary(true);
    try {
      const selectedInterviews = interviews.filter(i => selectedInterviewIds.has(i.id));
      const { error } = await generateSummary(title, selectedInterviews);

      if (error) {
        alert(`Failed to generate summary: ${typeof error === 'string' ? error : 'Unknown error'}`);
      } else {
        setSelectedInterviewIds(new Set());
        setViewMode('summaries');
      }
    } catch (error) {
      alert(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleDeleteSummary = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this summary?')) {
      await deleteSummary(id);
    }
  };

  // Filter interviews by selected company
  const filteredInterviews = useMemo(() => {
    if (selectedCompanyFilter === null) {
      return interviews; // Show all
    } else if (selectedCompanyFilter === 'unassigned') {
      return interviews.filter(i => !i.company_id);
    } else {
      return interviews.filter(i => i.company_id === selectedCompanyFilter);
    }
  }, [interviews, selectedCompanyFilter]);

  // Company handlers
  const handleCreateCompany = async (name: string, color: string, description?: string) => {
    if (!user) return;
    await createCompany({
      user_id: user.id,
      name,
      color,
      description: description || null,
    });
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setShowCompanyModal(true);
  };

  const handleUpdateCompany = async (name: string, color: string, description?: string) => {
    if (!editingCompany) return;
    await updateCompany(editingCompany.id, {
      name,
      color,
      description: description || null,
    });
    setEditingCompany(null);
  };

  const handleDeleteCompany = async (company: Company) => {
    if (window.confirm(`Are you sure you want to delete "${company.name}"? Interviews will be moved to Unassigned.`)) {
      await deleteCompany(company.id);
      // If we were viewing this company, reset to "All"
      if (selectedCompanyFilter === company.id) {
        setSelectedCompanyFilter(null);
      }
    }
  };

  // Handle drag end - assign interview to company
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const interviewId = active.id as string;
    const dropTargetId = over.id as string;

    // Determine the target company ID
    let targetCompanyId: string | null = null;

    if (dropTargetId === 'unassigned') {
      targetCompanyId = null;
    } else if (dropTargetId.startsWith('company-')) {
      targetCompanyId = dropTargetId.replace('company-', '');
    } else {
      return; // Invalid drop target
    }

    // Find the interview and check if it's already in this company
    const interview = interviews.find(i => i.id === interviewId);
    if (!interview || interview.company_id === targetCompanyId) {
      return; // No change needed
    }

    // Assign the interview to the company
    await assignToCompany(interviewId, targetCompanyId);
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
              <p className="text-sm font-medium text-slate-900">{profile?.name || user.email}</p>
              <p className="text-xs text-slate-500">{profile?.email || user.email}</p>
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
        {/* View Mode Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <div className="flex space-x-8 -mb-px">
            <button
              onClick={() => setViewMode('interviews')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'interviews'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Interviews
              <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                {interviews.length}
              </span>
            </button>
            <button
              onClick={() => setViewMode('summaries')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'summaries'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Company Summaries
              <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                {summaries.length}
              </span>
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'analytics'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <PieChart className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
          </div>
        </div>

        {/* Action Bar */}
        {viewMode === 'interviews' && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Interview Transcripts</h2>
              <p className="text-slate-600 mt-1">
                Upload and analyze interview transcripts with AI
              </p>
            </div>

            <div className="flex items-center gap-3">
              {selectedInterviewIds.size > 0 && (
                <button
                  onClick={handleGenerateSummary}
                  disabled={isGeneratingSummary}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BarChart3 className="w-4 h-4" />
                  {isGeneratingSummary ? 'Generating...' : `Generate Summary (${selectedInterviewIds.size})`}
                </button>
              )}
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Upload Transcripts
              </button>
            </div>
          </div>
        )}

        {viewMode === 'summaries' && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Company Summaries</h2>
              <p className="text-slate-600 mt-1">
                Aggregated insights from multiple interviews
              </p>
            </div>
          </div>
        )}

        {/* Upload Section */}
        {viewMode === 'interviews' && showUpload && (
          <div className="mb-6">
            <TranscriptUpload
              onUploadComplete={handleUploadComplete}
              maxFiles={10}
            />
          </div>
        )}

        {/* Interviews Section with Sidebar */}
        {viewMode === 'interviews' && (
          <DndContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6">
              {/* Company Sidebar */}
              <CompanySidebar
                companies={companies}
                interviews={interviews}
                selectedFilter={selectedCompanyFilter}
                onSelectFilter={setSelectedCompanyFilter}
                onCreateCompany={() => {
                  setEditingCompany(null);
                  setShowCompanyModal(true);
                }}
                onEditCompany={handleEditCompany}
                onDeleteCompany={handleDeleteCompany}
              />

              {/* Interviews Grid */}
              <div className="flex-1">
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
                ) : filteredInterviews.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {interviews.length === 0 ? 'No interviews yet' : 'No interviews in this folder'}
                    </h3>
                    <p className="text-slate-600 mb-6">
                      {interviews.length === 0
                        ? 'Upload your first interview transcript to get started with AI analysis'
                        : 'Drag interviews here or select a different folder'}
                    </p>
                    {interviews.length === 0 && (
                      <button
                        onClick={() => setShowUpload(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Upload Transcript
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredInterviews.map((interview) => {
                      const isSelected = selectedInterviewIds.has(interview.id);
                      const canSelect = interview.analysis_status === 'completed';

                      return (
                        <DraggableCard key={interview.id} id={interview.id}>
                          <div
                            className={`bg-white rounded-xl border-2 p-6 pl-10 hover:shadow-lg transition-all ${
                              isSelected
                                ? 'border-green-500 ring-2 ring-green-200'
                                : 'border-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-3 flex-1">
                                {canSelect && (
                                  <button
                                    onClick={() => handleToggleInterviewSelection(interview.id)}
                                    className="mt-0.5 text-slate-400 hover:text-green-600 transition-colors"
                                    title={isSelected ? 'Deselect for summary' : 'Select for summary'}
                                  >
                                    {isSelected ? (
                                      <CheckSquare className="w-5 h-5 text-green-600" />
                                    ) : (
                                      <Square className="w-5 h-5" />
                                    )}
                                  </button>
                                )}
                                <h3 className="font-semibold text-slate-900 flex-1 line-clamp-2">
                                  {interview.title}
                                </h3>
                              </div>
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
                        </DraggableCard>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </DndContext>
        )}

        {/* Company Summaries List */}
        {viewMode === 'summaries' && summariesLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div
                key={i}
                className="bg-white rounded-xl border border-slate-200 p-6 animate-pulse"
              >
                <div className="h-5 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              </div>
            ))}
          </div>
        ) : viewMode === 'summaries' && summaries.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <BarChart3 className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No company summaries yet
            </h3>
            <p className="text-slate-600 mb-6">
              Select multiple completed interviews and generate a summary to see aggregated insights
            </p>
            <button
              onClick={() => setViewMode('interviews')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <FileText className="w-4 h-4" />
              View Interviews
            </button>
          </div>
        ) : viewMode === 'summaries' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaries.map(summary => {
              const data = summary.summary_data as any;
              return (
                <div
                  key={summary.id}
                  className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedSummary(summary)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 flex-1 line-clamp-2">
                      {summary.title}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSummary(summary.id);
                      }}
                      className="ml-2 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Delete summary"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs text-slate-500">
                      Created {formatRelative(summary.created_at)}
                    </div>

                    {data && (
                      <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-600">Interviews:</span>{' '}
                          <span className="font-semibold text-slate-900">
                            {data.totalInterviews || summary.interview_ids?.length || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Workflows:</span>{' '}
                          <span className="font-semibold text-slate-900">
                            {data.topWorkflows?.length || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Pain Points:</span>{' '}
                          <span className="font-semibold text-slate-900">
                            {data.criticalPainPoints?.length || 0}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-600">Tools:</span>{' '}
                          <span className="font-semibold text-slate-900">
                            {data.commonTools?.length || 0}
                          </span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedSummary(summary)}
                      className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View Summary
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}

        {/* Analytics Dashboard */}
        {viewMode === 'analytics' && (
          <AnalyticsDashboard interviews={interviews} loading={interviewsLoading} />
        )}

        {/* Stats Summary */}
        {viewMode === 'interviews' && interviews.length > 0 && (
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

      {/* Company Summary Viewer Modal */}
      {selectedSummary && (
        <CompanySummaryView
          summary={selectedSummary}
          onBack={() => setSelectedSummary(null)}
        />
      )}

      {/* Create/Edit Company Modal */}
      <CreateCompanyModal
        isOpen={showCompanyModal}
        onClose={() => {
          setShowCompanyModal(false);
          setEditingCompany(null);
        }}
        onSubmit={editingCompany ? handleUpdateCompany : handleCreateCompany}
        editingCompany={editingCompany}
      />
    </div>
  );
}

export default App;
