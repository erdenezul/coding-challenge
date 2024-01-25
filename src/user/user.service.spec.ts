import { faker } from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './dto';
import { UserService } from './user.service';

describe('UsersService', () => {
  let service: UserService;

  const prismaMock = {
    user: {
      create: jest.fn(),
    },
  };

  const jwtMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: JwtService, useValue: jwtMock },
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaMock.user.create.mockResolvedValue({ id: 1 });
    jwtMock.signAsync.mockResolvedValue(faker.string.alphanumeric(60));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const paylaod: CreateUserDto = {
      username: faker.internet.userName(),
      password: faker.internet.password(),
    };
    it('should create user in db', async () => {
      const token = await service.register(paylaod);
      expect(token).toBeDefined();

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: { username: paylaod.username, password: expect.any(String) },
      });

      expect(jwtMock.signAsync).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
