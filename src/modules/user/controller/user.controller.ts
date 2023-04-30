import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../schema/users.schema';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UpdateUserLocationDto } from "../dto/update-user-location.dto";

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @Get('profile/:id')
  async getDetailUser(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<Partial<UserDocument>> {
    return await this.userService.getDetailUser(id, user);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @Patch('/profile/me')
  async updateUserProfile(
    @Body() updateData: UpdateUserProfileDto,
    @CurrentUser() user: UserDocument,
  ): Promise<UserDocument> {
    return await this.userService.updateUserProfile(updateData, user);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @Patch('/location/me')
  async updateUserLocation(
    @Body() updateData: UpdateUserLocationDto,
    @CurrentUser() user: UserDocument,
  ): Promise<UserDocument> {
    return await this.userService.updateUserLocation(updateData, user);
  }
}
