import { Module } from '@nestjs/common';
import { UsersController } from './controllers/users/users.controller';
import { RolesController } from './controllers/roles/roles.controller';
import { RolesService } from './services/roles/roles.service';
import { UsersService } from './services/users/users.service';

@Module({
  controllers: [UsersController, RolesController],
  providers: [RolesService, UsersService]
})
export class UsersModule {}
