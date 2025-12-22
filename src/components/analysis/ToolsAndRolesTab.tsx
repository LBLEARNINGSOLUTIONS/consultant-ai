import { Tool, Role } from '../../types/analysis';
import { Badge } from './Badge';
import { Wrench, Users, Briefcase } from 'lucide-react';

interface ToolsAndRolesTabProps {
  tools: Tool[];
  roles: Role[];
  onUpdateTools: (tools: Tool[]) => void;
  onUpdateRoles: (roles: Role[]) => void;
}

export function ToolsAndRolesTab({ tools, roles }: ToolsAndRolesTabProps) {
  if (tools.length === 0 && roles.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">No tools or roles identified in this interview.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Tools Section */}
      {tools.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-500" />
            Tools & Software ({tools.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900 text-lg">{tool.name}</h4>
                  <Badge variant="indigo">{tool.frequency}</Badge>
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
            ))}
          </div>
        </div>
      )}

      {/* Roles Section */}
      {roles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Roles & Responsibilities ({roles.length})
          </h3>
          <div className="space-y-4">
            {roles.map((role) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
