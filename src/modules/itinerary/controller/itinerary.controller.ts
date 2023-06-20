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
import { CreateItineraryDto } from '../dto/create-itinerary.dto';
import { ItineraryService } from '../service/itinerary.service';
import { ItineraryDocument } from '../schema/itinerary.schema';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../../user/schema/users.schema';
import { UpdateItineraryDto } from '../dto/update-itinerary.dto';
import { Response } from 'express';

@Controller('itinerary')
@UseGuards(JwtGuard)
export class ItineraryController {
  constructor(private readonly itineraryService: ItineraryService) {}

  @HttpCode(HttpStatus.OK)
  @Post('')
  async createItinerary(
    @Body() body: CreateItineraryDto,
    @CurrentUser() user: UserDocument,
  ): Promise<ItineraryDocument> {
    return await this.itineraryService.createItinerary(body, user);
  }

  @HttpCode(HttpStatus.OK)
  @Get('me')
  async viewPrivateItineraryList(
    @Query('next_cursor') next_cursor: string,
    @CurrentUser() user: UserDocument,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    return await this.itineraryService.viewPrivateItineraryList(
      next_cursor,
      user,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Patch('')
  async updateItinerary(
    @Body() body: UpdateItineraryDto,
    @CurrentUser() user: UserDocument,
  ): Promise<ItineraryDocument> {
    return await this.itineraryService.updateItinerary(body, user);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:itineraryId')
  async deleteItinerary(
    @Param('itineraryId') itineraryId: string,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ): Promise<void> {
    await this.itineraryService.deleteItinerary(itineraryId, user, res);
  }
}
