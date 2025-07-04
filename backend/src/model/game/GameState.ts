export class GameState {
  currentGameId: string = '';
  playersConnected: Array<{ playerId: number }> = [];
  gamesCompleted: string[] = [];
  alivePlayers: Array<{ playerId: number }> = [];
  imposterPlayerId: Array<{ playerId: number }> = [];
  isGameStarted: boolean = false;
  isVotingActive: boolean = false;
  emergencyButtonPressed: boolean = false;
  meetingEndTime: number = -1; // timestamp in ms
  meetingStartTime: number = -1; // timestamp in ms
  gameOver: 'CREWMATES_WIN' | 'IMPOSTER_WIN' | 'IN_PROGRESS' = 'IN_PROGRESS';
  killsEnabled: boolean = true;
  bodyFound: boolean = false;
  playersRegisteredForVoting: number[] = [];
  nicknames: [{ playerId: number }, string][] = []; // tuple, player has name
  votes: [{ playerId: number }, number][] = []; // tuple, player has x votes
  scansCompleted: [{ playerId: number }, number][] = []; // tuple, player has x scans of other players
  stations: [string, number, any][] = []; // tuple, stationId and playerId and stationData
  playersNeededStations: PlayerToStations[] = [];
  lastMeetingResult: string = ''; // result of the last meeting
  gameSettings: GameSettings = {
    imposterCount: 1,
    meetingDuration: 60,
    scansPerPlayer: 3,
    tasksPerPlayer: 3,
    killWindowTime: 5,
    scanCooldownTime: 60,
  };
}

export class GameSettings {
  imposterCount: number;
  meetingDuration: number; // in seconds
  scansPerPlayer: number;
  tasksPerPlayer: number;
  killWindowTime: number; // in seconds
  scanCooldownTime: number; // in seconds

  constructor() {
    this.imposterCount = 1;
    this.meetingDuration = 60;
    this.scansPerPlayer = 3;
    this.tasksPerPlayer = 3;
    this.killWindowTime = 5;
    this.scanCooldownTime = 60;
  }
}

export class PlayerToStations {
  playerId: number;
  stationIds: string[];

  constructor() {
    this.playerId = -1;
    this.stationIds = [];
  }
}
