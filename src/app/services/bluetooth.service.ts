import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, interval } from 'rxjs';

export interface ScoreUpdate {
  sensor: string;
  score: number;
  timestamp: Date;
}

export interface ESP32Device {
  id: string;
  name: string;
  address: string;
  connected: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BluetoothService {
  private isConnectedSubject = new BehaviorSubject<boolean>(false);
  private currentDeviceSubject = new BehaviorSubject<ESP32Device | null>(null);
  private scoreUpdateSubject = new Subject<ScoreUpdate>();
  private messageSubject = new Subject<string>();
  
  // Mock ESP32 properties
  private mockScore = 0;
  private mockSensorInterval: any;
  private useMockDevice = true; // Set to false when you have real ESP32
  
  // Observables
  public isConnected$ = this.isConnectedSubject.asObservable();
  public currentDevice$ = this.currentDeviceSubject.asObservable();
  public scoreUpdates$ = this.scoreUpdateSubject.asObservable();
  public messages$ = this.messageSubject.asObservable();

  constructor() {
    console.log('BluetoothService initialized');
  }

  // Get available devices (mock for now)
  async getAvailableDevices(): Promise<ESP32Device[]> {
    console.log('Searching for ESP32 devices...');
    
    if (this.useMockDevice) {
      // Simulate search delay
      await this.delay(1500);
      
      return [
        {
          id: 'mock-esp32-1',
          name: 'ScoreFactor ESP32',
          address: '00:11:22:33:44:55',
          connected: false
        },
        {
          id: 'mock-esp32-2', 
          name: 'ESP32-WROOM',
          address: '00:11:22:33:44:66',
          connected: false
        }
      ];
    } else {
      // TODO: Implement real Bluetooth device discovery
      // This would use Capacitor Bluetooth plugin or similar
      return [];
    }
  }

  // Connect to device
  async connectToDevice(device: ESP32Device): Promise<boolean> {
    console.log('Connecting to device:', device.name);
    
    try {
      if (this.useMockDevice) {
        // Simulate connection delay
        await this.delay(2000);
        
        // Simulate occasional connection failure
        if (Math.random() < 0.1) {
          throw new Error('Connection failed - device not responding');
        }
        
        // Update connection state
        device.connected = true;
        this.isConnectedSubject.next(true);
        this.currentDeviceSubject.next(device);
        
        // Start mock sensor simulation
        this.startMockSensorData();
        
        // Send initial ready message
        setTimeout(() => {
          this.messageSubject.next('ESP32 Ready - ScoreFactor System Online');
        }, 500);
        
        console.log('Successfully connected to mock ESP32');
        return true;
        
      } else {
        // TODO: Implement real Bluetooth connection
        // This would use Capacitor Bluetooth plugin
        return false;
      }
    } catch (error) {
      console.error('Connection failed:', error);
      throw error;
    }
  }

  // Disconnect from device
  async disconnect(): Promise<void> {
    console.log('Disconnecting from device...');
    
    if (this.mockSensorInterval) {
      clearInterval(this.mockSensorInterval);
      this.mockSensorInterval = null;
    }
    
    this.isConnectedSubject.next(false);
    this.currentDeviceSubject.next(null);
    this.mockScore = 0;
    
    console.log('Disconnected from device');
  }

  // Send command to ESP32
  async sendCommand(command: string): Promise<void> {
    console.log('Sending command to ESP32:', command);
    
    if (!this.isConnectedSubject.value) {
      throw new Error('Not connected to any device');
    }
    
    if (this.useMockDevice) {
      // Handle mock commands
      this.handleMockCommand(command);
    } else {
      // TODO: Send real command via Bluetooth
    }
  }

  // Mock sensor data generation
  private startMockSensorData(): void {
    console.log('Starting mock sensor data generation...');
    
    // Clear any existing interval
    if (this.mockSensorInterval) {
      clearInterval(this.mockSensorInterval);
    }
    
    // Generate random sensor hits every 3-10 seconds
    this.mockSensorInterval = setInterval(() => {
      if (this.isConnectedSubject.value) {
        // Random chance of sensor hit
        if (Math.random() < 0.3) {
          this.simulateSensorHit();
        }
      }
    }, 2000 + Math.random() * 5000);
  }

  private simulateSensorHit(): void {
    const sensors = ['TARGET_1', 'TARGET_2', 'TARGET_3', 'TARGET_4'];
    const randomSensor = sensors[Math.floor(Math.random() * sensors.length)];
    
    this.mockScore += 10; // Add 10 points per hit
    
    const scoreUpdate: ScoreUpdate = {
      sensor: randomSensor,
      score: this.mockScore,
      timestamp: new Date()
    };
    
    console.log('Mock sensor hit:', scoreUpdate);
    
    // Emit score update
    this.scoreUpdateSubject.next(scoreUpdate);
    
    // Also emit as a message
    this.messageSubject.next(`HIT_${randomSensor}_SCORE_${this.mockScore}`);
  }

  private handleMockCommand(command: string): void {
    console.log('Handling mock command:', command);
    
    setTimeout(() => {
      switch (command.toUpperCase()) {
        case 'START_GAME':
          this.mockScore = 0;
          this.messageSubject.next('GAME_STARTED');
          break;
          
        case 'RESET_SCORE':
          this.mockScore = 0;
          this.scoreUpdateSubject.next({
            sensor: 'SYSTEM',
            score: 0,
            timestamp: new Date()
          });
          this.messageSubject.next('SCORE_RESET');
          break;
          
        case 'BATTLE_MODE':
          this.messageSubject.next('BATTLE_MODE_ACTIVATED');
          break;
          
        case 'SOLO_MODE':
          this.messageSubject.next('SOLO_MODE_ACTIVATED');
          break;
          
        case 'GET_STATUS':
          this.messageSubject.next(`STATUS_SCORE_${this.mockScore}_CONNECTED`);
          break;
          
        default:
          this.messageSubject.next(`COMMAND_RECEIVED_${command}`);
      }
    }, 300 + Math.random() * 700); // Random delay to simulate real device
  }

  // Utility methods
  get isConnected(): boolean {
    return this.isConnectedSubject.value;
  }

  get currentDevice(): ESP32Device | null {
    return this.currentDeviceSubject.value;
  }

  get currentScore(): number {
    return this.mockScore;
  }

  // Toggle between mock and real device
  setMockMode(useMock: boolean): void {
    this.useMockDevice = useMock;
    console.log('Mock mode set to:', useMock);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}