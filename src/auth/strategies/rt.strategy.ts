import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable } from '@nestjs/common';

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'rt-secret',
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  validate(req: Request, payload: JwtPayload) {
    const authHeader = req.get('authorization');

    if (!authHeader) {
      throw new Error('Authorization header is not found');
    }

    const refreshToken = authHeader.replace('Bearer', '').trim();
    console.log(refreshToken);
    console.log(payload);

    return {
      ...payload,
      refreshToken,
    };
  }
}
