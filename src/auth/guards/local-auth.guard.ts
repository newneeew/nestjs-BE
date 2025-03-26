import { Injectable } from "@nestjs/common";
import { Strategy } from "@nestjs/passport";

@Injectable()
export class LocalAuthGuard extends PassportStrategy(Strategy){
    
}