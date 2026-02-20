import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from '../../../entities/user.entity';
import { JwtPayload, JwtServiceCustom } from './jwt.service';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { emailQueue } from '../email/email.queue';
import { jobs } from 'src/app/common/rules/jobs';

jest.mock('bcrypt');
jest.mock('../email/email.queue', () => ({
  emailQueue: { add: jest.fn() },
}));

const user: User = {
  id: 'valid_id',
  role: 'admin',
  name: 'name',
  email: 'email',
  password: 'hashed_password',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: { findOneBy: jest.Mock; save: jest.Mock };
  let jwtService: JwtServiceCustom;

  beforeEach(async () => {
    const mockUserRepo = {
      findOneBy: jest.fn(),
      save: jest.fn(),
    };

    const mockJwtService = {
      generateAccessToken: jest.fn().mockResolvedValue('access_token_mock'),
      generateRefreshToken: jest.fn().mockResolvedValue('refresh_token_mock'),
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepo,
        },
        {
          provide: JwtServiceCustom,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === 'BCRYPT_HASH_SALT' ? '10' : undefined,
            ),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get(getRepositoryToken(User));
    jwtService = module.get<JwtServiceCustom>(JwtServiceCustom);
  });

  describe('me', () => {
    it('should rethrow unexpected errors', async () => {
      const error = new Error('Connection refused');
      userRepo.findOneBy.mockRejectedValue(error);

      await expect(service.me('valid_id')).rejects.toThrow(error);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepo.findOneBy.mockResolvedValue(null);

      await expect(service.me('invalid_id')).rejects.toThrow(NotFoundException);
    });

    it('should return correct user data', async () => {
      userRepo.findOneBy.mockResolvedValue(user);

      const result = await service.me('valid_id');

      expect(userRepo.findOneBy).toHaveBeenCalledWith({ id: user.id });
      expect(result).toEqual({
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      });
    });
  });

  describe('login', () => {
    it('should rethrow unexpected errors', async () => {
      const error = new Error('Connection refused');
      userRepo.findOneBy.mockRejectedValue(error);

      await expect(
        service.login({ email: user.email, password: 'valid_password' }),
      ).rejects.toThrow(error);
    });

    it('should throw UnauthorizedException if invalid email', async () => {
      userRepo.findOneBy.mockResolvedValue(null);

      await expect(
        service.login({ email: 'invalid@email.com', password: 'any' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        email: 'invalid@email.com',
      });
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      userRepo.findOneBy.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: user.email, password: 'invalid_password' }),
      ).rejects.toThrow(UnauthorizedException);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'invalid_password',
        user.password,
      );
    });

    it('should called generate tokens methods with correct payload', async () => {
      userRepo.findOneBy.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const payload: JwtPayload = {
        sub: user.id,
        role: user.role,
      };

      await service.login({
        email: user.email,
        password: 'valid_password',
      });

      expect(jwtService.generateAccessToken).toHaveBeenCalledWith(payload);
      expect(jwtService.generateRefreshToken).toHaveBeenCalledWith(payload);
    });

    it('should returns tokens of logged user', async () => {
      userRepo.findOneBy.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: user.email,
        password: 'valid_password',
      });

      expect(result).toMatchObject({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      });
    });
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      role: user.role,
      email: user.email,
      password: 'valid_password',
      name: user.name,
    };

    it('should rethrow unexpected errors', async () => {
      const error = new Error('Connection refused');
      userRepo.findOneBy.mockRejectedValue(error);

      await expect(service.register(registerDto)).rejects.toThrow(error);
    });

    it('should throw ConflictException if email already registered', async () => {
      userRepo.findOneBy.mockResolvedValue(user);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );

      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        email: user.email,
      });
    });

    it('should called hash method with corrects values', async () => {
      userRepo.findOneBy.mockResolvedValue(null);
      userRepo.save.mockResolvedValue(user);

      await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
    });

    it('should called save method with correct data', async () => {
      userRepo.findOneBy.mockResolvedValue(null);
      userRepo.save.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      await service.register(registerDto);

      expect(userRepo.save).toHaveBeenCalledWith({
        ...registerDto,
        password: 'hashed_password',
      });
    });

    it('should called generate tokens methods with correct payload', async () => {
      userRepo.findOneBy.mockResolvedValue(null);
      userRepo.save.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const payload: JwtPayload = {
        sub: user.id,
        role: user.role,
      };

      await service.register(registerDto);

      expect(jwtService.generateAccessToken).toHaveBeenCalledWith(payload);
      expect(jwtService.generateRefreshToken).toHaveBeenCalledWith(payload);
    });

    it('should create job to send email', async () => {
      userRepo.findOneBy.mockResolvedValue(null);
      userRepo.save.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      jest.spyOn(emailQueue, 'add');

      await service.register(registerDto);

      expect(emailQueue.add).toHaveBeenCalledWith(
        jobs.send_email.name,
        expect.any(Object),
        jobs.send_email.options,
      );
    });

    it('should returns tokens of registered user', async () => {
      userRepo.findOneBy.mockResolvedValue(null);
      userRepo.save.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');

      const result = await service.register(registerDto);

      expect(result).toMatchObject({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      });
    });
  });

  describe('refreshTokens', () => {
    it('should rethrow unexpected errors', async () => {
      const error = new Error('Connection refused');
      userRepo.findOneBy.mockRejectedValue(error);

      await expect(service.refreshTokens(user.id)).rejects.toThrow(error);
    });

    it('should throw UnauthorizedException if user by id not found', async () => {
      userRepo.findOneBy.mockResolvedValue(null);

      await expect(service.refreshTokens(user.id)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(userRepo.findOneBy).toHaveBeenCalledWith({
        id: user.id,
      });
    });

    it('should called generate tokens methods with correct payload', async () => {
      userRepo.findOneBy.mockResolvedValue(user);

      const payload: JwtPayload = {
        sub: user.id,
        role: user.role,
      };

      await service.refreshTokens(user.id);

      expect(jwtService.generateAccessToken).toHaveBeenCalledWith(payload);
      expect(jwtService.generateRefreshToken).toHaveBeenCalledWith(payload);
    });

    it('should returns new tokens on success', async () => {
      userRepo.findOneBy.mockResolvedValue(user);

      const result = await service.refreshTokens(user.id);

      expect(result).toMatchObject({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      });
    });
  });
});
