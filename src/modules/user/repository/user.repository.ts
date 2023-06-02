import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../schema/users.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from '../dto/create-user.dto';
import { VerifyUserDto } from '../dto/verify-user.dto';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  public async findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email }).exec();
  }

  public async findByUsername(username: string): Promise<UserDocument> {
    return this.userModel.findOne({ username, isVerified: true }).exec();
  }

  public async checkVerified(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email, isVerified: true }).exec();
  }

  public async findById(id: string): Promise<UserDocument> {
    return this.userModel.findById(id).exec();
  }

  public async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  public async updateByEmail(
    email: string,
    verifyUserDto: VerifyUserDto,
    isVerified: boolean = true,
  ): Promise<UserDocument> {
    return await this.userModel.findOneAndUpdate(
      { email },
      {
        isVerified,
        ...verifyUserDto,
      },
      { new: true },
    );
  }

  public async updateById(
    id: string,
    updateData: UpdateUserProfileDto,
  ): Promise<UserDocument> {
    return await this.userModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }
}
