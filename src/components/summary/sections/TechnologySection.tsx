import { useState } from 'react';
import { Wrench, Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { Badge } from '../../analysis/Badge';
import { ToolUsageGrid } from '../../dashboard/ToolUsageGrid';
import { ToolAggregation } from '../../../types/dashboard';

interface Tool {
  name: string;
  userCount: number;
  roles: string[];
}

interface TechnologySectionProps {
  tools: Tool[];
  analyticsTools?: ToolAggregation[];
  onUpdate?: (tools: Tool[]) => Promise<void>;
}

export function TechnologySection({ tools, analyticsTools, onUpdate }: TechnologySectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  const handleAdd = async () => {
    if (!onUpdate) return;
    const nameInput = document.getElementById('new-tool-name') as HTMLInputElement;
    const userCountInput = document.getElementById('new-tool-usercount') as HTMLInputElement;
    const rolesInput = document.getElementById('new-tool-roles') as HTMLInputElement;
    if (!nameInput?.value.trim()) return;

    const newTool = {
      name: nameInput.value.trim(),
      userCount: parseInt(userCountInput?.value) || 1,
      roles: rolesInput?.value.split(',').map(r => r.trim()).filter(Boolean) || [],
    };
    await onUpdate([...tools, newTool]);
    setIsAdding(false);
  };

  const handleEdit = async (idx: number) => {
    if (!onUpdate) return;
    const nameInput = document.getElementById(`edit-tool-name-${idx}`) as HTMLInputElement;
    const userCountInput = document.getElementById(`edit-tool-usercount-${idx}`) as HTMLInputElement;
    const rolesInput = document.getElementById(`edit-tool-roles-${idx}`) as HTMLInputElement;

    const updated = tools.map((t, i) =>
      i === idx
        ? { ...t, name: nameInput.value.trim(), userCount: parseInt(userCountInput.value) || 1, roles: rolesInput.value.split(',').map(r => r.trim()).filter(Boolean) }
        : t
    );
    await onUpdate(updated);
    setEditingIdx(null);
  };

  const handleDelete = async (idx: number) => {
    if (!onUpdate) return;
    await onUpdate(tools.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2 mb-2">
            <Wrench className="w-6 h-6 text-indigo-600" />
            Technology & Systems
          </h2>
          <p className="text-slate-600">
            {tools.length} tools and systems identified in use.
          </p>
        </div>
        {onUpdate && !isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Tool
          </button>
        )}
      </div>

      {/* Analytics Chart */}
      {analyticsTools && analyticsTools.length > 0 && (
        <ToolUsageGrid tools={analyticsTools} />
      )}

      {/* Add new tool form */}
      {isAdding && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <div className="space-y-3 mb-3">
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Tool name" id="new-tool-name" className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" autoFocus />
              <input type="number" placeholder="User count" id="new-tool-usercount" defaultValue={1} min={1} className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <input type="text" placeholder="Roles (comma-separated)" id="new-tool-roles" className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={handleAdd} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Add</button>
          </div>
        </div>
      )}

      {/* Tools grid */}
      {tools.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Wrench className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500">No tools identified yet.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool, idx) => (
              <div key={idx} className="group">
                {editingIdx === idx ? (
                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="space-y-3 mb-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" defaultValue={tool.name} id={`edit-tool-name-${idx}`} className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" autoFocus />
                        <input type="number" defaultValue={tool.userCount} id={`edit-tool-usercount-${idx}`} min={1} className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <input type="text" defaultValue={tool.roles.join(', ')} id={`edit-tool-roles-${idx}`} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingIdx(null)} className="p-1.5 text-slate-500 hover:bg-white rounded"><X className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(idx)} className="p-1.5 text-indigo-600 hover:bg-white rounded"><Check className="w-4 h-4" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-lg relative">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-slate-900">{tool.name}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="indigo">{tool.userCount} users</Badge>
                        {onUpdate && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setEditingIdx(idx)} className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded"><Edit2 className="w-3 h-3" /></button>
                            <button onClick={() => handleDelete(idx)} className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded"><Trash2 className="w-3 h-3" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.roles.slice(0, 5).map((role, roleIdx) => (
                        <Badge key={roleIdx} variant="purple" className="text-xs">{role}</Badge>
                      ))}
                      {tool.roles.length > 5 && <Badge variant="gray" className="text-xs">+{tool.roles.length - 5} more</Badge>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
