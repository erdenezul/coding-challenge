import { ApiProperty } from '@nestjs/swagger';

export class CreateMazeResponse {
  @ApiProperty({
    example: 1,
  })
  maze_id: number;
}

export class MazeSolutionResponse {
  @ApiProperty({
    example: ['A1', 'B1', 'B2', 'B3', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'],
    description: 'steps to exit a maze',
    name: 'path',
  })
  path: string[];
}
