import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../../user/schema/users.schema';
import { EventDocument } from '../schema/event.schema';

@Controller()
export class EventController {
  constructor() {}
  @HttpCode(HttpStatus.OK)
  @Post('')
  async createLocation(
    @Body() body: any,
    @CurrentUser() user: UserDocument,
  ): Promise<EventDocument> {
    return;
  }
}
