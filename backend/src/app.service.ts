import { Injectable } from '@nestjs/common';
import { OpenGameResponse } from './model/game/OpenGameResponse';
import { randomUUID } from 'crypto';
import { GameState, PlayerToStations } from './model/game/GameState';

@Injectable()
export class AppService {
  private gameState: GameState = new GameState();
  private meetingTimer: NodeJS.Timeout | null = null;

  public allStationIds: string[] = [
    'station_wires',
    'station_simon',
    'station_levers',
    'station_lightsout',
    'station_safecrack',
  ];

  resetGameState(): void {
    this.gameState.playersConnected = [];
    this.gameState.alivePlayers = [];
    this.gameState.isGameStarted = false;
    this.gameState.imposterPlayerId = { playerId: -1 };
    this.gameState.gamesCompleted = [];
    this.gameState.emergencyButtonPressed = false;
    this.gameState.meetingEndTime = -1;
    this.gameState.gameOver = 'IN_PROGRESS';
    this.gameState.isVotingActive = false;
    this.gameState.bodyFound = false;
    this.gameState.playersRegisteredForVoting = [];
    this.gameState.currentGameId = '';
    this.gameState.votes = [];
    this.gameState.stations = [];
  }

  openGame(playerId: number): OpenGameResponse {
    this.resetGameState();
    const response = new OpenGameResponse();
    response.gameId = randomUUID();
    response.playerId = playerId;
    this.gameState.currentGameId = response.gameId;
    this.gameState.playersConnected.push({ playerId: playerId });
    this.gameState.alivePlayers.push({ playerId: playerId });
    return response;
  }

  joinGame(playerId: number): number {
    if (
      this.gameState.playersConnected.findIndex(
        (thisId) => thisId.playerId === playerId,
      ) !== -1
    ) {
      return -1;
    }
    this.gameState.playersConnected.push({ playerId: playerId });
    this.gameState.alivePlayers.push({ playerId: playerId });
    return playerId;
  }

  startGame(): number {
    this.shuffle(this.gameState.playersConnected);
    this.gameState.imposterPlayerId = this.gameState.playersConnected[0];
    this.gameState.isGameStarted = true;
    // 3 tasks per player
    // randomly selected
    this.gameState.playersConnected.forEach((playerId) => {
      if (playerId.playerId === this.gameState.imposterPlayerId.playerId) {
        return;
      }
      let playerToStations = new PlayerToStations();
      playerToStations.playerId = playerId.playerId;

      this.shuffle(this.allStationIds);
      // take 3 random stations for each player
      for (let i = 0; i < 3; i++) {
        playerToStations.stationIds.push(this.allStationIds[i]);
      }
      this.gameState.playersNeededStations.push(playerToStations);
    });
    return this.gameState.imposterPlayerId.playerId;
  }

  getGameState(): GameState {
    return this.gameState;
  }

  killPlayer(playerId: number): void {
    const index = this.gameState.alivePlayers.findIndex(
      (p) => p.playerId === playerId,
    );
    this.gameState.alivePlayers.splice(index, 1);
    this.checkIfGameOver();
  }

  emergencyButton(): void {
    this.gameState.emergencyButtonPressed = true;
    this.gameState.killsEnabled = false;
  }

  bodyFound(playerId: number): void {
    console.log('bodyFound', playerId, this.gameState.alivePlayers);
    if (!this.gameState.emergencyButtonPressed) {
      // player must be dead to be found dead
      if (
        this.gameState.alivePlayers.findIndex(
          (p) => p.playerId === playerId,
        ) === -1
      ) {
        this.emergencyButton();
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
        this.gameState.playersRegisteredForVoting.indexOf(playerId, 0) === -1
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
      if (
        this.gameState.playersRegisteredForVoting.length ==
        this.gameState.alivePlayers.length
      ) {
        const defaultTime = '10';
        this.gameState.meetingEndTime =
          Date.now() +
          parseInt(process.env.MEETING_DURATION_S ?? defaultTime) * 1000;
        this.meetingTimer = setTimeout(
          () => {
            this.finishVoting();
          },
          parseInt(process.env.MEETING_DURATION_S ?? defaultTime) * 1000, // TODO process env not working?
        ); // 10 seconds by default
      }
      return true;
    } else {
      return false;
    }
  }

  voteFor(playerId: number): boolean {
    console.log('voteFor', playerId, this.gameState.votes);
    // search for entry of the player, +1 the number
    const voteEntry = this.gameState.votes.find(
      (vote) => vote[0].playerId === playerId,
    );
    if (voteEntry) {
      voteEntry[1]++;
    } else {
      return false;
    }
    // check if all votes have been casted
    if (
      this.gameState.alivePlayers.length ===
      this.gameState.votes.reduce((acc, vote) => acc + vote[1], 0)
    ) {
      console.log('all votes casted');
      this.finishVoting();
    }
    return true;
  }

  startStation(stationId: string, playerId: number): void {
    // check if player is alive and not already registered for a station
    console.log(
      'startStation',
      this.gameState.alivePlayers.findIndex((x) => x.playerId === playerId) !==
        -1,
      this.gameState.stations.findIndex(
        (station) => station[0] === stationId,
      ) !== -1,
      playerId,
    );

    if (
      this.gameState.alivePlayers.findIndex((x) => x.playerId === playerId) !==
        -1 &&
      this.gameState.stations.findIndex(
        (station) => station[0] === stationId,
      ) !== -1 &&
      this.gameState.playersNeededStations.findIndex((playerToStations) => {
        if (playerToStations.playerId === playerId) {
          return (
            playerToStations.stationIds.findIndex(
              (playersStationId) => playersStationId === stationId,
            ) !== -1
          );
        }
      }) !== -1
    ) {
      console.log(
        '😜 You tried to log in to a station you are not allowed to! LOL!',
      );
      return;
    }
    this.gameState.stations.push([stationId, playerId, undefined]);
  }

  completeStation(stationId: string): void {
    const index = this.gameState.stations.findIndex(
      (station) => station[0] === stationId,
    );
    console.log('completeStation', this.gameState.stations, stationId, index);
    if (index !== -1) {
      this.gameState.stations.splice(index, 1);
      this.gameState.gamesCompleted.push(stationId);
      this.checkIfGameOver();
    } else {
      console.log(
        '😜 You tried to complete a station you are not logged in at! LOL!',
      );
    }
  }

  setStationData(stationId: string, data: any): void {
    const index = this.gameState.stations.findIndex(
      (station) => station[0] === stationId,
    );
    if (index !== -1) {
      this.gameState.stations[index][2] = data;
    }
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

  private finishVoting() {
    if (this.gameState.votes.length > 0) {
      // Find the player with the most votes
      const mostVotedPlayer = this.gameState.votes.reduce((prev, current) => {
        return prev[1] > current[1] ? prev : current;
      });
      // if no one voted, no one is killed
      if (mostVotedPlayer[1] === 0) {
        console.log('no votes, no one killed');
      } else {
        console.log('mostVotedPlayer', mostVotedPlayer);
        // check if other players have the same amount of votes
        const mostVotedPlayers = this.gameState.votes.filter(
          (vote) => vote[1] === mostVotedPlayer[1],
        );
        console.log('mostVotedPlayers', mostVotedPlayers);
        // if more than one player has the same amount of votes, no one is killed
        if (mostVotedPlayers.length > 1) {
          console.log('no one killed');
        } else {
          // kill the player with the most votes
          const playerToKill = mostVotedPlayer[0].playerId;
          console.log('killing player', playerToKill);
          this.killPlayer(playerToKill);
        }
      }
    }

    console.log('finishVoting', this.gameState.votes);

    // Reset voting state
    this.gameState.emergencyButtonPressed = false;
    this.gameState.killsEnabled = true;
    this.gameState.votes = []; // reset votes
    this.gameState.isVotingActive = false;
    this.gameState.playersRegisteredForVoting = [];
    this.gameState.bodyFound = false;
    this.gameState.meetingEndTime = -1; // reset meeting end time
    if (this.meetingTimer) {
      clearTimeout(this.meetingTimer);
    }
  }

  private checkIfGameOver() {
    // too little players remaining and imposter is alive
    if (
      this.gameState.alivePlayers.length <= 2 &&
      this.gameState.alivePlayers.findIndex(
        (x) => x.playerId === this.gameState.imposterPlayerId.playerId,
      ) !== -1
    ) {
      this.gameState.gameOver = 'IMPOSTER_WIN';
    }
    // enough stations completed or imposter is dead
    if (
      this.gameState.gamesCompleted.length >=
        this.gameState.playersConnected.length * 3 ||
      this.gameState.alivePlayers.findIndex(
        (x) => x.playerId === this.gameState.imposterPlayerId.playerId,
      ) === -1
    ) {
      this.gameState.gameOver = 'CREWMATES_WIN';
    }
  }
}
