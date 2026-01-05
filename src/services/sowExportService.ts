import { CompanySummary } from '../types/database';
import { RecommendationProfile, SummarySOWConfig, DeliveryWorkType, DeliveryDomain, DeliverableType, SOWDocument, SOWPhase, SOWPackage } from '../types/analysis';
import { formatCurrency } from '../utils/formatters';

const workTypeLabels: Record<DeliveryWorkType, string> = {
  'workflow-mapping': 'Workflow Mapping',
  'sop-creation': 'SOP Creation',
  'role-clarity-raci': 'Role Clarity / RACI',
  'system-configuration': 'System Configuration',
  'automation-build': 'Automation Build',
  'training-development': 'Training Development',
  'training-delivery': 'Training Delivery',
  'assessment-audit': 'Assessment / Audit',
  'change-management': 'Change Management',
  'other': 'Other',
};

const domainLabels: Record<DeliveryDomain, string> = {
  'role-responsibility': 'Role & Responsibility',
  'workflow-process': 'Workflow & Process',
  'technology-systems': 'Technology & Systems',
  'risk-bottlenecks': 'Risk & Bottlenecks',
  'training-adoption': 'Training & Adoption',
};

const deliverableLabels: Record<DeliverableType, string> = {
  'sop-document': 'SOP Document',
  'checklist': 'Checklist',
  'template': 'Template',
  'process-map': 'Process Map',
  'training-micro': 'Micro Training',
  'training-session': 'Training Session',
  'dashboard-report': 'Dashboard/Report',
  'raci-matrix': 'RACI Matrix',
  'job-aid': 'Job Aid',
  'other': 'Other',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

interface SOWExportData {
  summary: CompanySummary;
  recommendationProfiles: RecommendationProfile[];
  sowConfig: SummarySOWConfig;
}

export function generateSOWHTML(data: SOWExportData): string {
  const { summary, recommendationProfiles, sowConfig } = data;

  // Filter to only included profiles
  const includedProfiles = recommendationProfiles.filter(
    p => p.deliveryProfile && !p.deliveryProfile.excludeFromEstimate
  );

  // Calculate totals
  const totals = includedProfiles.reduce(
    (acc, profile) => {
      const delivery = profile.deliveryProfile!;
      const rate = delivery.hourlyRateOverride ?? sowConfig.defaultHourlyRate;
      const cost = delivery.estimatedHours * rate;

      acc.totalHours += delivery.estimatedHours;
      acc.totalCost += cost;
      delivery.deliverables.forEach(d => acc.deliverables.add(d));

      return acc;
    },
    { totalHours: 0, totalCost: 0, deliverables: new Set<DeliverableType>() }
  );

  // Group by domain
  const byDomain = includedProfiles.reduce((acc, profile) => {
    const domain = profile.deliveryProfile!.primaryDomain;
    if (!acc[domain]) acc[domain] = [];
    acc[domain].push(profile);
    return acc;
  }, {} as Record<DeliveryDomain, RecommendationProfile[]>);

  // Count deliverables
  const deliverableCounts: Record<string, number> = {};
  includedProfiles.forEach(p => {
    p.deliveryProfile!.deliverables.forEach(d => {
      deliverableCounts[d] = (deliverableCounts[d] || 0) + 1;
    });
  });

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scope of Work - ${escapeHtml(sowConfig.projectName || summary.title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      padding: 40px;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 8px;
    }
    .header-meta {
      opacity: 0.9;
      font-size: 14px;
    }
    .header-meta span {
      display: inline-block;
      margin-right: 20px;
    }
    .content {
      padding: 40px;
    }
    .summary-box {
      background: #f1f5f9;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .summary-stat {
      text-align: center;
    }
    .summary-stat .value {
      font-size: 28px;
      font-weight: 700;
      color: #4f46e5;
    }
    .summary-stat .label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section {
      margin-bottom: 32px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e2e8f0;
    }
    .domain-section {
      margin-bottom: 24px;
    }
    .domain-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .domain-badge {
      background: #e0e7ff;
      color: #4338ca;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th {
      background: #f8fafc;
      text-align: left;
      padding: 12px;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .line-item-title {
      font-weight: 600;
      color: #1e293b;
    }
    .work-type {
      font-size: 12px;
      color: #64748b;
    }
    .deliverables {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .deliverable-tag {
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
    }
    .text-right {
      text-align: right;
    }
    .totals-row {
      background: #4f46e5;
      color: white;
    }
    .totals-row td {
      border-bottom: none;
      font-weight: 600;
    }
    .deliverables-summary {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
    }
    .deliverable-item {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      background: #f8fafc;
      border-radius: 8px;
    }
    .terms {
      background: #fefce8;
      border: 1px solid #fef08a;
      border-radius: 8px;
      padding: 20px;
      font-size: 13px;
    }
    .terms h4 {
      margin-bottom: 8px;
      color: #854d0e;
    }
    .disclaimer {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 16px;
      font-size: 12px;
      color: #64748b;
      font-style: italic;
    }
    .footer {
      text-align: center;
      padding: 24px 40px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
      }
      .header {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>${escapeHtml(sowConfig.projectName || 'Scope of Work')}</h1>
      <div class="header-meta">
        ${sowConfig.clientName ? `<span>Client: ${escapeHtml(sowConfig.clientName)}</span>` : ''}
        <span>Date: ${formatDate(summary.created_at)}</span>
        ${sowConfig.validUntil ? `<span>Valid Until: ${formatDate(sowConfig.validUntil)}</span>` : ''}
      </div>
    </header>

    <div class="content">
      <!-- Executive Summary -->
      <div class="summary-box">
        <div class="summary-stat">
          <div class="value">${includedProfiles.length}</div>
          <div class="label">Line Items</div>
        </div>
        <div class="summary-stat">
          <div class="value">${totals.deliverables.size}</div>
          <div class="label">Deliverables</div>
        </div>
        <div class="summary-stat">
          <div class="value">${totals.totalHours}</div>
          <div class="label">Total Hours</div>
        </div>
        <div class="summary-stat">
          <div class="value">${formatCurrency(totals.totalCost, sowConfig.currency)}</div>
          <div class="label">Estimated Total</div>
        </div>
      </div>

      <!-- Line Items by Domain -->
      <div class="section">
        <h2 class="section-title">Scope of Work Details</h2>

        ${Object.entries(byDomain).map(([domain, profiles]) => {
          const domainTotal = profiles.reduce((sum, p) => {
            const d = p.deliveryProfile!;
            const rate = d.hourlyRateOverride ?? sowConfig.defaultHourlyRate;
            return sum + (d.estimatedHours * rate);
          }, 0);
          const domainHours = profiles.reduce((sum, p) => sum + (p.deliveryProfile?.estimatedHours || 0), 0);

          return `
          <div class="domain-section">
            <div class="domain-header">
              <span class="domain-badge">${domainLabels[domain as DeliveryDomain]}</span>
              <span style="color: #64748b; font-size: 14px;">${profiles.length} item(s) • ${domainHours} hrs • ${formatCurrency(domainTotal, sowConfig.currency)}</span>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 35%;">Item</th>
                  <th style="width: 25%;">Deliverables</th>
                  <th class="text-right" style="width: 15%;">Hours</th>
                  <th class="text-right" style="width: 10%;">Rate</th>
                  <th class="text-right" style="width: 15%;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${profiles.map(p => {
                  const d = p.deliveryProfile!;
                  const rate = d.hourlyRateOverride ?? sowConfig.defaultHourlyRate;
                  const cost = d.estimatedHours * rate;
                  return `
                    <tr>
                      <td>
                        <div class="line-item-title">${escapeHtml(p.title)}</div>
                        <div class="work-type">${workTypeLabels[d.workType]}</div>
                      </td>
                      <td>
                        <div class="deliverables">
                          ${d.deliverables.map(del => `<span class="deliverable-tag">${deliverableLabels[del]}</span>`).join('')}
                        </div>
                      </td>
                      <td class="text-right">${d.estimatedHours}</td>
                      <td class="text-right">${formatCurrency(rate, sowConfig.currency)}</td>
                      <td class="text-right">${formatCurrency(cost, sowConfig.currency)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          `;
        }).join('')}

        <!-- Totals Row -->
        <table>
          <tbody>
            <tr class="totals-row">
              <td>Total</td>
              <td></td>
              <td class="text-right">${totals.totalHours} hrs</td>
              <td class="text-right">${formatCurrency(sowConfig.defaultHourlyRate, sowConfig.currency)}/hr avg</td>
              <td class="text-right">${formatCurrency(totals.totalCost, sowConfig.currency)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Deliverables Summary -->
      <div class="section">
        <h2 class="section-title">Deliverables Summary</h2>
        <div class="deliverables-summary">
          ${Object.entries(deliverableCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([type, count]) => `
              <div class="deliverable-item">
                <span>${deliverableLabels[type as DeliverableType]}</span>
                <strong>${count}</strong>
              </div>
            `).join('')}
        </div>
      </div>

      ${sowConfig.termsAndConditions ? `
      <!-- Terms & Conditions -->
      <div class="section">
        <div class="terms">
          <h4>Terms & Conditions</h4>
          <p>${escapeHtml(sowConfig.termsAndConditions).replace(/\n/g, '<br>')}</p>
        </div>
      </div>
      ` : ''}

      ${sowConfig.disclaimerText ? `
      <!-- Disclaimer -->
      <div class="section">
        <div class="disclaimer">
          ${escapeHtml(sowConfig.disclaimerText).replace(/\n/g, '<br>')}
        </div>
      </div>
      ` : ''}
    </div>

    <footer class="footer">
      <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p>Powered by ConsultantAI</p>
    </footer>
  </div>
</body>
</html>
  `.trim();

  return html;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function downloadSOWHTML(html: string, filename: string): void {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// ENHANCED SOW EXPORT (with phases and packages)
// ============================================

interface EnhancedSOWExportData {
  recommendationProfiles: RecommendationProfile[];
  sowConfig: SummarySOWConfig;
  sowDocument: SOWDocument;
}

export function generateEnhancedSOWHTML(data: EnhancedSOWExportData): string {
  const { recommendationProfiles, sowConfig, sowDocument } = data;

  // Get selected profiles
  const selectedProfiles = recommendationProfiles.filter(
    p => sowDocument.selectedRecommendationIds.includes(p.id) &&
      p.deliveryProfile &&
      !p.deliveryProfile.excludeFromEstimate
  );

  // Calculate totals
  const totals = selectedProfiles.reduce(
    (acc, profile) => {
      const delivery = profile.deliveryProfile!;
      const rate = delivery.hourlyRateOverride ?? sowConfig.defaultHourlyRate;
      const cost = delivery.estimatedHours * rate;
      acc.totalHours += delivery.estimatedHours;
      acc.totalCost += cost;
      delivery.deliverables.forEach(d => acc.deliverables.add(d));
      return acc;
    },
    { totalHours: 0, totalCost: 0, deliverables: new Set<DeliverableType>() }
  );

  // Helper to get profiles for a phase
  const getPhaseProfiles = (phase: SOWPhase) => {
    return selectedProfiles.filter(p => phase.recommendationIds.includes(p.id));
  };

  // Helper to get profiles for a package
  const getPackageProfiles = (pkg: SOWPackage) => {
    return selectedProfiles.filter(p => pkg.recommendationIds.includes(p.id));
  };

  // Calculate package totals
  const getPackageTotals = (pkg: SOWPackage) => {
    const profiles = getPackageProfiles(pkg);
    const baseTotals = profiles.reduce(
      (acc, p) => {
        if (p.deliveryProfile) {
          const hours = p.deliveryProfile.estimatedHours;
          const rate = p.deliveryProfile.hourlyRateOverride ?? sowConfig.defaultHourlyRate;
          acc.hours += hours;
          acc.cost += hours * rate;
        }
        return acc;
      },
      { hours: 0, cost: 0 }
    );
    const discount = pkg.discountPercent || 0;
    return {
      ...baseTotals,
      discountedCost: baseTotals.cost * (1 - discount / 100),
      discount,
    };
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scope of Work - ${escapeHtml(sowConfig.projectName || 'Proposal')}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      background: #f8fafc;
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
      padding: 40px;
    }
    .header h1 {
      font-size: 32px;
      margin-bottom: 8px;
    }
    .header-meta {
      opacity: 0.9;
      font-size: 14px;
    }
    .header-meta span {
      display: inline-block;
      margin-right: 20px;
    }
    .content {
      padding: 40px;
    }
    .section {
      margin-bottom: 40px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 3px solid #4f46e5;
    }
    .text-content {
      white-space: pre-wrap;
      color: #475569;
      font-size: 15px;
    }
    .summary-box {
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .summary-stat {
      text-align: center;
    }
    .summary-stat .value {
      font-size: 28px;
      font-weight: 700;
      color: #4f46e5;
    }
    .summary-stat .label {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .phase-section {
      margin-bottom: 32px;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }
    .phase-header {
      background: #f8fafc;
      padding: 16px 20px;
      border-bottom: 1px solid #e2e8f0;
    }
    .phase-header h3 {
      font-size: 16px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;
    }
    .phase-header p {
      font-size: 13px;
      color: #64748b;
    }
    .phase-stats {
      display: flex;
      gap: 16px;
      margin-top: 8px;
      font-size: 13px;
      color: #475569;
    }
    .phase-stats span {
      background: #e0e7ff;
      padding: 2px 8px;
      border-radius: 4px;
      color: #4338ca;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    th {
      background: #f8fafc;
      text-align: left;
      padding: 12px 16px;
      font-weight: 600;
      color: #475569;
      border-bottom: 2px solid #e2e8f0;
    }
    td {
      padding: 12px 16px;
      border-bottom: 1px solid #f1f5f9;
      vertical-align: top;
    }
    tr:last-child td {
      border-bottom: none;
    }
    .line-item-title {
      font-weight: 600;
      color: #1e293b;
    }
    .work-type {
      font-size: 12px;
      color: #64748b;
    }
    .deliverables {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .deliverable-tag {
      background: #e0f2fe;
      color: #0369a1;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
    }
    .text-right {
      text-align: right;
    }
    .package-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    .package-card {
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      transition: border-color 0.2s;
    }
    .package-card.recommended {
      border-color: #4f46e5;
    }
    .package-card-header {
      background: #f8fafc;
      padding: 20px;
      text-align: center;
      border-bottom: 1px solid #e2e8f0;
    }
    .package-card.recommended .package-card-header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      color: white;
    }
    .package-card-header h3 {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    .package-price {
      font-size: 32px;
      font-weight: 700;
      color: #4f46e5;
    }
    .package-card.recommended .package-price {
      color: white;
    }
    .package-price-original {
      font-size: 16px;
      color: #94a3b8;
      text-decoration: line-through;
      margin-right: 8px;
    }
    .package-discount {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
    }
    .package-card.recommended .package-discount {
      background: rgba(255,255,255,0.2);
      color: white;
    }
    .package-content {
      padding: 20px;
    }
    .package-description {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 16px;
    }
    .package-items {
      list-style: none;
    }
    .package-items li {
      padding: 8px 0;
      border-bottom: 1px solid #f1f5f9;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .package-items li:last-child {
      border-bottom: none;
    }
    .package-items li::before {
      content: "✓";
      color: #22c55e;
      font-weight: bold;
    }
    .terms {
      background: #fefce8;
      border: 1px solid #fef08a;
      border-radius: 8px;
      padding: 20px;
      font-size: 13px;
    }
    .terms h4 {
      margin-bottom: 12px;
      color: #854d0e;
      font-size: 14px;
    }
    .disclaimer {
      background: #f1f5f9;
      border-radius: 8px;
      padding: 16px;
      font-size: 12px;
      color: #64748b;
      font-style: italic;
    }
    .footer {
      text-align: center;
      padding: 24px 40px;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #64748b;
    }
    @media print {
      body {
        background: white;
        padding: 0;
      }
      .container {
        box-shadow: none;
      }
      .header {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .package-card.recommended .package-card-header {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header class="header">
      <h1>${escapeHtml(sowConfig.projectName || 'Scope of Work')}</h1>
      <div class="header-meta">
        ${sowConfig.clientName ? `<span>Prepared for: ${escapeHtml(sowConfig.clientName)}</span>` : ''}
        <span>Date: ${formatDate(new Date().toISOString())}</span>
        ${sowConfig.validUntil ? `<span>Valid Until: ${formatDate(sowConfig.validUntil)}</span>` : ''}
      </div>
    </header>

    <div class="content">
      <!-- Quick Stats -->
      <div class="summary-box">
        <div class="summary-stat">
          <div class="value">${selectedProfiles.length}</div>
          <div class="label">Initiatives</div>
        </div>
        <div class="summary-stat">
          <div class="value">${totals.deliverables.size}</div>
          <div class="label">Deliverables</div>
        </div>
        <div class="summary-stat">
          <div class="value">${totals.totalHours}</div>
          <div class="label">Total Hours</div>
        </div>
        <div class="summary-stat">
          <div class="value">${formatCurrency(totals.totalCost, sowConfig.currency)}</div>
          <div class="label">Investment</div>
        </div>
      </div>

      ${sowDocument.executiveSummary ? `
      <!-- Executive Summary -->
      <div class="section">
        <h2 class="section-title">Executive Summary</h2>
        <div class="text-content">${escapeHtml(sowDocument.executiveSummary)}</div>
      </div>
      ` : ''}

      ${sowDocument.objective ? `
      <!-- Objective -->
      <div class="section">
        <h2 class="section-title">Objective</h2>
        <div class="text-content">${escapeHtml(sowDocument.objective)}</div>
      </div>
      ` : ''}

      ${sowDocument.phases.length > 0 ? `
      <!-- Implementation Plan -->
      <div class="section">
        <h2 class="section-title">Implementation Plan</h2>
        ${sowDocument.phases.sort((a, b) => a.order - b.order).map(phase => {
          const phaseProfiles = getPhaseProfiles(phase);
          if (phaseProfiles.length === 0) return '';

          const phaseTotals = phaseProfiles.reduce(
            (acc, p) => {
              if (p.deliveryProfile) {
                const hours = p.deliveryProfile.estimatedHours;
                const rate = p.deliveryProfile.hourlyRateOverride ?? sowConfig.defaultHourlyRate;
                acc.hours += hours;
                acc.cost += hours * rate;
              }
              return acc;
            },
            { hours: 0, cost: 0 }
          );

          return `
          <div class="phase-section">
            <div class="phase-header">
              <h3>${escapeHtml(phase.name)}</h3>
              <p>${escapeHtml(phase.description)}</p>
              <div class="phase-stats">
                <span>${phaseProfiles.length} items</span>
                <span>${phaseTotals.hours} hours</span>
                <span>${formatCurrency(phaseTotals.cost, sowConfig.currency)}</span>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th style="width: 45%;">Item</th>
                  <th style="width: 25%;">Deliverables</th>
                  <th class="text-right" style="width: 15%;">Hours</th>
                  <th class="text-right" style="width: 15%;">Investment</th>
                </tr>
              </thead>
              <tbody>
                ${phaseProfiles.map(p => {
                  const d = p.deliveryProfile!;
                  const rate = d.hourlyRateOverride ?? sowConfig.defaultHourlyRate;
                  const cost = d.estimatedHours * rate;
                  return `
                    <tr>
                      <td>
                        <div class="line-item-title">${escapeHtml(p.title)}</div>
                        <div class="work-type">${workTypeLabels[d.workType]}</div>
                      </td>
                      <td>
                        <div class="deliverables">
                          ${d.deliverables.map(del => `<span class="deliverable-tag">${deliverableLabels[del]}</span>`).join('')}
                        </div>
                      </td>
                      <td class="text-right">${d.estimatedHours}</td>
                      <td class="text-right">${formatCurrency(cost, sowConfig.currency)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          `;
        }).join('')}
      </div>
      ` : ''}

      ${sowDocument.packages.length > 0 ? `
      <!-- Package Options -->
      <div class="section">
        <h2 class="section-title">Package Options</h2>
        <div class="package-grid">
          ${sowDocument.packages.sort((a, b) => a.order - b.order).map((pkg, index) => {
            const pkgProfiles = getPackageProfiles(pkg);
            const pkgTotals = getPackageTotals(pkg);
            const isMiddle = sowDocument.packages.length === 3 && index === 1;

            return `
            <div class="package-card${isMiddle ? ' recommended' : ''}">
              <div class="package-card-header">
                <h3>${escapeHtml(pkg.name)}</h3>
                ${pkgTotals.discount > 0 ? `
                  <span class="package-price-original">${formatCurrency(pkgTotals.cost, sowConfig.currency)}</span>
                ` : ''}
                <div class="package-price">${formatCurrency(pkgTotals.discountedCost, sowConfig.currency)}</div>
                ${pkgTotals.discount > 0 ? `
                  <div class="package-discount">Save ${pkgTotals.discount}%</div>
                ` : ''}
              </div>
              <div class="package-content">
                <p class="package-description">${escapeHtml(pkg.description)}</p>
                <ul class="package-items">
                  ${pkgProfiles.map(p => `<li>${escapeHtml(p.title)}</li>`).join('')}
                </ul>
              </div>
            </div>
            `;
          }).join('')}
        </div>
      </div>
      ` : ''}

      ${sowConfig.termsAndConditions ? `
      <!-- Terms & Conditions -->
      <div class="section">
        <div class="terms">
          <h4>Terms & Conditions</h4>
          <p>${escapeHtml(sowConfig.termsAndConditions).replace(/\n/g, '<br>')}</p>
        </div>
      </div>
      ` : ''}

      ${sowConfig.disclaimerText ? `
      <!-- Disclaimer -->
      <div class="section">
        <div class="disclaimer">
          ${escapeHtml(sowConfig.disclaimerText).replace(/\n/g, '<br>')}
        </div>
      </div>
      ` : ''}
    </div>

    <footer class="footer">
      <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p>Powered by ConsultantAI</p>
    </footer>
  </div>
</body>
</html>
  `.trim();

  return html;
}
