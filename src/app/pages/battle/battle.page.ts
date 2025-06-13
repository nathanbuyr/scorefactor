import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonContent, 
  IonCard, 
  IonCardContent,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonAlert
} from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { arrowBack, play, pause, refresh, stop, person, wifi, trophy } from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BattlePlayer {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
  isHost: boolean;
}

interface BattleGameData {
  players: BattlePlayer[];
  gameActive: boolean;
  gameTime: number;
  roomId: string;
  winner?: string;
}

@Component({
  selector: 'app-battle',
  templateUrl: './battle.page.html',
  styleUrls: ['./battle.page.scss'],
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
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonAlert,
    NgIf,
    NgFor,
    FormsModule
  ]
})
export class BattlePage implements OnInit, OnDestroy {
  gameData: BattleGameData = {
    players: [],
    gameActive: false,
    gameTime: 0,
    roomId: ''
  };
  
  isConnected = false;
  isHost = false;
  playerName = '';
  roomCode = '';
  gamePhase: 'setup' | 'lobby' | 'game' | 'finished' = 'setup';
  currentPlayer: BattlePlayer | null = null;
  
  private socket: WebSocket | null = null;
  private subscriptions: Subscription[] = [];
  private gameTimer: any;

  constructor(private router: Router) {
    addIcons({ arrowBack, play, pause, refresh, stop, person, wifi, trophy });
  }

  ngOnInit() {
    // Initialize connection to battle server
    this.connectToServer();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.socket) {
      this.socket.close();
    }
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }
  }

  private connectToServer() {
    try {
      // Replace with your server URL when deployed
      this.socket = new WebSocket('ws://localhost:3000');
      
      this.socket.onopen = () => {
        console.log('Connected to battle server');
        this.isConnected = true;
      };

      this.socket.onmessage = (event) => {
        this.handleServerMessage(JSON.parse(event.data));
      };

      this.socket.onclose = () => {
        console.log('Disconnected from battle server');
        this.isConnected = false;
        // Attempt reconnection after 3 seconds
        setTimeout(() => this.connectToServer(), 3000);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to server:', error);
    }
  }

  private handleServerMessage(message: any) {
    console.log('Received message:', message);
    
    switch (message.type) {
      case 'room_created':
        this.roomCode = message.roomId;
        this.gameData.roomId = message.roomId;
        this.isHost = true;
        this.gamePhase = 'lobby';
        break;
        
      case 'room_joined':
        this.gameData.roomId = message.roomId;
        this.gamePhase = 'lobby';
        break;
        
      case 'player_joined':
        this.gameData.players = message.players;
        break;
        
      case 'game_started':
        this.gameData.gameActive = true;
        this.gamePhase = 'game';
        this.startGameTimer();
        break;
        
      case 'score_update':
        this.updatePlayerScore(message.playerId, message.score);
        break;
        
      case 'game_ended':
        this.gameData.gameActive = false;
        this.gameData.winner = message.winner;
        this.gamePhase = 'finished';
        this.stopGameTimer();
        break;
        
      case 'player_left':
        this.gameData.players = message.players;
        break;
        
      case 'error':
        alert(`Error: ${message.message}`);
        break;
    }
  }

  private sendMessage(message: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  createRoom() {
    if (!this.playerName.trim()) {
      alert('Please enter your name first');
      return;
    }
    
    this.sendMessage({
      type: 'create_room',
      playerName: this.playerName
    });
  }

  joinRoom() {
    if (!this.playerName.trim() || !this.roomCode.trim()) {
      alert('Please enter your name and room code');
      return;
    }
    
    this.sendMessage({
      type: 'join_room',
      roomId: this.roomCode,
      playerName: this.playerName
    });
  }

  startGame() {
    if (!this.isHost) return;
    
    if (this.gameData.players.length < 2) {
      alert('Need at least 2 players to start the game');
      return;
    }
    
    this.sendMessage({
      type: 'start_game',
      roomId: this.gameData.roomId
    });
  }

  private startGameTimer() {
    this.gameData.gameTime = 0;
    this.gameTimer = setInterval(() => {
      this.gameData.gameTime++;
    }, 1000);
  }

  private stopGameTimer() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
  }

  private updatePlayerScore(playerId: string, score: number) {
    const player = this.gameData.players.find(p => p.id === playerId);
    if (player) {
      player.score = score;
    }
  }

  // Simulate score update (replace with ESP32 integration)
  addScore() {
    if (!this.currentPlayer || !this.gameData.gameActive) return;
    
    this.sendMessage({
      type: 'score_update',
      roomId: this.gameData.roomId,
      playerId: this.currentPlayer.id,
      score: this.currentPlayer.score + 1
    });
  }

  resetGame() {
    if (!this.isHost) return;
    
    const confirmed = confirm('Are you sure you want to reset the game?');
    if (confirmed) {
      this.sendMessage({
        type: 'reset_game',
        roomId: this.gameData.roomId
      });
      
      this.gameData.gameTime = 0;
      this.gameData.players.forEach(p => p.score = 0);
      this.gamePhase = 'lobby';
    }
  }

  leaveRoom() {
    this.sendMessage({
      type: 'leave_room',
      roomId: this.gameData.roomId
    });
    
    this.gamePhase = 'setup';
    this.gameData = {
      players: [],
      gameActive: false,
      gameTime: 0,
      roomId: ''
    };
    this.isHost = false;
    this.currentPlayer = null;
  }

  goBack() {
    if (this.gamePhase !== 'setup') {
      this.leaveRoom();
    }
    this.router.navigate(['/home']);
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.gameData.gameTime / 60);
    const seconds = this.gameData.gameTime % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  get sortedPlayers(): BattlePlayer[] {
    return [...this.gameData.players].sort((a, b) => b.score - a.score);
  }
}