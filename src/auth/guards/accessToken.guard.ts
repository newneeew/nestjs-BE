import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {}
// Compare this snippet from src/auth/guards/refreshToken.guard.ts:
