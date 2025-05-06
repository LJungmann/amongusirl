import { ApiProperty } from '@nestjs/swagger';

export class StationDataDto {
  @ApiProperty()
  stationId: string;
  @ApiProperty()
  data: any;
}
