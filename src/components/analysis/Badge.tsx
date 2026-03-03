import { cn } from '../../utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray' | 'indigo';
  className?: string;
}

const variantStyles = {
  default: 'bg-slate-50 text-slate-600 border-slate-200/60',
  blue: 'bg-blue-50 text-blue-700 border-blue-200/60',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200/60',
  red: 'bg-red-50 text-red-700 border-red-200/60',
  purple: 'bg-purple-50 text-purple-700 border-purple-200/60',
  gray: 'bg-gray-50 text-gray-600 border-gray-200/60',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/60',
};

const dotStyles = {
  default: 'bg-slate-400',
  blue: 'bg-blue-500',
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
  gray: 'bg-gray-400',
  indigo: 'bg-indigo-500',
};

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', dotStyles[variant], variant === 'yellow' && 'animate-dot-pulse')} />
      {children}
    </span>
  );
}
