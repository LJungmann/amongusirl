export class GameState {
  currentGameId: string = '';
  playersConnected: Array<{ playerId: number }> = [];
  gamesCompleted: string[] = [];
  alivePlayers: Array<{ playerId: number }> = [];
  imposterPlayerId: { playerId: number } = { playerId: -1 };
  isGameStarted: boolean = false;
  isVotingActive: boolean = false;
  emergencyButtonPressed: boolean = false;
  meetingEndTime: number = -1; // timestamp in ms
  gameOver: 'CREWMATES_WIN' | 'IMPOSTER_WIN' | 'IN_PROGRESS' = 'IN_PROGRESS';
  killsEnabled: boolean = true;
  bodyFound: boolean = false;
  playersRegisteredForVoting: number[] = [];
  votes: [{ playerId: number }, number][] = []; // tuple, player has x votes
  stations: [string, number, any][] = []; // tuple, stationId and playerId and stationData
  playersNeededStations: PlayerToStations[] = [];
}

export class PlayerToStations {
  playerId: number;
  stationIds: string[];

  constructor() {
    this.playerId = -1;
    this.stationIds = [];
  }
}
