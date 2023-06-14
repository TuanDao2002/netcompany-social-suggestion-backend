import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
      throw new NotFoundException('This user does not exist');
    }
    const { username, imageUrl, email } = findUser;

    if (findUser._id.toHexString() !== user._id.toHexString()) {
      return { username, imageUrl, email };
    }

    return findUser;
  }

  public async updateUserProfile(
    updateData: UpdateUserProfileDto,
    user: UserDocument,
  ): Promise<UserDocument> {
    return await this.userRepository.updateById(
      user._id.toHexString(),
      updateData,
    );
  }
}
