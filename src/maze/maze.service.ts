import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateMazeDto } from './dto/create.dto';
import { SolutionQueryParam } from './dto/solution.dto';
import {
  CreateMazeResponse,
  MazeSolutionResponse,
} from './interfaces/maze.interface';

@Injectable()
export class MazeService {
  private readonly logger = new Logger(MazeService.name);

  /**
   * Directions to travel in cells
   */
  private readonly directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  constructor(private readonly dbService: PrismaService) {}

  //#region Controller methods
  /**
   * Creates maze with max min solutions and saves it to database
   */
  async create(
    user: { id: string },
    { gridSize, walls, entrance }: CreateMazeDto,
  ): Promise<CreateMazeResponse> {
    const [row, col] = gridSize.split('x').map(Number);
    this.logger.debug(row, col);
    this.logger.debug('Creating maze', { gridSize, walls, entrance });
    const { path } = await this.findPath(gridSize, walls, entrance);

    this.logger.debug(path);
    const maze = await this.dbService.maze.create({
      data: {
        row: Number(row),
        col: Number(col),
        walls,
        user_id: user.id,
        entrance,
        min_paths: path,
        max_paths: [],
      },
    });
    return {
      maze_id: maze.id,
    };
  }

  /**
   * Returns solution for a maze.
   * By default: it will returns minimum steps to escape maze
   * @param id {maze id}
   * @returns string[]
   */
  async solution(
    user: { id: string },
    id: number,
    { steps = 'min' }: SolutionQueryParam,
  ): Promise<MazeSolutionResponse> {
    try {
      this.logger.log(`Retrieving maze solution`, { id });

      const maze = await this.dbService.maze.findFirstOrThrow({
        where: { id, user_id: user.id },
      });
      return {
        path: steps === 'min' ? maze.min_paths : maze.max_paths,
      };
    } catch (error) {
      this.logger.log(error);
      if (error.code === 'P2025')
        throw new HttpException('No maze found', HttpStatus.NOT_FOUND);
    }
  }

  //#endregion

  private createMaze(gridSize: string, walls: string[]) {
    const [row, col] = gridSize.split('x').map(Number);
    const maze = Array.from({ length: row }, () => Array(col).fill(0));
    walls.forEach((cell) => {
      const [col, row] = cell.split('');
      const rowIndex = row.charCodeAt(0) - '1'.charCodeAt(0);
      const colIndex = col.charCodeAt(0) - 'A'.charCodeAt(0);
      maze[rowIndex][colIndex] = 1; // Mark walls as 1
    });
    return maze;
  }

  /**
   * Finds a minumum path to escape the maze
   * @param gridSize  {Example: 8x8}
   * @param walls     {Example: [A2, B2]}
   * @param entrance  {Example: A1}
   * @returns
   */
  private findPath(
    gridSize: string,
    walls: string[],
    entrance: string,
  ): { path: string[] } {
    const [rows, cols] = gridSize.split('x').map(Number);
    const maze = this.createMaze(gridSize, walls);

    const [entranceCol, entranceRow] = entrance.split('');
    const startRow = entranceRow.charCodeAt(0) - '1'.charCodeAt(0);
    const startCol = entranceCol.charCodeAt(0) - 'A'.charCodeAt(0);
    const queue = [[startRow, startCol]];
    const path = [];
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

    visited[startRow][startCol] = true;

    while (queue.length > 0) {
      const [row, col] = queue.shift();
      path.push(String.fromCharCode('A'.charCodeAt(0) + col) + (row + 1));

      // Check if we've reached the bottom right corner
      if (row === rows - 1) {
        return { path };
      }

      // Explore neighbors (up, down, left, right)
      this.directions.forEach(([dr, dc]) => {
        const newRow = row + dr,
          newCol = col + dc;
        if (
          newRow >= 0 &&
          newRow < rows &&
          newCol >= 0 &&
          newCol < cols &&
          maze[newRow][newCol] === 0 &&
          !visited[newRow][newCol]
        ) {
          queue.push([newRow, newCol]);
          visited[newRow][newCol] = true;
        }
      });
    }

    throw new Error('No path found');
  }
}
