import { CompanySummary } from '../types/database';
import { CompanySummaryData } from '../types/analysis';
import { formatDate } from '../utils/dateFormatters';

// SVG Icons (lucide-style)
const icons = {
  fileText: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  building2: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  trendingUp: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`,
  alertTriangle: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  wrench: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path></svg>`,
  graduationCap: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>`,
  lightbulb: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"></path><path d="M9 18h6"></path><path d="M10 22h4"></path></svg>`,
  fileSearch: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v3"></path><polyline points="14 2 14 8 20 8"></polyline><path d="M5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"></path><path d="m9 18-1.5-1.5"></path></svg>`,
  arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>`,
};

// Navigation items matching SummaryNav.tsx
const navItems = [
  { id: 'executive', label: 'Executive Summary', icon: icons.fileText },
  { id: 'company', label: 'Company Overview', icon: icons.building2 },
  { id: 'roles', label: 'Role & Responsibility', icon: icons.users },
  { id: 'workflows', label: 'Workflow & Process', icon: icons.trendingUp },
  { id: 'risks', label: 'Risk & Bottlenecks', icon: icons.alertTriangle },
  { id: 'technology', label: 'Technology & Systems', icon: icons.wrench },
  { id: 'training', label: 'Training Gaps', icon: icons.graduationCap },
  { id: 'recommendations', label: 'Recommendations', icon: icons.lightbulb },
  { id: 'evidence', label: 'Supporting Evidence', icon: icons.fileSearch },
];

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
      --primary-dark: #4338CA;
      --primary-light: #EEF2FF;
      --slate-50: #F8FAFC;
      --slate-100: #F1F5F9;
      --slate-200: #E2E8F0;
      --slate-300: #CBD5E1;
      --slate-400: #94A3B8;
      --slate-500: #64748B;
      --slate-600: #475569;
      --slate-700: #334155;
      --slate-800: #1E293B;
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

    html {
      scroll-behavior: smooth;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: var(--slate-700);
      background: var(--slate-100);
    }

    /* App Container - Grid Layout */
    .app-container {
      display: grid;
      grid-template-rows: auto 1fr;
      grid-template-columns: 256px 1fr;
      min-height: 100vh;
    }

    /* Header - Full Width */
    .header {
      grid-column: 1 / -1;
      background: linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%);
      color: white;
      padding: 1.5rem 2rem;
    }

    .header-content {
      max-width: 100%;
    }

    .header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }

    .header-meta {
      display: flex;
      gap: 1.5rem;
      font-size: 0.875rem;
      opacity: 0.9;
    }

    /* Sidebar Navigation */
    .sidebar {
      background: white;
      border-right: 1px solid var(--slate-200);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      height: calc(100vh - 80px);
      overflow-y: auto;
    }

    .nav-list {
      list-style: none;
      padding: 0.5rem;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      color: var(--slate-600);
      text-decoration: none;
      border-radius: 0.5rem;
      margin-bottom: 0.25rem;
      transition: all 0.15s ease;
      cursor: pointer;
    }

    .nav-item:hover {
      background: var(--slate-100);
      color: var(--slate-900);
    }

    .nav-item.active {
      background: var(--primary-light);
      color: var(--primary);
      font-weight: 500;
    }

    .nav-icon {
      flex-shrink: 0;
      width: 20px;
      height: 20px;
    }

    .nav-label {
      font-size: 0.875rem;
    }

    /* Content Area */
    .content {
      background: var(--slate-50);
      padding: 1.5rem;
      overflow-y: auto;
    }

    .content-inner {
      max-width: 1024px;
      margin: 0 auto;
    }

    /* Section Styling */
    .section {
      background: white;
      border-radius: 0.75rem;
      padding: 2rem;
      margin-bottom: 1.5rem;
      border: 1px solid var(--slate-200);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid var(--primary-light);
    }

    .section-icon {
      color: var(--primary);
      flex-shrink: 0;
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--slate-900);
    }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .metric-card {
      text-align: center;
      padding: 1.25rem;
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
      font-size: 0.8rem;
      color: var(--slate-500);
      margin-top: 0.25rem;
    }

    /* Card Grid */
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

    /* Badges */
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
    .severity-low { border-left-color: var(--slate-400); }

    /* Lists */
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

    /* Roles Grid */
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

    /* Finding Item */
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

    /* Maturity Box */
    .maturity-box {
      background: var(--primary-light);
      padding: 1rem 1.25rem;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      border-left: 4px solid var(--primary);
    }

    .maturity-level {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--primary);
    }

    /* Recommendation Phases */
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

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .info-item {
      padding: 1rem;
      background: var(--slate-50);
      border-radius: 0.5rem;
    }

    .info-label {
      font-size: 0.75rem;
      color: var(--slate-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .info-value {
      font-size: 0.9rem;
      color: var(--slate-800);
    }

    /* Interview List */
    .interview-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--slate-50);
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .interview-title {
      font-weight: 500;
      color: var(--slate-800);
    }

    .interview-date {
      font-size: 0.875rem;
      color: var(--slate-500);
    }

    /* Footer */
    .footer {
      text-align: center;
      padding: 2rem;
      color: var(--slate-500);
      font-size: 0.875rem;
      background: white;
      border-top: 1px solid var(--slate-200);
    }

    /* Print Styles */
    @media print {
      .app-container {
        display: block;
      }
      .sidebar {
        display: none;
      }
      .content {
        padding: 0;
      }
      .section {
        break-inside: avoid;
        page-break-inside: avoid;
      }
      .header {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }

    /* Mobile Styles */
    @media (max-width: 768px) {
      .app-container {
        grid-template-columns: 1fr;
      }
      .sidebar {
        display: none;
      }
      .header h1 {
        font-size: 1.25rem;
      }
      .header-meta {
        flex-direction: column;
        gap: 0.25rem;
      }
      .section {
        padding: 1.5rem;
      }
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  </style>
</head>
<body>
  <div class="app-container">
    <!-- Header -->
    <header class="header">
      <div class="header-content">
        <h1>${escapeHtml(summary.title)}</h1>
        <div class="header-meta">
          <span>Process Audit Summary</span>
          <span>${data.totalInterviews || 0} interviews analyzed</span>
          <span>Generated ${generatedDate}</span>
        </div>
      </div>
    </header>

    <!-- Sidebar Navigation -->
    <nav class="sidebar">
      <ul class="nav-list">
        ${navItems.map((item, index) => `
          <li>
            <a href="#${item.id}" class="nav-item${index === 0 ? ' active' : ''}" data-section="${item.id}">
              <span class="nav-icon">${item.icon}</span>
              <span class="nav-label">${item.label}</span>
            </a>
          </li>
        `).join('')}
      </ul>
    </nav>

    <!-- Content Area -->
    <main class="content">
      <div class="content-inner">

        <!-- Executive Summary -->
        <section id="executive" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.fileText}</span>
            <h2 class="section-title">Executive Summary</h2>
          </div>

          ${execSummary?.narrativeSummary ? `
            <p style="margin-bottom: 1.5rem; font-size: 1rem; line-height: 1.7;">${escapeHtml(execSummary.narrativeSummary)}</p>
          ` : `
            <p style="margin-bottom: 1.5rem; color: var(--slate-500);">Executive summary not yet written.</p>
          `}

          ${execSummary?.maturityLevel ? `
            <div class="maturity-box">
              <div class="maturity-level">Maturity Level: ${execSummary.maturityLevel}/5</div>
              ${execSummary.maturityNotes ? `<p style="margin-top: 0.5rem; font-size: 0.9rem; color: var(--slate-600);">${escapeHtml(execSummary.maturityNotes)}</p>` : ''}
            </div>
          ` : ''}

          <!-- Key Metrics -->
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

          ${execSummary?.keyFindings?.length ? `
            <h3 style="font-size: 1.125rem; margin: 1.5rem 0 1rem; color: var(--slate-800);">Key Findings</h3>
            ${execSummary.keyFindings.slice(0, 5).map((finding, idx) => `
              <div class="finding-item">
                <span class="finding-number">${idx + 1}</span>
                <span>${escapeHtml(finding)}</span>
              </div>
            `).join('')}
          ` : ''}

          ${execSummary?.topRisks?.length ? `
            <h3 style="font-size: 1.125rem; margin: 1.5rem 0 1rem; color: var(--slate-800);">Critical Risks</h3>
            <ul class="list">
              ${execSummary.topRisks.slice(0, 5).map(risk => `<li><span class="badge badge-red">Risk</span> ${escapeHtml(risk.text)}</li>`).join('')}
            </ul>
          ` : ''}
        </section>

        <!-- Company Overview -->
        <section id="company" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.building2}</span>
            <h2 class="section-title">Company Overview</h2>
          </div>

          ${companyContext?.description ? `
            <p style="margin-bottom: 1.5rem; font-size: 1rem;">${escapeHtml(companyContext.description)}</p>
          ` : ''}

          <div class="info-grid">
            ${companyContext?.industry ? `
              <div class="info-item">
                <div class="info-label">Industry</div>
                <div class="info-value">${escapeHtml(companyContext.industry)}</div>
              </div>
            ` : ''}
            ${companyContext?.companySize ? `
              <div class="info-item">
                <div class="info-label">Company Size</div>
                <div class="info-value">${escapeHtml(companyContext.companySize)}</div>
              </div>
            ` : ''}
            <div class="info-item">
              <div class="info-label">Interviews Analyzed</div>
              <div class="info-value">${data.totalInterviews || 0} interviews</div>
            </div>
            <div class="info-item">
              <div class="info-label">Audit Date</div>
              <div class="info-value">${auditDate}</div>
            </div>
          </div>

          ${companyContext?.projectGoals ? `
            <div class="info-item" style="margin-top: 1rem;">
              <div class="info-label">Project Goals</div>
              <div class="info-value">${escapeHtml(companyContext.projectGoals)}</div>
            </div>
          ` : ''}
        </section>

        <!-- Role & Responsibility -->
        <section id="roles" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.users}</span>
            <h2 class="section-title">Role & Responsibility</h2>
          </div>

          ${Object.keys(data.roleDistribution || {}).length ? `
            <p style="margin-bottom: 1rem; color: var(--slate-600);">${Object.keys(data.roleDistribution || {}).length} unique roles identified across ${data.totalInterviews || 0} interviews.</p>
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
          ` : `
            <p style="color: var(--slate-500);">No roles identified yet.</p>
          `}
        </section>

        <!-- Workflow & Process -->
        <section id="workflows" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.trendingUp}</span>
            <h2 class="section-title">Workflow & Process</h2>
          </div>

          ${data.topWorkflows?.length ? `
            <p style="margin-bottom: 1rem; color: var(--slate-600);">${data.topWorkflows.length} workflows identified.</p>
            <div class="card-grid">
              ${data.topWorkflows.slice(0, 12).map((wf: { name: string; frequency?: number | string; mentions?: number; participants?: string[] }) => `
                <div class="card">
                  <h3>${escapeHtml(wf.name)}</h3>
                  <div style="margin-top: 0.5rem;">
                    ${wf.mentions ? `<span class="badge badge-blue">${wf.mentions} mentions</span>` : ''}
                    ${wf.frequency ? `<span class="badge badge-purple">${typeof wf.frequency === 'number' ? wf.frequency + 'x' : wf.frequency}</span>` : ''}
                  </div>
                  ${wf.participants?.length ? `<p style="margin-top: 0.5rem; font-size: 0.85rem;">Participants: ${wf.participants.slice(0, 3).join(', ')}${wf.participants.length > 3 ? ` +${wf.participants.length - 3} more` : ''}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : `
            <p style="color: var(--slate-500);">No workflows identified yet.</p>
          `}
        </section>

        <!-- Risk & Bottlenecks -->
        <section id="risks" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.alertTriangle}</span>
            <h2 class="section-title">Risk & Bottlenecks</h2>
          </div>

          ${data.criticalPainPoints?.length ? `
            <h3 style="font-size: 1.125rem; margin-bottom: 1rem; color: var(--slate-800);">Pain Points (${data.criticalPainPoints.length})</h3>
            <div class="card-grid">
              ${data.criticalPainPoints.slice(0, 10).map((pp: { description: string; severity?: string; affectedCount?: number }) => `
                <div class="card severity-${pp.severity || 'medium'}">
                  <div style="margin-bottom: 0.5rem;">
                    <span class="badge badge-${pp.severity === 'critical' || pp.severity === 'high' ? 'red' : 'amber'}">${(pp.severity || 'medium').toUpperCase()}</span>
                    ${pp.affectedCount ? `<span class="badge badge-blue">${pp.affectedCount} affected</span>` : ''}
                  </div>
                  <p>${escapeHtml(pp.description)}</p>
                </div>
              `).join('')}
            </div>
          ` : `
            <p style="color: var(--slate-500); margin-bottom: 1.5rem;">No pain points identified yet.</p>
          `}

          ${data.highRiskHandoffs?.length ? `
            <h3 style="font-size: 1.125rem; margin: 2rem 0 1rem; color: var(--slate-800);">High-Risk Handoffs (${data.highRiskHandoffs.length})</h3>
            <ul class="list">
              ${data.highRiskHandoffs.slice(0, 8).map((h: { fromRole: string; toRole: string; process: string; occurrences?: number }) => `
                <li>
                  <strong>${escapeHtml(h.fromRole)}</strong> → <strong>${escapeHtml(h.toRole)}</strong>
                  <br><span style="color: var(--slate-600); font-size: 0.9rem;">${escapeHtml(h.process)}</span>
                  ${h.occurrences ? `<span class="badge badge-amber" style="margin-left: 0.5rem;">${h.occurrences} occurrences</span>` : ''}
                </li>
              `).join('')}
            </ul>
          ` : ''}
        </section>

        <!-- Technology & Systems -->
        <section id="technology" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.wrench}</span>
            <h2 class="section-title">Technology & Systems</h2>
          </div>

          ${data.commonTools?.length ? `
            <p style="margin-bottom: 1rem; color: var(--slate-600);">${data.commonTools.length} tools and systems identified.</p>
            <div class="card-grid">
              ${data.commonTools.slice(0, 12).map((tool: { name: string; userCount?: number; roles?: string[]; purpose?: string }) => `
                <div class="card">
                  <h3>${escapeHtml(tool.name)}</h3>
                  ${tool.userCount ? `<span class="badge badge-green">${tool.userCount} users</span>` : ''}
                  ${tool.purpose ? `<p style="margin-top: 0.5rem; font-size: 0.85rem;">${escapeHtml(tool.purpose)}</p>` : ''}
                  ${tool.roles?.length ? `<p style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--slate-500);">Used by: ${tool.roles.slice(0, 3).map(escapeHtml).join(', ')}${tool.roles.length > 3 ? ` +${tool.roles.length - 3} more` : ''}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : `
            <p style="color: var(--slate-500);">No tools identified yet.</p>
          `}
        </section>

        <!-- Training Gaps -->
        <section id="training" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.graduationCap}</span>
            <h2 class="section-title">Training Gaps</h2>
          </div>

          ${data.priorityTrainingGaps?.length ? `
            <p style="margin-bottom: 1rem; color: var(--slate-600);">${data.priorityTrainingGaps.length} training gaps identified.</p>
            <div class="card-grid">
              ${data.priorityTrainingGaps.slice(0, 10).map((gap: { area: string; priority?: string; affectedRoles?: string[]; count?: number }) => `
                <div class="card severity-${gap.priority || 'medium'}">
                  <h3>${escapeHtml(gap.area)}</h3>
                  <div style="margin-top: 0.5rem;">
                    <span class="badge badge-${gap.priority === 'high' ? 'red' : gap.priority === 'medium' ? 'amber' : 'blue'}">${(gap.priority || 'medium').toUpperCase()}</span>
                    ${gap.count ? `<span class="badge badge-purple">${gap.count} mentions</span>` : ''}
                  </div>
                  ${gap.affectedRoles?.length ? `<p style="margin-top: 0.5rem; font-size: 0.85rem;">Affects: ${gap.affectedRoles.slice(0, 3).join(', ')}${gap.affectedRoles.length > 3 ? ` +${gap.affectedRoles.length - 3} more` : ''}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : `
            <p style="color: var(--slate-500);">No training gaps identified yet.</p>
          `}
        </section>

        <!-- Recommendations -->
        <section id="recommendations" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.lightbulb}</span>
            <h2 class="section-title">Recommendations</h2>
          </div>

          ${data.recommendations?.length ? `
            ${renderRecommendationsByPriority(data.recommendations)}
          ` : `
            <p style="color: var(--slate-500);">No recommendations added yet.</p>
          `}
        </section>

        <!-- Supporting Evidence -->
        <section id="evidence" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.fileSearch}</span>
            <h2 class="section-title">Supporting Evidence</h2>
          </div>

          <p style="margin-bottom: 1rem; color: var(--slate-600);">This summary is based on ${data.totalInterviews || 0} interview${(data.totalInterviews || 0) !== 1 ? 's' : ''} conducted as part of the process audit.</p>

          ${summary.interview_ids?.length ? `
            <p style="font-size: 0.875rem; color: var(--slate-500);">${summary.interview_ids.length} source interview${summary.interview_ids.length !== 1 ? 's' : ''} included in this analysis.</p>
          ` : ''}

          <div style="margin-top: 1rem; padding: 1rem; background: var(--slate-50); border-radius: 0.5rem;">
            <p style="font-size: 0.875rem; color: var(--slate-600);">
              <strong>Generated:</strong> ${generatedDate}<br>
              <strong>Audit Period:</strong> ${auditDate}
            </p>
          </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
          <p>Generated by ConsultantAI • ${generatedDate}</p>
          <p style="margin-top: 0.5rem; opacity: 0.7;">Powered by Claude AI</p>
        </footer>

      </div>
    </main>
  </div>

  <script>
    // Navigation smooth scroll and active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    // Update active nav on scroll using Intersection Observer
    const sections = document.querySelectorAll('.section');
    const navItems = document.querySelectorAll('.nav-item');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navItems.forEach(navItem => {
            const href = navItem.getAttribute('href');
            if (href === '#' + id) {
              navItem.classList.add('active');
            } else {
              navItem.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    });

    sections.forEach(section => observer.observe(section));
  </script>
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
          <span class="phase-badge phase-immediate">Immediate (0-30 days)</span>
          <span style="color: var(--slate-500); font-size: 0.875rem;">${high.length} recommendations</span>
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
          <span class="phase-badge phase-short-term">Short-term (30-90 days)</span>
          <span style="color: var(--slate-500); font-size: 0.875rem;">${medium.length} recommendations</span>
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
          <span class="phase-badge phase-long-term">Long-term (90+ days)</span>
          <span style="color: var(--slate-500); font-size: 0.875rem;">${low.length} recommendations</span>
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
