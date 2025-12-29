import { useState } from 'react';
import { X, Merge, Users, Check, ArrowRight } from 'lucide-react';
import { RoleProfile } from '../../../types/analysis';
import { Badge } from '../../analysis/Badge';

interface RoleMergeModalProps {
  sourceProfile: RoleProfile;
  allProfiles: RoleProfile[];
  onMerge: (sourceId: string, targetId: string, mergedTitle: string) => void;
  onClose: () => void;
}

export function RoleMergeModal({ sourceProfile, allProfiles, onMerge, onClose }: RoleMergeModalProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [mergedTitle, setMergedTitle] = useState(sourceProfile.title);

  // Filter out the source profile from available targets
  const availableTargets = allProfiles.filter(p => p.id !== sourceProfile.id);

  const selectedTarget = availableTargets.find(p => p.id === selectedTargetId);

  const handleMerge = () => {
    if (!selectedTargetId || !mergedTitle.trim()) return;
    onMerge(sourceProfile.id, selectedTargetId, mergedTitle.trim());
  };

  // Preview of merged data
  const getMergedPreview = () => {
    if (!selectedTarget) return null;

    const mergedResponsibilities = [...new Set([...sourceProfile.responsibilities, ...selectedTarget.responsibilities])];
    const mergedWorkflows = [...new Set([...sourceProfile.workflows, ...selectedTarget.workflows])];
    const mergedTools = [...new Set([...sourceProfile.tools, ...selectedTarget.tools])];
    const mergedCount = sourceProfile.count + selectedTarget.count;

    return {
      responsibilities: mergedResponsibilities,
      workflows: mergedWorkflows,
      tools: mergedTools,
      count: mergedCount,
    };
  };

  const preview = getMergedPreview();

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Merge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Merge Roles</h2>
              <p className="text-indigo-100 text-sm">
                Combine "{sourceProfile.title}" with another role
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Source Role */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Source Role
            </label>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">{sourceProfile.title}</h3>
                  <p className="text-sm text-purple-600">
                    {sourceProfile.count} interview{sourceProfile.count !== 1 ? 's' : ''} • {sourceProfile.responsibilities.length} responsibilities
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-indigo-600 rotate-90" />
            </div>
          </div>

          {/* Target Role Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Role to Merge Into
            </label>
            {availableTargets.length === 0 ? (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="text-slate-500">No other roles available to merge with.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableTargets.map((target) => (
                  <button
                    key={target.id}
                    onClick={() => {
                      setSelectedTargetId(target.id);
                      // Suggest a merged title
                      if (target.title.toLowerCase() !== sourceProfile.title.toLowerCase()) {
                        setMergedTitle(sourceProfile.title);
                      }
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedTargetId === target.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          selectedTargetId === target.id ? 'bg-indigo-100' : 'bg-slate-100'
                        }`}>
                          <Users className={`w-4 h-4 ${
                            selectedTargetId === target.id ? 'text-indigo-600' : 'text-slate-500'
                          }`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-slate-900">{target.title}</h4>
                          <p className="text-xs text-slate-500">
                            {target.count} interview{target.count !== 1 ? 's' : ''} • {target.responsibilities.length} responsibilities
                          </p>
                        </div>
                      </div>
                      {selectedTargetId === target.id && (
                        <Check className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Merged Title */}
          {selectedTarget && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Title for Merged Role
              </label>
              <input
                type="text"
                value={mergedTitle}
                onChange={(e) => setMergedTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter the title for the merged role"
              />
            </div>
          )}

          {/* Preview */}
          {preview && selectedTarget && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Merged Role Preview
              </label>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">{mergedTitle || 'Merged Role'}</h3>
                    <p className="text-sm text-green-600">
                      {preview.count} interview{preview.count !== 1 ? 's' : ''} (combined)
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-medium text-green-800 mb-1">
                      Responsibilities ({preview.responsibilities.length})
                    </p>
                    <ul className="text-green-700 space-y-0.5">
                      {preview.responsibilities.slice(0, 3).map((r, i) => (
                        <li key={i} className="truncate">• {r}</li>
                      ))}
                      {preview.responsibilities.length > 3 && (
                        <li className="text-green-500">+{preview.responsibilities.length - 3} more</li>
                      )}
                    </ul>
                  </div>

                  {preview.workflows.length > 0 && (
                    <div>
                      <p className="font-medium text-green-800 mb-1">Workflows</p>
                      <div className="flex flex-wrap gap-1">
                        {preview.workflows.slice(0, 4).map((w, i) => (
                          <Badge key={i} variant="green" className="text-[10px]">
                            {w}
                          </Badge>
                        ))}
                        {preview.workflows.length > 4 && (
                          <Badge variant="gray" className="text-[10px]">
                            +{preview.workflows.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {preview.tools.length > 0 && (
                    <div>
                      <p className="font-medium text-green-800 mb-1">Tools</p>
                      <div className="flex flex-wrap gap-1">
                        {preview.tools.slice(0, 4).map((t, i) => (
                          <Badge key={i} variant="blue" className="text-[10px]">
                            {t}
                          </Badge>
                        ))}
                        {preview.tools.length > 4 && (
                          <Badge variant="gray" className="text-[10px]">
                            +{preview.tools.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex-shrink-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleMerge}
            disabled={!selectedTargetId || !mergedTitle.trim()}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Merge className="w-4 h-4" />
            Merge Roles
          </button>
        </div>
      </div>
    </div>
  );
}
