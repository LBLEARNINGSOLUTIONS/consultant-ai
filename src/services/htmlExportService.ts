import { CompanySummary } from '../types/database';
import { CompanySummaryData } from '../types/analysis';
import { formatDate } from '../utils/dateFormatters';

// Generate a self-contained HTML export of the company summary
export function generateHTMLExport(summary: CompanySummary): string {
  const data = summary.summary_data as unknown as CompanySummaryData;
  const generatedDate = formatDate(new Date().toISOString());
  const auditDate = formatDate(summary.created_at);

  // Extract executive summary if available
  const execSummary = (data as unknown as { executiveSummary?: {
    narrativeSummary?: string;
    keyFindings?: string[];
    topRisks?: Array<{ text: string }>;
    topOpportunities?: Array<{ text: string }>;
    maturityLevel?: number;
    maturityNotes?: string;
  } }).executiveSummary;

  // Extract company context if available
  const companyContext = (data as unknown as { companyContext?: {
    description?: string;
    industry?: string;
    companySize?: string;
    projectGoals?: string;
  } }).companyContext;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(summary.title)} - Process Audit Summary</title>
  <style>
    :root {
      --primary: #4F46E5;
      --primary-light: #EEF2FF;
      --slate-50: #F8FAFC;
      --slate-100: #F1F5F9;
      --slate-200: #E2E8F0;
      --slate-300: #CBD5E1;
      --slate-500: #64748B;
      --slate-600: #475569;
      --slate-700: #334155;
      --slate-900: #0F172A;
      --red-100: #FEE2E2;
      --red-600: #DC2626;
      --amber-100: #FEF3C7;
      --amber-600: #D97706;
      --green-100: #DCFCE7;
      --green-600: #16A34A;
      --blue-100: #DBEAFE;
      --blue-600: #2563EB;
      --purple-100: #F3E8FF;
      --purple-600: #9333EA;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: var(--slate-700);
      background: var(--slate-50);
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem;
    }

    header {
      background: linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%);
      color: white;
      padding: 3rem 2rem;
      margin-bottom: 2rem;
      border-radius: 1rem;
    }

    header h1 {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }

    header p {
      opacity: 0.9;
      font-size: 0.875rem;
    }

    nav {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid var(--slate-200);
    }

    nav h2 {
      font-size: 1rem;
      color: var(--slate-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 1rem;
    }

    nav ul {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    nav a {
      color: var(--primary);
      text-decoration: none;
      padding: 0.5rem 1rem;
      background: var(--primary-light);
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.2s;
    }

    nav a:hover {
      background: var(--slate-200);
    }

    section {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      margin-bottom: 1.5rem;
      border: 1px solid var(--slate-200);
    }

    section h2 {
      font-size: 1.5rem;
      color: var(--slate-900);
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--primary-light);
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .metric-card {
      text-align: center;
      padding: 1.5rem;
      background: var(--slate-50);
      border-radius: 0.75rem;
      border: 1px solid var(--slate-200);
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary);
    }

    .metric-label {
      font-size: 0.875rem;
      color: var(--slate-500);
      margin-top: 0.25rem;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1rem;
    }

    .card {
      background: var(--slate-50);
      border-radius: 0.75rem;
      padding: 1.25rem;
      border-left: 4px solid var(--primary);
    }

    .card h3 {
      font-size: 1rem;
      color: var(--slate-900);
      margin-bottom: 0.5rem;
    }

    .card p {
      font-size: 0.875rem;
      color: var(--slate-600);
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
      margin-right: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .badge-red { background: var(--red-100); color: var(--red-600); }
    .badge-amber { background: var(--amber-100); color: var(--amber-600); }
    .badge-green { background: var(--green-100); color: var(--green-600); }
    .badge-blue { background: var(--blue-100); color: var(--blue-600); }
    .badge-purple { background: var(--purple-100); color: var(--purple-600); }

    .severity-critical { border-left-color: var(--red-600); }
    .severity-high { border-left-color: #F59E0B; }
    .severity-medium { border-left-color: var(--amber-600); }
    .severity-low { border-left-color: var(--slate-500); }

    .list {
      list-style: none;
    }

    .list li {
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--slate-100);
    }

    .list li:last-child {
      border-bottom: none;
    }

    .roles-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .role-tag {
      background: var(--purple-100);
      color: var(--purple-600);
      padding: 0.5rem 1rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .role-count {
      background: white;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      margin-left: 0.5rem;
    }

    .finding-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: var(--slate-50);
      border-radius: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .finding-number {
      width: 2rem;
      height: 2rem;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
    }

    .recommendation-phase {
      margin-bottom: 2rem;
    }

    .phase-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid var(--slate-200);
    }

    .phase-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .phase-immediate { background: var(--red-100); color: var(--red-600); }
    .phase-short-term { background: var(--amber-100); color: var(--amber-600); }
    .phase-long-term { background: var(--green-100); color: var(--green-600); }

    footer {
      text-align: center;
      padding: 2rem;
      color: var(--slate-500);
      font-size: 0.875rem;
    }

    @media print {
      body { background: white; }
      .container { max-width: 100%; padding: 0; }
      section { break-inside: avoid; }
      nav { display: none; }
    }

    @media (max-width: 640px) {
      .container { padding: 1rem; }
      header { padding: 2rem 1rem; }
      header h1 { font-size: 1.5rem; }
      section { padding: 1.5rem; }
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${escapeHtml(summary.title)}</h1>
      <p>Process Audit Summary • Generated ${generatedDate}</p>
      <p>${data.totalInterviews || 0} interviews analyzed • Audit date: ${auditDate}</p>
    </header>

    <nav>
      <h2>Contents</h2>
      <ul>
        ${execSummary ? '<li><a href="#executive-summary">Executive Summary</a></li>' : ''}
        <li><a href="#key-metrics">Key Metrics</a></li>
        ${data.topWorkflows?.length ? '<li><a href="#workflows">Workflows</a></li>' : ''}
        ${data.criticalPainPoints?.length ? '<li><a href="#issues">Issues & Risks</a></li>' : ''}
        ${data.commonTools?.length ? '<li><a href="#technology">Technology</a></li>' : ''}
        ${Object.keys(data.roleDistribution || {}).length ? '<li><a href="#roles">Roles</a></li>' : ''}
        ${data.recommendations?.length ? '<li><a href="#recommendations">Recommendations</a></li>' : ''}
      </ul>
    </nav>

    ${execSummary ? `
    <section id="executive-summary">
      <h2>Executive Summary</h2>
      ${execSummary.narrativeSummary ? `<p style="margin-bottom: 1.5rem; font-size: 1rem;">${escapeHtml(execSummary.narrativeSummary)}</p>` : ''}

      ${execSummary.maturityLevel ? `
      <div style="background: var(--primary-light); padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem;">
        <strong>Maturity Assessment:</strong> Level ${execSummary.maturityLevel}/5
        ${execSummary.maturityNotes ? `<br><span style="font-size: 0.875rem; color: var(--slate-600);">${escapeHtml(execSummary.maturityNotes)}</span>` : ''}
      </div>
      ` : ''}

      ${execSummary.keyFindings?.length ? `
      <h3 style="font-size: 1.125rem; margin-bottom: 1rem;">Key Findings</h3>
      ${execSummary.keyFindings.map((finding, idx) => `
        <div class="finding-item">
          <span class="finding-number">${idx + 1}</span>
          <span>${escapeHtml(finding)}</span>
        </div>
      `).join('')}
      ` : ''}

      ${execSummary.topRisks?.length ? `
      <h3 style="font-size: 1.125rem; margin: 1.5rem 0 1rem;">Critical Risks</h3>
      <ul class="list">
        ${execSummary.topRisks.slice(0, 5).map(risk => `<li><span class="badge badge-red">Risk</span> ${escapeHtml(risk.text)}</li>`).join('')}
      </ul>
      ` : ''}
    </section>
    ` : ''}

    <section id="key-metrics">
      <h2>Key Metrics</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">${data.totalInterviews || 0}</div>
          <div class="metric-label">Interviews</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.topWorkflows?.length || 0}</div>
          <div class="metric-label">Workflows</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.criticalPainPoints?.length || 0}</div>
          <div class="metric-label">Issues</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.commonTools?.length || 0}</div>
          <div class="metric-label">Tools</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${Object.keys(data.roleDistribution || {}).length}</div>
          <div class="metric-label">Roles</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${data.recommendations?.length || 0}</div>
          <div class="metric-label">Recommendations</div>
        </div>
      </div>
      ${companyContext?.description ? `<p style="margin-top: 1rem;">${escapeHtml(companyContext.description)}</p>` : ''}
    </section>

    ${data.topWorkflows?.length ? `
    <section id="workflows">
      <h2>Top Workflows (${data.topWorkflows.length})</h2>
      <div class="card-grid">
        ${data.topWorkflows.slice(0, 10).map((wf: { name: string; frequency?: number | string; mentions?: number }) => `
          <div class="card">
            <h3>${escapeHtml(wf.name)}</h3>
            <span class="badge badge-blue">${wf.mentions || 0} mentions</span>
            ${wf.frequency ? `<span class="badge badge-purple">${typeof wf.frequency === 'number' ? wf.frequency + 'x' : wf.frequency}</span>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${data.criticalPainPoints?.length ? `
    <section id="issues">
      <h2>Issues & Risks (${data.criticalPainPoints.length})</h2>
      <div class="card-grid">
        ${data.criticalPainPoints.slice(0, 10).map((pp: { description: string; severity?: string; affectedCount?: number }) => `
          <div class="card severity-${pp.severity || 'medium'}">
            <div style="margin-bottom: 0.5rem;">
              <span class="badge badge-${pp.severity === 'critical' || pp.severity === 'high' ? 'red' : 'amber'}">${pp.severity?.toUpperCase() || 'MEDIUM'}</span>
              ${pp.affectedCount ? `<span class="badge badge-blue">${pp.affectedCount} affected</span>` : ''}
            </div>
            <p>${escapeHtml(pp.description)}</p>
          </div>
        `).join('')}
      </div>

      ${data.highRiskHandoffs?.length ? `
      <h3 style="margin-top: 2rem; margin-bottom: 1rem;">High-Risk Handoffs (${data.highRiskHandoffs.length})</h3>
      <ul class="list">
        ${data.highRiskHandoffs.slice(0, 8).map((h: { fromRole: string; toRole: string; process: string; occurrences?: number }) => `
          <li>
            <strong>${escapeHtml(h.fromRole)}</strong> → <strong>${escapeHtml(h.toRole)}</strong>
            <br><span style="color: var(--slate-600);">${escapeHtml(h.process)}</span>
            ${h.occurrences ? `<span class="badge badge-amber" style="margin-left: 0.5rem;">${h.occurrences} occurrences</span>` : ''}
          </li>
        `).join('')}
      </ul>
      ` : ''}
    </section>
    ` : ''}

    ${data.commonTools?.length ? `
    <section id="technology">
      <h2>Technology & Tools (${data.commonTools.length})</h2>
      <div class="card-grid">
        ${data.commonTools.slice(0, 12).map((tool: { name: string; userCount?: number; roles?: string[] }) => `
          <div class="card">
            <h3>${escapeHtml(tool.name)}</h3>
            ${tool.userCount ? `<span class="badge badge-green">${tool.userCount} users</span>` : ''}
            ${tool.roles?.length ? `<p style="margin-top: 0.5rem; font-size: 0.875rem;">${tool.roles.slice(0, 3).map(escapeHtml).join(', ')}${tool.roles.length > 3 ? ` +${tool.roles.length - 3} more` : ''}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </section>
    ` : ''}

    ${Object.keys(data.roleDistribution || {}).length ? `
    <section id="roles">
      <h2>Roles (${Object.keys(data.roleDistribution || {}).length})</h2>
      <div class="roles-grid">
        ${Object.entries(data.roleDistribution || {})
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .map(([role, count]) => `
            <span class="role-tag">
              ${escapeHtml(role)}
              <span class="role-count">${count}</span>
            </span>
          `).join('')}
      </div>
    </section>
    ` : ''}

    ${data.recommendations?.length ? `
    <section id="recommendations">
      <h2>Recommendations (${data.recommendations.length})</h2>

      ${renderRecommendationsByPriority(data.recommendations)}
    </section>
    ` : ''}

    <footer>
      <p>Generated by ConsultantAI • ${generatedDate}</p>
      <p style="margin-top: 0.5rem; opacity: 0.7;">Powered by Claude AI</p>
    </footer>
  </div>
</body>
</html>`;

  return html;
}

// Helper to escape HTML special characters
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Helper to render recommendations grouped by priority
function renderRecommendationsByPriority(recommendations: Array<{ id?: string; text: string; priority?: string }>): string {
  const high = recommendations.filter(r => r.priority === 'high');
  const medium = recommendations.filter(r => r.priority === 'medium');
  const low = recommendations.filter(r => r.priority === 'low' || !r.priority);

  let html = '';

  if (high.length) {
    html += `
      <div class="recommendation-phase">
        <div class="phase-header">
          <span class="phase-badge phase-immediate">Immediate Priority</span>
          <span style="color: var(--slate-500);">${high.length} recommendations</span>
        </div>
        <ul class="list">
          ${high.map(r => `<li>${escapeHtml(r.text)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (medium.length) {
    html += `
      <div class="recommendation-phase">
        <div class="phase-header">
          <span class="phase-badge phase-short-term">Short-term Priority</span>
          <span style="color: var(--slate-500);">${medium.length} recommendations</span>
        </div>
        <ul class="list">
          ${medium.map(r => `<li>${escapeHtml(r.text)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (low.length) {
    html += `
      <div class="recommendation-phase">
        <div class="phase-header">
          <span class="phase-badge phase-long-term">Long-term Priority</span>
          <span style="color: var(--slate-500);">${low.length} recommendations</span>
        </div>
        <ul class="list">
          ${low.map(r => `<li>${escapeHtml(r.text)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  return html;
}

// Download HTML as a file
export function downloadHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
