import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserService } from '../service/user.service';
import { CurrentUser } from '../../auth/guard/user.decorator';
import { UserDocument } from '../schema/users.schema';
import { JwtGuard } from '../../auth/guard/jwt.guard';
import { UpdateUserDto } from '../dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @Get('/:id')
  async getDetailUser(
    @Param('id') id: string,
    @CurrentUser() user: UserDocument,
  ): Promise<Partial<UserDocument>> {
    return await this.userService.getDetailUser(id, user);
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @Patch('/:id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto,
    @CurrentUser() user: UserDocument,
  ): Promise<UserDocument> {
    return await this.userService.updateUser(id, updateData, user);
  }
}
