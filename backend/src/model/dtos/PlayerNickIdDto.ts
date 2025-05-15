import { ApiProperty } from '@nestjs/swagger';

export class PlayerNickIdDto {
  @ApiProperty()
  playerId: number;
  nickname: string;
}
