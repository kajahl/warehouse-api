import { Inject } from "@nestjs/common";
import { PassportSerializer } from "@nestjs/passport";
import { User } from "src/models/types/User";
import { UsersService } from "src/modules/users/services/users/users.service";

export class SessionSerializer extends PassportSerializer {
  constructor(@Inject() private readonly usersService: UsersService) {
    super();
  }

  serializeUser(user: User, done: (err: Error, user: number) => void): void {
    console.log(`serializeUser ${user.id}`, user)
    done(null, user.id);
  }

  async deserializeUser(userId: number, done: (err: Error, payload: any) => void): Promise<void> {
    console.log('deserializeUser', userId)
    try {
      const user = await this.usersService.findById(userId);
      if(user === null) throw new Error('User not found');
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}