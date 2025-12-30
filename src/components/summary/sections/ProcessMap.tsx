import { WorkflowStep } from '../../../types/analysis';
import { AlertTriangle, HelpCircle } from 'lucide-react';

interface ProcessMapProps {
  steps: WorkflowStep[];
  failurePointStepIds?: string[];
  unclearStepNames?: string[];
  onStepClick?: (stepId: string) => void;
  selectedStepId?: string;
}

export function ProcessMap({
  steps,
  failurePointStepIds = [],
  unclearStepNames = [],
  onStepClick,
  selectedStepId,
}: ProcessMapProps) {
  if (steps.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-8 text-center">
        <p className="text-slate-500">No process steps defined.</p>
      </div>
    );
  }

  const getStepStatus = (step: WorkflowStep) => {
    if (failurePointStepIds.includes(step.id)) return 'failure';
    if (unclearStepNames.some(name => name.toLowerCase() === step.name.toLowerCase())) return 'unclear';
    return 'ok';
  };

  const getStatusStyles = (status: string, isSelected: boolean) => {
    const baseStyles = 'border-2 transition-all';
    const selectedStyles = isSelected ? 'ring-2 ring-offset-2' : '';

    switch (status) {
      case 'failure':
        return `${baseStyles} ${selectedStyles} bg-red-50 border-red-400 ${isSelected ? 'ring-red-400' : ''} hover:border-red-500`;
      case 'unclear':
        return `${baseStyles} ${selectedStyles} bg-amber-50 border-amber-400 ${isSelected ? 'ring-amber-400' : ''} hover:border-amber-500`;
      default:
        return `${baseStyles} ${selectedStyles} bg-green-50 border-green-400 ${isSelected ? 'ring-green-400' : ''} hover:border-green-500`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'failure':
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case 'unclear':
        return <HelpCircle className="w-3 h-3 text-amber-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 overflow-x-auto">
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-100 border border-green-400" />
          <span className="text-slate-600">Normal</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-100 border border-amber-400" />
          <span className="text-slate-600">Unclear</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-100 border border-red-400" />
          <span className="text-slate-600">Failure Point</span>
        </div>
      </div>

      {/* Process Flow */}
      <div className="flex items-start gap-2 min-w-max pb-2">
        {steps.map((step, idx) => {
          const status = getStepStatus(step);
          const isSelected = selectedStepId === step.id;
          const statusIcon = getStatusIcon(status);

          return (
            <div key={step.id} className="flex items-center">
              {/* Step Node */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStepClick?.(step.id)}
                  className={`relative px-4 py-3 rounded-lg min-w-[120px] max-w-[160px] cursor-pointer ${getStatusStyles(status, isSelected)}`}
                >
                  {/* Status indicator */}
                  {statusIcon && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm border">
                      {statusIcon}
                    </div>
                  )}

                  {/* Step number */}
                  <div className="text-[10px] font-semibold text-slate-400 mb-1">
                    Step {idx + 1}
                  </div>

                  {/* Step name */}
                  <div className="text-sm font-medium text-slate-900 text-center line-clamp-2">
                    {step.name}
                  </div>
                </button>

                {/* Owner label */}
                {step.owner && (
                  <div className="mt-2 px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600 truncate max-w-[140px]">
                    {step.owner}
                  </div>
                )}
              </div>

              {/* Arrow connector */}
              {idx < steps.length - 1 && (
                <div className="flex items-center px-1">
                  <div className="w-8 h-0.5 bg-slate-300" />
                  <div className="w-0 h-0 border-t-4 border-b-4 border-l-6 border-t-transparent border-b-transparent border-l-slate-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Click hint */}
      {onStepClick && steps.length > 0 && (
        <p className="text-xs text-slate-400 text-center mt-3">
          Click a step to see details
        </p>
      )}
    </div>
  );
}
