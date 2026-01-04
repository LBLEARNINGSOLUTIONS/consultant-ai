import { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface SOWObjectiveTabProps {
  value: string;
  onChange: (value: string) => void;
}

const templateSuggestions = [
  {
    title: 'Process Optimization',
    template: `The primary objective of this engagement is to optimize operational processes, reduce inefficiencies, and establish standardized workflows that improve productivity and reduce errors.

Key goals include:
• Documenting and standardizing core business processes
• Identifying and eliminating workflow bottlenecks
• Implementing clear role definitions and accountability structures
• Creating sustainable training materials for ongoing adoption`,
  },
  {
    title: 'Training & Development',
    template: `This engagement aims to develop and deliver comprehensive training solutions that address identified capability gaps and support organizational growth.

Key goals include:
• Assessing current training needs and priorities
• Developing role-specific training materials and job aids
• Delivering training sessions to key personnel
• Establishing metrics for measuring training effectiveness`,
  },
  {
    title: 'Technology Enablement',
    template: `The objective of this project is to maximize the value of existing technology investments while improving system adoption and data quality across the organization.

Key goals include:
• Optimizing system configurations to match business needs
• Improving data flows and integration between systems
• Developing user guides and quick reference materials
• Training staff on best practices for system utilization`,
  },
  {
    title: 'Risk Mitigation',
    template: `This engagement focuses on identifying and mitigating operational risks that threaten business continuity, compliance, and service quality.

Key goals include:
• Documenting and addressing high-risk handoff points
• Implementing quality control checkpoints
• Creating backup procedures and contingency plans
• Establishing monitoring and early warning systems`,
  },
];

export function SOWObjectiveTab({ value, onChange }: SOWObjectiveTabProps) {
  const [showTemplates, setShowTemplates] = useState(false);

  const applyTemplate = (template: string) => {
    onChange(template);
    setShowTemplates(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-slate-900">Project Objective</h3>
        <p className="text-sm text-slate-500 mt-1">
          Define the goals and expected outcomes of this engagement.
        </p>
      </div>

      {/* Template suggestions */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Template Suggestions
          </div>
          {showTemplates ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showTemplates && (
          <div className="p-4 space-y-3 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Click a template to use it as a starting point:
            </p>
            <div className="grid grid-cols-2 gap-2">
              {templateSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => applyTemplate(suggestion.template)}
                  className="text-left p-3 border border-slate-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {suggestion.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Text editor */}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Describe the objectives and goals of this engagement...

Example:
The objective of this engagement is to streamline operational workflows, improve cross-team communication, and establish documentation that enables consistent service delivery.

Key goals include:
• Standardizing core business processes
• Reducing handoff errors between departments
• Creating training materials for new team members
• Establishing metrics for ongoing improvement"
        className="w-full h-72 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm leading-relaxed"
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> A clear objective statement helps clients understand what success looks like.
          Include specific, measurable outcomes whenever possible.
        </p>
      </div>
    </div>
  );
}
