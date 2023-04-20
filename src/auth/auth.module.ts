import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AzureADStrategy } from "./strategy/jwt.strategy";
import { ConfigModule } from "@nestjs/config";
import { AuthController } from "./controller/auth.controller";
import { AuthService } from "./service/auth.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['./config/.env'],
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AzureADStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
