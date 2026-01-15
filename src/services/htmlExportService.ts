import { CompanySummary, Interview } from '../types/database';
import { CompanySummaryData, WorkflowProfile, RoleProfile, ToolProfile, TrainingGapProfile, RecommendationProfile } from '../types/analysis';
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
  workflow: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="6" height="6" rx="1"></rect><rect x="15" y="3" width="6" height="6" rx="1"></rect><rect x="9" y="15" width="6" height="6" rx="1"></rect><path d="M6 9v3a1 1 0 0 0 1 1h4"></path><path d="M18 9v3a1 1 0 0 1-1 1h-4"></path></svg>`,
  zap: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`,
  clock: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  calendar: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
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

// Extended interface for export with profiles
interface HTMLExportData {
  summary: CompanySummary;
  interviews?: Interview[];
  workflowProfiles?: WorkflowProfile[];
  roleProfiles?: RoleProfile[];
  toolProfiles?: ToolProfile[];
  trainingGapProfiles?: TrainingGapProfile[];
  recommendationProfiles?: RecommendationProfile[];
}

// Generate a self-contained HTML export of the company summary
export function generateHTMLExport(summary: CompanySummary, extraData?: Partial<HTMLExportData>): string {
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

  // Use profile data if available, fallback to summary data
  const workflowProfiles = extraData?.workflowProfiles || [];
  const roleProfiles = extraData?.roleProfiles || [];
  const toolProfiles = extraData?.toolProfiles || [];
  const trainingGapProfiles = extraData?.trainingGapProfiles || [];
  const recommendationProfiles = extraData?.recommendationProfiles || [];

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
      --red-50: #FEF2F2;
      --red-100: #FEE2E2;
      --red-200: #FECACA;
      --red-500: #EF4444;
      --red-600: #DC2626;
      --red-700: #B91C1C;
      --orange-50: #FFF7ED;
      --orange-100: #FFEDD5;
      --orange-200: #FED7AA;
      --orange-500: #F97316;
      --orange-600: #EA580C;
      --amber-50: #FFFBEB;
      --amber-100: #FEF3C7;
      --amber-200: #FDE68A;
      --amber-500: #F59E0B;
      --amber-600: #D97706;
      --green-50: #F0FDF4;
      --green-100: #DCFCE7;
      --green-200: #BBF7D0;
      --green-500: #22C55E;
      --green-600: #16A34A;
      --emerald-50: #ECFDF5;
      --emerald-100: #D1FAE5;
      --emerald-200: #A7F3D0;
      --emerald-600: #059669;
      --blue-50: #EFF6FF;
      --blue-100: #DBEAFE;
      --blue-200: #BFDBFE;
      --blue-500: #3B82F6;
      --blue-600: #2563EB;
      --indigo-50: #EEF2FF;
      --indigo-100: #E0E7FF;
      --indigo-200: #C7D2FE;
      --indigo-500: #6366F1;
      --indigo-600: #4F46E5;
      --purple-50: #FAF5FF;
      --purple-100: #F3E8FF;
      --purple-200: #E9D5FF;
      --purple-500: #A855F7;
      --purple-600: #9333EA;
      --cyan-50: #ECFEFF;
      --cyan-100: #CFFAFE;
      --cyan-600: #0891B2;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }

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

    /* Header */
    .header {
      grid-column: 1 / -1;
      background: linear-gradient(135deg, var(--primary) 0%, #7C3AED 100%);
      color: white;
      padding: 1.25rem 2rem;
    }

    .header h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
    .header-meta { display: flex; gap: 1.5rem; font-size: 0.875rem; opacity: 0.9; }

    /* Sidebar Navigation */
    .sidebar {
      background: white;
      border-right: 1px solid var(--slate-200);
      padding: 1rem 0;
      position: sticky;
      top: 0;
      height: calc(100vh - 72px);
      overflow-y: auto;
    }

    .nav-list { list-style: none; padding: 0.5rem; }

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
      font-size: 0.875rem;
    }

    .nav-item:hover { background: var(--slate-100); color: var(--slate-900); }
    .nav-item.active { background: var(--primary-light); color: var(--primary); font-weight: 500; }
    .nav-icon { flex-shrink: 0; width: 20px; height: 20px; }

    /* Content Area */
    .content {
      background: var(--slate-50);
      padding: 1.5rem;
      overflow-y: auto;
    }

    .content-inner { max-width: 1024px; margin: 0 auto; }

    /* Section Styling */
    .section {
      background: white;
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid var(--slate-200);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 2px solid var(--primary-light);
    }

    .section-icon { color: var(--primary); flex-shrink: 0; }
    .section-title { font-size: 1.25rem; font-weight: 700; color: var(--slate-900); }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .metric-card {
      text-align: center;
      padding: 1rem;
      background: var(--slate-50);
      border-radius: 0.75rem;
      border: 1px solid var(--slate-200);
    }

    .metric-value { font-size: 1.75rem; font-weight: 700; color: var(--primary); }
    .metric-label { font-size: 0.75rem; color: var(--slate-500); margin-top: 0.25rem; }

    /* Subsection Card */
    .subsection {
      background: var(--slate-50);
      border-radius: 0.5rem;
      padding: 1.25rem;
      margin-bottom: 1rem;
    }

    .subsection-title {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--slate-800);
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Profile Cards Grid */
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
    }

    /* Profile Card */
    .profile-card {
      background: white;
      border: 1px solid var(--slate-200);
      border-radius: 0.75rem;
      padding: 1rem;
      transition: box-shadow 0.15s;
    }

    .profile-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

    .profile-card-header {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .profile-icon-box {
      width: 40px;
      height: 40px;
      border-radius: 0.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .profile-icon-box.purple { background: var(--purple-100); color: var(--purple-600); }
    .profile-icon-box.blue { background: var(--blue-100); color: var(--blue-600); }
    .profile-icon-box.indigo { background: var(--indigo-100); color: var(--indigo-600); }
    .profile-icon-box.green { background: var(--green-100); color: var(--green-600); }
    .profile-icon-box.amber { background: var(--amber-100); color: var(--amber-600); }
    .profile-icon-box.red { background: var(--red-100); color: var(--red-600); }
    .profile-icon-box.cyan { background: var(--cyan-100); color: var(--cyan-600); }

    .profile-card-title { font-size: 0.95rem; font-weight: 600; color: var(--slate-900); }
    .profile-card-meta { font-size: 0.75rem; color: var(--slate-500); margin-top: 0.125rem; }

    .profile-card-content { font-size: 0.85rem; color: var(--slate-600); }
    .profile-card-content p { margin-bottom: 0.5rem; }

    .profile-card-footer {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--slate-100);
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      font-size: 0.75rem;
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      font-size: 0.7rem;
      font-weight: 500;
    }

    .badge-red { background: var(--red-100); color: var(--red-700); }
    .badge-orange { background: var(--orange-100); color: var(--orange-600); }
    .badge-amber { background: var(--amber-100); color: var(--amber-600); }
    .badge-green { background: var(--green-100); color: var(--green-600); }
    .badge-emerald { background: var(--emerald-100); color: var(--emerald-600); }
    .badge-blue { background: var(--blue-100); color: var(--blue-600); }
    .badge-indigo { background: var(--indigo-100); color: var(--indigo-600); }
    .badge-purple { background: var(--purple-100); color: var(--purple-600); }
    .badge-cyan { background: var(--cyan-100); color: var(--cyan-600); }
    .badge-slate { background: var(--slate-100); color: var(--slate-600); }

    .badge-sm { font-size: 0.65rem; padding: 0.125rem 0.5rem; }

    /* Tags row */
    .tags-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
      margin-top: 0.5rem;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.5rem;
      background: var(--slate-100);
      color: var(--slate-600);
      border-radius: 0.25rem;
      font-size: 0.7rem;
    }

    /* Findings/Risks lists */
    .findings-list { list-style: none; }

    .findings-list li {
      display: flex;
      gap: 0.75rem;
      padding: 0.75rem;
      background: var(--slate-50);
      border-radius: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .finding-number {
      width: 1.5rem;
      height: 1.5rem;
      background: var(--amber-500);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    /* Risk/Opportunity boxes */
    .risk-opp-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 1rem;
    }

    .risk-box {
      background: var(--red-50);
      border: 1px solid var(--red-200);
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .opp-box {
      background: var(--emerald-50);
      border: 1px solid var(--emerald-200);
      border-radius: 0.5rem;
      padding: 1rem;
    }

    .risk-box h4, .opp-box h4 {
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
    }

    .risk-box h4 { color: var(--red-700); }
    .opp-box h4 { color: var(--emerald-600); }

    .risk-box ol, .opp-box ol {
      list-style: none;
      counter-reset: item;
    }

    .risk-box li, .opp-box li {
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
    }

    .risk-box li::before, .opp-box li::before {
      counter-increment: item;
      content: counter(item);
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 600;
      flex-shrink: 0;
    }

    .risk-box li::before { background: var(--red-500); color: white; }
    .opp-box li::before { background: var(--emerald-600); color: white; }

    /* Maturity Assessment */
    .maturity-box {
      background: var(--slate-50);
      border-radius: 0.5rem;
      padding: 1.25rem;
      margin-top: 1rem;
    }

    .maturity-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 0.75rem;
    }

    .maturity-level-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 0.375rem;
      font-weight: 600;
      font-size: 0.875rem;
    }

    .maturity-1 { background: var(--red-100); color: var(--red-700); }
    .maturity-2 { background: var(--orange-100); color: var(--orange-600); }
    .maturity-3 { background: var(--amber-100); color: var(--amber-600); }
    .maturity-4 { background: var(--blue-100); color: var(--blue-600); }
    .maturity-5 { background: var(--green-100); color: var(--green-600); }

    .maturity-bar {
      height: 8px;
      background: var(--slate-200);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .maturity-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }

    /* Phase sections */
    .phase-section {
      margin-bottom: 1.5rem;
    }

    .phase-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }

    .phase-immediate { background: var(--red-50); border: 1px solid var(--red-200); }
    .phase-short { background: var(--amber-50); border: 1px solid var(--amber-200); }
    .phase-long { background: var(--green-50); border: 1px solid var(--green-200); }

    .phase-title { font-weight: 600; font-size: 0.9rem; }
    .phase-count { font-size: 0.75rem; color: var(--slate-500); margin-left: auto; }

    /* Info banner */
    .info-banner {
      display: flex;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--blue-50);
      border: 1px solid var(--blue-200);
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }

    .info-banner-icon { color: var(--blue-600); flex-shrink: 0; }
    .info-banner-content h4 { font-size: 0.875rem; font-weight: 600; color: var(--blue-800); }
    .info-banner-content p { font-size: 0.8rem; color: var(--blue-700); margin-top: 0.25rem; }

    /* Evidence stats */
    .evidence-stats {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .evidence-stat {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: white;
      border: 1px solid var(--slate-200);
      border-radius: 0.5rem;
    }

    .evidence-stat-icon {
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .evidence-stat-value { font-size: 1.25rem; font-weight: 700; color: var(--slate-900); }
    .evidence-stat-label { font-size: 0.75rem; color: var(--slate-500); }

    /* Pain point cards */
    .pain-point-card {
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 0.75rem;
      border-left: 4px solid;
    }

    .pain-point-card.critical { background: var(--red-50); border-left-color: var(--red-500); }
    .pain-point-card.high { background: var(--orange-50); border-left-color: var(--orange-500); }
    .pain-point-card.medium { background: var(--amber-50); border-left-color: var(--amber-500); }
    .pain-point-card.low { background: var(--slate-50); border-left-color: var(--slate-400); }

    /* Handoff card */
    .handoff-card {
      padding: 1rem;
      background: var(--orange-50);
      border: 1px solid var(--orange-200);
      border-left: 4px solid var(--orange-500);
      border-radius: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .handoff-flow {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: var(--slate-800);
      margin-bottom: 0.375rem;
    }

    .handoff-process { font-size: 0.85rem; color: var(--slate-600); }

    /* Footer */
    .footer {
      text-align: center;
      padding: 2rem;
      color: var(--slate-500);
      font-size: 0.875rem;
      background: white;
      border-radius: 0.75rem;
      border: 1px solid var(--slate-200);
    }

    /* Interactive tag links */
    .tag-link {
      cursor: pointer;
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .tag-link:hover {
      opacity: 0.8;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    /* Highlighted card state */
    .profile-card.highlighted {
      box-shadow: 0 0 0 3px var(--amber-400) !important;
      animation: pulse-highlight 2s ease-in-out;
    }

    @keyframes pulse-highlight {
      0%, 100% { box-shadow: 0 0 0 3px var(--amber-400); }
      50% { box-shadow: 0 0 0 6px var(--amber-200); }
    }

    /* Handoff role links */
    .handoff-role-link {
      cursor: pointer;
      text-decoration: underline;
      text-decoration-style: dotted;
      text-underline-offset: 2px;
    }

    .handoff-role-link:hover {
      color: var(--primary);
    }

    /* Print & Mobile */
    @media print {
      .app-container { display: block; }
      .sidebar { display: none; }
      .content { padding: 0; }
      .section { break-inside: avoid; page-break-inside: avoid; }
      .header { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }

    @media (max-width: 768px) {
      .app-container { grid-template-columns: 1fr; }
      .sidebar { display: none; }
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
      .risk-opp-grid { grid-template-columns: 1fr; }
      .evidence-stats { grid-template-columns: repeat(2, 1fr); }
      .cards-grid { grid-template-columns: 1fr; }
    }

    /* Popover System */
    .popover-trigger {
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }

    .popover-trigger:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0,0,0,0.12);
    }

    .popover-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 100;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
    }

    .popover-overlay.active {
      opacity: 1;
      visibility: visible;
    }

    .popover {
      position: fixed;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.2);
      max-width: 600px;
      max-height: 80vh;
      width: calc(100% - 2rem);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transform: translateY(20px);
      opacity: 0;
      transition: transform 0.25s, opacity 0.25s;
      z-index: 101;
    }

    .popover.active {
      transform: translateY(0);
      opacity: 1;
    }

    .popover-header {
      padding: 1rem 1.25rem;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      flex-shrink: 0;
    }

    .popover-header.workflow { background: linear-gradient(135deg, #3B82F6, #6366F1); }
    .popover-header.role { background: linear-gradient(135deg, #8B5CF6, #6366F1); }
    .popover-header.tool { background: linear-gradient(135deg, #6366F1, #0891B2); }
    .popover-header.training { background: linear-gradient(135deg, #F59E0B, #D97706); }
    .popover-header.recommendation { background: linear-gradient(135deg, #10B981, #14B8A6); }
    .popover-header.bottleneck { background: linear-gradient(135deg, #EF4444, #F97316); }

    .popover-title {
      color: white;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .popover-subtitle {
      color: rgba(255,255,255,0.8);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .popover-close {
      width: 2rem;
      height: 2rem;
      border-radius: 0.5rem;
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      transition: background 0.15s;
      flex-shrink: 0;
      margin-left: 1rem;
    }

    .popover-close:hover {
      background: rgba(255,255,255,0.3);
    }

    .popover-content {
      padding: 1.25rem;
      overflow-y: auto;
      flex: 1;
    }

    .popover-section {
      margin-bottom: 1rem;
    }

    .popover-section:last-child {
      margin-bottom: 0;
    }

    .popover-section-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--slate-500);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .popover-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .popover-stat-card {
      background: var(--slate-50);
      border-radius: 0.5rem;
      padding: 0.75rem;
    }

    .popover-stat-label {
      font-size: 0.7rem;
      color: var(--slate-500);
      text-transform: uppercase;
    }

    .popover-stat-value {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--slate-800);
      margin-top: 0.125rem;
    }

    .popover-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .popover-list li {
      padding: 0.5rem 0;
      border-bottom: 1px solid var(--slate-100);
      font-size: 0.85rem;
      color: var(--slate-700);
    }

    .popover-list li:last-child {
      border-bottom: none;
    }

    .popover-description {
      font-size: 0.9rem;
      color: var(--slate-700);
      line-height: 1.6;
    }

    @media (max-width: 768px) {
      .popover {
        max-width: 100%;
        max-height: 85vh;
        width: 100%;
        bottom: 0;
        left: 0;
        right: 0;
        top: auto;
        border-radius: 1rem 1rem 0 0;
        transform: translateY(100%);
      }

      .popover.active {
        transform: translateY(0);
      }

      .popover-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="app-container">
    <!-- Header -->
    <header class="header">
      <h1>${escapeHtml(summary.title)}</h1>
      <div class="header-meta">
        <span>Process Audit Summary</span>
        <span>${data.totalInterviews || 0} interviews analyzed</span>
        <span>Generated ${generatedDate}</span>
      </div>
    </header>

    <!-- Sidebar Navigation -->
    <nav class="sidebar">
      <ul class="nav-list">
        ${navItems.map((item, index) => `
          <li>
            <a href="#${item.id}" class="nav-item${index === 0 ? ' active' : ''}" data-section="${item.id}">
              <span class="nav-icon">${item.icon}</span>
              <span>${item.label}</span>
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
              <div class="metric-label">Critical Issues</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${data.highRiskHandoffs?.length || 0}</div>
              <div class="metric-label">High-Risk Handoffs</div>
            </div>
          </div>

          <!-- Summary Narrative -->
          <div class="subsection">
            <div class="subsection-title">${icons.fileText} Summary</div>
            ${execSummary?.narrativeSummary
              ? `<p style="font-size: 0.9rem; line-height: 1.7; color: var(--slate-700);">${escapeHtml(execSummary.narrativeSummary)}</p>`
              : `<p style="font-size: 0.9rem; color: var(--slate-500); font-style: italic;">Executive summary not yet written.</p>`
            }
          </div>

          <!-- Key Findings -->
          ${execSummary?.keyFindings?.length ? `
          <div class="subsection">
            <div class="subsection-title">${icons.lightbulb} Key Findings</div>
            <ul class="findings-list">
              ${execSummary.keyFindings.map((finding, idx) => `
                <li>
                  <span class="finding-number">${idx + 1}</span>
                  <span>${escapeHtml(finding)}</span>
                </li>
              `).join('')}
            </ul>
          </div>
          ` : ''}

          <!-- Risks & Opportunities -->
          ${(execSummary?.topRisks?.length || execSummary?.topOpportunities?.length) ? `
          <div class="risk-opp-grid">
            <div class="risk-box">
              <h4>${icons.alertTriangle} Top Risks</h4>
              <ol>
                ${(execSummary?.topRisks || []).slice(0, 5).map(r => `<li>${escapeHtml(r.text)}</li>`).join('')}
                ${!execSummary?.topRisks?.length ? '<li style="color: var(--slate-500); font-style: italic;">No risks identified</li>' : ''}
              </ol>
            </div>
            <div class="opp-box">
              <h4>${icons.lightbulb} Top Opportunities</h4>
              <ol>
                ${(execSummary?.topOpportunities || []).slice(0, 5).map(o => `<li>${escapeHtml(o.text)}</li>`).join('')}
                ${!execSummary?.topOpportunities?.length ? '<li style="color: var(--slate-500); font-style: italic;">No opportunities identified</li>' : ''}
              </ol>
            </div>
          </div>
          ` : ''}

          <!-- Maturity Assessment -->
          ${execSummary?.maturityLevel ? `
          <div class="maturity-box">
            <div class="subsection-title">Readiness & Maturity Assessment</div>
            <div class="maturity-header">
              <span class="maturity-level-badge maturity-${execSummary.maturityLevel}">
                Level ${execSummary.maturityLevel}/5 - ${getMaturityLabel(execSummary.maturityLevel)}
              </span>
            </div>
            <div class="maturity-bar">
              <div class="maturity-fill maturity-${execSummary.maturityLevel}" style="width: ${execSummary.maturityLevel * 20}%; background: ${getMaturityColor(execSummary.maturityLevel)};"></div>
            </div>
            ${execSummary.maturityNotes ? `<p style="font-size: 0.85rem; color: var(--slate-600);">${escapeHtml(execSummary.maturityNotes)}</p>` : ''}
          </div>
          ` : ''}

          <!-- Priority Recommendations Preview -->
          ${data.recommendations?.filter(r => r.priority === 'high').length ? `
          <div class="subsection" style="background: var(--indigo-50); border: 1px solid var(--indigo-200);">
            <div class="subsection-title" style="color: var(--indigo-700);">${icons.zap} Priority Recommendations</div>
            <ul style="list-style: none; font-size: 0.85rem;">
              ${data.recommendations.filter(r => r.priority === 'high').slice(0, 3).map(r => `
                <li style="padding: 0.5rem 0; border-bottom: 1px solid var(--indigo-100);">• ${escapeHtml(r.text)}</li>
              `).join('')}
            </ul>
          </div>
          ` : ''}
        </section>

        <!-- Company Overview -->
        <section id="company" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.building2}</span>
            <h2 class="section-title">Company Overview</h2>
          </div>

          <!-- Project Metadata -->
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${data.totalInterviews || 0}</div>
              <div class="metric-label">Interviews Analyzed</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${auditDate}</div>
              <div class="metric-label">Date Range</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${generatedDate}</div>
              <div class="metric-label">Summary Generated</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${Object.keys(data.roleDistribution || {}).length}</div>
              <div class="metric-label">Unique Roles</div>
            </div>
          </div>

          <!-- Company Context -->
          <div class="subsection">
            <div class="subsection-title">Company Context</div>
            ${companyContext?.description ? `<p style="margin-bottom: 1rem; font-size: 0.9rem;">${escapeHtml(companyContext.description)}</p>` : ''}
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
              ${companyContext?.industry ? `
                <div>
                  <div style="font-size: 0.75rem; color: var(--slate-500); text-transform: uppercase; margin-bottom: 0.25rem;">Industry</div>
                  <div style="font-size: 0.9rem; color: var(--slate-800);">${escapeHtml(companyContext.industry)}</div>
                </div>
              ` : ''}
              ${companyContext?.companySize ? `
                <div>
                  <div style="font-size: 0.75rem; color: var(--slate-500); text-transform: uppercase; margin-bottom: 0.25rem;">Company Size</div>
                  <div style="font-size: 0.9rem; color: var(--slate-800);">${escapeHtml(companyContext.companySize)}</div>
                </div>
              ` : ''}
            </div>
            ${companyContext?.projectGoals ? `
              <div style="margin-top: 1rem;">
                <div style="font-size: 0.75rem; color: var(--slate-500); text-transform: uppercase; margin-bottom: 0.25rem;">Project Goals</div>
                <div style="font-size: 0.9rem; color: var(--slate-800);">${escapeHtml(companyContext.projectGoals)}</div>
              </div>
            ` : ''}
          </div>
        </section>

        <!-- Role & Responsibility -->
        <section id="roles" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.users}</span>
            <h2 class="section-title">Role & Responsibility</h2>
          </div>

          <p style="margin-bottom: 1rem; color: var(--slate-600); font-size: 0.9rem;">
            ${Object.keys(data.roleDistribution || {}).length} unique roles identified across ${data.totalInterviews || 0} interviews.
          </p>

          ${roleProfiles.length ? `
            <div class="cards-grid">
              ${roleProfiles.map(role => `
                <div class="profile-card popover-trigger" id="role-${slugify(role.title)}" data-popover-type="role" data-popover="${escapeHtmlAttribute(JSON.stringify({
                  title: role.title,
                  count: role.count,
                  responsibilities: role.responsibilities,
                  workflows: role.workflows,
                  tools: role.tools,
                  inputsFrom: role.inputsFrom,
                  outputsTo: role.outputsTo,
                  issuesDetected: role.issuesDetected,
                  trainingNeeds: role.trainingNeeds
                }))}">
                  <div class="profile-card-header">
                    <div class="profile-icon-box purple">${icons.users}</div>
                    <div>
                      <div class="profile-card-title">${escapeHtml(role.title)}</div>
                      <div class="profile-card-meta">${role.count} interview${role.count !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div class="profile-card-content">
                    ${role.responsibilities?.length ? `
                      <p><strong>Responsibilities:</strong> ${role.responsibilities.slice(0, 2).map(escapeHtml).join(', ')}${role.responsibilities.length > 2 ? ` +${role.responsibilities.length - 2} more` : ''}</p>
                    ` : ''}
                    <div class="tags-row">
                      ${role.workflows?.slice(0, 3).map(w => `<a href="#workflow-${slugify(w)}" class="tag tag-link" data-type="workflow" data-target="${escapeHtml(w)}" style="background: var(--indigo-100); color: var(--indigo-600);">${escapeHtml(w)}</a>`).join('')}
                      ${role.tools?.slice(0, 2).map(t => `<a href="#tool-${slugify(t)}" class="tag tag-link" data-type="tool" data-target="${escapeHtml(t)}" style="background: var(--blue-100); color: var(--blue-600);">${escapeHtml(t)}</a>`).join('')}
                    </div>
                  </div>
                  ${(role.issuesDetected?.length || role.trainingNeeds?.length) ? `
                    <div class="profile-card-footer">
                      ${role.issuesDetected?.length ? `<span class="badge badge-red">${role.issuesDetected.length} issues</span>` : ''}
                      ${role.trainingNeeds?.length ? `<span class="badge badge-amber">${role.trainingNeeds.length} training needs</span>` : ''}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="tags-row" style="gap: 0.75rem;">
              ${Object.entries(data.roleDistribution || {})
                .sort(([,a], [,b]) => (b as number) - (a as number))
                .map(([role, count]) => `
                  <span class="badge badge-purple" style="font-size: 0.8rem; padding: 0.4rem 0.75rem;">
                    ${escapeHtml(role)} <span style="background: white; padding: 0.1rem 0.4rem; border-radius: 9999px; margin-left: 0.5rem;">${count}</span>
                  </span>
                `).join('')}
            </div>
          `}
        </section>

        <!-- Workflow & Process -->
        <section id="workflows" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.trendingUp}</span>
            <h2 class="section-title">Workflow & Process</h2>
          </div>

          <p style="margin-bottom: 1rem; color: var(--slate-600); font-size: 0.9rem;">
            ${workflowProfiles.length || data.topWorkflows?.length || 0} workflows identified.
          </p>

          ${workflowProfiles.length ? `
            <div class="cards-grid">
              ${workflowProfiles.map(wf => `
                <div class="profile-card popover-trigger" id="workflow-${slugify(wf.name)}" data-popover-type="workflow" data-popover="${escapeHtmlAttribute(JSON.stringify({
                  name: wf.name,
                  count: wf.count,
                  frequency: wf.frequency,
                  steps: wf.steps,
                  participants: wf.participants,
                  systems: wf.systems,
                  failurePoints: wf.failurePoints,
                  unclearSteps: wf.unclearSteps
                }))}">
                  <div class="profile-card-header">
                    <div class="profile-icon-box blue">${icons.workflow}</div>
                    <div>
                      <div class="profile-card-title">${escapeHtml(wf.name)}</div>
                      <div class="profile-card-meta">
                        ${wf.count} mention${wf.count !== 1 ? 's' : ''}
                        ${wf.frequency ? ` • ${wf.frequency}` : ''}
                      </div>
                    </div>
                  </div>
                  <div class="profile-card-content">
                    ${wf.steps?.length ? `<p><strong>Steps:</strong> ${wf.steps.length}</p>` : ''}
                    <div class="tags-row">
                      ${wf.participants?.slice(0, 3).map(p => `<a href="#role-${slugify(p)}" class="tag tag-link" data-type="role" data-target="${escapeHtml(p)}">${escapeHtml(p)}</a>`).join('')}
                      ${wf.participants?.length && wf.participants.length > 3 ? `<span class="tag">+${wf.participants.length - 3} more</span>` : ''}
                    </div>
                    ${wf.systems?.length ? `
                      <div class="tags-row" style="margin-top: 0.375rem;">
                        ${wf.systems.slice(0, 3).map(s => `<a href="#tool-${slugify(s)}" class="tag tag-link" data-type="tool" data-target="${escapeHtml(s)}" style="background: var(--cyan-100); color: var(--cyan-600);">${escapeHtml(s)}</a>`).join('')}
                      </div>
                    ` : ''}
                  </div>
                  ${(wf.failurePoints?.length || wf.unclearSteps?.length) ? `
                    <div class="profile-card-footer">
                      ${wf.failurePoints?.length ? `<span class="badge badge-red">${wf.failurePoints.length} failure points</span>` : ''}
                      ${wf.unclearSteps?.length ? `<span class="badge badge-amber">${wf.unclearSteps.length} unclear steps</span>` : ''}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : data.topWorkflows?.length ? `
            <div class="cards-grid">
              ${data.topWorkflows.slice(0, 12).map((wf: any) => `
                <div class="profile-card">
                  <div class="profile-card-header">
                    <div class="profile-icon-box blue">${icons.workflow}</div>
                    <div>
                      <div class="profile-card-title">${escapeHtml(wf.name)}</div>
                      <div class="profile-card-meta">${wf.mentions || 0} mentions</div>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : '<p style="color: var(--slate-500);">No workflows identified yet.</p>'}
        </section>

        <!-- Risk & Bottlenecks -->
        <section id="risks" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.alertTriangle}</span>
            <h2 class="section-title">Risk, Friction, & Bottlenecks</h2>
          </div>

          <!-- Pain Points -->
          ${data.criticalPainPoints?.length ? `
            <div class="subsection">
              <div class="subsection-title">${icons.alertTriangle} Critical Pain Points (${data.criticalPainPoints.length})</div>
              ${data.criticalPainPoints.slice(0, 10).map((pp: any) => `
                <div class="pain-point-card popover-trigger ${pp.severity || 'medium'}" data-popover-type="bottleneck" data-popover="${escapeHtmlAttribute(JSON.stringify({
                  description: pp.description,
                  severity: pp.severity,
                  affectedCount: pp.affectedCount,
                  affectedRoles: pp.affectedRoles,
                  impact: pp.impact,
                  suggestedSolution: pp.suggestedSolution
                }))}">
                  <div style="display: flex; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span class="badge badge-${pp.severity === 'critical' ? 'red' : pp.severity === 'high' ? 'orange' : 'amber'}">${(pp.severity || 'MEDIUM').toUpperCase()}</span>
                    ${pp.affectedCount ? `<span class="badge badge-blue">${pp.affectedCount} affected</span>` : ''}
                  </div>
                  <p style="font-size: 0.9rem; color: var(--slate-700);">${escapeHtml(pp.description)}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- High-Risk Handoffs -->
          ${data.highRiskHandoffs?.length ? `
            <div class="subsection">
              <div class="subsection-title" style="color: var(--orange-600);">${icons.arrowRight} High-Risk Handoffs (${data.highRiskHandoffs.length})</div>
              ${data.highRiskHandoffs.slice(0, 8).map((h: any) => `
                <div class="handoff-card popover-trigger" data-popover-type="bottleneck" data-popover="${escapeHtmlAttribute(JSON.stringify({
                  fromRole: h.fromRole,
                  toRole: h.toRole,
                  process: h.process,
                  occurrences: h.occurrences,
                  description: h.description,
                  mitigation: h.mitigation
                }))}">
                  <div class="handoff-flow">
                    <a href="#role-${slugify(h.fromRole)}" class="handoff-role-link" data-type="role" data-target="${escapeHtml(h.fromRole)}">${escapeHtml(h.fromRole)}</a>
                    ${icons.arrowRight}
                    <a href="#role-${slugify(h.toRole)}" class="handoff-role-link" data-type="role" data-target="${escapeHtml(h.toRole)}">${escapeHtml(h.toRole)}</a>
                    ${h.occurrences ? `<span class="badge badge-orange" style="margin-left: auto;">${h.occurrences} occurrences</span>` : ''}
                  </div>
                  <div class="handoff-process">${escapeHtml(h.process)}</div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${!data.criticalPainPoints?.length && !data.highRiskHandoffs?.length ? '<p style="color: var(--slate-500);">No risks or issues identified yet.</p>' : ''}
        </section>

        <!-- Technology & Systems -->
        <section id="technology" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.wrench}</span>
            <h2 class="section-title">Technology & Systems</h2>
          </div>

          <p style="margin-bottom: 1rem; color: var(--slate-600); font-size: 0.9rem;">
            ${toolProfiles.length || data.commonTools?.length || 0} tools and systems identified.
          </p>

          ${toolProfiles.length ? `
            <div class="cards-grid">
              ${toolProfiles.map(tool => `
                <div class="profile-card popover-trigger" id="tool-${slugify(tool.name)}" data-popover-type="tool" data-popover="${escapeHtmlAttribute(JSON.stringify({
                  name: tool.name,
                  category: tool.category,
                  count: tool.count,
                  intendedPurpose: tool.intendedPurpose,
                  actualUsage: tool.actualUsage,
                  usedBy: tool.usedBy,
                  workflows: tool.workflows,
                  integratesWith: tool.integratesWith,
                  gaps: tool.gaps,
                  limitations: tool.limitations
                }))}" style="${tool.gaps?.some(g => g.severity === 'high') ? 'border-left: 3px solid var(--red-500);' : ''}">
                  <div class="profile-card-header">
                    <div class="profile-icon-box ${getCategoryColor(tool.category)}">${icons.wrench}</div>
                    <div>
                      <div class="profile-card-title">${escapeHtml(tool.name)}</div>
                      <div class="profile-card-meta">
                        <span class="badge badge-sm badge-slate">${tool.category || 'other'}</span>
                        ${tool.count} mention${tool.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div class="profile-card-content">
                    ${tool.intendedPurpose ? `<p style="font-size: 0.85rem;"><strong>Purpose:</strong> ${escapeHtml(tool.intendedPurpose)}</p>` : ''}
                    ${tool.usedBy?.length ? `
                      <div class="tags-row" style="margin-top: 0.5rem;">
                        ${tool.usedBy.slice(0, 3).map(u => `<a href="#role-${slugify(u.role)}" class="tag tag-link" data-type="role" data-target="${escapeHtml(u.role)}">${escapeHtml(u.role)}</a>`).join('')}
                        ${tool.usedBy.length > 3 ? `<span class="tag">+${tool.usedBy.length - 3} more</span>` : ''}
                      </div>
                    ` : ''}
                    ${tool.workflows?.length ? `
                      <div class="tags-row" style="margin-top: 0.375rem;">
                        ${tool.workflows.slice(0, 2).map(w => `<a href="#workflow-${slugify(w.name)}" class="tag tag-link" data-type="workflow" data-target="${escapeHtml(w.name)}" style="background: var(--blue-100); color: var(--blue-600);">${escapeHtml(w.name)}</a>`).join('')}
                      </div>
                    ` : ''}
                  </div>
                  ${tool.gaps?.length ? `
                    <div class="profile-card-footer">
                      <span class="badge badge-${tool.gaps.some(g => g.severity === 'high') ? 'red' : 'amber'}">${tool.gaps.length} gap${tool.gaps.length !== 1 ? 's' : ''}</span>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : data.commonTools?.length ? `
            <div class="cards-grid">
              ${data.commonTools.slice(0, 12).map((tool: any) => `
                <div class="profile-card">
                  <div class="profile-card-header">
                    <div class="profile-icon-box cyan">${icons.wrench}</div>
                    <div>
                      <div class="profile-card-title">${escapeHtml(tool.name)}</div>
                      <div class="profile-card-meta">${tool.userCount || 0} users</div>
                    </div>
                  </div>
                  ${tool.roles?.length ? `
                    <div class="profile-card-content">
                      <div class="tags-row">
                        ${tool.roles.slice(0, 3).map((r: string) => `<span class="tag">${escapeHtml(r)}</span>`).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : '<p style="color: var(--slate-500);">No tools identified yet.</p>'}
        </section>

        <!-- Training Gaps -->
        <section id="training" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.graduationCap}</span>
            <h2 class="section-title">Training & Capability Gaps</h2>
          </div>

          <p style="margin-bottom: 1rem; color: var(--slate-600); font-size: 0.9rem;">
            ${trainingGapProfiles.length || data.priorityTrainingGaps?.length || 0} training gaps identified.
          </p>

          ${trainingGapProfiles.length ? `
            <div class="cards-grid">
              ${trainingGapProfiles.map(gap => `
                <div class="profile-card popover-trigger" id="training-${slugify(gap.area)}" data-popover-type="training" data-popover="${escapeHtmlAttribute(JSON.stringify({
                  area: gap.area,
                  category: gap.category,
                  priority: gap.priority,
                  count: gap.count,
                  currentState: gap.currentState,
                  desiredState: gap.desiredState,
                  suggestedTraining: gap.suggestedTraining,
                  affectedRoles: gap.affectedRoles,
                  relatedSystems: gap.relatedSystems,
                  relatedWorkflows: gap.relatedWorkflows,
                  risk: gap.risk
                }))}" style="${gap.risk?.severity === 'critical' || gap.risk?.severity === 'high' ? 'border-left: 3px solid var(--red-500);' : ''}">
                  <div class="profile-card-header">
                    <div class="profile-icon-box ${gap.category === 'system' ? 'cyan' : gap.category === 'process' ? 'blue' : gap.category === 'skill' ? 'purple' : 'amber'}">${icons.graduationCap}</div>
                    <div>
                      <div class="profile-card-title">${escapeHtml(gap.area)}</div>
                      <div class="profile-card-meta">
                        <span class="badge badge-sm badge-${gap.priority === 'high' ? 'red' : gap.priority === 'medium' ? 'amber' : 'slate'}">${gap.priority?.toUpperCase() || 'MEDIUM'}</span>
                        ${gap.count} mention${gap.count !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div class="profile-card-content">
                    ${gap.currentState ? `<p style="font-size: 0.85rem;"><strong>Current:</strong> ${escapeHtml(gap.currentState)}</p>` : ''}
                    ${gap.desiredState ? `<p style="font-size: 0.85rem;"><strong>Target:</strong> ${escapeHtml(gap.desiredState)}</p>` : ''}
                    ${gap.affectedRoles?.length ? `
                      <div class="tags-row">
                        ${gap.affectedRoles.slice(0, 3).map(r => {
                          const roleName = typeof r === 'string' ? r : r.role;
                          return `<a href="#role-${slugify(roleName)}" class="tag tag-link" data-type="role" data-target="${escapeHtml(roleName)}">${escapeHtml(roleName)}</a>`;
                        }).join('')}
                      </div>
                    ` : ''}
                  </div>
                  ${gap.risk ? `
                    <div class="profile-card-footer">
                      <span class="badge badge-${gap.risk.severity === 'critical' ? 'red' : gap.risk.severity === 'high' ? 'orange' : 'amber'}">${gap.risk.severity?.toUpperCase()} RISK</span>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : data.priorityTrainingGaps?.length ? `
            <div class="cards-grid">
              ${data.priorityTrainingGaps.slice(0, 10).map((gap: any) => `
                <div class="profile-card">
                  <div class="profile-card-header">
                    <div class="profile-icon-box amber">${icons.graduationCap}</div>
                    <div>
                      <div class="profile-card-title">${escapeHtml(gap.area)}</div>
                      <div class="profile-card-meta">
                        <span class="badge badge-sm badge-${gap.priority === 'high' ? 'red' : 'amber'}">${(gap.priority || 'MEDIUM').toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  ${gap.affectedRoles?.length ? `
                    <div class="profile-card-content">
                      <div class="tags-row">
                        ${gap.affectedRoles.slice(0, 3).map((r: string) => `<span class="tag">${escapeHtml(r)}</span>`).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          ` : '<p style="color: var(--slate-500);">No training gaps identified yet.</p>'}
        </section>

        <!-- Recommendations -->
        <section id="recommendations" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.lightbulb}</span>
            <h2 class="section-title">Recommendations & Roadmap</h2>
          </div>

          ${recommendationProfiles.length ? renderRecommendationProfiles(recommendationProfiles) : renderRecommendationsByPriority(data.recommendations || [])}
        </section>

        <!-- Supporting Evidence -->
        <section id="evidence" class="section">
          <div class="section-header">
            <span class="section-icon">${icons.fileSearch}</span>
            <h2 class="section-title">Supporting Evidence</h2>
          </div>

          <div class="info-banner">
            <div class="info-banner-icon">${icons.info}</div>
            <div class="info-banner-content">
              <h4>Transparency Layer</h4>
              <p>This summary is based on ${data.totalInterviews || 0} interview${(data.totalInterviews || 0) !== 1 ? 's' : ''} conducted as part of the process audit. All findings and recommendations can be traced back to specific interview sources.</p>
            </div>
          </div>

          <div class="evidence-stats">
            <div class="evidence-stat">
              <div class="evidence-stat-icon" style="background: var(--purple-100); color: var(--purple-600);">${icons.users}</div>
              <div>
                <div class="evidence-stat-value">${Object.keys(data.roleDistribution || {}).length}</div>
                <div class="evidence-stat-label">Unique Roles</div>
              </div>
            </div>
            <div class="evidence-stat">
              <div class="evidence-stat-icon" style="background: var(--blue-100); color: var(--blue-600);">${icons.workflow}</div>
              <div>
                <div class="evidence-stat-value">${data.topWorkflows?.length || 0}</div>
                <div class="evidence-stat-label">Workflows</div>
              </div>
            </div>
            <div class="evidence-stat">
              <div class="evidence-stat-icon" style="background: var(--cyan-100); color: var(--cyan-600);">${icons.wrench}</div>
              <div>
                <div class="evidence-stat-value">${data.commonTools?.length || 0}</div>
                <div class="evidence-stat-label">Tools Identified</div>
              </div>
            </div>
            <div class="evidence-stat">
              <div class="evidence-stat-icon" style="background: var(--red-100); color: var(--red-600);">${icons.alertTriangle}</div>
              <div>
                <div class="evidence-stat-value">${data.criticalPainPoints?.length || 0}</div>
                <div class="evidence-stat-label">Issues Found</div>
              </div>
            </div>
          </div>

          <div class="subsection">
            <p style="font-size: 0.9rem; color: var(--slate-600);">
              <strong>Generated:</strong> ${generatedDate}<br>
              <strong>Audit Period:</strong> ${auditDate}<br>
              <strong>Source Interviews:</strong> ${summary.interview_ids?.length || data.totalInterviews || 0}
            </p>
          </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
          <p><strong>Generated by ConsultantAI</strong></p>
          <p style="margin-top: 0.5rem; opacity: 0.7;">${generatedDate} • Powered by Claude AI</p>
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

    // Cross-reference tag link click handler
    function highlightTarget(type, name) {
      // Slugify the name to match ID format
      const slug = name.toLowerCase().replace(/ +/g, '-').replace(/[^a-z0-9-]/g, '');
      const targetId = type + '-' + slug;
      const target = document.getElementById(targetId);

      if (target) {
        // Remove any existing highlights
        document.querySelectorAll('.profile-card.highlighted').forEach(el => {
          el.classList.remove('highlighted');
        });

        // Scroll to the target element
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Add highlight effect
        target.classList.add('highlighted');

        // Remove highlight after animation
        setTimeout(() => {
          target.classList.remove('highlighted');
        }, 3000);
      }
    }

    // Attach click handlers to all tag links
    document.querySelectorAll('.tag-link, .handoff-role-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const type = link.getAttribute('data-type');
        const targetName = link.getAttribute('data-target');
        if (type && targetName) {
          highlightTarget(type, targetName);
        }
      });
    });

    // Popover System
    const PopoverManager = {
      overlay: null,
      container: null,
      isOpen: false,

      init() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'popover-overlay';
        document.body.appendChild(this.overlay);

        this.container = document.createElement('div');
        this.container.className = 'popover';
        document.body.appendChild(this.container);

        this.overlay.addEventListener('click', () => this.close());
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && this.isOpen) this.close();
        });

        this.initTriggers();
      },

      initTriggers() {
        document.querySelectorAll('[data-popover]').forEach(el => {
          el.addEventListener('click', (e) => {
            if (e.target.closest('.tag-link, .handoff-role-link')) return;
            const data = JSON.parse(el.getAttribute('data-popover'));
            const type = el.getAttribute('data-popover-type');
            this.open(data, type);
          });
        });
      },

      open(data, type) {
        this.container.innerHTML = this.renderContent(data, type);
        this.positionPopover();
        this.overlay.classList.add('active');
        this.container.classList.add('active');
        this.isOpen = true;
        document.body.style.overflow = 'hidden';
        this.container.querySelector('.popover-close')?.addEventListener('click', () => this.close());
      },

      close() {
        this.overlay.classList.remove('active');
        this.container.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';
      },

      positionPopover() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          this.container.style.cssText = 'top:auto;bottom:0;left:0;right:0;transform:none;';
        } else {
          this.container.style.cssText = 'top:50%;left:50%;transform:translate(-50%,-50%);bottom:auto;right:auto;';
        }
      },

      renderContent(data, type) {
        switch (type) {
          case 'workflow': return this.renderWorkflow(data);
          case 'role': return this.renderRole(data);
          case 'tool': return this.renderTool(data);
          case 'training': return this.renderTraining(data);
          case 'recommendation': return this.renderRecommendation(data);
          case 'bottleneck': return this.renderBottleneck(data);
          default: return this.renderGeneric(data, type);
        }
      },

      esc(text) {
        if (!text) return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return String(text).replace(/[&<>"']/g, c => map[c]);
      },

      renderWorkflow(wf) {
        return \`
          <div class="popover-header workflow">
            <div><div class="popover-title">\${this.esc(wf.name)}</div>
            <div class="popover-subtitle">\${wf.frequency || 'N/A'} • \${wf.count || 0} mentions</div></div>
            <button class="popover-close">&times;</button>
          </div>
          <div class="popover-content">
            \${wf.steps?.length ? \`<div class="popover-section"><div class="popover-section-title">Process Steps (\${wf.steps.length})</div>
              <ul class="popover-list">\${wf.steps.map((s, i) => \`<li><strong>\${i+1}.</strong> \${this.esc(typeof s === 'string' ? s : (s.name || s.description || ''))}</li>\`).join('')}</ul></div>\` : ''}
            <div class="popover-grid">
              \${wf.participants?.length ? \`<div class="popover-stat-card"><div class="popover-stat-label">Participants</div>
                <div class="popover-stat-value">\${wf.participants.slice(0,4).join(', ')}\${wf.participants.length > 4 ? '...' : ''}</div></div>\` : ''}
              \${wf.systems?.length ? \`<div class="popover-stat-card"><div class="popover-stat-label">Systems</div>
                <div class="popover-stat-value">\${wf.systems.slice(0,4).join(', ')}\${wf.systems.length > 4 ? '...' : ''}</div></div>\` : ''}
            </div>
            \${wf.failurePoints?.length ? \`<div class="popover-section" style="background:var(--red-50);padding:0.75rem;border-radius:0.5rem;margin-top:1rem;">
              <div class="popover-section-title" style="color:var(--red-600);">Failure Points (\${wf.failurePoints.length})</div>
              <ul class="popover-list">\${wf.failurePoints.map(fp => \`<li style="color:var(--red-700);">\${this.esc(fp.description || fp)}</li>\`).join('')}</ul></div>\` : ''}
          </div>\`;
      },

      renderRole(role) {
        return \`
          <div class="popover-header role">
            <div><div class="popover-title">\${this.esc(role.title)}</div>
            <div class="popover-subtitle">\${role.count || 0} interview\${(role.count || 0) !== 1 ? 's' : ''}</div></div>
            <button class="popover-close">&times;</button>
          </div>
          <div class="popover-content">
            \${role.responsibilities?.length ? \`<div class="popover-section"><div class="popover-section-title">Responsibilities</div>
              <ul class="popover-list">\${role.responsibilities.map(r => \`<li>\${this.esc(r)}</li>\`).join('')}</ul></div>\` : ''}
            <div class="popover-grid">
              \${role.workflows?.length ? \`<div class="popover-stat-card"><div class="popover-stat-label">Workflows</div>
                <div class="popover-stat-value">\${role.workflows.length}</div></div>\` : ''}
              \${role.tools?.length ? \`<div class="popover-stat-card"><div class="popover-stat-label">Tools Used</div>
                <div class="popover-stat-value">\${role.tools.length}</div></div>\` : ''}
            </div>
            \${(role.inputsFrom?.length || role.outputsTo?.length) ? \`<div class="popover-section"><div class="popover-section-title">Dependencies</div>
              \${role.inputsFrom?.length ? \`<p style="font-size:0.85rem;margin-bottom:0.5rem;"><strong>Receives from:</strong> \${role.inputsFrom.map(d => d.role || d).join(', ')}</p>\` : ''}
              \${role.outputsTo?.length ? \`<p style="font-size:0.85rem;"><strong>Hands off to:</strong> \${role.outputsTo.map(d => d.role || d).join(', ')}</p>\` : ''}</div>\` : ''}
            \${role.issuesDetected?.length ? \`<div class="popover-section" style="background:var(--red-50);padding:0.75rem;border-radius:0.5rem;">
              <div class="popover-section-title" style="color:var(--red-600);">Issues (\${role.issuesDetected.length})</div>
              <ul class="popover-list">\${role.issuesDetected.map(i => \`<li style="color:var(--red-700);">\${this.esc(i.description || i)}</li>\`).join('')}</ul></div>\` : ''}
            \${role.trainingNeeds?.length ? \`<div class="popover-section" style="background:var(--amber-50);padding:0.75rem;border-radius:0.5rem;">
              <div class="popover-section-title" style="color:var(--amber-600);">Training Needs (\${role.trainingNeeds.length})</div>
              <ul class="popover-list">\${role.trainingNeeds.map(t => \`<li style="color:var(--amber-700);">\${this.esc(t.area || t)}</li>\`).join('')}</ul></div>\` : ''}
          </div>\`;
      },

      renderTool(tool) {
        return \`
          <div class="popover-header tool">
            <div><div class="popover-title">\${this.esc(tool.name)}</div>
            <div class="popover-subtitle">\${tool.category || 'other'} • \${tool.count || 0} mentions</div></div>
            <button class="popover-close">&times;</button>
          </div>
          <div class="popover-content">
            \${tool.intendedPurpose ? \`<div class="popover-section"><div class="popover-section-title">Purpose</div>
              <p class="popover-description">\${this.esc(tool.intendedPurpose)}</p></div>\` : ''}
            <div class="popover-grid">
              \${tool.usedBy?.length ? \`<div class="popover-stat-card"><div class="popover-stat-label">Used By</div>
                <div class="popover-stat-value">\${tool.usedBy.map(u => u.role || u).slice(0,3).join(', ')}\${tool.usedBy.length > 3 ? '...' : ''}</div></div>\` : ''}
              \${tool.workflows?.length ? \`<div class="popover-stat-card"><div class="popover-stat-label">Workflows</div>
                <div class="popover-stat-value">\${tool.workflows.length}</div></div>\` : ''}
            </div>
            \${tool.integratesWith?.length ? \`<div class="popover-section"><div class="popover-section-title">Integrations</div>
              <p style="font-size:0.85rem;">\${tool.integratesWith.join(', ')}</p></div>\` : ''}
            \${tool.gaps?.length ? \`<div class="popover-section" style="background:var(--amber-50);padding:0.75rem;border-radius:0.5rem;">
              <div class="popover-section-title" style="color:var(--amber-600);">Gaps (\${tool.gaps.length})</div>
              <ul class="popover-list">\${tool.gaps.map(g => \`<li style="color:var(--amber-700);"><strong>\${g.severity || ''}:</strong> \${this.esc(g.description || g)}</li>\`).join('')}</ul></div>\` : ''}
          </div>\`;
      },

      renderTraining(gap) {
        return \`
          <div class="popover-header training">
            <div><div class="popover-title">\${this.esc(gap.area)}</div>
            <div class="popover-subtitle">\${gap.priority || 'medium'} priority • \${gap.category || 'training'}</div></div>
            <button class="popover-close">&times;</button>
          </div>
          <div class="popover-content">
            <div class="popover-grid">
              <div class="popover-stat-card" style="background:var(--red-50);"><div class="popover-stat-label" style="color:var(--red-600);">Current State</div>
                <div class="popover-stat-value" style="font-size:0.85rem;color:var(--red-700);">\${this.esc(gap.currentState || 'Not documented')}</div></div>
              <div class="popover-stat-card" style="background:var(--green-50);"><div class="popover-stat-label" style="color:var(--green-600);">Desired State</div>
                <div class="popover-stat-value" style="font-size:0.85rem;color:var(--green-700);">\${this.esc(gap.desiredState || 'Not documented')}</div></div>
            </div>
            \${gap.suggestedTraining ? \`<div class="popover-section"><div class="popover-section-title">Suggested Training</div>
              <p class="popover-description">\${this.esc(gap.suggestedTraining)}</p></div>\` : ''}
            \${gap.affectedRoles?.length ? \`<div class="popover-section"><div class="popover-section-title">Affected Roles</div>
              <p style="font-size:0.85rem;">\${gap.affectedRoles.map(r => typeof r === 'string' ? r : r.role).join(', ')}</p></div>\` : ''}
            \${gap.risk ? \`<div class="popover-section" style="background:\${gap.risk.severity === 'critical' || gap.risk.severity === 'high' ? 'var(--red-50)' : 'var(--amber-50)'};padding:0.75rem;border-radius:0.5rem;">
              <div class="popover-section-title" style="color:\${gap.risk.severity === 'critical' || gap.risk.severity === 'high' ? 'var(--red-600)' : 'var(--amber-600)'};">Risk: \${(gap.risk.severity || '').toUpperCase()}</div>
              <p style="font-size:0.85rem;">\${this.esc(gap.risk.description || '')}</p>
              \${gap.risk.businessImpact ? \`<p style="font-size:0.85rem;margin-top:0.5rem;"><strong>Business Impact:</strong> \${this.esc(gap.risk.businessImpact)}</p>\` : ''}</div>\` : ''}
          </div>\`;
      },

      renderRecommendation(rec) {
        return \`
          <div class="popover-header recommendation">
            <div><div class="popover-title">\${this.esc(rec.title)}</div>
            <div class="popover-subtitle">\${rec.category || ''} • \${rec.phase || ''} • \${rec.priority || 'medium'} priority</div></div>
            <button class="popover-close">&times;</button>
          </div>
          <div class="popover-content">
            \${rec.description ? \`<div class="popover-section"><div class="popover-section-title">Description</div>
              <p class="popover-description">\${this.esc(rec.description)}</p></div>\` : ''}
            <div class="popover-grid">
              \${rec.problemAddressed ? \`<div class="popover-stat-card" style="background:var(--red-50);"><div class="popover-stat-label" style="color:var(--red-600);">Problem</div>
                <div class="popover-stat-value" style="font-size:0.8rem;color:var(--red-700);">\${this.esc(rec.problemAddressed)}</div></div>\` : ''}
              \${rec.expectedImpact ? \`<div class="popover-stat-card" style="background:var(--green-50);"><div class="popover-stat-label" style="color:var(--green-600);">Impact</div>
                <div class="popover-stat-value" style="font-size:0.8rem;color:var(--green-700);">\${this.esc(rec.expectedImpact)}</div></div>\` : ''}
            </div>
            \${rec.scope ? \`<div class="popover-section"><div class="popover-section-title">Scope</div>
              <p style="font-size:0.85rem;">\${this.esc(rec.scope)}</p></div>\` : ''}
            \${rec.levelOfEffort ? \`<div class="popover-section"><div class="popover-section-title">Effort Required</div>
              <span class="badge badge-\${rec.levelOfEffort === 'high' ? 'red' : rec.levelOfEffort === 'medium' ? 'amber' : 'green'}">\${(rec.levelOfEffort || '').toUpperCase()}</span>
              \${rec.effortDetails ? \`<p style="font-size:0.85rem;margin-top:0.5rem;">\${this.esc(rec.effortDetails)}</p>\` : ''}</div>\` : ''}
            \${rec.dependencies?.length ? \`<div class="popover-section"><div class="popover-section-title">Dependencies</div>
              <ul class="popover-list">\${rec.dependencies.map(d => \`<li>\${this.esc(d)}</li>\`).join('')}</ul></div>\` : ''}
            \${rec.relatedItems && (rec.relatedItems.roles?.length || rec.relatedItems.workflows?.length || rec.relatedItems.tools?.length) ? \`<div class="popover-section"><div class="popover-section-title">Related Items</div>
              \${rec.relatedItems.roles?.length ? \`<p style="font-size:0.85rem;"><strong>Roles:</strong> \${rec.relatedItems.roles.join(', ')}</p>\` : ''}
              \${rec.relatedItems.workflows?.length ? \`<p style="font-size:0.85rem;"><strong>Workflows:</strong> \${rec.relatedItems.workflows.join(', ')}</p>\` : ''}
              \${rec.relatedItems.tools?.length ? \`<p style="font-size:0.85rem;"><strong>Tools:</strong> \${rec.relatedItems.tools.join(', ')}</p>\` : ''}</div>\` : ''}
          </div>\`;
      },

      renderBottleneck(item) {
        const isHandoff = item.fromRole && item.toRole;
        return \`
          <div class="popover-header bottleneck">
            <div><div class="popover-title">\${this.esc(isHandoff ? \`\${item.fromRole} → \${item.toRole}\` : (item.description || 'Bottleneck'))}</div>
            <div class="popover-subtitle">\${item.severity || 'high'} severity\${item.occurrences ? \` • \${item.occurrences} occurrences\` : ''}</div></div>
            <button class="popover-close">&times;</button>
          </div>
          <div class="popover-content">
            \${item.description && !isHandoff ? \`<div class="popover-section"><div class="popover-section-title">Description</div>
              <p class="popover-description">\${this.esc(item.description)}</p></div>\` : ''}
            \${isHandoff ? \`<div class="popover-section"><div class="popover-section-title">Handoff Details</div>
              <p style="font-size:0.9rem;"><strong>\${this.esc(item.fromRole)}</strong> → <strong>\${this.esc(item.toRole)}</strong></p>
              \${item.process ? \`<p style="font-size:0.85rem;color:var(--slate-600);margin-top:0.25rem;">\${this.esc(item.process)}</p>\` : ''}</div>\` : ''}
            \${item.impact ? \`<div class="popover-section"><div class="popover-section-title">Impact</div>
              <p style="font-size:0.9rem;color:var(--red-700);">\${this.esc(item.impact)}</p></div>\` : ''}
            \${item.affectedRoles?.length ? \`<div class="popover-section"><div class="popover-section-title">Affected Roles</div>
              <p style="font-size:0.85rem;">\${item.affectedRoles.join(', ')}</p></div>\` : ''}
            \${(item.suggestedSolution || item.mitigation) ? \`<div class="popover-section" style="background:var(--green-50);padding:0.75rem;border-radius:0.5rem;">
              <div class="popover-section-title" style="color:var(--green-600);">Suggested Solution</div>
              <p style="font-size:0.85rem;color:var(--green-700);">\${this.esc(item.suggestedSolution || item.mitigation)}</p></div>\` : ''}
          </div>\`;
      },

      renderGeneric(data, type) {
        return \`
          <div class="popover-header" style="background:linear-gradient(135deg,var(--slate-600),var(--slate-700));">
            <div><div class="popover-title">\${this.esc(data.name || data.title || type)}</div></div>
            <button class="popover-close">&times;</button>
          </div>
          <div class="popover-content">
            <pre style="font-size:0.8rem;overflow-x:auto;">\${JSON.stringify(data, null, 2)}</pre>
          </div>\`;
      }
    };

    // Initialize popover system on DOM ready
    PopoverManager.init();
  </script>
</body>
</html>`;

  return html;
}

// Helper functions
function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

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

function escapeHtmlAttribute(json: string): string {
  return json
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function getMaturityLabel(level: number): string {
  const labels = ['', 'Initial', 'Developing', 'Defined', 'Managed', 'Optimizing'];
  return labels[level] || '';
}

function getMaturityColor(level: number): string {
  const colors = ['', 'var(--red-500)', 'var(--orange-500)', 'var(--amber-500)', 'var(--blue-500)', 'var(--green-500)'];
  return colors[level] || 'var(--slate-400)';
}

function getCategoryColor(category?: string): string {
  const colors: Record<string, string> = {
    crm: 'blue',
    pm: 'purple',
    spreadsheet: 'green',
    communication: 'amber',
    erp: 'indigo',
    custom: 'cyan',
    other: 'slate'
  };
  return colors[category || 'other'] || 'slate';
}

function renderRecommendationProfiles(profiles: RecommendationProfile[]): string {
  const immediate = profiles.filter(r => r.phase === 'immediate');
  const shortTerm = profiles.filter(r => r.phase === 'short-term');
  const longTerm = profiles.filter(r => r.phase === 'long-term');

  let html = '';

  if (immediate.length) {
    html += `
      <div class="phase-section">
        <div class="phase-header phase-immediate">
          ${icons.zap}
          <span class="phase-title">Immediate (0-30 days)</span>
          <span class="phase-count">${immediate.length} recommendations</span>
        </div>
        <div class="cards-grid">
          ${immediate.map(r => renderRecommendationCard(r)).join('')}
        </div>
      </div>
    `;
  }

  if (shortTerm.length) {
    html += `
      <div class="phase-section">
        <div class="phase-header phase-short">
          ${icons.clock}
          <span class="phase-title">Short-term (30-90 days)</span>
          <span class="phase-count">${shortTerm.length} recommendations</span>
        </div>
        <div class="cards-grid">
          ${shortTerm.map(r => renderRecommendationCard(r)).join('')}
        </div>
      </div>
    `;
  }

  if (longTerm.length) {
    html += `
      <div class="phase-section">
        <div class="phase-header phase-long">
          ${icons.calendar}
          <span class="phase-title">Long-term (90+ days)</span>
          <span class="phase-count">${longTerm.length} recommendations</span>
        </div>
        <div class="cards-grid">
          ${longTerm.map(r => renderRecommendationCard(r)).join('')}
        </div>
      </div>
    `;
  }

  if (!html) {
    html = '<p style="color: var(--slate-500);">No recommendations added yet.</p>';
  }

  return html;
}

function renderRecommendationCard(rec: RecommendationProfile): string {
  const categoryColors: Record<string, string> = {
    process: 'blue',
    training: 'amber',
    technology: 'cyan',
    organization: 'purple',
    'risk-mitigation': 'red'
  };

  const popoverData = escapeHtmlAttribute(JSON.stringify({
    title: rec.title,
    description: rec.description,
    category: rec.category,
    phase: rec.phase,
    priority: rec.priority,
    problemAddressed: rec.problemAddressed,
    scope: rec.scope,
    expectedImpact: rec.expectedImpact,
    levelOfEffort: rec.levelOfEffort,
    effortDetails: rec.effortDetails,
    dependencies: rec.dependencies,
    relatedItems: rec.relatedItems,
    source: rec.source
  }));

  return `
    <div class="profile-card popover-trigger" id="rec-${slugify(rec.title)}" data-popover-type="recommendation" data-popover="${popoverData}" style="${rec.priority === 'high' ? 'border-left: 3px solid var(--red-500);' : ''}">
      <div class="profile-card-header">
        <div class="profile-icon-box ${categoryColors[rec.category] || 'indigo'}">${icons.lightbulb}</div>
        <div>
          <div class="profile-card-title">${escapeHtml(rec.title)}</div>
          <div class="profile-card-meta">
            <span class="badge badge-sm badge-${categoryColors[rec.category] || 'slate'}">${rec.category}</span>
            <span class="badge badge-sm badge-${rec.levelOfEffort === 'high' ? 'red' : rec.levelOfEffort === 'medium' ? 'amber' : 'green'}">${rec.levelOfEffort} effort</span>
          </div>
        </div>
      </div>
      <div class="profile-card-content">
        ${rec.problemAddressed ? `<p style="font-size: 0.85rem;"><strong>Problem:</strong> ${escapeHtml(rec.problemAddressed)}</p>` : ''}
        ${rec.expectedImpact ? `<p style="font-size: 0.85rem;"><strong>Impact:</strong> ${escapeHtml(rec.expectedImpact)}</p>` : ''}
        ${rec.relatedItems?.roles?.length ? `
          <div class="tags-row">
            ${rec.relatedItems.roles.slice(0, 3).map(r => `<a href="#role-${slugify(r)}" class="tag tag-link" data-type="role" data-target="${escapeHtml(r)}">${escapeHtml(r)}</a>`).join('')}
          </div>
        ` : ''}
      </div>
      <div class="profile-card-footer">
        <span class="badge badge-${rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'amber' : 'green'}">${rec.priority} priority</span>
        ${rec.source === 'auto' ? '<span class="badge badge-slate">auto-generated</span>' : ''}
        ${rec.dependencies?.length ? `<span class="badge badge-slate">${rec.dependencies.length} dependencies</span>` : ''}
      </div>
    </div>
  `;
}

function renderRecommendationsByPriority(recommendations: Array<{ id?: string; text: string; priority?: string }>): string {
  const high = recommendations.filter(r => r.priority === 'high');
  const medium = recommendations.filter(r => r.priority === 'medium');
  const low = recommendations.filter(r => r.priority === 'low' || !r.priority);

  let html = '';

  if (high.length) {
    html += `
      <div class="phase-section">
        <div class="phase-header phase-immediate">
          ${icons.zap}
          <span class="phase-title">Immediate (0-30 days)</span>
          <span class="phase-count">${high.length} recommendations</span>
        </div>
        <ul style="list-style: none;">
          ${high.map(r => `<li style="padding: 0.75rem; background: var(--slate-50); border-radius: 0.5rem; margin-bottom: 0.5rem; font-size: 0.9rem;">• ${escapeHtml(r.text)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (medium.length) {
    html += `
      <div class="phase-section">
        <div class="phase-header phase-short">
          ${icons.clock}
          <span class="phase-title">Short-term (30-90 days)</span>
          <span class="phase-count">${medium.length} recommendations</span>
        </div>
        <ul style="list-style: none;">
          ${medium.map(r => `<li style="padding: 0.75rem; background: var(--slate-50); border-radius: 0.5rem; margin-bottom: 0.5rem; font-size: 0.9rem;">• ${escapeHtml(r.text)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (low.length) {
    html += `
      <div class="phase-section">
        <div class="phase-header phase-long">
          ${icons.calendar}
          <span class="phase-title">Long-term (90+ days)</span>
          <span class="phase-count">${low.length} recommendations</span>
        </div>
        <ul style="list-style: none;">
          ${low.map(r => `<li style="padding: 0.75rem; background: var(--slate-50); border-radius: 0.5rem; margin-bottom: 0.5rem; font-size: 0.9rem;">• ${escapeHtml(r.text)}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  if (!html) {
    html = '<p style="color: var(--slate-500);">No recommendations added yet.</p>';
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
