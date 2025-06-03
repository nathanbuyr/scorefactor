import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MockESP32Service, GameData } from 'src/app/services/mock-esp32.service';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonContent, 
  IonCard, 
  IonCardContent 
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { arrowBack, play, pause, refresh, stop } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-solo',
  templateUrl: './solo.page.html',
  styleUrls: ['./solo.page.scss'],
  imports: [
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton, 
    IonIcon, 
    IonContent, 
    IonCard, 
    IonCardContent,
    NgIf
  ]
})
export class SoloPage implements OnInit, OnDestroy {
  gameData: GameData = { score: 0, time: 0, gameActive: false };
  isConnected: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private esp32Service: MockESP32Service
  ) {
    addIcons({ arrowBack, play, pause, refresh, stop });
  }

  ngOnInit() {
    this.setupSubscriptions();
    this.checkConnection();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private setupSubscriptions() {
    // Subscribe to game data updates
    const gameDataSub = this.esp32Service.gameData$.subscribe(
      data => {
        this.gameData = data;
      }
    );

    // Subscribe to connection status
    const connectionSub = this.esp32Service.isConnected$.subscribe(
      isConnected => {
        this.isConnected = isConnected;
        if (!isConnected) {
          this.handleDisconnection();
        }
      }
    );

    // Subscribe to ESP32 data
    const dataSub = this.esp32Service.dataReceived$.subscribe(
      data => {
        if (data) {
          this.handleESP32Data(data);
        }
      }
    );

    this.subscriptions.push(gameDataSub, connectionSub, dataSub);
  }

  private checkConnection() {
    if (!this.esp32Service.isConnected) {
      console.log('Device not connected - returning to home');
      alert('Please return to the home page and connect your ESP32 device first.');
    }
  }

  private handleDisconnection() {
    console.log('Device disconnected - returning to home');
    alert('Your ESP32 device has been disconnected. Returning to home page.');
    this.router.navigate(['/home']);
  }

  private handleESP32Data(data: string) {
    console.log('Solo page received ESP32 data:', data);
    
    if (data.includes('SCORE_UPDATE')) {
      // Score updates are handled automatically through gameData subscription
      return;
    }
    
    switch (data) {
      case 'GAME_STARTED':
        console.log('Game started!');
        break;
      case 'GAME_STOPPED':
        console.log('Game stopped');
        break;
      case 'GAME_RESET':
        console.log('Game reset');
        break;
    }
  }

  startGame() {
    try {
      this.esp32Service.sendCommand('START_GAME');
      console.log('Game start command sent');
    } catch (error) {
      console.error('Failed to start game:', error);
      alert('Failed to start the game. Please check your connection.');
    }
  }

  stopGame() {
    try {
      this.esp32Service.sendCommand('STOP_GAME');
      console.log('Game stop command sent');
    } catch (error) {
      console.error('Failed to stop game:', error);
      alert('Failed to stop the game.');
    }
  }

  resetGame() {
    const confirmed = confirm('Are you sure you want to reset the game? This will clear your current score.');
    
    if (confirmed) {
      try {
        this.esp32Service.sendCommand('RESET_GAME');
        console.log('Game reset command sent');
      } catch (error) {
        console.error('Failed to reset game:', error);
        alert('Failed to reset the game.');
      }
    }
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  get formattedTime(): string {
    return this.esp32Service.formatTime(this.gameData.time);
  }
}