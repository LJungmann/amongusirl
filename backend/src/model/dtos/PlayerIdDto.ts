import { ApiProperty } from '@nestjs/swagger';

export class PlayerIdDto {
  @ApiProperty()
  playerId: number;
}
