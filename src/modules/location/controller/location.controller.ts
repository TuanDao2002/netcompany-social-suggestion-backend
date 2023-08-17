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
import { QueryParamsTransformPipe } from '../../../common/parse-query.pipe';
import { LikeLocationService } from '../service/like-location.service';
import { LikeLocation } from '../schema/like-location.schema';
import { LocationSortingType } from '../../../common/location-sortring-type.enum';

@Controller('location')
@UseGuards(JwtGuard)
export class LocationController {
  constructor(
    private readonly locationService: LocationService,
    private readonly likeLocationService: LikeLocationService,
  ) {}

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
    @Res() res: Response,
  ) {
    await this.locationService.updateLocation(body, user, res);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(':locationId')
  async deleteLocation(
    @Param('locationId') locationId: string,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ) {
    await this.locationService.deleteLocation(locationId, user, res);
  }

  @HttpCode(HttpStatus.OK)
  @Get('created/me')
  async viewCreatedLocation(
    @Query('next_cursor') next_cursor: string,
    @CurrentUser() user: UserDocument,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    return await this.locationService.viewCreatedLocation(next_cursor, user);
  }

  @HttpCode(HttpStatus.OK)
  @Get('filter/:sortType')
  async viewFilteredLocation(
    @Param('sortType') sortType: LocationSortingType,
    @Query('next_cursor') next_cursor: string,
    @Query(QueryParamsTransformPipe) queryParams: FilterLocationDto,
    @CurrentUser() user: UserDocument,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    return await this.locationService.filterLocation(
      sortType,
      next_cursor,
      queryParams,
      user,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('search/:input')
  async searchLocationByInput(
    @Query('next_cursor') next_cursor: string,
    @Param('input') input: string,
    @CurrentUser() user: UserDocument,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    return await this.locationService.searchLocationByInput(
      input,
      next_cursor,
      user,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Get('detail/:id')
  async viewDetailLocation(
    @Param('id') locationId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<any> {
    return await this.locationService.viewDetailLocation(locationId, user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('like/:id')
  async likeLocation(
    @Param('id') locationId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<LikeLocation> {
    return await this.likeLocationService.likeLocation(locationId, user);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('like/:id')
  async unlikeLocation(
    @Param('id') locationId: string,
    @CurrentUser() user: UserDocument,
    @Res() res: Response,
  ): Promise<void> {
    await this.likeLocationService.unlikeLocation(locationId, user);
    res.json({ msg: 'You unliked this location' });
  }

  @HttpCode(HttpStatus.OK)
  @Get('liked/me')
  async viewLikedLocations(
    @Query('next_cursor') next_cursor: string,
    @CurrentUser() user: UserDocument,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    return await this.likeLocationService.viewLocationsLikedByUser(
      next_cursor,
      user,
    );
  }
}
