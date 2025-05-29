import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { IonContent, IonIcon, IonButton, ToastController } from "@ionic/angular/standalone";
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { personCircleOutline, lockClosedOutline, mailOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  imports: [IonContent, IonIcon, IonButton, NgIf, FormsModule],
})
export class LoginPage {
  // Login form fields
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  
  // Register form fields
  registerEmail: string = '';
  registerPassword: string = '';
  confirmPassword: string = '';
  
  activeTab: string = 'login';

  constructor(private authService: AuthService, private router: Router) { 
    addIcons({
  personCircleOutline,
  lockClosedOutline,
  mailOutline,
  checkmarkCircleOutline
});
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    // Clear forms when switching tabs
    this.clearForms();
  }

  clearForms() {
    // Clear login form
    this.email = '';
    this.password = '';
    this.rememberMe = false;
    
    // Clear register form
    this.registerEmail = '';
    this.registerPassword = '';
    this.confirmPassword = '';
  }

  async login() {
  console.log('Login method called');
  
  if (this.email && this.password) {
    console.log('Email and password provided, attempting login...');
    
    try {
      console.log('Calling authService.signIn...');
      const result = await this.authService.signIn(this.email, this.password);
      console.log('AuthService response:', result);
      
      if (result) {
        console.log('Login successful, navigating...');
        await this.router.navigate(['/home']);
        console.log('Navigation complete');
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Login exception:', error);
    }
  } else {
    console.log('Missing email or password');
  }
}

  async register() {
    // Validation
    if (!this.registerEmail || !this.registerPassword || !this.confirmPassword) {
      console.log('Please fill in all fields');
      return;
    }

    if (this.registerPassword !== this.confirmPassword) {
      console.log('Passwords do not match');
      return;
    }

    if (this.registerPassword.length < 6) {
      console.log('Password must be at least 6 characters long');
      return;
    }

    console.log('Register attempt:', {
      email: this.registerEmail,
      password: this.registerPassword
    });

    const success = await this.authService.signUp(this.registerEmail, this.registerPassword);
    if (success) {
      // Switch back to login tab after successful registration
      this.activeTab = 'login';
      this.clearForms();
    }
  }

  async forgotPassword() {
    if (this.email) {
      await this.authService.resetPassword(this.email);
    } else {
      console.log('Please enter your email first');
    }
  }

  testButton() {
  console.log('Test button clicked - this should appear in remote debugging');
  alert('Test button works!'); // Simple browser alert
}
}