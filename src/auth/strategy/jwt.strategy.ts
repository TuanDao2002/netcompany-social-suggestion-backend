// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy } from 'passport-jwt';
// import * as jwksRsa from 'jwks-rsa';
// import { ConfigService } from "@nestjs/config";

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private readonly configService: ConfigService) {
//     const CLIENT_ID = configService.get('AZURE_AD_CLIENT_ID')
//     const TENANT_ID = configService.get('AZURE_AD_TENANT_ID');
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       ignoreExpiration: false,
//       secretOrKeyProvider: jwksRsa.passportJwtSecret({
//         cache: true,
//         rateLimit: true,
//         jwksRequestsPerMinute: 5,
//         jwksUri: `https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`,
//       }),
//       audience: CLIENT_ID,
//       issuer: `https://sts.windows.net/${TENANT_ID}/`,
//       algorithms: ['RS256'],
//     });
//   }

//   async validate(payload: any) {
//     return { userId: payload.sub, username: payload.preferred_username };
//   }
// }

import { Injectable } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { PassportStrategy, AuthGuard } from '@nestjs/passport';
import { BearerStrategy } from 'passport-azure-ad';

/**
 * Extracts ID token from header and validates it.
 */
@Injectable()
export class AzureADStrategy extends PassportStrategy(
  BearerStrategy,
  'azure-ad',
) {
  constructor(private readonly configService: ConfigService) {
    const CLIENT_ID = configService.get('AZURE_AD_CLIENT_ID');
    const TENANT_ID = configService.get('AZURE_AD_TENANT_ID');
    super({
      identityMetadata: `https://login.microsoftonline.com/${TENANT_ID}/v2.0/.well-known/openid-configuration`,
      clientID: CLIENT_ID,
    });
  }

  async validate(data) {
    return data;
  }
}

export const AzureADGuard = AuthGuard('azure-ad');
