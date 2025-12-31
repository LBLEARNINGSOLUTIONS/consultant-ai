import { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X, Loader2 } from 'lucide-react';

interface EditableTitleProps {
  value: string;
  onSave: (newTitle: string) => Promise<void>;
  className?: string;
  size?: 'sm' | 'lg';
}

export function EditableTitle({ value, onSave, className = '', size = 'lg' }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue.trim() === '') return;
    if (editValue.trim() === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save title:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const sizeClasses = size === 'lg'
    ? 'text-2xl font-bold'
    : 'text-base font-semibold';

  const inputSizeClasses = size === 'lg'
    ? 'text-2xl font-bold px-2 py-1'
    : 'text-base font-semibold px-1.5 py-0.5';

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!isSaving) {
              handleSave();
            }
          }}
          disabled={isSaving}
          className={`${inputSizeClasses} bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 min-w-[200px]`}
        />
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin text-white/70" />
        ) : (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Save"
            >
              <Check className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              title="Cancel"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={`group flex items-center gap-2 hover:bg-white/10 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors ${className}`}
      title="Click to edit"
    >
      <span className={sizeClasses}>{value}</span>
      <Edit2 className="w-4 h-4 opacity-0 group-hover:opacity-70 transition-opacity" />
    </button>
  );
}

// Variant for dark backgrounds (cards)
export function EditableTitleDark({ value, onSave, className = '', size = 'sm' }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue.trim() === '') return;
    if (editValue.trim() === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save title:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const sizeClasses = size === 'lg'
    ? 'text-xl font-bold'
    : 'text-base font-semibold';

  if (isEditing) {
    return (
      <div className={`flex items-center gap-2 ${className}`} onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (!isSaving) {
              handleSave();
            }
          }}
          disabled={isSaving}
          className={`${sizeClasses} px-2 py-1 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50 w-full`}
        />
        {isSaving && (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        )}
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`group flex items-center gap-2 text-left hover:bg-slate-100 rounded-lg px-2 py-1 -mx-2 -my-1 transition-colors ${className}`}
      title="Click to edit"
    >
      <span className={`${sizeClasses} text-slate-900 line-clamp-2`}>{value}</span>
      <Edit2 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
    </button>
  );
}
