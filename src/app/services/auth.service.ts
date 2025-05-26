import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { User, Session } from '@supabase/supabase-js';
import { AlertController, LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private supabase: SupabaseService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
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
    const loading = await this.loadingController.create({
      message: 'Signing in...'
    });
    await loading.present();

    try {
      const { data, error } = await this.supabase.signIn(email, password);
      
      if (error) {
        await this.showAlert('Sign In Error', error.message);
        return false;
      }

      if (data.user) {
        this.currentUserSubject.next(data.user);
        this.router.navigate(['/home']); // Navigate to your main page
        return true;
      }
      
      return false;
    } catch (error: any) {
      await this.showAlert('Error', error.message);
      return false;
    } finally {
      await loading.dismiss();
    }
  }

  async signUp(email: string, password: string): Promise<boolean> {
    const loading = await this.loadingController.create({
      message: 'Creating account...'
    });
    await loading.present();

    try {
      const { data, error } = await this.supabase.signUp(email, password);
      
      if (error) {
        await this.showAlert('Sign Up Error', error.message);
        return false;
      }

      await this.showAlert(
        'Success', 
        'Account created! Please check your email to verify your account.'
      );
      return true;
    } catch (error: any) {
      await this.showAlert('Error', error.message);
      return false;
    } finally {
      await loading.dismiss();
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
        await this.showAlert('Reset Password Error', error.message);
        return false;
      }

      await this.showAlert(
        'Password Reset', 
        'Check your email for password reset instructions.'
      );
      return true;
    } catch (error: any) {
      await this.showAlert('Error', error.message);
      return false;
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK']
    });
    await alert.present();
  }

  get isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }
}