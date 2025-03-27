import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from 'src/email/email.module';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { LocalAuthStrategy } from './strategies/local-auth.strategy';
import { GoogleAuthStrategy } from './strategies/google-auth.strategy';

@Module({
  imports: [ConfigModule, UserModule, EmailModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalAuthStrategy,
    AccessTokenStrategy,
    GoogleAuthStrategy,
  ],
})
export class AuthModule {}
