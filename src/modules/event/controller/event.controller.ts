import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../../user/schema/users.schema';
import { EventDocument } from '../schema/event.schema';
import { EventService } from '../service/event.service';
import { JwtGuard } from "../../auth/guard/jwt.guard";
import { CreateEventDto } from "../dto/create-event.dto";

@Controller('event')
// @UseGuards(JwtGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}
  @HttpCode(HttpStatus.OK)
  @Post('')
  async createLocation(
    @Body() body: CreateEventDto,
    @CurrentUser() user: UserDocument,
  ): Promise<any> {
    return await this.eventService.createEvent(body, user);
  }
}
