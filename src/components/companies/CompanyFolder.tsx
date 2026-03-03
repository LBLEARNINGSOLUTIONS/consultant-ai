import { Folder, FolderOpen, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Company } from '../../types/database';

interface CompanyFolderProps {
  company: Company;
  count: number;
  isSelected: boolean;
  onClick: () => void;
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
}

export function CompanyFolder({
  company,
  count,
  isSelected,
  onClick,
  onEdit,
  onDelete,
}: CompanyFolderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { isOver, setNodeRef } = useDroppable({
    id: `company-${company.id}`,
    data: { companyId: company.id },
  });

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const FolderIcon = isSelected ? FolderOpen : Folder;

  return (
    <div
      ref={setNodeRef}
      className={`
        group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all
        ${isSelected ? 'bg-indigo-500/20 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}
        ${isOver ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 bg-indigo-500/20 scale-[1.02]' : ''}
      `}
      onClick={onClick}
    >
      {/* Folder icon with color indicator */}
      <div className="relative flex-shrink-0">
        <FolderIcon
          className={`w-5 h-5 ${isSelected ? 'text-indigo-300' : 'text-slate-500'}`}
        />
        <div
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-slate-800"
          style={{ backgroundColor: company.color }}
        />
      </div>

      {/* Company name */}
      <span className="flex-1 truncate text-sm font-medium">
        {company.name}
      </span>

      {/* Interview count badge */}
      <span
        className={`
          text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-semibold
          ${isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/10 text-slate-400'}
        `}
      >
        {count}
      </span>

      {/* Menu button */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className={`
            p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity
            hover:bg-white/10
          `}
        >
          <MoreVertical className="w-4 h-4 text-slate-400" />
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 bg-slate-800 rounded-xl shadow-elevated border border-white/10 py-1 z-50 min-w-[120px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onEdit(company);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onDelete(company);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Special folder items for "All" and "Unassigned"
interface SpecialFolderProps {
  type: 'all' | 'unassigned';
  count: number;
  isSelected: boolean;
  onClick: () => void;
}

export function SpecialFolder({
  type,
  count,
  isSelected,
  onClick,
}: SpecialFolderProps) {
  const isAll = type === 'all';
  const FolderIcon = isSelected ? FolderOpen : Folder;

  // Only "Unassigned" is a drop target (to remove company assignment)
  const { isOver, setNodeRef } = useDroppable({
    id: type === 'unassigned' ? 'unassigned' : 'all-no-drop',
    data: { companyId: null },
    disabled: isAll, // "All" is not a drop target
  });

  return (
    <div
      ref={!isAll ? setNodeRef : undefined}
      className={`
        flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all
        ${isSelected ? 'bg-indigo-500/20 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}
        ${isOver && !isAll ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 bg-indigo-500/20 scale-[1.02]' : ''}
      `}
      onClick={onClick}
    >
      <FolderIcon
        className={`w-5 h-5 ${isSelected ? 'text-indigo-300' : 'text-slate-500'}`}
      />
      <span className="flex-1 text-sm font-medium">
        {isAll ? 'All Interviews' : 'Unassigned'}
      </span>
      <span
        className={`
          text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center font-semibold
          ${isSelected ? 'bg-indigo-500/30 text-indigo-200' : 'bg-white/10 text-slate-400'}
        `}
      >
        {count}
      </span>
    </div>
  );
}
