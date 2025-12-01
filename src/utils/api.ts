import { supabase } from '../lib/supabase';
import type { User } from '../types';

export interface ApiError {
  error: string;
}

class ApiClient {
  async signup(firstName: string, email: string, password: string) {
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Failed to create user');
    }

    // Wait a moment for the trigger to create the user profile
    await new Promise(resolve => setTimeout(resolve, 500));

    // Fetch the user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      // If profile doesn't exist yet, create a basic user object
      console.warn('User profile not found, using auth data:', userError);
      return {
        user: {
          id: authData.user.id,
          firstName,
          email,
          onboardingCompleted: false,
          gettingStartedCompleted: false,
          createdAt: new Date().toISOString(),
        },
        session: authData.session,
      };
    }

    return {
      user: this.formatUser(userData),
      session: authData.session,
    };
  }

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Login failed');
    }

    // Fetch user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      throw new Error(userError.message);
    }

    return {
      user: this.formatUser(userData),
      session: data.session,
    };
  }

  async getCurrentUser(): Promise<{ user: User }> {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      throw new Error('Not authenticated');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userError) {
      throw new Error(userError.message);
    }

    return {
      user: this.formatUser(userData),
    };
  }

  async updateUser(updates: Partial<User>): Promise<{ user: User }> {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      throw new Error('Not authenticated');
    }

    const dbUpdates: Record<string, unknown> = {};
    if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName;
    if (updates.onboardingCompleted !== undefined) dbUpdates.onboarding_completed = updates.onboardingCompleted;
    if (updates.gettingStartedCompleted !== undefined) dbUpdates.getting_started_completed = updates.gettingStartedCompleted;

    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', authUser.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return { user: this.formatUser(data) };
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          callback(userData ? this.formatUser(userData) : null);
        } catch (error) {
          console.error('Error fetching user on auth change:', error);
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }

  private formatUser(userData: any): User {
    return {
      id: userData.id,
      firstName: userData.first_name,
      email: userData.email,
      onboardingCompleted: userData.onboarding_completed || false,
      gettingStartedCompleted: userData.getting_started_completed || false,
      createdAt: userData.created_at,
    };
  }
}

export const apiClient = new ApiClient();
