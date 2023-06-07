import { BadRequestException, Injectable } from '@nestjs/common';
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
    const existingLike = await this.likeLocationRepository.findLike(
      user,
      locationId,
    );
    if (!existingLike) {
      throw new BadRequestException('You did not like this location');
    }

    await this.likeLocationRepository.delete(user, locationId);
  }
}
