import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { User } from '../user/entities/user.entity';
import { PostgresErrorCode } from '../database/postgresErrorCodes.enum';
import { Provider } from '../common/enums/provider.enum';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { EmailService } from 'src/email/email.service';
import { SendEmailDto } from './dto/send-email.dto';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { Cache } from 'cache-manager';
import { VerifyEmailDto } from 'src/user/dto/verify-email.dto';
import { JwtService } from '@nestjs/jwt';
import { TokenPayloadInterface } from './interfaces/token-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly jwtService: JwtService,
    private readonly configServiec: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async signupUser(createUserDto: CreateUserDto): Promise<User> {
    return await this.userService.createUser(createUserDto);
  }

  public async registerUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.userService.createUser({
        ...createUserDto,
        provider: Provider.LOCAL,
      });
    } catch (err) {
      if (err?.code !== PostgresErrorCode.unique_violation) {
        if (err?.code === PostgresErrorCode.not_null_violation) {
          throw new HttpException(
            'Please check not null body value',
            HttpStatus.BAD_REQUEST,
          );
        }
      } else {
        throw new HttpException(
          'User with that email already exists',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  public async getAuthenticatedUser(loginUserDto: LoginUserDto): Promise<User> {
    const { email, password } = loginUserDto;
    const member = await this.userService.getUserBy('email', email);
    const isPasswordMatched = await member.checkPassword(password);
    if (!isPasswordMatched) {
      throw new HttpException(
        'Wrong credentials provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    return member;
  }

  // async generateAccessToken(userId: string) {
  //   const payload: any = { userId };
  //   const accessToken = this.jwtService.sign(payload, {
  //     secret: this.configService.get('ACCESSTOKEN_SECRET'),
  //     expiresIn: `${this.configService.get('ACCESS_TOKEN_EXPIRATION_TIME')}`,
  //   });

  //   return accessToken;
  // }
  public generateToken(
    userId: string,
    tokenType: 'ACCESS' | 'REFRESH',
  ): {
    token: string;
    cookie: string;
  } {
    const payload: TokenPayloadInterface = { userId };

    const secretKey = this.configService.get(
      tokenType === 'ACCESS' ? 'ACCESS_TOKEN_SECRET' : 'REFRESH_TOKEN_SECRET',
    );
    const expirationTime = this.configService.get(
      tokenType === 'ACCESS'
        ? 'ACCESS_TOKEN_EXPIRATION_TIME'
        : 'REFRESH_TOKEN_EXPIRATION_TIME',
    );

    const token = this.jwtService.sign(payload, {
      secret: secretKey,
      expiresIn: `${expirationTime}`,
    });

    const cookieName = tokenType === 'ACCESS' ? 'AUTHENTICATION' : 'REFRESH';
    const cookie = `${cookieName}=${token}; Path=/; Max-Age=${expirationTime}`;

    return {
      token,
      cookie,
    };
  }

  public getCookiesForLogOut(): string[] {
    return [
      'AUTHENTICATION=; HttpOnly; Path=/; Max-Age=0',
      'REFRESH=; HttpOnly; Path=/; Max-Age=0',
    ];
  }

  async emailVerify(email: string): Promise<void> {
    const genetateNumber = this.generateOTP();

    await this.cacheManager.set(this.emailService, genetateNumber);

    return await this.emailService.sendEmail({
      to: email,
      subject: 'Verification Email Address - eugene',
      html: `<h1>Welcome - ${genetateNumber}</h1>`,
    });
  }

  generateOTP() {
    let OTP = '';
    for (let i = 1; i < 6; i++) {
      OTP += Math.floor(Math.random() * 10);
    }
    return OTP;
  }

  async confirmEmail(verifyEmailDto: VerifyEmailDto): Promise<Boolean> {
    const { email, code } = verifyEmailDto;

    const emailCodeByRedis = await this.cacheManager.get(email);
    if (emailCodeByRedis !== code) {
      throw new BadRequestException('Wrong code provided');
    }
    await this.cacheManager.del(email);
    return true;
  }
}
