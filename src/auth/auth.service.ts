import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SigninDto, SignupDto } from './dtos';
// import * as bcrypt from 'bcryptjs';
import { Tokens } from './types';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as argon2 from 'argon2';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async hashData(data: string) {
    return await argon2.hash(data);
  }

  async getTokens(userId: number, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: 'at-secret',
          expiresIn: 60 * 15,
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        {
          secret: 'rt-secret',
          expiresIn: 60 * 60 * 24 * 7,
        },
      ),
    ]);
    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  async signuplocal(dto: SignupDto): Promise<Tokens & { user: User }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (user) {
      throw new ForbiddenException('User already exists');
    }

    const newUser = await this.userService.createUser(dto);

    const tokens = await this.getTokens(newUser.id, newUser.email);

    await this.updateRtHash(newUser.id, tokens.refreshToken);
    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: newUser,
    };
  }
  async signinlocal(dto: SigninDto): Promise<Tokens & { user: User }> {
    console.log(dto);
    let user: User;

    if (dto.email) {
      user = (await this.prisma.user.findUnique({
        where: { email: dto.email },
        include: { settings: true },
      })) as User;
    } else {
      user = (await this.prisma.user.findUnique({
        where: { username: dto.username },
        include: { settings: true },
      })) as User;
    }

    if (!user) {
      throw new ForbiddenException('Access Denied');
    }

    const passwordMatches = await argon2.verify(user.hash, dto.password);

    if (!passwordMatches) {
      throw new ForbiddenException('Access Denied');
    }

    const tokens = await this.getTokens(user.id, user.email);
    console.log(tokens.refreshToken);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  async logout(userId: number) {
    await this.prisma.user.updateMany({
      where: { id: userId, hashedRt: { not: null } },
      data: { hashedRt: null },
    });
  }

  async refreshTokens(
    userId: number,
    rt: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.hashedRt) throw new ForbiddenException('Access Denied');

    const rtMatches = await argon2.verify(user.hashedRt, rt);
    console.log({ providedRt: rt, storedHash: user.hashedRt, rtMatches });

    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user.id, user.email);
    await this.updateRtHash(user.id, tokens.refreshToken);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async updateRtHash(userId: number, rt: string) {
    const hash = await this.hashData(rt);

    await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRt: hash },
    });
  }
}
