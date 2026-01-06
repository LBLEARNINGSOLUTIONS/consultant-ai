import { useState, useEffect } from 'react';
import { FileText, AlertTriangle, TrendingUp, Lightbulb, Edit2, Plus, Trash2 } from 'lucide-react';
import { CompanySummaryData } from '../../../types/analysis';
import { formatDate } from '../../../utils/dateFormatters';
import { nanoid } from 'nanoid';

interface ExecutiveSummary {
  narrativeSummary?: string;
  keyFindings?: string[];
  topRisks?: Array<{ id: string; text: string; rank: number }>;
  topOpportunities?: Array<{ id: string; text: string; rank: number }>;
  maturityLevel?: 1 | 2 | 3 | 4 | 5;
  maturityNotes?: string;
}

interface ExecutiveSummarySectionProps {
  data: CompanySummaryData;
  companyName?: string;
  auditDate?: string;
  executiveSummary?: ExecutiveSummary;
  recommendations: Array<{ id: string; text: string; priority: 'high' | 'medium' | 'low' }>;
  onUpdate?: (executiveSummary: ExecutiveSummary) => Promise<void>;
}

const maturityLabels: Record<number, { label: string; color: string; description: string }> = {
  1: { label: 'Initial', color: 'bg-red-500', description: 'Ad-hoc processes, inconsistent practices' },
  2: { label: 'Developing', color: 'bg-orange-500', description: 'Some documented processes, basic controls' },
  3: { label: 'Defined', color: 'bg-yellow-500', description: 'Standardized processes, moderate consistency' },
  4: { label: 'Managed', color: 'bg-blue-500', description: 'Measured and controlled processes' },
  5: { label: 'Optimizing', color: 'bg-green-500', description: 'Continuous improvement, industry-leading' },
};

export function ExecutiveSummarySection({
  data,
  companyName,
  auditDate,
  executiveSummary = {},
  recommendations,
  onUpdate
}: ExecutiveSummarySectionProps) {
  const [isEditingNarrative, setIsEditingNarrative] = useState(false);
  const [narrativeText, setNarrativeText] = useState(executiveSummary.narrativeSummary || '');

  const [isEditingFindings, setIsEditingFindings] = useState(false);
  const [findings, setFindings] = useState<string[]>(executiveSummary.keyFindings || []);
  const [newFinding, setNewFinding] = useState('');

  const [isEditingRisks, setIsEditingRisks] = useState(false);
  const [risks, setRisks] = useState<Array<{ id: string; text: string; rank: number }>>(
    executiveSummary.topRisks || []
  );
  const [newRisk, setNewRisk] = useState('');

  const [isEditingOpportunities, setIsEditingOpportunities] = useState(false);
  const [opportunities, setOpportunities] = useState<Array<{ id: string; text: string; rank: number }>>(
    executiveSummary.topOpportunities || []
  );
  const [newOpportunity, setNewOpportunity] = useState('');

  const [maturityLevel, setMaturityLevel] = useState<1 | 2 | 3 | 4 | 5 | undefined>(executiveSummary.maturityLevel);
  const [maturityNotes, setMaturityNotes] = useState(executiveSummary.maturityNotes || '');
  const [isEditingMaturity, setIsEditingMaturity] = useState(false);

  // Sync local state with prop changes (e.g., when data is refreshed from server)
  useEffect(() => {
    if (!isEditingNarrative) {
      setNarrativeText(executiveSummary.narrativeSummary || '');
    }
  }, [executiveSummary.narrativeSummary, isEditingNarrative]);

  useEffect(() => {
    if (!isEditingFindings) {
      setFindings(executiveSummary.keyFindings || []);
    }
  }, [executiveSummary.keyFindings, isEditingFindings]);

  useEffect(() => {
    if (!isEditingRisks) {
      setRisks(executiveSummary.topRisks || []);
    }
  }, [executiveSummary.topRisks, isEditingRisks]);

  useEffect(() => {
    if (!isEditingOpportunities) {
      setOpportunities(executiveSummary.topOpportunities || []);
    }
  }, [executiveSummary.topOpportunities, isEditingOpportunities]);

  useEffect(() => {
    if (!isEditingMaturity) {
      setMaturityLevel(executiveSummary.maturityLevel);
      setMaturityNotes(executiveSummary.maturityNotes || '');
    }
  }, [executiveSummary.maturityLevel, executiveSummary.maturityNotes, isEditingMaturity]);

  const highPriorityRecs = recommendations.filter(r => r.priority === 'high').slice(0, 3);

  // Save handlers
  const handleSaveNarrative = async () => {
    if (!onUpdate) return;
    await onUpdate({ ...executiveSummary, narrativeSummary: narrativeText });
    setIsEditingNarrative(false);
  };

  const handleSaveFindings = async () => {
    if (!onUpdate) return;
    await onUpdate({ ...executiveSummary, keyFindings: findings });
    setIsEditingFindings(false);
  };

  const handleAddFinding = () => {
    if (!newFinding.trim()) return;
    setFindings([...findings, newFinding.trim()]);
    setNewFinding('');
  };

  const handleRemoveFinding = (idx: number) => {
    setFindings(findings.filter((_, i) => i !== idx));
  };

  const handleSaveRisks = async () => {
    if (!onUpdate) return;
    await onUpdate({ ...executiveSummary, topRisks: risks });
    setIsEditingRisks(false);
  };

  const handleAddRisk = () => {
    if (!newRisk.trim() || risks.length >= 5) return;
    setRisks([...risks, { id: nanoid(), text: newRisk.trim(), rank: risks.length + 1 }]);
    setNewRisk('');
  };

  const handleRemoveRisk = (id: string) => {
    const updated = risks.filter(r => r.id !== id).map((r, i) => ({ ...r, rank: i + 1 }));
    setRisks(updated);
  };

  const handleSaveOpportunities = async () => {
    if (!onUpdate) return;
    await onUpdate({ ...executiveSummary, topOpportunities: opportunities });
    setIsEditingOpportunities(false);
  };

  const handleAddOpportunity = () => {
    if (!newOpportunity.trim() || opportunities.length >= 5) return;
    setOpportunities([...opportunities, { id: nanoid(), text: newOpportunity.trim(), rank: opportunities.length + 1 }]);
    setNewOpportunity('');
  };

  const handleRemoveOpportunity = (id: string) => {
    const updated = opportunities.filter(o => o.id !== id).map((o, i) => ({ ...o, rank: i + 1 }));
    setOpportunities(updated);
  };

  const handleSaveMaturity = async () => {
    if (!onUpdate) return;
    await onUpdate({ ...executiveSummary, maturityLevel, maturityNotes });
    setIsEditingMaturity(false);
  };

  return (
    <div className="space-y-8">
      {/* Header with Company Name and Date */}
      <div className="border-b border-slate-200 pb-6">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          Executive Summary
        </h2>
        <div className="flex items-center gap-4 text-sm text-slate-600">
          {companyName && <span className="font-medium text-slate-900">{companyName}</span>}
          {auditDate && <span>Audit Date: {formatDate(auditDate)}</span>}
          <span>{data.totalInterviews} interviews analyzed</span>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Interviews</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{data.totalInterviews}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Workflows</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{data.topWorkflows.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Critical Issues</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{data.criticalPainPoints.length}</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-slate-200 shadow-sm">
          <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">High-Risk Handoffs</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">{data.highRiskHandoffs.length}</p>
        </div>
      </div>

      {/* Narrative Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
          {onUpdate && !isEditingNarrative && (
            <button
              onClick={() => setIsEditingNarrative(true)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditingNarrative ? (
          <div className="space-y-3">
            <textarea
              value={narrativeText}
              onChange={(e) => setNarrativeText(e.target.value)}
              placeholder="Write a 3-5 paragraph narrative summary of the audit findings, key insights, and overall assessment..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none min-h-[200px]"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setIsEditingNarrative(false); setNarrativeText(executiveSummary.narrativeSummary || ''); }}
                className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNarrative}
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : narrativeText ? (
          <div className="prose prose-slate max-w-none">
            {narrativeText.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-slate-700 leading-relaxed mb-4 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 italic">
            {onUpdate ? 'Click edit to add a narrative summary...' : 'No narrative summary provided.'}
          </p>
        )}
      </div>

      {/* Key Findings */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Key Findings
          </h3>
          {onUpdate && !isEditingFindings && (
            <button
              onClick={() => setIsEditingFindings(true)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditingFindings ? (
          <div className="space-y-3">
            <ul className="space-y-2">
              {findings.map((finding, idx) => (
                <li key={idx} className="flex items-start gap-2 group">
                  <span className="text-amber-500 mt-0.5 font-bold">•</span>
                  <span className="flex-1 text-slate-700">{finding}</span>
                  <button
                    onClick={() => handleRemoveFinding(idx)}
                    className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                type="text"
                value={newFinding}
                onChange={(e) => setNewFinding(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFinding()}
                placeholder="Add a key finding..."
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={handleAddFinding}
                disabled={!newFinding.trim()}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setIsEditingFindings(false); setFindings(executiveSummary.keyFindings || []); }}
                className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFindings}
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : findings.length > 0 ? (
          <ul className="space-y-2">
            {findings.map((finding, idx) => (
              <li key={idx} className="text-slate-700 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5 font-bold">•</span>
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-400 italic">
            {onUpdate ? 'Click edit to add key findings...' : 'No key findings documented.'}
          </p>
        )}
      </div>

      {/* Top 5 Risks & Opportunities Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top 5 Risks */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Top 5 Risks
            </h3>
            {onUpdate && !isEditingRisks && (
              <button
                onClick={() => setIsEditingRisks(true)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {isEditingRisks ? (
            <div className="space-y-3">
              <ol className="space-y-2">
                {risks.map((risk, idx) => (
                  <li key={risk.id} className="flex items-start gap-2 group">
                    <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-slate-700 pt-0.5">{risk.text}</span>
                    <button
                      onClick={() => handleRemoveRisk(risk.id)}
                      className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ol>
              {risks.length < 5 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newRisk}
                    onChange={(e) => setNewRisk(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddRisk()}
                    placeholder="Add a risk..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                  />
                  <button
                    onClick={handleAddRisk}
                    disabled={!newRisk.trim()}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => { setIsEditingRisks(false); setRisks(executiveSummary.topRisks || []); }}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:bg-red-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRisks}
                  className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : risks.length > 0 ? (
            <ol className="space-y-2">
              {risks.map((risk, idx) => (
                <li key={risk.id} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 pt-0.5">{risk.text}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-slate-500 italic">
              {onUpdate ? 'Click edit to add top risks...' : 'No risks documented.'}
            </p>
          )}
        </div>

        {/* Top 5 Opportunities */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Top 5 Opportunities
            </h3>
            {onUpdate && !isEditingOpportunities && (
              <button
                onClick={() => setIsEditingOpportunities(true)}
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-100 rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {isEditingOpportunities ? (
            <div className="space-y-3">
              <ol className="space-y-2">
                {opportunities.map((opp, idx) => (
                  <li key={opp.id} className="flex items-start gap-2 group">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-slate-700 pt-0.5">{opp.text}</span>
                    <button
                      onClick={() => handleRemoveOpportunity(opp.id)}
                      className="p-1 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ol>
              {opportunities.length < 5 && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newOpportunity}
                    onChange={(e) => setNewOpportunity(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddOpportunity()}
                    placeholder="Add an opportunity..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                  <button
                    onClick={handleAddOpportunity}
                    disabled={!newOpportunity.trim()}
                    className="px-3 py-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => { setIsEditingOpportunities(false); setOpportunities(executiveSummary.topOpportunities || []); }}
                  className="px-3 py-1.5 text-sm text-slate-600 hover:bg-emerald-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveOpportunities}
                  className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : opportunities.length > 0 ? (
            <ol className="space-y-2">
              {opportunities.map((opp, idx) => (
                <li key={opp.id} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {idx + 1}
                  </span>
                  <span className="text-slate-700 pt-0.5">{opp.text}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-slate-500 italic">
              {onUpdate ? 'Click edit to add top opportunities...' : 'No opportunities documented.'}
            </p>
          )}
        </div>
      </div>

      {/* Maturity/Readiness Snapshot */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Readiness & Maturity Assessment</h3>
          {onUpdate && !isEditingMaturity && (
            <button
              onClick={() => setIsEditingMaturity(true)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {isEditingMaturity ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setMaturityLevel(level as 1 | 2 | 3 | 4 | 5)}
                  className={`flex-1 py-3 px-2 rounded-lg border-2 transition-all ${
                    maturityLevel === level
                      ? `${maturityLabels[level].color} text-white border-transparent`
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-center">
                    <span className="text-lg font-bold">{level}</span>
                    <p className={`text-xs mt-1 ${maturityLevel === level ? 'text-white/90' : 'text-slate-600'}`}>
                      {maturityLabels[level].label}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            {maturityLevel && (
              <p className="text-sm text-slate-600 text-center">
                {maturityLabels[maturityLevel].description}
              </p>
            )}
            <textarea
              value={maturityNotes}
              onChange={(e) => setMaturityNotes(e.target.value)}
              placeholder="Add notes about the maturity assessment..."
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsEditingMaturity(false);
                  setMaturityLevel(executiveSummary.maturityLevel);
                  setMaturityNotes(executiveSummary.maturityNotes || '');
                }}
                className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMaturity}
                className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        ) : maturityLevel ? (
          <div className="space-y-4">
            {/* Maturity Scale Visual */}
            <div className="relative">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <div
                    key={level}
                    className={`flex-1 h-3 rounded-full ${
                      level <= maturityLevel ? maturityLabels[level].color : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-slate-500">Initial</span>
                <span className="text-xs text-slate-500">Optimizing</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-medium ${maturityLabels[maturityLevel].color}`}>
                Level {maturityLevel}: {maturityLabels[maturityLevel].label}
              </span>
              <span className="text-sm text-slate-600">{maturityLabels[maturityLevel].description}</span>
            </div>

            {maturityNotes && (
              <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded-lg">
                {maturityNotes}
              </p>
            )}
          </div>
        ) : (
          <p className="text-slate-400 italic text-center py-4">
            {onUpdate ? 'Click edit to set the maturity level...' : 'Maturity assessment not completed.'}
          </p>
        )}
      </div>

      {/* Top Recommendations Preview */}
      {recommendations.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-indigo-500" />
            Priority Recommendations
          </h3>
          {highPriorityRecs.length > 0 ? (
            <ul className="space-y-2">
              {highPriorityRecs.map((rec, idx) => (
                <li key={idx} className="text-slate-700 flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5 font-bold">•</span>
                  <span>{rec.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 italic">
              No high-priority recommendations yet.
            </p>
          )}
          <p className="text-sm text-slate-500 mt-3">
            View all {recommendations.length} recommendations in the Recommendations section.
          </p>
        </div>
      )}
    </div>
  );
}
