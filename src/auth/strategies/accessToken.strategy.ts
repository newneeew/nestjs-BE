import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {PassportStrategy } from '@nestjs/passport';
import { ExtractJwt } from "passport-jwt";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService;
        private readonly userService: UserService;
    ){

    }
}
