import { Injectable, UnauthorizedException } from '@nestjs/common';
import { NotificationRepository } from '../repository/notification.repository';
import { UserDocument } from '../../user/schema/users.schema';
import mongoose from 'mongoose';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
  ) {}

  public async getNotifications(
    user: UserDocument,
    next_cursor: string,
  ): Promise<{
    results: any[];
    next_cursor: string;
  }> {
    if (!user) {
      throw new UnauthorizedException('You have not signed in yet');
    }

    const queryObject = { targetUserId: new mongoose.Types.ObjectId(user._id) };
    return await this.notificationRepository.getNotifications(
      queryObject,
      next_cursor,
    );
  }
}
