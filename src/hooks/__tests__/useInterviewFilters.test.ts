import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInterviewFilters } from '../useInterviewFilters';
import { Interview } from '../../types/database';

// Mock interview data
const mockInterviews: Interview[] = [
  {
    id: '1',
    user_id: 'user1',
    company_id: 'company1',
    title: 'Interview with John',
    transcript_text: 'Discussion about sales process',
    analysis_status: 'completed',
    workflows: null,
    pain_points: [{ issue: 'Slow CRM', severity: 'high' }] as unknown as Interview['pain_points'],
    tools: [{ name: 'Salesforce', purpose: 'CRM' }] as unknown as Interview['tools'],
    roles: null,
    training_gaps: null,
    handoff_risks: null,
    raw_analysis_response: null,
    error_message: null,
    analyzed_at: '2024-01-15T10:00:00Z',
    created_at: '2024-01-01T10:00:00Z',
    updated_at: '2024-01-01T10:00:00Z',
    interview_date: null,
    interviewee_name: 'John',
    interviewee_role: 'Sales Rep',
    department: 'Sales',
  },
  {
    id: '2',
    user_id: 'user1',
    company_id: 'company1',
    title: 'Interview with Jane',
    transcript_text: 'Marketing automation discussion',
    analysis_status: 'pending',
    workflows: null,
    pain_points: [{ issue: 'Manual reporting', severity: 'medium' }] as unknown as Interview['pain_points'],
    tools: [{ name: 'HubSpot', purpose: 'Marketing' }] as unknown as Interview['tools'],
    roles: null,
    training_gaps: null,
    handoff_risks: null,
    raw_analysis_response: null,
    error_message: null,
    analyzed_at: null,
    created_at: '2024-02-01T10:00:00Z',
    updated_at: '2024-02-01T10:00:00Z',
    interview_date: null,
    interviewee_name: 'Jane',
    interviewee_role: 'Marketing Manager',
    department: 'Marketing',
  },
  {
    id: '3',
    user_id: 'user1',
    company_id: null,
    title: 'Unassigned Interview',
    transcript_text: 'General discussion',
    analysis_status: 'failed',
    workflows: null,
    pain_points: null,
    tools: null,
    roles: null,
    training_gaps: null,
    handoff_risks: null,
    raw_analysis_response: null,
    error_message: 'Analysis failed',
    analyzed_at: null,
    created_at: '2024-03-01T10:00:00Z',
    updated_at: '2024-03-01T10:00:00Z',
    interview_date: null,
    interviewee_name: null,
    interviewee_role: null,
    department: null,
  },
];

describe('useInterviewFilters', () => {
  it('returns all interviews when no filters are active', () => {
    const { result } = renderHook(() =>
      useInterviewFilters({
        interviews: mockInterviews,
        companyFilter: null,
      })
    );

    expect(result.current.filteredInterviews).toHaveLength(3);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.activeFilterCount).toBe(0);
  });

  it('filters by company', () => {
    const { result } = renderHook(() =>
      useInterviewFilters({
        interviews: mockInterviews,
        companyFilter: 'company1',
      })
    );

    expect(result.current.filteredInterviews).toHaveLength(2);
    expect(result.current.filteredInterviews.every(i => i.company_id === 'company1')).toBe(true);
  });

  it('filters unassigned interviews', () => {
    const { result } = renderHook(() =>
      useInterviewFilters({
        interviews: mockInterviews,
        companyFilter: 'unassigned',
      })
    );

    expect(result.current.filteredInterviews).toHaveLength(1);
    expect(result.current.filteredInterviews[0].company_id).toBe(null);
  });

  it('filters by search query in title', () => {
    const { result } = renderHook(() =>
      useInterviewFilters({
        interviews: mockInterviews,
        companyFilter: null,
      })
    );

    act(() => {
      result.current.setSearchQuery('John');
    });

    expect(result.current.filteredInterviews).toHaveLength(1);
    expect(result.current.filteredInterviews[0].title).toContain('John');
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('filters by search query in transcript', () => {
    const { result } = renderHook(() =>
      useInterviewFilters({
        interviews: mockInterviews,
        companyFilter: null,
      })
    );

    act(() => {
      result.current.setSearchQuery('marketing automation');
    });

    expect(result.current.filteredInterviews).toHaveLength(1);
    expect(result.current.filteredInterviews[0].id).toBe('2');
  });

  it('filters by status', () => {
    const { result } = renderHook(() =>
      useInterviewFilters({
        interviews: mockInterviews,
        companyFilter: null,
      })
    );

    act(() => {
      result.current.setStatuses(['completed']);
    });

    expect(result.current.filteredInterviews).toHaveLength(1);
    expect(result.current.filteredInterviews[0].analysis_status).toBe('completed');
    expect(result.current.activeFilterCount).toBe(1);
  });

  it('filters by multiple statuses', () => {
    const { result } = renderHook(() =>
      useInterviewFilters({
        interviews: mockInterviews,
        companyFilter: null,
      })
    );

    act(() => {
      result.current.setStatuses(['completed', 'pending']);
    });

    expect(result.current.filteredInterviews).toHaveLength(2);
  });

  it('filters by tools', () => {
    const { result } = renderHook(() =>
      useInterviewFilters({
        interviews: mockInterviews,
        companyFilter: null,
      })
    );

    act(() => {
      result.current.setTools(['Salesforce']);
    });

    expect(result.current.filteredInterviews).toHaveLength(1);
    expect(result.current.filteredInterviews[0].id).toBe('1');
  });

  it('extracts available tools from interviews', () => {
    const { result } = renderHook(() =>
      useInterviewFilters({
        interviews: mockInterviews,
        companyFilter: null,
      })
    );

    expect(result.current.availableTools).toContain('Salesforce');
    expect(result.current.availableTools).toContain('HubSpot');
  });

  it('clears all filters', () => {
    const { result } = renderHook(() =>
      useInterviewFilters({
        interviews: mockInterviews,
        companyFilter: null,
      })
    );

    act(() => {
      result.current.setSearchQuery('test');
      result.current.setStatuses(['completed']);
    });

    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.clearAllFilters();
    });

    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.filteredInterviews).toHaveLength(3);
  });

  it('clears specific filter', () => {
    const { result } = renderHook(() =>
      useInterviewFilters({
        interviews: mockInterviews,
        companyFilter: null,
      })
    );

    act(() => {
      result.current.setSearchQuery('test');
      result.current.setStatuses(['completed']);
    });

    expect(result.current.activeFilterCount).toBe(2);

    act(() => {
      result.current.clearFilter('searchQuery');
    });

    expect(result.current.activeFilterCount).toBe(1);
    expect(result.current.filters.searchQuery).toBe('');
  });

  it('filters by pain point severity', () => {
    const { result } = renderHook(() =>
      useInterviewFilters({
        interviews: mockInterviews,
        companyFilter: null,
      })
    );

    act(() => {
      result.current.setSeverities(['high']);
    });

    expect(result.current.filteredInterviews).toHaveLength(1);
    expect(result.current.filteredInterviews[0].id).toBe('1');
  });
});
