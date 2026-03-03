import { Plus } from 'lucide-react';
import { Company, Interview } from '../../types/database';
import { CompanyFolder, SpecialFolder } from './CompanyFolder';
import { useMemo } from 'react';

// Filter values: null = all, 'unassigned' = no company, string = specific company ID
export type CompanyFilter = string | null | 'unassigned';

interface CompanySidebarProps {
  companies: Company[];
  interviews: Interview[];
  selectedFilter: CompanyFilter;
  onSelectFilter: (filter: CompanyFilter) => void;
  onCreateCompany: () => void;
  onEditCompany: (company: Company) => void;
  onDeleteCompany: (company: Company) => void;
}

export function CompanySidebar({
  companies,
  interviews,
  selectedFilter,
  onSelectFilter,
  onCreateCompany,
  onEditCompany,
  onDeleteCompany,
}: CompanySidebarProps) {
  // Calculate interview counts per company
  const interviewCounts = useMemo(() => {
    const counts: Record<string, number> = {
      unassigned: 0,
      total: interviews.length,
    };

    interviews.forEach((interview) => {
      if (interview.company_id) {
        counts[interview.company_id] = (counts[interview.company_id] || 0) + 1;
      } else {
        counts.unassigned++;
      }
    });

    return counts;
  }, [interviews]);

  return (
    <aside className="w-64 bg-white border border-slate-200/60 rounded-2xl flex flex-col overflow-hidden shadow-soft">
      {/* Header */}
      <div className="p-4 border-b border-slate-100">
        <button
          onClick={onCreateCompany}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all text-sm font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Company
        </button>
      </div>

      {/* Folder List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {/* All Interviews */}
        <SpecialFolder
          type="all"
          count={interviewCounts.total}
          isSelected={selectedFilter === null}
          onClick={() => onSelectFilter(null)}
        />

        {/* Unassigned */}
        <SpecialFolder
          type="unassigned"
          count={interviewCounts.unassigned}
          isSelected={selectedFilter === 'unassigned'}
          onClick={() => onSelectFilter('unassigned')}
        />

        {/* Divider */}
        {companies.length > 0 && (
          <div className="py-2">
            <div className="border-t border-slate-100" />
          </div>
        )}

        {/* Company folders */}
        {companies.map((company) => (
          <CompanyFolder
            key={company.id}
            company={company}
            count={interviewCounts[company.id] || 0}
            isSelected={selectedFilter === company.id}
            onClick={() => onSelectFilter(company.id)}
            onEdit={onEditCompany}
            onDelete={onDeleteCompany}
          />
        ))}

        {/* Empty state */}
        {companies.length === 0 && (
          <div className="text-center py-6 px-4">
            <p className="text-sm text-slate-400">
              Create your first company folder to organize interviews
            </p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <p className="text-xs text-slate-400 text-center">
          Drag interviews to organize
        </p>
      </div>
    </aside>
  );
}
