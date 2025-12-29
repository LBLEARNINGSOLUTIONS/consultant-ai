import { useState } from 'react';
import { Building2, Calendar, Edit2, Check, X } from 'lucide-react';
import { CompanySummaryData } from '../../../types/analysis';
import { formatDate } from '../../../utils/dateFormatters';

interface CompanyContext {
  description?: string;
  industry?: string;
  companySize?: string;
  projectGoals?: string;
}

interface CompanyOverviewSectionProps {
  data: CompanySummaryData;
  companyContext: CompanyContext;
  createdAt: string;
  onUpdateContext?: (context: CompanyContext) => Promise<void>;
}

export function CompanyOverviewSection({
  data,
  companyContext,
  createdAt,
  onUpdateContext,
}: CompanyOverviewSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContext, setEditContext] = useState<CompanyContext>(companyContext);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onUpdateContext) return;
    setSaving(true);
    try {
      await onUpdateContext(editContext);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditContext(companyContext);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            Company Overview
          </h2>
          <p className="text-slate-600">
            Project context and interview scope.
          </p>
        </div>
        {onUpdateContext && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit Details
          </button>
        )}
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          Project Metadata
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Interviews Analyzed</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{data.totalInterviews}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Date Range</p>
            <p className="text-sm font-medium text-slate-900 mt-1">
              {data.dateRange?.earliest && data.dateRange?.latest
                ? `${formatDate(data.dateRange.earliest)} - ${formatDate(data.dateRange.latest)}`
                : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Summary Generated</p>
            <p className="text-sm font-medium text-slate-900 mt-1">{formatDate(createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Unique Roles</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{Object.keys(data.roleDistribution).length}</p>
          </div>
        </div>
      </div>

      {/* Editable Company Context */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Company Context</h3>
          {isEditing && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Company Description
              </label>
              <textarea
                value={editContext.description || ''}
                onChange={(e) => setEditContext({ ...editContext, description: e.target.value })}
                placeholder="Brief description of the company and its business..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={editContext.industry || ''}
                  onChange={(e) => setEditContext({ ...editContext, industry: e.target.value })}
                  placeholder="e.g., Healthcare, Finance, Manufacturing"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Company Size
                </label>
                <input
                  type="text"
                  value={editContext.companySize || ''}
                  onChange={(e) => setEditContext({ ...editContext, companySize: e.target.value })}
                  placeholder="e.g., 50-200 employees, Enterprise"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Project Goals
              </label>
              <textarea
                value={editContext.projectGoals || ''}
                onChange={(e) => setEditContext({ ...editContext, projectGoals: e.target.value })}
                placeholder="What are the main objectives of this analysis project?"
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {companyContext.description || companyContext.industry || companyContext.companySize || companyContext.projectGoals ? (
              <>
                {companyContext.description && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Description</p>
                    <p className="text-slate-700">{companyContext.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  {companyContext.industry && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Industry</p>
                      <p className="text-slate-700">{companyContext.industry}</p>
                    </div>
                  )}
                  {companyContext.companySize && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Company Size</p>
                      <p className="text-slate-700">{companyContext.companySize}</p>
                    </div>
                  )}
                </div>
                {companyContext.projectGoals && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Project Goals</p>
                    <p className="text-slate-700">{companyContext.projectGoals}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-slate-500 italic">
                No company context added yet. Click "Edit Details" to add information about the company.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
