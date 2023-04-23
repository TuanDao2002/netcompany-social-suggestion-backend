import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from "./strategy/jwt.strategy";
@Module({
  imports: [ConfigModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
