import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, Subscription } from 'rxjs';

export interface ESP32Device {
  name: string;
  address: string;
  id: string;
}

export interface GameData {
  score: number;
  time: number;
  gameActive: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MockESP32Service {
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  private connectedDeviceSubject = new BehaviorSubject<ESP32Device | null>(null);
  private gameDataSubject = new BehaviorSubject<GameData>({ score: 0, time: 0, gameActive: false });
  private dataReceivedSubject = new BehaviorSubject<string>('');
  
  private gameTimer?: Subscription;
  private scoreTimer?: Subscription;
  
  // Mock devices
  private mockDevices: ESP32Device[] = [
    { name: 'ScoreFactor-ESP32', address: '00:11:22:33:44:55', id: 'sf_001' },
    { name: 'ESP32-GameDevice', address: '00:11:22:33:44:66', id: 'sf_002' }
  ];

  constructor() {}

  // Observables for components to subscribe to
  get isConnected$(): Observable<boolean> {
    return this.isConnectedSubject.asObservable();
  }

  get connectedDevice$(): Observable<ESP32Device | null> {
    return this.connectedDeviceSubject.asObservable();
  }

  get gameData$(): Observable<GameData> {
    return this.gameDataSubject.asObservable();
  }

  get dataReceived$(): Observable<string> {
    return this.dataReceivedSubject.asObservable();
  }

  // Get current values
  get isConnected(): boolean {
    return this.isConnectedSubject.value;
  }

  get connectedDevice(): ESP32Device | null {
    return this.connectedDeviceSubject.value;
  }

  get gameData(): GameData {
    return this.gameDataSubject.value;
  }

  // Simulate finding available devices
  async discoverDevices(): Promise<ESP32Device[]> {
    // Simulate discovery delay
    await this.delay(1500);
    return [...this.mockDevices];
  }

  // Simulate connecting to a device
  async connect(device: ESP32Device): Promise<boolean> {
    try {
      // Simulate connection delay
      await this.delay(2000);
      
      // Simulate random connection failure (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Connection failed');
      }

      this.isConnectedSubject.next(true);
      this.connectedDeviceSubject.next(device);
      
      // Start simulating device ready state
      setTimeout(() => {
        this.dataReceivedSubject.next('DEVICE_READY');
      }, 1000);

      return true;
    } catch (error) {
      throw error;
    }
  }

  // Simulate disconnecting
  async disconnect(): Promise<void> {
    this.stopGame();
    this.isConnectedSubject.next(false);
    this.connectedDeviceSubject.next(null);
    this.dataReceivedSubject.next('DISCONNECTED');
    await this.delay(500);
  }

  // Send command to mock ESP32
  async sendCommand(command: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to device');
    }

    console.log('Mock ESP32 received command:', command);
    
    // Simulate command processing
    await this.delay(200);
    
    switch (command) {
      case 'START_GAME':
      case 'SOLO_MODE':
        this.startSoloGame();
        break;
      case 'STOP_GAME':
        this.stopGame();
        break;
      case 'RESET_GAME':
        this.resetGame();
        break;
      case 'BATTLE_MODE':
        this.dataReceivedSubject.next('BATTLE_MODE_READY');
        break;
      default:
        this.dataReceivedSubject.next(`COMMAND_RECEIVED: ${command}`);
    }
  }

  // Start solo game simulation
  private startSoloGame(): void {
    this.stopGame(); // Stop any existing game
    
    const currentData = this.gameData;
    this.gameDataSubject.next({
      ...currentData,
      gameActive: true
    });

    // Timer for game time (increments every second)
    this.gameTimer = interval(1000).subscribe(() => {
      const data = this.gameData;
      this.gameDataSubject.next({
        ...data,
        time: data.time + 1
      });
    });

    // Timer for score (increments every 2-4 seconds randomly)
    const scoreInterval = () => {
      const nextInterval = 2000 + Math.random() * 2000; // 2-4 seconds
      setTimeout(() => {
        if (this.gameData.gameActive) {
          const data = this.gameData;
          const scoreIncrement = Math.floor(Math.random() * 10) + 1; // 1-10 points
          this.gameDataSubject.next({
            ...data,
            score: data.score + scoreIncrement
          });
          
          // Send score update notification
          this.dataReceivedSubject.next(`SCORE_UPDATE: ${data.score + scoreIncrement}`);
          
          scoreInterval(); // Schedule next score update
        }
      }, nextInterval);
    };
    
    scoreInterval();
    this.dataReceivedSubject.next('GAME_STARTED');
  }

  // Stop the game
  private stopGame(): void {
    if (this.gameTimer) {
      this.gameTimer.unsubscribe();
      this.gameTimer = undefined;
    }
    
    if (this.scoreTimer) {
      this.scoreTimer.unsubscribe();
      this.scoreTimer = undefined;
    }

    const currentData = this.gameData;
    this.gameDataSubject.next({
      ...currentData,
      gameActive: false
    });
    
    this.dataReceivedSubject.next('GAME_STOPPED');
  }

  // Reset game data
  private resetGame(): void {
    this.stopGame();
    this.gameDataSubject.next({
      score: 0,
      time: 0,
      gameActive: false
    });
    this.dataReceivedSubject.next('GAME_RESET');
  }

  // Format time as MM:SS
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Utility method for delays
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Cleanup when service is destroyed
  ngOnDestroy(): void {
    this.stopGame();
  }
}