import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches } from 'class-validator';
/**
 * 1. gridSize (size of a maze grid i.e. 10x10)
 * 2. walls (an array of cells which contain a wall within a given grid)
 * 3. entrance (the cell where the path should begin i.e. A1)
 */
export class CreateMazeDto {
  @ApiProperty({ example: 'A1' })
  @IsString()
  @Matches(/[A-Z]/)
  entrance: string;

  @ApiProperty({ example: '8x8' })
  @Matches(/\d\d?x\d\d?/)
  gridSize: string;

  @ApiProperty({
    example: [
      'C1',
      'G1',
      'A2',
      'C2',
      'E2',
      'G2',
      'C3',
      'E3',
      'B4',
      'C4',
      'E4',
      'F4',
      'G4',
      'B5',
      'E5',
      'B6',
      'D6',
      'E6',
      'G6',
      'H6',
      'B7',
      'D7',
      'G7',
      'B8',
    ],
  })
  @Matches(/[A-Z]\d{1,2}/, {
    each: true,
  })
  walls: string[];
}
