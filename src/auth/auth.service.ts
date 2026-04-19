import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hash, compare } from 'bcryptjs';
import {
  USER_REPOSITORY,
  UserRepository,
} from 'src/domain/repositories/user.repository.interface';
import { SignupDto } from './dto/signup.dto';
import { User } from 'src/domain/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { UserInterface } from 'src/domain/entities/user.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: UserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.userRepo.findByLogin(dto.login);
    if (existing)
      throw new BadRequestException('User with this login already exists');

    const hashedPassword = await hash(dto.password, 10);

    const userEntity = new User({
      login: dto.login,
      password: hashedPassword,
      role: 'viewer',
    });

    await this.userRepo.create(userEntity);

    return { message: 'User created successfully' };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findByLogin(dto.login);
    if (!user || !(await compare(dto.password, user.password))) {
      throw new ForbiddenException('Invalid login or password');
    }

    return this.generateTokens(user);
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      const user = await this.userRepo.findById(payload.userId);
      if (!user) throw new UnauthorizedException();

      return this.generateTokens(user);
    } catch {
      throw new ForbiddenException('Invalid or expired refresh token');
    }
  }

  private async generateTokens(user: UserInterface) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId: user.id,
          login: user.login,
          role: user.role,
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: process.env.JWT_ACCESS_TTL,
        },
      ),
      this.jwtService.signAsync(
        { userId: user.id },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: process.env.JWT_REFRESH_TTL,
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
