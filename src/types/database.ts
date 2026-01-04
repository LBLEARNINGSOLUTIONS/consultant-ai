// Supabase database types
// These types match the database schema in supabase-schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          role?: string;
        };
        Update: {
          email?: string;
          name?: string;
          role?: string;
        };
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          name: string;
          description?: string | null;
          color?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          color?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'companies_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      interviews: {
        Row: {
          id: string;
          user_id: string;
          company_id: string | null;
          title: string;
          transcript_text: string;
          analysis_status: 'pending' | 'analyzing' | 'completed' | 'failed';
          workflows: Json;
          pain_points: Json;
          tools: Json;
          roles: Json;
          training_gaps: Json;
          handoff_risks: Json;
          raw_analysis_response: Json | null;
          error_message: string | null;
          analyzed_at: string | null;
          created_at: string;
          updated_at: string;
          interview_date: string | null;
          interviewee_name: string | null;
          interviewee_role: string | null;
          department: string | null;
        };
        Insert: {
          user_id: string;
          company_id?: string | null;
          title: string;
          transcript_text: string;
          analysis_status?: 'pending' | 'analyzing' | 'completed' | 'failed';
          workflows?: Json;
          pain_points?: Json;
          tools?: Json;
          roles?: Json;
          training_gaps?: Json;
          handoff_risks?: Json;
          raw_analysis_response?: Json;
          error_message?: string;
          analyzed_at?: string;
          interview_date?: string | null;
          interviewee_name?: string | null;
          interviewee_role?: string | null;
          department?: string | null;
        };
        Update: {
          company_id?: string | null;
          title?: string;
          transcript_text?: string;
          analysis_status?: 'pending' | 'analyzing' | 'completed' | 'failed';
          workflows?: Json;
          pain_points?: Json;
          tools?: Json;
          roles?: Json;
          training_gaps?: Json;
          handoff_risks?: Json;
          raw_analysis_response?: Json;
          error_message?: string;
          analyzed_at?: string;
          interview_date?: string | null;
          interviewee_name?: string | null;
          interviewee_role?: string | null;
          department?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'interviews_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'interviews_company_id_fkey';
            columns: ['company_id'];
            referencedRelation: 'companies';
            referencedColumns: ['id'];
          }
        ];
      };
      company_summaries: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          interview_ids: string[];
          summary_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          interview_ids: string[];
          summary_data: Json;
        };
        Update: {
          title?: string;
          interview_ids?: string[];
          summary_data?: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'company_summaries_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
      transcript_files: {
        Row: {
          id: string;
          user_id: string;
          interview_id: string | null;
          filename: string;
          file_size: number;
          file_type: string | null;
          storage_path: string | null;
          upload_status: 'pending' | 'uploading' | 'completed' | 'failed';
          error_message: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          interview_id?: string | null;
          filename: string;
          file_size: number;
          file_type?: string | null;
          storage_path?: string | null;
          upload_status?: 'pending' | 'uploading' | 'completed' | 'failed';
          error_message?: string;
        };
        Update: {
          interview_id?: string | null;
          upload_status?: 'pending' | 'uploading' | 'completed' | 'failed';
          error_message?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'transcript_files_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'transcript_files_interview_id_fkey';
            columns: ['interview_id'];
            referencedRelation: 'interviews';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Company = Database['public']['Tables']['companies']['Row'];
export type Interview = Database['public']['Tables']['interviews']['Row'];
export type CompanySummary = Database['public']['Tables']['company_summaries']['Row'];
export type TranscriptFile = Database['public']['Tables']['transcript_files']['Row'];

export type InsertCompany = Database['public']['Tables']['companies']['Insert'];
export type UpdateCompany = Database['public']['Tables']['companies']['Update'];
export type InsertInterview = Database['public']['Tables']['interviews']['Insert'];
export type UpdateInterview = Database['public']['Tables']['interviews']['Update'];
export type InsertCompanySummary = Database['public']['Tables']['company_summaries']['Insert'];
export type UpdateCompanySummary = Database['public']['Tables']['company_summaries']['Update'];
