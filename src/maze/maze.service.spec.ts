import { Test, TestingModule } from '@nestjs/testing';
import { MazeService } from './maze.service';
import { PrismaService } from 'nestjs-prisma';
import { CreateMazeDto } from './dto/create.dto';
import { faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';

describe('MazeService', () => {
  let service: MazeService;

  const prismaMock = {
    maze: {
      create: jest.fn(),
      findFirstOrThrow: jest.fn(),
    },
  };
  const user = { id: faker.string.uuid() };
  const max_paths = ['A1', 'B1'];
  const min_paths = ['B1'];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MazeService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<MazeService>(MazeService);
    prismaMock.maze.create.mockResolvedValue({ id: 1 });
    prismaMock.maze.findFirstOrThrow.mockResolvedValue({
      min_paths,
      max_paths,
    });
  });

  afterEach(() => {
    prismaMock.maze.create.mockRestore();
    prismaMock.maze.findFirstOrThrow.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  const simpleCase: CreateMazeDto = {
    gridSize: '8x8',
    entrance: 'A1',
    walls: [
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
  };
  const noPathCase: CreateMazeDto = {
    gridSize: '2x2',
    walls: ['A2', 'B2'],
    entrance: 'A1',
  };

  describe('create maze', () => {
    it('should create maze', async () => {
      await service.create(user, simpleCase);
      expect(prismaMock.maze.create).toHaveBeenCalledWith({
        data: {
          row: 8,
          col: 8,
          user_id: user.id,
          walls: simpleCase.walls,
          entrance: simpleCase.entrance,
          min_paths: expect.any(Array<string>),
          max_paths: expect.any(Array<string>),
        },
      });
    });

    it('should not create maze when no paths found', async () => {
      await expect(service.create(user, noPathCase)).rejects.toThrow();
      expect(prismaMock.maze.create).not.toHaveBeenCalled();
    });
  });

  describe('solution for maze', () => {
    it('should fetch maze from db', async () => {
      await service.solution(user, 1, {});
      expect(prismaMock.maze.findFirstOrThrow).toHaveBeenCalledWith({
        where: { id: 1, user_id: user.id },
      });
    });

    it('should return max paths when steps is max', async () => {
      const result = await service.solution(user, 1, { steps: 'max' });
      expect(result.path).toBe(max_paths);
    });

    it('should throw not found error when someone(except owner) tried to get solution', async () => {
      prismaMock.maze.findFirstOrThrow.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('No maze found', {
          code: 'P2025',
          clientVersion: '1.0',
        }),
      );
      await expect(service.solution(user, 1, {})).rejects.toThrow();
    });
  });
});
