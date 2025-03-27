import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @IsEmail()
  @ApiProperty({ example: 'lynn2867@gmail.com' })
  email: string;
}
