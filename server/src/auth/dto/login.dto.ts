import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../../entities/user.entity';

export class LoginDto {
  @ApiProperty({ description: '手机号或微信OpenID' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '密码或验证码', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ description: '登录类型：phone或wechat', enum: ['phone', 'wechat'] })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: '微信code', required: false })
  @IsString()
  @IsOptional()
  code?: string;
}