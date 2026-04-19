import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from './decorators/public.decorator';
import { AuthThrottlerGuard } from './guards/auth-throttler.guard';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('Auth')
@UseGuards(AuthThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'User signup', description: 'User signup' })
  @ApiResponse({
    status: 201,
    description: 'The user has been signed up',
    example: {
      id: 'a34b1e7c-b589-443c-a55e-3b916e1dfd3f',
      login: 'string',
      role: 'viewer',
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request. Body does not contain required fields or login is already taken',
  })
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login', description: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'The user has been logged in',
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMzRiMWU3Yy1iNTg5LTQ0M2MtYTU1ZS0zYjkxNmUxZGZkM2YiLCJsb2dpbiI6InN0cmluZzIyMiIsInJvbGUiOiJ2aWV3ZXIiLCJpYXQiOjE3NzY2MjA2NDMsImV4cCI6MTc3NjYyMTU0M30.RtER_uBkCul6hPnSUJWSE0dBtwv7BYiooq4aX3anEVs',
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMzRiMWU3Yy1iNTg5LTQ0M2MtYTU1ZS0zYjkxNmUxZGZkM2YiLCJsb2dpbiI6InN0cmluZzIyMiIsInJvbGUiOiJ2aWV3ZXIiLCJpYXQiOjE3NzY2MjA2NDMsImV4cCI6MTc3NzIyNTQ0M30.aaRmwcAngHNnG7kn_QHv8Udu_IPWOmKNh-fQyFKno2A',
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request. Body contains no login or password, or they are not strings',
  })
  @ApiResponse({
    status: 403,
    description: 'Incorrect login or password',
  })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get a new pair of Access token and Refresh token',
    description: 'Get a new pair of Access token and Refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Gets a new pair of Access token and Refresh token',
    example: {
      accessToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMzRiMWU3Yy1iNTg5LTQ0M2MtYTU1ZS0zYjkxNmUxZGZkM2YiLCJsb2dpbiI6InN0cmluZzIyMiIsInJvbGUiOiJ2aWV3ZXIiLCJpYXQiOjE3NzY2MjA4MzQsImV4cCI6MTc3NjYyMTczNH0.VcdsWaJRBP2Ymyun26V6Fg1IH0pZWGJ9GlDaDAhJtT8',
      refreshToken:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhMzRiMWU3Yy1iNTg5LTQ0M2MtYTU1ZS0zYjkxNmUxZGZkM2YiLCJsb2dpbiI6InN0cmluZzIyMiIsInJvbGUiOiJ2aWV3ZXIiLCJpYXQiOjE3NzY2MjA4MzQsImV4cCI6MTc3NzIyNTYzNH0.KEF3QcYd5DpFUH7oxO9Ys7AvsnocMaOUazWjXctH4OM',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Bad request. Body does not contain refreshToken',
  })
  @ApiResponse({
    status: 403,
    description: 'Refresh token is invalid or expired',
  })
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Logout',
    description: 'Invalidates the refresh token',
  })
  @ApiResponse({
    status: 200,
    description: 'Invalidates the refresh token',
    example: {
      message: 'Logged out successfully',
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Bad request. Body does not contain refreshToken',
  })
  async logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto.refreshToken);
  }
}
