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
        group relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
        ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'}
        ${isOver ? 'ring-2 ring-indigo-500 ring-offset-2 bg-indigo-50 scale-105' : ''}
      `}
      onClick={onClick}
    >
      {/* Folder icon with color indicator */}
      <div className="relative flex-shrink-0">
        <FolderIcon
          className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}
        />
        <div
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
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
          text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center
          ${isSelected ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-200 text-slate-600'}
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
            hover:bg-slate-200
          `}
        >
          <MoreVertical className="w-4 h-4 text-slate-500" />
        </button>

        {/* Dropdown menu */}
        {showMenu && (
          <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 min-w-[120px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onEdit(company);
              }}
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
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
              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
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
  isDragOver?: boolean;
  onClick: () => void;
}

export function SpecialFolder({
  type,
  count,
  isSelected,
  isDragOver = false,
  onClick,
}: SpecialFolderProps) {
  const isAll = type === 'all';
  const FolderIcon = isSelected ? FolderOpen : Folder;

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all
        ${isSelected ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-100'}
        ${isDragOver && !isAll ? 'ring-2 ring-indigo-500 ring-offset-2 bg-indigo-50' : ''}
      `}
      onClick={onClick}
    >
      <FolderIcon
        className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`}
      />
      <span className="flex-1 text-sm font-medium">
        {isAll ? 'All Interviews' : 'Unassigned'}
      </span>
      <span
        className={`
          text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center
          ${isSelected ? 'bg-indigo-200 text-indigo-700' : 'bg-slate-200 text-slate-600'}
        `}
      >
        {count}
      </span>
    </div>
  );
}
