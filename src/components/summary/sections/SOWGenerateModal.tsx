import { useState } from 'react';
import { X, Download, FileText, Globe, Loader2 } from 'lucide-react';
import { SOWDocument, RecommendationProfile, SummarySOWConfig } from '../../../types/analysis';
import { formatCurrency } from '../../../utils/formatters';
import { generateEnhancedSOWHTML, downloadSOWHTML } from '../../../services/sowExportService';

interface SOWGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: SOWDocument;
  recommendationProfiles: RecommendationProfile[];
  sowConfig: SummarySOWConfig;
}

type ExportFormat = 'html' | 'pdf';

export function SOWGenerateModal({
  isOpen,
  onClose,
  document,
  recommendationProfiles,
  sowConfig,
}: SOWGenerateModalProps) {
  const [format, setFormat] = useState<ExportFormat>('html');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const selectedProfiles = recommendationProfiles.filter(
    p => document.selectedRecommendationIds.includes(p.id)
  );

  const totals = selectedProfiles.reduce(
    (acc, p) => {
      if (p.deliveryProfile) {
        const hours = p.deliveryProfile.estimatedHours;
        const rate = p.deliveryProfile.hourlyRateOverride ?? sowConfig.defaultHourlyRate;
        acc.hours += hours;
        acc.cost += hours * rate;
      }
      return acc;
    },
    { hours: 0, cost: 0 }
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const html = generateEnhancedSOWHTML({
        recommendationProfiles,
        sowConfig,
        sowDocument: document,
      });

      const projectName = sowConfig.projectName || 'Scope_of_Work';
      const sanitizedName = projectName.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
      const date = new Date().toISOString().split('T')[0];
      const filename = `${sanitizedName}_${date}.html`;

      if (format === 'html') {
        downloadSOWHTML(html, filename);
      } else {
        // For PDF, we'll open in a new window and let the user print to PDF
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          setTimeout(() => printWindow.print(), 500);
        }
      }

      onClose();
    } catch (error) {
      console.error('Error generating SOW:', error);
      alert('Failed to generate SOW. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Check what's included
  const hasExecutiveSummary = document.executiveSummary.trim().length > 0;
  const hasObjective = document.objective.trim().length > 0;
  const hasPhases = document.phases.length > 0;
  const hasPackages = document.packages.length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Generate Scope of Work</h2>
              <p className="text-sm text-slate-500">Export your SOW document</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-slate-700 mb-3">Document Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Items</span>
                <span className="font-medium text-slate-900">{selectedProfiles.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Total Hours</span>
                <span className="font-medium text-slate-900">{totals.hours}</span>
              </div>
              <div className="flex justify-between col-span-2">
                <span className="text-slate-500">Estimated Total</span>
                <span className="font-bold text-indigo-600">{formatCurrency(totals.cost, sowConfig.currency)}</span>
              </div>
            </div>
          </div>

          {/* Sections included */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-2">Sections Included</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${hasExecutiveSummary ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className={hasExecutiveSummary ? 'text-slate-700' : 'text-slate-400'}>
                  Executive Summary
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${hasObjective ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className={hasObjective ? 'text-slate-700' : 'text-slate-400'}>
                  Objective
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${hasPhases ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className={hasPhases ? 'text-slate-700' : 'text-slate-400'}>
                  Implementation Plan ({document.phases.length} phases)
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${hasPackages ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className={hasPackages ? 'text-slate-700' : 'text-slate-400'}>
                  Package Options ({document.packages.length} packages)
                </span>
              </div>
            </div>
          </div>

          {/* Format selection */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-2">Export Format</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('html')}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                  format === 'html'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Globe className={`w-5 h-5 ${format === 'html' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className={`text-sm font-medium ${format === 'html' ? 'text-indigo-900' : 'text-slate-700'}`}>
                    HTML
                  </div>
                  <div className="text-xs text-slate-500">Self-contained file</div>
                </div>
              </button>
              <button
                onClick={() => setFormat('pdf')}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
                  format === 'pdf'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <FileText className={`w-5 h-5 ${format === 'pdf' ? 'text-indigo-600' : 'text-slate-400'}`} />
                <div className="text-left">
                  <div className={`text-sm font-medium ${format === 'pdf' ? 'text-indigo-900' : 'text-slate-700'}`}>
                    PDF
                  </div>
                  <div className="text-xs text-slate-500">Print to PDF</div>
                </div>
              </button>
            </div>
          </div>

          {/* Warnings */}
          {(!hasExecutiveSummary || !hasObjective) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
              Some sections are empty. Consider adding content for a more complete SOW.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || selectedProfiles.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Generate {format.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
