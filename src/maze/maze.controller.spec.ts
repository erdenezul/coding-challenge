import { Test, TestingModule } from '@nestjs/testing';
import { CreateMazeDto } from './dto/create.dto';
import { MazeController } from './maze.controller';
import { MazeService } from './maze.service';
import { faker } from '@faker-js/faker';

describe('MazeController', () => {
  let controller: MazeController;

  const serviceMock = {
    create: jest.fn(),
    solution: jest.fn(),
  };

  const request = {
    user: {
      id: faker.string.uuid(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: MazeService, useValue: serviceMock }],
      controllers: [MazeController],
    }).compile();

    controller = module.get<MazeController>(MazeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call create from service', async () => {
    const payload: CreateMazeDto = {
      gridSize: '8x8',
      walls: ['A2'],
      entrance: 'A1',
    };
    await controller.create(request, payload);
    expect(serviceMock.create).toHaveBeenCalledWith(request.user, payload);
  });

  it('should call solution from service', async () => {
    await controller.solution(request, 1, {});
    expect(serviceMock.solution).toHaveBeenCalledWith(request.user, 1, {});
  });
});
