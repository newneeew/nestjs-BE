import { ApiProperty } from '@nestjs/swagger';
import {IsEmail, IsString} from 'class-validator';

export class VerifyEmailDto{
    @IsEmail()
    @ApiProperty({ example: 'lynn2867@gmail.com'})
    email: string;

    @IsString()
    @ApiProperty({example: '000000'})
    code: string;
}