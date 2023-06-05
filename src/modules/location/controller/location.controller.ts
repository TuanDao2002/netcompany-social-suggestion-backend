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
import { LocationService } from '../service/location.service';
import { CreateLocationDto } from '../dto/create-location.dto';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { LocationDocument } from '../schema/locations.schema';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../../user/schema/users.schema';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { Response } from 'express';
import { FilterLocationDto } from '../dto/filter-location.dto';
import { QueryParamsTransformPipe } from "../../../common/parse-query.pipe";

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
  @Patch('')
  async updateLocation(
    @Body() body: UpdateLocationDto,
    @CurrentUser() user: UserDocument,
  ) {
    return await this.locationService.updateLocation(body, user);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':locationId')
  async deleteLocation(
    @Param('locationId') locationId: string,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ) {
    await this.locationService.deleteLocation(locationId, user);
    res.json({ msg: 'The location is deleted' });
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

  @HttpCode(HttpStatus.OK)
  @Get('latest')
  async viewLatestLocation(
    @Query('next_cursor') next_cursor: string,
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @CurrentUser() user: UserDocument,
  ): Promise<{
    results: any;
    next_cursor: string;
  }> {
    return await this.locationService.viewLatestLocation(
      next_cursor,
      latitude,
      longitude,
      user,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('featured')
  async viewFeaturedLocation(
    @Query('next_cursor') next_cursor: string,
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @CurrentUser() user: UserDocument,
  ): Promise<{
    results: any;
    next_cursor: string;
  }> {
    return await this.locationService.viewFeaturedLocation(
      next_cursor,
      latitude,
      longitude,
      user,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('filter')
  async viewFilteredLocation(
    @Query('next_cursor') next_cursor: string,
    @Query(QueryParamsTransformPipe) queryParams: FilterLocationDto,
    @CurrentUser() user: UserDocument,
  ) {
    return await this.locationService.filterLocation(next_cursor, queryParams, user);
  }
}
