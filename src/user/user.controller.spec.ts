import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto';
import { faker } from '@faker-js/faker';

describe('UsersController', () => {
  let controller: UserController;

  const serviceMock = {
    register: jest.fn(),
  };
  const payload: CreateUserDto = {
    username: faker.internet.userName(),
    password: faker.internet.password(),
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: UserService, useValue: serviceMock }],
      controllers: [UserController],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call register method from service', async () => {
    await controller.register(payload);
    expect(serviceMock.register).toHaveBeenCalledWith(payload);
  });
});
