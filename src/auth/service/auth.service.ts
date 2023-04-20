import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

@Injectable()
export class AuthService {
  constructor(private readonly configService: ConfigService) {}
  private tenantID = this.configService.get('AZURE_AD_TENANT_ID');
  private clientID = this.configService.get('AZURE_AD_CLIENT_ID')
  async validateAccessToken(accessToken: string): Promise<boolean> {
    try {
      const decodedToken = jwt.decode(accessToken, { complete: true });

      // Verify the signature
      const header = decodedToken.header;
      console.log("🚀 ~ file: auth.service.ts:17 ~ AuthService ~ validateAccessToken ~ header:", header)
      const signingKey = await this.getSigningKey(header.kid);
      jwt.verify(accessToken, signingKey);

      // Verify the claims
      const claims = decodedToken.payload as jwt.JwtPayload;
      console.log("🚀 ~ file: auth.service.ts:23 ~ AuthService ~ validateAccessToken ~ claims:", claims)
      if (
        claims.aud !== this.clientID
      ) {
        throw new Error('Invalid claims');
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  }

  async getSigningKey(kid: string): Promise<string> {
    const jwksUri = `https://login.microsoftonline.com/${this.tenantID}/discovery/v2.0/keys`;

    const response = await fetch(jwksUri);
    const jwks = await response.json();
    console.log(
      '🚀 ~ file: auth.service.ts:41 ~ AuthService ~ getSigningKey ~ jwks:',
      jwks,
    );

    const signingKey = jwks.keys.find(
      (key) => key.kid === kid && key.kty === 'RSA' && key.use === 'sig',
    );
    
    console.log("🚀 ~ file: auth.service.ts:51 ~ AuthService ~ getSigningKey ~ signingKey:", signingKey)
    if (!signingKey) {
      throw new Error('Signing key not found');
    }

    const publicKey = this.convertCertToPEM(signingKey.x5c[0]);

    return publicKey;
  }

  convertCertToPEM(cert: string): string {
    const certBody = cert.match(/.{1,64}/g).join('\n');
    const pem = `-----BEGIN CERTIFICATE-----\n${certBody}\n-----END CERTIFICATE-----\n`;

    return pem;
  }
}
