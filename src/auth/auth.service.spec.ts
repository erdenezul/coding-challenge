import { faker } from '@faker-js/faker';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { hash } from 'bcrypt';
import dayjs from 'dayjs';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  //#region  mocks
  const prismaMock = {
    user: {
      findFirstOrThrow: jest.fn(),
    },
    session: {
      upsert: jest.fn(),
    },
  };
  const jwtMock = {
    signAsync: jest.fn(),
  };

  const configMock = {
    get: jest.fn(),
  };
  //#endregion

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
        {
          provide: ConfigService,
          useValue: configMock,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaMock.user.findFirstOrThrow.mockResolvedValue({
      id: 1,
      password: await hash(payload.password, 10),
      session: {
        id: faker.string.uuid(),
        expires_at: faker.date.past(),
      },
    });
    configMock.get.mockReturnValue({ expiresIn: 3600 });
  });

  afterEach(() => {
    prismaMock.user.findFirstOrThrow.mockRestore();
    jwtMock.signAsync.mockRestore();
    configMock.get.mockRestore();
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
          include: { session: true },
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

      it('should throw error when login session exists', async () => {
        prismaMock.user.findFirstOrThrow.mockResolvedValue({
          id: 1,
          password: await hash(payload.password, 10),
          session: {
            id: faker.string.uuid(),
            expires_at: dayjs().add(30, 'minutes').toDate(),
          },
        });
        await expect(service.login(payload)).rejects.toThrow();
        expect(jwtMock.signAsync).not.toHaveBeenCalled();
      });
    });

    it('should compare pasword and return token', async () => {
      const token = await service.login(payload);
      expect(token).toBeDefined();
      expect(jwtMock.signAsync).toHaveBeenCalledWith({ id: 1 });
    });

    it('should create login session', async () => {
      prismaMock.user.findFirstOrThrow.mockResolvedValue({
        id: 1,
        password: await hash(payload.password, 10),
      });
      await service.login(payload);
      expect(prismaMock.session.upsert).toHaveBeenCalledWith({
        where: {
          id: '',
        },
        create: {
          user_id: 1,
          expires_at: expect.any(Date),
        },
        update: {
          expires_at: expect.any(Date),
        },
      });
    });
  });
});
