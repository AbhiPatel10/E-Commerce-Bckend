import { Module, Global } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import * as entities from "../entities";

const entityList = [
  entities.User,
  entities.Admin,
  entities.Category,
  entities.Brand,
  entities.Image,
  entities.Product,
  entities.Cart,
  entities.CartItem,
  entities.Order,
  entities.OrderItem,
  entities.CustomerDetails,
  entities.Review,
  entities.StripeCustomer,
  entities.Payment,
  entities.Refund,
  entities.StripeEvent,
];

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get<string>("DATABASE_HOST"),
        port: configService.get<number>("DATABASE_PORT"),
        username: configService.get<string>("DATABASE_USER"),
        password: configService.get<string>("DATABASE_PASSWORD"),
        database: configService.get<string>("DATABASE_NAME"),
        entities: entityList,
        synchronize: true, // Set to false in production
        extra: {
          allowPublicKeyRetrieval: true,
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature(entityList),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
