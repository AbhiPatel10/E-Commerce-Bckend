import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartModule } from './modules/cart/cart.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { HealthModule } from './health/health.module';

import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule, UsersModule, ProductsModule, CategoriesModule, CartModule, OrdersModule, PaymentsModule, ReviewsModule, InventoryModule, HealthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
