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

@Injectable()
export class ItineraryService {
  constructor(private readonly itineraryRepository: ItineraryRepository) {}

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

    return await this.itineraryRepository.viewPrivateItineraryList(
      next_cursor,
      {
        userId: user._id,
      },
    );
  }

  public async updateItinerary(
    updateItineraryData: UpdateItineraryDto,
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
      throw new UnauthorizedException('Not allowed to edit this location');
    }

    return await this.itineraryRepository.updateItinerary(updateItineraryData);
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
      throw new UnauthorizedException('Not allowed to delete this event');
    }

    await this.itineraryRepository.deleteItinerary(itineraryId);
    res.json({ msg: 'The itinerary is deleted' });
  }

  public isOwner(
    user: UserDocument,
    existingItinerary: ItineraryDocument,
  ): boolean {
    return String(user._id) === String(existingItinerary.userId);
  }
}
