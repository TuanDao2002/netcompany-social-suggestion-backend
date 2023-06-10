import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../schema/users.schema';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { LikeLocationService } from '../../location/service/like-location.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly likeLocationService: LikeLocationService,
  ) {}

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
  @Get('like/:locationId')
  async viewUsersWhoLikeLocation(
    @Param('locationId') locationId: string,
    @Query('next_cursor') next_cursor: string,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    return await this.likeLocationService.viewUsersWhoLikedLocation(
      next_cursor,
      locationId,
    );
  }
}
