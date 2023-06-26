import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ItineraryLocationRepository } from '../repository/itinerary-location.repository';
import { CreateItineraryLocationDto } from '../dto/create-itinerary-location.dto';
import { UserDocument } from '../../user/schema/users.schema';
import { ItineraryLocationDocument } from '../schema/itinerary-location.schema';
import { ItineraryRepository } from '../repository/itinerary.repository';
import { LocationRepository } from '../../location/repository/location.repository';
import { CommonConstant } from '../../../common/constant';
import { ItineraryService } from './itinerary.service';
import { UpdateItineraryLocationDto } from '../dto/update-itinerary-location.dto';

@Injectable()
export class ItineraryLocationService {
  constructor(
    private readonly itineraryLocationRepository: ItineraryLocationRepository,
    private readonly itineraryRepository: ItineraryRepository,
    private readonly locationRepository: LocationRepository,
    private readonly itineraryService: ItineraryService,
  ) {}

  public async createItineraryLocation(
    itineraryLocationData: CreateItineraryLocationDto,
    user: UserDocument,
  ): Promise<ItineraryLocationDocument> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const [existingItinerary, existingLocation] = await Promise.all([
      this.itineraryRepository.findItineraryById(
        itineraryLocationData.itineraryId,
      ),

      this.locationRepository.findOneById(itineraryLocationData.locationId),
    ]);

    if (!existingItinerary) {
      throw new NotFoundException('This itinerary does not exist');
    }

    if (!this.itineraryService.isOwner(user, existingItinerary)) {
      throw new UnauthorizedException(
        'Not allowed to save a location to this itinerary',
      );
    }

    if (
      existingItinerary.savedLocations.length + 1 >
      CommonConstant.ITINERARY_LOCATIONS_SIZE_LIMIT
    ) {
      throw new BadRequestException(
        `This itinerary has reached the capacity of ${CommonConstant.ITINERARY_LOCATIONS_SIZE_LIMIT} locations`,
      );
    }

    if (!existingLocation) {
      throw new NotFoundException('This location does not exist');
    }

    const existingItineraryLocation =
      await this.itineraryLocationRepository.findDuplicateItineraryLocation(
        itineraryLocationData.itineraryId,
        itineraryLocationData.locationId,
      );
    if (existingItineraryLocation) {
      throw new BadRequestException(
        'This location is already saved in this itinerary',
      );
    }

    const newItineraryLocation =
      await this.itineraryLocationRepository.createItineraryLocation(
        itineraryLocationData,
      );

    await this.itineraryRepository.addLocationToItinerary(
      String(existingItinerary._id),
      String(newItineraryLocation._id),
    );

    return newItineraryLocation;
  }

  public async updateItineraryLocation(
    updateItineraryLocationData: UpdateItineraryLocationDto,
    user: UserDocument,
  ): Promise<ItineraryLocationDocument> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingItineraryLocation =
      await this.itineraryLocationRepository.findItineraryLocationById(
        updateItineraryLocationData.itineraryLocationId,
      );
    if (!existingItineraryLocation) {
      throw new NotFoundException(
        'This location is not saved in this itinerary',
      );
    }

    const { itineraryId } = existingItineraryLocation;
    const existingItinerary = await this.itineraryRepository.findItineraryById(
      String(itineraryId),
    );
    if (!existingItinerary) {
      throw new NotFoundException('The itinerary no longer exists');
    }

    if (!this.itineraryService.isOwner(user, existingItinerary)) {
      throw new UnauthorizedException(
        'Not allowed to update the location in this itinerary',
      );
    }

    return await this.itineraryLocationRepository.updateItineraryLocation(
      updateItineraryLocationData,
    );
  }
}
