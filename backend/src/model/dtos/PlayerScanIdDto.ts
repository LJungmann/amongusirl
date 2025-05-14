import { ApiProperty } from '@nestjs/swagger';

export class PlayerScanIdDto {
  @ApiProperty()
  playerId: number;
  scannedId: number;
}
