import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Request,
  Query,
} from '@nestjs/common';
import { CreateMazeDto } from './dto/create.dto';
import { MazeService } from './maze.service';
import {
  CreateMazeResponse,
  MazeSolutionResponse,
} from './interfaces/maze.interface';
import { SolutionQueryParam } from './dto/solution.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('maze')
export class MazeController {
  constructor(private readonly service: MazeService) {}

  @Post()
  @ApiTags('maze')
  @ApiOperation({ summary: 'Create maze', description: 'Create a maze' })
  @ApiBody({
    type: CreateMazeDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns created maze id',
    type: CreateMazeResponse,
  })
  async create(
    @Request() request,
    @Body() payload: CreateMazeDto,
  ): Promise<CreateMazeResponse> {
    return this.service.create(request.user, payload);
  }

  @Get(':id/solution')
  @ApiTags('maze')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns solution of maze',
    type: MazeSolutionResponse,
  })
  async solution(
    @Request() request,
    @Param('id', ParseIntPipe) id: number,
    @Query() queryParams: SolutionQueryParam,
  ): Promise<MazeSolutionResponse> {
    return this.service.solution(request.user, id, queryParams);
  }
}
