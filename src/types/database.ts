// Supabase Database Types
// These types match the database schema

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          first_name: string;
          email: string;
          onboarding_completed: boolean;
          getting_started_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          email: string;
          onboarding_completed?: boolean;
          getting_started_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          email?: string;
          onboarding_completed?: boolean;
          getting_started_completed?: boolean;
          updated_at?: string;
        };
      };
      onboarding_data: {
        Row: {
          id: string;
          user_id: string;
          current_level: string | null;
          firm_type: string | null;
          location: string;
          timezone: string;
          manager_stress_trigger: string | null;
          manager_praise_trigger: string | null;
          manager_style: string | null;
          target_level: string | null;
          promotion_horizon: string | null;
          competency_assessments: any;
          weekly_check_in_day: string;
          weekly_check_in_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_level?: string | null;
          firm_type?: string | null;
          location?: string;
          timezone?: string;
          manager_stress_trigger?: string | null;
          manager_praise_trigger?: string | null;
          manager_style?: string | null;
          target_level?: string | null;
          promotion_horizon?: string | null;
          competency_assessments?: any;
          weekly_check_in_day?: string;
          weekly_check_in_time?: string;
        };
        Update: {
          current_level?: string | null;
          firm_type?: string | null;
          location?: string;
          timezone?: string;
          manager_stress_trigger?: string | null;
          manager_praise_trigger?: string | null;
          manager_style?: string | null;
          target_level?: string | null;
          promotion_horizon?: string | null;
          competency_assessments?: any;
          weekly_check_in_day?: string;
          weekly_check_in_time?: string;
          updated_at?: string;
        };
      };
      manager_canvas: {
        Row: {
          id: string;
          user_id: string;
          client_impact: number;
          profitability: number;
          teamwork: number;
          internal_contributions: number;
          optics: number;
          style: string;
          key_behaviors: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_impact?: number;
          profitability?: number;
          teamwork?: number;
          internal_contributions?: number;
          optics?: number;
          style?: string;
          key_behaviors?: string[];
        };
        Update: {
          client_impact?: number;
          profitability?: number;
          teamwork?: number;
          internal_contributions?: number;
          optics?: number;
          style?: string;
          key_behaviors?: string[];
          updated_at?: string;
        };
      };
      wins: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          raw_text: string | null;
          project: string | null;
          competency_tags: string[];
          date: string;
          week_id: string | null;
          source_type: string;
          source_id: string | null;
          metric: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          raw_text?: string | null;
          project?: string | null;
          competency_tags?: string[];
          date: string;
          week_id?: string | null;
          source_type: string;
          source_id?: string | null;
          metric?: string | null;
        };
        Update: {
          title?: string;
          description?: string;
          raw_text?: string | null;
          project?: string | null;
          competency_tags?: string[];
          date?: string;
          week_id?: string | null;
          source_type?: string;
          source_id?: string | null;
          metric?: string | null;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          content: string;
          context: any | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          content: string;
          context?: any | null;
        };
        Update: {
          role?: string;
          content?: string;
          context?: any | null;
        };
      };
    };
  };
}

