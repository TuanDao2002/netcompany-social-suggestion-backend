import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import { CommonConstant } from '../../../common/constant';
import { UserRepository } from '../../user/repository/user.repository';
import { AccountStatus } from '../../../common/account-status.enum';
import { VerifyUserDto } from '../../user/dto/verify-user.dto';
import { UserDocument } from "../../user/schema/users.schema";

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
  ) {}
  private tenantID = this.configService.get('AZURE_AD_TENANT_ID');
  private clientID = this.configService.get('AZURE_AD_CLIENT_ID');

  public async signInWithMicrosoft(microsoftIdToken: string): Promise<{
    accountStatus: string,
    accessToken: string,
    idToken: string,
    user: UserDocument
  }> {
    if (!microsoftIdToken) {
      throw new UnauthorizedException('Microsoft ID token missing');
    }

    const email = await this.validateAccessTokenMicrosoft(microsoftIdToken);
    if (!email) {
      throw new UnauthorizedException('Microsoft ID token invalid');
    }

    if (!email.match(CommonConstant.NETCOMPANY_EMAIL_REGEX)) {
      // throw new BadRequestException('Invalid Netcompany email'); // for production only
    }

    let accountStatus: string;
    let accessToken: string;
    const findUser = await this.userRepository.findByEmail(email);
    console.log(
      '🚀 ~ file: auth.service.ts:36 ~ AuthService ~ signInWithMicrosoft ~ findUser:',
      findUser,
    );
    if (!findUser) {
      await this.userRepository.create({
        isVerified: false,
        email,
      });
    }

    if (!findUser || !findUser.isVerified) {
      accountStatus = AccountStatus.UNVERIFIED;
      accessToken = '';
    } else {
      accountStatus = AccountStatus.VERIFIED;
      accessToken = await this.signToken(findUser._id.toHexString(), email);
    }

    return { accountStatus, accessToken, idToken: microsoftIdToken, user: findUser };
  }

  async verify(payload: VerifyUserDto): Promise<{
    accountStatus: string,
    accessToken: string,
    verifiedUser: UserDocument
  }> {
    const { idToken } = payload;
    const email = await this.validateAccessTokenMicrosoft(idToken);
    if (!email) {
      throw new UnauthorizedException('Microsoft ID token invalid');
    }

    if (!email.match(CommonConstant.NETCOMPANY_EMAIL_REGEX)) {
      // throw new BadRequestException('Invalid Netcompany email'); // for production only
    }

    const verifiedUser = await this.userRepository.updateByEmail(
      email,
      payload,
    );
    const accessToken = await this.signToken(
      verifiedUser._id.toHexString(),
      email,
    );
    return {
      accountStatus: verifiedUser.isVerified ? AccountStatus.VERIFIED : AccountStatus.UNVERIFIED,
      accessToken,
      verifiedUser,
    };
  }

  async signToken(userId: string, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.configService.get('JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: CommonConstant.TOKEN_EXPIRE_IN,
      secret: secret,
    });

    return token;
  }

  private async validateAccessTokenMicrosoft(
    microsoftIdToken: string,
  ): Promise<string> {
    try {
      const decodedToken = jwt.decode(microsoftIdToken, { complete: true });

      // Verify the signature
      const header = decodedToken.header;
      const signingKey = await this.getSigningKey(header.kid);
      jwt.verify(microsoftIdToken, signingKey);

      // Verify the claims
      const claims = decodedToken.payload as jwt.JwtPayload;
      if (claims.aud !== this.clientID && claims.preferred_username) {
        throw new Error('Invalid claims');
      }

      return claims.preferred_username;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  private async getSigningKey(kid: string): Promise<string> {
    const jwksUri = `https://login.microsoftonline.com/${this.tenantID}/discovery/v2.0/keys`;

    const response = await fetch(jwksUri);
    const jwks = await response.json();

    const signingKey = jwks.keys.find(
      (key) => key.kid === kid && key.kty === 'RSA' && key.use === 'sig',
    );

    if (!signingKey) {
      throw new Error('Signing key not found');
    }

    const publicKey = this.convertCertToPEM(signingKey.x5c[0]);

    return publicKey;
  }

  private convertCertToPEM(cert: string): string {
    const certBody = cert.match(/.{1,64}/g).join('\n');
    const pem = `-----BEGIN CERTIFICATE-----\n${certBody}\n-----END CERTIFICATE-----\n`;

    return pem;
  }
}