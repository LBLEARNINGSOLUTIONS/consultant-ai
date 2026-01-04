import { useState } from 'react';
import { Download, FileJson, FileText, Globe, Loader2, FileCheck, ClipboardList } from 'lucide-react';
import { CompanySummary, Interview } from '../../../types/database';
import { RoleProfile, WorkflowProfile, ToolProfile, TrainingGapProfile, RecommendationProfile, SummarySOWConfig } from '../../../types/analysis';
import { generateCompanySummaryPDF, generateExecutiveSummaryPDF, downloadPDF } from '../../../services/pdfService';
import { generateHTMLExport, downloadHTML } from '../../../services/htmlExportService';
import { generateSOWHTML, downloadSOWHTML } from '../../../services/sowExportService';

interface ExportsSectionProps {
  summary: CompanySummary;
  interviews?: Interview[];
  roleProfiles?: RoleProfile[];
  workflowProfiles?: WorkflowProfile[];
  toolProfiles?: ToolProfile[];
  trainingGapProfiles?: TrainingGapProfile[];
  recommendationProfiles?: RecommendationProfile[];
  sowConfig?: SummarySOWConfig | null;
}

// Utility function for generating date-stamped filenames
function generateExportFilename(
  title: string,
  exportType: 'full' | 'executive' | 'html' | 'json' | 'sow',
  extension: string
): string {
  const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const typeLabels = {
    full: 'Full_Report',
    executive: 'Executive_Summary',
    html: 'Portal_Export',
    json: 'Data_Export',
    sow: 'Scope_of_Work',
  };

  return `${sanitizedTitle}_${typeLabels[exportType]}_${date}.${extension}`;
}

export function ExportsSection({
  summary,
  interviews,
  roleProfiles,
  workflowProfiles,
  toolProfiles,
  trainingGapProfiles,
  recommendationProfiles,
  sowConfig,
}: ExportsSectionProps) {
  const [isExportingFullPDF, setIsExportingFullPDF] = useState(false);
  const [isExportingExecPDF, setIsExportingExecPDF] = useState(false);
  const [isExportingHTML, setIsExportingHTML] = useState(false);
  const [isExportingSOW, setIsExportingSOW] = useState(false);
  const [lastExported, setLastExported] = useState<string | null>(null);

  // Check if SOW export is available (has config and at least one configured recommendation)
  const hasSOWData = sowConfig && recommendationProfiles?.some(
    p => p.deliveryProfile && !p.deliveryProfile.excludeFromEstimate
  );

  const handleExportFullPDF = async () => {
    setIsExportingFullPDF(true);
    try {
      const blob = await generateCompanySummaryPDF(summary);
      const filename = generateExportFilename(summary.title, 'full', 'pdf');
      downloadPDF(blob, filename);
      setLastExported(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExportingFullPDF(false);
    }
  };

  const handleExportExecutivePDF = async () => {
    setIsExportingExecPDF(true);
    try {
      const blob = await generateExecutiveSummaryPDF(summary);
      const filename = generateExportFilename(summary.title, 'executive', 'pdf');
      downloadPDF(blob, filename);
      setLastExported(filename);
    } catch (error) {
      console.error('Error generating executive summary PDF:', error);
      alert('Failed to generate executive summary. Please try again.');
    } finally {
      setIsExportingExecPDF(false);
    }
  };

  const handleExportHTML = async () => {
    setIsExportingHTML(true);
    try {
      const html = generateHTMLExport(summary, {
        interviews,
        roleProfiles,
        workflowProfiles,
        toolProfiles,
        trainingGapProfiles,
        recommendationProfiles,
      });
      const filename = generateExportFilename(summary.title, 'html', 'html');
      downloadHTML(html, filename);
      setLastExported(filename);
    } catch (error) {
      console.error('Error generating HTML:', error);
      alert('Failed to generate HTML export. Please try again.');
    } finally {
      setIsExportingHTML(false);
    }
  };

  const handleExportJSON = () => {
    const exportData = {
      ...summary,
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        format: 'ConsultantAI Summary Export',
      },
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const filename = generateExportFilename(summary.title, 'json', 'json');
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setLastExported(filename);
  };

  const handleExportSOW = async () => {
    if (!sowConfig || !recommendationProfiles) return;

    setIsExportingSOW(true);
    try {
      const html = generateSOWHTML({
        summary,
        recommendationProfiles,
        sowConfig,
      });
      const filename = generateExportFilename(summary.title, 'sow', 'html');
      downloadSOWHTML(html, filename);
      setLastExported(filename);
    } catch (error) {
      console.error('Error generating SOW:', error);
      alert('Failed to generate Scope of Work. Please try again.');
    } finally {
      setIsExportingSOW(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <Download className="w-6 h-6 text-slate-600" />
          Downloads & Exports
        </h2>
        <p className="text-slate-600">
          Export this summary in various formats for sharing, presenting, and archiving.
        </p>
      </div>

      {/* PDF Reports Section */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          PDF Reports
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full PDF Report */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <FileText className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Full Report</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Complete analysis with all sections, charts, and detailed findings. Best for comprehensive documentation.
                </p>
                <button
                  onClick={handleExportFullPDF}
                  disabled={isExportingFullPDF}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExportingFullPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Full PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Executive Summary PDF */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <FileCheck className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Executive Summary</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Condensed 1-2 page overview with key metrics, top findings, and priority recommendations. Ideal for executives.
                </p>
                <button
                  onClick={handleExportExecutivePDF}
                  disabled={isExportingExecPDF}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExportingExecPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download Summary PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scope of Work Section */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Scope of Work
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* SOW HTML Export */}
          <div className={`bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow ${!hasSOWData ? 'opacity-60' : ''}`}>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <ClipboardList className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Scope of Work</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Professional scope of work document with line items, hours, rates, and totals. Ready for client proposals.
                </p>
                {hasSOWData ? (
                  <button
                    onClick={handleExportSOW}
                    disabled={isExportingSOW}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExportingSOW ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        Download SOW
                      </>
                    )}
                  </button>
                ) : (
                  <p className="mt-4 text-sm text-slate-500 italic">
                    Configure delivery profiles in the Scope of Work section to enable export.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other Formats Section */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Other Formats
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* HTML Portal Export */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Globe className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">HTML Portal</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Self-contained HTML file with embedded styling. Perfect for client portals or hosting on internal sites.
                </p>
                <button
                  onClick={handleExportHTML}
                  disabled={isExportingHTML}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExportingHTML ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Download HTML
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* JSON Data Export */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileJson className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">Raw Data</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Complete data in JSON format for integration with other tools, backups, or custom analysis.
                </p>
                <button
                  onClick={handleExportJSON}
                  className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Naming Info */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-slate-200 rounded-lg">
            <FileText className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-slate-700 text-sm">File Naming Convention</h4>
            <p className="text-xs text-slate-500 mt-1">
              All exports are date-stamped: <code className="bg-slate-200 px-1 py-0.5 rounded">{summary.title.replace(/[^a-zA-Z0-9]/g, '_')}_[Type]_{new Date().toISOString().split('T')[0]}.ext</code>
            </p>
            {lastExported && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <FileCheck className="w-3 h-3" />
                Last exported: {lastExported}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
