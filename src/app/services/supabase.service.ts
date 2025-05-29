import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

// Custom storage adapter for Capacitor
class CapacitorStorage {
  async getItem(key: string): Promise<string | null> {
    if (Capacitor.isNativePlatform()) {
      const { value } = await Preferences.get({ key });
      return value;
    }
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.set({ key, value });
    } else {
      localStorage.setItem(key, value);
    }
  }

  async removeItem(key: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await Preferences.remove({ key });
    } else {
      localStorage.removeItem(key);
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey,
      {
        auth: {
          storage: new CapacitorStorage(),
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: !Capacitor.isNativePlatform(),
          // Provide a no-op lock function instead of false
          lock: async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
            // Just execute the function without locking
            return await fn();
          }
        }
      }
    );
  }

  get client() {
    return this.supabase;
  }

  // Authentication methods
  async signUp(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password
    });
    return { data, error };
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async resetPassword(email: string) {
    return await this.supabase.auth.resetPasswordForEmail(email);
  }

  getCurrentUser(): Promise<User | null> {
    return this.supabase.auth.getUser().then(({ data: { user } }) => user);
  }

  getSession(): Promise<Session | null> {
    return this.supabase.auth.getSession().then(({ data: { session } }) => session);
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}