import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { phone, password, name, role } = registerDto;
    // 保证字段名与 User 实体一致
    const existUser = await this.userRepository.findOne({ where: { phone } });
    if (existUser) {
      throw new UnauthorizedException('手机号已注册');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      phone,
      password: hashedPassword,
      name,
      role,
      isActive: true,
    });

    await this.userRepository.save(user);
    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto) {
    const { username, password, type, code } = loginDto;

    let user: User | null = null;

    if (type === 'phone') {
      user = await this.userRepository.findOne({ where: { phone: username } });
      if (!user || !user.password || !(await bcrypt.compare(password || '', user.password || ''))) {
        throw new UnauthorizedException('手机号或密码错误');
      }
    } else if (type === 'wechat') {
      user = await this.userRepository.findOne({ where: { wechatOpenId: username } });
      if (!user) {
        throw new UnauthorizedException('用户不存在');
      }
    }

    if (!user || user.isActive === false) {
      throw new UnauthorizedException('账号已被禁用');
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: User) {
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '30d' }),
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        isActive: user.isActive,
      },
    };
  }

  async validateUser(userId: number): Promise<User | null> {
  return this.userRepository.findOne({ where: { id: userId } });
  }

  async refreshToken(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return this.generateTokens(user);
  }

  async findUserById(id: number): Promise<User | null> {
  return this.userRepository.findOne({ where: { id } });
  }

}
