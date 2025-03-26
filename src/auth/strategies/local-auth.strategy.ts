import { Injectable } from "@nestjs/common";
import { Strategy } from "@nestjs/passport";

@Injectable()
export class LocalAuthStrategy extends PassportStrategy(Strategy){
    
}