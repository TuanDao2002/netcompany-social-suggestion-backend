import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LocationService } from '../service/location.service';
import { CreateLocationDto } from '../dto/create-location.dto';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { LocationDocument } from '../schema/locations.schema';

@Controller('location')
@UseGuards(JwtGuard)
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @Post('')
  async createLocation(
    @Body() body: CreateLocationDto,
  ): Promise<LocationDocument> {
    return await this.locationService.createLocation(body);
  }
}
