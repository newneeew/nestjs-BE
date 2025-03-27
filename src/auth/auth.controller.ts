import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { VerifyEmailDto } from 'src/user/dto/verify-email.dto';
import { RequestWithUser } from './interfaces/RequestWithUsers';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AccessTokenGuard } from './guards/accessToken.guard';
import { UserService } from '../user/user.service';
import { TokenType } from '../common/enums/tokenType.enum';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('/signup')
  @ApiOperation({ summary: 'User Signup', description: 'User Signup' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Signup success',
    type: User,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  async registerMember(@Body() createUserDto: CreateUserDto): Promise<User> {
    console.log(createUserDto);
    return await this.authService.registerUser(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'login success' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'forbidden' })
  @ApiOperation({
    summary: 'Member Login',
    description: 'Member Login',
  })
  async logIn(
    @Req() req: RequestWithUser, // Express Response
    @Res() response: Response,
  ): Promise<void> {
    const { user } = req;
    const { token: accessToken, cookie: accessTokenCookie } =
      await this.authService.generateToken(user.id, TokenType.ACCESS);
    const { token: refreshToken, cookie: refreshTokenCookie } =
      await this.authService.generateToken(user.id, TokenType.REFRESH);

    await this.userService.setCurrentRefreshTokenToRedis(refreshToken, user.id);

    user.password = undefined;
    req.res.setHeader('Set-Cookie', [accessTokenCookie, refreshTokenCookie]);

    response.send({ user, accessToken, refreshToken });
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Get User Info', description: 'Get User Info' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User Info success',
    type: User,
  })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'forbidden' })
  async authenticate(@Req() req: RequestWithUser): Promise<User> {
    return await req.user;
  }
  // async getUserInfo(@Req() req: RequestBodyObject): Promise<User> {
  //   return await req.user;
  // }

  @Post('/email/send')
  @ApiBody({ type: SendEmailDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'email send success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiOperation({
    summary: 'Send Email',
    description: 'Send Email',
  })
  async sendEmail(@Body() sendEmailDto: SendEmailDto): Promise<void> {
    return await this.authService.emailVerify(sendEmailDto.email);
  }

  @Post('email/verify')
  @ApiBody({ type: VerifyEmailDto })
  @ApiResponse({ status: 200, description: 'Check Email of Verification' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiOperation({
    summary: 'Verifiy Email',
    description: 'Verifiy Email',
  })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<any> {
    return await this.authService.confirmEmail(verifyEmailDto);
  }
  // async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<Boolean> {
  //   return await this.authService.confirmEmail(verifyEmailDto);
  // }

  @Get('/google')
  @UseGuards(GoogleAuthGuard)
  async googleLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get('/google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(@Req() req: RequestWithUser): Promise<User> {
    return req.user;
  }
}
