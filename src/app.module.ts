import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './modules/products/products.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CartModule } from './modules/cart/cart.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { AdminAuthModule } from './modules/admin/auth/admin-auth.module';

import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { BrandsModule } from './modules/brands/brands.module';
import { ImagesModule } from './modules/images/images.module';
import { StatsModule } from './modules/admin/stats/stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule,
    AdminAuthModule,
    ProductsModule, CategoriesModule, BrandsModule, ImagesModule, CartModule, CheckoutModule, OrdersModule, PaymentsModule, ReviewsModule, InventoryModule, HealthModule, StatsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
