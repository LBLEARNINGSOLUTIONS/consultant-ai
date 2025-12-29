import { useState } from 'react';
import { X, Users, Plus, Trash2 } from 'lucide-react';
import { RoleProfile } from '../../../types/analysis';

interface RoleEditModalProps {
  profile: RoleProfile;
  onSave: (updatedProfile: RoleProfile) => void;
  onClose: () => void;
}

export function RoleEditModal({ profile, onSave, onClose }: RoleEditModalProps) {
  const [title, setTitle] = useState(profile.title);
  const [responsibilities, setResponsibilities] = useState<string[]>([...profile.responsibilities]);
  const [workflows, setWorkflows] = useState<string[]>([...profile.workflows]);
  const [tools, setTools] = useState<string[]>([...profile.tools]);

  // New item inputs
  const [newResponsibility, setNewResponsibility] = useState('');
  const [newWorkflow, setNewWorkflow] = useState('');
  const [newTool, setNewTool] = useState('');

  const handleSave = () => {
    if (!title.trim()) return;

    const updatedProfile: RoleProfile = {
      ...profile,
      title: title.trim(),
      responsibilities: responsibilities.filter(r => r.trim()),
      workflows: workflows.filter(w => w.trim()),
      tools: tools.filter(t => t.trim()),
    };

    onSave(updatedProfile);
  };

  const addResponsibility = () => {
    if (newResponsibility.trim()) {
      setResponsibilities([...responsibilities, newResponsibility.trim()]);
      setNewResponsibility('');
    }
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities(responsibilities.filter((_, i) => i !== index));
  };

  const addWorkflow = () => {
    if (newWorkflow.trim()) {
      setWorkflows([...workflows, newWorkflow.trim()]);
      setNewWorkflow('');
    }
  };

  const removeWorkflow = (index: number) => {
    setWorkflows(workflows.filter((_, i) => i !== index));
  };

  const addTool = () => {
    if (newTool.trim()) {
      setTools([...tools, newTool.trim()]);
      setNewTool('');
    }
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Edit Role</h2>
              <p className="text-purple-100 text-sm">
                Modify role details and responsibilities
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
          {/* Role Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Role Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter role title"
            />
          </div>

          {/* Responsibilities */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Responsibilities ({responsibilities.length})
            </label>
            <div className="space-y-2 mb-3">
              {responsibilities.map((resp, idx) => (
                <div key={idx} className="flex items-center gap-2 group">
                  <input
                    type="text"
                    value={resp}
                    onChange={(e) => {
                      const updated = [...responsibilities];
                      updated[idx] = e.target.value;
                      setResponsibilities(updated);
                    }}
                    className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeResponsibility(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newResponsibility}
                onChange={(e) => setNewResponsibility(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addResponsibility)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add new responsibility..."
              />
              <button
                onClick={addResponsibility}
                disabled={!newResponsibility.trim()}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Workflows */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Workflows ({workflows.length})
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {workflows.map((workflow, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm group"
                >
                  <span>{workflow}</span>
                  <button
                    onClick={() => removeWorkflow(idx)}
                    className="p-0.5 hover:bg-indigo-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newWorkflow}
                onChange={(e) => setNewWorkflow(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addWorkflow)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add new workflow..."
              />
              <button
                onClick={addWorkflow}
                disabled={!newWorkflow.trim()}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tools */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tools & Systems ({tools.length})
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tools.map((tool, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm group"
                >
                  <span>{tool}</span>
                  <button
                    onClick={() => removeTool(idx)}
                    className="p-0.5 hover:bg-blue-200 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTool}
                onChange={(e) => setNewTool(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, addTool)}
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Add new tool..."
              />
              <button
                onClick={addTool}
                disabled={!newTool.trim()}
                className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Note about auto-generated data */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Dependencies (inputs from/outputs to), issues, and training needs are automatically derived from interview data and cannot be edited directly here.
            </p>
          </div>
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
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
