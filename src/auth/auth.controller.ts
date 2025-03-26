import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { VerifyEmailDto } from 'src/user/dto/verify-email.dto';
import { RequestBodyObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { RequestWithUser } from './interfaces/RequestWithUsers';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @Post('/login')
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'login success' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'forbidden' })
  @ApiOperation({
    summary: 'Member Login',
    description: 'Member Login',
  })
  async logIn(@Body() loginUserDto: LoginUserDto): Promise<User> {
    return await this.authService.getAuthenticatedUser(loginUserDto);
  }

  async loggedIn(@Req() request: RequestWithUser){
    const {user} = request;
    const accessToken = await this.authService.generateAccessToken();
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  async getUserInfo(@Req() req: RequestBodyObject)

  @Post('/send/email')
  async sendEmail(@Body() sendEmailDto: SendEmailDto): Promise<void> {
    return await this.authService.emailVerify(sendEmailDto);
  }

  @Post("/verify/email")
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<Boolean> {
    return await this.authService.confirmEmail(verifyEmailDto);
  }

  @Get("/google")
  @UseGuards(GoogleAuthGuard)
  async googleLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @Get("/google/callback")
  @UseGuards(GoogleAuthGuard)
  async googleLoginCallback(@Req() req: RequestWithUser): Promise<User>  {
    return req.user;
  }
}
