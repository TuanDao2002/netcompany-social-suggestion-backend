import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateItineraryDto } from '../dto/create-itinerary.dto';
import { ItineraryRepository } from '../repository/itinerary.repository';
import { ItineraryDocument } from '../schema/itinerary.schema';
import { UserDocument } from '../../user/schema/users.schema';
import { UpdateItineraryDto } from '../dto/update-itinerary.dto';
import { Response } from 'express';
import { ItineraryLocationRepository } from '../repository/itinerary-location.repository';
import { UpdateItineraryLocationOrderDto } from '../dto/update-itinerary-location-order.dto';

@Injectable()
export class ItineraryService {
  constructor(
    private readonly itineraryRepository: ItineraryRepository,
    private readonly itineraryLocationRepository: ItineraryLocationRepository,
  ) {}

  public async createItinerary(
    itineraryData: CreateItineraryDto,
    user: UserDocument,
  ): Promise<ItineraryDocument> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    return await this.itineraryRepository.createItinerary(itineraryData, user);
  }

  public async viewPrivateItineraryList(
    next_cursor: string,
    user: UserDocument,
  ) {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    let response = await this.itineraryRepository.getItineraryList(
      next_cursor,
      {
        userId: user._id,
      },
    );

    response.results.map((result) => {
      if (Object.keys(result.savedLocations[0]).length === 0) {
        result.numOfLocations = 0;
      } else {
        result.numOfLocations = result.savedLocations.length;
      }
      delete result.savedLocations;
    });

    return response;
  }

  public async updateItinerary(
    updateItineraryData: UpdateItineraryDto | UpdateItineraryLocationOrderDto,
    user: UserDocument,
  ): Promise<ItineraryDocument> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const { itineraryId } = updateItineraryData;
    const existingItinerary = await this.itineraryRepository.findItineraryById(
      itineraryId,
    );
    if (!existingItinerary) {
      throw new NotFoundException('This itinerary does not exist');
    }

    if (!this.isOwner(user, existingItinerary)) {
      throw new UnauthorizedException('Not allowed to edit this itinerary');
    }

    return await this.itineraryRepository.updateItinerary(updateItineraryData);
  }

  public async updateLocationOrderInItinerary(
    updateItineraryLocationOrderDto: UpdateItineraryLocationOrderDto,
    user: UserDocument,
  ): Promise<ItineraryDocument> {
    return await this.updateItinerary(updateItineraryLocationOrderDto, user);
  }

  public async deleteItinerary(
    itineraryId: string,
    user: UserDocument,
    res: Response,
  ) {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingItinerary = await this.itineraryRepository.findItineraryById(
      itineraryId,
    );
    if (!existingItinerary) {
      throw new NotFoundException('This itinerary does not exist');
    }
    if (!this.isOwner(user, existingItinerary)) {
      throw new UnauthorizedException('Not allowed to delete this itinerary');
    }

    await this.itineraryRepository.deleteItinerary(itineraryId);
    res.json({ msg: 'The itinerary is deleted' });

    await this.itineraryLocationRepository.deleteLocationsInItinerary(
      itineraryId,
    );
  }

  public async viewSavedLocationInItinerary(
    itineraryId: string,
    user: UserDocument,
  ): Promise<ItineraryDocument> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    let findItinerary =
      await this.itineraryRepository.getSavedLocationsInItinerary(itineraryId);

    if (findItinerary.length === 0) {
      throw new NotFoundException('This itinerary does not exist');
    }

    if (!this.isOwner(user, findItinerary[0])) {
      throw new UnauthorizedException(
        'Now allowed to view saved locations in this itinerary',
      );
    }

    /* 
    fix this case:  "savedLocations": [
      {}
    ]
    */
    if (Object.keys(findItinerary[0].savedLocations[0]).length === 0) {
      findItinerary[0].savedLocations = [];
    }

    return findItinerary[0];
  }

  public isOwner(
    user: UserDocument,
    existingItinerary: ItineraryDocument,
  ): boolean {
    return String(user._id) === String(existingItinerary.userId);
  }
}
