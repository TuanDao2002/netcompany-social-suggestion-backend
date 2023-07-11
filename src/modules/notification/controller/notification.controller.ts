import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../../user/schema/users.schema';
import { NotificationService } from '../service/notification.service';

@Controller('notification')
@UseGuards(JwtGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @HttpCode(HttpStatus.OK)
  @Get('me')
  async viewAllNotifications(
    @CurrentUser() user: UserDocument,
    @Query('next_cursor') next_cursor: string,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    return await this.notificationService.getNotifications(user, next_cursor);
  }

  // @HttpCode(HttpStatus.OK)
  // @Get('test/:locationId')
  // async getUserIdsOfRelevantLocation(@Param('locationId') locationId: string) {
  //   return await this.notificationService.notifyAboutLocationChanges(locationId, '64a4f615d58b9c764cef15ec');
  // }
}
