import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LikeLocationRepository } from '../repository/like-location.repository';
import { UserDocument } from '../../user/schema/users.schema';
import { LikeLocation } from '../schema/like-location.schema';

@Injectable()
export class LikeLocationService {
  constructor(
    private readonly likeLocationRepository: LikeLocationRepository,
  ) {}

  public async likeLocation(
    locationId: string,
    user: UserDocument,
  ): Promise<LikeLocation> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingLike = await this.likeLocationRepository.findLike(
      user,
      locationId,
    );
    if (existingLike) {
      throw new BadRequestException('You already liked this location');
    }

    return await this.likeLocationRepository.create(user, locationId);
  }

  public async unlikeLocation(
    locationId: string,
    user: UserDocument,
  ): Promise<void> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const existingLike = await this.likeLocationRepository.findLike(
      user,
      locationId,
    );
    if (!existingLike) {
      throw new BadRequestException('You did not like this location');
    }

    await this.likeLocationRepository.delete(user, locationId);
  }

  public async viewLikedLocation(
    next_cursor: string,
    user: UserDocument,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    return await this.likeLocationRepository.findLikedLocationsByUser(
      { userId: user._id },
      next_cursor,
    );
  }
}
