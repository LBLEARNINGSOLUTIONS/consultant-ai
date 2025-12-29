import { useState, useRef, useEffect, ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface FilterDropdownProps<T extends string> {
  label: string;
  icon?: ReactNode;
  options: ReadonlyArray<{ value: T; label: string }>;
  selectedValues: T[];
  onChange: (values: T[]) => void;
}

export function FilterDropdown<T extends string>({
  label,
  icon,
  options,
  selectedValues,
  onChange,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleValue = (value: T) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  const hasSelection = selectedValues.length > 0;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors
          ${hasSelection
            ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }
        `}
      >
        {icon}
        <span>{label}</span>
        {hasSelection && (
          <span className="bg-indigo-600 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {selectedValues.length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <button
                key={option.value}
                onClick={() => toggleValue(option.value)}
                className={`
                  flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-slate-50
                  ${isSelected ? 'bg-indigo-50 text-indigo-700' : ''}
                `}
              >
                <div
                  className={`
                    w-4 h-4 border rounded flex items-center justify-center
                    ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}
                  `}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
