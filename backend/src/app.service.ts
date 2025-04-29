import { Injectable } from '@nestjs/common';
import { OpenGameResponse } from './model/game/OpenGameResponse';
import { randomUUID } from 'crypto';
import { GameState } from './model/game/GameState';

@Injectable()
export class AppService {
  private gameState: GameState = new GameState();

  resetGameState(): void {
    this.gameState.playersConnected = [];
    this.gameState.alivePlayers = [];
    this.gameState.isGameStarted = false;
    this.gameState.imposterPlayerId = -1;
    this.gameState.gamesCompleted = [];
    this.gameState.emergencyButtonPressed = false;
    this.gameState.isVotingActive = false;
    this.gameState.bodyFound = false;
    this.gameState.playersRegisteredForVoting = [];
    this.gameState.currentGameId = '';
  }

  openGame(playerId: number): OpenGameResponse {
    this.resetGameState();
    let response = new OpenGameResponse();
    response.gameId = randomUUID();
    response.playerId = playerId;
    this.gameState.currentGameId = response.gameId;
    this.gameState.playersConnected.push(playerId);
    this.gameState.alivePlayers.push(playerId);
    return response;
  }

  joinGame(playerId): number {
    this.gameState.playersConnected.push(playerId);
    this.gameState.alivePlayers.push(playerId);
    return playerId;
  }

  startGame(): number {
    this.shuffle(this.gameState.playersConnected);
    this.gameState.imposterPlayerId = this.gameState.playersConnected[0];
    this.gameState.isGameStarted = true;
    return this.gameState.imposterPlayerId;
  }

  completeGame(stationId: number): void {
    this.gameState.gamesCompleted.push(stationId);
  }

  getGameState(): GameState {
    return this.gameState;
  }

  killPlayer(playerId: number): void {
    const index = this.gameState.alivePlayers.indexOf(playerId, 0);
    this.gameState.alivePlayers.splice(index, 1);
  }

  emergencyButton(): void {
    this.gameState.emergencyButtonPressed = true;
    this.gameState.killsEnabled = false;
  }

  bodyFound(playerId: number): void {
    if (!this.gameState.emergencyButtonPressed) {
      // player must be dead to be found dead
      if (this.gameState.alivePlayers.indexOf(playerId, 0) === -1) {
        this.gameState.killsEnabled = false;
        this.gameState.bodyFound = true;
      }
    }
  }

  // Voting:
  // All players go to base (button) and register there, after all register, voting opens for 1 minute.
  registerForVoting(playerId: number): boolean {
    // emergency button or body has to have been found to open voting
    if (this.gameState.emergencyButtonPressed || this.gameState.bodyFound) {
      // player not already registered
      if (
        this.gameState.playersRegisteredForVoting.indexOf(playerId, 0) !== -1
      ) {
        this.gameState.playersRegisteredForVoting.push(playerId);
      }
      if (
        this.gameState.playersRegisteredForVoting.length ===
        this.gameState.alivePlayers.length
      ) {
        this.gameState.isVotingActive = true;
        this.gameState.alivePlayers.forEach((alivePlayerId) => {
          this.gameState.votes.push([alivePlayerId, 0]);
        });
      }
      return true;
    } else {
      return false;
    }
  }

  voteFor(playerId: number): boolean {
    // search for entry of the player, +1 the number
    let voteEntry = this.gameState.votes.find((vote) => vote[0] === playerId);
    if (voteEntry) {
      voteEntry[1]++;
    } else {
      return false;
    }
    return true;
  }

  private shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
  }
}
