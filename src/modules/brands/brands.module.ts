import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BrandsService } from "./brands.service";
import { BrandsController } from "./brands.controller";
import { Brand, Image } from "../../entities";

@Module({
  imports: [TypeOrmModule.forFeature([Brand, Image])],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}
