import { ApiProperty } from '@nestjs/swagger';

export class StationIdDto {
  @ApiProperty()
  stationId: string;
}
