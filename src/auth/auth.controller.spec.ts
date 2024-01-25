import { faker } from '@faker-js/faker';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from 'src/user/dto';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const serviceMock = {
    login: jest.fn(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: AuthService, useValue: serviceMock }],
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    const payload: CreateUserDto = {
      username: faker.internet.userName(),
      password: faker.string.alphanumeric(8),
    };
    it('should call service.login with proper payload', async () => {
      await controller.login(payload);
      expect(serviceMock.login).toHaveBeenCalledWith(payload);
    });
  });
});
