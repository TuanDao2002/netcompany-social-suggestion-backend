import { Injectable } from '@nestjs/common';
import { SigninDto } from "../dto/signin.dto";


@Injectable()
export class AuthService {
  signin(signinDto: SigninDto) {
    return 'Sign in';
  }

  signout() {
    return 'Sign out'
  }
}
