import { useState } from 'react';
import { FileText, Target, Calendar, Package } from 'lucide-react';
import { SOWDocument, SOWPhase, SOWPackage, RecommendationProfile, SummarySOWConfig } from '../../../types/analysis';
import { SOWExecutiveSummaryTab } from './SOWExecutiveSummaryTab';
import { SOWObjectiveTab } from './SOWObjectiveTab';
import { SOWImplementationPlanTab } from './SOWImplementationPlanTab';
import { SOWPackageOptionsTab } from './SOWPackageOptionsTab';

type TabId = 'executive' | 'objective' | 'implementation' | 'packages';

interface SOWDocumentEditorProps {
  document: SOWDocument;
  onDocumentChange: (doc: SOWDocument) => void;
  recommendationProfiles: RecommendationProfile[];
  sowConfig: SummarySOWConfig;
}

const tabs: { id: TabId; label: string; icon: typeof FileText }[] = [
  { id: 'executive', label: 'Executive Summary', icon: FileText },
  { id: 'objective', label: 'Objective', icon: Target },
  { id: 'implementation', label: 'Implementation Plan', icon: Calendar },
  { id: 'packages', label: 'Packages', icon: Package },
];

export function SOWDocumentEditor({
  document,
  onDocumentChange,
  recommendationProfiles,
  sowConfig,
}: SOWDocumentEditorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('executive');

  const selectedProfiles = recommendationProfiles.filter(
    p => document.selectedRecommendationIds.includes(p.id)
  );

  const updateDocument = (updates: Partial<SOWDocument>) => {
    onDocumentChange({
      ...document,
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleExecutiveSummaryChange = (executiveSummary: string) => {
    updateDocument({ executiveSummary });
  };

  const handleObjectiveChange = (objective: string) => {
    updateDocument({ objective });
  };

  const handlePhasesChange = (phases: SOWPhase[]) => {
    updateDocument({ phases });
  };

  const handlePackagesChange = (packages: SOWPackage[]) => {
    updateDocument({ packages });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Tab navigation */}
      <div className="flex border-b border-slate-200">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'executive' && (
          <SOWExecutiveSummaryTab
            value={document.executiveSummary}
            onChange={handleExecutiveSummaryChange}
            selectedProfiles={selectedProfiles}
            sowConfig={sowConfig}
          />
        )}
        {activeTab === 'objective' && (
          <SOWObjectiveTab
            value={document.objective}
            onChange={handleObjectiveChange}
          />
        )}
        {activeTab === 'implementation' && (
          <SOWImplementationPlanTab
            phases={document.phases}
            onChange={handlePhasesChange}
            selectedProfiles={selectedProfiles}
            sowConfig={sowConfig}
          />
        )}
        {activeTab === 'packages' && (
          <SOWPackageOptionsTab
            packages={document.packages}
            onChange={handlePackagesChange}
            selectedProfiles={selectedProfiles}
            sowConfig={sowConfig}
          />
        )}
      </div>
    </div>
  );
}
