import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { OpenGameResponse } from './model/game/OpenGameResponse';
import { GameState } from './model/game/GameState';
import { ApiBody } from '@nestjs/swagger';
import { PlayerIdDto } from './model/dtos/PlayerIdDto';
import { StartStationDto } from './model/dtos/StartStationDto';
import { StationIdDto } from './model/dtos/StationIdDto';
import { StationDataDto } from './model/dtos/StationDataDto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('reset')
  reset(): void {
    // reset the game
    this.appService.resetGameState();
  }

  @Post('open')
  @ApiBody({ type: PlayerIdDto })
  openGame(@Body() playerId: PlayerIdDto): OpenGameResponse {
    return this.appService.openGame(playerId.playerId);
  }

  @Post('join')
  @ApiBody({ type: PlayerIdDto })
  joinGame(@Body() playerId: PlayerIdDto): number {
    return this.appService.joinGame(playerId.playerId);
  }

  @Post('start')
  startGame(): number {
    return this.appService.startGame();
  }

  @Get('gameState')
  gameState(): GameState {
    return this.appService.getGameState();
  }

  @Post('kill')
  @ApiBody({ type: PlayerIdDto })
  killPlayer(@Body() data: PlayerIdDto): void {
    this.appService.killPlayer(data.playerId);
  }

  // emergency button
  @Post('emergency')
  emergencyButtonPressed(): void {
    this.appService.emergencyButton();
  }

  // dead body found
  @Post('bodyFound')
  @ApiBody({ type: PlayerIdDto })
  bodyFound(@Body() data: PlayerIdDto): void {
    this.appService.bodyFound(data.playerId);
  }

  @Post('registerVoting')
  @ApiBody({ type: PlayerIdDto })
  registerForVoting(@Body() data: PlayerIdDto): boolean {
    console.log('registerForVoting', data.playerId);
    return this.appService.registerForVoting(data.playerId);
  }

  @Post('voteFor')
  @ApiBody({ type: PlayerIdDto })
  voteFor(@Body() data: PlayerIdDto): boolean {
    return this.appService.voteFor(data.playerId);
  }

  @Post('startStation')
  @ApiBody({ type: StartStationDto })
  startStation(@Body() data: StartStationDto): void {
    this.appService.startStation(data.stationId, data.playerId);
  }

  @Post('completeStation')
  @ApiBody({ type: StationIdDto })
  completeStation(@Body() data: StationIdDto): void {
    if (!data.stationId.startsWith('station_')) {
      data.stationId = 'station_' + data.stationId;
    }
    this.appService.completeStation(data.stationId);
  }

  @Post('setStationData')
  @ApiBody({ type: StationDataDto })
  setStationData(@Body() data: StationDataDto): void {
    this.appService.setStationData(data.stationId, data.data);
  }
}
