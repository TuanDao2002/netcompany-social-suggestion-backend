import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        JwtStrategy.extractJWTFromCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  private static extractJWTFromCookie(req: Request): string | null {
    if (req.cookies && req.cookies.access_token) {
      console.log("🚀 ~ file: jwt.strategy.ts:21 ~ JwtStrategy ~ extractJWTFromCookie ~ cookies:", req.cookies)
      return req.cookies.access_token;
    }
    return null;
  }

  async validate(payload: { sub: number; email: string }) {
    // delete user.hash;
    // attach the user object to request object
    if (payload.sub === 1 && payload.email === 'tuan@gmail.com') {
      const user = payload;
      return user;
    }
  }
}
