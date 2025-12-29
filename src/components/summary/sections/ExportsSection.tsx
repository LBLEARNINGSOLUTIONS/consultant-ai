import { useState } from 'react';
import { Download, FileJson, FileText, Loader2 } from 'lucide-react';
import { CompanySummary } from '../../../types/database';
import { generateCompanySummaryPDF, downloadPDF } from '../../../services/pdfService';

interface ExportsSectionProps {
  summary: CompanySummary;
}

export function ExportsSection({ summary }: ExportsSectionProps) {
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${summary.title.replace(/\s+/g, '_')}_summary.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      const blob = await generateCompanySummaryPDF(summary);
      const filename = `${summary.title.replace(/\s+/g, '_')}_summary.pdf`;
      downloadPDF(blob, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsExportingPDF(false);
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
          Export this summary in various formats for sharing and reporting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PDF Export */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <FileText className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">PDF Report</h3>
              <p className="text-sm text-slate-600 mt-1">
                Generate a professional PDF report suitable for stakeholder presentations and documentation.
              </p>
              <button
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download PDF
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* JSON Export */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileJson className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">JSON Data</h3>
              <p className="text-sm text-slate-600 mt-1">
                Export raw data in JSON format for integration with other tools or further analysis.
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

      {/* Future exports placeholder */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 border-dashed p-6 text-center">
        <p className="text-slate-500">
          More export formats coming soon: PowerPoint, Word, Excel
        </p>
      </div>
    </div>
  );
}
