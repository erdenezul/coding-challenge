import { faker } from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { CreateUserDto } from './dto';
import { UserService } from './user.service';
import { Role } from '../auth/typedefs/role.enum';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { HttpException, HttpStatus } from '@nestjs/common';

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

    describe('unhappy path', () => {
      it('should throw bad request when user already exists', async () => {
        prismaMock.user.create.mockRejectedValue(
          new PrismaClientKnownRequestError('Unique error', {
            code: 'P2002',
            clientVersion: '1.0',
          }),
        );
        await expect(service.register(paylaod)).rejects.toThrow(
          new HttpException('User already exists', HttpStatus.BAD_REQUEST),
        );
      });

      it('should error now be swallowed', async () => {
        prismaMock.user.create.mockRejectedValue(
          new Error('this error should not be swallowed'),
        );
        await expect(service.register(paylaod)).rejects.toThrow();
      });
    });

    it('should create buyer user by default', async () => {
      const token = await service.register(paylaod);
      expect(token).toBeDefined();

      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          username: paylaod.username,
          password: expect.any(String),
          role: Role.Buyer,
        },
      });

      expect(jwtMock.signAsync).toHaveBeenCalledWith({ id: 1 });
    });

    it('should create user with seller', async () => {
      await service.register({ ...paylaod, role: Role.Seller });
      expect(prismaMock.user.create).toHaveBeenCalledWith({
        data: {
          username: paylaod.username,
          password: expect.any(String),
          role: Role.Seller,
        },
      });
    });
  });
});
