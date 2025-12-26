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
  dragOverCompanyId?: string | null;
}

export function CompanySidebar({
  companies,
  interviews,
  selectedFilter,
  onSelectFilter,
  onCreateCompany,
  onEditCompany,
  onDeleteCompany,
  dragOverCompanyId,
}: CompanySidebarProps) {
  // Calculate interview counts per company
  const interviewCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    let unassignedCount = 0;

    interviews.forEach((interview) => {
      if (interview.company_id) {
        counts[interview.company_id] = (counts[interview.company_id] || 0) + 1;
      } else {
        unassignedCount++;
      }
    });

    return { ...counts, unassigned: unassignedCount, total: interviews.length };
  }, [interviews]);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <button
          onClick={onCreateCompany}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New Company
        </button>
      </div>

      {/* Folder List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
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
          isDragOver={dragOverCompanyId === 'unassigned'}
          onClick={() => onSelectFilter('unassigned')}
        />

        {/* Divider */}
        {companies.length > 0 && (
          <div className="py-2">
            <div className="border-t border-slate-200" />
          </div>
        )}

        {/* Company folders */}
        {companies.map((company) => (
          <CompanyFolder
            key={company.id}
            company={company}
            count={interviewCounts[company.id] || 0}
            isSelected={selectedFilter === company.id}
            isDropTarget={true}
            isDragOver={dragOverCompanyId === company.id}
            onClick={() => onSelectFilter(company.id)}
            onEdit={onEditCompany}
            onDelete={onDeleteCompany}
          />
        ))}

        {/* Empty state */}
        {companies.length === 0 && (
          <div className="text-center py-6 px-4">
            <p className="text-sm text-slate-500">
              Create your first company folder to organize interviews
            </p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-500 text-center">
          Drag interviews to organize
        </p>
      </div>
    </aside>
  );
}
