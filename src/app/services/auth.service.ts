import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { User, Session } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {
    // Listen for auth state changes
    this.supabase.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.currentUserSubject.next(session.user);
      } else {
        this.currentUserSubject.next(null);
      }
    });
    
    // Check for existing session on app start
    this.checkUser();
  }

  async checkUser() {
    try {
      const session = await this.supabase.getSession();
      if (session?.user) {
        this.currentUserSubject.next(session.user);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  }

  async signIn(email: string, password: string): Promise<boolean> {
    console.log('AuthService.signIn called with:', email);
    
    try {
      console.log('Calling supabase.signIn...');
      const { data, error } = await this.supabase.signIn(email, password);
      console.log('Supabase response received:', { data: !!data, error: !!error });
     
      if (error) {
        console.log('Supabase error:', error.message);
        this.showSimpleAlert('Sign In Error', error.message);
        return false;
      }
      
      if (data.user) {
        console.log('User authenticated successfully');
        this.currentUserSubject.next(data.user);
        console.log('Navigating to /home...');
        await this.router.navigate(['/home']);
        return true;
      }
     
      console.log('No user returned from Supabase');
      return false;
    } catch (error: any) {
      console.error('Exception in signIn:', error);
      this.showSimpleAlert('Error', error.message);
      return false;
    }
  }

  async signUp(email: string, password: string): Promise<boolean> {
    console.log('Creating account...');
    
    try {
      const { data, error } = await this.supabase.signUp(email, password);
     
      if (error) {
        console.log('Sign Up Error:', error.message);
        this.showSimpleAlert('Sign Up Error', error.message);
        return false;
      }
      
      this.showSimpleAlert(
        'Success',
        'Account created! Please check your email to verify your account.'
      );
      return true;
    } catch (error: any) {
      console.error('Sign up error:', error);
      this.showSimpleAlert('Error', error.message);
      return false;
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.supabase.signOut();
      this.currentUserSubject.next(null);
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }

  async resetPassword(email: string): Promise<boolean> {
    try {
      const { error } = await this.supabase.resetPassword(email);
     
      if (error) {
        console.log('Reset Password Error:', error.message);
        this.showSimpleAlert('Reset Password Error', error.message);
        return false;
      }
      
      this.showSimpleAlert(
        'Password Reset',
        'Check your email for password reset instructions.'
      );
      return true;
    } catch (error: any) {
      console.error('Reset password error:', error);
      this.showSimpleAlert('Error', error.message);
      return false;
    }
  }

  private showSimpleAlert(title: string, message: string) {

    if (typeof window !== 'undefined') {
      alert(`${title}: ${message}`);
    }
    // Also log to console for debugging
    console.log(`${title}: ${message}`);
  }

  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }
}