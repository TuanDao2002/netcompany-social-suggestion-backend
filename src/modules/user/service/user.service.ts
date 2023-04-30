import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../repository/user.repository';
import { UserDocument } from '../schema/users.schema';
import mongoose from 'mongoose';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  public async getDetailUser(
    id: string,
    user: UserDocument,
  ): Promise<Partial<UserDocument>> {
    const findUser = await this.userRepository.findById(id);
    const { username, imageUrl } = findUser;

    if (findUser._id.toHexString() !== user._id.toHexString()) {
      return { username, imageUrl };
    }

    return findUser;
  }

  public async updateUser(
    id: string,
    updateData: UpdateUserDto,
    user: UserDocument,
  ): Promise<UserDocument> {
    if (user._id.toHexString() !== id) {
      throw new UnauthorizedException("You are not allow to edit this profile");
    }

    if (updateData.username) {
        const duplicateUsername = await this.userRepository.findByUsername(updateData.username)
        if (duplicateUsername) {
            throw new BadRequestException("The username is duplicated with another account")
        }
    }

    return await this.userRepository.updateById(id, updateData);
  }
}
