import { ApiProperty } from '@nestjs/swagger';

export class StartStationDto {
  @ApiProperty()
  stationId: string;
  @ApiProperty()
  playerId: number;
}
