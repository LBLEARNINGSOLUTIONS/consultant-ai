import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/database';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile fetch error:', error);
        // If profile doesn't exist, create a basic one or set loading to false
        if (error.code === 'PGRST116') {
          // No rows returned - profile doesn't exist
          console.log('No profile found, setting loading to false');
          setProfile(null);
          setLoading(false);
          return;
        }
        throw error;
      }
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Even if there's an error, we should stop loading
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) throw error;

      // Profile is created automatically by database trigger
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const isAdmin = profile?.role === 'admin';
  const isClient = profile?.role === 'client';

  return {
    user,
    profile,
    loading,
    isAdmin,
    isClient,
    signUp,
    signIn,
    signOut,
  };
}
