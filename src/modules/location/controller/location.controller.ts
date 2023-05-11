import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LocationService } from '../service/location.service';
import { CreateLocationDto } from '../dto/create-location.dto';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { LocationDocument } from '../schema/locations.schema';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../../user/schema/users.schema';

@Controller('location')
@UseGuards(JwtGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @HttpCode(HttpStatus.OK)
  @Post('')
  async createLocation(
    @Body() body: CreateLocationDto,
    @CurrentUser() user: UserDocument,
  ): Promise<LocationDocument> {
    return await this.locationService.createLocation(body, user);
  }

  @HttpCode(HttpStatus.OK)
  @Get('created/me')
  async viewCreatedLocation(
    @Query('next_cursor') next_cursor: string,
    @CurrentUser() user: UserDocument,
  ): Promise<{
    results: any;
    next_cursor: string;
  }> {
    return await this.locationService.viewCreatedLocation(next_cursor, user);
  }
}