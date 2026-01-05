import { useState, lazy, Suspense, useMemo } from 'react';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { useAuth } from './hooks/useAuth';
import { useInterviews } from './hooks/useInterviews';
import { useCompanySummary } from './hooks/useCompanySummary';
import { useCompanies } from './hooks/useCompanies';
import { useInterviewFilters } from './hooks/useInterviewFilters';
import { useToast } from './contexts/ToastContext';
import { Login } from './components/auth/Login';
import { TranscriptUpload } from './components/upload/TranscriptUpload';
import { CompanySidebar, CompanyFilter } from './components/companies/CompanySidebar';
import { CreateCompanyModal } from './components/companies/CreateCompanyModal';
import { InterviewSearchBar } from './components/filters/InterviewSearchBar';
import { UploadResult } from './services/uploadService';
import { Interview, CompanySummary, Company } from './types/database';
import { FileText, LogOut, Plus, BarChart3, PieChart, Merge } from 'lucide-react';
import { VirtualizedInterviewGrid } from './components/interviews/VirtualizedInterviewGrid';
import { SummaryCard } from './components/summaries/SummaryCard';
import { SummaryStatsModal } from './components/summary/SummaryStatsModal';
import { CompanySummaryData } from './types/analysis';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LoadingFallback } from './components/ui/LoadingFallback';
import { InterviewCardSkeleton, SummaryCardSkeleton } from './components/ui/Skeleton';

// Lazy load heavy components with preload functions
const AnalysisViewerImport = () => import('./components/analysis/AnalysisViewer');
const CompanySummaryViewImport = () => import('./components/summary/CompanySummaryView');
const AnalyticsDashboardImport = () => import('./components/dashboard/AnalyticsDashboard');

const AnalysisViewer = lazy(AnalysisViewerImport);
const CompanySummaryView = lazy(CompanySummaryViewImport);
const AnalyticsDashboard = lazy(AnalyticsDashboardImport);

// Preload functions for hover prefetching
export const preloadAnalysisViewer = () => AnalysisViewerImport();
export const preloadCompanySummaryView = () => CompanySummaryViewImport();
export const preloadAnalyticsDashboard = () => AnalyticsDashboardImport();

function App() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { addToast } = useToast();
  const {
    interviews,
    loading: interviewsLoading,
    createInterview,
    deleteInterview,
    analyzeInterview,
    updateInterview,
    assignToCompany,
    mergeInterviews,
  } = useInterviews(user?.id);

  const {
    summaries,
    loading: summariesLoading,
    generateSummary,
    updateSummary,
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
  const [editingSummaryStats, setEditingSummaryStats] = useState<CompanySummary | null>(null);

  // Filter interviews by selected company and search/filters - must be before early returns to maintain hooks order
  const {
    filters,
    filteredInterviews,
    setSearchQuery,
    setStatuses,
    setDateRange,
    setSeverities,
    setTools,
    clearAllFilters,
    clearFilter,
    availableTools,
    hasActiveFilters,
  } = useInterviewFilters({
    interviews,
    companyFilter: selectedCompanyFilter,
  });

  // Memoize interview statistics to avoid recalculating on every render
  const interviewStats = useMemo(() => ({
    total: interviews.length,
    completed: interviews.filter(i => i.analysis_status === 'completed').length,
    analyzing: interviews.filter(i => i.analysis_status === 'analyzing').length + analyzing.size,
    failed: interviews.filter(i => i.analysis_status === 'failed').length,
  }), [interviews, analyzing.size]);

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
    return <Login />;
  }

  const handleUploadComplete = async (results: UploadResult[]) => {
    setShowUpload(false);
    let successCount = 0;
    let failCount = 0;

    for (const result of results) {
      if (result.error || !result.text) {
        console.error(`Failed to upload ${result.filename}:`, result.error);
        failCount++;
        continue;
      }

      // Create interview in database with metadata
      const { data: interview, error: createError } = await createInterview({
        user_id: user.id,
        title: result.filename.replace(/\.txt$/i, ''),
        transcript_text: result.text,
        analysis_status: 'pending',
        // Interview metadata
        interview_date: result.interviewDate || null,
        interviewee_name: result.intervieweeName || null,
        interviewee_role: result.intervieweeRole || null,
        department: result.department || null,
      });

      // Start analysis
      if (interview && !createError) {
        setAnalyzing(prev => new Set(prev).add(interview.id));
        const analysisResult = await analyzeInterview(interview.id, result.text);
        setAnalyzing(prev => {
          const next = new Set(prev);
          next.delete(interview.id);
          return next;
        });
        if (analysisResult?.error) {
          addToast(`Analysis failed for "${result.filename}"`, 'error');
        } else {
          successCount++;
        }
      } else if (createError) {
        console.error('Failed to create interview:', createError);
        failCount++;
      }
    }

    if (successCount > 0) {
      addToast(`${successCount} interview${successCount > 1 ? 's' : ''} uploaded and analyzed`, 'success');
    }
    if (failCount > 0) {
      addToast(`${failCount} upload${failCount > 1 ? 's' : ''} failed`, 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      await deleteInterview(id);
      addToast('Interview deleted', 'success');
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
      addToast('Please select at least one interview to generate a summary', 'warning');
      return;
    }

    const title = prompt('Enter a title for this company summary:');
    if (!title) return;

    setIsGeneratingSummary(true);
    try {
      const selectedInterviews = interviews.filter(i => selectedInterviewIds.has(i.id));
      const { error } = await generateSummary(title, selectedInterviews);

      if (error) {
        addToast(`Failed to generate summary: ${typeof error === 'string' ? error : 'Unknown error'}`, 'error');
      } else {
        setSelectedInterviewIds(new Set());
        setViewMode('summaries');
        addToast('Company summary generated successfully', 'success');
      }
    } catch (error) {
      addToast(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleMergeInterviews = async () => {
    if (selectedInterviewIds.size < 2) {
      addToast('Select at least 2 interviews to merge', 'warning');
      return;
    }

    const title = prompt('Enter a title for the merged interview:');
    if (!title) return;

    const selectedInterviews = interviews.filter(i => selectedInterviewIds.has(i.id));
    const { error } = await mergeInterviews(title, selectedInterviews);

    if (error) {
      addToast(`Failed to merge interviews: ${error}`, 'error');
    } else {
      // Ask to delete source interviews
      if (window.confirm('Merge successful! Delete the original interviews?')) {
        for (const id of selectedInterviewIds) {
          await deleteInterview(id);
        }
      }
      setSelectedInterviewIds(new Set());
      addToast('Interviews merged successfully', 'success');
    }
  };

  const handleDeleteSummary = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this summary?')) {
      await deleteSummary(id);
      addToast('Summary deleted', 'success');
    }
  };

  // Company handlers
  const handleCreateCompany = async (name: string, color: string, description?: string) => {
    if (!user) return;
    await createCompany({
      user_id: user.id,
      name,
      color,
      description: description || null,
    });
    addToast(`Company "${name}" created`, 'success');
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
    addToast('Company updated', 'success');
  };

  const handleDeleteCompany = async (company: Company) => {
    if (window.confirm(`Are you sure you want to delete "${company.name}"? Interviews will be moved to Unassigned.`)) {
      await deleteCompany(company.id);
      // If we were viewing this company, reset to "All"
      if (selectedCompanyFilter === company.id) {
        setSelectedCompanyFilter(null);
      }
      addToast(`Company "${company.name}" deleted`, 'success');
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
    let targetName = 'Unassigned';

    if (dropTargetId === 'unassigned') {
      targetCompanyId = null;
      targetName = 'Unassigned';
    } else if (dropTargetId.startsWith('company-')) {
      targetCompanyId = dropTargetId.replace('company-', '');
      const company = companies.find(c => c.id === targetCompanyId);
      targetName = company?.name || 'company';
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
    addToast(`Interview moved to "${targetName}"`, 'success');
  };

  // Retry failed analysis
  const handleRetryAnalysis = async (interview: Interview) => {
    if (!interview.transcript_text) {
      addToast('No transcript text available to analyze', 'error');
      return;
    }

    setAnalyzing(prev => new Set(prev).add(interview.id));
    const result = await analyzeInterview(interview.id, interview.transcript_text);
    setAnalyzing(prev => {
      const next = new Set(prev);
      next.delete(interview.id);
      return next;
    });

    if (result?.error) {
      addToast(`Analysis failed: ${result.error}`, 'error');
    } else {
      addToast('Analysis completed successfully', 'success');
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
              {selectedInterviewIds.size >= 2 && (
                <button
                  onClick={handleMergeInterviews}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  <Merge className="w-4 h-4" />
                  Merge ({selectedInterviewIds.size})
                </button>
              )}
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
              <div className="flex-1 space-y-4">
                {/* Search and Filter Bar */}
                <InterviewSearchBar
                  filters={filters}
                  onSearchChange={setSearchQuery}
                  onStatusChange={setStatuses}
                  onDateRangeChange={setDateRange}
                  onSeverityChange={setSeverities}
                  onToolsChange={setTools}
                  onClearAll={clearAllFilters}
                  onClearFilter={clearFilter}
                  availableTools={availableTools}
                  hasActiveFilters={hasActiveFilters}
                  resultCount={filteredInterviews.length}
                  totalCount={interviews.length}
                />

                {interviewsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <InterviewCardSkeleton key={i} />
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
                  <VirtualizedInterviewGrid
                    interviews={filteredInterviews}
                    selectedInterviewIds={selectedInterviewIds}
                    analyzingIds={analyzing}
                    onToggleSelect={handleToggleInterviewSelection}
                    onDelete={handleDelete}
                    onView={setSelectedInterview}
                    onRename={async (id, newTitle) => {
                      await updateInterview(id, { title: newTitle });
                      addToast('Interview renamed', 'success');
                    }}
                    onRetryAnalysis={handleRetryAnalysis}
                  />
                )}
              </div>
            </div>
          </DndContext>
        )}

        {/* Company Summaries List */}
        {viewMode === 'summaries' && summariesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <SummaryCardSkeleton key={i} />
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
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            onMouseEnter={preloadCompanySummaryView}
          >
            {summaries.map(summary => (
              <SummaryCard
                key={summary.id}
                summary={summary}
                onView={() => setSelectedSummary(summary)}
                onDelete={() => handleDeleteSummary(summary.id)}
                onEditStats={() => setEditingSummaryStats(summary)}
                onRename={async (newTitle) => {
                  const result = await updateSummary(summary.id, { title: newTitle });
                  if (result.error) {
                    throw new Error(result.error);
                  }
                }}
              />
            ))}
          </div>
        ) : null}

        {/* Analytics Dashboard */}
        {viewMode === 'analytics' && (
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback />}>
              <AnalyticsDashboard interviews={interviews} loading={interviewsLoading} />
            </Suspense>
          </ErrorBoundary>
        )}

        {/* Stats Summary */}
        {viewMode === 'interviews' && interviewStats.total > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Total Interviews</p>
              <p className="text-2xl font-bold text-slate-900">{interviewStats.total}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{interviewStats.completed}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Analyzing</p>
              <p className="text-2xl font-bold text-yellow-600">{interviewStats.analyzing}</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4">
              <p className="text-sm text-slate-600 mb-1">Failed</p>
              <p className="text-2xl font-bold text-red-600">{interviewStats.failed}</p>
            </div>
          </div>
        )}
      </main>

      {/* Analysis Viewer Modal */}
      {selectedInterview && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <AnalysisViewer
              interview={selectedInterview}
              onClose={() => setSelectedInterview(null)}
              onUpdate={async (updates) => {
                await updateInterview(selectedInterview.id, updates);
                // Update local state
                setSelectedInterview({ ...selectedInterview, ...updates });
              }}
            />
          </Suspense>
        </ErrorBoundary>
      )}

      {/* Company Summary Viewer Modal */}
      {selectedSummary && (
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <CompanySummaryView
              summary={selectedSummary}
              interviews={interviews.filter(i => selectedSummary.interview_ids?.includes(i.id))}
              onBack={() => setSelectedSummary(null)}
              onUpdate={updateSummary}
            />
          </Suspense>
        </ErrorBoundary>
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

      {/* Summary Stats Modal */}
      {editingSummaryStats && (
        <SummaryStatsModal
          isOpen={!!editingSummaryStats}
          onClose={() => setEditingSummaryStats(null)}
          data={editingSummaryStats.summary_data as unknown as CompanySummaryData}
          onUpdate={async (updates) => {
            const currentData = editingSummaryStats.summary_data as unknown as CompanySummaryData;
            const newData = { ...currentData, ...updates };
            const result = await updateSummary(editingSummaryStats.id, { summary_data: newData as any });
            if (result.error) {
              throw new Error(result.error);
            }
          }}
          linkedInterviews={interviews
            .filter(i => editingSummaryStats.interview_ids?.includes(i.id))
            .map(i => ({ id: i.id, title: i.title }))}
        />
      )}
    </div>
  );
}

export default App;
