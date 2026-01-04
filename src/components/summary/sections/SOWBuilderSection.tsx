import { useState, useMemo } from 'react';
import { ClipboardList, Settings, Download, FileText } from 'lucide-react';
import { RecommendationProfile, SummarySOWConfig, SOWDocument } from '../../../types/analysis';
import { SOWSelectionPanel } from './SOWSelectionPanel';
import { SOWDocumentEditor } from './SOWDocumentEditor';
import { SOWGenerateModal } from './SOWGenerateModal';
import { ScopeOfWorkConfigModal } from './ScopeOfWorkConfigModal';

interface SOWBuilderSectionProps {
  recommendationProfiles: RecommendationProfile[];
  sowConfig: SummarySOWConfig | null;
  onUpdateProfiles?: (profiles: RecommendationProfile[]) => Promise<void>;
  onUpdateSOWConfig?: (config: SummarySOWConfig) => Promise<void>;
}

const createEmptyDocument = (): SOWDocument => ({
  id: `sow-${Date.now()}`,
  executiveSummary: '',
  objective: '',
  phases: [],
  packages: [],
  selectedRecommendationIds: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const defaultSOWConfig: SummarySOWConfig = {
  defaultHourlyRate: 150,
  currency: 'USD',
};

export function SOWBuilderSection({
  recommendationProfiles,
  sowConfig,
  onUpdateProfiles: _onUpdateProfiles,
  onUpdateSOWConfig,
}: SOWBuilderSectionProps) {
  // Note: _onUpdateProfiles is available for future use if needed to update individual profiles
  const effectiveConfig = sowConfig || defaultSOWConfig;

  // Initialize document from config or create new
  const [document, setDocument] = useState<SOWDocument>(() => {
    return effectiveConfig.sowDocument || createEmptyDocument();
  });

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get selected profiles for stats
  const selectedProfiles = useMemo(() => {
    return recommendationProfiles.filter(
      p => document.selectedRecommendationIds.includes(p.id)
    );
  }, [recommendationProfiles, document.selectedRecommendationIds]);

  // Calculate totals
  const totals = useMemo(() => {
    return selectedProfiles.reduce(
      (acc, p) => {
        if (p.deliveryProfile) {
          const hours = p.deliveryProfile.estimatedHours;
          const rate = p.deliveryProfile.hourlyRateOverride ?? effectiveConfig.defaultHourlyRate;
          acc.hours += hours;
          acc.cost += hours * rate;
        }
        return acc;
      },
      { hours: 0, cost: 0 }
    );
  }, [selectedProfiles, effectiveConfig.defaultHourlyRate]);

  const formatCurrency = (amount: number): string => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      CAD: 'C$',
      AUD: 'A$',
    };
    return `${symbols[effectiveConfig.currency] || '$'}${amount.toLocaleString()}`;
  };

  // Save document changes to config
  const handleDocumentChange = async (newDocument: SOWDocument) => {
    setDocument(newDocument);

    if (onUpdateSOWConfig) {
      setIsSaving(true);
      try {
        await onUpdateSOWConfig({
          ...effectiveConfig,
          sowDocument: newDocument,
        });
      } catch (error) {
        console.error('Failed to save SOW document:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Handle selection changes
  const handleSelectionChange = (selectedIds: string[]) => {
    handleDocumentChange({
      ...document,
      selectedRecommendationIds: selectedIds,
      updatedAt: new Date().toISOString(),
    });
  };

  // Count items with delivery profiles
  const configurableCount = recommendationProfiles.filter(
    p => p.deliveryProfile && !p.deliveryProfile.excludeFromEstimate
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <ClipboardList className="w-6 h-6 text-indigo-600" />
            Scope of Work Builder
          </h2>
          <p className="text-slate-600">
            {selectedProfiles.length} of {configurableCount} items selected •
            {' '}{totals.hours} hours • {formatCurrency(totals.cost)} estimated
            {isSaving && <span className="text-indigo-600 ml-2">Saving...</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onUpdateSOWConfig && (
            <button
              onClick={() => setShowConfigModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          )}
          <button
            onClick={() => setShowGenerateModal(true)}
            disabled={selectedProfiles.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Generate SOW
          </button>
        </div>
      </div>

      {/* Empty state */}
      {configurableCount === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No Deliverable Items Yet
          </h3>
          <p className="text-slate-500 max-w-md mx-auto">
            To build a Scope of Work, first configure delivery profiles on your recommendations.
            Go to the Recommendations section and click "Edit" on each item to add delivery details
            (hours, deliverables, work type).
          </p>
        </div>
      ) : (
        /* Main builder layout */
        <div className="flex gap-6 h-[calc(100vh-300px)] min-h-[500px]">
          {/* Left: Selection Panel */}
          <div className="w-80 flex-shrink-0">
            <SOWSelectionPanel
              recommendationProfiles={recommendationProfiles}
              selectedIds={document.selectedRecommendationIds}
              onSelectionChange={handleSelectionChange}
              sowConfig={effectiveConfig}
            />
          </div>

          {/* Right: Document Editor */}
          <div className="flex-1 min-w-0">
            <SOWDocumentEditor
              document={document}
              onDocumentChange={handleDocumentChange}
              recommendationProfiles={recommendationProfiles}
              sowConfig={effectiveConfig}
            />
          </div>
        </div>
      )}

      {/* Config Modal */}
      {onUpdateSOWConfig && (
        <ScopeOfWorkConfigModal
          isOpen={showConfigModal}
          config={sowConfig}
          onSave={async (config) => {
            // Preserve the document when saving config
            await onUpdateSOWConfig({
              ...config,
              sowDocument: document,
            });
            setShowConfigModal(false);
          }}
          onClose={() => setShowConfigModal(false)}
        />
      )}

      {/* Generate Modal */}
      <SOWGenerateModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        document={document}
        recommendationProfiles={recommendationProfiles}
        sowConfig={effectiveConfig}
      />
    </div>
  );
}
