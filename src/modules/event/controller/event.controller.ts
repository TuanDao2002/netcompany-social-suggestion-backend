import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../../user/schema/users.schema';
import { EventDocument } from '../schema/event.schema';
import { EventService } from '../service/event.service';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { CreateEventDto } from '../dto/create-event.dto';
import { EventFilterType } from '../../../common/event-filter-type.enum';
import { UpdateEventDto } from '../dto/update-event.dto';
import { Response } from 'express';

@Controller('event')
@UseGuards(JwtGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @HttpCode(HttpStatus.OK)
  @Post('')
  async createEvent(
    @Body() body: CreateEventDto,
    @CurrentUser() user: UserDocument,
  ): Promise<EventDocument> {
    return await this.eventService.createEvent(body, user);
  }

  @HttpCode(HttpStatus.OK)
  @Get('filter/:filterType')
  async filterEvent(
    @Param('filterType') filterType: EventFilterType,
    @Query('next_cursor') next_cursor: string,
    @CurrentUser() user: UserDocument,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    return await this.eventService.filterEvent(filterType, next_cursor, user);
  }

  @HttpCode(HttpStatus.OK)
  @Get(':eventId')
  async viewDetaildEvent(
    @Param('eventId') eventId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<EventDocument> {
    return await this.eventService.viewDetailEvent(eventId, user);
  }

  @HttpCode(HttpStatus.OK)
  @Patch('')
  async updateEvent(
    @Body() body: UpdateEventDto,
    @CurrentUser() user: UserDocument,
  ): Promise<EventDocument> {
    return await this.eventService.updateEvent(body, user);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':eventId')
  async deleteEvent(
    @Param('eventId') eventId: string,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ): Promise<void> {
    await this.eventService.deleteEvent(eventId, user, res);
  }
}
