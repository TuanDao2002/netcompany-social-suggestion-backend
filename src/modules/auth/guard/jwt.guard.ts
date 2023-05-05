import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CommonConstant } from '../../../common/constant';
import { AuthService } from '../service/auth.service';

// the name of strategy it uses to guard (the strategy is in "strategy" folder)
// it uses the strategy in provider of auth module
@Injectable()
export class JwtGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // check with JwtStrategy first to attach "user" in request
    const isAuthorized = (await super.canActivate(context)) as boolean;
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    // if user has signed in
    if (isAuthorized) {
      const { user } = req;
      // create a new cookie and attach to response
      const accessToken = await this.authService.signToken(
        user._id.toHexString(),
        user.email,
      );
      res.cookie('access_token', accessToken, CommonConstant.COOKIE_OPTIONS);
    }

    return isAuthorized;
  }
}
