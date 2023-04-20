import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  async validateUserByMicrosoftId(sub: string, profile: any) {
    const user = await this.findOrCreateUser(sub, profile);
    return user;
  }

  private async findOrCreateUser(sub: string, profile: any) {
    // let user = await this.findUserByMicrosoftId(sub);

    // if (!user) {
    //   user = new User();
    //   user.microsoftId = sub;
    //   user.email = profile.emails[0].value;
    //   user.givenName = profile.name.givenName;
    //   user.surname = profile.name.familyName;
    //   // TODO: Save the user object to the database.
    // } else {
    //   user.email = profile.emails[0].value;
    //   user.givenName = profile.name.givenName;
    //   user.surname = profile.name.familyName;
    //   // TODO: Update the user object in the database.
    // }

    // return user;
    return profile;
  }

  private async findUserByMicrosoftId(sub: string){
    // TODO: Retrieve the user object from the database based on the Microsoft ID.
    return sub;
  }
}
