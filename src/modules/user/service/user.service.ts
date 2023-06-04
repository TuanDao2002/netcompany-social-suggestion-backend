import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UserRepository } from '../repository/user.repository';
import { UserDocument } from '../schema/users.schema';
import { Response } from 'express';
import { LocationRepository } from '../../location/repository/location.repository';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly locationRepository: LocationRepository,
  ) {}

  public async getDetailUser(
    id: string,
    user: UserDocument,
  ): Promise<Partial<UserDocument>> {
    const findUser = await this.userRepository.findById(id);
    if (!findUser) {
      throw new BadRequestException('This user does not exist');
    }
    const { username, imageUrl } = findUser;

    if (findUser._id.toHexString() !== user._id.toHexString()) {
      return { username, imageUrl };
    }

    return findUser;
  }

  public async updateUserProfile(
    updateData: UpdateUserProfileDto,
    user: UserDocument,
    res: Response,
  ): Promise<void> {
    if (updateData.username) {
      const duplicateUsername = await this.userRepository.findByUsername(
        updateData.username,
      );
      if (
        duplicateUsername &&
        duplicateUsername._id.toHexString() !== user._id.toHexString()
      ) {
        throw new BadRequestException(
          'The username is duplicated with another account',
        );
      }
    }

    const updatedProfile = await this.userRepository.updateById(
      user._id.toHexString(),
      updateData,
    );
    res.json(updatedProfile);

    await this.locationRepository.updateLocationCreator(updatedProfile);
  }
}
