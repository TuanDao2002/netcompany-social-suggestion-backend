import { Module } from '@nestjs/common';
import { AuthController } from "./controller/auth.controller";
import { AuthService } from "./service/auth.service";
import { ConfigModule } from '@nestjs/config';
import { MicrosoftStrategy } from "./strategy/microsoft.strategy";

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['./config/.env'],
      isGlobal: true,
    }),
  ],

  controllers: [AuthController],
  providers: [MicrosoftStrategy, AuthService],
})
export class AuthModule {}
