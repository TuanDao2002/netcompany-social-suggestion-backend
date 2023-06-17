import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UserRepository } from '../repository/user.repository';
import { UserDocument } from '../schema/users.schema';
import { LocationRepository } from '../../location/repository/location.repository';
import { Utils } from '../../../common/utils';

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

  public async searchUserByInput(
    input: string,
    next_cursor: string,
    user: UserDocument,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    let queryObject: any = {};
    const formattedSearchInput = Utils.removeSpace(
      String(input).replace(/[^\p{L}\d\s]/giu, ''),
    );
    if (formattedSearchInput) {
      const regexPattern = `.*${formattedSearchInput.split(' ').join('.*')}.*`;
      let regexQuery = { $regex: `${regexPattern}`, $options: 'i' };
      queryObject.$or = [{ username: regexQuery }, { email: regexQuery }];
    }

    return await this.userRepository.filterUser(queryObject, next_cursor);
  }
}
