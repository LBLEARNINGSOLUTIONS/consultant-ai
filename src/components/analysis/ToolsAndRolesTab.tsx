import { useState } from 'react';
import { Tool, Role } from '../../types/analysis';
import { Badge } from './Badge';
import { Wrench, Users, Briefcase, Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import { EditableField } from './EditableField';
import { ArrayFieldEditor } from './ArrayFieldEditor';
import { nanoid } from 'nanoid';

interface ToolsAndRolesTabProps {
  tools: Tool[];
  roles: Role[];
  onUpdateTools: (tools: Tool[]) => void;
  onUpdateRoles: (roles: Role[]) => void;
}

export function ToolsAndRolesTab({ tools, roles, onUpdateTools, onUpdateRoles }: ToolsAndRolesTabProps) {
  // Edit state for tools
  const [editingToolId, setEditingToolId] = useState<string | null>(null);
  const [editedTool, setEditedTool] = useState<Tool | null>(null);
  const [isAddingTool, setIsAddingTool] = useState(false);
  const [newTool, setNewTool] = useState<Tool>({
    id: '',
    name: '',
    purpose: '',
    usedBy: [],
    frequency: '',
  });

  // Edit state for roles
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editedRole, setEditedRole] = useState<Role | null>(null);
  const [isAddingRole, setIsAddingRole] = useState(false);
  const [newRole, setNewRole] = useState<Role>({
    id: '',
    title: '',
    responsibilities: [],
    workflows: [],
    tools: [],
  });

  // Tool handlers
  const handleEditTool = (tool: Tool) => {
    setEditingToolId(tool.id);
    setEditedTool({ ...tool });
  };

  const handleSaveTool = () => {
    if (!editedTool) return;
    const updated = tools.map(t =>
      t.id === editedTool.id ? editedTool : t
    );
    onUpdateTools(updated);
    setEditingToolId(null);
    setEditedTool(null);
  };

  const handleDeleteTool = (id: string) => {
    if (confirm('Are you sure you want to delete this tool?')) {
      onUpdateTools(tools.filter(t => t.id !== id));
    }
  };

  const handleAddTool = () => {
    const toolToAdd = { ...newTool, id: nanoid() };
    onUpdateTools([...tools, toolToAdd]);
    setIsAddingTool(false);
    setNewTool({
      id: '',
      name: '',
      purpose: '',
      usedBy: [],
      frequency: '',
    });
  };

  // Role handlers
  const handleEditRole = (role: Role) => {
    setEditingRoleId(role.id);
    setEditedRole({ ...role });
  };

  const handleSaveRole = () => {
    if (!editedRole) return;
    const updated = roles.map(r =>
      r.id === editedRole.id ? editedRole : r
    );
    onUpdateRoles(updated);
    setEditingRoleId(null);
    setEditedRole(null);
  };

  const handleDeleteRole = (id: string) => {
    if (confirm('Are you sure you want to delete this role?')) {
      onUpdateRoles(roles.filter(r => r.id !== id));
    }
  };

  const handleAddRole = () => {
    const roleToAdd = { ...newRole, id: nanoid() };
    onUpdateRoles([...roles, roleToAdd]);
    setIsAddingRole(false);
    setNewRole({
      id: '',
      title: '',
      responsibilities: [],
      workflows: [],
      tools: [],
    });
  };

  // Tool Form component
  const ToolForm = ({
    tool,
    onChange,
    onSave,
    onCancel,
    isNew = false
  }: {
    tool: Tool;
    onChange: (t: Tool) => void;
    onSave: () => void;
    onCancel: () => void;
    isNew?: boolean;
  }) => (
    <div className="bg-white p-5 rounded-xl border-2 border-indigo-300 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditableField
          label="Tool Name"
          value={tool.name}
          onChange={(value) => onChange({ ...tool, name: value })}
          placeholder="e.g., Salesforce, Excel, Slack..."
          required
        />
        <EditableField
          label="Usage Frequency"
          value={tool.frequency}
          onChange={(value) => onChange({ ...tool, frequency: value })}
          placeholder="e.g., Daily, Weekly, As needed..."
        />
      </div>

      <EditableField
        label="Purpose"
        value={tool.purpose}
        onChange={(value) => onChange({ ...tool, purpose: value })}
        placeholder="What is this tool used for?"
        multiline
      />

      <ArrayFieldEditor
        label="Used By"
        values={tool.usedBy}
        onChange={(values) => onChange({ ...tool, usedBy: values })}
        placeholder="Add role that uses this tool..."
      />

      <ArrayFieldEditor
        label="Integrations"
        values={tool.integrations || []}
        onChange={(values) => onChange({ ...tool, integrations: values })}
        placeholder="Add connected systems..."
      />

      <EditableField
        label="Limitations"
        value={tool.limitations || ''}
        onChange={(value) => onChange({ ...tool, limitations: value })}
        placeholder="Any issues or limitations with this tool..."
        multiline
      />

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!tool.name.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isNew ? 'Add Tool' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  // Role Form component
  const RoleForm = ({
    role,
    onChange,
    onSave,
    onCancel,
    isNew = false
  }: {
    role: Role;
    onChange: (r: Role) => void;
    onSave: () => void;
    onCancel: () => void;
    isNew?: boolean;
  }) => (
    <div className="bg-white p-5 rounded-xl border-2 border-purple-300 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EditableField
          label="Job Title"
          value={role.title}
          onChange={(value) => onChange({ ...role, title: value })}
          placeholder="e.g., Operations Manager, Sales Rep..."
          required
        />
        <EditableField
          label="Team Size"
          value={role.teamSize?.toString() || ''}
          onChange={(value) => onChange({ ...role, teamSize: value ? parseInt(value) || undefined : undefined })}
          placeholder="Number of people in this role..."
        />
      </div>

      <ArrayFieldEditor
        label="Responsibilities"
        values={role.responsibilities}
        onChange={(values) => onChange({ ...role, responsibilities: values })}
        placeholder="Add responsibility..."
      />

      <ArrayFieldEditor
        label="Involved in Workflows"
        values={role.workflows}
        onChange={(values) => onChange({ ...role, workflows: values })}
        placeholder="Add workflow name..."
      />

      <ArrayFieldEditor
        label="Tools Used"
        values={role.tools}
        onChange={(values) => onChange({ ...role, tools: values })}
        placeholder="Add tool name..."
      />

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!role.title.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isNew ? 'Add Role' : 'Save Changes'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-500" />
            Tools & Software ({tools.length})
          </h3>
          {!isAddingTool && (
            <button
              onClick={() => setIsAddingTool(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Tool
            </button>
          )}
        </div>

        {/* Add new tool form */}
        {isAddingTool && (
          <ToolForm
            tool={newTool}
            onChange={setNewTool}
            onSave={handleAddTool}
            onCancel={() => setIsAddingTool(false)}
            isNew
          />
        )}

        {tools.length === 0 && !isAddingTool ? (
          <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-500">No tools identified. Add one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool) => (
              editingToolId === tool.id && editedTool ? (
                <div key={tool.id} className="md:col-span-2">
                  <ToolForm
                    tool={editedTool}
                    onChange={setEditedTool}
                    onSave={handleSaveTool}
                    onCancel={() => {
                      setEditingToolId(null);
                      setEditedTool(null);
                    }}
                  />
                </div>
              ) : (
                <div
                  key={tool.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-slate-900 text-lg">{tool.name}</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="indigo">{tool.frequency}</Badge>
                      <button
                        onClick={() => handleEditTool(tool)}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTool(tool.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-4">{tool.purpose}</p>

                  {tool.usedBy.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-slate-700 block mb-2">
                        Used By:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tool.usedBy.map((user, idx) => (
                          <Badge key={idx} variant="purple" className="text-xs">
                            {user}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {tool.integrations && tool.integrations.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-slate-700 block mb-2">
                        Integrations:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {tool.integrations.map((integration, idx) => (
                          <Badge key={idx} variant="blue" className="text-xs">
                            {integration}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {tool.limitations && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-xs font-semibold text-red-900 mb-1">Limitations:</p>
                      <p className="text-xs text-red-700">{tool.limitations}</p>
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Roles Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Roles & Responsibilities ({roles.length})
          </h3>
          {!isAddingRole && (
            <button
              onClick={() => setIsAddingRole(true)}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          )}
        </div>

        {/* Add new role form */}
        {isAddingRole && (
          <RoleForm
            role={newRole}
            onChange={setNewRole}
            onSave={handleAddRole}
            onCancel={() => setIsAddingRole(false)}
            isNew
          />
        )}

        {roles.length === 0 && !isAddingRole ? (
          <div className="text-center py-8 bg-white rounded-lg border border-slate-200">
            <p className="text-slate-500">No roles identified. Add one to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {roles.map((role) => (
              editingRoleId === role.id && editedRole ? (
                <RoleForm
                  key={role.id}
                  role={editedRole}
                  onChange={setEditedRole}
                  onSave={handleSaveRole}
                  onCancel={() => {
                    setEditingRoleId(null);
                    setEditedRole(null);
                  }}
                />
              ) : (
                <div
                  key={role.id}
                  className="bg-white p-6 rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-100 p-2 rounded-lg">
                        <Briefcase className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-lg">{role.title}</h4>
                        {role.teamSize && (
                          <p className="text-sm text-slate-500">Team size: {role.teamSize}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEditRole(role)}
                        className="p-2 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Responsibilities */}
                  {role.responsibilities.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-slate-700 mb-2">
                        Responsibilities:
                      </h5>
                      <ul className="space-y-1.5">
                        {role.responsibilities.map((responsibility, idx) => (
                          <li key={idx} className="flex gap-2 text-sm text-slate-600">
                            <span className="text-indigo-500 flex-shrink-0">•</span>
                            <span>{responsibility}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Workflows */}
                  {role.workflows.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-slate-700 mb-2">
                        Involved in Workflows:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {role.workflows.map((workflow, idx) => (
                          <Badge key={idx} variant="blue">
                            {workflow}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tools */}
                  {role.tools.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-slate-700 mb-2">
                        Tools Used:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {role.tools.map((tool, idx) => (
                          <Badge key={idx} variant="indigo">
                            {tool}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
