import {
  FileText,
  Building2,
  Users,
  TrendingUp,
  AlertTriangle,
  Wrench,
  GraduationCap,
  Lightbulb,
  FileSearch,
  Download,
} from 'lucide-react';

export type SectionId =
  | 'executive'
  | 'company'
  | 'roles'
  | 'workflows'
  | 'risks'
  | 'technology'
  | 'training'
  | 'recommendations'
  | 'evidence'
  | 'exports';

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'executive', label: 'Executive Summary', icon: FileText },
  { id: 'company', label: 'Company Overview', icon: Building2 },
  { id: 'roles', label: 'Role & Responsibility', icon: Users },
  { id: 'workflows', label: 'Workflow & Process', icon: TrendingUp },
  { id: 'risks', label: 'Risk & Bottlenecks', icon: AlertTriangle },
  { id: 'technology', label: 'Technology & Systems', icon: Wrench },
  { id: 'training', label: 'Training Gaps', icon: GraduationCap },
  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
  { id: 'evidence', label: 'Supporting Evidence', icon: FileSearch },
  { id: 'exports', label: 'Downloads & Exports', icon: Download },
];

interface SummaryNavProps {
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
}

export function SummaryNav({ activeSection, onSectionChange }: SummaryNavProps) {
  return (
    <nav className="w-64 flex-shrink-0 bg-white border-r border-slate-200 overflow-y-auto">
      <div className="py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 border-r-2 border-indigo-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export { navItems };
