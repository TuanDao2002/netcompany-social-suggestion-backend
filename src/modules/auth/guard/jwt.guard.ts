import { AuthGuard } from '@nestjs/passport';

// the name of strategy it uses to guard (the strategy is in "strategy" folder)
// it uses the strategy in provider of auth module
export class JwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}
