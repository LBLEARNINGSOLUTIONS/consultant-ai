import { LayoutGrid, List } from 'lucide-react';

export type ViewMode = 'tile' | 'list';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
      <button
        onClick={() => onViewModeChange('tile')}
        className={`p-1.5 rounded transition-colors ${
          viewMode === 'tile'
            ? 'bg-white shadow-sm text-slate-700'
            : 'text-slate-400 hover:text-slate-600'
        }`}
        title="Tile view"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewModeChange('list')}
        className={`p-1.5 rounded transition-colors ${
          viewMode === 'list'
            ? 'bg-white shadow-sm text-slate-700'
            : 'text-slate-400 hover:text-slate-600'
        }`}
        title="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
