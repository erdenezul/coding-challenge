import { faker } from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { hash } from 'bcrypt';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    user: {
      findFirstOrThrow: jest.fn(),
    },
  };
  const jwtMock = {
    signAsync: jest.fn(),
  };

  const payload: LoginDto = {
    username: faker.internet.userName(),
    password: faker.string.alphanumeric(8),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: JwtService,
          useValue: jwtMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaMock.user.findFirstOrThrow.mockResolvedValue({
      id: 1,
      password: await hash(payload.password, 10),
    });
  });

  afterEach(() => {
    prismaMock.user.findFirstOrThrow.mockRestore();
    jwtMock.signAsync.mockRestore();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    describe('unhappy path', () => {
      it('should try to find user in db', async () => {
        prismaMock.user.findFirstOrThrow.mockRejectedValue(
          new Error('User not found'),
        );
        await expect(service.login(payload)).rejects.toThrow();
        expect(prismaMock.user.findFirstOrThrow).toHaveBeenCalledWith({
          where: { username: payload.username },
        });
        expect(jwtMock.signAsync).not.toHaveBeenCalled();
      });

      it('should throw error when login not found', async () => {
        prismaMock.user.findFirstOrThrow.mockRejectedValue(
          new PrismaClientKnownRequestError('No user found', {
            code: 'P2025',
            clientVersion: '1.0',
          }),
        );
        await expect(service.login(payload)).rejects.toThrow();
        expect(jwtMock.signAsync).not.toHaveBeenCalled();
      });

      it('should throw error when password is not valid', async () => {
        await expect(
          service.login({
            username: payload.username,
            password: faker.string.alpha(),
          }),
        ).rejects.toThrow();
        expect(jwtMock.signAsync).not.toHaveBeenCalled();
      });
    });

    it('should compare pasword and return token', async () => {
      const token = await service.login(payload);
      expect(token).toBeDefined();
      expect(jwtMock.signAsync).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
