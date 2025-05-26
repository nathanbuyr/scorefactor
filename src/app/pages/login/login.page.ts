import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { IonContent, IonIcon, IonButton } from "@ionic/angular/standalone";
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';


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

  constructor(private authService: AuthService) { }

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
    if (this.email && this.password) {
      console.log('Login attempt:', {
        email: this.email,
        password: this.password,
        rememberMe: this.rememberMe
      });
      await this.authService.signIn(this.email, this.password);
    } else {
      console.log('Please fill in all fields');
      // You can add toast notification here
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
}