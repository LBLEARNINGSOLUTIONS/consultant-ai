import { Check } from 'lucide-react';
import { ToolAggregation } from '../../types/dashboard';

interface ToolUsageGridProps {
  tools: ToolAggregation[];
  limit?: number;
}

export function ToolUsageGrid({ tools, limit = 10 }: ToolUsageGridProps) {
  const topTools = tools.slice(0, limit);

  // Get all unique roles across tools
  const allRoles = new Set<string>();
  topTools.forEach(tool => {
    tool.usedBy.forEach(role => allRoles.add(role));
  });
  const roles = Array.from(allRoles).slice(0, 8); // Limit columns

  if (topTools.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Tool Usage by Role</h3>
        <p className="text-sm text-slate-500">No tools found</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Tool Usage by Role</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-3 font-medium text-slate-600">Tool</th>
              {roles.map(role => (
                <th
                  key={role}
                  className="text-center py-2 px-2 font-medium text-slate-600 whitespace-nowrap"
                  title={role}
                >
                  <span className="block max-w-[80px] truncate">{role}</span>
                </th>
              ))}
              <th className="text-center py-2 px-3 font-medium text-slate-600">Mentions</th>
            </tr>
          </thead>
          <tbody>
            {topTools.map((tool, index) => (
              <tr
                key={index}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="py-2 px-3">
                  <div>
                    <span className="font-medium text-slate-900">{tool.name}</span>
                    <p className="text-xs text-slate-500 truncate max-w-[200px]">{tool.purpose}</p>
                  </div>
                </td>
                {roles.map(role => (
                  <td key={role} className="text-center py-2 px-2">
                    {tool.usedBy.some(r => r.toLowerCase() === role.toLowerCase()) ? (
                      <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                ))}
                <td className="text-center py-2 px-3 font-medium text-slate-900">{tool.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
