import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { OIDCStrategy } from 'passport-azure-ad';
import { ConfigService } from '@nestjs/config';
import { AuthService } from "../service/auth.service";

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(OIDCStrategy, 'azure-ad') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.get('AZURE_AD_CLIENT_ID'),
      clientSecret: configService.get('AZURE_AD_CLIENT_SECRET'),
      redirectUrl: `${configService.get('APP_BASE_URL')}`,
      identityMetadata: `https://login.microsoftonline.com/${configService.get('AZURE_AD_TENANT_ID')}/.well-known/openid-configuration`,
      responseType: 'code id_token',
      responseMode: 'form_post',
      scope: ['openid', 'profile', 'email'],
      allowHttpForRedirectUrl: true
    });
  }

  async validate(iss: string, sub: string, profile: any) {
    const user = await this.authService.validateUserByMicrosoftId(sub, profile);
    return user;
  }
}
