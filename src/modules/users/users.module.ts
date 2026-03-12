import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { CustomerDetails } from "../../entities";

@Module({
  imports: [TypeOrmModule.forFeature([CustomerDetails])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
