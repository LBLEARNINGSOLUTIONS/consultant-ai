import { useState } from 'react';
import { Interview } from '../../types/database';
import {
  Workflow,
  PainPoint,
  Tool,
  Role,
  TrainingGap,
  HandoffRisk
} from '../../types/analysis';
import { WorkflowsTab } from './WorkflowsTab';
import { PainPointsTab } from './PainPointsTab';
import { ToolsAndRolesTab } from './ToolsAndRolesTab';
import { X, FileText, Download } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatters';
import { generateInterviewPDF, downloadPDF } from '../../services/pdfService';

interface AnalysisViewerProps {
  interview: Interview;
  onClose: () => void;
  onUpdate: (updates: Partial<Interview>) => void;
}

type TabType = 'workflows' | 'painpoints' | 'tools';

export function AnalysisViewer({ interview, onClose, onUpdate }: AnalysisViewerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('workflows');
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Parse JSONB data
  const workflows = (interview.workflows as any as Workflow[]) || [];
  const painPoints = (interview.pain_points as any as PainPoint[]) || [];
  const tools = (interview.tools as any as Tool[]) || [];
  const roles = (interview.roles as any as Role[]) || [];
  const trainingGaps = (interview.training_gaps as any as TrainingGap[]) || [];
  const handoffRisks = (interview.handoff_risks as any as HandoffRisk[]) || [];

  const handleExportJSON = () => {
    const data = {
      interview: interview.title,
      analyzed_at: interview.analyzed_at,
      workflows,
      painPoints,
      tools,
      roles,
      trainingGaps,
      handoffRisks
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${interview.title.replace(/\s+/g, '_')}_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const blob = await generateInterviewPDF(interview);
      const filename = `${interview.title.replace(/\s+/g, '_')}_analysis.pdf`;
      downloadPDF(blob, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const tabs = [
    { id: 'workflows' as const, label: 'Workflows', count: workflows.length },
    { id: 'painpoints' as const, label: 'Pain Points', count: painPoints.length },
    { id: 'tools' as const, label: 'Tools & Roles', count: tools.length + roles.length },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-6 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-6 h-6 flex-shrink-0" />
                <h2 className="text-2xl font-bold truncate">{interview.title}</h2>
              </div>
              <p className="text-indigo-100 text-sm">
                Analyzed {interview.analyzed_at ? formatDate(interview.analyzed_at) : 'recently'}
              </p>
            </div>

            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="px-3 py-2 hover:bg-indigo-500 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export as PDF"
              >
                <Download className="w-4 h-4" />
                {isExportingPDF ? 'Generating...' : 'PDF'}
              </button>
              <button
                onClick={handleExportJSON}
                className="px-3 py-2 hover:bg-indigo-500 rounded-lg transition-colors text-sm font-medium flex items-center gap-2"
                title="Export as JSON"
              >
                <Download className="w-4 h-4" />
                JSON
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-indigo-500 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 bg-white px-6 flex-shrink-0">
          <div className="flex space-x-8 -mb-px">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {activeTab === 'workflows' && (
            <WorkflowsTab
              workflows={workflows}
              handoffRisks={handoffRisks}
              onUpdateWorkflows={(updated) => onUpdate({ workflows: updated as any })}
            />
          )}

          {activeTab === 'painpoints' && (
            <PainPointsTab
              painPoints={painPoints}
              trainingGaps={trainingGaps}
              onUpdatePainPoints={(updated) => onUpdate({ pain_points: updated as any })}
              onUpdateTrainingGaps={(updated) => onUpdate({ training_gaps: updated as any })}
            />
          )}

          {activeTab === 'tools' && (
            <ToolsAndRolesTab
              tools={tools}
              roles={roles}
              onUpdateTools={(updated) => onUpdate({ tools: updated as any })}
              onUpdateRoles={(updated) => onUpdate({ roles: updated as any })}
            />
          )}
        </div>
      </div>
    </div>
  );
}
