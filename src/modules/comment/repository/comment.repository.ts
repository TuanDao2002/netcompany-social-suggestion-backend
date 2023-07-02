import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../schema/comment.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}
}
